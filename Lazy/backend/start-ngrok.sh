#!/bin/bash

# Start ngrok tunnel for Lazy API
echo "🌐 Starting ngrok tunnel..."
echo "📡 Your API will be accessible via a public URL"
echo ""

# Kill any existing ngrok processes
pkill -f ngrok 2>/dev/null
sleep 1

# Start ngrok
ngrok http 8000

