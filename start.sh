#!/bin/bash

# DataTracker V2 - Startup Script
# Startet Backend und Frontend gleichzeitig

echo "🚀 Starting DataTracker V2..."
echo ""

# Farben für bessere Ausgabe
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Backend starten
echo -e "${BLUE}📦 Starting Backend (Port 8000)...${NC}"
cd /home/lukas/VS-Code/DataTracker_V2/backend
pkill -f "uvicorn" 2>/dev/null
nohup uvicorn main:app --reload --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
echo ""

# Warten, damit Backend Zeit hat zu starten
sleep 2

# Frontend starten
echo -e "${BLUE}🎨 Starting Frontend (Port 5173/5174)...${NC}"
cd /home/lukas/VS-Code/DataTracker_V2/frontend
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
echo ""

# Zusammenfassung
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ DataTracker V2 is now running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Frontend: http://localhost:5173 (or 5174)"
echo "🔧 Backend:  http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Warten auf Ctrl+C
wait
