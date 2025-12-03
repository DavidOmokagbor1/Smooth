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
        Detect emotional state from voice using Hume AI or similar.
        Currently returns mock emotional state.
        """
        # TODO: Integrate Hume AI or similar emotion detection API
        # For now, analyze transcript keywords to simulate emotion detection
        
        transcript_lower = transcript.lower()
        
        # Simple keyword-based emotion detection (mock)
        if any(word in transcript_lower for word in ["stressed", "worried", "anxious", "overwhelmed"]):
            return EmotionalState(
                primary_emotion="stressed",
                energy_level=0.3,
                stress_level=0.8,
                confidence=0.85
            )
        elif any(word in transcript_lower for word in ["tired", "exhausted", "drained"]):
            return EmotionalState(
                primary_emotion="tired",
                energy_level=0.2,
                stress_level=0.4,
                confidence=0.80
            )
        else:
            return EmotionalState(
                primary_emotion="neutral",
                energy_level=0.6,
                stress_level=0.3,
                confidence=0.70
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
        
        system_prompt = """You are an AI assistant helping someone with executive function challenges (ADHD, autism, burnout, etc.). 
Your job is to extract tasks from their spoken input and intelligently prioritize them based on:
1. Urgency indicators in the text
2. The user's current emotional state (stressed, tired, etc.)
3. Task complexity and estimated duration

Return a JSON array of tasks. Each task should have:
- title: Clear, actionable task description
- priority: "critical", "high", "medium", or "low" based on urgency and user's emotional state
- category_type: "errand", "appointment", "work", "personal", or "other"
- location: If applicable (e.g., "CVS Pharmacy", "Doctor's office")
- estimated_duration_minutes: Realistic time estimate
- original_text: The exact phrase from the transcript

Be empathetic - if the user is stressed (stress_level > 0.7) and low energy (energy_level < 0.4), 
prioritize fewer, simpler tasks. Don't overwhelm them."""

        user_prompt = f"""Extract and prioritize tasks from this transcript:

"{transcript}"

User's emotional state:
- Primary emotion: {emotional_state.primary_emotion}
- Energy level: {emotional_state.energy_level:.1f} (0.0 = exhausted, 1.0 = energetic)
- Stress level: {emotional_state.stress_level:.1f} (0.0 = calm, 1.0 = highly stressed)

Return a JSON object with a "tasks" key containing an array of task objects. Each task object must have: title, priority, category_type, location (optional), estimated_duration_minutes, original_text."""

        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3,  # Lower temperature for more consistent, structured output
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
        
        system_prompt = """You are "Lazy", an AI companion for people with executive function challenges (ADHD, autism, burnout, etc.).
Your role is to be supportive, empathetic, and reduce cognitive load - NOT to be a productivity coach.

Key principles:
1. Be gentle and understanding - never judgmental
2. Reduce overwhelm by focusing on ONE thing at a time when user is stressed
3. Acknowledge their emotional state
4. Make suggestions feel like a caring friend, not a taskmaster
5. Adjust your tone based on their emotional state:
   - Stressed + Low Energy: Very gentle, suggest just ONE simple task
   - Moderate: Supportive and encouraging
   - Energetic: Can be slightly more enthusiastic

Return a JSON object with:
- message: Your supportive message (1-2 sentences, empathetic)
- suggested_action: ONE specific task to focus on (or null if no specific action)
- reasoning: Brief explanation of why this suggestion (for transparency)
- tone: "gentle", "supportive", "energetic", or "calm"
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

