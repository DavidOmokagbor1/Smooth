# Lazy Backend API

AI-Powered Executive Function Companion - FastAPI Backend

## Project Structure

```
backend/
├── main.py                 # FastAPI app entry point
├── app/
│   ├── api/
│   │   └── routes/
│   │       └── process_voice.py  # Voice processing endpoint
│   ├── core/
│   │   └── config.py      # Configuration settings
│   ├── models/
│   │   └── schemas.py     # Pydantic data models
│   └── services/
│       └── ai_service.py   # AI processing service (mocked initially)
├── requirements.txt
└── .env.example
```

## Setup

1. **Create virtual environment:**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env and add your API keys when ready
```

4. **Run the development server:**
```bash
python main.py
# Or: uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Health Check
- `GET /` - Basic health check
- `GET /health` - Detailed health check

### Voice Processing
- `POST /api/v1/process-voice-input` - Process voice audio and return tasks + emotional state

## Current Status

✅ **Completed:**
- FastAPI project structure
- Core `/process-voice-input` endpoint
- Pydantic models for request/response
- Mock AI service (returns realistic test data)
- Error handling

🔄 **Next Steps:**
1. Integrate OpenAI Whisper for speech-to-text
2. Integrate emotion detection API (Hume AI or similar)
3. Integrate GPT-4o for intelligent task extraction
4. Add PostgreSQL database
5. Add authentication

## Testing the API

You can test the endpoint using curl:

```bash
curl -X POST "http://localhost:8000/api/v1/process-voice-input" \
  -F "audio_file=@test_audio.wav"
```

Or use the interactive API docs at `http://localhost:8000/docs`

