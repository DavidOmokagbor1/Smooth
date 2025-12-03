# 📱 How to Start Mobile App (Visible in Terminal)

## Method 1: Direct Command (Recommended)

Open a **new terminal window** and run:

```bash
cd "/Volumes/2-2-22/BEATZBYJAVA PRODUCTIONS WEB/Smooth/Lazy/mobile"
npm start
```

This will show the Expo interface in your terminal.

## Method 2: Using Helper Script

```bash
cd "/Volumes/2-2-22/BEATZBYJAVA PRODUCTIONS WEB/Smooth/Lazy"
./mobile/start-mobile.sh
```

## What You Should See

After running `npm start`, you should see:

1. **Expo starting up** with loading messages
2. **QR code** displayed in terminal
3. **Options menu**:
   - Press `i` to open iOS simulator
   - Press `a` to open Android emulator
   - Press `w` to open in web browser
   - Scan QR code with Expo Go app

## If You Don't See Anything

1. **Make sure you're in the right directory**:
   ```bash
   cd Lazy/mobile
   pwd  # Should show: .../Lazy/mobile
   ```

2. **Check if package.json exists**:
   ```bash
   ls package.json
   ```

3. **Install dependencies if needed**:
   ```bash
   npm install
   ```

4. **Try clearing cache**:
   ```bash
   npm start -- --clear
   ```

## Troubleshooting

### "Command not found: npm"
- Install Node.js: https://nodejs.org/

### "Module not found"
- Run: `npm install`

### "Port already in use"
- Kill existing process: `pkill -f expo`
- Or use different port: `npm start -- --port 8082`

### Still no output?
- Make sure you're running it in a **new terminal window**
- Don't run it in background (remove `&` if you added it)
- Check for errors in the terminal

## Quick Start

**Just run this in a new terminal:**
```bash
cd "/Volumes/2-2-22/BEATZBYJAVA PRODUCTIONS WEB/Smooth/Lazy/mobile" && npm start
```

You should see the Expo interface appear! 🚀

