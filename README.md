# Smooth - Unified Project Repository

This repository contains two main projects merged into a single unified backup:

## Projects

### 1. AIVoiceAssistant
**Location:** `AIVoiceAssistant/`

AI-Powered Voice-First Productivity Assistant - A modern web application that helps users with ADHD, bipolar disorder, and everyday stress to intelligently prioritize tasks through voice interaction.

**Original Repository:** [AIvoiceAssistsant](https://github.com/DavidOmokagbor1/AIvoiceAssistsant.git)

**Tech Stack:**
- Frontend: React + TypeScript + Vite
- Backend: Node.js/Express
- UI: Tailwind CSS with glassmorphism design

### 2. Lazy
**Location:** `Lazy/`

AI-Powered Executive Function Companion - A mobile-first application with FastAPI backend for voice-to-task processing and intelligent task management.

**Original Repository:** [Lazy](https://github.com/DavidOmokagbor1/Lazy.git)

**Tech Stack:**
- Mobile: React Native + Expo
- Backend: FastAPI (Python)
- AI: OpenAI Whisper + GPT-4o
- Database: SQLite (with Alembic migrations)

## Project Structure

```
Smooth/
├── AIVoiceAssistant/     # AI Voice Assistant Web App
│   ├── client/           # React frontend
│   ├── server/           # Node.js backend
│   └── shared/           # Shared types/schemas
│
├── Lazy/                 # Lazy AI Executive Function Companion
│   ├── mobile/           # React Native mobile app
│   └── backend/          # FastAPI backend
│
└── start.sh              # Helper script for AIVoiceAssistant
```

## Quick Start

### AIVoiceAssistant
```bash
cd AIVoiceAssistant
npm install
npm run dev
```

### Lazy Backend
```bash
cd Lazy/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

### Lazy Mobile
```bash
cd Lazy/mobile
npm install
npm start
```

## Notes

- This is a unified backup repository combining both projects
- Each project maintains its original structure and dependencies
- Both projects can be developed independently within this repository
- Original git history is preserved in the nested `.git` directories (if needed for reference)

## Repository Information

**Created:** Unified backup of AI Assistant and Lazy projects
**Purpose:** Single repository backup for both projects

