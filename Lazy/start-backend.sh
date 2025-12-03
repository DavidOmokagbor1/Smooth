#!/bin/bash

# Helper script to start Lazy backend
# Handles the path with spaces correctly

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"

echo "🚀 Starting Lazy Backend..."
echo "📁 Backend directory: $BACKEND_DIR"

cd "$BACKEND_DIR" || exit 1

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "📥 Installing dependencies..."
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Run the server
echo "✅ Starting FastAPI server..."
echo "🌐 API will be available at: http://localhost:8000"
echo "📚 Interactive docs: http://localhost:8000/docs"
echo ""
python main.py

