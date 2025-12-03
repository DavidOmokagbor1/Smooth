"""
AI Service Layer
Handles all AI processing: transcription, emotion detection, task extraction, etc.
Currently uses mock responses - will be replaced with real AI services incrementally.
"""

import logging
import json
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logger.warning("OpenAI library not installed. GPT-4o features will use mocks.")

from app.models.schemas import (
    VoiceProcessingResponse,
    EmotionalState,
    Task,
    TaskCategory,
    CompanionSuggestion,
    TaskPriority
)
from app.core.config import settings

logger = logging.getLogger(__name__)


class AIService:
    """
    AI Service for processing voice input.
    
    This service will eventually integrate:
    - OpenAI Whisper (speech-to-text)
    - Hume AI or similar (emotion detection)
    - OpenAI GPT-4o (task extraction and prioritization)
    - Google Maps API (routing and location)
    """
    
    def __init__(self):
        """Initialize AI service"""
        # Initialize OpenAI client if API key is available
        self.openai_client = None
        if OPENAI_AVAILABLE and settings.OPENAI_API_KEY:
            try:
                # Initialize OpenAI client with just the API key
                # Remove any proxy-related environment variables that might interfere
                import os
                # Temporarily remove proxy env vars if they exist
                proxy_vars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy', 'ALL_PROXY', 'all_proxy']
                saved_proxies = {}
                for var in proxy_vars:
                    if var in os.environ:
                        saved_proxies[var] = os.environ.pop(var)
                
                try:
                    self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
                    logger.info("✅ OpenAI client initialized successfully")
                finally:
                    # Restore proxy env vars if they were removed
                    for var, value in saved_proxies.items():
                        os.environ[var] = value
            except Exception as e:
                logger.error(f"❌ Failed to initialize OpenAI client: {e}", exc_info=True)
                self.openai_client = None
        else:
            if not OPENAI_AVAILABLE:
                logger.warning("⚠️ OpenAI library not available. Using mock responses.")
            elif not settings.OPENAI_API_KEY:
                logger.warning("⚠️ OPENAI_API_KEY not set. Using mock responses.")
    
    async def process_text_input(
        self,
        text: str,
        context: Optional[Dict[str, Any]] = None
    ) -> VoiceProcessingResponse:
        """
        Process text input directly (alternative to voice).
        Now with Siri-like context awareness!
        
        Args:
            text: Raw text input from user
            context: Optional context from ContextService (conversation history, patterns, etc.)
            
        Returns:
            VoiceProcessingResponse with tasks, emotional state, and suggestions
        """
        logger.info("Processing text input with context-aware reasoning")
        
        # Use text directly as transcript (no transcription needed)
        transcript = text.strip()
        
        # Detect emotional state from text
        emotional_state = await self._detect_emotion(None, transcript)
        
        # Extract and prioritize tasks using GPT-4o with context
        tasks = await self._extract_tasks(transcript, emotional_state, context=context)
        
        # Generate companion suggestion with context
        companion_suggestion = await self._generate_suggestion(emotional_state, tasks, context=context)
        
        # Determine processing mode
        processing_mode = "ai" if self.openai_client else "mock"
        
        return VoiceProcessingResponse(
            transcript=transcript,
            emotional_state=emotional_state,
            tasks=tasks,
            companion_suggestion=companion_suggestion,
            processing_metadata={
                "processing_mode": processing_mode,
                "whisper_enabled": False,  # No audio transcription
                "gpt4o_enabled": bool(self.openai_client),
                "input_type": "text",
                "context_used": context is not None,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    
    async def process_voice_input(
        self,
        audio_data: bytes,
        content_type: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> VoiceProcessingResponse:
        """
        Main processing pipeline for voice input.
        Now with Siri-like context awareness!
        
        Args:
            audio_data: Raw audio file bytes
            content_type: MIME type of audio file
            context: Optional context from ContextService (conversation history, patterns, etc.)
            
        Returns:
            VoiceProcessingResponse with tasks, emotional state, and suggestions
        """
        processing_mode = "ai" if self.openai_client else "mock"
        logger.info(f"Processing voice input ({processing_mode} mode) with context-aware reasoning")
        
        # Step 1 - Transcribe audio using Whisper API
        transcript = await self._transcribe_audio(audio_data, content_type)
        logger.info(f"Transcript: {transcript[:100]}...")
        
        # Step 2 - Detect emotional state (currently keyword-based, will use Hume AI later)
        emotional_state = await self._detect_emotion(audio_data, transcript)
        logger.info(f"Emotional state: {emotional_state.primary_emotion} (stress: {emotional_state.stress_level:.2f}, energy: {emotional_state.energy_level:.2f})")
        
        # Step 3 - Extract and prioritize tasks using GPT-4o with context
        tasks = await self._extract_tasks(transcript, emotional_state, context=context)
        logger.info(f"Extracted {len(tasks)} tasks")
        
        # Step 4 - Generate companion suggestion with context
        companion_suggestion = await self._generate_suggestion(emotional_state, tasks, context=context)
        
        return VoiceProcessingResponse(
            transcript=transcript,
            emotional_state=emotional_state,
            tasks=tasks,
            companion_suggestion=companion_suggestion,
            processing_metadata={
                "processing_mode": processing_mode,
                "whisper_enabled": bool(self.openai_client),
                "gpt4o_enabled": bool(self.openai_client),
                "context_used": context is not None,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    
    async def _transcribe_audio(
        self,
        audio_data: bytes,
        content_type: Optional[str]
    ) -> str:
        """
        Transcribe audio to text using OpenAI Whisper API.
        Falls back to mock if OpenAI is not available.
        """
        # Use Whisper API if available
        if self.openai_client:
            try:
                return await self._transcribe_with_whisper(audio_data, content_type)
            except Exception as e:
                logger.error(f"Error transcribing with Whisper: {e}. Falling back to mock.")
                # Fall through to mock
        
        # Fallback to mock
        return await self._transcribe_mock()
    
    async def _transcribe_with_whisper(
        self,
        audio_data: bytes,
        content_type: Optional[str]
    ) -> str:
        """Transcribe audio using OpenAI Whisper API"""
        import io
        import tempfile
        import os
        
        # Determine file format from content type or default to mp3
        file_extension = "mp3"
        if content_type:
            if "wav" in content_type.lower():
                file_extension = "wav"
            elif "m4a" in content_type.lower():
                file_extension = "m4a"
            elif "webm" in content_type.lower():
                file_extension = "webm"
        
        # Create a temporary file for the audio
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_extension}") as temp_file:
            temp_file.write(audio_data)
            temp_file_path = temp_file.name
        
        try:
            # Call Whisper API
            with open(temp_file_path, "rb") as audio_file:
                transcript = self.openai_client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="text"
                )
            
            # Clean up temp file
            os.unlink(temp_file_path)
            
            logger.info(f"Successfully transcribed audio using Whisper")
            return transcript.strip()
            
        except Exception as e:
            # Clean up temp file on error
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
            raise
    
    async def _transcribe_mock(self) -> str:
        """Mock transcription (fallback)"""
        import asyncio
        await asyncio.sleep(0.5)
        
        mock_transcripts = [
            "I need to buy milk, pick up prescriptions, I'm stressed about that email to Bob, and the car is making a weird noise",
            "I have a doctor's appointment tomorrow at 2pm, need to call the plumber about the leak, and I should probably meal prep for the week",
            "The deadline for the project is Friday, I need to schedule a meeting with Sarah, and I'm worried about the presentation next week"
        ]
        
        return mock_transcripts[0]
    
    async def _detect_emotion(
        self,
        audio_data: bytes,
        transcript: str
    ) -> EmotionalState:
        """
        Intelligently detect emotional state from transcript using advanced keyword analysis.
        TODO: Integrate Hume AI or similar emotion detection API for voice analysis.
        """
        transcript_lower = transcript.lower()
        
        # Advanced keyword-based emotion detection with intensity scoring
        stress_keywords = {
            "overwhelmed": 0.9, "stressed": 0.8, "anxious": 0.85, "worried": 0.75,
            "panicked": 0.95, "freaking out": 0.9, "can't handle": 0.85, "too much": 0.8,
            "deadline": 0.7, "urgent": 0.65, "behind": 0.7, "late": 0.65
        }
        
        energy_keywords = {
            "tired": -0.4, "exhausted": -0.5, "drained": -0.45, "worn out": -0.4,
            "energetic": 0.3, "ready": 0.2, "motivated": 0.25, "excited": 0.3,
            "can't focus": -0.3, "brain fog": -0.35, "sluggish": -0.3
        }
        
        # Calculate stress level
        stress_score = 0.3  # Base neutral
        stress_count = 0
        for keyword, weight in stress_keywords.items():
            if keyword in transcript_lower:
                stress_score = max(stress_score, weight)
                stress_count += 1
        
        # Multiple stress indicators increase stress level
        if stress_count > 1:
            stress_score = min(0.95, stress_score + (stress_count - 1) * 0.1)
        
        # Calculate energy level
        energy_score = 0.6  # Base moderate
        energy_modifiers = []
        for keyword, modifier in energy_keywords.items():
            if keyword in transcript_lower:
                energy_modifiers.append(modifier)
        
        if energy_modifiers:
            # Average energy modifiers
            energy_adjustment = sum(energy_modifiers) / len(energy_modifiers)
            energy_score = max(0.1, min(1.0, energy_score + energy_adjustment))
        
        # Determine primary emotion
        if stress_score > 0.75:
            primary_emotion = "stressed"
        elif stress_score > 0.5:
            primary_emotion = "anxious"
        elif energy_score < 0.3:
            primary_emotion = "tired"
        elif energy_score > 0.7:
            primary_emotion = "energetic"
        else:
            primary_emotion = "neutral"
        
        # Confidence based on keyword matches
        confidence = 0.7
        if stress_count > 0 or len(energy_modifiers) > 0:
            confidence = min(0.95, 0.7 + (stress_count + len(energy_modifiers)) * 0.05)
        
        return EmotionalState(
            primary_emotion=primary_emotion,
            energy_level=round(energy_score, 2),
            stress_level=round(stress_score, 2),
            confidence=round(confidence, 2)
        )
    
    async def _extract_tasks(
        self,
        transcript: str,
        emotional_state: EmotionalState,
        context: Optional[Dict[str, Any]] = None
    ) -> list[Task]:
        """
        Extract and prioritize tasks using GPT-4o with Siri-like context awareness.
        Falls back to mock if OpenAI is not available.
        """
        import uuid
        
        # Use GPT-4o if available
        if self.openai_client:
            try:
                return await self._extract_tasks_with_gpt4o(transcript, emotional_state, context=context)
            except Exception as e:
                logger.error(f"Error calling GPT-4o: {e}. Falling back to mock.")
                # Fall through to mock implementation
        
        # Fallback to mock implementation
        return await self._extract_tasks_mock(transcript, emotional_state)
    
    async def _extract_tasks_with_gpt4o(
        self,
        transcript: str,
        emotional_state: EmotionalState,
        context: Optional[Dict[str, Any]] = None
    ) -> list[Task]:
        """Extract tasks using GPT-4o with structured output and Siri-like context awareness"""
        import uuid
        from app.services.context_service import ContextService
        
        # Build context string if available
        context_str = ""
        if context:
            context_service = ContextService()
            context_str = context_service.format_context_for_ai(context)
        
        system_prompt = """You are an EXPERT AI assistant specializing in executive function support for people with ADHD, autism, burnout, and similar challenges.
You have SIRI-LIKE INTELLIGENCE: You remember past conversations, learn user patterns, and reason contextually.

CRITICAL: You have access to conversation history and learned patterns. Use this context to:
1. Understand references to previous conversations ("that thing I mentioned", "the task from earlier")
2. Recognize patterns in user behavior (when they typically do certain tasks)
3. Avoid duplicating tasks that were already mentioned
4. Connect related tasks across conversations
5. Anticipate needs based on patterns 
Your analysis must be DEEPLY INTELLIGENT, CONTEXT-AWARE, and EMPATHETIC.

CRITICAL: You must think like a highly skilled executive function coach who understands:
- How overwhelm affects decision-making
- The importance of realistic task breakdown
- Energy management and pacing
- The difference between urgent and important
- How emotional state impacts what someone can actually do

ADVANCED PRIORITIZATION FRAMEWORK:

1. **URGENCY vs IMPORTANCE MATRIX** (Think critically):
   - URGENT + IMPORTANT (health emergencies, deadlines today, critical appointments) → CRITICAL
   - NOT URGENT + IMPORTANT (preventive care, important projects) → HIGH
   - URGENT + NOT IMPORTANT (some emails, minor errands) → MEDIUM
   - NOT URGENT + NOT IMPORTANT → LOW

2. **TIME INTELLIGENCE** (Extract and reason about time):
   - Specific times ("3pm", "2:30", "Friday 5pm") → Use for prioritization
   - Relative time ("today", "tomorrow", "this week") → Calculate actual urgency
   - Time of day context:
     * Morning (6am-12pm): Good for complex tasks if energy is high
     * Afternoon (12pm-5pm): Moderate energy, good for medium tasks
     * Evening (5pm-9pm): Lower energy, prefer simple tasks
   - Day of week context:
     * Weekdays: Work tasks higher priority
     * Weekends: Personal tasks more appropriate

3. **EMOTIONAL STATE INTELLIGENCE** (Adapt to user's capacity):
   - STRESSED (stress > 0.7) + LOW ENERGY (< 0.4):
     * Extract MAXIMUM 2-3 tasks only
     * Prioritize ONLY life-critical or deadline-critical items
     * Break EVERY complex task into 2-3 simple steps
     * Estimate durations conservatively (add 50% buffer)
     * Focus on tasks that can be done in < 20 minutes
   
   - MODERATE STATE (stress 0.4-0.7, energy 0.4-0.7):
     * Normal extraction (5-8 tasks)
     * Standard prioritization
     * Break down only truly complex tasks
   
   - HIGH ENERGY (> 0.7) + LOW STRESS (< 0.4):
     * Can extract more tasks (8-12)
     * Suggest batching similar tasks
     * Can handle complex, multi-step tasks
     * More ambitious duration estimates

4. **TASK COMPLEXITY ANALYSIS** (Break down intelligently):
   - SIMPLE (5-15 min): Single action, one location, clear outcome
     * Examples: "Pick up milk", "Call dentist", "Reply to email"
   
   - MODERATE (15-45 min): 2-3 steps, may involve travel or multiple actions
     * Examples: "Grocery shopping", "Doctor appointment", "Write report"
   
   - COMPLEX (45+ min): Multiple steps, requires planning, high cognitive load
     * Examples: "Plan birthday party", "Organize closet", "Complete project"
     * IF user is overwhelmed: BREAK DOWN into 2-4 smaller tasks
     * IF user has energy: Can keep as one task but note complexity

5. **CONTEXT CLUES & INFERENCE** (Read between the lines):
   - Health/Medical mentions → ALWAYS HIGH or CRITICAL priority
   - Financial mentions (bills, payments) → HIGH priority if time-sensitive
   - Relationship mentions (family, friends) → Consider emotional importance
   - Work mentions → Check if deadline exists, prioritize accordingly
   - Location mentions → Extract FULL address if possible, categorize as errand/appointment
   - People names → May indicate social tasks or work collaboration
   - Emotional words ("worried about", "excited for", "dreading") → Factor into priority

6. **SMART CATEGORIZATION** (Be precise):
   - "errand": Physical location required, shopping, picking up, going somewhere
   - "appointment": Scheduled time, meeting someone, time-specific
   - "work": Job-related, professional, career-focused
   - "personal": Self-care, home, hobbies, relationships
   - "health": Medical, wellness, mental health
   - "financial": Bills, payments, money-related
   - "other": Doesn't fit above categories

7. **DURATION ESTIMATION** (Be realistic, not optimistic):
   - Add travel time for errands/appointments (15-30 min each way)
   - Add buffer for unexpected delays (20-30% extra)
   - Consider user's energy level (low energy = slower = add 50% time)
   - Consider task complexity (complex = longer)
   - Examples:
     * "Pick up prescription" → 20-30 min (includes travel)
     * "Doctor appointment" → 60-90 min (appointment + travel + waiting)
     * "Grocery shopping" → 45-60 min (shopping + checkout + travel)
     * "Reply to email" → 10-15 min (thinking + writing + reviewing)

8. **TASK TITLE QUALITY** (Be specific and actionable):
   - GOOD: "Pick up prescription from CVS on Main Street"
   - BAD: "Prescription" or "CVS"
   - GOOD: "Call dentist to schedule cleaning appointment"
   - BAD: "Dentist" or "Appointment"
   - Include WHO, WHAT, WHERE, WHEN if mentioned

9. **PRIORITY REASONING** (Show your thinking):
   - CRITICAL: Life-threatening, legal deadlines, health emergencies, TODAY deadlines
   - HIGH: Important deadlines (this week), health appointments, financial obligations
   - MEDIUM: Important but not urgent, can wait a few days
   - LOW: Nice to have, no deadline, can be done when convenient

RETURN FORMAT:
Return a JSON object with a "tasks" key containing an array. Each task object MUST have:
- title: Clear, specific, actionable description with context (WHO/WHAT/WHERE/WHEN)
- priority: "critical", "high", "medium", or "low" (think carefully about urgency + importance)
- category_type: "errand", "appointment", "work", "personal", "health", "financial", or "other"
- location: Full location if mentioned (e.g., "CVS Pharmacy, 123 Main St" not just "CVS")
- estimated_duration_minutes: REALISTIC estimate including travel, delays, and energy considerations
- original_text: The exact phrase from transcript that led to this task

CRITICAL RULES:
1. If user is overwhelmed (stress > 0.7, energy < 0.4): Extract MAX 3 tasks, break down ALL complex ones
2. Always extract specific times mentioned and use for prioritization
3. Health/medical tasks are ALWAYS at least HIGH priority
4. Be realistic with durations - add buffers for travel, delays, low energy
5. Task titles must be SPECIFIC and ACTIONABLE, not vague
6. Think about what the user can ACTUALLY do given their emotional state"""

        user_prompt = f"""ANALYZE THIS TRANSCRIPT WITH DEEP INTELLIGENCE AND CONTEXT AWARENESS:

{context_str if context_str else "No previous context available - this is a new conversation."}

CURRENT USER INPUT:
"{transcript}"

USER'S CURRENT STATE:
- Primary emotion: {emotional_state.primary_emotion}
- Energy level: {emotional_state.energy_level:.1f}/1.0 (0.0 = completely exhausted, 1.0 = fully energetic)
- Stress level: {emotional_state.stress_level:.1f}/1.0 (0.0 = completely calm, 1.0 = highly stressed/overwhelmed)

CONTEXT-AWARE REASONING:
- If context shows previous conversations, check if user is referring to tasks mentioned earlier
- Use learned patterns to understand when user typically does certain tasks
- Consider active tasks from context - avoid duplicates unless user explicitly mentions them again
- Use time patterns to suggest better timing for tasks

EXAMPLES OF GOOD ANALYSIS:

Example 1 - Overwhelmed User:
Input: "I'm so stressed. I have a doctor appointment tomorrow at 2pm, need to pick up my prescription, and I'm behind on that work project due Friday."
User State: stress=0.8, energy=0.3
Analysis: 
- Doctor appointment (tomorrow 2pm) → HIGH priority (health, scheduled)
- Pick up prescription → HIGH priority (health-related, can batch with appointment)
- Work project (due Friday) → MEDIUM priority (not urgent yet, user overwhelmed)
- Extract only 2-3 tasks, break down work project if complex
Result: Focus on health tasks, defer work project

Example 2 - High Energy User:
Input: "I need to go grocery shopping, call my mom, finish the report, and maybe clean the kitchen."
User State: stress=0.3, energy=0.8
Analysis:
- Grocery shopping → MEDIUM priority (errand, can be done anytime)
- Call mom → MEDIUM priority (personal, not urgent)
- Finish report → HIGH priority (work, likely important)
- Clean kitchen → LOW priority (optional, "maybe")
Result: Prioritize report, can batch errands, include optional tasks

Example 3 - Time-Sensitive:
Input: "I have a meeting at 3pm today, need to submit the invoice by 5pm, and should probably exercise."
User State: stress=0.6, energy=0.5
Analysis:
- Meeting (3pm today) → CRITICAL (time-specific, today)
- Submit invoice (5pm deadline) → CRITICAL (deadline today)
- Exercise → LOW priority (optional, "probably")
Result: Focus on time-critical tasks, exercise can wait

ANALYSIS REQUIRED (Think step by step):

STEP 1: IDENTIFY ALL TASKS
- Extract EVERY task mentioned (explicit and implied)
- Look for action verbs: "need to", "have to", "should", "must", "want to", "gotta"
- Identify tasks even if phrased as thoughts or concerns
- Count total tasks before prioritizing

STEP 2: EXTRACT TIME CONTEXT
- Find ALL time references: specific times, dates, relative times
- Calculate actual urgency based on current date/time
- Note if times conflict or overlap
- Consider time of day mentioned vs. user's energy patterns

STEP 3: ANALYZE URGENCY + IMPORTANCE
- For EACH task, determine:
  * Is it URGENT? (time-sensitive, deadline exists)
  * Is it IMPORTANT? (health, financial, relationships, work-critical)
  * Priority = f(urgency, importance, emotional_state)
- Health/medical = ALWAYS important
- Financial deadlines = Usually important
- Work deadlines = Important if affects job security

STEP 4: ASSESS TASK COMPLEXITY
- For EACH task, determine complexity:
  * Simple: Single action, clear outcome, < 20 min
  * Moderate: 2-3 steps, may need travel, 20-45 min
  * Complex: Multiple steps, planning required, 45+ min
- If user is OVERWHELMED (stress > 0.7, energy < 0.4):
  * Break down ALL complex tasks into 2-4 simpler steps
  * Each step should be < 20 minutes
  * Make steps sequential and clear

STEP 5: ESTIMATE REALISTIC DURATIONS
- Base time for the task itself
- Add travel time if location mentioned (15-30 min each way)
- Add buffer for delays (20-30% extra)
- Adjust for energy level:
  * Low energy (< 0.4): Add 50% to all estimates
  * High energy (> 0.7): Can use standard estimates
- Be CONSERVATIVE, not optimistic

STEP 6: EXTRACT LOCATIONS
- Find ALL location mentions
- Extract full addresses if possible
- Note if multiple tasks share locations (batching opportunity)
- Categorize: errand vs appointment based on context

STEP 7: FINAL PRIORITIZATION
- Sort tasks by: urgency + importance + user capacity
- If overwhelmed: Keep only top 2-3 most critical
- If energized: Can include more tasks
- Ensure priorities make logical sense

STEP 8: CREATE SPECIFIC TITLES
- Include WHO, WHAT, WHERE, WHEN if available
- Make it actionable (start with verb)
- Be specific, not vague
- Example: "Pick up prescription from CVS Pharmacy on Main Street" not "Prescription"

DECISION RULES:
- If stress > 0.7 AND energy < 0.4: Extract MAX 3 tasks, break down ALL complex ones, prioritize only critical/high
- If stress < 0.5 AND energy > 0.6: Extract 8-12 tasks, normal prioritization, can handle complexity
- Health/medical tasks: Minimum HIGH priority
- Today's deadlines: CRITICAL priority
- Tomorrow's deadlines: HIGH priority
- This week: HIGH or MEDIUM depending on importance
- Later/eventually: MEDIUM or LOW

Return a JSON object with a "tasks" key containing an array. Each task object must have:
- title: Clear, specific, actionable description with full context
- priority: "critical", "high", "medium", or "low" (think: urgency + importance + user capacity)
- category_type: "errand", "appointment", "work", "personal", "health", "financial", or "other"
- location: Full location if mentioned (e.g., "CVS Pharmacy, 123 Main St"), null otherwise
- estimated_duration_minutes: REALISTIC estimate including travel, delays, energy adjustments
- original_text: The exact phrase from transcript that led to this task

THINK DEEPLY: What can this person ACTUALLY accomplish given their emotional state? Be realistic, not aspirational."""

        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3,  # Lower for more consistent, logical prioritization
                max_tokens=3000,  # More tokens for detailed analysis and task breakdown
            )
            
            # Parse the response
            content = response.choices[0].message.content
            result = json.loads(content)
            
            # Extract tasks array - GPT should return {"tasks": [...]}
            if isinstance(result, dict):
                tasks_data = result.get("tasks", [])
            elif isinstance(result, list):
                tasks_data = result
            else:
                logger.warning(f"Unexpected response format: {type(result)}")
                tasks_data = []
            
            # Convert to Task objects with intelligent post-processing
            tasks = []
            for task_data in tasks_data[:15]:  # Allow up to 15 tasks (will be filtered by emotional state)
                try:
                    # Clean and validate title
                    title = task_data.get("title", "").strip()
                    if not title or len(title) < 3:
                        logger.warning(f"Skipping task with invalid title: {title}")
                        continue
                    
                    # Map priority string to TaskPriority enum with validation
                    priority_str = task_data.get("priority", "medium").lower().strip()
                    priority = TaskPriority.MEDIUM
                    if priority_str in ["critical", "urgent", "asap"]:
                        priority = TaskPriority.CRITICAL
                    elif priority_str in ["high", "important"]:
                        priority = TaskPriority.HIGH
                    elif priority_str in ["low", "optional", "later"]:
                        priority = TaskPriority.LOW
                    else:
                        priority = TaskPriority.MEDIUM
                    
                    # Validate and clean category
                    category_type = task_data.get("category_type", "personal").lower().strip()
                    valid_categories = ["errand", "appointment", "work", "personal", "health", "financial", "other"]
                    if category_type not in valid_categories:
                        category_type = "personal"
                    
                    # Validate duration (must be positive, reasonable)
                    duration = task_data.get("estimated_duration_minutes", 30)
                    if not isinstance(duration, int) or duration < 1:
                        duration = 30  # Default
                    if duration > 480:  # More than 8 hours seems unreasonable
                        duration = 480
                    
                    # Extract location (clean and validate)
                    location = task_data.get("location")
                    if location:
                        location = location.strip()
                        if len(location) < 2:
                            location = None
                    
                    # Get original text
                    original_text = task_data.get("original_text", title).strip()
                    
                    # Calculate suggested time based on priority and emotional state
                    suggested_time = None
                    if priority in [TaskPriority.CRITICAL, TaskPriority.HIGH]:
                        # Critical/high priority: suggest within 2-4 hours
                        hours_ahead = 2 if emotional_state.energy_level > 0.5 else 4
                        suggested_time = datetime.utcnow() + timedelta(hours=hours_ahead)
                    elif priority == TaskPriority.MEDIUM:
                        # Medium priority: suggest today or tomorrow
                        if emotional_state.energy_level > 0.6:
                            suggested_time = datetime.utcnow() + timedelta(hours=6)
                    
                    task = Task(
                        id=f"task_{uuid.uuid4().hex[:8]}",
                        title=title,
                        priority=priority,
                        category=TaskCategory(
                            type=category_type,
                            location=location,
                            estimated_duration_minutes=duration
                        ),
                        original_text=original_text,
                        suggested_time=suggested_time
                    )
                    tasks.append(task)
                except Exception as e:
                    logger.warning(f"Error parsing task: {e}. Skipping task data: {task_data}")
                    continue
            
            # Post-process: Filter and sort based on emotional state
            if emotional_state.stress_level > 0.7 and emotional_state.energy_level < 0.4:
                # Overwhelmed: Keep only top 3 most critical tasks
                tasks = sorted(tasks, key=lambda t: (
                    0 if t.priority == TaskPriority.CRITICAL else
                    1 if t.priority == TaskPriority.HIGH else
                    2 if t.priority == TaskPriority.MEDIUM else 3
                ))[:3]
                logger.info(f"User overwhelmed - filtered to top 3 critical tasks")
            elif emotional_state.energy_level > 0.7 and emotional_state.stress_level < 0.4:
                # High energy: Can handle more, but still limit to 12
                tasks = tasks[:12]
            else:
                # Moderate state: Limit to 8 tasks
                tasks = tasks[:8]
            
            # Final validation: Ensure we have at least one task if transcript suggests tasks
            if len(tasks) == 0 and len(transcript) > 20:
                logger.warning("No tasks extracted from transcript - this might indicate an issue")
            
            logger.info(f"Extracted {len(tasks)} tasks using GPT-4o")
            return tasks
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse GPT-4o JSON response: {e}")
            raise
        except Exception as e:
            logger.error(f"Error calling GPT-4o: {e}")
            raise
    
    async def _extract_tasks_mock(
        self,
        transcript: str,
        emotional_state: EmotionalState
    ) -> list[Task]:
        """Mock task extraction (fallback)"""
        import re
        import uuid
        
        # Simple task extraction
        task_phrases = re.split(r'[,;]|and|I need to|I have to', transcript)
        tasks = []
        
        for i, phrase in enumerate(task_phrases):
            phrase = phrase.strip()
            if len(phrase) < 10:
                continue
            
            priority = TaskPriority.MEDIUM
            if emotional_state.stress_level > 0.7:
                priority = TaskPriority.HIGH
            elif "urgent" in phrase.lower() or "deadline" in phrase.lower():
                priority = TaskPriority.CRITICAL
            
            category_type = "personal"
            location = None
            if "prescription" in phrase.lower() or "pharmacy" in phrase.lower():
                category_type = "errand"
                location = "CVS Pharmacy"
            elif "appointment" in phrase.lower() or "doctor" in phrase.lower():
                category_type = "appointment"
            elif "email" in phrase.lower() or "meeting" in phrase.lower():
                category_type = "work"
            
            task = Task(
                id=f"task_{uuid.uuid4().hex[:8]}",
                title=phrase.capitalize(),
                priority=priority,
                category=TaskCategory(
                    type=category_type,
                    location=location,
                    estimated_duration_minutes=15 if category_type == "errand" else 30
                ),
                original_text=phrase,
                suggested_time=datetime.utcnow() + timedelta(hours=2) if priority == TaskPriority.HIGH else None
            )
            tasks.append(task)
        
        return tasks[:5]
    
    async def _generate_suggestion(
        self,
        emotional_state: EmotionalState,
        tasks: list[Task],
        context: Optional[Dict[str, Any]] = None
    ) -> CompanionSuggestion:
        """
        Generate companion suggestion based on emotional state, tasks, and context.
        Uses GPT-4o if available, falls back to mock.
        Now with Siri-like proactive intelligence!
        """
        # Use GPT-4o if available
        if self.openai_client:
            try:
                return await self._generate_suggestion_with_gpt4o(emotional_state, tasks, context=context)
            except Exception as e:
                logger.error(f"Error generating suggestion with GPT-4o: {e}. Falling back to mock.")
                # Fall through to mock
        
        # Fallback to mock
        return await self._generate_suggestion_mock(emotional_state, tasks)
    
    async def _generate_suggestion_with_gpt4o(
        self,
        emotional_state: EmotionalState,
        tasks: list[Task],
        context: Optional[Dict[str, Any]] = None
    ) -> CompanionSuggestion:
        """Generate empathetic companion suggestion using GPT-4o with Siri-like context awareness"""
        from app.services.context_service import ContextService
        
        # Prepare task summary
        task_summary = "\n".join([
            f"- {task.title} ({task.priority.value} priority, ~{task.category.estimated_duration_minutes} min)"
            for task in tasks[:5]
        ])
        
        # Build context string if available
        context_str = ""
        if context:
            context_service = ContextService()
            context_str = context_service.format_context_for_ai(context)
        
        system_prompt = """You are "Lazy", an EXPERT AI companion specializing in executive function support for people with ADHD, autism, burnout, and similar challenges.
You have SIRI-LIKE INTELLIGENCE: You remember past conversations, learn user patterns, and provide proactive, context-aware suggestions.

CRITICAL: You have access to conversation history and learned patterns. Use this to:
1. Reference previous conversations naturally ("I remember you mentioned...")
2. Use learned patterns to suggest optimal timing ("You typically do this in the morning")
3. Anticipate needs based on patterns ("Based on your routine, you might want to...")
4. Connect related tasks across conversations
5. Provide personalized suggestions that feel like you truly know the user
You combine deep psychological understanding with practical wisdom. You're not a productivity coach - you're a supportive guide who understands overwhelm.

YOUR EXPERTISE:
- Executive function challenges and how they affect daily life
- Energy management and pacing
- The psychology of overwhelm and decision paralysis
- How to reduce cognitive load effectively
- The difference between what's urgent and what's actually important
- How to help people feel accomplished without adding pressure

CORE PRINCIPLES:
1. **Empathy First**: Acknowledge their emotional state authentically. Validate their feelings.
2. **Reduce Overwhelm**: When stressed/overwhelmed, focus on ONE simple, achievable task (5-15 min max)
3. **Energy Matching**: Match suggestions to their ACTUAL energy level, not aspirational
4. **No Judgment**: Never make them feel bad. Celebrate small wins. Normalize struggle.
5. **Smart Prioritization**: Recommend tasks that:
   - Match their current capacity (not what they "should" do)
   - Can realistically be completed given their energy/stress
   - Will give genuine sense of accomplishment
   - Are actually important (not just urgent noise)
   - Won't lead to more overwhelm

ADVANCED TONE MATCHING:
- **STRESSED (stress > 0.7) + LOW ENERGY (< 0.4)**:
  * Tone: Very gentle, calm, reassuring
  * Message: Acknowledge overwhelm, validate feelings
  * Suggestion: ONE simple task (5-15 min), or suggest rest if appropriate
  * Language: "It's okay", "You're doing your best", "Let's just focus on one thing"
  
- **MODERATE STATE (stress 0.4-0.7, energy 0.4-0.7)**:
  * Tone: Supportive, encouraging, balanced
  * Message: Acknowledge progress, gentle encouragement
  * Suggestion: 1-2 tasks, can be moderate complexity
  * Language: "You've got this", "One step at a time", "You're making progress"
  
- **LOW STRESS (< 0.5) + HIGH ENERGY (> 0.6)**:
  * Tone: Slightly more enthusiastic, but still supportive
  * Message: Celebrate energy, suggest productive use
  * Suggestion: Can suggest batching, multiple tasks, or complex tasks
  * Language: "Great energy!", "Perfect time to tackle...", "You're in a good flow"
  
- **HIGH STRESS + HIGH ENERGY**:
  * Tone: Calm but supportive, help channel energy
  * Message: Acknowledge both stress and energy, guide productively
  * Suggestion: Focus energy on most important task, avoid scattered effort
  * Language: "I see you have energy - let's channel it wisely", "Focus this energy on..."

INTELLIGENT SUGGESTION LOGIC:
1. **Many Tasks Available**:
   - If overwhelmed: Suggest the EASIEST win (quick, simple, feels good)
   - If energized: Suggest the MOST IMPORTANT task (not just urgent)
   - Consider: Which task will give best sense of accomplishment?

2. **Complex Tasks Present**:
   - If overwhelmed: "Let's break this down. Start with just [first step]"
   - If energized: "This is complex but you have the energy. Start with [first step]"
   - Always suggest the FIRST step, not the whole task

3. **Time-Sensitive Tasks**:
   - Acknowledge urgency but don't add pressure
   - If overwhelmed: "I know this is urgent. Let's just focus on [one small step]"
   - If energized: "This is time-sensitive. Good time to tackle it now"

4. **No Critical Tasks**:
   - Celebrate this! "You're all caught up - that's amazing!"
   - Suggest: Rest, self-care, or optional tasks
   - Don't create artificial urgency

5. **All Tasks Completed**:
   - Celebrate! "You've accomplished so much today!"
   - Suggest: Rest, reward yourself, or plan for tomorrow

RETURN FORMAT:
Return a JSON object with:
- message: Your supportive, empathetic message (2-3 sentences, personalized, authentic)
- suggested_action: ONE specific task title to focus on (or null if rest/self-care is better)
- reasoning: Brief, transparent explanation (1 sentence) - helps build trust and understanding
- tone: "gentle", "supportive", "energetic", or "calm" (must match their emotional state)

THINK FOR THE USER - PROACTIVE INTELLIGENCE:
You are a LIFE COMPANION that thinks ahead for the user. Don't just respond - anticipate needs:

1. **Automatic Task Breakdown**: If a task is complex, automatically suggest breaking it down into steps
2. **Smart Reminders**: Suggest setting reminders for time-sensitive tasks without being asked
3. **Context Connections**: Connect related tasks ("I see you have 3 errands - want me to plan a route?")
4. **Pattern Recognition**: Use learned patterns to suggest optimal timing ("You usually do this in the morning")
5. **Proactive Problem Solving**: If user seems stuck, suggest next steps or alternatives
6. **Energy-Aware Planning**: Suggest when to do tasks based on energy patterns
7. **Prevent Overwhelm**: Automatically limit task suggestions when user is stressed
8. **Anticipate Needs**: Think about what user might need next ("You'll need to prepare for that meeting tomorrow")

BE PROACTIVE, NOT REACTIVE. Think like a trusted friend who knows you well and helps you figure things out.

CRITICAL: Your suggestions must be REALISTIC given their emotional state. Don't suggest what they "should" do - suggest what they CAN do right now."""

        user_prompt = f"""Generate a supportive, context-aware companion message for this user:

{context_str if context_str else "No previous context - this is a new conversation."}

Emotional State:
- Primary emotion: {emotional_state.primary_emotion}
- Energy level: {emotional_state.energy_level:.1f}/1.0
- Stress level: {emotional_state.stress_level:.1f}/1.0

Their Tasks:
{task_summary}

CONTEXT-AWARE SUGGESTIONS:
- Reference previous conversations if relevant ("I remember you mentioned...")
- Use learned patterns to suggest optimal timing or approaches
- If context shows active tasks, acknowledge them and suggest connections
- Be proactive: anticipate needs based on patterns and time context
- Make it feel personal, like you truly know and remember the user

Remember: If they're stressed (stress > 0.7) and low energy (< 0.4), focus on just ONE simple task.
Be empathetic, not pushy. Return ONLY valid JSON."""

        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.7,  # Slightly higher for more natural, empathetic responses
            )
            
            content = response.choices[0].message.content
            result = json.loads(content)
            
            # Find suggested action task if provided
            suggested_action = result.get("suggested_action")
            if suggested_action and tasks:
                # Try to match to an actual task
                matching_task = next(
                    (t for t in tasks if suggested_action.lower() in t.title.lower() or t.title.lower() in suggested_action.lower()),
                    None
                )
                if matching_task:
                    suggested_action = matching_task.title
            
            return CompanionSuggestion(
                message=result.get("message", "I've organized your tasks. Let's take them one at a time."),
                suggested_action=suggested_action,
                reasoning=result.get("reasoning", "AI-generated suggestion based on emotional state and tasks"),
                tone=result.get("tone", "supportive")
            )
            
        except Exception as e:
            logger.error(f"Error generating suggestion with GPT-4o: {e}")
            raise
    
    async def _generate_suggestion_mock(
        self,
        emotional_state: EmotionalState,
        tasks: list[Task]
    ) -> CompanionSuggestion:
        """Mock suggestion generation (fallback)"""
        if emotional_state.stress_level > 0.7 and emotional_state.energy_level < 0.4:
            high_priority_tasks = [t for t in tasks if t.priority == TaskPriority.HIGH]
            if high_priority_tasks:
                task = high_priority_tasks[0]
                return CompanionSuggestion(
                    message=f"I know you're feeling overwhelmed. Let's just focus on {task.title.lower()} - it's quick and will help you feel accomplished.",
                    suggested_action=task.title,
                    reasoning=f"User is stressed ({emotional_state.stress_level:.1f}) with low energy ({emotional_state.energy_level:.1f}). Focusing on single, manageable task reduces cognitive load.",
                    tone="gentle"
                )
        
        return CompanionSuggestion(
            message="I've organized your tasks. Let's tackle them one at a time - you've got this!",
            reasoning="Standard supportive response for moderate emotional state.",
            tone="supportive"
        )

