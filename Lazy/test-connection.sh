#!/bin/bash

# Complete connection test script

echo "🔍 Lazy App - Complete Connection Test"
echo "========================================"
echo ""

# Test 1: Backend
echo "1️⃣ Testing Backend (localhost)..."
BACKEND_STATUS=$(curl -s http://localhost:8000/health 2>&1)
if echo "$BACKEND_STATUS" | grep -q "healthy"; then
    echo "   ✅ Backend is running"
else
    echo "   ❌ Backend is NOT running"
    echo "   Response: $BACKEND_STATUS"
fi
echo ""

# Test 2: Ngrok
echo "2️⃣ Testing Ngrok..."
NGROK_PROCESS=$(ps aux | grep ngrok | grep -v grep | wc -l | tr -d ' ')
if [ "$NGROK_PROCESS" -gt 0 ]; then
    echo "   ✅ Ngrok is running ($NGROK_PROCESS process)"
else
    echo "   ❌ Ngrok is NOT running"
    echo "   Start with: cd backend && ./start-ngrok.sh"
fi
echo ""

# Test 3: Ngrok URL
echo "3️⃣ Testing Ngrok URL..."
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    tunnels = data.get('tunnels', [])
    if tunnels:
        for tunnel in tunnels:
            if tunnel.get('proto') == 'https':
                print(tunnel.get('public_url', ''))
                break
except:
    pass
" 2>/dev/null)

if [ -n "$NGROK_URL" ]; then
    echo "   ✅ Ngrok URL: $NGROK_URL"
    
    # Test the URL
    NGROK_TEST=$(curl -s -H "ngrok-skip-browser-warning: true" "$NGROK_URL/health" 2>&1)
    if echo "$NGROK_TEST" | grep -q "healthy"; then
        echo "   ✅ Ngrok URL is accessible"
    else
        echo "   ⚠️  Ngrok URL might have issues"
        echo "   Response: $NGROK_TEST"
    fi
else
    echo "   ❌ Could not get ngrok URL"
fi
echo ""

# Test 4: Database
echo "4️⃣ Testing Database..."
if [ -f "backend/lazy.db" ]; then
    DB_SIZE=$(ls -lh backend/lazy.db | awk '{print $5}')
    echo "   ✅ Database exists ($DB_SIZE)"
    
    TASK_COUNT=$(sqlite3 backend/lazy.db "SELECT COUNT(*) FROM tasks;" 2>/dev/null || echo "0")
    echo "   📊 Tasks in database: $TASK_COUNT"
else
    echo "   ❌ Database file not found"
fi
echo ""

# Test 5: Config
echo "5️⃣ Checking Mobile Config..."
if [ -f "mobile/config.ts" ]; then
    if grep -q "USE_NGROK_FOR_ALL = true" mobile/config.ts; then
        echo "   ✅ Config set to use ngrok"
    else
        echo "   ⚠️  Config might not be using ngrok"
    fi
    
    NGROK_IN_CONFIG=$(grep -o "https://[^']*ngrok[^']*" mobile/config.ts | head -1)
    if [ -n "$NGROK_IN_CONFIG" ]; then
        echo "   ✅ Ngrok URL in config: $NGROK_IN_CONFIG"
    fi
else
    echo "   ❌ Config file not found"
fi
echo ""

# Summary
echo "═══════════════════════════════════════"
echo "📋 Summary:"
echo ""

if echo "$BACKEND_STATUS" | grep -q "healthy" && [ "$NGROK_PROCESS" -gt 0 ] && [ -n "$NGROK_URL" ]; then
    echo "✅ Everything looks good!"
    echo ""
    echo "🚀 Next Steps:"
    echo "   1. Restart your mobile app"
    echo "   2. Check console for API URL"
    echo "   3. Test voice input"
else
    echo "⚠️  Some issues detected. Fix the items marked with ❌ above."
fi
echo ""

