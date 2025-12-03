#!/bin/bash

# Get ngrok public URL
echo "🔍 Getting ngrok URL..."
echo ""

# Try to get URL from ngrok API
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
    echo "✅ Ngrok is running!"
    echo ""
    echo "🌐 Public URL: $NGROK_URL"
    echo ""
    echo "📱 Update mobile/config.ts with:"
    echo "   export const API_BASE_URL = '$NGROK_URL';"
    echo ""
    echo "🔗 Or use this URL directly in your mobile app"
else
    echo "❌ Ngrok is not running or not accessible"
    echo ""
    echo "To start ngrok:"
    echo "  cd Lazy/backend"
    echo "  ./start-ngrok.sh"
    echo ""
    echo "Or manually:"
    echo "  ngrok http 8000"
fi

