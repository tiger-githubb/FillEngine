"use strict";

function detectPageTypeAndAdaptConfig() {
  const url = window.location.href;
  const hostname = window.location.hostname;

  Logger.info(`Detecting page type for: ${url}`);

  if (hostname.includes("docs.google.com") && url.includes("/forms/")) {
    Logger.info("✅ Google Forms page detected - using Google Forms specific selectors");
    CONFIG.containerSelectors = [
      '[role="listitem"]',
      '[data-params*="question"]',
      ".m2",
      ".freebirdFormviewerViewItemsItemItem",
      ".Xb9hP",
      ".geS5n",
      ".AgroKb",
    ];
    CONFIG.questionTextSelectors = [
      '[role="heading"]',
      ".M7eMe",
      ".freebirdFormviewerViewItemsItemItemTitle",
      ".AgroKb .M7eMe",
      'span[dir="auto"]',
      'div[dir="auto"]',
      ".docssharedWizToggleLabeledLabelWrapper",
    ];
    return "google-forms";
  }
  if (hostname === "" || url.startsWith("file://") || hostname.includes("localhost")) {
    Logger.info("✅ Local test page detected - using generic selectors");
    CONFIG.containerSelectors = [
      ".question",
      '[role="listitem"]',
      '[data-params*="question"]',
      "fieldset",
      ".form-group",
      ".question-container",
      "div",
    ];
    CONFIG.questionTextSelectors = ["h3", "label", ".question-title", '[role="heading"]', ".form-label", "legend"];
    return "test-page";
  }
  Logger.info("📄 Generic page detected - using universal selectors");
  CONFIG.containerSelectors = ["fieldset", ".form-group", ".question", '[role="listitem"]', "div"];
  CONFIG.questionTextSelectors = ["label", "legend", "h1", "h2", "h3", "h4", "h5", "h6", ".question-title", ".form-label"];
  return "generic";
}

// USER_PROFILE will be initialized from CSV data
let USER_PROFILE = {
  personal: {},
  contact: {},
  location: {},
  documents: {},
  family: {},
  languages: {},
  professional: {},
  medical: {},
  dates: {},
  misc: {},
  choices: {},
};

const FIELD_MAPPINGS = {
  personal: {
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
    firstName: ["prénom", "prenom", "prenoms", "firstname", "first name", "prenoms candidat", "prenoms du candidat"],
    fullName: ["nom complet", "full name", "nom complet signature", "votre nom complet"],
    gender: ["genre"],
    sex: ["sexe", "homme", "femme"],
  },
  contact: {
    email: ["email", "courriel", "e-mail", "adresse courriel", "adresse mail", "adresse  mail"],
    phone: ["contact", "téléphone", "telephone", "tel", "phone", "numéro téléphone", "numéro de téléphone", "numéro mobile", "mobile"],
  },
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
  family: {
    fatherName: ["nom père", "nom pere", "nom du père", "nom du pere"],
    motherName: ["nom mère", "nom mere", "nom de la mère", "nom de la mere"],
  },
  languages: {
    usual: ["langue usuelle"],
    mother: ["langue maternelle"],
  },
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
  medical: {
    disabilities: ["handicapts", "handicap"],
  },
  signature: [
    "signature",
    "veuillez signer",
    "veuillez signer en écrivant votre nom complet",
    "en signant ce document vous confirmez que toutes les informations que vous avez fournis sont les vôtres et que vous avez correctement suivi la procédure d'inscription.nb toute fausse information entrainera le rejet de votre candidature et le non remboursement des frais d'examens payésveuillez signer en écrivant votre nom complet",
    "en signant ce document vous confirmez",
    "toutes les informations que vous avez fournis",
    "veuillez signer en écrivant",
  ],
  misc: {
    examSubjects: ["sujet d'examen", "sujet examen"],
  },
  choices: {
    idType: ["type de piece d'idententité", "type de pièce d'identité", "type de piece d'identité", "type document", "document type"],
    gender: ["genre"],
    sex: ["sexe"],
    examTypes: ["sujet d'examen", "sujet examen", "sujets d'examen", "sujets examen"],
    examTypesFull: ["sujet d'examen", "sujet examen", "sujets d'examen", "sujets examen"],
    hasDisabilities: ["handicapts", "handicap", "difficultés", "difficultes", "besoins particuliers"],
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

const CONFIG = {
  minMatchScore: 0.7,
  containerSelectors: [
    '[data-params*="question"]',
    '[role="listitem"]',
    ".m2",
    ".freebirdFormviewerViewItemsItemItem",
    ".Xb9hP",
    ".geS5n",
    ".AgroKb",
  ],
  questionTextSelectors: [
    '[role="heading"]',
    ".M7eMe",
    ".freebirdFormviewerViewItemsItemItemTitle",
    ".AgroKb .M7eMe",
    'span[dir="auto"]',
    'div[dir="auto"]',
  ],
  inputSelectors: [
    'input[type="text"]',
    'input[type="email"]',
    'input[type="tel"]',
    'input[type="date"]',
    "select",
    "textarea",
    'input[type="radio"]',
    'input[type="checkbox"]',
    'div[role="radio"]',
    'div[role="checkbox"]',
    'div[role="listbox"]',
    'span[role="radio"]',
    'span[role="checkbox"]',
  ],
  skipFieldTypes: ["time", "datetime-local", "color", "range", "file", "submit", "button", "reset"],
  skipKeywords: ["sélectionn", "choisir"],
  specialKeywords: {
    motifs: ["motifs", "raison", "passez-vous", "test", "académique"],
    signature: ["signer", "nom complet", "confirmez", "document", "veuillez"],
    engagement: ["engagement", "honneur", "responsabilité", "informations"],
  },
};

function generateFlatDictionary() {
  console.log("📖 GENERATING FLAT DICTIONARY");
  console.log("├── USER_PROFILE.personal:", USER_PROFILE.personal);
  console.log("├── USER_PROFILE keys:", Object.keys(USER_PROFILE));
  console.log("└── Full USER_PROFILE:", USER_PROFILE);

  const flatDict = {};

  // Only generate dictionary if USER_PROFILE has data
  if (!USER_PROFILE.personal || Object.keys(USER_PROFILE.personal).length === 0) {
    console.log("❌ USER_PROFILE.personal is empty or undefined");
    console.log("├── USER_PROFILE.personal:", USER_PROFILE.personal);
    console.log("├── Object.keys length:", USER_PROFILE.personal ? Object.keys(USER_PROFILE.personal).length : 0);
    Logger.warn("USER_PROFILE is empty. Please upload CSV data first.");
    return flatDict;
  }

  console.log("✅ USER_PROFILE has data, proceeding with dictionary generation");

  FIELD_MAPPINGS.signature.forEach((key) => {
    flatDict[key] = USER_PROFILE.personal.fullName || "";
  });

  Object.entries(FIELD_MAPPINGS).forEach(([category, fields]) => {
    if (category === "signature") return;
    Object.entries(fields).forEach(([fieldType, variations]) => {
      let value;
      if (category === "dates" && USER_PROFILE.dates && USER_PROFILE.dates[fieldType]) {
        value = USER_PROFILE.dates[fieldType];
      } else if (category === "choices" && USER_PROFILE.choices && USER_PROFILE.choices[fieldType]) {
        value = USER_PROFILE.choices[fieldType];
      } else if (USER_PROFILE[category] && USER_PROFILE[category][fieldType]) {
        value = USER_PROFILE[category][fieldType];
      } else {
        value = "";
      }
      variations.forEach((variation) => {
        flatDict[variation] = value;
      });
    });
  });

  console.log("📖 GENERATED FLAT DICTIONARY:", flatDict);
  console.log("├── Dictionary keys count:", Object.keys(flatDict).length);
  console.log("├── Sample entries:", Object.entries(flatDict).slice(0, 5));

  return flatDict;
}

const Logger = {
  info: (message, ...args) => console.log(`[AutoFill] ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[AutoFill] ${message}`, ...args),
  error: (message, ...args) => console.error(`[AutoFill] ${message}`, ...args),
  debug: (message, ...args) => console.debug(`[AutoFill] ${message}`, ...args),
};

// ============================================================================
// CORE CLASSES
// ============================================================================
class FormDetector {
  static findQuestionContainers() {
    let containers = [];

    for (const selector of CONFIG.containerSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        const validContainers = Array.from(elements).filter((container) => {
          const hasInput = container.querySelector("input, textarea, select");
          const hasText = container.textContent && container.textContent.trim().length > 10;

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

  static extractQuestionLabel(container) {
    let questionText = "";

    for (const selector of CONFIG.questionTextSelectors) {
      const element = container.querySelector(selector);
      if (element && element.textContent.trim()) {
        questionText = element.textContent.trim();
        break;
      }
    }

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

    return questionText.toLowerCase().replace(/\s+/g, " ").replace(/[*:?]/g, "").trim();
  }

  static findInputField(container) {
    let input = container.querySelector(
      [
        'input[type="text"]',
        'input[type="email"]',
        'input[type="tel"]',
        'input[type="date"]',
        "textarea",
        'input[type="radio"]',
        'input[type="checkbox"]',
        "select",
        'div[role="radio"]',
        'div[role="checkbox"]',
        'div[role="listbox"]',
        'span[role="radio"]',
        'span[role="checkbox"]',
      ].join(", ")
    );

    if (!input) {
      const radioGroup = container.querySelector('div[role="radiogroup"]');
      if (radioGroup) {
        const firstRadio = radioGroup.querySelector('div[role="radio"]');
        if (firstRadio) return firstRadio;
      }

      const checkboxGroup = container.querySelector('div[role="group"]');
      if (checkboxGroup) {
        const firstCheckbox = checkboxGroup.querySelector('div[role="checkbox"]');
        if (firstCheckbox) return firstCheckbox;
      }

      const selectGroup = container.querySelector(".jgvuAb");
      if (selectGroup) {
        return selectGroup;
      }
    }

    if (!input) {
      const candidateInput = container.querySelector('input:not([type]), input[type=""]');
      if (candidateInput) {
        const parent = candidateInput.closest('[role="listitem"]') || candidateInput.parentElement;
        const hasSpecialElements =
          parent && parent.querySelector('input[type="file"], input[type="submit"], input[type="button"], input[type="reset"]');
        if (!hasSpecialElements) {
          input = candidateInput;
        }
      }
    }

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

class FieldMatcher {
  constructor(dictionary) {
    this.dictionary = dictionary;
  }

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

  calculateMatchScore(questionLabel, dictKey) {
    const question = questionLabel.toLowerCase().trim();
    const key = dictKey.toLowerCase().trim();

    if (question === key) return 1.0;

    if (question.includes(key)) {
      const ratio = key.length / question.length;
      return Math.min(0.95, 0.6 + ratio * 0.35);
    }

    if (key.includes(question) && question.length > 3) {
      return 0.8;
    }

    for (const [category, keywords] of Object.entries(CONFIG.specialKeywords)) {
      if (key.includes(category) || keywords.some((kw) => key.includes(kw))) {
        const keywordMatches = keywords.filter((kw) => question.includes(kw)).length;
        if (keywordMatches >= 2) {
          return 0.85;
        }
      }
    }

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

    const wordScore = matchingWords / Math.max(questionWords.length, keyWords.length);

    const keyWordsMatched = keyWords.filter((kWord) =>
      questionWords.some((qWord) => qWord === kWord || qWord.includes(kWord) || kWord.includes(qWord))
    ).length;

    const keyWordScore = keyWordsMatched / keyWords.length;

    return wordScore * 0.4 + keyWordScore * 0.6;
  }
}

class FieldFiller {
  static setFieldValue(field, value) {
    if (!field || value === undefined || value === null) {
      return false;
    }

    const role = field.getAttribute("role");
    const fieldType = field.type ? field.type.toLowerCase() : field.tagName.toLowerCase();

    Logger.debug(`Setting field value for type "${fieldType}" with role "${role}": ${value}`);

    if (role === "radio") {
      return this.setGoogleFormsRadioValue(field, value);
    } else if (role === "checkbox") {
      return this.setGoogleFormsCheckboxValue(field, value);
    } else if (role === "listbox" || field.classList.contains("jgvuAb")) {
      return this.setGoogleFormsSelectValue(field, value);
    }

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

  static setTextFieldValue(field, value) {
    if (!field || value === undefined || value === null) {
      return false;
    }

    try {
      field.focus();
      field.value = "";
      field.value = String(value);

      const events = [
        new Event("focus", { bubbles: true }),
        new Event("input", { bubbles: true }),
        new Event("change", { bubbles: true }),
        new Event("blur", { bubbles: true }),
      ];

      events.forEach((event) => field.dispatchEvent(event));

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
      try {
        field.value = String(value);
        return true;
      } catch (e) {
        Logger.error("Fallback value assignment also failed:", e.message);
        return false;
      }
    }
  }

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

  static setRadioValue(radioField, value) {
    try {
      const container = radioField.closest('[role="listitem"]') || radioField.closest('[data-params*="question"]');
      if (!container) {
        Logger.debug("Could not find radio button container");
        return false;
      }

      const radioGroup = container.querySelectorAll(`input[type="radio"][name="${radioField.name}"]`);

      if (radioGroup.length === 0) {
        Logger.debug("No radio group found");
        return false;
      }

      Logger.debug(`Found ${radioGroup.length} radio buttons in group`);

      const targetValue = String(value).toLowerCase().trim();

      for (const radio of radioGroup) {
        const label = this.getRadioLabel(radio);
        if (!label) continue;

        const labelValue = label.toLowerCase().trim();
        Logger.debug(`Comparing "${targetValue}" with radio label "${labelValue}"`);

        if (
          labelValue === targetValue ||
          labelValue.includes(targetValue) ||
          targetValue.includes(labelValue) ||
          this.isRadioValueMatch(targetValue, labelValue)
        ) {
          Logger.info(`✅ Selecting radio button: "${label}"`);

          radio.checked = true;
          radio.focus();

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

  static setGoogleFormsRadioValue(radioField, value) {
    try {
      const radioGroup = radioField.closest('[role="radiogroup"]') || radioField.parentElement;
      if (!radioGroup) {
        Logger.debug("Could not find Google Forms radio group");
        return false;
      }

      const radioOptions = radioGroup.querySelectorAll('[role="radio"]');
      if (radioOptions.length === 0) {
        Logger.debug("No radio options found in Google Forms radio group");
        return false;
      }

      Logger.debug(`Found ${radioOptions.length} Google Forms radio options`);

      const targetValue = String(value).toLowerCase().trim();

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
   * Update user profile data and regenerate dictionary
   * @param {Object} newProfile - New profile data from CSV
   */
  updateUserProfile(newProfile) {
    console.log("🔄 UPDATE USER PROFILE CALLED");
    console.log("├── New profile provided:", !!newProfile);
    console.log("├── Current USER_PROFILE before update:", USER_PROFILE);
    console.log("└── New profile data:", newProfile);

    if (newProfile) {
      // Deep merge new profile data into USER_PROFILE
      Object.keys(newProfile).forEach((category) => {
        console.log(`Processing category: ${category}`, newProfile[category]);
        if (typeof newProfile[category] === "object" && newProfile[category] !== null) {
          if (!USER_PROFILE[category]) {
            USER_PROFILE[category] = {};
          }
          Object.assign(USER_PROFILE[category], newProfile[category]);
          console.log(`✅ Updated USER_PROFILE.${category}:`, USER_PROFILE[category]);
        }
      });

      console.log("📊 FINAL USER_PROFILE AFTER MERGE:", USER_PROFILE);
      console.log("🔄 Regenerating dictionary...");

      this.dictionary = generateFlatDictionary();

      console.log("📖 GENERATED DICTIONARY:", this.dictionary);

      this.fieldMatcher = new FieldMatcher(this.dictionary);

      Logger.info("User profile updated from CSV data");
      Logger.debug("Updated USER_PROFILE:", USER_PROFILE);

      console.log("✅ USER PROFILE UPDATE COMPLETE");
    } else {
      console.log("❌ No new profile provided to updateUserProfile");
    }
  }

  /**
   * Main function to fill the form with dictionary data
   * @returns {Object} Results with success status, message, and statistics
   */
  fillForm() {
    console.log("🚀 FILL FORM PROCESS STARTED");
    console.log("├── USER_PROFILE.personal:", USER_PROFILE.personal);
    console.log("├── USER_PROFILE keys:", Object.keys(USER_PROFILE));
    console.log("└── Dictionary available:", !!this.dictionary);

    Logger.info("Starting form fill process...");

    // Check if user profile has been loaded
    if (!USER_PROFILE.personal || Object.keys(USER_PROFILE.personal).length === 0) {
      console.log("❌ NO USER DATA - form fill aborted");
      console.log("├── USER_PROFILE.personal:", USER_PROFILE.personal);
      console.log("├── Keys length:", USER_PROFILE.personal ? Object.keys(USER_PROFILE.personal).length : 0);

      Logger.error("No user data loaded. Please upload a CSV file first.");
      return {
        success: false,
        message: "Aucune donnée utilisateur chargée. Veuillez d'abord télécharger un fichier CSV.",
        fieldsDetected: 0,
        fieldsFilled: 0,
        supportedFields: 0,
        unsupportedFields: 0,
        fieldsWithoutInput: 0,
        supportedSuccessRate: 0,
        overallSuccessRate: 0,
        detectionResults: [],
      };
    }

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
Logger.info("Extension ready. Upload CSV data to begin form filling.");

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
  console.log("📥 CONTENT SCRIPT RECEIVED MESSAGE:", message);
  console.log("├── Action:", message.action);
  console.log("├── Has userData:", !!message.userData);
  console.log("└── Message sender:", sender);

  if (message.action === "fillForm") {
    try {
      // Log if userData is provided
      if (message.userData) {
        console.log("✅ CSV DATA RECEIVED IN CONTENT SCRIPT");
        console.log("├── Data structure keys:", Object.keys(message.userData));
        console.log("├── Personal data:", message.userData.personal);
        console.log("├── Contact data:", message.userData.contact);
        console.log("└── Full userData:", message.userData);

        Logger.info("CSV data received in content script");
        Logger.debug("CSV data structure:", Object.keys(message.userData));

        console.log("🔄 CALLING updateUserProfile...");
        autoFiller.updateUserProfile(message.userData);

        console.log("🔍 USER_PROFILE AFTER UPDATE:");
        console.log("├── Personal:", USER_PROFILE.personal);
        console.log("├── Contact:", USER_PROFILE.contact);
        console.log("└── Full USER_PROFILE:", USER_PROFILE);
      } else {
        console.log("❌ NO userData PROVIDED IN MESSAGE");
        Logger.warn("No userData provided in message");
      }

      console.log("🚀 CALLING fillForm...");
      const result = autoFiller.fillForm();
      console.log("📊 FORM FILL RESULT:", result);
      Logger.info("Form fill result:", result);
      sendResponse(result);
    } catch (error) {
      console.error("❌ ERROR IN MESSAGE HANDLER:", error);
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
