# Auto-Fill Google Forms Extension - Architecture

## 🏗️ Architecture Overview

This extension follows a professional, modular architecture designed for scalability and maintainability.

## 📁 File Structure

```
extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (minimal)
├── content.js             # Main form automation logic
├── popup.html             # User interface
├── popup.js               # UI interaction logic
├── public/icons/          # Extension icons
└── ARCHITECTURE.md        # This file
```

## 🔧 Core Components

### 1. Configuration Layer (`content.js`)

#### USER_PROFILE

Centralized user data organized by categories:

```javascript
const USER_PROFILE = {
  personal: { lastName, firstName, fullName, gender, sex },
  contact: { email, phone, mobile },
  location: { birthPlace, residence, nationality, address },
  documents: { idNumber, passportNumber, cniNumber },
  family: { fatherName, motherName },
  languages: { usual, mother },
  professional: { profession, company, academicReason },
  medical: { disabilities },
  misc: { examSubjects },
};
```

#### FIELD_MAPPINGS

Maps form field patterns to user data fields:

```javascript
const FIELD_MAPPINGS = {
  personal: {
    lastName: ["nom", "noms", "name", "lastname"],
    firstName: ["prénom", "prenom", "prenoms", "firstname"],
  },
  // ... other categories
};
```

#### CONFIG

Application configuration:

```javascript
const CONFIG = {
  minMatchScore: 0.7,
  containerSelectors: [...],
  questionTextSelectors: [...],
  inputSelectors: [...],
  skipFieldTypes: [...],
  skipKeywords: [...],
  specialKeywords: {...}
};
```

### 2. Core Classes

#### FormDetector

Handles form detection and question extraction:

- `findQuestionContainers()` - Locates form question containers
- `extractQuestionLabel()` - Extracts clean question text
- `findInputField()` - Finds text input fields only

#### FieldMatcher

Intelligent field matching with scoring:

- `findBestMatch()` - Finds best dictionary match for a question
- `calculateMatchScore()` - Calculates match confidence (0-1)

#### FieldFiller

Handles form field value setting:

- `setFieldValue()` - Sets field values with proper event triggering

#### FormAutoFiller

Main orchestration class:

- `fillForm()` - Main form filling process
- `getUserProfile()` - Get current user data
- `updateUserProfile()` - Update user data (extensibility)
- `getFieldMappings()` - Get field mappings (debugging)

### 3. Utility Functions

- `generateFlatDictionary()` - Converts structured data to flat key-value pairs
- `Logger` - Consistent logging utility

## 🚀 Adding New Data Fields

### Step 1: Add to USER_PROFILE

```javascript
const USER_PROFILE = {
  // Existing categories...
  newCategory: {
    newField: "New Value",
  },
};
```

### Step 2: Add to FIELD_MAPPINGS

```javascript
const FIELD_MAPPINGS = {
  // Existing mappings...
  newCategory: {
    newField: ["field variation 1", "field variation 2", "field variation 3"],
  },
};
```

### Step 3: Test

The system automatically generates the flat dictionary and field matching rules.

## 🔍 Matching Algorithm

### Matching Priority:

1. **Exact Match** (Score: 1.0)
2. **Inclusion Match** (Score: 0.6-0.95)
3. **Keyword Pattern Match** (Score: 0.85)
4. **Word-based Match** (Score: 0.0-0.8)

### Special Handling:

- Long text questions with keyword patterns
- Multi-word matching with importance weighting
- Configurable minimum match threshold

## 📊 Statistics & Debugging

The extension provides detailed statistics:

- Fields detected vs. filled
- Success rate percentage
- Per-field matching results
- Match scores and reasoning

## 🔧 Configuration Options

### Easily Configurable:

- Minimum match score threshold
- DOM selectors for different form layouts
- Skip patterns for special fields
- Keyword patterns for complex matching
- Logging levels

## 🧪 Testing & Development

### Development Mode:

When on localhost, classes are exposed to `window.AutoFillClasses` for testing:

```javascript
// Available in browser console
window.AutoFillClasses.FormDetector;
window.AutoFillClasses.FieldMatcher;
window.AutoFillClasses.FormAutoFiller;
```

### Message API:

- `fillForm` - Fill the current form
- `getUserProfile` - Get user profile data
- `getFieldMappings` - Get field mappings structure

## 🔄 Extensibility Features

### Future Extensions:

1. **Multiple Profiles** - Switch between different user profiles
2. **Custom Field Mappings** - User-defined field mappings
3. **Form Templates** - Predefined mappings for specific forms
4. **Cloud Sync** - Sync data across devices
5. **Analytics** - Usage statistics and optimization
6. **AI Enhancement** - Machine learning for better field detection

### Easy Extension Points:

- Add new categories to `USER_PROFILE`
- Add new matching patterns to `FIELD_MAPPINGS`
- Extend `CONFIG` for new form types
- Add new message handlers for new features
- Extend `FormAutoFiller` with new methods

## 🔒 Security & Privacy

- No external API calls
- No data transmission
- All data stored locally in code
- No persistent storage
- No user tracking

## 📈 Performance Optimizations

- Efficient DOM querying with fallbacks
- Lazy evaluation of matching algorithms
- Minimal event listener overhead
- Optimized regex patterns
- Caching of computed values

## 🐛 Error Handling

- Comprehensive try-catch blocks
- Graceful degradation for unsupported fields
- Detailed error logging
- Fallback mechanisms for edge cases
- User-friendly error messages
