# Testing Guide - Lazy Mobile App

## Quick Test (5 minutes)

### 1. Verify Backend is Running

```bash
# Check if backend is running
curl http://localhost:8000/health

# Should return: {"status":"healthy","service":"Lazy API"}
```

### 2. Test API Endpoints

```bash
# Test tasks endpoint
curl http://localhost:8000/api/v1/tasks

# Should return: [] (empty array if no tasks)
```

### 3. Start Mobile App

```bash
cd mobile
npm start
```

### 4. Choose Your Testing Method

#### Option A: iOS Simulator (Easiest)
- Press `i` when Expo starts
- Uses `localhost` automatically
- No ngrok needed!

#### Option B: Android Emulator
- Press `a` when Expo starts
- Update `config.ts`: Change `localhost` to `10.0.2.2`
- No ngrok needed!

#### Option C: Real Device (Phone)
1. Start ngrok:
   ```bash
   cd ../backend
   ./start-ngrok.sh
   ```
2. Copy the ngrok URL (e.g., `https://abc123.ngrok-free.dev`)
3. Update `mobile/config.ts`:
   ```typescript
   export const API_BASE_URL = 'https://abc123.ngrok-free.dev';
   ```
4. Restart Expo (`npm start`)
5. Scan QR code with Expo Go app

## Testing Checklist

### ✅ Basic Functionality

- [ ] App opens without errors
- [ ] Header displays correctly
- [ ] Personality selector works (can switch between Zen/Friend/Coach)
- [ ] Voice button is visible
- [ ] Text input field is visible

### ✅ Voice Recording

- [ ] Microphone permission prompt appears
- [ ] Can press and hold voice button
- [ ] Recording indicator shows (button changes)
- [ ] Can release to stop recording
- [ ] "Processing..." message appears
- [ ] No errors in console

### ✅ API Integration

- [ ] Tasks appear after voice input
- [ ] Tasks are categorized correctly:
  - Critical/High → "Do Now"
  - Medium → "Do Later"
  - Low → "Optional"
- [ ] AI companion suggestion appears
- [ ] Can tap tasks to complete them
- [ ] Completed tasks update correctly

### ✅ Error Handling

- [ ] Network error shows alert (if backend is off)
- [ ] Invalid audio shows error message
- [ ] App doesn't crash on errors

## Common Issues & Fixes

### Issue: "Network Error"
**Fix:**
- Check backend is running: `curl http://localhost:8000/health`
- For real device: Use ngrok URL, not localhost
- Check `config.ts` has correct URL

### Issue: "Audio Permission Denied"
**Fix:**
- iOS: Settings → Lazy → Microphone → Allow
- Android: Settings → Apps → Lazy → Permissions → Microphone
- Restart app after granting permission

### Issue: "Tasks Not Appearing"
**Fix:**
- Check backend logs for errors
- Verify database is set up: `ls backend/lazy.db`
- Test API directly: `curl http://localhost:8000/api/v1/tasks`
- Check mobile console for API errors

### Issue: "Expo Won't Start"
**Fix:**
```bash
# Clear cache
npm start -- --clear

# Or reinstall
rm -rf node_modules
npm install
npm start
```

## Test Voice Inputs

Try these test phrases:

1. **Simple tasks:**
   "I need to buy milk and pick up prescriptions"

2. **With urgency:**
   "I have an urgent meeting at 2pm today, and I need to call my boss ASAP"

3. **Mixed priorities:**
   "I should probably meal prep this week, and I have a doctor's appointment tomorrow, and maybe I'll clean the garage if I have time"

4. **With emotions:**
   "I'm really stressed about that email to Bob, and I'm tired, but I need to finish the project by Friday"

## Expected Results

After each voice input:
- ✅ Transcript appears in backend logs
- ✅ Tasks extracted and categorized
- ✅ Tasks appear in correct columns
- ✅ AI suggestion is empathetic and helpful
- ✅ Tasks saved to database (persist after restart)

## Debug Mode

Enable debug logging:

1. Open Expo DevTools (press `j` in terminal)
2. Check Console tab for errors
3. Check Network tab for API calls
4. Check backend terminal for server logs

## Performance Testing

- Record 30-second voice input
- Check processing time (should be < 10 seconds)
- Test with multiple rapid inputs
- Test with very long voice input (2+ minutes)

## Next Steps After Testing

Once everything works:
1. ✅ Test all three personalities
2. ✅ Test task completion
3. ✅ Test task persistence (restart app)
4. ✅ Test error scenarios
5. ✅ Test on different devices

Happy testing! 🎉

