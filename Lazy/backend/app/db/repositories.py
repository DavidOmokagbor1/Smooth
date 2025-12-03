"""
Database repository pattern for CRUD operations
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime
import uuid

from app.db.models import (
    Task, TaskStatus, TaskPriority, EmotionalStateRecord,
    ConversationHistory, UserBehaviorPattern, ProactiveSuggestion
)


class TaskRepository:
    """Repository for Task CRUD operations"""
    
    @staticmethod
    async def create(
        db: AsyncSession,
        title: str,
        priority: TaskPriority = TaskPriority.MEDIUM,
        description: Optional[str] = None,
        original_text: Optional[str] = None,
        category_type: Optional[str] = None,
        location: Optional[str] = None,
        location_coordinates: Optional[dict] = None,
        due_date: Optional[datetime] = None,
        suggested_time: Optional[datetime] = None,
        estimated_duration_minutes: Optional[int] = None,
        estimated_energy_cost: Optional[str] = None,
        priority_score: Optional[int] = None,
        user_id: Optional[str] = None,
    ) -> Task:
        """Create a new task"""
        task_id = f"task_{uuid.uuid4().hex[:12]}"
        
        task = Task(
            id=task_id,
            title=title,
            description=description,
            original_text=original_text,
            priority=priority,
            priority_score=priority_score,
            category_type=category_type,
            location=location,
            location_coordinates=location_coordinates,
            due_date=due_date,
            suggested_time=suggested_time,
            estimated_duration_minutes=estimated_duration_minutes,
            estimated_energy_cost=estimated_energy_cost,
            status=TaskStatus.PENDING,
            user_id=user_id,
        )
        
        db.add(task)
        await db.commit()
        await db.refresh(task)
        return task
    
    @staticmethod
    async def get_by_id(db: AsyncSession, task_id: str) -> Optional[Task]:
        """Get a task by ID"""
        result = await db.execute(select(Task).where(Task.id == task_id))
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_all(
        db: AsyncSession,
        user_id: Optional[str] = None,
        status: Optional[TaskStatus] = None,
        priority: Optional[TaskPriority] = None,
        limit: Optional[int] = None,
    ) -> List[Task]:
        """Get all tasks with optional filters"""
        query = select(Task)
        
        if user_id:
            query = query.where(Task.user_id == user_id)
        if status:
            query = query.where(Task.status == status)
        if priority:
            query = query.where(Task.priority == priority)
        
        query = query.order_by(Task.created_at.desc())
        
        if limit:
            query = query.limit(limit)
        
        result = await db.execute(query)
        return list(result.scalars().all())
    
    @staticmethod
    async def update(
        db: AsyncSession,
        task_id: str,
        **kwargs
    ) -> Optional[Task]:
        """Update a task"""
        task = await TaskRepository.get_by_id(db, task_id)
        if not task:
            return None
        
        # Update only provided fields
        for key, value in kwargs.items():
            if hasattr(task, key) and value is not None:
                setattr(task, key, value)
        
        task.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(task)
        return task
    
    @staticmethod
    async def delete(db: AsyncSession, task_id: str) -> bool:
        """Delete a task"""
        task = await TaskRepository.get_by_id(db, task_id)
        if not task:
            return False
        
        await db.delete(task)
        await db.commit()
        return True
    
    @staticmethod
    async def mark_complete(db: AsyncSession, task_id: str) -> Optional[Task]:
        """Mark a task as completed"""
        return await TaskRepository.update(
            db,
            task_id,
            status=TaskStatus.COMPLETED,
            completed_at=datetime.utcnow()
        )
    
    @staticmethod
    async def create_batch(db: AsyncSession, tasks_data: List[dict]) -> List[Task]:
        """Create multiple tasks at once (for AI processing)"""
        tasks = []
        for task_data in tasks_data:
            task = await TaskRepository.create(db, **task_data)
            tasks.append(task)
        return tasks


class EmotionalStateRepository:
    """Repository for emotional state records"""
    
    @staticmethod
    async def create(
        db: AsyncSession,
        primary_emotion: str,
        energy_level: float,
        stress_level: float,
        confidence: float,
        transcript_text: Optional[str] = None,
        task_count: Optional[int] = None,
        user_id: Optional[str] = None,
    ) -> EmotionalStateRecord:
        """Record an emotional state snapshot"""
        record_id = f"emotion_{uuid.uuid4().hex[:12]}"
        
        record = EmotionalStateRecord(
            id=record_id,
            user_id=user_id,
            primary_emotion=primary_emotion,
            energy_level=energy_level,
            stress_level=stress_level,
            confidence=confidence,
            transcript_text=transcript_text,
            task_count=task_count,
        )
        
        db.add(record)
        await db.commit()
        await db.refresh(record)
        return record


class ConversationHistoryRepository:
    """Repository for conversation history"""
    
    @staticmethod
    async def create(
        db: AsyncSession,
        user_input: str,
        user_id: Optional[str] = None,
        ai_response: Optional[str] = None,
        transcript: Optional[str] = None,
        emotional_state: Optional[dict] = None,
        extracted_tasks: Optional[list] = None,
        session_id: Optional[str] = None,
        reasoning_context: Optional[dict] = None,
        follow_up_needed: Optional[str] = None,
    ) -> ConversationHistory:
        """Create a new conversation history record"""
        record_id = f"conv_{uuid.uuid4().hex[:12]}"
        
        record = ConversationHistory(
            id=record_id,
            user_id=user_id,
            user_input=user_input,
            ai_response=ai_response,
            transcript=transcript,
            emotional_state=emotional_state,
            extracted_tasks=extracted_tasks,
            session_id=session_id or record_id,
            reasoning_context=reasoning_context,
            follow_up_needed=follow_up_needed,
        )
        
        db.add(record)
        await db.commit()
        await db.refresh(record)
        return record
    
    @staticmethod
    async def get_recent(
        db: AsyncSession,
        user_id: Optional[str] = None,
        limit: int = 10,
        session_id: Optional[str] = None,
    ) -> List[ConversationHistory]:
        """Get recent conversation history for context"""
        query = select(ConversationHistory)
        
        if user_id:
            query = query.where(ConversationHistory.user_id == user_id)
        if session_id:
            query = query.where(ConversationHistory.session_id == session_id)
        
        query = query.order_by(ConversationHistory.created_at.desc()).limit(limit)
        
        result = await db.execute(query)
        return list(result.scalars().all())


class UserBehaviorPatternRepository:
    """Repository for user behavior patterns"""
    
    @staticmethod
    async def create_or_update(
        db: AsyncSession,
        pattern_type: str,
        pattern_key: str,
        pattern_value: dict,
        user_id: Optional[str] = None,
        confidence: float = 0.5,
        time_of_day: Optional[str] = None,
        day_of_week: Optional[str] = None,
    ) -> UserBehaviorPattern:
        """Create or update a behavior pattern"""
        # Check if pattern exists
        query = select(UserBehaviorPattern).where(
            UserBehaviorPattern.pattern_type == pattern_type,
            UserBehaviorPattern.pattern_key == pattern_key,
        )
        if user_id:
            query = query.where(UserBehaviorPattern.user_id == user_id)
        
        result = await db.execute(query)
        existing = result.scalar_one_or_none()
        
        if existing:
            # Update existing pattern
            existing.pattern_value = pattern_value
            existing.confidence = min(1.0, existing.confidence + 0.1)  # Increase confidence
            existing.frequency += 1
            existing.last_observed = datetime.utcnow()
            if time_of_day:
                existing.time_of_day = time_of_day
            if day_of_week:
                existing.day_of_week = day_of_week
            await db.commit()
            await db.refresh(existing)
            return existing
        else:
            # Create new pattern
            pattern_id = f"pattern_{uuid.uuid4().hex[:12]}"
            pattern = UserBehaviorPattern(
                id=pattern_id,
                user_id=user_id,
                pattern_type=pattern_type,
                pattern_key=pattern_key,
                pattern_value=pattern_value,
                confidence=confidence,
                frequency=1,
                time_of_day=time_of_day,
                day_of_week=day_of_week,
            )
            db.add(pattern)
            await db.commit()
            await db.refresh(pattern)
            return pattern
    
    @staticmethod
    async def get_patterns(
        db: AsyncSession,
        user_id: Optional[str] = None,
        pattern_type: Optional[str] = None,
        min_confidence: float = 0.3,
    ) -> List[UserBehaviorPattern]:
        """Get behavior patterns matching criteria"""
        query = select(UserBehaviorPattern).where(
            UserBehaviorPattern.confidence >= min_confidence
        )
        
        if user_id:
            query = query.where(UserBehaviorPattern.user_id == user_id)
        if pattern_type:
            query = query.where(UserBehaviorPattern.pattern_type == pattern_type)
        
        query = query.order_by(UserBehaviorPattern.confidence.desc())
        
        result = await db.execute(query)
        return list(result.scalars().all())


class ProactiveSuggestionRepository:
    """Repository for proactive suggestions"""
    
    @staticmethod
    async def create(
        db: AsyncSession,
        suggestion_type: str,
        title: str,
        message: str,
        user_id: Optional[str] = None,
        suggested_action: Optional[str] = None,
        reasoning: Optional[str] = None,
        related_tasks: Optional[list] = None,
        confidence: float = 0.5,
        expires_at: Optional[datetime] = None,
    ) -> ProactiveSuggestion:
        """Create a new proactive suggestion"""
        suggestion_id = f"suggestion_{uuid.uuid4().hex[:12]}"
        
        suggestion = ProactiveSuggestion(
            id=suggestion_id,
            user_id=user_id,
            suggestion_type=suggestion_type,
            title=title,
            message=message,
            suggested_action=suggested_action,
            reasoning=reasoning,
            related_tasks=related_tasks,
            confidence=confidence,
            expires_at=expires_at,
        )
        
        db.add(suggestion)
        await db.commit()
        await db.refresh(suggestion)
        return suggestion
    
    @staticmethod
    async def get_active(
        db: AsyncSession,
        user_id: Optional[str] = None,
        limit: int = 5,
    ) -> List[ProactiveSuggestion]:
        """Get active (unshown, not expired) suggestions"""
        from datetime import datetime
        query = select(ProactiveSuggestion).where(
            ProactiveSuggestion.shown == "false"
        ).where(
            (ProactiveSuggestion.expires_at.is_(None)) |
            (ProactiveSuggestion.expires_at > datetime.utcnow())
        )
        
        if user_id:
            query = query.where(ProactiveSuggestion.user_id == user_id)
        
        query = query.order_by(ProactiveSuggestion.confidence.desc(), ProactiveSuggestion.created_at.desc()).limit(limit)
        
        result = await db.execute(query)
        return list(result.scalars().all())
    
    @staticmethod
    async def mark_shown(
        db: AsyncSession,
        suggestion_id: str,
        action: str = "shown",  # "shown", "dismissed", "acted_on"
    ) -> Optional[ProactiveSuggestion]:
        """Mark a suggestion as shown"""
        query = select(ProactiveSuggestion).where(ProactiveSuggestion.id == suggestion_id)
        result = await db.execute(query)
        suggestion = result.scalar_one_or_none()
        
        if suggestion:
            suggestion.shown = action
            suggestion.shown_at = datetime.utcnow()
            await db.commit()
            await db.refresh(suggestion)
        
        return suggestion

