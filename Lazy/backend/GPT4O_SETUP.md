# GPT-4o Integration Setup

## ✅ What's Integrated

The backend now uses **GPT-4o** for:
1. **Intelligent Task Extraction** - Parses voice transcripts and extracts structured tasks
2. **Smart Prioritization** - Prioritizes tasks based on urgency and user's emotional state
3. **Empathetic Companion Suggestions** - Generates supportive, context-aware messages

## 🔧 Setup Instructions

### 1. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Create a new API key
4. Copy the key (starts with `sk-...`)

### 2. Configure Environment

```bash
cd "/Volumes/2-2-22/BEATZBYJAVA PRODUCTIONS WEB/Smooth/Lazy/backend"

# Copy the example env file
cp env.example .env

# Edit .env and add your API key
# OPENAI_API_KEY=sk-your-actual-key-here
```

### 3. Install Dependencies

```bash
source venv/bin/activate
pip install -r requirements.txt
```

### 4. Restart the Server

```bash
python main.py
```

## 🎯 How It Works

### Without API Key (Mock Mode)
- Uses simple keyword-based task extraction
- Basic priority assignment
- Generic supportive messages
- **Still functional for testing!**

### With API Key (GPT-4o Mode)
- **Intelligent task extraction** - Understands context, extracts multiple tasks
- **Emotion-aware prioritization** - Adjusts based on user's stress/energy levels
- **Empathetic suggestions** - Context-aware, supportive companion messages
- **Better categorization** - Understands task types (errand, appointment, work, etc.)

## 📊 Example Comparison

### Mock Response:
```json
{
  "tasks": [
    {
      "title": "Buy milk",
      "priority": "medium",
      "category": {"type": "personal"}
    }
  ],
  "companion_suggestion": {
    "message": "I've organized your tasks. Let's tackle them one at a time!"
  }
}
```

### GPT-4o Response:
```json
{
  "tasks": [
    {
      "title": "Pick up prescription from CVS Pharmacy",
      "priority": "high",
      "category": {
        "type": "errand",
        "location": "CVS Pharmacy",
        "estimated_duration_minutes": 15
      }
    }
  ],
  "companion_suggestion": {
    "message": "I know you're feeling overwhelmed. Let's just focus on picking up your prescription - it's on your way home and will only take 10 minutes.",
    "tone": "gentle",
    "reasoning": "User is stressed (0.8) with low energy (0.3). Focusing on single, quick errand reduces cognitive load."
  }
}
```

## 🔍 Testing

1. **Test without API key** (mock mode):
   - Just start the server - it will use mocks
   - Good for testing the API structure

2. **Test with API key** (GPT-4o mode):
   - Add your API key to `.env`
   - Restart server
   - Send a voice transcript and see intelligent responses!

## 💡 Tips

- **Cost**: GPT-4o is pay-per-use. Monitor usage at https://platform.openai.com/usage
- **Fallback**: If API key is missing or invalid, automatically falls back to mock mode
- **Error Handling**: All errors are logged and gracefully handled

## 🚀 Next Steps

Once GPT-4o is working, we can integrate:
- OpenAI Whisper (speech-to-text)
- Hume AI (emotion detection from voice)
- Google Maps API (routing and location)

