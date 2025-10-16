#!/bin/bash

echo "🚀 Living Nexus Archive - Quick Start"
echo "====================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Build
echo "🔨 Building extension..."
npm run build
echo ""

# Package
echo "📦 Packaging extension..."
./package-extension.sh
echo ""

# Success message
echo "✅ Ready to install!"
echo ""
echo "Next steps:"
echo "1. Open Chrome and go to: chrome://extensions/"
echo "2. Enable 'Developer mode' (toggle in top right)"
echo "3. Click 'Load unpacked'"
echo "4. Select this folder: $(pwd)/package"
echo ""
echo "Or install the ZIP file: $(pwd)/living-nexus-archive-v1.0.0.zip"
echo ""
echo "📖 For detailed instructions, see TESTING_GUIDE.md"
echo ""
