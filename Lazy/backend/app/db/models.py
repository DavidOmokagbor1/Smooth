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


class ConversationHistory(Base):
    """
    Store conversation history for context-aware reasoning
    Enables multi-turn conversations and context understanding
    """
    __tablename__ = "conversation_history"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=True, index=True)
    
    # Conversation content
    user_input = Column(String, nullable=False)  # What the user said
    ai_response = Column(String, nullable=True)  # AI's response/suggestion
    transcript = Column(String, nullable=True)  # Full transcript if voice
    
    # Context metadata
    emotional_state = Column(JSON, nullable=True)  # Emotional state at time of conversation
    extracted_tasks = Column(JSON, nullable=True)  # Tasks extracted from this conversation
    session_id = Column(String, nullable=True, index=True)  # Group related conversations
    
    # Reasoning metadata
    reasoning_context = Column(JSON, nullable=True)  # AI's reasoning process
    follow_up_needed = Column(String, nullable=True)  # If clarification needed
    
    # Timestamp
    created_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)


class UserBehaviorPattern(Base):
    """
    Learn and store user behavior patterns for proactive intelligence
    Like Siri learning your habits and preferences
    """
    __tablename__ = "user_behavior_patterns"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=True, index=True)
    
    # Pattern type
    pattern_type = Column(String, nullable=False, index=True)  # "time_preference", "task_category", "energy_pattern", "location_pattern", "habit"
    pattern_key = Column(String, nullable=False, index=True)  # e.g., "morning", "work", "grocery_store"
    
    # Pattern data
    pattern_value = Column(JSON, nullable=False)  # The actual pattern data
    confidence = Column(Float, nullable=False, default=0.5)  # How confident we are in this pattern
    frequency = Column(Integer, nullable=False, default=1)  # How often this pattern occurs
    
    # Temporal context
    time_of_day = Column(String, nullable=True)  # "morning", "afternoon", "evening", "night"
    day_of_week = Column(String, nullable=True)  # "monday", "tuesday", etc.
    
    # Metadata
    first_observed = Column(DateTime, server_default=func.now(), nullable=False)
    last_observed = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Examples:
    # pattern_type="time_preference", pattern_key="work_tasks", pattern_value={"preferred_hours": [9, 10, 11], "avoid_hours": [14, 15]}
    # pattern_type="location_pattern", pattern_key="grocery_store", pattern_value={"location": "Whole Foods", "frequency": "weekly", "day": "saturday"}
    # pattern_type="energy_pattern", pattern_key="high_energy_times", pattern_value={"times": ["morning"], "typical_level": 0.8}


class ProactiveSuggestion(Base):
    """
    Store proactive suggestions generated by AI
    Anticipates user needs before they ask
    """
    __tablename__ = "proactive_suggestions"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=True, index=True)
    
    # Suggestion content
    suggestion_type = Column(String, nullable=False)  # "task_reminder", "habit_suggestion", "time_optimization", "energy_match"
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    suggested_action = Column(String, nullable=True)
    
    # Context
    reasoning = Column(String, nullable=True)  # Why this suggestion was made
    related_tasks = Column(JSON, nullable=True)  # Related task IDs
    confidence = Column(Float, nullable=False, default=0.5)
    
    # Status
    shown = Column(String, nullable=False, default="false")  # "true", "false", "dismissed", "acted_on"
    shown_at = Column(DateTime, nullable=True)
    
    # Timestamp
    created_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)
    expires_at = Column(DateTime, nullable=True, index=True)  # When suggestion becomes irrelevant

