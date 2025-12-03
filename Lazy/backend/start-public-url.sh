#!/bin/bash

# Script to get a public URL for your Lazy API
# Options: ngrok (requires signup) or localtunnel (no signup)

echo "🌐 Getting Public URL for Lazy API"
echo ""

# Check if ngrok is authenticated
if ngrok config check > /dev/null 2>&1; then
    echo "✅ Using ngrok..."
    ngrok http 8000
elif command -v lt > /dev/null 2>&1; then
    echo "✅ Using LocalTunnel (no signup required)..."
    lt --port 8000
else
    echo "❌ Neither ngrok nor localtunnel is available"
    echo ""
    echo "Option 1: Set up ngrok (free, 2 min):"
    echo "  1. Sign up: https://dashboard.ngrok.com/signup"
    echo "  2. Get token: https://dashboard.ngrok.com/get-started/your-authtoken"
    echo "  3. Run: ngrok config add-authtoken YOUR_TOKEN"
    echo ""
    echo "Option 2: Install LocalTunnel (no signup):"
    echo "  npm install -g localtunnel"
    echo "  lt --port 8000"
    echo ""
    echo "Option 3: Use local network URL:"
    echo "  http://192.168.1.160:8000/docs"
fi

