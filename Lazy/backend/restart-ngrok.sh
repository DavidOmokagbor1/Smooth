#!/bin/bash

# Restart ngrok tunnel cleanly

echo "🔄 Restarting ngrok tunnel..."

# Stop any existing ngrok processes
pkill -f "ngrok http" 2>/dev/null
sleep 2

# Check if server is running
if ! lsof -ti:8000 > /dev/null 2>&1; then
    echo "❌ Server is not running on port 8000"
    echo "   Starting server..."
    cd "$(dirname "$0")"
    source venv/bin/activate
    python main.py > /tmp/lazy-server.log 2>&1 &
    sleep 3
fi

echo "✅ Server is running"
echo ""
echo "🌐 Starting fresh ngrok tunnel..."
echo "   Your new public URL will appear below:"
echo ""

# Start ngrok
ngrok http 8000

