"""
Proactive Intelligence Service
Anticipates user needs and generates suggestions before they ask
(Siri-like proactive intelligence)
"""

import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.repositories import (
    UserBehaviorPatternRepository,
    ProactiveSuggestionRepository,
    TaskRepository,
)
from app.db.models import TaskStatus, TaskPriority

logger = logging.getLogger(__name__)


class ProactiveService:
    """
    Service for generating proactive suggestions based on learned patterns.
    Like Siri suggesting actions before you ask.
    """
    
    def __init__(self):
        pass
    
    async def generate_proactive_suggestions(
        self,
        db: AsyncSession,
        user_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Generate proactive suggestions based on:
        - Learned behavior patterns
        - Time of day patterns
        - Active tasks
        - Historical patterns
        
        Returns list of suggestion dictionaries.
        
        TIMEZONE HANDLING:
        - Uses datetime.now() for user-facing time context (time of day) - correct
        - Uses datetime.utcnow() for all database timestamp comparisons - correct
        """
        suggestions = []
        
        if not db:
            return suggestions
        
        try:
            # Get behavior patterns
            patterns = await UserBehaviorPatternRepository.get_patterns(
                db=db,
                user_id=user_id,
                min_confidence=0.4,
            )
            
            # Get active tasks
            active_tasks = await TaskRepository.get_all(
                db=db,
                user_id=user_id,
                status=None,
            )
            active_tasks = [
                t for t in active_tasks
                if t.status in [TaskStatus.PENDING, TaskStatus.IN_PROGRESS]
            ]
            
            # Get time context (use local time for user-facing time of day)
            # This is correct because we want to know the user's local time
            now_local = datetime.now()
            hour = now_local.hour
            time_of_day = "night"
            if 5 <= hour < 12:
                time_of_day = "morning"
            elif 12 <= hour < 17:
                time_of_day = "afternoon"
            elif 17 <= hour < 21:
                time_of_day = "evening"
            
            # CRITICAL: For database comparisons, use UTC
            # All database timestamps (due_date, created_at, etc.) are stored in UTC
            now_utc = datetime.utcnow()
            
            # Generate suggestions based on patterns
            
            # 1. Time-based task suggestions
            time_patterns = [p for p in patterns if p.pattern_type == "time_preference"]
            for pattern in time_patterns:
                pattern_value = pattern.pattern_value
                preferred_time = pattern_value.get("time_of_day")
                
                if preferred_time == time_of_day:
                    # User typically does this type of task at this time
                    category = pattern.pattern_key
                    confidence = pattern.confidence
                    
                    # Check if there are already tasks of this category
                    category_tasks = [t for t in active_tasks if t.category_type == category]
                    
                    if not category_tasks and confidence > 0.5:
                        suggestion = {
                            "type": "habit_suggestion",
                            "title": f"Time for {category} tasks?",
                            "message": f"Based on your routine, you typically handle {category} tasks during {time_of_day}. Would you like to add any?",
                            "suggested_action": f"Add {category} task",
                            "reasoning": f"You usually mention {category} tasks around this time (confidence: {confidence:.1f})",
                            "confidence": confidence,
                        }
                        suggestions.append(suggestion)
            
            # 2. Energy-based suggestions
            energy_patterns = [p for p in patterns if p.pattern_type == "energy_pattern"]
            for pattern in energy_patterns:
                if pattern.pattern_key == time_of_day:
                    pattern_value = pattern.pattern_value
                    typical_energy = pattern_value.get("typical_energy", 0.5)
                    
                    # If user typically has high energy now, suggest complex tasks
                    if typical_energy > 0.7 and pattern.confidence > 0.5:
                        complex_tasks = [
                            t for t in active_tasks
                            if t.priority in [TaskPriority.HIGH, TaskPriority.CRITICAL]
                        ]
                        if complex_tasks:
                            suggestion = {
                                "type": "energy_match",
                                "title": "Good time for important tasks",
                                "message": f"You typically have high energy during {time_of_day}. This might be a good time to tackle important tasks.",
                                "suggested_action": f"Focus on: {complex_tasks[0].title[:50]}",
                                "reasoning": f"Your energy pattern shows high energy at this time (confidence: {pattern.confidence:.1f})",
                                "confidence": pattern.confidence,
                            }
                            suggestions.append(suggestion)
            
            # 3. Task reminders (tasks that are due soon or overdue)
            # CRITICAL FIX: Use UTC for database timestamp comparisons
            # task.due_date is stored in UTC, so we must compare with UTC time
            urgent_tasks = [
                t for t in active_tasks
                if t.priority == TaskPriority.CRITICAL
                or (t.due_date and t.due_date < now_utc + timedelta(hours=24))
            ]
            if urgent_tasks:
                task = urgent_tasks[0]
                suggestion = {
                    "type": "task_reminder",
                    "title": "Important task reminder",
                    "message": f"'{task.title}' is {task.priority.value} priority" + 
                              (f" and due soon" if task.due_date else ""),
                    "suggested_action": task.title,
                    "reasoning": "High priority or time-sensitive task",
                    "confidence": 0.9,
                }
                suggestions.append(suggestion)
            
            # 4. Pattern-based batching suggestions
            # If user has multiple tasks of same category, suggest batching
            category_counts = {}
            for task in active_tasks:
                cat = task.category_type or "other"
                category_counts[cat] = category_counts.get(cat, 0) + 1
            
            for category, count in category_counts.items():
                if count >= 3:  # 3+ tasks of same category
                    suggestion = {
                        "type": "time_optimization",
                        "title": f"Batch {category} tasks?",
                        "message": f"You have {count} {category} tasks. Consider doing them together to save time.",
                        "suggested_action": f"Plan {category} tasks",
                        "reasoning": f"Multiple tasks of same category can be batched",
                        "confidence": 0.7,
                    }
                    suggestions.append(suggestion)
                    break  # Only suggest one batching opportunity
            
            # Sort by confidence and limit
            suggestions.sort(key=lambda x: x.get("confidence", 0), reverse=True)
            suggestions = suggestions[:3]  # Top 3 suggestions
            
            # Save suggestions to database
            # CRITICAL FIX: Use UTC for database timestamps
            for sug in suggestions:
                try:
                    expires_at = now_utc + timedelta(hours=24)  # Expire in 24 hours
                    await ProactiveSuggestionRepository.create(
                        db=db,
                        user_id=user_id,
                        suggestion_type=sug["type"],
                        title=sug["title"],
                        message=sug["message"],
                        suggested_action=sug.get("suggested_action"),
                        reasoning=sug.get("reasoning"),
                        confidence=sug.get("confidence", 0.5),
                        expires_at=expires_at,
                    )
                except Exception as e:
                    logger.warning(f"Failed to save proactive suggestion: {e}")
            
            logger.info(f"Generated {len(suggestions)} proactive suggestions")
            
        except Exception as e:
            logger.error(f"Error generating proactive suggestions: {e}", exc_info=True)
        
        return suggestions