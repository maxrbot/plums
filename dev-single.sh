#!/bin/bash

# AcreList Local Development - Single Terminal
# Runs all 3 servers in one terminal window with colored output

echo "🚀 Starting AcreList Local Development (Single Terminal)..."
echo ""

# Check if concurrently is installed
if ! command -v concurrently &> /dev/null; then
    echo "📦 Installing concurrently..."
    npm install -g concurrently
fi

# Run all servers concurrently with colored output
concurrently \
  --names "BACKEND,PLATFORM,MARKETING" \
  --prefix-colors "blue,green,magenta" \
  "cd backend && npm run dev" \
  "npm run dev" \
  "cd marketing && npm run dev"

