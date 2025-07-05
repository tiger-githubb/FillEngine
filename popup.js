/**
 * Popup Script for Auto-Fill Google Forms Extension
 * Modern, minimal UI with clean interactions
 */

"use strict";

document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const fillFormBtn = document.getElementById("fillFormBtn");
  const buttonText = fillFormBtn.querySelector(".button-text");
  const statusDiv = document.getElementById("status");
  const statsDiv = document.getElementById("stats");
  const fieldsDetectedSpan = document.getElementById("fieldsDetected");
  const fieldsFilledSpan = document.getElementById("fieldsFilled");
  const successRateSpan = document.getElementById("successRate");
  const resultsDiv = document.getElementById("results");
  const csvFileInput = document.getElementById("csvFileInput");
  const fileStatus = document.getElementById("fileStatus");
  const userProfileDisplay = document.getElementById("userProfileDisplay");
  const profileName = document.getElementById("profileName");
  const profileDetails = document.getElementById("profileDetails");

  // New DOM Elements for profiles
  const profileModeBtn = document.getElementById("profileModeBtn");
  const csvModeBtn = document.getElementById("csvModeBtn");
  const profileSection = document.getElementById("profileSection");
  const csvSection = document.getElementById("csvSection");
  const profileSelect = document.getElementById("profileSelect");
  const profilePreview = document.getElementById("profilePreview");

  console.log("🔧 DOM ELEMENTS FOUND:");
  console.log("├── fillFormBtn:", !!fillFormBtn);
  console.log("├── csvFileInput:", !!csvFileInput);
  console.log("├── fileStatus:", !!fileStatus);
  console.log("├── userProfileDisplay:", !!userProfileDisplay);
  console.log("├── profileModeBtn:", !!profileModeBtn);
  console.log("├── csvModeBtn:", !!csvModeBtn);
  console.log("├── profileSelect:", !!profileSelect);
  console.log("└── profilePreview:", !!profilePreview);

  // Current user data (will be updated when CSV is loaded or profile selected)
  let currentUserData = null;
  let currentMode = "profiles"; // "profiles" or "csv"
  let availableProfiles = [];

  // Note: fillForm function will be declared after all helper functions

  /**
   * Load and parse the built-in profiles database
   * @returns {Promise<Array>} Array of profile objects
   */
  async function loadProfilesDatabase() {
    try {
      const response = await fetch(chrome.runtime.getURL("data/profiles.csv"));
      const csvContent = await response.text();

      console.log("🗄️ Profiles database loaded");
      console.log("├── Content length:", csvContent.length);

      return parseProfilesCSV(csvContent);
    } catch (error) {
      console.error("Error loading profiles database:", error);
      throw new Error("Impossible de charger la base de données des profils");
    }
  }

  /**
   * Parse profiles CSV content and convert to array of profile objects
   * @param {string} csvContent - Raw CSV content with multiple profiles
   * @returns {Array} Array of parsed profile objects
   */
  function parseProfilesCSV(csvContent) {
    try {
      const lines = csvContent.trim().split("\n");
      if (lines.length < 2) {
        throw new Error("CSV doit contenir au moins 2 lignes (en-tête + données)");
      }

      // Improved CSV parsing to handle quoted values
      function parseCSVLine(line) {
        const result = [];
        let current = "";
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];

          if (char === '"' && (i === 0 || line[i - 1] === ",")) {
            inQuotes = true;
          } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i + 1] === ",")) {
            inQuotes = false;
          } else if (char === "," && !inQuotes) {
            result.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result.map((value) => value.replace(/^"(.*)"$/, "$1")); // Remove outer quotes
      }

      const headers = parseCSVLine(lines[0]);
      const profiles = [];

      // Parse each profile line
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);

        if (headers.length !== values.length) {
          console.warn(
            `Ligne ${i + 1}: Nombre d'en-têtes (${headers.length}) ne correspond pas au nombre de valeurs (${values.length})`
          );
          continue;
        }

        const profile = parseProfileFromValues(headers, values);
        if (profile) {
          profiles.push(profile);
        }
      }

      console.log(`✅ Parsed ${profiles.length} profiles from database`);
      return profiles;
    } catch (error) {
      console.error("Erreur de parsing du CSV des profils:", error);
      throw error;
    }
  }

  /**
   * Parse a single profile from headers and values
   * @param {Array} headers - CSV headers
   * @param {Array} values - CSV values for this profile
   * @returns {Object|null} Parsed profile object or null if error
   */
  function parseProfileFromValues(headers, values) {
    try {
      // Create user profile object
      const userProfile = {
        id: null,
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

      // Map CSV fields to user profile structure
      const fieldMapping = {
        id: ["id"],
        lastName: ["personal", "lastName"],
        firstName: ["personal", "firstName"],
        fullName: ["personal", "fullName"],
        gender: ["personal", "gender"],
        sex: ["personal", "sex"],
        email: ["contact", "email"],
        phone: ["contact", "phone"],
        mobile: ["contact", "mobile"],
        birthPlace: ["location", "birthPlace"],
        birthCountry: ["location", "birthCountry"],
        residence: ["location", "residence"],
        residenceCountry: ["location", "residenceCountry"],
        nationality: ["location", "nationality"],
        address: ["location", "address"],
        idNumber: ["documents", "idNumber"],
        passportNumber: ["documents", "passportNumber"],
        cniNumber: ["documents", "cniNumber"],
        fatherName: ["family", "fatherName"],
        motherName: ["family", "motherName"],
        usualLanguage: ["languages", "usual"],
        motherLanguage: ["languages", "mother"],
        profession: ["professional", "profession"],
        company: ["professional", "company"],
        academicReason: ["professional", "academicReason"],
        disabilities: ["medical", "disabilities"],
        birthDate: ["dates", "birthDate"],
        idExpirationDate: ["dates", "idExpirationDate"],
        examSubjects: ["misc", "examSubjects"],
        idType: ["choices", "idType"],
        examTypes: ["choices", "examTypes"],
        hasDisabilities: ["choices", "hasDisabilities"],
        agreement: ["choices", "agreement"],
        termsAccepted: ["choices", "termsAccepted"],
        preferredLanguage: ["choices", "preferredLanguage"],
        hasExperience: ["choices", "hasExperience"],
        needsAccommodation: ["choices", "needsAccommodation"],
        isFirstTime: ["choices", "isFirstTime"],
      };

      // Populate user profile
      let fieldsProcessed = 0;
      headers.forEach((header, index) => {
        const mapping = fieldMapping[header];
        if (mapping && values[index] !== undefined && values[index] !== "") {
          let value = values[index];

          // Handle special data types
          if ((header === "examTypes" || header === "examSubjects") && value.includes(",")) {
            value = value.split(",").map((v) => v.trim());
          } else if (["agreement", "termsAccepted", "hasExperience", "needsAccommodation", "isFirstTime"].includes(header)) {
            value = value.toLowerCase() === "true";
          }

          if (mapping.length === 1) {
            // Special case for 'id'
            userProfile[mapping[0]] = value;
          } else {
            const [category, field] = mapping;
            userProfile[category][field] = value;

            // Auto-create examTypesFull when examTypes is processed
            if (field === "examTypes" && Array.isArray(value)) {
              const examTypesMapping = {
                CE: "Compréhension écrite",
                CO: "Compréhension orale",
                EE: "Expression écrite",
                EO: "Expression orale",
              };

              const fullNames = value.map((code) => examTypesMapping[code] || code);
              userProfile[category].examTypesFull = fullNames;
              console.log(`Auto-created examTypesFull:`, fullNames);
            }

            // Auto-create examSubjectsFull when examSubjects is processed
            if (field === "examSubjects" && Array.isArray(value)) {
              const examSubjectsMapping = {
                CE: "Comprehension écrite",
                CO: "comprehension orale",
                EE: "expression ecrite",
                EO: "expression orale",
              };

              const fullNames = value.map((code) => examSubjectsMapping[code] || code);
              userProfile[category].examSubjectsFull = fullNames;
              console.log(`Auto-created examSubjectsFull:`, fullNames);
            }
          }
          fieldsProcessed++;
        }
      });

      if (fieldsProcessed === 0 || !userProfile.id) {
        console.warn("Profil ignoré: aucun champ valide ou ID manquant");
        return null;
      }

      return userProfile;
    } catch (error) {
      console.error("Erreur lors du parsing du profil:", error);
      return null;
    }
  }

  /**
   * Switch between profiles and CSV upload modes
   * @param {string} mode - "profiles" or "csv"
   */
  function switchMode(mode) {
    currentMode = mode;

    if (mode === "profiles") {
      profileModeBtn.classList.add("active");
      csvModeBtn.classList.remove("active");
      profileSection.classList.remove("hidden");
      csvSection.classList.add("hidden");

      console.log("🔄 Switched to profiles mode");
    } else {
      csvModeBtn.classList.add("active");
      profileModeBtn.classList.remove("active");
      csvSection.classList.remove("hidden");
      profileSection.classList.add("hidden");

      console.log("🔄 Switched to CSV upload mode");
    }

    // Reset current data when switching modes
    currentUserData = null;
    hideUserProfile();
    updateFillButtonState();
  }

  /**
   * Populate the profile selection dropdown
   * @param {Array} profiles - Array of profile objects
   */
  function populateProfileSelect(profiles) {
    profileSelect.innerHTML = '<option value="">-- Choisir un profil --</option>';

    profiles.forEach((profile) => {
      const option = document.createElement("option");
      option.value = profile.id;

      const name =
        profile.personal?.fullName ||
        `${profile.personal?.firstName || ""} ${profile.personal?.lastName || ""}`.trim() ||
        `Profil ${profile.id}`;

      const profession = profile.professional?.profession || "";
      const company = profile.professional?.company || "";

      let displayText = `[${profile.id}] ${name}`;
      if (profession) {
        displayText += ` - ${profession}`;
      }

      option.textContent = displayText;
      option.dataset.profile = JSON.stringify(profile);

      profileSelect.appendChild(option);
    });

    console.log(`✅ Populated profile selector with ${profiles.length} profiles`);
  }

  /**
   * Handle profile selection
   * @param {string} profileId - Selected profile ID
   */
  function handleProfileSelection(profileId) {
    if (!profileId) {
      currentUserData = null;
      profilePreview.style.display = "none";
      hideUserProfile();
      updateFillButtonState();
      return;
    }

    const selectedOption = profileSelect.querySelector(`option[value="${profileId}"]`);
    if (!selectedOption) {
      console.error("Profile not found:", profileId);
      return;
    }

    try {
      const profile = JSON.parse(selectedOption.dataset.profile);
      currentUserData = profile;

      console.log("✅ Profile selected:", profile.id);
      console.log("├── Name:", profile.personal?.fullName);
      console.log("├── Email:", profile.contact?.email);
      console.log("└── Profession:", profile.professional?.profession);

      // Show profile preview
      showProfilePreview(profile);

      // Update main profile display
      updateProfileDisplay(profile);

      // Update fill button state
      updateFillButtonState();
    } catch (error) {
      console.error("Error parsing selected profile:", error);
      currentUserData = null;
      updateFillButtonState();
    }
  }

  /**
   * Show profile preview in the selection section
   * @param {Object} profile - Selected profile
   */
  function showProfilePreview(profile) {
    const name = profile.personal?.fullName || `Profil ${profile.id}`;
    const email = profile.contact?.email || "";
    const profession = profile.professional?.profession || "";

    let previewText = `✅ ${name}`;
    if (email) previewText += ` • ${email}`;
    if (profession) previewText += ` • ${profession}`;

    profilePreview.textContent = previewText;
    profilePreview.style.display = "block";
  }

  /**
   * Update fill button state based on current data and page
   */
  async function updateFillButtonState() {
    try {
      const isFormsPage = await isGoogleFormsPage();

      if (!isFormsPage) {
        fillFormBtn.disabled = true;
        fillFormBtn.style.background = "#e1e8ed";
        fillFormBtn.style.color = "#8a9ba8";
        fillFormBtn.title = "Naviguez vers une page Google Forms";
        showStatus("Page Google Forms requise", "error");
      } else if (!currentUserData) {
        fillFormBtn.disabled = true;
        fillFormBtn.style.background = "#e1e8ed";
        fillFormBtn.style.color = "#8a9ba8";

        if (currentMode === "profiles") {
          fillFormBtn.title = "Sélectionnez un profil";
          showStatus("Sélectionnez un profil pour commencer", "error");
        } else {
          fillFormBtn.title = "Chargez un fichier CSV";
          showStatus("Chargez un fichier CSV pour commencer", "error");
        }
      } else {
        fillFormBtn.disabled = false;
        fillFormBtn.style.background = "";
        fillFormBtn.style.color = "";
        fillFormBtn.title = "";
        statusDiv.style.display = "none";
      }
    } catch (error) {
      console.error("Error updating button state:", error);
    }
  }

  /**
   * Shows a file status message
   * @param {string} message - The message to display
   * @param {string} type - 'success' or 'error'
   */
  function showFileStatus(message, type = "success") {
    fileStatus.textContent = message;
    fileStatus.className = `file-status ${type}`;
    fileStatus.style.display = "block";

    // Auto-hide success messages after 3 seconds
    if (type === "success") {
      setTimeout(() => {
        fileStatus.style.display = "none";
      }, 3000);
    }
  }

  /**
   * Parse CSV content and convert to user profile object
   * @param {string} csvContent - Raw CSV content
   * @returns {Object|null} Parsed user profile or null if error
   */
  function parseCSV(csvContent) {
    try {
      const lines = csvContent.trim().split("\n");
      if (lines.length < 2) {
        throw new Error("CSV doit contenir au moins 2 lignes (en-tête + données)");
      }

      // Improved CSV parsing to handle quoted values
      function parseCSVLine(line) {
        const result = [];
        let current = "";
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];

          if (char === '"' && (i === 0 || line[i - 1] === ",")) {
            inQuotes = true;
          } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i + 1] === ",")) {
            inQuotes = false;
          } else if (char === "," && !inQuotes) {
            result.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }

        result.push(current.trim());
        return result.map((value) => value.replace(/^"(.*)"$/, "$1")); // Remove outer quotes
      }

      const headers = parseCSVLine(lines[0]);
      const values = parseCSVLine(lines[1]);

      if (headers.length !== values.length) {
        throw new Error(`Nombre d'en-têtes (${headers.length}) ne correspond pas au nombre de valeurs (${values.length})`);
      }

      console.log("CSV Headers:", headers);
      console.log("CSV Values:", values);

      // Create user profile object
      const userProfile = {
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

      // Map CSV fields to user profile structure
      const fieldMapping = {
        lastName: ["personal", "lastName"],
        firstName: ["personal", "firstName"],
        fullName: ["personal", "fullName"],
        gender: ["personal", "gender"],
        sex: ["personal", "sex"],
        email: ["contact", "email"],
        phone: ["contact", "phone"],
        mobile: ["contact", "mobile"],
        birthPlace: ["location", "birthPlace"],
        birthCountry: ["location", "birthCountry"],
        residence: ["location", "residence"],
        residenceCountry: ["location", "residenceCountry"],
        nationality: ["location", "nationality"],
        address: ["location", "address"],
        idNumber: ["documents", "idNumber"],
        passportNumber: ["documents", "passportNumber"],
        cniNumber: ["documents", "cniNumber"],
        fatherName: ["family", "fatherName"],
        motherName: ["family", "motherName"],
        usualLanguage: ["languages", "usual"],
        motherLanguage: ["languages", "mother"],
        profession: ["professional", "profession"],
        company: ["professional", "company"],
        academicReason: ["professional", "academicReason"],
        disabilities: ["medical", "disabilities"],
        birthDate: ["dates", "birthDate"],
        idExpirationDate: ["dates", "idExpirationDate"],
        examSubjects: ["misc", "examSubjects"],
        idType: ["choices", "idType"],
        examTypes: ["choices", "examTypes"],
        hasDisabilities: ["choices", "hasDisabilities"],
        agreement: ["choices", "agreement"],
        termsAccepted: ["choices", "termsAccepted"],
        preferredLanguage: ["choices", "preferredLanguage"],
        hasExperience: ["choices", "hasExperience"],
        needsAccommodation: ["choices", "needsAccommodation"],
        isFirstTime: ["choices", "isFirstTime"],
      };

      // Populate user profile
      let fieldsProcessed = 0;
      headers.forEach((header, index) => {
        const mapping = fieldMapping[header];
        if (mapping && values[index] !== undefined && values[index] !== "") {
          const [category, field] = mapping;
          let value = values[index];

          // Handle special data types
          if (header === "examTypes" && value.includes(",")) {
            value = value.split(",").map((v) => v.trim());
          } else if (["agreement", "termsAccepted", "hasExperience", "needsAccommodation", "isFirstTime"].includes(header)) {
            value = value.toLowerCase() === "true";
          }

          userProfile[category][field] = value;

          // Auto-create examTypesFull when examTypes is processed
          if (field === "examTypes" && Array.isArray(value)) {
            const examTypesMapping = {
              CE: "Compréhension écrite",
              CO: "Compréhension orale",
              EE: "Expression écrite",
              EO: "Expression orale",
            };

            const fullNames = value.map((code) => examTypesMapping[code] || code);
            userProfile[category].examTypesFull = fullNames;
          }

          fieldsProcessed++;
          console.log(`Mapped ${header} -> ${category}.${field} = ${value}`);
        } else if (mapping) {
          console.warn(`Empty value for field: ${header}`);
        } else {
          console.warn(`Unknown field in CSV: ${header}`);
        }
      });

      console.log(`Successfully processed ${fieldsProcessed} fields from CSV`);
      console.log("Final user profile:", userProfile);

      if (fieldsProcessed === 0) {
        throw new Error("Aucun champ valide trouvé dans le CSV");
      }

      return userProfile;
    } catch (error) {
      console.error("Erreur de parsing CSV:", error);
      throw error;
    }
  }

  /**
   * Shows a status message to the user
   * @param {string} message - The message to display
   * @param {string} type - 'success' or 'error'
   */
  function showStatus(message, type = "success") {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = "block";

    // Auto-hide success messages after 4 seconds
    if (type === "success") {
      setTimeout(() => {
        statusDiv.style.display = "none";
      }, 4000);
    }
  }

  /**
   * Updates the statistics display with clean modern styling
   * @param {Object} stats - Statistics from the content script
   */
  function updateStats(stats) {
    if (!stats) return;

    // Update stat numbers
    fieldsDetectedSpan.textContent = stats.fieldsDetected || 0;
    fieldsFilledSpan.textContent = stats.fieldsFilled || 0;

    const successRate = stats.fieldsDetected > 0 ? Math.round((stats.fieldsFilled / stats.fieldsDetected) * 100) : 0;
    successRateSpan.textContent = `${successRate}%`;

    // Show stats section
    statsDiv.style.display = "block";

    // Update detailed results
    updateResults(stats.detectionResults || []);
  }

  /**
   * Updates the detailed results section
   * @param {Array} results - Array of detection results
   */
  function updateResults(results) {
    resultsDiv.innerHTML = "";

    if (results.length === 0) return;

    // Separate results by categories
    const filledResults = results.filter((result) => result.matched);
    const noInputResults = results.filter((result) => !result.hasInputField);
    const unfilledResults = results.filter((result) => result.hasInputField && !result.matched);

    // Show filled fields
    filledResults.forEach((result, index) => {
      const resultItem = document.createElement("div");
      resultItem.className = "result-item";

      const icon = document.createElement("div");
      icon.className = "result-icon success";
      icon.textContent = "✓";

      const text = document.createElement("div");
      text.className = "result-text";
      const truncatedValue = result.value.length > 25 ? result.value.substring(0, 25) + "..." : result.value;
      text.textContent = `${result.questionLabel} → ${truncatedValue}`;

      resultItem.appendChild(icon);
      resultItem.appendChild(text);
      resultsDiv.appendChild(resultItem);
    });

    // Show summary for unfilled and no-input fields
    if (unfilledResults.length > 0 || noInputResults.length > 0) {
      // Add separator if there are filled results
      if (filledResults.length > 0) {
        const separator = document.createElement("div");
        separator.style.borderTop = "1px solid #e2e8f0";
        separator.style.marginTop = "8px";
        separator.style.paddingTop = "8px";
        resultsDiv.appendChild(separator);
      }

      // Show unfilled fields with input
      if (unfilledResults.length > 0) {
        const summaryItem = document.createElement("div");
        summaryItem.className = "result-item";

        const icon = document.createElement("div");
        icon.className = "result-icon error";
        icon.textContent = "!";

        const text = document.createElement("div");
        text.className = "result-text";
        text.style.color = "#64748b";
        text.textContent = `${unfilledResults.length} champ(s) avec entrée non rempli(s)`;

        summaryItem.appendChild(icon);
        summaryItem.appendChild(text);
        resultsDiv.appendChild(summaryItem);
      }

      // Show fields without input
      if (noInputResults.length > 0) {
        const summaryItem = document.createElement("div");
        summaryItem.className = "result-item";

        const icon = document.createElement("div");
        icon.className = "result-icon";
        icon.style.background = "#f8fafc";
        icon.style.color = "#64748b";
        icon.textContent = "?";

        const text = document.createElement("div");
        text.className = "result-text";
        text.style.color = "#64748b";
        text.textContent = `${noInputResults.length} question(s) sans champ d'entrée`;

        summaryItem.appendChild(icon);
        summaryItem.appendChild(text);
        resultsDiv.appendChild(summaryItem);
      }
    }
  }

  /**
   * Sets the loading state of the button
   * @param {boolean} loading - Whether to show loading state
   */
  function setButtonLoading(loading) {
    if (loading) {
      fillFormBtn.disabled = true;
      buttonText.innerHTML = '<span class="loading"><span class="spinner"></span>Remplissage...</span>';
    } else {
      fillFormBtn.disabled = false;
      buttonText.textContent = "Remplir le formulaire";
    }
  }

  /**
   * Handle CSV file upload
   * @param {Event} event - File input change event
   */
  function handleCSVUpload(event) {
    console.log("CSV upload initiated");
    const file = event.target.files[0];

    if (!file) {
      console.log("No file selected");
      showFileStatus("Aucun fichier sélectionné", "error");
      return;
    }

    console.log(`File selected: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".csv")) {
      console.error("Invalid file type:", file.name);
      showFileStatus("Veuillez sélectionner un fichier CSV", "error");
      return;
    }

    // Check file size (limit to 1MB)
    if (file.size > 1024 * 1024) {
      console.error("File too large:", file.size);
      showFileStatus("Fichier trop volumineux (max 1MB)", "error");
      return;
    }

    // Show loading status
    showFileStatus("Chargement du fichier...", "success");

    const reader = new FileReader();

    reader.onload = function (e) {
      try {
        const csvContent = e.target.result;
        console.log("CSV content loaded, length:", csvContent.length);
        console.log("First 200 characters:", csvContent.substring(0, 200));

        // Parse CSV content
        const userData = parseCSV(csvContent);

        if (userData) {
          currentUserData = userData;
          showFileStatus(`✅ Fichier chargé: ${file.name}`, "success");

          console.log("CSV data successfully loaded and ready to use");
          console.log("📊 DETAILED USER DATA LOADED:");
          console.log("├── Personal:", userData.personal);
          console.log("├── Contact:", userData.contact);
          console.log("├── Location:", userData.location);
          console.log("├── Documents:", userData.documents);
          console.log("├── Dates:", userData.dates);
          console.log("└── Full object:", userData);

          // Display user profile information
          updateProfileDisplay(userData);

          // Update fill button state
          updateFillButtonState();
        } else {
          throw new Error("Données CSV invalides - pas de données retournées");
        }
      } catch (error) {
        console.error("Erreur lors du traitement du CSV:", error);
        showFileStatus(`❌ Erreur: ${error.message}`, "error");
        currentUserData = null;
        hideUserProfile();
      }
    };

    reader.onerror = function (error) {
      console.error("File reader error:", error);
      showFileStatus("❌ Erreur de lecture du fichier", "error");
      currentUserData = null;
      hideUserProfile();
    };

    // Read the file as text
    reader.readAsText(file, "UTF-8");
  }

  /**
   * Check if current page is a Google Forms page
   * @returns {Promise<boolean>} True if on Google Forms page
   */
  async function isGoogleFormsPage() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      return tab && tab.url && tab.url.includes("docs.google.com/forms");
    } catch (error) {
      console.error("Error checking page URL:", error);
      return false;
    }
  }

  /**
   * Display user profile information in the popup
   * @param {Object} userData - The user profile data
   */
  function displayUserProfile(userData) {
    try {
      // Get name information
      const firstName = userData.personal?.firstName || "";
      const lastName = userData.personal?.lastName || "";
      const fullName = userData.personal?.fullName || "";

      // Use fullName if available, otherwise combine firstName and lastName
      let displayName = fullName || [firstName, lastName].filter(Boolean).join(" ");
      if (!displayName) {
        displayName = "Utilisateur";
      }

      // Get additional details
      const email = userData.contact?.email || "";
      const phone = userData.contact?.phone || userData.contact?.mobile || "";
      const nationality = userData.location?.nationality || "";

      // Build details string
      const details = [];
      if (email) details.push(`📧 ${email}`);
      if (phone) details.push(`📱 ${phone}`);
      if (nationality) details.push(`🌍 ${nationality}`);

      const detailsText = details.length > 0 ? details.join(" • ") : "Données chargées";

      // Update display
      profileName.textContent = displayName;
      profileDetails.textContent = detailsText;
      userProfileDisplay.style.display = "block";

      console.log(`User profile displayed: ${displayName} - ${detailsText}`);
    } catch (error) {
      console.error("Error displaying user profile:", error);
      // Fallback display
      profileName.textContent = "Profil chargé";
      profileDetails.textContent = "Données utilisateur disponibles";
      userProfileDisplay.style.display = "block";
    }
  }

  /**
   * Update the user profile display with loaded data
   * @param {Object} userData - The loaded user data
   */
  function updateProfileDisplay(userData) {
    try {
      console.log("Updating profile display with:", userData);

      // Extract name information
      const firstName = userData.personal?.firstName || "";
      const lastName = userData.personal?.lastName || "";
      const fullName = userData.personal?.fullName || "";

      // Determine display name
      let displayName = "";
      if (fullName) {
        displayName = fullName;
      } else if (firstName || lastName) {
        displayName = `${firstName} ${lastName}`.trim();
      } else {
        displayName = "Utilisateur anonyme";
      }

      // Create details text
      let detailsText = "";
      const details = [];

      if (userData.contact?.email) {
        details.push(`📧 ${userData.contact.email}`);
      }
      if (userData.contact?.phone) {
        details.push(`📱 ${userData.contact.phone}`);
      }
      if (userData.location?.city) {
        details.push(`🏙️ ${userData.location.city}`);
      }

      detailsText = details.length > 0 ? details.join(" • ") : "Données personnelles chargées";

      // Update display
      profileName.textContent = displayName;
      profileDetails.textContent = detailsText;
      userProfileDisplay.style.display = "block";

      console.log(`User profile displayed: ${displayName} - ${detailsText}`);
    } catch (error) {
      console.error("Error displaying user profile:", error);
      // Fallback display
      profileName.textContent = "Profil chargé";
      profileDetails.textContent = "Données utilisateur disponibles";
      userProfileDisplay.style.display = "block";
    }
  }

  /**
   * Hide user profile display
   */
  function hideUserProfile() {
    userProfileDisplay.style.display = "none";
  }

  /**
   * Prevent popup from closing during file operations
   */
  function keepPopupOpen() {
    // Keep focus on the popup to prevent auto-closing
    window.focus();

    // Simplified approach - only prevent focus loss that might close popup
    document.addEventListener("focusout", function (e) {
      setTimeout(() => {
        if (!document.hasFocus()) {
          window.focus();
        }
      }, 50);
    });

    console.log("🔒 Popup will stay open during operations");
  }

  /**
   * Initialize the popup
   */
  function initialize() {
    // Keep popup open during operations
    keepPopupOpen();

    // Initialize profiles mode by default
    initializeProfilesMode();

    // Add mode switcher handlers
    profileModeBtn.addEventListener("click", () => switchMode("profiles"));
    csvModeBtn.addEventListener("click", () => switchMode("csv"));

    // Add profile selection handler
    profileSelect.addEventListener("change", (e) => {
      console.log("📋 Profile selection changed:", e.target.value);
      handleProfileSelection(e.target.value);
    });

    // Add click handler to button
    fillFormBtn.addEventListener("click", (e) => {
      console.log("🖱️ FILL FORM BUTTON CLICKED - EVENT TRIGGERED");
      console.log("├── Event object:", e);
      console.log("├── Target:", e.target);
      console.log("├── Current mode:", currentMode);
      console.log("└── Button element:", fillFormBtn);

      console.log("🔄 CALLING fillForm function...");

      // SIMPLE TEST FIRST
      console.log("🧪 TESTING BASIC FUNCTIONALITY...");
      console.log("├── currentUserData exists:", !!currentUserData);
      console.log("├── showStatus function exists:", typeof showStatus);
      console.log("├── chrome.tabs exists:", !!chrome.tabs);

      // Test basic functionality
      try {
        if (!currentUserData) {
          console.log("⚠️ No user data - calling showStatus...");
          const message =
            currentMode === "profiles" ? "Veuillez d'abord sélectionner un profil" : "Veuillez d'abord charger un fichier CSV";
          showStatus(message, "error");
          return;
        }

        console.log("✅ User data found, proceeding with actual fillForm...");
        fillForm();
      } catch (error) {
        console.error("❌ ERROR in button click handler:", error);
        showStatus("Erreur inattendue: " + error.message, "error");
      }
    });

    // Add CSV file upload handler with improved event handling
    csvFileInput.addEventListener("change", (e) => {
      console.log("📁 CSV FILE INPUT CHANGED");
      console.log("├── Files selected:", e.target.files.length);
      console.log("└── First file:", e.target.files[0]?.name);
      e.stopPropagation();
      handleCSVUpload(e);
    });

    console.log("🔧 EVENT LISTENERS ADDED");
    console.log("├── Fill button click handler: ✅");
    console.log("├── CSV input change handler: ✅");
    console.log("├── Mode switcher handlers: ✅");
    console.log("└── Profile selection handler: ✅");

    // Prevent form submission that might close popup
    const form = document.querySelector("form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    }

    // Add keyboard support
    document.addEventListener("keydown", (event) => {
      if ((event.key === "Enter" || event.key === " ") && event.target === fillFormBtn && !fillFormBtn.disabled) {
        event.preventDefault();
        console.log("⌨️ KEYBOARD FILL FORM TRIGGERED");
        fillForm();
      }
    });

    // Initial button state update
    updateFillButtonState();
  }

  // Note: fillForm function moved up for proper scope

  /**
   * Main form filling handler - PROPERLY POSITIONED
   */
  function fillForm() {
    console.log("🚀 FILL FORM FUNCTION CALLED");
    console.log("├── Current user data available:", !!currentUserData);
    console.log("├── User data object:", currentUserData);

    // Prevent popup from closing
    keepPopupOpen();

    // Check if user data is loaded
    if (!currentUserData) {
      console.log("❌ NO USER DATA - showing error");
      showStatus("Veuillez d'abord charger un fichier CSV", "error");
      return;
    }

    console.log("✅ User data found, proceeding with form fill");
    console.log("📊 DATA TO SEND TO CONTENT SCRIPT:");
    console.log("├── Personal data:", currentUserData.personal);
    console.log("├── Contact data:", currentUserData.contact);
    console.log("└── Full data:", currentUserData);

    // Set loading state
    setButtonLoading(true);
    statusDiv.style.display = "none";
    statsDiv.style.display = "none";

    try {
      // Send message to content script with user data
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const message = {
          action: "fillForm",
          userData: currentUserData, // Send the CSV data if available
        };

        console.log("📤 SENDING MESSAGE TO CONTENT SCRIPT:");
        console.log("├── Action:", message.action);
        console.log("├── User data keys:", Object.keys(message.userData));
        console.log("├── Tab ID:", tabs[0].id);
        console.log("└── Full message:", message);

        chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
          console.log("📥 RECEIVED RESPONSE FROM CONTENT SCRIPT:", response);

          setButtonLoading(false);

          if (chrome.runtime.lastError) {
            console.error("❌ Chrome runtime error:", chrome.runtime.lastError);
            showStatus("Erreur de communication avec la page", "error");
            return;
          }

          console.log("Response from content script:", response);

          if (response?.success) {
            const message =
              response.fieldsFilled > 0
                ? `${response.fieldsFilled} champ(s) rempli(s) avec succès`
                : "Aucun champ correspondant trouvé";

            console.log("✅ Form fill successful:", message);
            showStatus(message, response.fieldsFilled > 0 ? "success" : "error");
            updateStats(response);
          } else {
            console.log("❌ Form fill failed:", response?.message);
            showStatus(response?.message || "Erreur lors du remplissage", "error");
          }
        });
      });
    } catch (error) {
      console.error("❌ UNEXPECTED ERROR in fillForm:", error);
      setButtonLoading(false);
      showStatus("Erreur inattendue", "error");
    }
  }

  /**
   * Initialize profiles mode - load and populate profiles
   */
  async function initializeProfilesMode() {
    try {
      console.log("🚀 Initializing profiles mode...");

      // Load profiles from database
      availableProfiles = await loadProfilesDatabase();

      // Populate the select dropdown
      populateProfileSelect(availableProfiles);

      console.log("✅ Profiles mode initialized successfully");
      console.log(`├── Loaded ${availableProfiles.length} profiles`);
      console.log("└── Profile selector populated");
    } catch (error) {
      console.error("❌ Error initializing profiles mode:", error);

      // Show error in the profile section
      profileSelect.innerHTML = '<option value="">Erreur de chargement des profils</option>';
      profileSelect.disabled = true;

      // Optionally switch to CSV mode as fallback
      setTimeout(() => {
        console.log("🔄 Switching to CSV mode as fallback");
        switchMode("csv");
      }, 1000);
    }
  }

  /**
   * Initialize when DOM is ready
   */
  initialize();
});
