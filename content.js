/**
 * Auto-Fill Google Forms Extension - Content Script
 *
 * Professional, scalable form automation solution for Google Forms
 * Supports intelligent field matching and extensible data configuration
 *
 * @version 2.0.0
 * @author Extension Team
 */

"use strict";

// ============================================================================
// CONFIGURATION & DATA MODELS
// ============================================================================

/**
 * User profile data with categorized information
 * Easy to extend and maintain - just add new categories or fields
 */
const USER_PROFILE = {
  // Personal Identity
  personal: {
    lastName: "KONE",
    firstName: "Amadou",
    fullName: "Amadou KONE",
    gender: "Masculin",
    sex: "Homme",
  },

  // Contact Information
  contact: {
    email: "amadou.kone@example.com",
    phone: "+225 07 08 09 10 11",
    mobile: "+225 07 08 09 10 11",
  },

  // Location Information
  location: {
    birthPlace: "Abidjan",
    birthCountry: "Côte d'Ivoire",
    residence: "Yamoussoukro",
    residenceCountry: "Côte d'Ivoire",
    nationality: "Ivoirienne",
    address: "Cocody, Abidjan, Côte d'Ivoire",
  },

  // Identity Documents
  documents: {
    idNumber: "CI1234567890",
    passportNumber: "CI1234567890",
    cniNumber: "CI1234567890",
  },

  // Family Information
  family: {
    fatherName: "Sekou KONE",
    motherName: "Fatoumata TRAORE",
  },

  // Languages
  languages: {
    usual: "Français",
    mother: "Baoulé",
  },

  // Professional/Academic
  professional: {
    profession: "Ingénieur informatique",
    company: "Orange Côte d'Ivoire",
    academicReason: "Académique - Poursuite d'études supérieures en France",
  },

  // Medical/Accessibility
  medical: {
    disabilities: "Aucun",
  },

  // Miscellaneous
  misc: {
    examSubjects: "Tous les sujets",
  },
};

/**
 * Field mapping configuration - maps form field patterns to user data
 * Organized by categories for easy maintenance and extension
 */
const FIELD_MAPPINGS = {
  // Personal Identity Mappings
  personal: {
    // Last Name variations
    lastName: [
      "nom",
      "noms",
      "name",
      "lastname",
      "last name",
      "nom candidat",
      "noms candidat",
      "noms du candidat",
      "noms du candidats",
    ],
    // First Name variations
    firstName: ["prénom", "prenom", "prenoms", "firstname", "first name", "prenoms candidat", "prenoms du candidat"],
    // Full Name variations
    fullName: ["nom complet", "full name", "nom complet signature", "votre nom complet"],
    // Gender variations
    gender: ["genre"],
    sex: ["sexe", "homme", "femme"],
  },

  // Contact Information Mappings
  contact: {
    email: ["email", "courriel", "e-mail", "adresse courriel", "adresse mail", "adresse  mail"],
    phone: ["contact", "téléphone", "telephone", "tel", "phone", "numéro téléphone", "numéro de téléphone", "numéro mobile", "mobile"],
  },

  // Location Mappings
  location: {
    birthPlace: ["lieu naissance", "lieu de naissance", "ville naissance", "ville de naissance"],
    birthCountry: ["pays naissance", "pays de naissance"],
    residence: [
      "lieu résidence",
      "lieu de résidence",
      "lieu de residence",
      "lieu de résidence ",
      "ville résidence",
      "ville de résidence",
      "ville de residence",
      "ville de résidence ",
      "ville",
      "city",
    ],
    nationality: ["nationalité"],
    country: ["country"],
    address: ["adresse", "address"],
  },

  // Documents Mappings
  documents: {
    idNumber: [
      "numéro cni",
      "numero cni",
      "numéro passeport",
      "numero passeport",
      "numéro pièce",
      "numero piece",
      "numéro de la pièce",
      "numéro de la piece",
      "numéro pièce identité",
      "numero piece identite",
      "numéro de la pièce d'identité",
      "numéro de la piece d'identité",
      "numéro de la piece d'idententité",
      "n° cni",
      "n° passeport",
      "cni",
      "passeport",
      "numéro cni / passeport",
      "numero cni / passeport",
    ],
  },

  // Family Mappings
  family: {
    fatherName: ["nom père", "nom pere", "nom du père", "nom du pere"],
    motherName: ["nom mère", "nom mere", "nom de la mère", "nom de la mere"],
  },

  // Languages Mappings
  languages: {
    usual: ["langue usuelle"],
    mother: ["langue maternelle"],
  },

  // Professional/Academic Mappings
  professional: {
    profession: ["profession"],
    company: ["company"],
    academicReason: [
      "motif",
      "motifs",
      "raison",
      "pour quelle raison",
      "quelle raison",
      "passez-vous ce test",
      "pour quelle raison passez-vous ce test",
      "motifs (pour quelle raison passez-vous ce test académique, professionnelle, personnelle, émigration, citoyenneté, entrée express, etc.)",
      "pour quelle raison passez-vous ce test académique",
    ],
  },

  // Medical Mappings
  medical: {
    disabilities: ["handicapts", "handicap"],
  },

  // Signature/Legal Mappings
  signature: [
    "signature",
    "veuillez signer",
    "veuillez signer en écrivant votre nom complet",
    "en signant ce document vous confirmez que toutes les informations que vous avez fournis sont les vôtres et que vous avez correctement suivi la procédure d'inscription.nb toute fausse information entrainera le rejet de votre candidature et le non remboursement des frais d'examens payésveuillez signer en écrivant votre nom complet",
    "en signant ce document vous confirmez",
    "toutes les informations que vous avez fournis",
    "veuillez signer en écrivant",
  ],

  // Miscellaneous Mappings
  misc: {
    examSubjects: ["sujet d'examen", "sujet examen"],
  },
};

/**
 * Configuration for the form filler
 */
const CONFIG = {
  // Minimum match score required for field matching (0-1)
  minMatchScore: 0.7,

  // Selectors for finding form containers
  containerSelectors: [
    '[data-params*="question"]',
    '[role="listitem"]',
    ".m2",
    ".freebirdFormviewerViewItemsItemItem",
    ".Xb9hP",
    ".geS5n",
    ".AgroKb",
  ],

  // Selectors for finding question text
  questionTextSelectors: [
    '[role="heading"]',
    ".M7eMe",
    ".freebirdFormviewerViewItemsItemItemTitle",
    ".AgroKb .M7eMe",
    'span[dir="auto"]',
    'div[dir="auto"]',
  ],

  // Input field selectors (only text-based inputs)
  inputSelectors: ['input[type="text"]', 'input[type="email"]', 'input[type="tel"]', "textarea"],

  // Field types to skip
  skipFieldTypes: ["date", "time", "datetime-local", "color", "range", "file", "checkbox", "radio", "submit", "button", "reset"],

  // Keywords that indicate special fields to skip
  skipKeywords: ["date", "sélectionn", "cochez", "radio", "checkbox", "select", "choisir"],

  // Special keyword patterns for complex matching
  specialKeywords: {
    motifs: ["motifs", "raison", "passez-vous", "test", "académique"],
    signature: ["signer", "nom complet", "confirmez", "document", "veuillez"],
    engagement: ["engagement", "honneur", "responsabilité", "informations"],
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generates a flattened dictionary from the structured data
 * @returns {Object} Flattened key-value pairs for form filling
 */
function generateFlatDictionary() {
  const flatDict = {};

  // Add signature mappings with full name
  FIELD_MAPPINGS.signature.forEach((key) => {
    flatDict[key] = USER_PROFILE.personal.fullName;
  });

  // Process each category
  Object.entries(FIELD_MAPPINGS).forEach(([category, fields]) => {
    if (category === "signature") return; // Already handled above

    Object.entries(fields).forEach(([fieldType, variations]) => {
      // Get the value from USER_PROFILE
      let value;
      if (USER_PROFILE[category] && USER_PROFILE[category][fieldType]) {
        value = USER_PROFILE[category][fieldType];
      } else {
        console.warn(`No value found for ${category}.${fieldType}`);
        return;
      }

      // Map all variations to the same value
      variations.forEach((variation) => {
        flatDict[variation] = value;
      });
    });
  });

  return flatDict;
}

/**
 * Logger utility for consistent logging
 */
const Logger = {
  info: (message, ...args) => console.log(`[AutoFill] ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[AutoFill] ${message}`, ...args),
  error: (message, ...args) => console.error(`[AutoFill] ${message}`, ...args),
  debug: (message, ...args) => console.debug(`[AutoFill] ${message}`, ...args),
};

// ============================================================================
// CORE CLASSES
// ============================================================================
/**
 * Handles form detection and question extraction
 */
class FormDetector {
  /**
   * Finds all form question containers on the page
   * @returns {Element[]} Array of question container elements
   */
  static findQuestionContainers() {
    let containers = [];

    for (const selector of CONFIG.containerSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        containers = Array.from(elements);
        Logger.info(`Found ${containers.length} question containers using selector: ${selector}`);
        break;
      }
    }

    // Fallback: find containers that contain both text and input elements
    if (containers.length === 0) {
      const allDivs = document.querySelectorAll("div");
      containers = Array.from(allDivs).filter((div) => {
        const hasInput = div.querySelector("input, textarea");
        const hasText = div.textContent && div.textContent.trim().length > 0;
        return hasInput && hasText && !div.querySelector("div input, div textarea")?.closest("div")?.isSameNode(div);
      });
      Logger.info(`Fallback: Found ${containers.length} question containers`);
    }

    return containers;
  }

  /**
   * Extracts the question label text from a container
   * @param {Element} container - The question container element
   * @returns {string} The cleaned and lowercased question text
   */
  static extractQuestionLabel(container) {
    let questionText = "";

    // Try each selector
    for (const selector of CONFIG.questionTextSelectors) {
      const element = container.querySelector(selector);
      if (element && element.textContent.trim()) {
        questionText = element.textContent.trim();
        break;
      }
    }

    // Fallback: get the first non-empty text content
    if (!questionText) {
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
        acceptNode: function (node) {
          const text = node.textContent.trim();
          if (text.length > 2 && !text.includes("*")) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_SKIP;
        },
      });

      const firstTextNode = walker.nextNode();
      if (firstTextNode) {
        questionText = firstTextNode.textContent.trim();
      }
    }

    // Clean and lowercase the text
    return questionText.toLowerCase().replace(/\s+/g, " ").replace(/[*:?]/g, "").trim();
  }

  /**
   * Finds the input field within a question container (text inputs only)
   * @param {Element} container - The question container element
   * @returns {Element|null} The input or textarea element
   */
  static findInputField(container) {
    // Look for text inputs and textareas only
    let input = container.querySelector(CONFIG.inputSelectors.join(", "));

    // If not found, try inputs without type (which default to text)
    if (!input) {
      const candidateInput = container.querySelector('input:not([type]), input[type=""]');
      if (candidateInput) {
        // Double-check it's not a special field
        const parent = candidateInput.closest('[role="listitem"]') || candidateInput.parentElement;
        const hasSpecialElements =
          parent &&
          parent.querySelector('select, input[type="radio"], input[type="checkbox"], input[type="date"], input[type="time"]');
        if (!hasSpecialElements) {
          input = candidateInput;
        }
      }
    }

    // Skip if container has special field indicators
    if (input) {
      const containerText = container.textContent.toLowerCase();
      const shouldSkip = CONFIG.skipKeywords.some((pattern) => containerText.includes(pattern));

      if (shouldSkip) {
        Logger.debug(`Skipping container with special field indicators: ${containerText.substring(0, 50)}...`);
        return null;
      }
    }

    return input;
  }
}

/**
 * Handles field matching logic with intelligent scoring
 */
class FieldMatcher {
  constructor(dictionary) {
    this.dictionary = dictionary;
  }

  /**
   * Finds the best matching dictionary key for a question label
   * @param {string} questionLabel - The question label to match
   * @returns {Object|null} The best match with key, value, and score
   */
  findBestMatch(questionLabel) {
    let bestMatch = null;
    let bestScore = 0;

    for (const [key, value] of Object.entries(this.dictionary)) {
      const score = this.calculateMatchScore(questionLabel, key);
      if (score > bestScore && score >= CONFIG.minMatchScore) {
        bestScore = score;
        bestMatch = { key, value, score };
      }
    }

    return bestMatch;
  }

  /**
   * Calculates a match score between a question label and a dictionary key
   * @param {string} questionLabel - The question label
   * @param {string} dictKey - The dictionary key
   * @returns {number} Match score between 0 and 1
   */
  calculateMatchScore(questionLabel, dictKey) {
    const question = questionLabel.toLowerCase().trim();
    const key = dictKey.toLowerCase().trim();

    // Exact match gets perfect score
    if (question === key) return 1.0;

    // If question contains the key entirely
    if (question.includes(key)) {
      const ratio = key.length / question.length;
      return Math.min(0.95, 0.6 + ratio * 0.35);
    }

    // If key contains the question entirely
    if (key.includes(question) && question.length > 3) {
      return 0.8;
    }

    // Special handling for long texts with keyword matching
    for (const [category, keywords] of Object.entries(CONFIG.specialKeywords)) {
      if (key.includes(category) || keywords.some((kw) => key.includes(kw))) {
        const keywordMatches = keywords.filter((kw) => question.includes(kw)).length;
        if (keywordMatches >= 2) {
          return 0.85; // High score for keyword pattern match
        }
      }
    }

    // Word-based matching
    const questionWords = question.split(/[\s\-_,()\.!]+/).filter((w) => w.length > 2);
    const keyWords = key.split(/[\s\-_,()\.!]+/).filter((w) => w.length > 2);

    if (questionWords.length === 0 || keyWords.length === 0) return 0;

    let matchingWords = 0;
    for (const qWord of questionWords) {
      let wordMatched = false;
      for (const kWord of keyWords) {
        if (qWord === kWord || qWord.includes(kWord) || kWord.includes(qWord)) {
          if (!wordMatched) {
            matchingWords++;
            wordMatched = true;
          }
        }
      }
    }

    // Calculate score based on word matches
    const wordScore = matchingWords / Math.max(questionWords.length, keyWords.length);

    // Bonus for having all key words matched
    const keyWordsMatched = keyWords.filter((kWord) =>
      questionWords.some((qWord) => qWord === kWord || qWord.includes(kWord) || kWord.includes(qWord))
    ).length;

    const keyWordScore = keyWordsMatched / keyWords.length;

    // Combined score with bias towards key word matches
    return wordScore * 0.4 + keyWordScore * 0.6;
  }
}

/**
 * Handles form field value setting with proper event triggering
 */
class FieldFiller {
  /**
   * Sets the value of an input field and triggers necessary events
   * @param {Element} field - The input/textarea element
   * @param {string} value - The value to set
   * @returns {boolean} Success status
   */
  static setFieldValue(field, value) {
    if (!field || !value) return false;

    Logger.debug(`Setting field value: "${value}" for field:`, field);

    try {
      // Focus the field first
      field.focus();

      // Clear existing value
      field.value = "";

      // Set the new value
      field.value = value;

      // Trigger events that Google Forms expects
      const events = [
        new Event("focus", { bubbles: true }),
        new Event("input", { bubbles: true }),
        new Event("change", { bubbles: true }),
        new Event("blur", { bubbles: true }),
      ];

      events.forEach((event) => field.dispatchEvent(event));

      // Additional trigger for React-based forms
      try {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        if (nativeInputValueSetter) {
          nativeInputValueSetter.call(field, value);
          const reactInputEvent = new Event("input", { bubbles: true });
          field.dispatchEvent(reactInputEvent);
        }
      } catch (e) {
        Logger.debug("React setter failed (normal for textareas):", e.message);
      }

      return true;
    } catch (error) {
      Logger.error(`Error setting field value: ${error.message}`);
      // Fallback: simple value assignment
      try {
        field.value = value;
        return true;
      } catch (e) {
        Logger.error("Fallback value assignment also failed:", e.message);
        return false;
      }
    }
  }
}

/**
 * Main form automation engine
 */
class FormAutoFiller {
  constructor() {
    this.dictionary = generateFlatDictionary();
    this.fieldMatcher = new FieldMatcher(this.dictionary);
    this.statistics = {
      fieldsDetected: 0,
      fieldsFilled: 0,
      detectionResults: [],
    };
  }

  /**
   * Main function to fill the form with dictionary data
   * @returns {Object} Results with success status, message, and statistics
   */
  fillForm() {
    Logger.info("Starting form fill process...");

    // Reset statistics
    this.statistics = {
      fieldsDetected: 0,
      fieldsFilled: 0,
      detectionResults: [],
    };

    const containers = FormDetector.findQuestionContainers();

    containers.forEach((container, index) => {
      const questionLabel = FormDetector.extractQuestionLabel(container);
      Logger.debug(`Question ${index + 1}: "${questionLabel}"`);

      if (!questionLabel) return;

      const inputField = FormDetector.findInputField(container);
      if (inputField) {
        this.statistics.fieldsDetected++;

        // Try exact match first
        let matchFound = false;
        let matchedKey = "";
        let matchedValue = "";

        // Check for exact match
        if (this.dictionary[questionLabel]) {
          Logger.info(`✅ Exact match found: "${questionLabel}" -> "${this.dictionary[questionLabel]}"`);
          const success = FieldFiller.setFieldValue(inputField, this.dictionary[questionLabel]);
          if (success) {
            this.statistics.fieldsFilled++;
            matchFound = true;
            matchedKey = questionLabel;
            matchedValue = this.dictionary[questionLabel];
          }
        } else {
          // Try intelligent matching
          const bestMatch = this.fieldMatcher.findBestMatch(questionLabel);
          if (bestMatch) {
            Logger.info(`✅ Best match found: "${bestMatch.key}" -> "${bestMatch.value}" (score: ${bestMatch.score.toFixed(2)})`);
            const success = FieldFiller.setFieldValue(inputField, bestMatch.value);
            if (success) {
              this.statistics.fieldsFilled++;
              matchFound = true;
              matchedKey = bestMatch.key;
              matchedValue = bestMatch.value;
            }
          }
        }

        // Store detection result for debugging
        this.statistics.detectionResults.push({
          questionLabel,
          matched: matchFound,
          key: matchedKey,
          value: matchedValue,
          inputType: inputField.type || inputField.tagName.toLowerCase(),
        });
      } else {
        Logger.debug(`⏭️ Skipped question ${index + 1}: no suitable input field found`);
      }
    });

    const successRate =
      this.statistics.fieldsDetected > 0 ? Math.round((this.statistics.fieldsFilled / this.statistics.fieldsDetected) * 100) : 0;

    Logger.info(
      `Form fill complete: ${this.statistics.fieldsFilled}/${this.statistics.fieldsDetected} fields filled (${successRate}%)`
    );
    Logger.debug("Detection results:", this.statistics.detectionResults);

    return {
      success: true,
      message: `Rempli ${this.statistics.fieldsFilled} champs sur ${this.statistics.fieldsDetected} détectés (${successRate}%)`,
      fieldsDetected: this.statistics.fieldsDetected,
      fieldsFilled: this.statistics.fieldsFilled,
      detectionResults: this.statistics.detectionResults,
    };
  }

  /**
   * Get current user profile data
   * @returns {Object} Current user profile
   */
  getUserProfile() {
    return { ...USER_PROFILE };
  }

  /**
   * Update user profile data (for future extensibility)
   * @param {Object} newProfile - New profile data
   */
  updateUserProfile(newProfile) {
    Object.assign(USER_PROFILE, newProfile);
    this.dictionary = generateFlatDictionary();
    this.fieldMatcher = new FieldMatcher(this.dictionary);
    Logger.info("User profile updated");
  }

  /**
   * Get available field mappings (for UI or debugging)
   * @returns {Object} Current field mappings structure
   */
  getFieldMappings() {
    return { ...FIELD_MAPPINGS };
  }
}

// ============================================================================
// INITIALIZATION & EVENT HANDLING
// ============================================================================

// Initialize the form auto-filler
const autoFiller = new FormAutoFiller();

Logger.info("Auto-Fill Google Forms content script loaded");
Logger.debug("Available field mappings:", autoFiller.getFieldMappings());
Logger.debug("Generated dictionary keys:", Object.keys(autoFiller.dictionary).length);

// ============================================================================
// DOM OBSERVATION & EVENT HANDLING
// ============================================================================
/**
 * MutationObserver to handle dynamically loaded content
 */
const observer = new MutationObserver((mutations) => {
  let shouldCheck = false;

  mutations.forEach((mutation) => {
    if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
      // Check if new form elements were added
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const hasFormElements = node.querySelector && node.querySelector("input, textarea");
          if (hasFormElements) {
            shouldCheck = true;
            break;
          }
        }
      }
    }
  });

  if (shouldCheck) {
    Logger.info("DOM updated with new form elements");
  }
});

// Start observing DOM changes
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

/**
 * Message handler for communication with popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  Logger.debug("Content script received message:", message);

  if (message.action === "fillForm") {
    try {
      const result = autoFiller.fillForm();
      sendResponse(result);
    } catch (error) {
      Logger.error("Error filling form:", error);
      sendResponse({
        success: false,
        message: "Error occurred while filling form: " + error.message,
      });
    }
  } else if (message.action === "getUserProfile") {
    // For future extensibility - get current user profile
    sendResponse({
      success: true,
      profile: autoFiller.getUserProfile(),
    });
  } else if (message.action === "getFieldMappings") {
    // For debugging - get field mappings structure
    sendResponse({
      success: true,
      mappings: autoFiller.getFieldMappings(),
    });
  }

  return true; // Keep the message channel open for async responses
});

/**
 * Page readiness detection
 */
function initializeWhenReady() {
  if (document.readyState === "complete") {
    Logger.info("Google Forms page is ready");
  } else {
    window.addEventListener("load", () => {
      Logger.info("Google Forms page loaded");
    });
  }
}

// Initialize
initializeWhenReady();

// ============================================================================
// EXPORT FOR TESTING (if needed)
// ============================================================================

// Make classes available for testing in development
if (typeof window !== "undefined" && window.location.hostname.includes("localhost")) {
  window.AutoFillClasses = {
    FormDetector,
    FieldMatcher,
    FieldFiller,
    FormAutoFiller,
    CONFIG,
    USER_PROFILE,
    FIELD_MAPPINGS,
  };
}
