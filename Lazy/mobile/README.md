# Lazy Mobile App

React Native mobile app for the Lazy AI-powered executive function companion.

## Features

- 🎤 **Voice-First Input**: Record audio and get AI-processed tasks
- 🧠 **AI Personalities**: Choose between Zen Master, Best Friend, or Coach
- 📋 **Smart Task Management**: Tasks automatically categorized (Do Now, Do Later, Optional)
- 💜 **Emotion-Aware**: AI adjusts suggestions based on your emotional state
- 🎨 **Beautiful Dark UI**: Modern, accessible design

## Setup

1. **Install dependencies**:
   ```bash
   cd mobile
   npm install
   ```

2. **Configure API URL**:
   Edit `config.ts` and set your backend API URL:
   ```typescript
   export const API_BASE_URL = 'http://your-ngrok-url.ngrok.io';
   ```

3. **Start the app**:
   ```bash
   npm start
   ```

   Then:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## Project Structure

```
mobile/
├── App.tsx                 # Main app component
├── components/            # UI components
│   ├── Header.tsx
│   ├── PersonalitySelector.tsx
│   ├── VoiceInputButton.tsx
│   ├── TaskColumn.tsx
│   ├── TaskCard.tsx
│   └── AIResponse.tsx
├── services/
│   └── api.ts             # API service layer
├── types.ts               # TypeScript types
└── config.ts              # App configuration
```

## Connecting to Backend

The app connects to the FastAPI backend. Make sure:

1. Backend is running on `http://localhost:8000`
2. For mobile testing, use ngrok or similar to expose your local server
3. Update `API_BASE_URL` in `config.ts` with your public URL

## Development

- **TypeScript**: Full type safety
- **Expo**: Cross-platform development
- **React Native**: Native mobile experience

## Next Steps

- [ ] Add text input processing (send text directly to GPT-4o)
- [ ] Add task editing
- [ ] Add task deletion
- [ ] Add user authentication
- [ ] Add offline support
- [ ] Add push notifications

