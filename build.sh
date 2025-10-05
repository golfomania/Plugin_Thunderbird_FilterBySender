#!/bin/bash
# Build script for Filter by sender Thunderbird Extension

echo "Building Filter by sender extension..."

# Check if icons exist, generate if not
if [ ! -f "icon-16.png" ] || [ ! -f "icon-32.png" ] || [ ! -f "icon-48.png" ] || [ ! -f "icon-64.png" ] || [ ! -f "icon-128.png" ]; then
    echo "Generating icons..."
    if command -v python3 &> /dev/null; then
        pip3 install Pillow --quiet 2>/dev/null || pip3 install Pillow
        python3 generate_icons.py
    else
        echo "Warning: Python3 not found. Please generate icons manually."
    fi
fi

# Remove old build if exists
if [ -f "filter-by-sender.xpi" ]; then
    echo "Removing old build..."
    rm filter-by-sender.xpi
fi

# Create the XPI package
echo "Creating XPI package..."
zip -r filter-by-sender.xpi \
    manifest.json \
    background.js \
    icon-*.png \
    -x "*.py" "*.md" "*.sh" ".git/*" "*.xpi" ".gitignore" \
    > /dev/null 2>&1

if [ -f "filter-by-sender.xpi" ]; then
    echo "✓ Build successful: filter-by-sender.xpi"
    echo ""
    echo "To install in Thunderbird:"
    echo "1. Open Thunderbird"
    echo "2. Go to Menu (≡) → Add-ons and Themes"
    echo "3. Click the gear icon (⚙) → Install Add-on From File..."
    echo "4. Select filter-by-sender.xpi"
else
    echo "✗ Build failed"
    exit 1
fi
