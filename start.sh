#!/bin/bash

# Navigate to the AIVoiceAssistant directory
cd "$(dirname "$0")/AIVoiceAssistant"

# Run the command passed as arguments
exec "$@"

