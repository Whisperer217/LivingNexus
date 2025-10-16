#!/bin/bash

# Living Nexus Archive - Extension Packager
# Prepares the extension for Chrome Web Store or local installation

echo "📦 Packaging Living Nexus Archive Extension..."

# Create package directory
rm -rf package
mkdir -p package

# Copy manifest
echo "  ✓ Copying manifest.json"
cp manifest.json package/

# Copy built JavaScript files
echo "  ✓ Copying built files"
cp -r dist/src package/

# Copy popup files
echo "  ✓ Copying popup UI"
cp popup.html package/
cp popup.js package/

# Copy icons
echo "  ✓ Copying icons"
cp -r public package/

# Create README for package
cat > package/README.txt << 'EOF'
Living Nexus Archive - AI Conversation Logger
==============================================

Installation Instructions:
1. Open Chrome and go to chrome://extensions/
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select this folder

Usage:
1. Click the extension icon to open the dashboard
2. Visit ChatGPT, Claude, Gemini, or Perplexity
3. Have conversations - they'll be automatically saved!
4. View saved conversations in the extension popup
5. Find markdown files in Downloads/LivingNexusArchive/AI_Conversations/

Features:
- Automatic conversation logging
- Markdown export
- Auto-tagging
- Search functionality
- Privacy-first (all data stored locally)

For more information:
https://github.com/Whisperer217/LivingNexus
EOF

# Create zip for Chrome Web Store
echo "  ✓ Creating ZIP archive"
cd package
zip -r ../living-nexus-archive-v1.0.0.zip . > /dev/null
cd ..

echo ""
echo "✅ Extension packaged successfully!"
echo ""
echo "📁 Package directory: ./package/"
echo "📦 ZIP file: ./living-nexus-archive-v1.0.0.zip"
echo ""
echo "To install:"
echo "1. Open Chrome → chrome://extensions/"
echo "2. Enable 'Developer mode'"
echo "3. Click 'Load unpacked'"
echo "4. Select the './package' folder"
echo ""

