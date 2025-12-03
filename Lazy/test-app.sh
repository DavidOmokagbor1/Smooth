#!/bin/bash

# Quick test script for Lazy app
# This helps you test the full stack

echo "🚀 Lazy App - Quick Test Setup"
echo "================================"
echo ""

# Check if backend is running
if lsof -i :8000 > /dev/null 2>&1; then
    echo "✅ Backend is running on port 8000"
else
    echo "⚠️  Backend is NOT running"
    echo "   Starting backend..."
    cd backend
    source venv/bin/activate
    python main.py &
    sleep 3
    cd ..
fi

# Check database
if [ -f "backend/lazy.db" ]; then
    echo "✅ Database file exists"
else
    echo "⚠️  Database file not found"
    echo "   Run: cd backend && alembic upgrade head"
fi

# Check mobile app
if [ -d "mobile" ] && [ -f "mobile/package.json" ]; then
    echo "✅ Mobile app found"
else
    echo "❌ Mobile app not found"
    exit 1
fi

echo ""
echo "📱 Next Steps:"
echo "1. For iOS Simulator: cd mobile && npm start (then press 'i')"
echo "2. For Android Emulator: cd mobile && npm start (then press 'a')"
echo "3. For Real Device:"
echo "   a. Start ngrok: cd backend && ./start-ngrok.sh"
echo "   b. Copy the ngrok URL"
echo "   c. Update mobile/config.ts with the ngrok URL"
echo "   d. cd mobile && npm start"
echo "   e. Scan QR code with Expo Go app"
echo ""
echo "🧪 Test the API:"
echo "   curl http://localhost:8000/health"
echo ""

