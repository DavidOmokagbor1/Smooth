# 🔧 Connection Error Troubleshooting

## ✅ FIXED: Config Updated!

I've updated `config.ts` to use ngrok by default for real devices.

### What Changed

1. **Added `USE_NGROK_FOR_ALL` flag** - Easy to switch between simulator and real device
2. **Better error messages** - More helpful connection error details
3. **Debug logging** - Shows API URL in console

## 🚀 Quick Fix

**Just restart your Expo app:**

1. **Stop the app** (shake device → Stop, or Ctrl+C in terminal)
2. **Reload** (shake device → Reload, or press `r` in Expo terminal)
3. **Check console** - You should see the API URL logged

## 🧪 Verify Connection

### Check 1: Ngrok is Running
```bash
cd Lazy/backend
./get-ngrok-url.sh
```

### Check 2: Backend is Accessible
```bash
curl https://delinda-pseudohermaphroditic-naomi.ngrok-free.dev/health
# Should return: {"status":"healthy","service":"Lazy API"}
```

### Check 3: Check Console Logs
In Expo, check the console for:
```
🔗 API Configuration:
   Base URL: https://delinda-pseudohermaphroditic-naomi.ngrok-free.dev
   Platform: ios (or android)
   Using Ngrok: true
```

## 🔄 If Still Getting Error

### Step 1: Verify Config
Open `mobile/config.ts` and check:
- `USE_NGROK_FOR_ALL = true` (for real device)
- `NGROK_URL` is correct

### Step 2: Restart Everything
```bash
# Terminal 1: Restart backend
cd Lazy/backend
# Stop current (Ctrl+C)
source venv/bin/activate
python main.py

# Terminal 2: Restart ngrok
cd Lazy/backend
./restart-ngrok.sh

# Terminal 3: Restart mobile app
cd Lazy/mobile
# Stop current (Ctrl+C)
npm start
```

### Step 3: Check Network
- Make sure phone and computer are on same WiFi
- Try accessing ngrok URL in phone's browser
- Check if firewall is blocking connections

### Step 4: Check Expo Console
- Open Expo DevTools (press `j` in terminal)
- Check Console tab for errors
- Check Network tab for failed requests

## 🎯 Expected Behavior

After restart:
- ✅ No connection error banner
- ✅ Console shows correct API URL
- ✅ Voice input works
- ✅ Tasks load successfully

## 📱 Testing Checklist

- [ ] Ngrok is running
- [ ] Backend is running
- [ ] Config uses ngrok URL
- [ ] App restarted/reloaded
- [ ] Console shows correct URL
- [ ] No connection error
- [ ] Voice input works

## 💡 Pro Tips

1. **Always check console first** - The API URL is logged there
2. **Use Expo DevTools** - Press `j` to see network requests
3. **Test ngrok URL in browser** - Verify it works before testing in app
4. **Restart after config changes** - Config changes require app restart

## ✅ Current Setup

- ✅ Ngrok URL: `https://delinda-pseudohermaphroditic-naomi.ngrok-free.dev`
- ✅ Config set to use ngrok
- ✅ Better error messages
- ✅ Debug logging enabled

**Restart your app and it should work!** 🚀

