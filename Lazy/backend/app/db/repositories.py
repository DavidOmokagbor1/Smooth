"""
Database repository pattern for CRUD operations
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime
import uuid

from app.db.models import Task, TaskStatus, TaskPriority, EmotionalStateRecord


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

