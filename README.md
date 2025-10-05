# Filter by sender for Thunderbird

You need this plugin if you want to answer this questions with a single click:

- How many more emails do you have from that sender?
- I want to delete all other mails from that newsletter?

A simple yet powerful Thunderbird extension that lets you instantly filter all emails from the same sender with a single keyboard shortcut or right-click.

## Why This Extension?

Ever needed to quickly see all emails from a specific sender? Instead of manually copying email addresses and pasting them into search filters, this extension does it all with one action:

- Press `Ctrl+Shift+Q` (customizable)
- Or right-click and select "Find all emails from this sender"

Perfect for:

- 📧 Finding all correspondence with a specific contact
- 📧 Fast clean up the inbox from newsletters and other unwanted emails from the same sender
- 🔍 Tracking email threads from the same sender
- 🗂️ Quick email organization and review
- ⚡ Power users who value keyboard shortcuts

## Features

- **⌨️ Keyboard Shortcut**: Press `Ctrl+Shift+Q` (or `Cmd+Shift+Q` on Mac) to instantly filter by sender
- **🖱️ Context Menu**: Right-click any email to filter all messages from that sender
- **🚀 Quick Filter Integration**: Uses Thunderbird's built-in Quick Filter for instant results
- **🎯 Smart Detection**: Works whether you're viewing an email or selecting from the list
- **⚙️ Customizable**: Change the keyboard shortcut to your preference
- **🔒 Privacy-Focused**: No data collection, no external connections, minimal permissions

## Requirements

- Mozilla Thunderbird 115.0 or higher (ESR version)
- Works on Windows, macOS, and Linux

## Installation

### From Mozilla Add-ons (Recommended)

_Coming soon - pending review_

### Manual Installation

#### Quick Install (Pre-built)

1. Download the latest `.xpi` file from the [Releases](https://github.com/golfomania/Plugin_Thunderbird_FilterBySender/releases) page
2. In Thunderbird: **Menu (≡)** → **Add-ons and Themes**
3. Click the gear icon (⚙) → **Install Add-on From File...**
4. Select the downloaded `.xpi` file
5. Click **Add** when prompted

#### Build from Source

```bash
# Clone the repository
git clone https://github.com/golfomania/Plugin_Thunderbird_FilterBySender.git
cd Plugin_Thunderbird_FilterBySender

# Generate icons (requires Python 3 with Pillow)
pip3 install Pillow
python3 generate_icons.py

# Build the extension
chmod +x build.sh
./build.sh

# Install the generated filter-by-sender.xpi in Thunderbird
```

## Usage

### Method 1: Keyboard Shortcut (Fastest!)

1. Select any email in your message list or open an email
2. Press **`Ctrl+Shift+Q`** (Linux/Windows) or **`Cmd+Shift+Q`** (Mac)
3. The quick filter instantly shows all emails from that sender

### Method 2: Right-Click Context Menu

1. Right-click on any email in your message list
2. Select **"Find all emails from this sender"**
3. All emails from that sender are displayed

### Customizing the Keyboard Shortcut

1. Go to **Add-ons and Themes** → **⚙ Gear Menu** → **Manage Extension Shortcuts**
2. Find "Filter by sender"
3. Click on the shortcut and set your preferred key combination

## Development

### Project Structure

```
Plugin_Thunderbird_FilterBySender/
├── manifest.json          # Extension manifest (Manifest V2)
├── background.js          # Background script for filtering logic
├── generate_icons.py      # Icon generation script
├── build.sh              # Build script for creating XPI
├── icon-*.png            # Extension icons (generated)
└── README.md            # This file
```

### Building for Development

#### Temporary Installation (for testing)

1. Open Thunderbird
2. Navigate to **Menu** → **Add-ons and Themes**
3. Click gear icon (⚙) → **Debug Add-ons**
4. Click **This Thunderbird**
5. Click **Load Temporary Add-on...**
6. Select the `manifest.json` file from your local copy
7. The extension loads until Thunderbird restarts

#### Creating a Permanent Install Package

```bash
# Run the build script
./build.sh

# Or manually create the XPI
zip -r filter-by-sender.xpi manifest.json background.js icon-*.png
```

### Permissions

This extension uses minimal permissions following the principle of least privilege:

- `messagesRead`: Read message metadata to get sender information
- `tabs`: Access the current tab to identify selected messages
- `menus`: Create the right-click context menu option

No data is collected, stored, or transmitted outside of Thunderbird.

## Troubleshooting

### Extension Not Working?

1. **Check Thunderbird version**: Must be 115.0 or higher

   - Help → About Thunderbird

2. **Check Browser Console for errors**:

   - Menu → Developer Tools → Error Console
   - Look for messages from "Filter by sender"

3. **Verify the extension is enabled**:
   - Add-ons and Themes → Ensure toggle is ON

### Keyboard Shortcut Not Working?

- The shortcut might conflict with another extension or system shortcut
- Try customizing it through **Manage Extension Shortcuts**
- Ensure an email is selected or displayed when using the shortcut

### Context Menu Not Appearing?

- Right-click on an email in the message list (not in the reading pane)
- Restart Thunderbird after installation
- Check for conflicts with other extensions

### Filter Not Working?

- Ensure Thunderbird's Quick Filter bar is visible
- The extension populates the Quick Filter - check if it's being applied
- Try clearing any existing filters first

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Privacy Policy

This extension:

- ✅ Does NOT collect any personal data
- ✅ Does NOT transmit any data outside Thunderbird
- ✅ Does NOT store any user information
- ✅ Works completely offline
- ✅ Open source for transparency

## Version History

- **v1.1.0** (Current): Added keyboard shortcut support (Ctrl+Shift+Q)
- **v1.0.0**: Initial release with context menu filtering

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues, feature requests, or questions:

- Open an issue on [GitHub](https://github.com/golfomania/Plugin_Thunderbird_FilterBySender/issues)
- Check existing issues for solutions

## Author

Created by Martin Loeffler

---

**Note**: This extension is pending review for listing on addons.mozilla.org (AMO). Until then, please use the manual installation method.

## Repository Name

The repository is named "Plugin_Thunderbird_FilterBySender" to match the extension name "Filter by sender".
