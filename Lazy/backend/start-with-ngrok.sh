#!/bin/bash

# Start Lazy API server and ngrok tunnel together

echo "🚀 Starting Lazy API with ngrok tunnel..."
echo ""

# Navigate to backend directory
cd "$(dirname "$0")"

# Check if server is already running
if lsof -ti:8000 > /dev/null 2>&1; then
    echo "✅ Server is already running on port 8000"
else
    echo "📦 Starting server..."
    source venv/bin/activate
    python main.py > /tmp/lazy-server.log 2>&1 &
    sleep 3
    echo "✅ Server started"
fi

# Check if ngrok is configured
if ! ngrok config check > /dev/null 2>&1; then
    echo ""
    echo "❌ ngrok is not configured"
    echo "   Run: ngrok config add-authtoken YOUR_TOKEN"
    echo "   Get token from: https://dashboard.ngrok.com/get-started/your-authtoken"
    exit 1
fi

# Stop any existing ngrok tunnels
pkill -f ngrok 2>/dev/null
sleep 1

echo ""
echo "🌐 Starting ngrok tunnel..."
echo "   Your public URL will appear below:"
echo ""

# Start ngrok
ngrok http 8000

