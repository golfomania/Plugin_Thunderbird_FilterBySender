# Same Address Filter - Installation Guide

## Overview

This Thunderbird extension adds a convenient keyboard shortcut and context menu option to quickly filter all emails from the same sender.

## Features

- **Context Menu**: Right-click on any email in the message list to filter by sender
- **Keyboard Shortcut**: Press `Ctrl+Shift+F` (or `Cmd+Shift+F` on Mac) to filter by sender
- **Quick Filter**: Automatically populates the filter/search with the sender's email address
- **Simple & Fast**: Works with both mouse and keyboard

## Prerequisites

- Mozilla Thunderbird 91.0 or higher
- Python 3 with PIL/Pillow (for generating icons)

## Installation Steps

### 1. Generate Icons

First, generate the icon files:

```bash
pip3 install Pillow
python3 generate_icons.py
```

### 2. Prepare for Sideloading

#### Option A: Temporary Installation (For Testing)

1. Open Thunderbird
2. Go to **Menu (≡)** → **Add-ons and Themes** (or press `Ctrl+Shift+A`)
3. Click the **gear icon** (⚙) → **Debug Add-ons**
4. Click **"This Thunderbird"** on the left panel
5. Click **"Load Temporary Add-on..."**
6. Navigate to your extension folder and select the `manifest.json` file
7. The extension will be loaded until Thunderbird restarts

#### Option B: Permanent Sideloading (Recommended)

##### For Linux Mint:

1. Package the extension:

   ```bash
   cd /path/to/Plugin_Thunderbird_SameAdress
   zip -r same-address-filter.xpi * -x "*.py" "*.md" ".git/*"
   ```

2. Install the XPI file:
   - Open Thunderbird
   - Go to **Menu (≡)** → **Add-ons and Themes**
   - Click the gear icon (⚙) → **Install Add-on From File...**
   - Select the `same-address-filter.xpi` file
   - Click **Add** when prompted

##### Alternative: Direct Installation to Profile

1. Find your Thunderbird profile folder:

   ```bash
   # Usually located at:
   ~/.thunderbird/[profile-name]/extensions/
   ```

2. Create a folder with the extension ID:

   ```bash
   mkdir -p ~/.thunderbird/[profile-name]/extensions/same-address-filter@local
   ```

3. Copy all extension files to that folder:

   ```bash
   cp -r /path/to/Plugin_Thunderbird_SameAdress/* ~/.thunderbird/[profile-name]/extensions/same-address-filter@local/
   ```

4. Restart Thunderbird

### 3. Enable the Extension

After installation, you may need to:

1. Go to **Add-ons and Themes**
2. Find "Same Address Filter" in the Extensions list
3. Make sure it's enabled (toggle should be ON)

## Usage

### Method 1: Keyboard Shortcut (Fastest!)

1. Select any email in your message list or open an email
2. Press **`Ctrl+Shift+F`** (Linux/Windows) or **`Cmd+Shift+F`** (Mac)
3. The quick filter will instantly populate with the sender's email address

### Method 2: Right-Click Context Menu

1. **Right-click** on any email in your message list
2. Select **"Filter all emails from this sender"** from the context menu
3. The quick filter will be automatically populated with the sender's email address

The extension uses Thunderbird's built-in Quick Filter bar to show results. You'll see the filter applied in the filter area, showing only emails from the selected sender.

## Troubleshooting

### Extension Not Working?

1. Check Thunderbird version (must be 91.0+):

   - Help → About Thunderbird

2. Check Browser Console for errors:

   - Menu → Developer Tools → Error Console
   - Look for messages from "Same Address Filter"

3. Verify permissions:
   - Ensure the extension has necessary permissions in Add-ons Manager

### Keyboard Shortcut Not Working?

If `Ctrl+Shift+F` doesn't work:

- The shortcut might conflict with another extension or system shortcut
- You can customize it: Go to **Add-ons and Themes** → **⚙ Gear Menu** → **Manage Extension Shortcuts**
- Find "Same Address Filter" and set your preferred shortcut
- Make sure an email is selected or displayed when using the shortcut

### Context Menu Not Appearing?

If the context menu option doesn't appear:

- Make sure you're right-clicking on an email in the message list (not in the reading pane)
- Restart Thunderbird after installation
- Check for conflicts with other extensions that modify context menus
- Verify the extension is enabled in Add-ons and Themes

### Filter Not Working?

The extension uses Thunderbird's Quick Filter API. If it doesn't work:

- The email address will be copied to clipboard as a fallback
- You can manually paste it into the filter field

## Uninstallation

### For Temporary Installation:

Simply restart Thunderbird

### For Permanent Installation:

1. Go to **Add-ons and Themes**
2. Find "Same Address Filter"
3. Click **Remove**

## Development Notes

### File Structure:

```
Plugin_Thunderbird_SameAdress/
├── manifest.json          # Extension manifest
├── background.js          # Background script for message handling
├── icon-16.png           # Icons (various sizes)
├── icon-32.png
├── icon-48.png
├── icon-64.png
├── generate_icons.py     # Icon generation script
├── build.sh              # Build script for creating XPI
├── .gitignore            # Git ignore file
└── INSTALL.md           # This file
```

### Permissions Used:

- `messagesRead`: Read message metadata
- `accountsRead`: Access account information
- `tabs`: Manage tabs
- `menus`: Create context menus
- `storage`: Store temporary data
- `accountsFolders`: Access folder information

## Version History

- v1.1.0: Added keyboard shortcut support (Ctrl+Shift+F)
- v1.0.0: Initial release with context menu support for filtering by sender

## Support

This is a local/sideloaded extension. For issues or modifications, edit the source files directly.
