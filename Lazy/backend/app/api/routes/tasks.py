"""
Task CRUD API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Body
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
    title: Optional[str] = Body(None),
    description: Optional[str] = Body(None),
    priority: Optional[str] = Body(None),
    status: Optional[str] = Body(None),
    reminder_time: Optional[str] = Body(None),  # Accept as ISO string, convert to datetime
    db: AsyncSession = Depends(get_db),
):
    """Update a task with comprehensive error handling"""
    try:
        # Validate task_id format
        if not task_id or not task_id.strip():
            raise HTTPException(status_code=400, detail="Task ID cannot be empty")
        
        task_id = task_id.strip()
        
        # Get existing task
        task = await TaskRepository.get_by_id(db, task_id)
        if not task:
            raise HTTPException(status_code=404, detail=f"Task not found: {task_id}")
        
        # Build update data with validation
        update_data = {}
        
        if title is not None:
            title_trimmed = title.strip() if title else ""
            if not title_trimmed:
                raise HTTPException(status_code=400, detail="Title cannot be empty or only whitespace")
            if len(title_trimmed) > 500:
                raise HTTPException(status_code=400, detail="Title is too long. Maximum 500 characters.")
            update_data["title"] = title_trimmed
        
        if description is not None:
            if description:
                description_trimmed = description.strip()
                if len(description_trimmed) > 2000:
                    raise HTTPException(status_code=400, detail="Description is too long. Maximum 2000 characters.")
                update_data["description"] = description_trimmed
            else:
                update_data["description"] = None
        
        if priority is not None:
            priority_lower = priority.lower().strip()
            valid_priorities = ["critical", "high", "medium", "low"]
            if priority_lower not in valid_priorities:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid priority: '{priority}'. Must be one of: {', '.join(valid_priorities)}"
                )
            try:
                update_data["priority"] = TaskPriority(priority_lower)
            except ValueError as e:
                logger.error(f"Error converting priority '{priority_lower}' to enum: {e}")
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid priority value: {priority}"
                )
        
        if status is not None:
            status_lower = status.lower().strip()
            valid_statuses = ["pending", "in_progress", "completed", "cancelled"]
            if status_lower not in valid_statuses:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid status: '{status}'. Must be one of: {', '.join(valid_statuses)}"
                )
            try:
                update_data["status"] = TaskStatus(status_lower)
            except ValueError as e:
                logger.error(f"Error converting status '{status_lower}' to enum: {e}")
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid status value: {status}"
                )
        
        if reminder_time is not None:
            # Parse ISO string to datetime
            try:
                # Handle ISO format with or without timezone
                if reminder_time.endswith('Z'):
                    reminder_time = reminder_time[:-1] + '+00:00'
                reminder_dt = datetime.fromisoformat(reminder_time)
            except (ValueError, AttributeError) as e:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid reminder_time format. Use ISO 8601 format (e.g., '2024-12-02T15:00:00Z'). Error: {str(e)}"
                )
            
            # Ensure reminder_time is in UTC for database storage
            from datetime import timezone
            if reminder_dt.tzinfo is None:
                # Assume local time, convert to UTC
                reminder_dt = reminder_dt.replace(tzinfo=timezone.utc)
            elif reminder_dt.tzinfo != timezone.utc:
                reminder_dt = reminder_dt.astimezone(timezone.utc)
            update_data["reminder_time"] = reminder_dt
        
        # Check if there are any fields to update
        if not update_data:
            raise HTTPException(status_code=400, detail="No valid fields provided to update")
        
        # Perform the update
        try:
            updated_task = await TaskRepository.update(db, task_id, **update_data)
            if not updated_task:
                logger.error(f"TaskRepository.update returned None for task_id: {task_id}")
                raise HTTPException(status_code=500, detail="Failed to update task. Update operation returned no result.")
            
            logger.info(f"Successfully updated task {task_id} with fields: {list(update_data.keys())}")
            return _task_to_schema(updated_task)
            
        except Exception as db_error:
            logger.error(f"Database error updating task {task_id}: {str(db_error)}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"Database error while updating task: {str(db_error)}"
            )
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except ValueError as e:
        # Handle value errors (e.g., enum conversion)
        logger.error(f"Value error updating task {task_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=400,
            detail=f"Invalid input value: {str(e)}"
        )
    except Exception as e:
        # Catch-all for unexpected errors
        logger.error(f"Unexpected error updating task {task_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred while updating task: {str(e)}"
        )


@router.delete("/tasks/{task_id}")
async def delete_task(
    task_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete a task with error handling"""
    try:
        # Validate task_id
        if not task_id or not task_id.strip():
            raise HTTPException(status_code=400, detail="Task ID cannot be empty")
        
        task_id = task_id.strip()
        
        # Check if task exists before attempting deletion
        task = await TaskRepository.get_by_id(db, task_id)
        if not task:
            raise HTTPException(status_code=404, detail=f"Task not found: {task_id}")
        
        # Perform deletion
        success = await TaskRepository.delete(db, task_id)
        if not success:
            logger.error(f"TaskRepository.delete returned False for task_id: {task_id}")
            raise HTTPException(status_code=500, detail="Failed to delete task. Deletion operation failed.")
        
        logger.info(f"Successfully deleted task {task_id}")
        return {"message": "Task deleted successfully", "task_id": task_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting task {task_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting task: {str(e)}"
        )


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
        description=task.description,
        priority=TaskPrioritySchema(task.priority.value),
        category=TaskCategory(
            type=task.category_type or "personal",
            location=task.location,
            estimated_duration_minutes=task.estimated_duration_minutes,
        ),
        original_text=task.original_text or task.title,
        suggested_time=task.suggested_time,
        due_date=task.due_date,
        reminder_time=task.reminder_time,
        status=task.status.value if task.status else "pending",
        location_coordinates=task.location_coordinates,
    )

