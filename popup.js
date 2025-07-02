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
   * Checks if current tab is a Google Forms page
   * @returns {Promise<boolean>}
   */
  async function isGoogleFormsPage() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        const isFormsPage = currentTab?.url?.includes("docs.google.com/forms/");
        resolve(isFormsPage);
      });
    });
  }

  /**
   * Main form filling handler
   */
  async function handleFillForm() {
    // Check if we're on a Google Forms page
    const isFormsPage = await isGoogleFormsPage();
    if (!isFormsPage) {
      showStatus("Veuillez naviguer vers une page Google Forms", "error");
      return;
    }

    // Set loading state
    setButtonLoading(true);
    statusDiv.style.display = "none";
    statsDiv.style.display = "none";

    try {
      // Send message to content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "fillForm" }, (response) => {
          setButtonLoading(false);

          if (chrome.runtime.lastError) {
            showStatus("Erreur de communication avec la page", "error");
            return;
          }

          if (response?.success) {
            const message =
              response.fieldsFilled > 0
                ? `${response.fieldsFilled} champ(s) rempli(s) avec succès`
                : "Aucun champ correspondant trouvé";

            showStatus(message, response.fieldsFilled > 0 ? "success" : "error");
            updateStats(response);
          } else {
            showStatus("Erreur lors du remplissage", "error");
          }
        });
      });
    } catch (error) {
      setButtonLoading(false);
      showStatus("Erreur inattendue", "error");
    }
  }

  /**
   * Initialize the popup
   */
  function initialize() {
    // Add click handler to button
    fillFormBtn.addEventListener("click", handleFillForm);

    // Add keyboard support
    document.addEventListener("keydown", (event) => {
      if ((event.key === "Enter" || event.key === " ") && !fillFormBtn.disabled) {
        event.preventDefault();
        handleFillForm();
      }
    });

    // Check initial page state
    isGoogleFormsPage().then((isFormsPage) => {
      if (!isFormsPage) {
        fillFormBtn.disabled = true;
        fillFormBtn.style.background = "#e1e8ed";
        fillFormBtn.style.color = "#8a9ba8";
        fillFormBtn.title = "Naviguez vers une page Google Forms";
        showStatus("Page Google Forms requise", "error");
      }
    });
  }

  // Initialize when DOM is ready
  initialize();
});
