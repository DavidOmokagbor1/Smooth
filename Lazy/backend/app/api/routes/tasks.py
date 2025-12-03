"""
Task CRUD API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime
import logging

from app.db.database import get_db
from app.db.repositories import TaskRepository
from app.db.models import Task, TaskStatus, TaskPriority
from app.models.schemas import Task as TaskSchema, TaskPriority as TaskPrioritySchema, TaskCategory

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/tasks", response_model=TaskSchema)
async def create_task(
    title: str,
    description: Optional[str] = None,
    priority: TaskPrioritySchema = TaskPrioritySchema.MEDIUM,
    category_type: Optional[str] = None,
    location: Optional[str] = None,
    due_date: Optional[datetime] = None,
    estimated_duration_minutes: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
):
    """Create a new task"""
    try:
        task = await TaskRepository.create(
            db=db,
            title=title,
            description=description,
            priority=TaskPriority(priority.value),
            category_type=category_type,
            location=location,
            due_date=due_date,
            estimated_duration_minutes=estimated_duration_minutes,
        )
        
        # Convert to response schema
        return _task_to_schema(task)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating task: {str(e)}")


@router.get("/tasks", response_model=List[TaskSchema])
async def get_tasks(
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    limit: Optional[int] = Query(50, description="Maximum number of tasks"),
    db: AsyncSession = Depends(get_db),
):
    """Get all tasks with optional filters"""
    try:
        task_status = TaskStatus(status) if status else None
        task_priority = TaskPriority(priority) if priority else None
        
        tasks = await TaskRepository.get_all(
            db=db,
            status=task_status,
            priority=task_priority,
            limit=limit,
        )
        
        return [_task_to_schema(task) for task in tasks]
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid filter value: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching tasks: {str(e)}")


@router.get("/tasks/{task_id}", response_model=TaskSchema)
async def get_task(
    task_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific task by ID"""
    task = await TaskRepository.get_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return _task_to_schema(task)


@router.patch("/tasks/{task_id}", response_model=TaskSchema)
async def update_task(
    task_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    priority: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Update a task"""
    try:
        task = await TaskRepository.get_by_id(db, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        update_data = {}
        if title is not None:
            if not title.strip():
                raise HTTPException(status_code=400, detail="Title cannot be empty")
            update_data["title"] = title.strip()
        if description is not None:
            update_data["description"] = description.strip() if description else None
        if priority is not None:
            try:
                update_data["priority"] = TaskPriority(priority.lower())
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid priority: {priority}. Must be one of: critical, high, medium, low"
                )
        if status is not None:
            try:
                update_data["status"] = TaskStatus(status.lower())
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid status: {status}. Must be one of: pending, in_progress, completed, cancelled"
                )
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        updated_task = await TaskRepository.update(db, task_id, **update_data)
        if not updated_task:
            raise HTTPException(status_code=500, detail="Failed to update task")
        
        return _task_to_schema(updated_task)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating task {task_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error updating task: {str(e)}"
        )


@router.delete("/tasks/{task_id}")
async def delete_task(
    task_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete a task"""
    success = await TaskRepository.delete(db, task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}


@router.post("/tasks/{task_id}/complete", response_model=TaskSchema)
async def complete_task(
    task_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Mark a task as completed"""
    task = await TaskRepository.mark_complete(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return _task_to_schema(task)


def _task_to_schema(task: Task) -> TaskSchema:
    """Convert database Task model to Pydantic schema"""
    return TaskSchema(
        id=task.id,
        title=task.title,
        priority=TaskPrioritySchema(task.priority.value),
        category=TaskCategory(
            type=task.category_type or "personal",
            location=task.location,
            estimated_duration_minutes=task.estimated_duration_minutes,
        ),
        original_text=task.original_text or task.title,
        suggested_time=task.suggested_time,
        location_coordinates=task.location_coordinates,
    )

