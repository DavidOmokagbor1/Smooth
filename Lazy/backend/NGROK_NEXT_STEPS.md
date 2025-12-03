# ngrok Setup - Next Steps

## Step 1: Get Your Authtoken

1. Go to: https://dashboard.ngrok.com/get-started/your-authtoken
2. You'll see your authtoken (looks like: `2abc123def456ghi789jkl012mno345pq_6r7s8t9u0v1w2x3y4z5`)
3. **Copy it** - you'll need it in the next step

## Step 2: Configure ngrok

Run this command (replace `YOUR_AUTHTOKEN` with the token you copied):

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN
```

## Step 3: Start the Tunnel

```bash
ngrok http 8000
```

## Step 4: Get Your Public URL

You'll see output like:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:8000
```

**Your public URL will be**: `https://abc123.ngrok-free.app`

## Step 5: Access Your API

- **API Docs**: `https://abc123.ngrok-free.app/docs`
- **Health Check**: `https://abc123.ngrok-free.app/health`
- **Voice Endpoint**: `https://abc123.ngrok-free.app/api/v1/process-voice-input`

## Quick Command Reference

```bash
# Configure (one time only)
ngrok config add-authtoken YOUR_TOKEN

# Start tunnel
ngrok http 8000

# Stop tunnel
# Press Ctrl+C in the terminal
```

