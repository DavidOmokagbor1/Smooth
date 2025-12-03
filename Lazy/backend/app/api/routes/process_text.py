"""
Text Processing Endpoint
Processes text input and returns structured tasks + emotional state
Similar to voice processing but accepts text directly
"""

from fastapi import APIRouter, HTTPException, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
import logging
from typing import Optional
from pydantic import BaseModel, Field

from app.models.schemas import VoiceProcessingResponse
from app.services.ai_service import AIService
from app.services.context_service import ContextService
from app.db.database import get_db
from app.db.repositories import (
    TaskRepository, EmotionalStateRepository,
    ConversationHistoryRepository
)
from app.db.models import TaskPriority, EnergyCost


class TextInputRequest(BaseModel):
    """Request model for text input processing"""
    text: str = Field(..., min_length=1, max_length=5000, description="Text input containing user's tasks and thoughts")

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize AI service
ai_service = AIService()


@router.post("/process-text-input", response_model=VoiceProcessingResponse)
async def process_text_input(
    request: TextInputRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Process text input and return structured tasks with emotional state analysis.
    
    This endpoint:
    1. Analyzes text for emotional state
    2. Extracts and prioritizes tasks using GPT-4o
    3. Generates companion suggestions
    4. Saves tasks to database
    
    This is the text-based alternative to voice input.
    """
    try:
        # Extract text from request
        text = request.text.strip()
        
        # Additional validation (Pydantic handles min/max length, but we check empty after strip)
        if not text:
            raise HTTPException(
                status_code=400,
                detail="Text input cannot be empty or only whitespace."
            )
        
        logger.info(f"Received text input: {len(text)} characters")
        
        # Build context for Siri-like reasoning
        context_service = ContextService()
        context = None
        user_id = None  # TODO: Get from auth when implemented
        session_id = None  # TODO: Get from request headers or generate
        
        if db:
            try:
                context = await context_service.build_context(
                    db=db,
                    user_id=user_id,
                    session_id=session_id,
                    limit_recent=5,
                )
                logger.debug("Built context for text processing")
            except Exception as e:
                logger.warning(f"Failed to build context: {e}", exc_info=True)
                # Continue without context rather than failing
        
        # Process through AI service with context
        response = await ai_service.process_text_input(text, context=context)
        
        # Save conversation history and emotional state
        if db:
            try:
                transcript_text = text[:1000]  # Truncate if too long
                
                # Save emotional state
                await EmotionalStateRepository.create(
                    db=db,
                    primary_emotion=response.emotional_state.primary_emotion,
                    energy_level=response.emotional_state.energy_level,
                    stress_level=response.emotional_state.stress_level,
                    confidence=response.emotional_state.confidence,
                    transcript_text=transcript_text,
                    task_count=len(response.tasks),
                )
                
                # Save conversation history for context
                await ConversationHistoryRepository.create(
                    db=db,
                    user_id=user_id,
                    user_input=transcript_text,
                    ai_response=response.companion_suggestion.message if response.companion_suggestion else None,
                    transcript=transcript_text,
                    emotional_state={
                        "primary_emotion": response.emotional_state.primary_emotion,
                        "energy_level": response.emotional_state.energy_level,
                        "stress_level": response.emotional_state.stress_level,
                    },
                    extracted_tasks=[{"title": t.title, "priority": t.priority.value} for t in response.tasks],
                    session_id=session_id,
                )
                logger.debug("Saved conversation history")
                
                # Learn patterns from this interaction
                await context_service.learn_patterns(
                    db=db,
                    user_id=user_id,
                    transcript=transcript_text,
                    tasks=[{"category_type": t.category.type if t.category else None} for t in response.tasks],
                    emotional_state={
                        "energy_level": response.emotional_state.energy_level,
                        "stress_level": response.emotional_state.stress_level,
                    },
                    time_context=context.get("time_context") if context else None,
                )
                logger.debug("Learned patterns from interaction")
                
            except Exception as e:
                logger.warning(f"Failed to save conversation data: {e}", exc_info=True)
        
        # Save tasks to database
        if db:
            try:
                saved_tasks = []
                for task_schema in response.tasks:
                    # Convert schema task to database task
                    task_data = {
                        "title": task_schema.title,
                        "description": None,
                        "original_text": task_schema.original_text,
                        "priority": TaskPriority(task_schema.priority.value),
                        "category_type": task_schema.category.type if task_schema.category else None,
                        "location": task_schema.category.location if task_schema.category else None,
                        "location_coordinates": task_schema.location_coordinates,
                        "suggested_time": task_schema.suggested_time,
                        "estimated_duration_minutes": task_schema.category.estimated_duration_minutes if task_schema.category else None,
                    }
                    
                    # Map priority to energy cost (heuristic)
                    if task_schema.priority.value in ["critical", "high"]:
                        task_data["estimated_energy_cost"] = EnergyCost.HIGH.value
                    elif task_schema.priority.value == "medium":
                        task_data["estimated_energy_cost"] = EnergyCost.MEDIUM.value
                    else:
                        task_data["estimated_energy_cost"] = EnergyCost.LOW.value
                    
                    task = await TaskRepository.create(db=db, **task_data)
                    saved_tasks.append(task)
                
                logger.info(f"Saved {len(saved_tasks)} tasks to database")
                
            except Exception as e:
                logger.error(f"Failed to save tasks to database: {e}", exc_info=True)
                # Don't fail the request if DB save fails, but log it
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing text input: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error processing text input: {str(e)}"
        )

