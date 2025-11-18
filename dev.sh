#!/bin/bash

# AcreList Local Development Script
# This script starts all three servers in separate terminal tabs

echo "🚀 Starting AcreList Local Development Environment..."
echo ""
echo "This will open 3 terminal tabs:"
echo "  1. Backend API (port 3001)"
echo "  2. Platform App (port 3000)"
echo "  3. Marketing Site (port 3002)"
echo ""

# Get the project directory
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Open new terminal tabs and run commands
osascript <<EOF
tell application "Terminal"
    -- Backend
    do script "cd '$PROJECT_DIR/backend' && echo '🔧 Starting Backend API on http://localhost:3001' && npm run dev"
    
    -- Wait a bit for backend to start
    delay 2
    
    -- Platform App
    do script "cd '$PROJECT_DIR' && echo '💻 Starting Platform App on http://localhost:3000' && npm run dev"
    
    -- Marketing Site
    do script "cd '$PROJECT_DIR/marketing' && echo '🌐 Starting Marketing Site on http://localhost:3002' && npm run dev"
    
    activate
end tell
EOF

echo "✅ All servers starting in separate terminal tabs!"
echo ""
echo "Access your local environment:"
echo "  • Backend API:    http://localhost:3001"
echo "  • Platform App:   http://localhost:3000"
echo "  • Marketing Site: http://localhost:3002"
echo ""
echo "To stop servers: Close the terminal tabs or press Ctrl+C in each"

