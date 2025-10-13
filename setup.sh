#!/bin/bash

echo "🚀 AGENT.FUN Setup Script"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${BLUE}Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 20+ first.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18 or higher. Current: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"

# Install dependencies
echo ""
echo -e "${BLUE}Installing dependencies...${NC}"

echo "📦 Backend..."
cd backend && npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi

echo "📦 Frontend..."
cd ../frontend && npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi

echo "📦 Executor..."
cd ../executor && npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Executor dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install executor dependencies${NC}"
    exit 1
fi

cd ..

# Setup environment files
echo ""
echo -e "${BLUE}Setting up environment files...${NC}"

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✅ Created backend/.env${NC}"
    echo -e "${BLUE}⚠️  Please edit backend/.env with your configuration${NC}"
else
    echo -e "${BLUE}ℹ️  backend/.env already exists${NC}"
fi

if [ ! -f frontend/.env.local ]; then
    cp frontend/.env.local.example frontend/.env.local
    echo -e "${GREEN}✅ Created frontend/.env.local${NC}"
else
    echo -e "${BLUE}ℹ️  frontend/.env.local already exists${NC}"
fi

if [ ! -f executor/.env ]; then
    cp executor/.env.example executor/.env
    echo -e "${GREEN}✅ Created executor/.env${NC}"
    echo -e "${BLUE}⚠️  Please add your GEMINI_API_KEY to executor/.env${NC}"
    echo -e "${BLUE}ℹ️  Get FREE key at: https://makersuite.google.com/app/apikey${NC}"
else
    echo -e "${BLUE}ℹ️  executor/.env already exists${NC}"
fi

# Create .keys directory
mkdir -p backend/.keys
echo -e "${GREEN}✅ Created backend/.keys directory${NC}"

# Done
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Setup complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Edit environment files:"
echo "   - backend/.env"
echo "   - frontend/.env.local"
echo "   - executor/.env (add GEMINI_API_KEY)"
echo ""
echo "   Get FREE Gemini API Key: https://makersuite.google.com/app/apikey"
echo ""
echo "2. Start development servers:"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd frontend && npm run dev"
echo "   Terminal 3: cd executor && npm run dev"
echo ""
echo "3. Visit http://localhost:3000"
echo ""
echo "📚 Read QUICKSTART.md for detailed instructions"
echo ""
