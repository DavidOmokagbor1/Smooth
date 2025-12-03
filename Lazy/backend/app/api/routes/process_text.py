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
from app.db.database import get_db
from app.db.repositories import TaskRepository, EmotionalStateRepository
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
        
        # Process through AI service (using text directly, no transcription needed)
        response = await ai_service.process_text_input(text)
        
        # Save emotional state record
        if db:
            try:
                await EmotionalStateRepository.create(
                    db=db,
                    primary_emotion=response.emotional_state.primary_emotion,
                    energy_level=response.emotional_state.energy_level,
                    stress_level=response.emotional_state.stress_level,
                    confidence=response.emotional_state.confidence,
                    transcript_text=text[:1000],  # Use input text as transcript (truncate if too long)
                    task_count=len(response.tasks),
                )
            except Exception as e:
                logger.warning(f"Failed to save emotional state record: {e}")
        
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

