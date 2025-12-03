#!/bin/bash

echo "🌐 Getting Public URL for Lazy API"
echo ""

# Check if server is running
if ! lsof -ti:8000 > /dev/null 2>&1; then
    echo "❌ Server is not running on port 8000"
    echo "   Start it first: python main.py"
    exit 1
fi

echo "✅ Server is running"
echo ""

# Try ngrok first (if authenticated)
if ngrok config check > /dev/null 2>&1; then
    echo "🚀 Starting ngrok..."
    ngrok http 8000
    exit 0
fi

# Try cloudflared
if command -v cloudflared > /dev/null 2>&1; then
    echo "🚀 Starting Cloudflare Tunnel..."
    cloudflared tunnel --url http://localhost:8000
    exit 0
fi

# Fallback: Show network URL
echo "📡 Public tunnel services not available"
echo ""
echo "Your API is accessible on your local network at:"
echo "   http://192.168.1.160:8000/docs"
echo ""
echo "To get a public URL, choose one:"
echo ""
echo "1. ngrok (recommended):"
echo "   - Sign up: https://dashboard.ngrok.com/signup"
echo "   - Get token: https://dashboard.ngrok.com/get-started/your-authtoken"
echo "   - Run: ngrok config add-authtoken YOUR_TOKEN"
echo ""
echo "2. Cloudflare Tunnel:"
echo "   - Install: brew install cloudflared"
echo "   - Run: cloudflared tunnel --url http://localhost:8000"
echo ""
echo "3. Deploy to free hosting:"
echo "   - Render.com, Railway.app, or Fly.io"

