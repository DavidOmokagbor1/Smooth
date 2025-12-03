# ngrok Setup Guide

## Quick Setup (2 minutes)

### Step 1: Sign up for free ngrok account
1. Go to: https://dashboard.ngrok.com/signup
2. Sign up (free account is fine)
3. Verify your email

### Step 2: Get your authtoken
1. After signing up, go to: https://dashboard.ngrok.com/get-started/your-authtoken
2. Copy your authtoken (looks like: `2abc123def456ghi789jkl012mno345pq_6r7s8t9u0v1w2x3y4z5`)

### Step 3: Configure ngrok
Run this command (replace with your actual token):
```bash
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

### Step 4: Start the tunnel
```bash
ngrok http 8000
```

You'll get a public URL like: `https://abc123.ngrok-free.app`

## Alternative: Use LocalTunnel (No signup required)

If you don't want to sign up for ngrok, you can use LocalTunnel instead:

```bash
# Install LocalTunnel
npm install -g localtunnel

# Start tunnel
lt --port 8000
```

This will give you a URL like: `https://random-name.loca.lt`

