# Mozilla Add-ons (AMO) Submission Guide

## Pre-Submission Checklist

### ✅ Extension Requirements

- [x] **Manifest Version**: Using Manifest V2 (correct for Thunderbird)
- [x] **Minimum Version**: Set to Thunderbird 115.0 (latest ESR)
- [x] **Extension ID**: Uses proper format `filter-by-sender@martinloeffler`
- [x] **Version Number**: Follows semantic versioning (1.1.0)
- [x] **Permissions**: Minimal permissions (only messagesRead, tabs, menus)
- [x] **Icons**: All required sizes including 128px for AMO
- [x] **License**: MIT License included

### ✅ Code Quality

- [x] No minified or obfuscated code
- [x] Clear, commented code
- [x] No remote code execution
- [x] No external dependencies
- [x] No analytics or tracking

### ✅ Privacy & Security

- [x] No data collection
- [x] No network requests
- [x] Works completely offline
- [x] Clear privacy policy in README

## Build for Submission

```bash
# 1. Clean build
rm -f *.xpi icon-*.png

# 2. Generate fresh icons
python3 generate_icons.py

# 3. Create the XPI package
./build.sh

# 4. Verify the package
unzip -l filter-by-sender.xpi
```

## AMO Submission Process

### 1. Create Developer Account

- Go to https://addons.mozilla.org/developers/
- Sign in with Firefox Account
- Complete developer agreement

### 2. Submit New Extension

#### Basic Information

- **Name**: Filter by sender
- **Summary**: Quickly find emails from the same sender with a keyboard shortcut or right-click
- **Categories**:
  - Privacy & Security
  - Productivity
- **License**: MIT License
- **Privacy Policy**: Link to README.md#privacy-policy

#### Description (for AMO listing)

```markdown
Filter all emails from the same sender instantly with a single keyboard shortcut or right-click!

**Key Features:**
• Press Ctrl+Shift+Q to instantly filter by sender (customizable)
• Right-click any email and select "Find all emails from this sender"
• Integrates seamlessly with Thunderbird's Quick Filter
• Works with selected emails or when viewing messages
• Zero configuration needed - works out of the box

**Perfect for:**
• Finding all emails from a specific contact
• Tracking correspondence threads
• Quick email organization
• Power users who love keyboard shortcuts

**Privacy First:**
• No data collection
• No external connections
• Minimal permissions
• 100% open source

**Keyboard Shortcut:**
Default: Ctrl+Shift+Q (Cmd+Shift+Q on Mac)
Customizable via Add-ons → Manage Extension Shortcuts
```

#### Technical Details

- **Thunderbird Compatibility**: 115.0 or higher
- **Extension Type**: WebExtension (Manifest V2)
- **Permissions Required**: messagesRead, menus

### 3. Upload Files

1. Upload `filter-by-sender.xpi`
2. Source code: Link to GitHub repository

### 4. Screenshots (Recommended)

Create screenshots showing:

1. Context menu option in action
2. Quick Filter populated with email address
3. Keyboard shortcut in use

### 5. Version Notes

```
Version 1.1.4:
- Removed unused "tabs" permission
- Removed strict_max_version (WebExtensions are forward-compatible)
- Improved AMO compliance per reviewer feedback

Version 1.1.3:
- Extended compatibility to Thunderbird 140.x ESR
- Support for latest Thunderbird versions including Flatpak

Version 1.1.2:
- Extended compatibility to Thunderbird 128.x
- Fixed installation issue for newer Thunderbird versions

Version 1.1.1:
- Fixed AMO validation error (strict_max_version format)
- Compatible with Thunderbird 115.x ESR series

Version 1.1.0:
- Added keyboard shortcut support (Ctrl+Shift+Q)
- Improved error handling
- Optimized for Thunderbird 115+ ESR

Version 1.0.0:
- Initial release
- Context menu filtering
```

## Post-Submission

### Expected Review Time

- Initial review: 5-10 business days
- Updates: 1-5 business days

### Common Review Issues to Avoid

- ✅ No unnecessary permissions
- ✅ Clear description of functionality
- ✅ No minified code
- ✅ Proper version numbering
- ✅ Valid manifest.json

### After Approval

1. Update README.md with AMO link
2. Create GitHub release with .xpi file
3. Tag version in git: `git tag v1.1.0`
4. Consider setting up automated updates

## Support Information for AMO

**Support Email**: [Your email]
**Support URL**: https://github.com/golfomania/Plugin_Thunderbird_FilterBySender/issues
**Homepage**: https://github.com/golfomania/Plugin_Thunderbird_FilterBySender

## Update Process

When updating the extension:

1. Increment version in `manifest.json`
2. Update README.md version history
3. Build new XPI
4. Submit update through AMO developer hub
5. Include clear version notes

## Marketing Assets

### Short Description (250 chars)

"Instantly filter emails by sender with one keyboard shortcut or right-click. Simple, fast, privacy-focused."

### Tags

- email filter
- sender filter
- quick filter
- keyboard shortcut
- productivity
- email organization
- privacy

## Notes

- The extension is named "Filter by sender" for better discoverability
- The repository is named "Plugin_Thunderbird_FilterBySender" to match the extension purpose
- AMO requires the extension to work with the latest Thunderbird ESR (currently 115.x)
