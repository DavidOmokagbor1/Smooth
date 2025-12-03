# Quick Start Guide

## Setup (One-time)

```bash
# Navigate to backend directory (use quotes because of spaces in path)
cd "/Volumes/2-2-22/BEATZBYJAVA PRODUCTIONS WEB/Smooth/Lazy/backend"

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Run the Server

```bash
# Make sure you're in the backend directory
cd "/Volumes/2-2-22/BEATZBYJAVA PRODUCTIONS WEB/Smooth/Lazy/backend"

# Activate virtual environment
source venv/bin/activate

# Run the server
python main.py
```

Or use the quick start script:
```bash
cd "/Volumes/2-2-22/BEATZBYJAVA PRODUCTIONS WEB/Smooth/Lazy/backend"
./run.sh
```

## Access the API

Once running, the API will be available at:
- **API Base:** http://localhost:8000
- **Health Check:** http://localhost:8000/health
- **Interactive Docs:** http://localhost:8000/docs (Swagger UI)
- **Alternative Docs:** http://localhost:8000/redoc

## Test the Endpoint

You can test the voice processing endpoint using the interactive docs at `/docs`, or with curl:

```bash
curl -X POST "http://localhost:8000/api/v1/process-voice-input" \
  -F "audio_file=@path/to/your/audio.wav"
```

## Troubleshooting

**Issue: "No such file or directory"**
- Make sure you're using the full path with quotes: `"/Volumes/2-2-22/BEATZBYJAVA PRODUCTIONS WEB/Smooth/Lazy/backend"`
- Or navigate step by step: `cd Smooth` then `cd Lazy` then `cd backend`

**Issue: Module not found**
- Make sure virtual environment is activated: `source venv/bin/activate`
- Reinstall dependencies: `pip install -r requirements.txt`

