/**
 * Popup Script for Auto-Fill Google Forms Extension
 * Handles popup UI interactions and communication with content script
 */

document.addEventListener("DOMContentLoaded", function () {
  const fillFormBtn = document.getElementById("fillFormBtn");
  const statusDiv = document.getElementById("status");
  const statsDiv = document.getElementById("stats");
  const fieldsDetectedSpan = document.getElementById("fieldsDetected");
  const fieldsFilledSpan = document.getElementById("fieldsFilled");
  const successRateSpan = document.getElementById("successRate");
  const detectionDetailsDiv = document.getElementById("detectionDetails");

  console.log("Popup loaded");

  /**
   * Shows a status message to the user
   * @param {string} message - The message to display
   * @param {string} type - The type of message ('success' or 'error')
   */
  function showStatus(message, type = "success") {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = "block";

    // Hide status after 5 seconds
    setTimeout(() => {
      statusDiv.style.display = "none";
    }, 5000);
  }

  /**
   * Updates the statistics display
   * @param {Object} stats - The statistics object from the content script
   */
  function updateStats(stats) {
    if (!stats) return;

    fieldsDetectedSpan.textContent = stats.fieldsDetected || 0;
    fieldsFilledSpan.textContent = stats.fieldsFilled || 0;

    const successRate = stats.fieldsDetected > 0 ? Math.round((stats.fieldsFilled / stats.fieldsDetected) * 100) : 0;
    successRateSpan.textContent = `${successRate}%`;

    // Show stats section
    statsDiv.style.display = "block";

    // Update detection details
    if (stats.detectionResults && stats.detectionResults.length > 0) {
      detectionDetailsDiv.innerHTML = "";

      stats.detectionResults.forEach((result, index) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = `detection-item ${result.matched ? "matched" : "unmatched"}`;

        const questionDiv = document.createElement("div");
        questionDiv.className = "detection-question";
        questionDiv.textContent = `${index + 1}. ${result.questionLabel}`;

        const resultDiv = document.createElement("div");
        resultDiv.className = "detection-result";

        if (result.matched) {
          resultDiv.textContent = `✅ Rempli: ${result.key} → ${result.value.substring(0, 30)}${
            result.value.length > 30 ? "..." : ""
          }`;
        } else {
          resultDiv.textContent = "❌ Non rempli - Aucune correspondance trouvée";
        }

        itemDiv.appendChild(questionDiv);
        itemDiv.appendChild(resultDiv);
        detectionDetailsDiv.appendChild(itemDiv);
      });
    }
  }

  /**
   * Checks if the current tab is a Google Forms page
   * @returns {Promise<boolean>} Whether the current tab is a Google Forms page
   */
  async function isGoogleFormsPage() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        const isFormsPage = currentTab && currentTab.url && currentTab.url.includes("docs.google.com/forms/");
        resolve(isFormsPage);
      });
    });
  }

  /**
   * Handles the fill form button click
   */
  async function handleFillForm() {
    console.log("Fill form button clicked");

    // Check if we're on a Google Forms page
    const isFormsPage = await isGoogleFormsPage();
    if (!isFormsPage) {
      showStatus("Please navigate to a Google Forms page first", "error");
      return;
    }

    // Disable button and show loading state
    fillFormBtn.disabled = true;
    fillFormBtn.textContent = "Filling...";

    try {
      // Send message to content script to fill the form
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "fillForm" }, (response) => {
          // Re-enable button
          fillFormBtn.disabled = false;
          fillFormBtn.textContent = "Fill Form";

          if (chrome.runtime.lastError) {
            console.error("Runtime error:", chrome.runtime.lastError);
            showStatus("Error: Could not communicate with the page", "error");
            return;
          }

          if (response && response.success) {
            showStatus(response.message || "Formulaire rempli avec succès!", "success");
            updateStats(response);
            console.log("Form filled successfully:", response);
          } else {
            const errorMessage = response ? response.message : "Erreur inconnue";
            showStatus("Erreur: " + errorMessage, "error");
            console.error("Form fill failed:", response);
          }
        });
      });
    } catch (error) {
      // Re-enable button on error
      fillFormBtn.disabled = false;
      fillFormBtn.textContent = "Fill Form";

      console.error("Error in handleFillForm:", error);
      showStatus("Error: " + error.message, "error");
    }
  }

  // Add click event listener to the fill form button
  fillFormBtn.addEventListener("click", handleFillForm);

  // Check if we're on a Google Forms page and update UI accordingly
  isGoogleFormsPage().then((isFormsPage) => {
    if (!isFormsPage) {
      fillFormBtn.style.background = "#dadce0";
      fillFormBtn.style.color = "#5f6368";
      fillFormBtn.title = "Naviguez vers une page Google Forms pour utiliser cette fonctionnalité";
      showStatus("Naviguez vers une page Google Forms pour utiliser cette extension", "error");
    }
  });

  // Handle keyboard shortcuts
  document.addEventListener("keydown", function (event) {
    // Enter key or Space key to trigger fill
    if ((event.key === "Enter" || event.key === " ") && !fillFormBtn.disabled) {
      event.preventDefault();
      handleFillForm();
    }
  });

  console.log("Popup script initialized");
});
