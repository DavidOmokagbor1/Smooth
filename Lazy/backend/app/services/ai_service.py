"""
AI Service Layer
Handles all AI processing: transcription, emotion detection, task extraction, etc.
Currently uses mock responses - will be replaced with real AI services incrementally.
"""

import logging
import json
from typing import Optional
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
        text: str
    ) -> VoiceProcessingResponse:
        """
        Process text input directly (alternative to voice).
        
        Args:
            text: Raw text input from user
            
        Returns:
            VoiceProcessingResponse with tasks, emotional state, and suggestions
        """
        logger.info("Processing text input")
        
        # Use text directly as transcript (no transcription needed)
        transcript = text.strip()
        
        # Detect emotional state from text
        emotional_state = await self._detect_emotion(None, transcript)
        
        # Extract and prioritize tasks using GPT-4o
        tasks = await self._extract_tasks(transcript, emotional_state)
        
        # Generate companion suggestion
        companion_suggestion = await self._generate_suggestion(emotional_state, tasks)
        
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
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    
    async def process_voice_input(
        self,
        audio_data: bytes,
        content_type: Optional[str] = None
    ) -> VoiceProcessingResponse:
        """
        Main processing pipeline for voice input.
        
        Args:
            audio_data: Raw audio file bytes
            content_type: MIME type of audio file
            
        Returns:
            VoiceProcessingResponse with tasks, emotional state, and suggestions
        """
        processing_mode = "ai" if self.openai_client else "mock"
        logger.info(f"Processing voice input ({processing_mode} mode)")
        
        # Step 1 - Transcribe audio using Whisper API
        transcript = await self._transcribe_audio(audio_data, content_type)
        logger.info(f"Transcript: {transcript[:100]}...")
        
        # Step 2 - Detect emotional state (currently keyword-based, will use Hume AI later)
        emotional_state = await self._detect_emotion(audio_data, transcript)
        logger.info(f"Emotional state: {emotional_state.primary_emotion} (stress: {emotional_state.stress_level:.2f}, energy: {emotional_state.energy_level:.2f})")
        
        # Step 3 - Extract and prioritize tasks using GPT-4o
        tasks = await self._extract_tasks(transcript, emotional_state)
        logger.info(f"Extracted {len(tasks)} tasks")
        
        # Step 4 - Generate companion suggestion
        companion_suggestion = await self._generate_suggestion(emotional_state, tasks)
        
        return VoiceProcessingResponse(
            transcript=transcript,
            emotional_state=emotional_state,
            tasks=tasks,
            companion_suggestion=companion_suggestion,
            processing_metadata={
                "processing_mode": processing_mode,
                "whisper_enabled": bool(self.openai_client),
                "gpt4o_enabled": bool(self.openai_client),
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
        emotional_state: EmotionalState
    ) -> list[Task]:
        """
        Extract and prioritize tasks using GPT-4o.
        Falls back to mock if OpenAI is not available.
        """
        import uuid
        
        # Use GPT-4o if available
        if self.openai_client:
            try:
                return await self._extract_tasks_with_gpt4o(transcript, emotional_state)
            except Exception as e:
                logger.error(f"Error calling GPT-4o: {e}. Falling back to mock.")
                # Fall through to mock implementation
        
        # Fallback to mock implementation
        return await self._extract_tasks_mock(transcript, emotional_state)
    
    async def _extract_tasks_with_gpt4o(
        self,
        transcript: str,
        emotional_state: EmotionalState
    ) -> list[Task]:
        """Extract tasks using GPT-4o with structured output"""
        import uuid
        
        system_prompt = """You are an intelligent AI assistant helping someone with executive function challenges (ADHD, autism, burnout, etc.). 
Your job is to extract tasks from their spoken input and intelligently prioritize them with deep understanding of context.

INTELLIGENT PRIORITIZATION RULES:
1. **Urgency Detection**: Look for time-sensitive keywords:
   - "today", "now", "asap", "urgent", "deadline", "due today" → CRITICAL
   - "tomorrow", "this week", "soon" → HIGH
   - "later", "eventually", "when I can" → MEDIUM or LOW

2. **Time Context**: Extract specific times mentioned:
   - "3pm meeting", "appointment at 2", "deadline Friday" → Use for prioritization
   - Morning tasks for low energy users → Lower priority if energy < 0.4

3. **Emotional State Awareness**:
   - Stressed (stress > 0.7) + Low Energy (< 0.4): Focus on 1-2 critical tasks only, break complex tasks down
   - Moderate stress/energy: Normal prioritization
   - High energy: Can handle more tasks, suggest batching similar tasks

4. **Task Complexity Analysis**:
   - Simple tasks (5-15 min): Good for low energy states
   - Complex tasks (30+ min): Break down or defer if user is overwhelmed
   - Multi-step tasks: Identify and suggest breaking into smaller steps

5. **Context Clues**:
   - Location mentions → Extract and categorize as "errand" or "appointment"
   - People mentioned → May indicate social/relationship tasks
   - Work-related keywords → Categorize as "work"
   - Health/medical keywords → High priority, categorize as "appointment" or "errand"

6. **Smart Categorization**:
   - "errand": Shopping, picking up items, going somewhere
   - "appointment": Scheduled meetings, doctor visits, time-specific events
   - "work": Job-related tasks, emails, meetings, deadlines
   - "personal": Self-care, hobbies, home tasks
   - "other": Everything else

Return a JSON object with a "tasks" key containing an array. Each task must have:
- title: Clear, actionable, specific task description (not vague)
- priority: "critical", "high", "medium", or "low" (be thoughtful about this)
- category_type: "errand", "appointment", "work", "personal", or "other"
- location: Specific location if mentioned (e.g., "CVS Pharmacy on Main St", "Doctor's office")
- estimated_duration_minutes: Realistic estimate based on task type and complexity
- original_text: The exact phrase from transcript that led to this task

BE EMPATHETIC: If user is overwhelmed, extract fewer tasks and prioritize only what truly matters. Break down complex tasks into simpler steps."""

        user_prompt = f"""Extract and intelligently prioritize tasks from this transcript:

TRANSCRIPT:
"{transcript}"

USER'S CURRENT STATE:
- Primary emotion: {emotional_state.primary_emotion}
- Energy level: {emotional_state.energy_level:.1f}/1.0 (0.0 = completely exhausted, 1.0 = fully energetic)
- Stress level: {emotional_state.stress_level:.1f}/1.0 (0.0 = completely calm, 1.0 = highly stressed/overwhelmed)

CONTEXT ANALYSIS REQUIRED:
1. Identify ALL tasks mentioned (even if implied)
2. Extract time references (today, tomorrow, specific times, deadlines)
3. Identify urgency indicators
4. Consider user's emotional state when prioritizing
5. Break down complex tasks if user is overwhelmed
6. Extract locations mentioned
7. Estimate realistic durations

SPECIAL INSTRUCTIONS:
- If stress > 0.7 AND energy < 0.4: Extract maximum 3-4 tasks, prioritize only critical/high
- If stress < 0.5 AND energy > 0.6: Can extract more tasks, normal prioritization
- Always extract specific times mentioned and use them for prioritization
- If a task seems complex, consider if it should be broken down (but don't break down unless truly needed)

Return a JSON object with a "tasks" key containing an array. Each task object must have:
- title: Clear, specific, actionable description
- priority: "critical", "high", "medium", or "low" (be thoughtful)
- category_type: "errand", "appointment", "work", "personal", or "other"
- location: Specific location if mentioned, null otherwise
- estimated_duration_minutes: Realistic estimate (5-15 for simple, 15-30 for medium, 30-60+ for complex)
- original_text: The exact phrase from transcript"""

        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.4,  # Slightly higher for more intelligent, context-aware responses
                max_tokens=2000,  # Allow more tokens for detailed task extraction
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
            
            # Convert to Task objects
            tasks = []
            for task_data in tasks_data[:10]:  # Limit to 10 tasks
                try:
                    # Map priority string to TaskPriority enum
                    priority_str = task_data.get("priority", "medium").lower()
                    priority = TaskPriority.MEDIUM
                    if priority_str == "critical":
                        priority = TaskPriority.CRITICAL
                    elif priority_str == "high":
                        priority = TaskPriority.HIGH
                    elif priority_str == "low":
                        priority = TaskPriority.LOW
                    
                    task = Task(
                        id=f"task_{uuid.uuid4().hex[:8]}",
                        title=task_data.get("title", "Untitled task"),
                        priority=priority,
                        category=TaskCategory(
                            type=task_data.get("category_type", "personal"),
                            location=task_data.get("location"),
                            estimated_duration_minutes=task_data.get("estimated_duration_minutes", 30)
                        ),
                        original_text=task_data.get("original_text", task_data.get("title", "")),
                        suggested_time=datetime.utcnow() + timedelta(hours=2) if priority in [TaskPriority.CRITICAL, TaskPriority.HIGH] else None
                    )
                    tasks.append(task)
                except Exception as e:
                    logger.warning(f"Error parsing task: {e}. Skipping.")
                    continue
            
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
        tasks: list[Task]
    ) -> CompanionSuggestion:
        """
        Generate companion suggestion based on emotional state and tasks.
        Uses GPT-4o if available, falls back to mock.
        """
        # Use GPT-4o if available
        if self.openai_client:
            try:
                return await self._generate_suggestion_with_gpt4o(emotional_state, tasks)
            except Exception as e:
                logger.error(f"Error generating suggestion with GPT-4o: {e}. Falling back to mock.")
                # Fall through to mock
        
        # Fallback to mock
        return await self._generate_suggestion_mock(emotional_state, tasks)
    
    async def _generate_suggestion_with_gpt4o(
        self,
        emotional_state: EmotionalState,
        tasks: list[Task]
    ) -> CompanionSuggestion:
        """Generate empathetic companion suggestion using GPT-4o"""
        
        # Prepare task summary
        task_summary = "\n".join([
            f"- {task.title} ({task.priority.value} priority, ~{task.category.estimated_duration_minutes} min)"
            for task in tasks[:5]
        ])
        
        system_prompt = """You are "Lazy", an intelligent, empathetic AI companion for people with executive function challenges (ADHD, autism, burnout, etc.).
Your role is to be supportive, reduce cognitive load, and help users feel understood - NOT to be a productivity coach.

CORE PRINCIPLES:
1. **Empathy First**: Always acknowledge their emotional state and validate their feelings
2. **Reduce Overwhelm**: When stressed/overwhelmed, focus on ONE simple, achievable task
3. **Energy Awareness**: Match your suggestions to their energy level
4. **No Judgment**: Never make them feel bad about what they haven't done
5. **Smart Suggestions**: Recommend tasks that:
   - Match their current energy level
   - Can be completed in their available time
   - Will give them a sense of accomplishment
   - Are actually important (not just urgent)

TONE ADJUSTMENT:
- **Stressed (stress > 0.7) + Low Energy (< 0.4)**: Very gentle, calm, suggest ONE simple task (5-15 min max)
- **Moderate Stress/Energy**: Supportive, encouraging, can suggest 1-2 tasks
- **Low Stress + High Energy (> 0.6)**: Slightly more enthusiastic, can suggest batching or multiple tasks
- **High Stress + High Energy**: Calm but supportive, help them channel energy productively

INTELLIGENT SUGGESTIONS:
- If they have many tasks: Suggest starting with the easiest win (quick task that feels good to complete)
- If they have complex tasks: Suggest breaking it down or starting with just one step
- If they have time-sensitive tasks: Acknowledge urgency but don't add pressure
- If they have no critical tasks: Celebrate that and suggest self-care or rest

Return a JSON object with:
- message: Your supportive, empathetic message (2-3 sentences max, personalized to their state)
- suggested_action: ONE specific task title to focus on (or null if rest/self-care is better)
- reasoning: Brief, transparent explanation of why this suggestion (helps build trust)
- tone: "gentle", "supportive", "energetic", or "calm" (match their emotional state)
"""

        user_prompt = f"""Generate a supportive companion message for this user:

Emotional State:
- Primary emotion: {emotional_state.primary_emotion}
- Energy level: {emotional_state.energy_level:.1f}/1.0
- Stress level: {emotional_state.stress_level:.1f}/1.0

Their Tasks:
{task_summary}

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

