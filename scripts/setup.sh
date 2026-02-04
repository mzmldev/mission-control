#!/bin/bash
# Mission Control Setup Script
# Run this after cloning the repo to set up the full system

set -e

echo "🚀 Setting up Mission Control..."

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

if ! command -v openclaw &> /dev/null; then
    echo "⚠️  OpenClaw CLI not found. Install with: npm install -g openclaw"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install pm2 globally if not present
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing pm2 globally..."
    npm install -g pm2
fi

# Check for Convex setup
echo ""
echo "🔧 Convex Setup"
echo "---------------"
echo "1. Make sure you have a Convex account: https://convex.dev"
echo "2. Run: npx convex dev"
echo "3. Copy the Convex URL to .env.local:"
echo "   NEXT_PUBLIC_CONVEX_URL='your-convex-url'"
echo ""

# Seed agents
echo "🌱 Would you like to seed the agents now? (y/n)"
read -r SEED_AGENTS

if [ "$SEED_AGENTS" = "y" ]; then
    echo "🌱 Seeding agents..."
    npx convex run seed:seedAgents
fi

# Setup daemon
echo ""
echo "🔔 Notification Daemon Setup"
echo "----------------------------"
echo "Would you like to start the notification daemon? (y/n)"
read -r START_DAEMON

if [ "$START_DAEMON" = "y" ]; then
    echo "🔔 Starting notification daemon..."
    npm run daemon:start
    echo "✅ Daemon started. View logs with: npm run daemon:logs"
fi

# Setup daily standup
echo ""
echo "📊 Daily Standup Setup"
echo "---------------------"
echo "Add this to your crontab for daily standups at 6 PM:"
echo ""
echo "0 18 * * * cd $(pwd) && npm run standup"
echo ""

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the dev server: npm run dev"
echo "2. Open http://localhost:3000"
echo "3. Start the notification daemon: npm run daemon:start"
echo ""
echo "Useful commands:"
echo "  npm run seed          # Seed agents"
echo "  npm run daemon:start  # Start notification daemon"
echo "  npm run daemon:logs   # View daemon logs"
echo "  npm run standup       # Generate daily standup"
echo ""
