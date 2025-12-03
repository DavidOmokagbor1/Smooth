"""
Pydantic Models for Request/Response Schemas
These define the data contracts between mobile app and backend
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from enum import Enum
from datetime import datetime


# ==================== Emotional State Models ====================

class EmotionalState(BaseModel):
    """Detected emotional state from voice analysis"""
    primary_emotion: str = Field(..., description="Primary detected emotion (e.g., 'stressed', 'tired', 'energetic')")
    energy_level: float = Field(..., ge=0.0, le=1.0, description="Energy level from 0.0 (exhausted) to 1.0 (energetic)")
    stress_level: float = Field(..., ge=0.0, le=1.0, description="Stress level from 0.0 (calm) to 1.0 (highly stressed)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence in emotion detection")
    
    class Config:
        json_schema_extra = {
            "example": {
                "primary_emotion": "stressed",
                "energy_level": 0.3,
                "stress_level": 0.8,
                "confidence": 0.85
            }
        }


# ==================== Task Models ====================

class TaskPriority(str, Enum):
    """Task priority levels"""
    CRITICAL = "critical"  # Do immediately
    HIGH = "high"         # Do today
    MEDIUM = "medium"     # Do this week
    LOW = "low"          # Optional/when possible


class TaskCategory(BaseModel):
    """Task categorization"""
    type: str = Field(..., description="Task type (e.g., 'errand', 'appointment', 'work', 'personal')")
    location: Optional[str] = Field(None, description="Location if applicable")
    estimated_duration_minutes: Optional[int] = Field(None, description="Estimated time to complete")


class Task(BaseModel):
    """Extracted and processed task"""
    id: str = Field(..., description="Unique task identifier")
    title: str = Field(..., description="Task title/description")
    description: Optional[str] = Field(None, description="Task description/details")
    priority: TaskPriority = Field(..., description="Assigned priority based on urgency and user state")
    category: TaskCategory = Field(..., description="Task categorization")
    original_text: str = Field(..., description="Original text from user input")
    suggested_time: Optional[datetime] = Field(None, description="AI-suggested time to complete")
    due_date: Optional[datetime] = Field(None, description="Task due date")
    reminder_time: Optional[datetime] = Field(None, description="Reminder time for the task")
    status: Optional[str] = Field(None, description="Task status (pending, in_progress, completed, cancelled)")
    location_coordinates: Optional[dict] = Field(None, description="GPS coordinates if location-based")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "task_001",
                "title": "Pick up prescription from CVS",
                "priority": "high",
                "category": {
                    "type": "errand",
                    "location": "CVS Pharmacy, 123 Main St",
                    "estimated_duration_minutes": 15
                },
                "original_text": "I need to pick up my prescription",
                "suggested_time": "2024-12-02T15:00:00Z"
            }
        }


class UpdateTaskRequest(BaseModel):
    """Request model for updating a task"""
    title: Optional[str] = Field(None, description="Task title/description", max_length=500)
    description: Optional[str] = Field(None, description="Task description/details", max_length=2000)
    priority: Optional[str] = Field(None, description="Task priority (critical, high, medium, low)")
    status: Optional[str] = Field(None, description="Task status (pending, in_progress, completed, cancelled)")
    reminder_time: Optional[str] = Field(None, description="Reminder time as ISO 8601 datetime string (e.g., '2024-12-02T15:00:00Z')")
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Updated task title",
                "priority": "high",
                "reminder_time": "2024-12-02T15:00:00Z"
            }
        }


# ==================== Companion Response Models ====================

class CompanionSuggestion(BaseModel):
    """AI companion's suggestion for the user"""
    message: str = Field(..., description="Supportive, empathetic message")
    suggested_action: Optional[str] = Field(None, description="Specific action to take")
    reasoning: str = Field(..., description="Why this suggestion (for transparency)")
    tone: Literal["gentle", "supportive", "energetic", "calm"] = Field(..., description="Tone adjusted to user's emotional state")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "I know you're feeling overwhelmed. Let's just focus on the prescription pickup - it's on your way home and will only take 10 minutes.",
                "suggested_action": "Pick up prescription now",
                "reasoning": "User is stressed (0.8) with low energy (0.3). Prioritizing single, quick errand reduces cognitive load.",
                "tone": "gentle"
            }
        }


# ==================== Main Response Model ====================

class VoiceProcessingResponse(BaseModel):
    """Complete response from processing voice input"""
    transcript: str = Field(..., description="Transcribed text from audio")
    emotional_state: EmotionalState = Field(..., description="Detected emotional state")
    tasks: List[Task] = Field(..., description="Extracted and prioritized tasks")
    companion_suggestion: CompanionSuggestion = Field(..., description="AI companion's guidance")
    processing_metadata: dict = Field(default_factory=dict, description="Additional processing info")
    
    class Config:
        json_schema_extra = {
            "example": {
                "transcript": "I need to buy milk, pick up prescriptions, I'm stressed about that email to Bob, and the car is making a weird noise",
                "emotional_state": {
                    "primary_emotion": "stressed",
                    "energy_level": 0.3,
                    "stress_level": 0.8,
                    "confidence": 0.85
                },
                "tasks": [
                    {
                        "id": "task_001",
                        "title": "Pick up prescription from CVS",
                        "priority": "high",
                        "category": {
                            "type": "errand",
                            "location": "CVS Pharmacy",
                            "estimated_duration_minutes": 15
                        },
                        "original_text": "pick up prescriptions"
                    }
                ],
                "companion_suggestion": {
                    "message": "I know you're feeling overwhelmed. Let's just focus on the prescription pickup - it's on your way home.",
                    "tone": "gentle"
                }
            }
        }

