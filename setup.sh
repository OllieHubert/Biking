#!/bin/bash

echo "🚴‍♂️ Setting up Biking Route Generator App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "✅ .env file created. You can edit it to add API keys if needed."
fi

# Test the route generation
echo "🧪 Testing route generation..."
node test-route.js

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To run the web app:"
echo "  npm start"
echo ""
echo "To run the mobile app:"
echo "  npm run mobile"
echo ""
echo "To test the Harvey Mudd College example:"
echo "  1. Open http://localhost:3000"
echo "  2. Enter: Distance: 30, Elevation: 5000, Activity: Biking"
echo "  3. Use current location or enter 'Harvey Mudd College, Claremont, CA'"
echo ""
