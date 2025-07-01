# Auto-Fill Google Forms Chrome Extension

A Chrome Extension that automatically fills Google Forms with predefined data using Manifest V3.

## Features

- 🔤 Auto-fills Google Forms with hard-coded dictionary data
- 🎯 Smart question detection using multiple selectors
- 🚀 Works with dynamically loaded content via MutationObserver
- 📱 Simple popup interface with one-click form filling
- 🛡️ Manifest V3 compliant with modern security standards
- 💻 No external dependencies - pure JavaScript

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension folder
5. The extension icon should appear in your Chrome toolbar

## Usage

1. Navigate to any Google Forms page (https://docs.google.com/forms/*)
2. Click the extension icon in the toolbar
3. Click the "Fill Form" button in the popup
4. The extension will automatically fill matching form fields

## Hard-coded Data Dictionary

The extension uses the following predefined data:

```javascript
const DICT = {
  name: "Dupont",
  firstname: "Jean",
  email: "jean.dupont@example.com",
  phone: "+33123456789",
  lastname: "Dupont",
  "first name": "Jean",
  "last name": "Dupont",
  "full name": "Jean Dupont",
  address: "123 Rue de la Paix, Paris",
  city: "Paris",
  country: "France",
  age: "30",
  company: "Tech Corp",
};
```

## How It Works

### Question Detection

1. Scans the DOM for question containers using multiple selectors
2. Extracts question label text and converts to lowercase
3. Uses MutationObserver to handle dynamically loaded content

### Field Matching

1. For each dictionary key, checks if the question label contains that key
2. Finds the first text input or textarea in the question container
3. Fills the field and triggers necessary events (focus, input, change)

### Supported Field Types

- Text inputs (`<input type="text">`)
- Email inputs (`<input type="email">`)
- Phone inputs (`<input type="tel">`)
- Generic inputs (`<input>` without type)
- Textareas (`<textarea>`)

## File Structure

```
extension/
├── manifest.json       # Extension manifest (Manifest V3)
├── background.js       # Service worker for background tasks
├── content.js          # Content script that runs on Google Forms
├── popup.html          # Popup interface HTML
├── popup.js           # Popup interface JavaScript
└── README.md          # This file
```

## Technical Details

### Manifest V3 Features

- Uses service worker instead of background pages
- Implements host permissions for Google Forms
- Uses action API for browser action popup

### Content Script

- Runs on all `docs.google.com/forms/*` pages
- Uses robust selectors to find question containers
- Implements event dispatching for React/Angular compatibility
- Includes fallback mechanisms for different Google Forms layouts

### Message Passing

- Popup ↔ Background ↔ Content Script communication
- Async message handling with proper response callbacks
- Error handling and user feedback

## Customization

To modify the auto-fill data, edit the `DICT` object in `content.js`:

```javascript
const DICT = {
  // Add your custom key-value pairs here
  your_field_name: "your_value",
};
```

The extension matches form fields by checking if the question label contains any of the dictionary keys (case-insensitive).

## Limitations

- Only supports text inputs and textareas
- Does not handle checkboxes, radio buttons, or select dropdowns
- Uses hard-coded data dictionary (no storage or options page)
- Only works on Google Forms (docs.google.com/forms/\*)

## Browser Compatibility

- Chrome 88+ (Manifest V3 support required)
- Edge 88+ (Chromium-based)

## License

This project is open source and available under the MIT License.
