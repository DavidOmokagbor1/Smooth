"""
Context Service
Retrieves relevant conversation history and user behavior patterns
for context-aware AI reasoning (Siri-like intelligence)
"""

import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.repositories import (
    ConversationHistoryRepository,
    UserBehaviorPatternRepository,
    TaskRepository,
    EmotionalStateRepository
)
from app.db.models import TaskStatus

logger = logging.getLogger(__name__)


class ContextService:
    """
    Service for retrieving and building context for AI reasoning.
    Enables Siri-like understanding by remembering past conversations
    and learning user patterns.
    """
    
    def __init__(self):
        pass
    
    async def build_context(
        self,
        db: AsyncSession,
        user_id: Optional[str] = None,
        current_input: Optional[str] = None,
        session_id: Optional[str] = None,
        limit_recent: int = 5,
    ) -> Dict[str, Any]:
        """
        Build comprehensive context for AI reasoning.
        
        Returns:
            Dictionary containing:
            - recent_conversations: Recent conversation history
            - behavior_patterns: Learned user patterns
            - active_tasks: Current active tasks
            - emotional_trends: Recent emotional state trends
            - time_context: Current time/day context
        """
        context = {
            "recent_conversations": [],
            "behavior_patterns": [],
            "active_tasks": [],
            "emotional_trends": {},
            "time_context": self._get_time_context(),
        }
        
        try:
            # Get recent conversation history
            if db:
                recent_convos = await ConversationHistoryRepository.get_recent(
                    db=db,
                    user_id=user_id,
                    limit=limit_recent,
                    session_id=session_id,
                )
                context["recent_conversations"] = [
                    {
                        "user_input": conv.user_input,
                        "ai_response": conv.ai_response,
                        "created_at": conv.created_at.isoformat() if conv.created_at else None,
                        "emotional_state": conv.emotional_state,
                        "extracted_tasks": conv.extracted_tasks,
                    }
                    for conv in recent_convos
                ]
            
            # Get behavior patterns
            if db:
                patterns = await UserBehaviorPatternRepository.get_patterns(
                    db=db,
                    user_id=user_id,
                    min_confidence=0.3,
                )
                context["behavior_patterns"] = [
                    {
                        "type": pattern.pattern_type,
                        "key": pattern.pattern_key,
                        "value": pattern.pattern_value,
                        "confidence": pattern.confidence,
                        "frequency": pattern.frequency,
                    }
                    for pattern in patterns
                ]
            
            # Get active tasks (pending/in_progress)
            if db:
                active_tasks = await TaskRepository.get_all(
                    db=db,
                    user_id=user_id,
                    status=None,  # Get all statuses, we'll filter
                )
                # Filter to pending/in_progress
                active_tasks = [
                    task for task in active_tasks
                    if task.status in [TaskStatus.PENDING, TaskStatus.IN_PROGRESS]
                ][:10]  # Limit to 10 most recent
                
                context["active_tasks"] = [
                    {
                        "id": task.id,
                        "title": task.title,
                        "priority": task.priority.value,
                        "category": task.category_type,
                        "due_date": task.due_date.isoformat() if task.due_date else None,
                        "created_at": task.created_at.isoformat() if task.created_at else None,
                    }
                    for task in active_tasks
                ]
            
            # Get emotional trends (last 7 days)
            if db:
                # This would require querying EmotionalStateRecord
                # For now, we'll skip this and add it later if needed
                context["emotional_trends"] = {}
            
            logger.debug(f"Built context: {len(context['recent_conversations'])} conversations, "
                        f"{len(context['behavior_patterns'])} patterns, "
                        f"{len(context['active_tasks'])} active tasks")
            
        except Exception as e:
            logger.warning(f"Error building context: {e}", exc_info=True)
            # Return partial context rather than failing
        
        return context
    
    def _get_time_context(self) -> Dict[str, Any]:
        """Get current time context for temporal reasoning"""
        now = datetime.now()
        hour = now.hour
        
        time_of_day = "night"
        if 5 <= hour < 12:
            time_of_day = "morning"
        elif 12 <= hour < 17:
            time_of_day = "afternoon"
        elif 17 <= hour < 21:
            time_of_day = "evening"
        
        return {
            "current_time": now.isoformat(),
            "time_of_day": time_of_day,
            "day_of_week": now.strftime("%A").lower(),
            "hour": hour,
            "is_weekend": now.weekday() >= 5,
        }
    
    async def learn_patterns(
        self,
        db: AsyncSession,
        user_id: Optional[str] = None,
        transcript: Optional[str] = None,
        tasks: Optional[List[Dict]] = None,
        emotional_state: Optional[Dict] = None,
        time_context: Optional[Dict] = None,
    ):
        """
        Learn behavior patterns from current interaction.
        Called after processing to update user patterns.
        """
        if not db:
            return
        
        try:
            time_ctx = time_context or self._get_time_context()
            
            # Learn time preferences (when user typically does certain tasks)
            if tasks:
                for task in tasks:
                    category = task.get("category_type") or "other"
                    # Learn that user mentions this category at this time
                    await UserBehaviorPatternRepository.create_or_update(
                        db=db,
                        pattern_type="time_preference",
                        pattern_key=category,
                        pattern_value={
                            "time_of_day": time_ctx["time_of_day"],
                            "hour": time_ctx["hour"],
                            "day_of_week": time_ctx["day_of_week"],
                        },
                        user_id=user_id,
                        time_of_day=time_ctx["time_of_day"],
                        day_of_week=time_ctx["day_of_week"],
                        confidence=0.4,  # Start with lower confidence
                    )
            
            # Learn energy patterns (what emotional states correlate with what times)
            if emotional_state:
                energy_level = emotional_state.get("energy_level", 0.5)
                stress_level = emotional_state.get("stress_level", 0.5)
                
                await UserBehaviorPatternRepository.create_or_update(
                    db=db,
                    pattern_type="energy_pattern",
                    pattern_key=time_ctx["time_of_day"],
                    pattern_value={
                        "typical_energy": energy_level,
                        "typical_stress": stress_level,
                        "time_of_day": time_ctx["time_of_day"],
                    },
                    user_id=user_id,
                    time_of_day=time_ctx["time_of_day"],
                    day_of_week=time_ctx["day_of_week"],
                    confidence=0.3,
                )
            
            # Learn task category preferences
            if tasks:
                categories = {}
                for task in tasks:
                    cat = task.get("category_type") or "other"
                    categories[cat] = categories.get(cat, 0) + 1
                
                for category, count in categories.items():
                    await UserBehaviorPatternRepository.create_or_update(
                        db=db,
                        pattern_type="task_category",
                        pattern_key=category,
                        pattern_value={
                            "frequency": count,
                            "preference": "high" if count > 2 else "medium",
                        },
                        user_id=user_id,
                        confidence=0.3,
                    )
            
            logger.debug("Learned patterns from current interaction")
            
        except Exception as e:
            logger.warning(f"Error learning patterns: {e}", exc_info=True)
    
    def format_context_for_ai(self, context: Dict[str, Any]) -> str:
        """
        Format context into a readable string for AI prompts.
        Makes the context easily digestible for GPT-4o.
        """
        parts = []
        
        # Time context
        time_ctx = context.get("time_context", {})
        parts.append(f"TIME CONTEXT: It's {time_ctx.get('time_of_day', 'unknown')} "
                    f"({time_ctx.get('day_of_week', 'unknown')}), "
                    f"hour {time_ctx.get('hour', 'unknown')}.")
        
        # Recent conversations
        recent = context.get("recent_conversations", [])
        if recent:
            parts.append("\nRECENT CONVERSATION HISTORY:")
            for i, conv in enumerate(recent[:3], 1):  # Last 3 conversations
                parts.append(f"{i}. User: {conv.get('user_input', '')[:200]}")
                if conv.get('ai_response'):
                    parts.append(f"   AI: {conv.get('ai_response', '')[:200]}")
        
        # Behavior patterns
        patterns = context.get("behavior_patterns", [])
        if patterns:
            parts.append("\nLEARNED USER PATTERNS:")
            for pattern in patterns[:5]:  # Top 5 patterns
                ptype = pattern.get("type", "")
                pkey = pattern.get("key", "")
                pvalue = pattern.get("value", {})
                confidence = pattern.get("confidence", 0)
                
                if ptype == "time_preference":
                    parts.append(f"- User typically mentions '{pkey}' tasks during "
                               f"{pvalue.get('time_of_day', 'unknown')} "
                               f"(confidence: {confidence:.1f})")
                elif ptype == "energy_pattern":
                    parts.append(f"- User's typical energy at {pkey}: "
                               f"{pvalue.get('typical_energy', 0.5):.1f} "
                               f"(confidence: {confidence:.1f})")
                elif ptype == "task_category":
                    parts.append(f"- User frequently mentions '{pkey}' tasks "
                               f"(confidence: {confidence:.1f})")
        
        # Active tasks
        active = context.get("active_tasks", [])
        if active:
            parts.append(f"\nCURRENT ACTIVE TASKS ({len(active)}):")
            for task in active[:5]:  # Top 5 active tasks
                priority = task.get("priority", "medium")
                title = task.get("title", "")[:100]
                parts.append(f"- [{priority.upper()}] {title}")
        
        return "\n".join(parts)

