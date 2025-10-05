# Same Address Filter - Installation Guide

## Overview

This Thunderbird extension adds a convenient button and context menu option to quickly filter all emails from the same sender.

## Features

- **Filter Button**: Appears near the sender's email address when viewing a message
- **Context Menu**: Right-click option in the message list
- **Quick Filter**: Automatically populates the filter/search with the sender's email address

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

### Method 1: Filter Button

1. Open any email in your inbox
2. Look for the **"Filter Sender"** button near the sender's email address
3. Click the button to automatically filter all emails from that sender

### Method 2: Context Menu

1. Right-click on any email in your message list
2. Select **"Filter all emails from this sender"**
3. The filter will be applied automatically

### Method 3: Toolbar Button (Fallback)

If the inline button doesn't appear:

1. Look for the filter icon in the message toolbar
2. Click it while viewing an email to filter by that sender

## Troubleshooting

### Extension Not Working?

1. Check Thunderbird version (must be 91.0+):

   - Help → About Thunderbird

2. Check Browser Console for errors:

   - Menu → Developer Tools → Error Console
   - Look for messages from "Same Address Filter"

3. Verify permissions:
   - Ensure the extension has necessary permissions in Add-ons Manager

### Button Not Appearing?

The extension tries multiple methods to inject the button:

1. Near the email address in the message header
2. In the message toolbar as a fallback
3. Via right-click context menu

If none work, try:

- Restarting Thunderbird
- Checking for conflicts with other extensions
- Updating Thunderbird to the latest version

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
├── content-script.js      # Content script for UI injection
├── styles.css            # Button and UI styles
├── icon-16.png           # Icons (various sizes)
├── icon-32.png
├── icon-48.png
├── icon-64.png
├── generate_icons.py     # Icon generation script
└── INSTALL.md           # This file
```

### Permissions Used:

- `messagesRead`: Read message metadata
- `accountsRead`: Access account information
- `tabs`: Manage tabs
- `menus`: Create context menus
- `storage`: Store temporary data
- `accountsFolders`: Access folder information
- `mailTabs`: Manage mail tabs and quick filters

## Version History

- v1.0.0: Initial release with button and context menu support

## Support

This is a local/sideloaded extension. For issues or modifications, edit the source files directly.
