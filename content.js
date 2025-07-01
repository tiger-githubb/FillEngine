/**
 * Content Script for Auto-Fill Google Forms Extension
 * Runs on all Google Forms pages and handles form filling logic
 */

// Hard-coded dictionary with form data - Informations d'un candidat africain
const DICT = {
  // Noms et prénoms
  nom: "KONE",
  noms: "KONE",
  name: "KONE",
  lastname: "KONE",
  "last name": "KONE",
  "nom candidat": "KONE",
  "noms candidat": "KONE",
  "noms du candidat": "KONE",
  "noms du candidats": "KONE",
  prénom: "Amadou",
  prenom: "Amadou",
  prenoms: "Amadou",
  firstname: "Amadou",
  "first name": "Amadou",
  "prenoms candidat": "Amadou",
  "prenoms du candidat": "Amadou",
  "nom complet": "Amadou KONE",
  "full name": "Amadou KONE",

  // Contact et communication
  email: "amadou.kone@example.com",
  courriel: "amadou.kone@example.com",
  "e-mail": "amadou.kone@example.com",
  "adresse courriel": "amadou.kone@example.com",
  "adresse mail": "amadou.kone@example.com",
  "adresse  mail": "amadou.kone@example.com",
  contact: "+225 07 08 09 10 11",
  téléphone: "+225 07 08 09 10 11",
  telephone: "+225 07 08 09 10 11",
  tel: "+225 07 08 09 10 11",
  "numéro téléphone": "+225 07 08 09 10 11",
  "numéro de téléphone": "+225 07 08 09 10 11",
  phone: "+225 07 08 09 10 11",
  "numéro mobile": "+225 07 08 09 10 11",
  mobile: "+225 07 08 09 10 11",

  // Lieu de naissance et résidence
  "lieu naissance": "Abidjan",
  "lieu de naissance": "Abidjan",
  "ville naissance": "Abidjan",
  "ville de naissance": "Abidjan",
  "pays naissance": "Côte d'Ivoire",
  "pays de naissance": "Côte d'Ivoire",
  "lieu résidence": "Yamoussoukro",
  "lieu de résidence": "Yamoussoukro",
  "lieu de residence": "Yamoussoukro",
  "lieu de résidence ": "Yamoussoukro",
  "ville résidence": "Yamoussoukro",
  "ville de résidence": "Yamoussoukro",
  "ville de residence": "Yamoussoukro",
  "ville de résidence ": "Yamoussoukro",
  ville: "Yamoussoukro",
  city: "Yamoussoukro",
  nationalité: "Ivoirienne",
  country: "Côte d'Ivoire",

  // Documents d'identité - Plus de variantes
  "numéro cni": "CI1234567890",
  "numero cni": "CI1234567890",
  "numéro passeport": "CI1234567890",
  "numero passeport": "CI1234567890",
  "numéro pièce": "CI1234567890",
  "numero piece": "CI1234567890",
  "numéro de la pièce": "CI1234567890",
  "numéro de la piece": "CI1234567890",
  "numéro pièce identité": "CI1234567890",
  "numero piece identite": "CI1234567890",
  "numéro de la pièce d'identité": "CI1234567890",
  "numéro de la piece d'identité": "CI1234567890",
  "numéro de la piece d'idententité": "CI1234567890",
  "n° cni": "CI1234567890",
  "n° passeport": "CI1234567890",
  cni: "CI1234567890",
  passeport: "CI1234567890",
  "numéro cni / passeport": "CI1234567890",
  "numero cni / passeport": "CI1234567890",

  // Famille
  "nom père": "Sekou KONE",
  "nom pere": "Sekou KONE",
  "nom du père": "Sekou KONE",
  "nom du pere": "Sekou KONE",
  "nom mère": "Fatoumata TRAORE",
  "nom mere": "Fatoumata TRAORE",
  "nom de la mère": "Fatoumata TRAORE",
  "nom de la mere": "Fatoumata TRAORE",

  // Langues
  "langue usuelle": "Français",
  "langue maternelle": "Baoulé",

  // Motifs et examens - Plus de variantes
  motif: "Académique - Poursuite d'études supérieures en France",
  motifs: "Académique - Poursuite d'études supérieures en France",
  raison: "Académique - Poursuite d'études supérieures en France",
  "pour quelle raison": "Académique - Poursuite d'études supérieures en France",
  "quelle raison": "Académique - Poursuite d'études supérieures en France",
  "passez-vous ce test": "Académique - Poursuite d'études supérieures en France",
  "pour quelle raison passez-vous ce test": "Académique - Poursuite d'études supérieures en France",

  // Examens spécifiques
  "sujet d'examen": "Tous les sujets",
  "sujet examen": "Tous les sujets",

  // Genre et sexe
  genre: "Masculin",
  sexe: "Homme",

  // Handicaps
  handicapts: "Aucun",
  handicap: "Aucun",

  // Signature et engagement
  "nom complet signature": "Amadou KONE",
  "votre nom complet": "Amadou KONE",
  signature: "Amadou KONE",
  "veuillez signer": "Amadou KONE",
  "veuillez signer en écrivant votre nom complet": "Amadou KONE",

  // Autres informations
  adresse: "Cocody, Abidjan, Côte d'Ivoire",
  address: "Cocody, Abidjan, Côte d'Ivoire",
  profession: "Ingénieur informatique",
  company: "Orange Côte d'Ivoire",
};

console.log("Auto-Fill Google Forms content script loaded");

/**
 * Finds all form question containers on the page
 * @returns {NodeList} List of question container elements
 */
function findQuestionContainers() {
  // Google Forms uses different selectors for question containers
  const selectors = [
    '[data-params*="question"]',
    '[role="listitem"]',
    ".m2",
    ".freebirdFormviewerViewItemsItemItem",
    ".Xb9hP", // Updated selector for newer Google Forms
    ".geS5n", // Another common selector
    ".AgroKb", // Yet another selector variant
  ];

  let containers = [];

  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      containers = Array.from(elements);
      console.log(`Found ${containers.length} question containers using selector: ${selector}`);
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
    console.log(`Fallback: Found ${containers.length} question containers`);
  }

  return containers;
}

/**
 * Extracts the question label text from a container
 * @param {Element} container - The question container element
 * @returns {string} The cleaned and lowercased question text
 */
function extractQuestionLabel(container) {
  // Try different selectors for question text
  const textSelectors = [
    '[role="heading"]',
    ".M7eMe", // Common Google Forms question text class
    ".freebirdFormviewerViewItemsItemItemTitle",
    ".AgroKb .M7eMe",
    'span[dir="auto"]',
    'div[dir="auto"]',
  ];

  let questionText = "";

  // Try each selector
  for (const selector of textSelectors) {
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
 * Finds the input field within a question container
 * @param {Element} container - The question container element
 * @returns {Element|null} The input or textarea element (only text inputs)
 */
function findInputField(container) {
  // ONLY look for text inputs and textareas - skip all special fields
  let input = container.querySelector('input[type="text"], input[type="email"], input[type="tel"], textarea');

  // If not found, try inputs without type (which default to text)
  if (!input) {
    const candidateInput = container.querySelector('input:not([type]), input[type=""]');
    if (candidateInput) {
      // Double-check it's not a special field
      const parent = candidateInput.closest('[role="listitem"]') || candidateInput.parentElement;
      const hasSpecialElements =
        parent && parent.querySelector('select, input[type="radio"], input[type="checkbox"], input[type="date"], input[type="time"]');
      if (!hasSpecialElements) {
        input = candidateInput;
      }
    }
  }

  // Skip if container has special field indicators
  if (input) {
    const containerText = container.textContent.toLowerCase();
    const skipPatterns = ["date", "sélectionn", "cochez", "radio", "checkbox", "select", "choisir"];
    const shouldSkip = skipPatterns.some((pattern) => containerText.includes(pattern));

    if (shouldSkip) {
      console.log(`Skipping container with special field indicators: ${containerText.substring(0, 50)}...`);
      return null;
    }
  }

  return input;
}

/**
 * Sets the value of an input field and triggers necessary events
 * @param {Element} field - The input/textarea element
 * @param {string} value - The value to set
 */
function setFieldValue(field, value) {
  if (!field || !value) return;

  console.log(`Setting field value: "${value}" for field:`, field);

  try {
    // Focus the field first
    field.focus();

    // Clear existing value
    field.value = "";

    // Set the new value
    field.value = value;

    // Trigger events that Google Forms expects
    const focusEvent = new Event("focus", { bubbles: true });
    const inputEvent = new Event("input", { bubbles: true });
    const changeEvent = new Event("change", { bubbles: true });
    const blurEvent = new Event("blur", { bubbles: true });

    field.dispatchEvent(focusEvent);
    field.dispatchEvent(inputEvent);
    field.dispatchEvent(changeEvent);
    field.dispatchEvent(blurEvent);

    // Additional trigger for React-based forms
    try {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(field, value);
        const reactInputEvent = new Event("input", { bubbles: true });
        field.dispatchEvent(reactInputEvent);
      }
    } catch (e) {
      console.log("React setter failed (normal for textareas):", e.message);
    }
  } catch (error) {
    console.error(`Error setting field value: ${error.message}`);
    // Fallback: simple value assignment
    try {
      field.value = value;
    } catch (e) {
      console.error("Fallback value assignment also failed:", e.message);
    }
  }
}

/**
 * Main function to fill the form with dictionary data
 */
function fillForm() {
  console.log("Starting form fill process...");

  const containers = findQuestionContainers();
  let fieldsDetected = 0;
  let fieldsFilled = 0;
  const detectionResults = [];

  containers.forEach((container, index) => {
    const questionLabel = extractQuestionLabel(container);
    console.log(`Question ${index + 1}: "${questionLabel}"`);

    if (!questionLabel) return;

    const inputField = findInputField(container);
    if (inputField) {
      fieldsDetected++;

      // Check if any dictionary key matches the question label
      let matchFound = false;
      let matchedKey = "";
      let matchedValue = "";

      // 1. Try exact match first
      for (const [key, value] of Object.entries(DICT)) {
        if (questionLabel === key.toLowerCase()) {
          console.log(`✅ Exact match found: "${key}" -> "${value}"`);
          setFieldValue(inputField, value);
          fieldsFilled++;
          matchFound = true;
          matchedKey = key;
          matchedValue = value;
          break;
        }
      }

      // 2. If no exact match, try inclusion matches (but more strict)
      if (!matchFound) {
        const bestMatch = findBestMatch(questionLabel, DICT);
        if (bestMatch) {
          console.log(`✅ Best match found: "${bestMatch.key}" -> "${bestMatch.value}" (score: ${bestMatch.score})`);
          setFieldValue(inputField, bestMatch.value);
          fieldsFilled++;
          matchFound = true;
          matchedKey = bestMatch.key;
          matchedValue = bestMatch.value;
        }
      }

      // Store detection result for debugging
      detectionResults.push({
        questionLabel,
        matched: matchFound,
        key: matchedKey,
        value: matchedValue,
        inputType: inputField.type || inputField.tagName.toLowerCase(),
      });
    } else {
      console.log(`⏭️  Skipped question ${index + 1}: no suitable input field found`);
    }
  });

  console.log(`Form fill complete: ${fieldsFilled}/${fieldsDetected} fields filled`);
  console.log("Detection results:", detectionResults);

  // Return detailed result for popup feedback
  return {
    success: true,
    message: `Rempli ${fieldsFilled} champs sur ${fieldsDetected} détectés`,
    fieldsDetected,
    fieldsFilled,
    detectionResults,
  };
}

/**
 * Finds the best matching dictionary key for a question label
 * @param {string} questionLabel - The question label to match
 * @param {object} dict - The dictionary to search in
 * @returns {object|null} The best match with key, value, and score
 */
function findBestMatch(questionLabel, dict) {
  let bestMatch = null;
  let bestScore = 0;
  const minScore = 0.7; // Minimum score to consider a match

  for (const [key, value] of Object.entries(dict)) {
    const score = calculateMatchScore(questionLabel, key);
    if (score > bestScore && score >= minScore) {
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
function calculateMatchScore(questionLabel, dictKey) {
  const question = questionLabel.toLowerCase().trim();
  const key = dictKey.toLowerCase().trim();

  // Exact match gets perfect score
  if (question === key) return 1.0;

  // If question contains the key entirely
  if (question.includes(key)) {
    // Higher score if the key is a significant part of the question
    const ratio = key.length / question.length;
    return Math.min(0.95, 0.6 + ratio * 0.35);
  }

  // If key contains the question entirely (less likely but possible)
  if (key.includes(question) && question.length > 3) {
    return 0.8;
  }

  // Word-based matching
  const questionWords = question.split(/[\s\-_,()]+/).filter((w) => w.length > 2);
  const keyWords = key.split(/[\s\-_,()]+/).filter((w) => w.length > 2);

  if (questionWords.length === 0 || keyWords.length === 0) return 0;

  let matchingWords = 0;
  let totalImportance = 0;

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
    totalImportance++;
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
    console.log("DOM updated with new form elements");
  }
});

// Start observing DOM changes
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content script received message:", message);

  if (message.action === "fillForm") {
    try {
      const result = fillForm();
      sendResponse(result);
    } catch (error) {
      console.error("Error filling form:", error);
      sendResponse({
        success: false,
        message: "Error occurred while filling form: " + error.message,
      });
    }
  }

  return true; // Keep the message channel open
});

// Auto-detect if page is ready and log status
if (document.readyState === "complete") {
  console.log("Google Forms page is ready");
} else {
  window.addEventListener("load", () => {
    console.log("Google Forms page loaded");
  });
}
