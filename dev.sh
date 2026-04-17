#!/bin/bash

# AcreList Local Development Script
# Runs all four servers in a single terminal window via concurrently

echo "🚀 Starting AcreList Local Development Environment..."
echo ""
echo "  BACKEND      → http://localhost:3001"
echo "  ACRELIST     → http://localhost:3000"
echo "  PRODUCEHUNT  → http://localhost:3002"
echo "  MARKETING    → http://localhost:3004"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

cd "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
npm run dev:all
