# Quick Public URL Setup

## ✅ Easiest Option: LocalTunnel (No Signup!)

Since LocalTunnel is already installed, just run:

```bash
lt --port 8000
```

You'll get a public URL like: `https://random-name.loca.lt`

**Your API will be accessible at:**
- `https://random-name.loca.lt/docs` - Interactive API docs
- `https://random-name.loca.lt/health` - Health check
- `https://random-name.loca.lt/api/v1/process-voice-input` - Voice endpoint

## Alternative: ngrok (Requires Free Signup)

If you prefer ngrok:

1. **Sign up** (free): https://dashboard.ngrok.com/signup
2. **Get authtoken**: https://dashboard.ngrok.com/get-started/your-authtoken
3. **Configure**: `ngrok config add-authtoken YOUR_TOKEN`
4. **Start**: `ngrok http 8000`

## Current Local URLs

- **Local**: http://localhost:8000/docs
- **Network**: http://192.168.1.160:8000/docs (same Wi-Fi only)

