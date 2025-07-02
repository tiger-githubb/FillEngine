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
// PAGE DETECTION & CONFIGURATION ADAPTATION
// ============================================================================

/**
 * Detect the current page type and adapt configuration accordingly
 */
function detectPageTypeAndAdaptConfig() {
  const url = window.location.href;
  const hostname = window.location.hostname;

  Logger.info(`Detecting page type for: ${url}`);

  // Google Forms detection
  if (hostname.includes("docs.google.com") && url.includes("/forms/")) {
    Logger.info("✅ Google Forms page detected - using Google Forms specific selectors");

    // Adapt selectors specifically for Google Forms
    CONFIG.containerSelectors = [
      '[role="listitem"]', // Main Google Forms question containers
      '[data-params*="question"]', // Google Forms question wrapper
      ".m2", // Google Forms question class
      ".freebirdFormviewerViewItemsItemItem", // Google Forms item wrapper
      ".Xb9hP", // Another Google Forms class
      ".geS5n", // Google Forms container
      ".AgroKb", // Google Forms question container
    ];

    CONFIG.questionTextSelectors = [
      '[role="heading"]', // Google Forms question heading
      ".M7eMe", // Google Forms question text class
      ".freebirdFormviewerViewItemsItemItemTitle", // Google Forms title
      ".AgroKb .M7eMe", // Nested Google Forms question
      'span[dir="auto"]', // Google Forms text direction span
      'div[dir="auto"]', // Google Forms text direction div
      ".docssharedWizToggleLabeledLabelWrapper", // Google Forms label wrapper
    ];

    return "google-forms";
  }

  // Local test page detection
  if (hostname === "" || url.startsWith("file://") || hostname.includes("localhost")) {
    Logger.info("✅ Local test page detected - using generic selectors");

    // Adapt selectors for generic HTML forms
    CONFIG.containerSelectors = [
      ".question", // For our test page
      '[role="listitem"]', // Standard Google Forms
      '[data-params*="question"]', // Google Forms fallback
      "fieldset", // Standard HTML forms
      ".form-group", // Bootstrap forms
      ".question-container", // Custom form containers
      "div", // Generic divs (will be filtered)
    ];

    CONFIG.questionTextSelectors = [
      "h3", // For our test page
      "label", // Standard labels
      ".question-title", // Custom question titles
      '[role="heading"]', // Accessibility heading
      ".form-label", // Bootstrap labels
      "legend", // Fieldset legends
    ];

    return "test-page";
  }

  // Other pages - use generic selectors
  Logger.info("📄 Generic page detected - using universal selectors");
  CONFIG.containerSelectors = ["fieldset", ".form-group", ".question", '[role="listitem"]', "div"];

  CONFIG.questionTextSelectors = ["label", "legend", "h1", "h2", "h3", "h4", "h5", "h6", ".question-title", ".form-label"];

  return "generic";
}

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

  // Dates
  dates: {
    birthDate: "1990-01-15", // Format YYYY-MM-DD pour les champs date HTML
    idExpirationDate: "2030-12-31", // Date d'expiration CNI/Passeport
  },

  // Miscellaneous
  misc: {
    examSubjects: "Tous les sujets",
  },

  // Radio/Checkbox Options (new category)
  choices: {
    // Document type choices
    idType: "CNI", // CNI, Passeport, recépissé

    // Gender choices - exactement comme dans votre Google Form
    gender: "masculin", // masculin, feminin
    sex: "homme", // homme, femme

    // Exam subjects (multiple choice) - exactement comme dans votre Google Form
    examTypes: ["CE", "CO"], // CE, CO, EE, EO pour les codes
    examTypesFull: ["Comprehension écrite", "comprehension orale"], // Noms complets

    // Disabilities - exactement comme dans votre Google Form
    hasDisabilities: "Aucun", // Aucun, Vision

    // Agreement/Engagement checkboxes
    agreement: true, // Cochez la case, engagement sur l'honneur
    termsAccepted: true,

    // Language preferences
    preferredLanguage: "Français", // Français, Anglais, etc.

    // Other yes/no choices
    hasExperience: true,
    needsAccommodation: false,
    isFirstTime: true,
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

  // Dates Mappings
  dates: {
    birthDate: ["date naissance", "date de naissance", "né le", "nee le", "né(e) le", "birthdate", "birth date", "date birth"],
    idExpirationDate: [
      "date expiration",
      "date d'expiration",
      "date d'expiration cni / passeport",
      "date d'expiration cni/passeport",
      "date expiration cni / passeport",
      "date expiration cni/passeport",
      "expire le",
      "expire",
      "validité",
      "valide jusqu'au",
      "valable jusqu'au",
      "expiry date",
      "expiration",
      "fin validité",
      "cni expire",
      "passeport expire",
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

  // Radio/Checkbox Mappings
  choices: {
    // Document type radio buttons
    idType: ["type de piece d'idententité", "type de pièce d'identité", "type de piece d'identité", "type document", "document type"],

    // Gender radio buttons - exactement comme vos questions Google Forms
    gender: ["genre"],
    sex: ["sexe"],

    // Exam types (checkboxes) - exactement comme vos questions Google Forms
    examTypes: ["sujet d'examen", "sujet examen", "sujets d'examen", "sujets examen"],
    examTypesFull: ["sujet d'examen", "sujet examen", "sujets d'examen", "sujets examen"],

    // Disabilities - exactement comme votre question Google Forms
    hasDisabilities: ["handicapts", "handicap", "difficultés", "difficultes", "besoins particuliers"],

    // Agreement/Legal checkboxes
    agreement: [
      "engagement sur l'honneur",
      "engagement sur honneur",
      "cochez la case",
      "j'engage ma responsabilité",
      "je confirme",
      "j'accepte",
    ],

    termsAccepted: [
      "conditions d'utilisation",
      "conditions utilisation",
      "règles de confidentialité",
      "regles confidentialite",
      "accepter les conditions",
      "accepte les termes",
    ],
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

  // Input field selectors (extended to include Google Forms radios and checkboxes)
  inputSelectors: [
    'input[type="text"]',
    'input[type="email"]',
    'input[type="tel"]',
    'input[type="date"]', // Add date inputs
    "select", // Add select elements
    "textarea",
    'input[type="radio"]',
    'input[type="checkbox"]',
    // Google Forms specific selectors
    'div[role="radio"]',
    'div[role="checkbox"]',
    'div[role="listbox"]', // Google Forms dropdowns
    'span[role="radio"]',
    'span[role="checkbox"]',
  ],

  // Field types to skip (removed date, radio and checkbox)
  skipFieldTypes: ["time", "datetime-local", "color", "range", "file", "submit", "button", "reset"],

  // Keywords that indicate special fields to skip (removed date, radio/checkbox keywords)
  skipKeywords: ["sélectionn", "choisir"],

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

      // Special handling for different categories
      if (category === "dates" && USER_PROFILE.dates && USER_PROFILE.dates[fieldType]) {
        value = USER_PROFILE.dates[fieldType];
      } else if (category === "choices" && USER_PROFILE.choices && USER_PROFILE.choices[fieldType]) {
        value = USER_PROFILE.choices[fieldType];
      } else if (USER_PROFILE[category] && USER_PROFILE[category][fieldType]) {
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
        // Filter containers to ensure they have both text and inputs
        const validContainers = Array.from(elements).filter((container) => {
          const hasInput = container.querySelector("input, textarea, select");
          const hasText = container.textContent && container.textContent.trim().length > 10; // Minimum text length

          // For generic 'div' selector, be more strict
          if (selector === "div") {
            const hasQuestionStructure =
              container.querySelector("h1, h2, h3, h4, h5, h6, label, legend") ||
              container.classList.contains("question") ||
              container.getAttribute("role") === "listitem";
            return hasInput && hasText && hasQuestionStructure;
          }

          return hasInput && hasText;
        });

        if (validContainers.length > 0) {
          containers = validContainers;
          Logger.info(`Found ${containers.length} question containers using selector: ${selector}`);
          break;
        }
      }
    }

    // Fallback: find containers that contain both text and input elements
    if (containers.length === 0) {
      const allDivs = document.querySelectorAll("div");
      containers = Array.from(allDivs).filter((div) => {
        const hasInput = div.querySelector("input, textarea");
        const hasText = div.textContent && div.textContent.trim().length > 10;
        const hasQuestionIndicators =
          div.querySelector("h1, h2, h3, h4, h5, h6, label") || div.classList.contains("question") || div.getAttribute("role");
        return hasInput && hasText && hasQuestionIndicators;
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
   * Finds the input field within a question container (all types: text, date, select, radio, checkbox)
   * @param {Element} container - The question container element
   * @returns {Element|null} The input element
   */
  static findInputField(container) {
    // Look for any supported input field types (including date)
    let input = container.querySelector(
      [
        'input[type="text"]',
        'input[type="email"]',
        'input[type="tel"]',
        'input[type="date"]', // Add date inputs
        "textarea",
        'input[type="radio"]',
        'input[type="checkbox"]',
        "select", // Add select elements
        // Google Forms specific selectors
        'div[role="radio"]',
        'div[role="checkbox"]',
        'div[role="listbox"]', // Add Google Forms select
        'span[role="radio"]',
        'span[role="checkbox"]',
      ].join(", ")
    );

    // Special handling for Google Forms radio/checkbox groups
    if (!input) {
      // Look for Google Forms radio groups
      const radioGroup = container.querySelector('div[role="radiogroup"]');
      if (radioGroup) {
        const firstRadio = radioGroup.querySelector('div[role="radio"]');
        if (firstRadio) return firstRadio;
      }

      // Look for Google Forms checkbox groups
      const checkboxGroup = container.querySelector('div[role="group"]');
      if (checkboxGroup) {
        const firstCheckbox = checkboxGroup.querySelector('div[role="checkbox"]');
        if (firstCheckbox) return firstCheckbox;
      }

      // Look for Google Forms select/dropdown
      const selectGroup = container.querySelector(".jgvuAb"); // Google Forms select class
      if (selectGroup) {
        return selectGroup;
      }
    }

    // If not found, try inputs without type (which default to text)
    if (!input) {
      const candidateInput = container.querySelector('input:not([type]), input[type=""]');
      if (candidateInput) {
        // Double-check it's not a special field we want to skip
        const parent = candidateInput.closest('[role="listitem"]') || candidateInput.parentElement;
        const hasSpecialElements =
          parent && parent.querySelector('input[type="file"], input[type="submit"], input[type="button"], input[type="reset"]');
        if (!hasSpecialElements) {
          input = candidateInput;
        }
      }
    }

    // Only skip containers with very specific keywords that indicate unsupported functionality
    if (input) {
      const containerText = container.textContent.toLowerCase();
      const shouldSkip = ["captcha", "file upload", "signature pad"].some((pattern) => containerText.includes(pattern));

      if (shouldSkip) {
        Logger.debug(`Skipping container with unsupported functionality: ${containerText.substring(0, 50)}...`);
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
   * Set the value of a form field based on its type
   * @param {HTMLElement} field - The input field to fill
   * @param {string|boolean|Array} value - The value to set
   * @returns {boolean} Success status
   */
  static setFieldValue(field, value) {
    if (!field || value === undefined || value === null) {
      return false;
    }

    // Check if this is a Google Forms role-based element
    const role = field.getAttribute("role");
    const fieldType = field.type ? field.type.toLowerCase() : field.tagName.toLowerCase();

    Logger.debug(`Setting field value for type "${fieldType}" with role "${role}": ${value}`);

    // Handle Google Forms role-based elements first
    if (role === "radio") {
      return this.setGoogleFormsRadioValue(field, value);
    } else if (role === "checkbox") {
      return this.setGoogleFormsCheckboxValue(field, value);
    } else if (role === "listbox" || field.classList.contains("jgvuAb")) {
      return this.setGoogleFormsSelectValue(field, value);
    }

    // Handle standard HTML form elements
    switch (fieldType) {
      case "radio":
        return this.setRadioValue(field, value);
      case "checkbox":
        return this.setCheckboxValue(field, value);
      case "date":
        return this.setDateFieldValue(field, value);
      case "select":
        return this.setSelectFieldValue(field, value);
      case "text":
      case "email":
      case "tel":
      case "textarea":
      default:
        return this.setTextFieldValue(field, value);
    }
  }

  /**
   * Set the value of a text-based input field
   * @param {HTMLElement} field - The input field to fill
   * @param {string} value - The value to set
   * @returns {boolean} Success status
   */
  static setTextFieldValue(field, value) {
    if (!field || value === undefined || value === null) {
      return false;
    }

    try {
      // Focus the field first
      field.focus();

      // Clear existing value
      field.value = "";

      // Set the new value
      field.value = String(value);

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
          nativeInputValueSetter.call(field, String(value));
          const reactInputEvent = new Event("input", { bubbles: true });
          field.dispatchEvent(reactInputEvent);
        }
      } catch (e) {
        Logger.debug("React setter failed (normal for textareas):", e.message);
      }

      return true;
    } catch (error) {
      Logger.error(`Error setting text field value: ${error.message}`);
      // Fallback: simple value assignment
      try {
        field.value = String(value);
        return true;
      } catch (e) {
        Logger.error("Fallback value assignment also failed:", e.message);
        return false;
      }
    }
  }

  /**
   * Set the value of a date input field
   * @param {HTMLElement} field - The date input field
   * @param {string} value - The date value to set (should be in YYYY-MM-DD format)
   * @returns {boolean} Success status
   */
  static setDateFieldValue(field, value) {
    if (!field || value === undefined || value === null) {
      return false;
    }

    try {
      // Focus the field first
      field.focus();

      // Set the date value (input[type="date"] expects YYYY-MM-DD format)
      field.value = String(value);

      // Trigger events that forms expect
      const events = [
        new Event("focus", { bubbles: true }),
        new Event("input", { bubbles: true }),
        new Event("change", { bubbles: true }),
        new Event("blur", { bubbles: true }),
      ];

      events.forEach((event) => field.dispatchEvent(event));

      Logger.info(`✅ Date field set to: ${value}`);
      return true;
    } catch (error) {
      Logger.error(`Error setting date field value: ${error.message}`);
      return false;
    }
  }

  /**
   * Set the value of a select field
   * @param {HTMLElement} field - The select field
   * @param {string} value - The value to select
   * @returns {boolean} Success status
   */
  static setSelectFieldValue(field, value) {
    if (!field || value === undefined || value === null) {
      return false;
    }

    try {
      const targetValue = String(value).toLowerCase().trim();

      // Find matching option
      const options = field.querySelectorAll("option");
      let matchFound = false;

      for (const option of options) {
        const optionText = option.textContent.toLowerCase().trim();
        const optionValue = option.value.toLowerCase().trim();

        if (
          optionText === targetValue ||
          optionValue === targetValue ||
          optionText.includes(targetValue) ||
          targetValue.includes(optionText)
        ) {
          option.selected = true;
          field.value = option.value;
          matchFound = true;

          // Trigger change event
          field.dispatchEvent(new Event("change", { bubbles: true }));

          Logger.info(`✅ Select option selected: "${option.textContent}"`);
          break;
        }
      }

      if (!matchFound) {
        Logger.debug(`No matching option found for: "${value}"`);
      }

      return matchFound;
    } catch (error) {
      Logger.error(`Error setting select field value: ${error.message}`);
      return false;
    }
  }

  /**
   * Set the value of a Google Forms select/dropdown field
   * @param {HTMLElement} field - The Google Forms dropdown element
   * @param {string} value - The value to select
   * @returns {boolean} Success status
   */
  static setGoogleFormsSelectValue(field, value) {
    if (!field || value === undefined || value === null) {
      return false;
    }

    try {
      const targetValue = String(value).toLowerCase().trim();

      Logger.debug(`Attempting to set Google Forms dropdown to: "${value}"`);

      // First, try to find options directly
      let options = field.querySelectorAll('[role="option"]');

      // If no options found, try to open the dropdown first
      if (options.length === 0) {
        field.focus();
        field.click();

        // Trigger some events that might help open the dropdown
        const events = ["mousedown", "mouseup", "click"];
        events.forEach((eventType) => {
          field.dispatchEvent(new MouseEvent(eventType, { bubbles: true }));
        });

        // Try to find options again
        options = field.querySelectorAll('[role="option"]');
      }

      let matchFound = false;

      Logger.debug(`Found ${options.length} options in Google Forms dropdown`);

      for (const option of options) {
        const optionText = option.textContent.toLowerCase().trim();
        const dataValue = option.getAttribute("data-value");
        const dataValueLower = dataValue ? dataValue.toLowerCase().trim() : "";

        Logger.debug(`Checking option: text="${optionText}", data-value="${dataValueLower}"`);

        // Skip the placeholder "Sélectionner" option
        if (optionText === "sélectionner" || optionText === "select") {
          continue;
        }

        if (
          optionText === targetValue ||
          dataValueLower === targetValue ||
          optionText.includes(targetValue) ||
          targetValue.includes(optionText) ||
          (dataValue && (dataValueLower.includes(targetValue) || targetValue.includes(dataValueLower)))
        ) {
          // Click the option to select it
          option.click();

          // Also trigger mouse events
          option.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
          option.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
          option.dispatchEvent(new MouseEvent("click", { bubbles: true }));

          // Set aria-selected attribute
          option.setAttribute("aria-selected", "true");

          // Update other options to be unselected
          options.forEach((opt) => {
            if (opt !== option) {
              opt.setAttribute("aria-selected", "false");
            }
          });

          matchFound = true;

          Logger.info(`✅ Google Forms dropdown option selected: "${option.textContent}"`);
          break;
        }
      }

      if (!matchFound) {
        Logger.debug(`No matching option found in Google Forms dropdown for: "${value}"`);
        Logger.debug(
          `Available options:`,
          Array.from(options).map((opt) => `"${opt.textContent}" (data-value: "${opt.getAttribute("data-value")}")`)
        );
      }

      return matchFound;
    } catch (error) {
      Logger.error(`Error setting Google Forms select field value: ${error.message}`);
      return false;
    }
  }

  /**
   * Set the value of a radio button
   * @param {HTMLElement} radioField - The radio button field
   * @param {string} value - The value to match
   * @returns {boolean} Success status
   */
  static setRadioValue(radioField, value) {
    try {
      const container = radioField.closest('[role="listitem"]') || radioField.closest('[data-params*="question"]');
      if (!container) {
        Logger.debug("Could not find radio button container");
        return false;
      }

      // Find all radio buttons in the same group (same name attribute)
      const radioGroup = container.querySelectorAll(`input[type="radio"][name="${radioField.name}"]`);

      if (radioGroup.length === 0) {
        Logger.debug("No radio group found");
        return false;
      }

      Logger.debug(`Found ${radioGroup.length} radio buttons in group`);

      // Convert value to lowercase for comparison
      const targetValue = String(value).toLowerCase().trim();

      // Try to find a matching radio button
      for (const radio of radioGroup) {
        // Get the label text for this radio button
        const label = this.getRadioLabel(radio);
        if (!label) continue;

        const labelValue = label.toLowerCase().trim();
        Logger.debug(`Comparing "${targetValue}" with radio label "${labelValue}"`);

        // Check for exact match or partial match
        if (
          labelValue === targetValue ||
          labelValue.includes(targetValue) ||
          targetValue.includes(labelValue) ||
          this.isRadioValueMatch(targetValue, labelValue)
        ) {
          Logger.info(`✅ Selecting radio button: "${label}"`);

          // Select the radio button
          radio.checked = true;
          radio.focus();

          // Dispatch events
          const events = [
            new Event("change", { bubbles: true }),
            new Event("click", { bubbles: true }),
            new Event("input", { bubbles: true }),
          ];

          events.forEach((event) => radio.dispatchEvent(event));

          return true;
        }
      }

      Logger.debug(`No matching radio button found for value: "${targetValue}"`);
      return false;
    } catch (error) {
      Logger.error(`Error setting radio value: ${error.message}`);
      return false;
    }
  }

  /**
   * Set the value of a Google Forms radio button (role="radio")
   * @param {HTMLElement} radioField - The div with role="radio"
   * @param {string} value - The value to match
   * @returns {boolean} Success status
   */
  static setGoogleFormsRadioValue(radioField, value) {
    try {
      // Find the radio group container
      const radioGroup = radioField.closest('[role="radiogroup"]') || radioField.parentElement;
      if (!radioGroup) {
        Logger.debug("Could not find Google Forms radio group");
        return false;
      }

      // Find all radio options in the group
      const radioOptions = radioGroup.querySelectorAll('[role="radio"]');
      if (radioOptions.length === 0) {
        Logger.debug("No radio options found in Google Forms radio group");
        return false;
      }

      Logger.debug(`Found ${radioOptions.length} Google Forms radio options`);

      const targetValue = String(value).toLowerCase().trim();

      // Try to find a matching radio option
      for (const radio of radioOptions) {
        const label = this.getGoogleFormsLabel(radio);
        const dataValue = radio.getAttribute("data-value");

        if (!label && !dataValue) continue;

        const labelValue = label ? label.toLowerCase().trim() : "";
        const dataValueLower = dataValue ? dataValue.toLowerCase().trim() : "";

        Logger.debug(`Comparing "${targetValue}" with Google Forms radio: label="${labelValue}", data-value="${dataValueLower}"`);

        // Check for exact match or partial match
        if (
          labelValue === targetValue ||
          dataValueLower === targetValue ||
          labelValue.includes(targetValue) ||
          dataValueLower.includes(targetValue) ||
          targetValue.includes(labelValue) ||
          this.isRadioValueMatch(targetValue, labelValue) ||
          this.isRadioValueMatch(targetValue, dataValueLower)
        ) {
          Logger.info(`✅ Selecting Google Forms radio: "${label || dataValue}"`);

          // Select the radio option
          radio.setAttribute("aria-checked", "true");
          radio.click();

          // Find and trigger the actual hidden input if it exists
          const hiddenInput = radioGroup.querySelector('input[type="radio"]');
          if (hiddenInput) {
            hiddenInput.checked = true;
            hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
          }

          return true;
        }
      }

      Logger.debug(`No matching Google Forms radio found for value: "${targetValue}"`);
      return false;
    } catch (error) {
      Logger.error(`Error setting Google Forms radio value: ${error.message}`);
      return false;
    }
  }

  /**
   * Set the value of a Google Forms checkbox (role="checkbox")
   * @param {HTMLElement} checkboxField - The div with role="checkbox"
   * @param {boolean|string|Array} value - The value to set
   * @returns {boolean} Success status
   */
  static setGoogleFormsCheckboxValue(checkboxField, value) {
    try {
      // Handle array values (multiple checkboxes)
      if (Array.isArray(value)) {
        return this.setGoogleFormsMultipleCheckboxValues(checkboxField, value);
      }

      // Handle single checkbox value
      let shouldCheck = false;

      if (typeof value === "boolean") {
        shouldCheck = value;
      } else if (typeof value === "string") {
        const lowerValue = value.toLowerCase().trim();
        shouldCheck =
          lowerValue === "true" ||
          lowerValue === "oui" ||
          lowerValue === "yes" ||
          lowerValue === "1" ||
          lowerValue === "coché" ||
          lowerValue === "checked";
      }

      Logger.debug(`Setting Google Forms checkbox to: ${shouldCheck}`);

      // Set checkbox state
      checkboxField.setAttribute("aria-checked", shouldCheck.toString());
      checkboxField.click();

      // Find and trigger the actual hidden input if it exists
      const container = checkboxField.closest('[role="group"]') || checkboxField.parentElement;
      const hiddenInput = container?.querySelector('input[type="checkbox"]');
      if (hiddenInput) {
        hiddenInput.checked = shouldCheck;
        hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
      }

      Logger.info(`✅ Google Forms checkbox set to: ${shouldCheck}`);
      return true;
    } catch (error) {
      Logger.error(`Error setting Google Forms checkbox value: ${error.message}`);
      return false;
    }
  }

  /**
   * Set multiple Google Forms checkbox values based on an array
   * @param {HTMLElement} checkboxField - A checkbox element in the group
   * @param {Array} values - Array of values to check
   * @returns {boolean} Success status
   */
  static setGoogleFormsMultipleCheckboxValues(checkboxField, values) {
    if (!Array.isArray(values)) {
      return false;
    }

    try {
      // Find the checkbox group container
      const checkboxGroup = checkboxField.closest('[role="group"]') || checkboxField.parentElement;
      if (!checkboxGroup) {
        Logger.debug("Could not find Google Forms checkbox group");
        return false;
      }

      const checkboxes = checkboxGroup.querySelectorAll('[role="checkbox"]');
      let successCount = 0;

      // Get all available options to determine format
      const availableOptions = Array.from(checkboxes)
        .map((checkbox) => {
          const label = this.getGoogleFormsLabel(checkbox);
          return label ? label.toLowerCase().trim() : "";
        })
        .filter((label) => label);

      Logger.debug(`Available Google Forms checkbox options:`, availableOptions);

      // Determine format and choose appropriate values
      const isCodesFormat = availableOptions.some((option) => ["ce", "co", "ee", "eo"].includes(option));
      const isFullNamesFormat = availableOptions.some((option) => option.includes("comprehension") || option.includes("expression"));

      Logger.debug(`Google Forms format - Codes: ${isCodesFormat}, Full names: ${isFullNamesFormat}`);

      let valuesToUse = [];
      if (isCodesFormat) {
        valuesToUse = USER_PROFILE.choices.examTypes; // ["CE", "CO"]
      } else if (isFullNamesFormat) {
        valuesToUse = USER_PROFILE.choices.examTypesFull; // ["Comprehension écrite", "comprehension orale"]
      } else {
        valuesToUse = values;
      }

      Logger.debug(`Using values for Google Forms matching:`, valuesToUse);

      valuesToUse.forEach((value) => {
        const targetValue = String(value).toLowerCase().trim();

        for (const checkbox of checkboxes) {
          const label = this.getGoogleFormsLabel(checkbox);
          const dataValue = checkbox.getAttribute("data-value");

          if (!label && !dataValue) continue;

          const labelValue = label ? label.toLowerCase().trim() : "";
          const dataValueLower = dataValue ? dataValue.toLowerCase().trim() : "";

          // Enhanced matching logic
          if (this.isCheckboxValueMatch(targetValue, labelValue) || this.isCheckboxValueMatch(targetValue, dataValueLower)) {
            checkbox.setAttribute("aria-checked", "true");
            checkbox.click();

            // Find and trigger hidden input
            const hiddenInput =
              checkbox.querySelector('input[type="checkbox"]') || checkbox.parentElement.querySelector('input[type="checkbox"]');
            if (hiddenInput) {
              hiddenInput.checked = true;
              hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
            }

            successCount++;
            Logger.info(`✅ Checked Google Forms checkbox: "${label || dataValue}"`);
            break;
          }
        }
      });

      return successCount > 0;
    } catch (error) {
      Logger.error(`Error setting Google Forms multiple checkbox values: ${error.message}`);
      return false;
    }
  }

  /**
   * Get the label text for a Google Forms element (role="radio" or role="checkbox")
   * @param {HTMLElement} element - The element with role="radio" or role="checkbox"
   * @returns {string|null} The label text or null
   */
  static getGoogleFormsLabel(element) {
    try {
      // Method 1: Check for span with dir="auto" (most common in Google Forms)
      let span = element.querySelector('span[dir="auto"]');
      if (span && span.textContent.trim()) {
        return span.textContent.trim();
      }

      // Method 2: Check for aria-label
      if (element.getAttribute("aria-label")) {
        return element.getAttribute("aria-label");
      }

      // Method 3: Check for data-value
      if (element.getAttribute("data-value")) {
        return element.getAttribute("data-value");
      }

      // Method 4: Get text content directly
      const text = element.textContent.trim();
      if (text) return text;

      // Method 5: Check parent element
      const parent = element.parentElement;
      if (parent) {
        const parentSpan = parent.querySelector('span[dir="auto"]');
        if (parentSpan && parentSpan.textContent.trim()) {
          return parentSpan.textContent.trim();
        }
      }

      return null;
    } catch (error) {
      Logger.debug(`Error getting Google Forms label: ${error.message}`);
      return null;
    }
  }

  /**
   * Set the value of a checkbox
   * @param {HTMLElement} checkboxField - The checkbox field
   * @param {boolean|string|Array} value - The value to set (true/false, "true"/"false", or array for multiple)
   * @returns {boolean} Success status
   */
  static setCheckboxValue(checkboxField, value) {
    try {
      const container = checkboxField.closest('[role="listitem"]') || checkboxField.closest('[data-params*="question"]');

      // Handle array values (multiple checkboxes)
      if (Array.isArray(value)) {
        return this.setMultipleCheckboxValues(container, value);
      }

      // Handle single checkbox value
      let shouldCheck = false;

      if (typeof value === "boolean") {
        shouldCheck = value;
      } else if (typeof value === "string") {
        const lowerValue = value.toLowerCase().trim();
        // Handle various representations of true/false
        shouldCheck =
          lowerValue === "true" ||
          lowerValue === "oui" ||
          lowerValue === "yes" ||
          lowerValue === "1" ||
          lowerValue === "coché" ||
          lowerValue === "checked";
      }

      Logger.debug(`Setting checkbox to: ${shouldCheck}`);

      // Set checkbox state
      checkboxField.checked = shouldCheck;
      checkboxField.focus();

      // Dispatch events
      const events = [
        new Event("change", { bubbles: true }),
        new Event("click", { bubbles: true }),
        new Event("input", { bubbles: true }),
      ];

      events.forEach((event) => checkboxField.dispatchEvent(event));

      Logger.info(`✅ Checkbox set to: ${shouldCheck}`);
      return true;
    } catch (error) {
      Logger.error(`Error setting checkbox value: ${error.message}`);
      return false;
    }
  }

  /**
   * Set multiple checkbox values based on an array
   * @param {HTMLElement} container - The question container
   * @param {Array} values - Array of values to check
   * @returns {boolean} Success status
   */
  static setMultipleCheckboxValues(container, values) {
    if (!container || !Array.isArray(values)) {
      return false;
    }

    try {
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      let successCount = 0;

      // Get all available options in this container to determine the format
      const availableOptions = Array.from(checkboxes)
        .map((checkbox) => {
          const label = this.getCheckboxLabel(checkbox);
          return label ? label.toLowerCase().trim() : "";
        })
        .filter((label) => label);

      Logger.debug(`Available checkbox options:`, availableOptions);

      // Determine if this is a "codes" question (CE, CO, EE, EO) or "full names" question
      const isCodesFormat = availableOptions.some((option) => ["ce", "co", "ee", "eo"].includes(option));

      const isFullNamesFormat = availableOptions.some((option) => option.includes("comprehension") || option.includes("expression"));

      Logger.debug(`Question format - Codes: ${isCodesFormat}, Full names: ${isFullNamesFormat}`);

      // Choose the appropriate value set
      let valuesToUse = [];
      if (isCodesFormat) {
        // Use the short codes: CE, CO
        valuesToUse = USER_PROFILE.choices.examTypes; // ["CE", "CO"]
      } else if (isFullNamesFormat) {
        // Use the full names: Comprehension écrite, comprehension orale
        valuesToUse = USER_PROFILE.choices.examTypesFull; // ["Comprehension écrite", "comprehension orale"]
      } else {
        // Fallback to the original values
        valuesToUse = values;
      }

      Logger.debug(`Using values for matching:`, valuesToUse);

      valuesToUse.forEach((value) => {
        const targetValue = String(value).toLowerCase().trim();

        for (const checkbox of checkboxes) {
          const label = this.getCheckboxLabel(checkbox);
          if (!label) continue;

          const labelValue = label.toLowerCase().trim();

          // Enhanced matching logic
          if (this.isCheckboxValueMatch(targetValue, labelValue)) {
            checkbox.checked = true;
            checkbox.focus();

            const events = [
              new Event("change", { bubbles: true }),
              new Event("click", { bubbles: true }),
              new Event("input", { bubbles: true }),
            ];

            events.forEach((event) => checkbox.dispatchEvent(event));
            successCount++;
            Logger.info(`✅ Checked checkbox: "${label}"`);
            break;
          }
        }
      });

      return successCount > 0;
    } catch (error) {
      Logger.error(`Error setting multiple checkbox values: ${error.message}`);
      return false;
    }
  }

  /**
   * Get the label text for a radio button
   * @param {HTMLElement} radio - The radio button element
   * @returns {string|null} The label text or null
   */
  static getRadioLabel(radio) {
    try {
      // Method 1: Check for sibling label or span
      let label = radio.nextElementSibling;
      if (label && (label.tagName === "LABEL" || label.tagName === "SPAN")) {
        return label.textContent.trim();
      }

      // Method 2: Check parent for text content
      const parent = radio.parentElement;
      if (parent) {
        // Clone parent and remove the radio input to get just the text
        const clone = parent.cloneNode(true);
        const radioClone = clone.querySelector('input[type="radio"]');
        if (radioClone) radioClone.remove();
        const text = clone.textContent.trim();
        if (text) return text;
      }

      // Method 3: Look for aria-label
      if (radio.getAttribute("aria-label")) {
        return radio.getAttribute("aria-label");
      }

      // Method 4: Look for associated label by ID
      if (radio.id) {
        const labelElement = document.querySelector(`label[for="${radio.id}"]`);
        if (labelElement) return labelElement.textContent.trim();
      }

      return null;
    } catch (error) {
      Logger.debug(`Error getting radio label: ${error.message}`);
      return null;
    }
  }

  /**
   * Get the label text for a checkbox
   * @param {HTMLElement} checkbox - The checkbox element
   * @returns {string|null} The label text or null
   */
  static getCheckboxLabel(checkbox) {
    // Use the same logic as radio buttons
    return this.getRadioLabel(checkbox);
  }

  /**
   * Check if a radio value matches using smart comparison
   * @param {string} targetValue - The value we're looking for
   * @param {string} labelValue - The label value to compare against
   * @returns {boolean} Whether they match
   */
  static isRadioValueMatch(targetValue, labelValue) {
    // Define common equivalences
    const equivalences = {
      masculin: ["homme", "male", "masculin", "m"],
      feminin: ["femme", "female", "feminin", "féminin", "f"],
      homme: ["masculin", "male", "homme", "m"],
      femme: ["feminin", "female", "femme", "féminin", "f"],
      cni: ["carte nationale", "carte identité", "cni", "carte d'identité"],
      passeport: ["passeport", "passport"],
      français: ["français", "francais", "french", "france"],
      anglais: ["anglais", "english", "english language"],
      // Add disability equivalences for radio buttons
      aucun: ["aucun", "aucune", "non", "pas de handicap", "sans handicap"],
      vision: ["vision", "visuel", "vue", "malvoyant", "aveugle"],
    };

    // Check direct equivalences
    for (const [key, values] of Object.entries(equivalences)) {
      if (values.includes(targetValue) && values.includes(labelValue)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if a checkbox value matches using smart comparison
   * @param {string} targetValue - The value we're looking for
   * @param {string} labelValue - The label value to compare against
   * @returns {boolean} Whether they match
   */
  static isCheckboxValueMatch(targetValue, labelValue) {
    // First try basic matching
    if (labelValue === targetValue || labelValue.includes(targetValue) || targetValue.includes(labelValue)) {
      return true;
    }

    // Define exam subject equivalences
    const examEquivalences = {
      ce: ["ce", "comprehension écrite", "comprehension ecrite", "compréhension écrite", "compréhension ecrite"],
      co: ["co", "comprehension orale", "compréhension orale"],
      ee: ["ee", "expression écrite", "expression ecrite"],
      eo: ["eo", "expression orale"],
      "comprehension écrite": ["ce", "comprehension écrite", "comprehension ecrite", "compréhension écrite", "compréhension ecrite"],
      "comprehension orale": ["co", "comprehension orale", "compréhension orale"],
      "expression écrite": ["ee", "expression écrite", "expression ecrite"],
      "expression orale": ["eo", "expression orale"],
    };

    // Check exam subject equivalences
    for (const [key, values] of Object.entries(examEquivalences)) {
      if (values.includes(targetValue) && values.includes(labelValue)) {
        return true;
      }
    }

    // Check for disability matches
    const disabilityEquivalences = {
      aucun: ["aucun", "aucune", "non", "pas de handicap", "sans handicap"],
      vision: ["vision", "visuel", "vue", "malvoyant", "aveugle"],
    };

    for (const [key, values] of Object.entries(disabilityEquivalences)) {
      if (values.includes(targetValue) && values.includes(labelValue)) {
        return true;
      }
    }

    return false;
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

      // Count ALL containers with valid question labels as detected fields
      this.statistics.fieldsDetected++;

      // Find ANY type of input field (text, date, select, radio, checkbox)
      const inputField = FormDetector.findInputField(container);

      let matchFound = false;
      let matchedKey = "";
      let matchedValue = "";
      let inputType = "unknown";
      let fieldCategory = "unknown";

      if (inputField) {
        inputType = inputField.type || inputField.tagName.toLowerCase() || inputField.getAttribute("role") || "element";

        // Categorize the field type for better statistics
        if (inputType === "date") {
          fieldCategory = "date";
        } else if (
          inputType === "select" ||
          inputField.querySelector('[role="listbox"]') ||
          container.querySelector('[role="listbox"]')
        ) {
          fieldCategory = "select";
        } else if (inputType === "radio" || inputField.getAttribute("role") === "radio" || container.querySelector('[role="radio"]')) {
          fieldCategory = "radio";
        } else if (
          inputType === "checkbox" ||
          inputField.getAttribute("role") === "checkbox" ||
          container.querySelector('[role="checkbox"]')
        ) {
          fieldCategory = "checkbox";
        } else if (inputType === "text" || inputType === "email" || inputType === "tel" || inputType === "textarea") {
          fieldCategory = "text";
        } else {
          fieldCategory = "other";
        }

        // Only try to fill supported field types (NOW INCLUDING date and select)
        if (
          fieldCategory === "text" ||
          fieldCategory === "radio" ||
          fieldCategory === "checkbox" ||
          fieldCategory === "date" ||
          fieldCategory === "select"
        ) {
          // Try exact match first
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
        } else {
          Logger.debug(`⏭️ Skipped question ${index + 1}: unsupported field type "${fieldCategory}" (${inputType})`);
        }
      } else {
        Logger.debug(`⏭️ Skipped question ${index + 1}: no input field found`);
        inputType = "no-input-field";
        fieldCategory = "no-input";
      }

      // Store detection result for ALL questions
      this.statistics.detectionResults.push({
        questionLabel,
        matched: matchFound,
        key: matchedKey,
        value: matchedValue,
        inputType: inputType,
        fieldCategory: fieldCategory,
        hasInputField: !!inputField,
      });
    });

    // Calculate comprehensive statistics
    const supportedFields = this.statistics.detectionResults.filter(
      (r) =>
        r.fieldCategory === "text" ||
        r.fieldCategory === "radio" ||
        r.fieldCategory === "checkbox" ||
        r.fieldCategory === "date" ||
        r.fieldCategory === "select"
    ).length;

    const unsupportedFields = this.statistics.detectionResults.filter((r) => r.fieldCategory === "other").length;

    const fieldsWithoutInput = this.statistics.detectionResults.filter((r) => !r.hasInputField).length;

    const supportedSuccessRate = supportedFields > 0 ? Math.round((this.statistics.fieldsFilled / supportedFields) * 100) : 0;
    const overallSuccessRate =
      this.statistics.fieldsDetected > 0 ? Math.round((this.statistics.fieldsFilled / this.statistics.fieldsDetected) * 100) : 0;

    Logger.info(
      `Form fill complete: ${this.statistics.fieldsFilled}/${supportedFields} champs supportés remplis, ${unsupportedFields} champs non supportés, ${fieldsWithoutInput} sans champ d'entrée (Total: ${this.statistics.fieldsDetected} questions)`
    );
    Logger.debug("Detection results:", this.statistics.detectionResults);

    return {
      success: true,
      message: `Analysé ${this.statistics.fieldsDetected} questions - Rempli ${this.statistics.fieldsFilled} champs (${overallSuccessRate}%)`,
      fieldsDetected: this.statistics.fieldsDetected,
      fieldsFilled: this.statistics.fieldsFilled,
      supportedFields: supportedFields,
      unsupportedFields: unsupportedFields,
      fieldsWithoutInput: fieldsWithoutInput,
      supportedSuccessRate: supportedSuccessRate,
      overallSuccessRate: overallSuccessRate,
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

// Detect page type and adapt configuration
const pageType = detectPageTypeAndAdaptConfig();

// Initialize the form auto-filler
const autoFiller = new FormAutoFiller();

Logger.info(`Auto-Fill extension loaded for ${pageType}`);
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
    Logger.info(`Page is ready (${pageType})`);
  } else {
    window.addEventListener("load", () => {
      Logger.info(`Page loaded (${pageType})`);
    });
  }
}

// Initialize
initializeWhenReady();
