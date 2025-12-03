"""
Voice Processing Endpoint
Core endpoint for processing voice input and returning structured tasks + emotional state
"""

from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.models.schemas import VoiceProcessingResponse
from app.services.ai_service import AIService
from app.db.database import get_db
from app.db.repositories import TaskRepository, EmotionalStateRepository
from app.db.models import TaskPriority, EnergyCost

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize AI service
ai_service = AIService()


@router.post("/process-voice-input", response_model=VoiceProcessingResponse)
async def process_voice_input(
    audio_file: UploadFile = File(..., description="Audio file containing user's voice input"),
    db: AsyncSession = Depends(get_db),
):
    """
    Process voice input and return structured tasks with emotional state analysis.
    
    This is the core endpoint that:
    1. Transcribes audio to text
    2. Detects emotional state from voice
    3. Extracts and prioritizes tasks
    4. Generates companion suggestions
    5. Saves tasks to database
    """
    try:
        # Validate audio file
        if not audio_file.content_type or not audio_file.content_type.startswith("audio/"):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Please upload an audio file."
            )
        
        # Read audio file
        audio_data = await audio_file.read()
        logger.info(f"Received audio file: {audio_file.filename}, size: {len(audio_data)} bytes")
        
        # Process through AI service
        response = await ai_service.process_voice_input(audio_data, audio_file.content_type)
        
        # Save emotional state record
        if db:
            try:
                # Truncate transcript if too long for database
                transcript_text = response.transcript[:1000] if len(response.transcript) > 1000 else response.transcript
                
                await EmotionalStateRepository.create(
                    db=db,
                    primary_emotion=response.emotional_state.primary_emotion,
                    energy_level=response.emotional_state.energy_level,
                    stress_level=response.emotional_state.stress_level,
                    confidence=response.emotional_state.confidence,
                    transcript_text=transcript_text,
                    task_count=len(response.tasks),
                )
                logger.debug(f"Saved emotional state record: {response.emotional_state.primary_emotion}")
            except Exception as e:
                logger.warning(f"Failed to save emotional state record: {e}", exc_info=True)
                # Don't fail the request if emotional state save fails
        
        # Save tasks to database
        if db:
            try:
                saved_tasks = []
                for task_schema in response.tasks:
                    # Convert schema task to database task
                    task_data = {
                        "title": task_schema.title,
                        "description": None,  # Could extract from original_text
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
        logger.error(f"Error processing voice input: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error processing voice input: {str(e)}"
        )

