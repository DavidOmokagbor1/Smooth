# 🚀 Quick Commands Reference

## Mobile App

### Start Mobile App
```bash
cd Lazy/mobile
npm start
```

Or use the helper script:
```bash
cd Lazy
./mobile/start-mobile.sh
```

## Backend

### Start Backend
```bash
cd Lazy/backend
source venv/bin/activate
python main.py
```

### Check Backend Status
```bash
curl http://localhost:8000/health
```

## Ngrok

### Start Ngrok
```bash
cd Lazy/backend
./start-ngrok.sh
```

### Get Ngrok URL
```bash
cd Lazy/backend
./get-ngrok-url.sh
```

### Restart Ngrok
```bash
cd Lazy/backend
./restart-ngrok.sh
```

## Common Issues

### "npm error: Could not read package.json"
**Solution**: You're in the wrong directory!
```bash
cd Lazy/mobile
npm start
```

### "Module not found"
**Solution**: Install dependencies
```bash
cd Lazy/mobile
npm install
```

### "Backend not running"
**Solution**: Start the backend first
```bash
cd Lazy/backend
source venv/bin/activate
python main.py
```

## 📁 Directory Structure

```
Smooth/
├── Lazy/
│   ├── mobile/          ← Mobile app (npm start here)
│   └── backend/         ← Backend API (python main.py here)
└── AIVoiceAssistant/    ← Different project
```

## 🎯 Quick Start (Full Stack)

**Terminal 1 - Backend:**
```bash
cd Lazy/backend
source venv/bin/activate
python main.py
```

**Terminal 2 - Ngrok (for real device):**
```bash
cd Lazy/backend
./start-ngrok.sh
```

**Terminal 3 - Mobile App:**
```bash
cd Lazy/mobile
npm start
```

Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code for real device

