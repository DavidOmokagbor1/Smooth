"""
Route Planning API Endpoint
Provides optimized route planning for errands
"""

from fastapi import APIRouter, HTTPException, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
import logging
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

from app.db.database import get_db
from app.db.repositories import TaskRepository
from app.db.models import TaskStatus
from app.services.route_planner import RoutePlanner

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize route planner
route_planner = RoutePlanner()


class RoutePlanRequest(BaseModel):
    """Request model for route planning"""
    task_ids: Optional[List[str]] = Field(None, description="Specific task IDs to include in route")
    category_filter: Optional[str] = Field(None, description="Filter by category (e.g., 'errand')")
    start_location: Optional[Dict[str, float]] = Field(
        None,
        description="Starting location coordinates: {'lat': 37.7749, 'lng': -122.4194}"
    )


@router.post("/plan-route")
async def plan_route(
    request: RoutePlanRequest = Body(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Plan an optimized route for errands.
    
    If task_ids provided, uses those specific tasks.
    Otherwise, finds all pending errands/appointments with locations.
    """
    try:
        # Get tasks from database
        if request.task_ids:
            # Get specific tasks
            tasks_data = []
            for task_id in request.task_ids:
                task = await TaskRepository.get_by_id(db, task_id)
                if task and task.status == TaskStatus.PENDING:
                    tasks_data.append({
                        "id": task.id,
                        "title": task.title,
                        "location": task.location,
                        "location_coordinates": task.location_coordinates,
                        "estimated_duration_minutes": task.estimated_duration_minutes or 15,
                        "priority": task.priority.value,
                        "category_type": task.category_type,
                    })
        else:
            # Get all pending tasks with locations
            all_tasks = await TaskRepository.get_all(
                db=db,
                status=TaskStatus.PENDING,
            )
            
            # Filter to errands/appointments with locations
            tasks_data = []
            for task in all_tasks:
                if (task.location or task.location_coordinates) and \
                   (not request.category_filter or task.category_type == request.category_filter):
                    tasks_data.append({
                        "id": task.id,
                        "title": task.title,
                        "location": task.location,
                        "location_coordinates": task.location_coordinates,
                        "estimated_duration_minutes": task.estimated_duration_minutes or 15,
                        "priority": task.priority.value,
                        "category_type": task.category_type,
                    })
        
        if len(tasks_data) < 2:
            return {
                "optimized": False,
                "route": [],
                "total_distance_km": 0,
                "estimated_time_minutes": 0,
                "task_count": len(tasks_data),
                "message": "Need at least 2 tasks with locations to plan a route",
                "formatted_route": None,
            }
        
        # Extract start location if provided
        start_location = None
        if request.start_location:
            lat = request.start_location.get("lat") or request.start_location.get("latitude")
            lng = request.start_location.get("lng") or request.start_location.get("longitude") or request.start_location.get("lon")
            if lat and lng:
                start_location = (float(lat), float(lng))
        
        # Plan route
        route_result = route_planner.plan_route(tasks_data, start_location)
        
        # Format for response
        return {
            "optimized": route_result.get("optimized", False),
            "route": [
                {
                    "task_id": point["task"]["id"],
                    "title": point["task"]["title"],
                    "location": point["task"]["location"],
                    "coordinates": point["coordinates"],
                    "distance_from_previous_km": point.get("distance_from_previous_km", 0),
                    "estimated_duration_minutes": point["task"]["estimated_duration_minutes"],
                    "priority": point["task"]["priority"],
                }
                for point in route_result.get("route", [])
            ],
            "total_distance_km": route_result.get("total_distance_km", 0),
            "estimated_time_minutes": route_result.get("estimated_time_minutes", 0),
            "task_count": route_result.get("task_count", 0),
            "message": route_result.get("message", "Route planned successfully"),
            "formatted_route": route_planner.format_route_for_display(route_result),
        }
        
    except Exception as e:
        logger.error(f"Error planning route: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error planning route: {str(e)}"
        )

