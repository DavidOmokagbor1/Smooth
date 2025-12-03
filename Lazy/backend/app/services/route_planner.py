"""
Route Planning Service
Optimizes errand routes for efficient task completion
Works with or without Google Maps API
"""

import logging
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import math

logger = logging.getLogger(__name__)


class RoutePlanner:
    """
    Service for planning optimized routes for errands.
    Uses distance-based optimization (can be enhanced with Google Maps API later).
    """
    
    def __init__(self):
        pass
    
    def plan_route(
        self,
        tasks: List[Dict[str, Any]],
        start_location: Optional[Tuple[float, float]] = None,
    ) -> Dict[str, Any]:
        """
        Plan an optimized route for errands.
        
        Args:
            tasks: List of tasks with location information
            start_location: Optional (lat, lng) starting point
        
        Returns:
            Dictionary with optimized route, total distance, estimated time
        """
        # Filter tasks that have locations
        location_tasks = [
            task for task in tasks
            if task.get("location") or task.get("location_coordinates")
        ]
        
        if len(location_tasks) < 2:
            return {
                "optimized": False,
                "message": "Need at least 2 tasks with locations to plan a route",
                "tasks": location_tasks,
                "total_distance_km": 0,
                "estimated_time_minutes": 0,
            }
        
        # Extract coordinates or use mock coordinates
        task_points = []
        for task in location_tasks:
            coords = task.get("location_coordinates")
            if coords and isinstance(coords, dict):
                lat = coords.get("lat") or coords.get("latitude")
                lng = coords.get("lng") or coords.get("longitude") or coords.get("lon")
                if lat and lng:
                    task_points.append({
                        "task": task,
                        "coordinates": (float(lat), float(lng)),
                    })
            else:
                # Generate mock coordinates for tasks without GPS data
                # This allows route planning even without coordinates
                task_points.append({
                    "task": task,
                    "coordinates": self._generate_mock_coordinates(task.get("location", "")),
                })
        
        if len(task_points) < 2:
            return {
                "optimized": False,
                "message": "Could not extract location data for route planning",
                "tasks": location_tasks,
            }
        
        # Optimize route using nearest neighbor algorithm
        optimized_route = self._optimize_route(task_points, start_location)
        
        # Calculate total distance and time
        total_distance = self._calculate_total_distance(optimized_route)
        estimated_time = self._estimate_total_time(optimized_route, total_distance)
        
        return {
            "optimized": True,
            "route": optimized_route,
            "total_distance_km": round(total_distance, 2),
            "estimated_time_minutes": estimated_time,
            "task_count": len(optimized_route),
            "message": f"Optimized route for {len(optimized_route)} errands",
        }
    
    def _generate_mock_coordinates(self, location_name: str) -> Tuple[float, float]:
        """
        Generate mock coordinates based on location name hash.
        This allows route planning even without real GPS coordinates.
        """
        # Simple hash-based coordinate generation
        # In production, would use geocoding API
        hash_val = hash(location_name) % 10000
        # Generate coordinates in a reasonable range (example: San Francisco area)
        lat = 37.7749 + (hash_val % 100) / 1000  # ~37.77-37.87
        lng = -122.4194 + ((hash_val // 100) % 100) / 1000  # ~-122.41 to -122.31
        return (lat, lng)
    
    def _optimize_route(
        self,
        task_points: List[Dict[str, Any]],
        start_location: Optional[Tuple[float, float]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Optimize route using nearest neighbor algorithm.
        Simple but effective for errand planning.
        """
        if not task_points:
            return []
        
        # Start from first task or provided start location
        if start_location:
            current_location = start_location
            optimized = []
            remaining = task_points.copy()
        else:
            # Start from first task
            current_location = task_points[0]["coordinates"]
            optimized = [{
                **task_points[0],
                "distance_from_previous_km": 0.0,  # First task has no previous distance
            }]
            remaining = task_points[1:]
        
        # Nearest neighbor algorithm
        while remaining:
            nearest_idx = 0
            nearest_distance = self._haversine_distance(
                current_location,
                remaining[0]["coordinates"]
            )
            
            for i, point in enumerate(remaining[1:], 1):
                distance = self._haversine_distance(
                    current_location,
                    point["coordinates"]
                )
                if distance < nearest_distance:
                    nearest_distance = distance
                    nearest_idx = i
            
            # Add nearest task to route
            next_task = remaining.pop(nearest_idx)
            optimized.append({
                **next_task,
                "distance_from_previous_km": round(nearest_distance, 2),
            })
            current_location = next_task["coordinates"]
        
        return optimized
    
    def _haversine_distance(
        self,
        point1: Tuple[float, float],
        point2: Tuple[float, float]
    ) -> float:
        """
        Calculate distance between two GPS coordinates using Haversine formula.
        Returns distance in kilometers.
        """
        lat1, lon1 = point1
        lat2, lon2 = point2
        
        # Earth radius in kilometers
        R = 6371.0
        
        # Convert to radians
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)
        
        # Haversine formula
        a = math.sin(delta_lat / 2) ** 2 + \
            math.cos(lat1_rad) * math.cos(lat2_rad) * \
            math.sin(delta_lon / 2) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        distance = R * c
        return distance
    
    def _calculate_total_distance(self, route: List[Dict[str, Any]]) -> float:
        """Calculate total distance of the route in kilometers"""
        total = 0.0
        for point in route:
            total += point.get("distance_from_previous_km", 0.0)
        return total
    
    def _estimate_total_time(
        self,
        route: List[Dict[str, Any]],
        total_distance_km: float
    ) -> int:
        """
        Estimate total time for the route.
        Includes travel time + task completion time.
        """
        # Average driving speed: 40 km/h (city driving)
        travel_time_minutes = (total_distance_km / 40) * 60
        
        # Add task completion time
        task_time = sum(
            point["task"].get("estimated_duration_minutes", 15)
            for point in route
        )
        
        # Add buffer for parking, walking, etc.
        buffer_time = len(route) * 5  # 5 min per location
        
        total_time = int(travel_time_minutes + task_time + buffer_time)
        return total_time
    
    def format_route_for_display(self, route_data: Dict[str, Any]) -> str:
        """
        Format route data into a readable string for display.
        """
        if not route_data.get("optimized"):
            return route_data.get("message", "Route planning unavailable")
        
        route = route_data.get("route", [])
        if not route:
            return "No route generated"
        
        lines = [
            f"📍 Optimized Route ({len(route)} stops)",
            f"Total distance: {route_data.get('total_distance_km', 0)} km",
            f"Estimated time: {route_data.get('estimated_time_minutes', 0)} minutes",
            "",
            "Route order:",
        ]
        
        for i, point in enumerate(route, 1):
            task = point["task"]
            distance = point.get("distance_from_previous_km", 0)
            location = task.get("location") or "Location"
            
            if i == 1:
                lines.append(f"{i}. {task.get('title', 'Task')} - {location}")
            else:
                lines.append(f"{i}. {task.get('title', 'Task')} - {location} ({distance} km away)")
        
        return "\n".join(lines)

