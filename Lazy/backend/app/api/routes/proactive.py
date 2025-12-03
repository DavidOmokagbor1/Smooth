"""
Proactive Suggestions Endpoint
Provides Siri-like proactive intelligence suggestions
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import logging
from typing import List, Optional
from pydantic import BaseModel

from app.db.database import get_db
from app.db.repositories import ProactiveSuggestionRepository
from app.services.proactive_service import ProactiveService

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize proactive service
proactive_service = ProactiveService()


class ProactiveSuggestionResponse(BaseModel):
    """Response model for proactive suggestions"""
    id: str
    suggestion_type: str
    title: str
    message: str
    suggested_action: Optional[str] = None
    reasoning: Optional[str] = None
    confidence: float
    created_at: str


@router.get("/proactive-suggestions", response_model=List[ProactiveSuggestionResponse])
async def get_proactive_suggestions(
    db: AsyncSession = Depends(get_db),
    user_id: Optional[str] = None,  # TODO: Get from auth when implemented
    generate_new: bool = True,
):
    """
    Get proactive suggestions (Siri-like intelligence).
    
    If generate_new=True, will generate new suggestions based on learned patterns.
    Otherwise, returns existing unshown suggestions.
    """
    try:
        suggestions = []
        
        # Generate new suggestions if requested
        if generate_new and db:
            try:
                new_suggestions = await proactive_service.generate_proactive_suggestions(
                    db=db,
                    user_id=user_id,
                )
                logger.info(f"Generated {len(new_suggestions)} proactive suggestions")
            except Exception as e:
                logger.warning(f"Failed to generate proactive suggestions: {e}", exc_info=True)
        
        # Get active suggestions from database
        if db:
            try:
                active_suggestions = await ProactiveSuggestionRepository.get_active(
                    db=db,
                    user_id=user_id,
                    limit=5,
                )
                
                suggestions = [
                    ProactiveSuggestionResponse(
                        id=sug.id,
                        suggestion_type=sug.suggestion_type,
                        title=sug.title,
                        message=sug.message,
                        suggested_action=sug.suggested_action,
                        reasoning=sug.reasoning,
                        confidence=sug.confidence,
                        created_at=sug.created_at.isoformat() if sug.created_at else "",
                    )
                    for sug in active_suggestions
                ]
                
                logger.info(f"Retrieved {len(suggestions)} active proactive suggestions")
            except Exception as e:
                logger.warning(f"Failed to retrieve proactive suggestions: {e}", exc_info=True)
        
        return suggestions
        
    except Exception as e:
        logger.error(f"Error getting proactive suggestions: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error getting proactive suggestions: {str(e)}"
        )


@router.post("/proactive-suggestions/{suggestion_id}/mark-shown")
async def mark_suggestion_shown(
    suggestion_id: str,
    action: str = "shown",  # "shown", "dismissed", "acted_on"
    db: AsyncSession = Depends(get_db),
):
    """
    Mark a proactive suggestion as shown, dismissed, or acted upon.
    """
    try:
        if not db:
            raise HTTPException(status_code=503, detail="Database not available")
        
        suggestion = await ProactiveSuggestionRepository.mark_shown(
            db=db,
            suggestion_id=suggestion_id,
            action=action,
        )
        
        if not suggestion:
            raise HTTPException(status_code=404, detail="Suggestion not found")
        
        return {"success": True, "action": action}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marking suggestion as shown: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error marking suggestion: {str(e)}"
        )

