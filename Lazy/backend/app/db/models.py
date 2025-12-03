"""
SQLAlchemy Database Models
"""

from sqlalchemy import Column, String, Integer, Float, DateTime, JSON, Enum as SQLEnum
from sqlalchemy.sql import func
from datetime import datetime
import enum

from app.db.database import Base


class TaskPriority(str, enum.Enum):
    """Task priority levels"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class TaskStatus(str, enum.Enum):
    """Task status"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class EnergyCost(str, enum.Enum):
    """Estimated energy cost for completing task"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Task(Base):
    """
    Task model - Core entity for the Lazy app.
    
    This isn't just a checkbox. It's designed for people with executive function challenges.
    Fields like energy_cost and emotional_context help the AI make better suggestions.
    """
    __tablename__ = "tasks"
    
    # Primary key
    id = Column(String, primary_key=True, index=True)
    
    # Core task information
    title = Column(String, nullable=False, index=True)
    description = Column(String, nullable=True)
    original_text = Column(String, nullable=True)  # Original transcript text
    
    # Prioritization (AI-calculated)
    priority = Column(SQLEnum(TaskPriority), nullable=False, default=TaskPriority.MEDIUM, index=True)
    priority_score = Column(Integer, nullable=True)  # 1-10 score from AI
    
    # Energy and emotional context
    estimated_energy_cost = Column(SQLEnum(EnergyCost), nullable=True)  # How draining is this task?
    emotional_context = Column(String, nullable=True)  # e.g., "stressed about", "excited for"
    
    # Task categorization
    category_type = Column(String, nullable=True, index=True)  # "errand", "appointment", "work", "personal"
    location = Column(String, nullable=True)  # For errands/appointments
    location_coordinates = Column(JSON, nullable=True)  # GPS coordinates if available
    
    # Time management
    due_date = Column(DateTime, nullable=True, index=True)
    suggested_time = Column(DateTime, nullable=True)  # AI-suggested time to do it
    estimated_duration_minutes = Column(Integer, nullable=True)
    
    # Status tracking
    status = Column(SQLEnum(TaskStatus), nullable=False, default=TaskStatus.PENDING, index=True)
    completed_at = Column(DateTime, nullable=True)
    
    # User context (for future multi-user support)
    user_id = Column(String, nullable=True, index=True)  # Will be used when we add auth
    
    # Metadata
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<Task(id={self.id}, title={self.title}, priority={self.priority}, status={self.status})>"


class EmotionalStateRecord(Base):
    """
    Store emotional state snapshots for learning patterns
    """
    __tablename__ = "emotional_states"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=True, index=True)
    
    # Emotional metrics
    primary_emotion = Column(String, nullable=False)
    energy_level = Column(Float, nullable=False)  # 0.0 to 1.0
    stress_level = Column(Float, nullable=False)  # 0.0 to 1.0
    confidence = Column(Float, nullable=False)  # 0.0 to 1.0
    
    # Context
    transcript_text = Column(String, nullable=True)  # What they said
    task_count = Column(Integer, nullable=True)  # How many tasks were mentioned
    
    # Timestamp
    recorded_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)

