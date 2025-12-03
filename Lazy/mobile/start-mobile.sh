#!/bin/bash

# Quick script to start the mobile app from anywhere

cd "$(dirname "$0")" || exit 1

echo "🚀 Starting Lazy Mobile App..."
echo "📱 Location: $(pwd)"
echo ""

npm start

