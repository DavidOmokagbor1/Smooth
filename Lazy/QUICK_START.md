# 🚀 Quick Start Guide - Test Your Lazy App

Follow these steps to get everything running and test your app!

## Step 1: Start the Backend

```bash
cd Lazy/backend
source venv/bin/activate
python main.py
```

You should see:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Database connection initialized successfully
```

**Keep this terminal open!**

## Step 2: Get a Public URL (for Mobile Testing)

### Option A: Using ngrok (if you have it set up)
```bash
cd Lazy/backend
./start-ngrok.sh
```

Copy the URL (e.g., `https://abc123.ngrok-free.dev`)

### Option B: Quick Local Testing (iOS Simulator/Android Emulator)

For iOS Simulator, you can use `localhost` directly.
For Android Emulator, use `10.0.2.2` instead of `localhost`.

## Step 3: Update Mobile App Config

Edit `Lazy/mobile/config.ts`:

```typescript
export const API_BASE_URL = __DEV__
  ? 'http://localhost:8000'  // For iOS Simulator
  // ? 'http://10.0.2.2:8000'  // For Android Emulator
  // ? 'https://your-ngrok-url.ngrok-free.dev'  // For real device
  : 'https://your-production-api.com';
```

**For real device testing**, use your ngrok URL.

## Step 4: Start the Mobile App

```bash
cd Lazy/mobile
npm start
```

You'll see a QR code. Then:

- **iOS Simulator**: Press `i`
- **Android Emulator**: Press `a`  
- **Real Device**: Scan QR code with Expo Go app

## Step 5: Test the App!

1. **Grant Microphone Permission** when prompted
2. **Press and hold** the large microphone button
3. **Speak** something like: "I need to buy milk, pick up prescriptions, and I'm stressed about that email to Bob"
4. **Release** the button
5. **Watch** as tasks appear in the columns!

## Troubleshooting

### "Network Error" or "Connection Refused"
- ✅ Backend is running? Check Step 1
- ✅ Correct API URL? Check Step 3
- ✅ For real device, using ngrok URL? Not localhost!

### "Audio Permission Denied"
- Go to device Settings → Lazy → Microphone → Allow
- Restart the app

### "Tasks Not Appearing"
- Check backend terminal for errors
- Verify database is set up (should see "Database connection initialized")
- Check API endpoint: `http://localhost:8000/api/v1/tasks`

### Backend Not Starting
```bash
# Check if port 8000 is in use
lsof -i :8000

# Kill if needed
kill -9 <PID>

# Try again
python main.py
```

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Database connection successful
- [ ] Mobile app starts
- [ ] Microphone permission granted
- [ ] Voice recording works
- [ ] Tasks appear after recording
- [ ] Tasks are categorized correctly
- [ ] Can complete tasks by tapping

## Next Steps After Testing

Once everything works:
1. ✅ Test with different voice inputs
2. ✅ Try different personalities
3. ✅ Test task completion
4. ✅ Check tasks persist (restart app, tasks should still be there)

## Need Help?

Check the logs:
- **Backend**: Terminal where you ran `python main.py`
- **Mobile**: Expo DevTools (press `j` in Expo CLI)

Happy testing! 🎉

