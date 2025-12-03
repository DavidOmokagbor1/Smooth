# 📱 Real Device Setup Guide

## ✅ Ngrok is Running!

**Your ngrok URL**: `https://delinda-pseudohermaphroditic-naomi.ngrok-free.dev`

## 🔧 Quick Setup for Real Device

### Option 1: Quick Fix (Recommended)

Edit `mobile/config.ts` and change the return statement for your platform:

**For iOS Real Device:**
```typescript
if (Platform.OS === 'ios') {
  return 'https://delinda-pseudohermaphroditic-naomi.ngrok-free.dev'; // Real device
  // return 'http://localhost:8000'; // Simulator
}
```

**For Android Real Device:**
```typescript
if (Platform.OS === 'android') {
  return 'https://delinda-pseudohermaphroditic-naomi.ngrok-free.dev'; // Real device
  // return 'http://10.0.2.2:8000'; // Emulator
}
```

### Option 2: Use Environment Detection

The config now has a `NGROK_URL` constant at the top. You can:
1. Uncomment the ngrok line for your platform
2. Comment out the localhost/emulator line

## 🧪 Test the Connection

1. **Make sure ngrok is running**:
   ```bash
   cd Lazy/backend
   ./get-ngrok-url.sh
   ```

2. **Test the ngrok URL**:
   ```bash
   curl https://delinda-pseudohermaphroditic-naomi.ngrok-free.dev/health
   ```
   Should return: `{"status":"healthy","service":"Lazy API"}`

3. **Start mobile app**:
   ```bash
   cd Lazy/mobile
   npm start
   ```

4. **Scan QR code** with Expo Go on your phone

5. **Test voice input** - it should work now! 🎉

## 🔄 If Ngrok URL Changes

If you restart ngrok and get a new URL:

1. **Get new URL**:
   ```bash
   cd Lazy/backend
   ./get-ngrok-url.sh
   ```

2. **Update config.ts**:
   - Replace the old ngrok URL with the new one
   - Or update the `NGROK_URL` constant

3. **Restart mobile app**

## ✅ Current Status

- ✅ Ngrok running: `https://delinda-pseudohermaphroditic-naomi.ngrok-free.dev`
- ✅ Backend accessible via ngrok
- ✅ Mobile config ready (just need to switch to ngrok URL for real device)

## 🎯 Next Step

**Edit `mobile/config.ts`** and switch to ngrok URL for real device testing!

Then restart your mobile app and test voice input. The connection error should be gone! 🚀

