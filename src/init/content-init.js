"use strict";

// Inject CSS styles for highlighting unfilled fields
function injectHighlightStyles() {
	const styleId = 'autofill-highlight-styles';
	
	// Check if styles are already injected
	if (document.getElementById(styleId)) {
		return;
	}
	
	const style = document.createElement('style');
	style.id = styleId;
	style.textContent = `
		/* AutoFill highlighting styles for unfilled fields */
		.autofill-highlight-unfilled {
			position: relative;
			border: 2px solid #dc2626 !important;
			border-radius: 8px !important;
			background-color: rgba(254, 202, 202, 0.1) !important;
			box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
			padding: 8px !important;
			margin: 4px 0 !important;
			transition: all 0.3s ease !important;
		}
		
		.autofill-highlight-unfilled:hover {
			box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.2) !important;
		}
		
		/* Dark mode support */
		@media (prefers-color-scheme: dark) {
			.autofill-highlight-unfilled {
				border-color: #ef4444 !important;
				background-color: rgba(239, 68, 68, 0.1) !important;
				box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
			}
		}
	`;
	
	document.head.appendChild(style);
	console.log('[AutoFill] Highlight styles injected');
}

// Inject styles immediately when content script loads
injectHighlightStyles();

// DEBUG: Add manual test function for file upload detection
window.testFileUploadDetection = function() {
	console.log('🧪 Testing file upload detection manually...');
	console.log('Available selectors:', CONFIG.fileUploadSelectors);
	
	const containers = FormDetector.findQuestionContainers();
	console.log(`Found ${containers.length} containers:`, containers);
	
	containers.forEach((container, index) => {
		const questionLabel = FormDetector.extractQuestionLabel(container);
		const inputField = FormDetector.findInputField(container);
		const isFileUpload = inputField && inputField.dataset && inputField.dataset.fieldType === 'fileupload';
		
		console.log(`Container ${index}:`, {
			questionLabel,
			inputField,
			isFileUpload,
			fieldType: inputField?.dataset?.fieldType,
			container
		});
		
		// Check each selector manually
		CONFIG.fileUploadSelectors.forEach((selector, selectorIndex) => {
			const element = container.querySelector(selector);
			if (element) {
				console.log(`  ✅ Selector ${selectorIndex + 1} ("${selector}") found element:`, element);
				const isVisible = FormDetector.isElementVisible(element);
				console.log(`  Visible: ${isVisible}`);
			} else {
				console.log(`  ❌ Selector ${selectorIndex + 1} ("${selector}") found nothing`);
			}
		});
		
		if (isFileUpload) {
			console.log('🎯 File upload field detected!', {
				question: questionLabel,
				element: inputField,
				expectedType: inputField.dataset.expectedFileType
			});
		}
	});
	
	// Also test the direct detection method
	if (autoFiller && autoFiller.detectFileUploadFieldsDirectly) {
		console.log('⚙️ Testing direct file upload detection...');
		const directResults = autoFiller.detectFileUploadFieldsDirectly();
		console.log(`Direct detection found ${directResults.length} file upload fields:`, directResults);
	}
	
	return { containers, total: containers.length };
};

// DEBUG: Simple test for "Ajouter un fichier" detection
window.testSimpleFileUploadDetection = function() {
	console.log('🔍 Simple test: Looking for "Ajouter un fichier" in div[role="listitem"]...');
	
	// Find all div[role="listitem"] containers
	const containers = document.querySelectorAll('div[role="listitem"]');
	console.log(`Found ${containers.length} div[role="listitem"] containers`);
	
	containers.forEach((container, index) => {
		console.log(`\nContainer ${index + 1}:`);
		console.log('  Container:', container);
		
		// Check if container contains "Ajouter un fichier" text
		const hasAjouterText = container.textContent.includes('Ajouter un fichier');
		console.log(`  Contains "Ajouter un fichier": ${hasAjouterText}`);
		
		if (hasAjouterText) {
			// Find the exact element with the text
			const allElements = container.querySelectorAll('*');
			for (const element of allElements) {
				if (element.textContent && element.textContent.includes('Ajouter un fichier')) {
					console.log('  ✅ Found element with text:', element);
					console.log('    Element tag:', element.tagName);
					console.log('    Element role:', element.getAttribute('role'));
					console.log('    Element class:', element.className);
					console.log('    Element visible:', FormDetector.isElementVisible(element));
					
					// Check if parent has role="button"
					const buttonParent = element.closest('[role="button"]');
					if (buttonParent) {
						console.log('    Button parent found:', buttonParent);
						console.log('    Button visible:', FormDetector.isElementVisible(buttonParent));
					}
					break;
				}
			}
			
			// Try to get question label
			const questionLabel = FormDetector.extractQuestionLabel(container);
			console.log(`  Question label: "${questionLabel}"`);
		}
	});
	
	return {
		totalContainers: containers.length,
		fileUploadContainers: Array.from(containers).filter(c => c.textContent.includes('Ajouter un fichier')).length
	};
};

// DEBUG: Add manual test function for highlighting
window.testHighlighting = function() {
	console.log('🧪 Testing highlighting manually...');
	
	if (!autoFiller) {
		console.error('❌ AutoFiller not available');
		return;
	}
	
	// First, simulate form processing to populate detection results
	const containers = FormDetector.findQuestionContainers();
	containers.forEach((container, index) => {
		const questionLabel = FormDetector.extractQuestionLabel(container);
		const inputField = FormDetector.findInputField(container);
		
		if (questionLabel && inputField) {
			let fieldCategory = 'other';
			if (inputField.dataset && inputField.dataset.fieldType === 'fileupload') {
				fieldCategory = 'fileupload';
			}
			
			// Add to detection results if not already there
			const existingResult = autoFiller.statistics.detectionResults.find(
				r => r.questionLabel === questionLabel
			);
			
			if (!existingResult) {
				autoFiller.statistics.detectionResults.push({
					questionLabel,
					matched: false,
					key: fieldCategory,
					value: 'Test field',
					inputType: fieldCategory,
					fieldCategory: fieldCategory,
					hasInputField: true
				});
				console.log(`Added test result for: ${questionLabel} (${fieldCategory})`);
			}
		}
	});
	
	// Now test highlighting
	const result = autoFiller.highlightUnfilledFields();
	console.log('Highlighting result:', result);
	
	return result;
};

// Enhanced global error handlers to prevent external script interference
// Store original handlers before we override them
const originalWindowError = window.onerror;
const originalUnhandledRejection = window.onunhandledrejection;

// Set up comprehensive error isolation
window.onerror = function(message, source, lineno, colno, error) {
	// Catch contentScript.js errors and sentence-related errors
	if (source && (source.includes('contentScript.js') || source.includes('content-script'))) {
		console.warn('[AutoFill] Suppressed external contentScript error (global handler):', message);
		return true; // Prevent error from propagating
	}
	
	if (message && (message.includes('sentence') || message.includes('Cannot read properties of undefined'))) {
		console.warn('[AutoFill] Suppressed sentence/undefined property error (global handler):', message);
		return true; // Prevent error from propagating
	}
	
	// Allow our own errors through, but suppress external ones
	if (message && message.includes('[AutoFill]')) {
		// Let our own logging through
		return originalWindowError ? originalWindowError.apply(this, arguments) : false;
	}
	
	return originalWindowError ? originalWindowError.apply(this, arguments) : false;
};

window.onunhandledrejection = function(event) {
	const reason = event.reason;
	
	// Catch contentScript.js promise rejections and sentence-related errors
	if (reason && reason.stack && 
		(reason.stack.includes('contentScript.js') || 
		 reason.stack.includes('content-script') ||
		 reason.message?.includes('sentence') ||
		 reason.message?.includes('Cannot read properties of undefined'))) {
		console.warn('[AutoFill] Suppressed external script promise rejection (global handler):', reason.message);
		event.preventDefault();
		return;
	}
	
	return originalUnhandledRejection ? originalUnhandledRejection.call(this, event) : undefined;
};

// Also add event-level error catching
window.addEventListener('error', function(event) {
	if (event.error && event.error.message && 
		(event.error.message.includes('sentence') || 
		 event.error.message.includes('contentScript') ||
		 event.error.message.includes('Cannot read properties of undefined'))) {
		console.warn('[AutoFill] Caught external script error via addEventListener (likely browser extension conflict):', event.error.message);
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
}, true); // Use capture phase to catch errors early

window.addEventListener('unhandledrejection', function(event) {
	if (event.reason && event.reason.message && 
		(event.reason.message.includes('sentence') ||
		 event.reason.message.includes('contentScript') ||
		 event.reason.message.includes('Cannot read properties of undefined'))) {
		console.warn('[AutoFill] Caught external script promise rejection via addEventListener (likely browser extension conflict):', event.reason.message);
		event.preventDefault();
		event.stopPropagation();
	}
}, true); // Use capture phase to catch rejections early

// Detect page type and initialize autofiller
console.log("[AutoFill] Content init script loaded");
// Ensure Logger binding exists even if Logger.js didn't load for any reason
if (typeof Logger === "undefined") {
	if (typeof globalThis.Logger === "undefined") {
		globalThis.Logger = {
			info: (...args) => console.log("[AutoFill]", ...args),
			warn: (...args) => console.warn("[AutoFill]", ...args),
			error: (...args) => console.error("[AutoFill]", ...args),
			debug: (...args) => console.debug("[AutoFill]", ...args),
		};
		console.warn("[AutoFill] Fallback Logger initialized (global)");
	}
	// Create a real global binding for Logger so unqualified references work
	var Logger = globalThis.Logger;
}
console.log("[AutoFill] Diagnostics:", {
	hasLogger: typeof Logger !== "undefined",
	hasCONFIG: typeof CONFIG !== "undefined",
	hasDetect: typeof detectPageTypeAndAdaptConfig,
	hasFormAutoFiller: typeof FormAutoFiller,
	hasFormDetector: typeof FormDetector !== "undefined",
	hasFieldFiller: typeof FieldFiller !== "undefined",
});

let pageType = "unknown";
try {
	pageType = typeof detectPageTypeAndAdaptConfig === "function"
		? detectPageTypeAndAdaptConfig()
		: "unavailable";
} catch (e) {
	console.error("[AutoFill] detectPageType error:", e);
}

let autoFiller = null;
try {
	autoFiller = typeof FormAutoFiller === "function" ? new FormAutoFiller() : null;
} catch (e) {
	console.error("[AutoFill] FormAutoFiller init error:", e);
}

try {
	Logger.info(`Auto-Fill extension loaded for ${pageType}`);
	if (autoFiller) {
		Logger.debug("Available field mappings:", autoFiller.getFieldMappings());
	}
	Logger.info("Extension ready. Upload CSV data to begin form filling.");
	
} catch (e) {
	console.error("[AutoFill] Logger not available:", e);
}

// Observe DOM changes
const observer = new MutationObserver((mutations) => {
	let shouldCheck = false;
	mutations.forEach((mutation) => {
		if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
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

observer.observe(document.body, { childList: true, subtree: true });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	console.log("📥 CONTENT SCRIPT RECEIVED MESSAGE:", message);
	console.log("├── Action:", message.action);
	console.log("├── Has userData:", !!message.userData);
	console.log("└── Message sender:", sender);
	if (message.action === "fillForm") {
		(async () => {
			try {
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
				if (!autoFiller) {
					console.error("[AutoFill] autoFiller not initialized");
					sendResponse({ success: false, error: "autoFiller not initialized" });
					return;
				}
				// Call async fillForm method
				const result = await autoFiller.fillForm();
				console.log("📊 FORM FILL RESULT:", result);
				Logger.info("Form fill result:", result);
				// Conform to popup.js expectations: wrap stats in `results`
				sendResponse({ success: !!result?.success, results: result });
			} catch (error) {
				console.error("❌ ERROR IN MESSAGE HANDLER:", error);
				Logger.error("Error filling form:", error);
				sendResponse({ success: false, message: "Error occurred while filling form: " + error.message });
			}
		})();
	} else if (message.action === "getUserProfile") {
		sendResponse({ success: true, profile: autoFiller.getUserProfile() });
	} else if (message.action === "getFieldMappings") {
		sendResponse({ success: true, mappings: autoFiller.getFieldMappings() });
	} else if (message.action === "highlightUnfilledFields") {
		try {
			if (!autoFiller) {
				console.error("[AutoFill] autoFiller not initialized for highlighting");
				sendResponse({ success: false, error: "autoFiller not initialized" });
				return true;
			}
			
			const result = autoFiller.highlightUnfilledFields();
			console.log("🎨 HIGHLIGHT RESULT:", result);
			Logger.info("Highlight result:", result);
			sendResponse({ success: !!result?.success, highlightedCount: result?.highlightedCount || 0 });
		} catch (error) {
			console.error("❌ ERROR IN HIGHLIGHT HANDLER:", error);
			Logger.error("Error highlighting fields:", error);
			sendResponse({ success: false, error: "Error occurred while highlighting: " + error.message });
		}
	} else if (message.action === "removeHighlights") {
		try {
			if (!autoFiller) {
				console.error("[AutoFill] autoFiller not initialized for removing highlights");
				sendResponse({ success: false, error: "autoFiller not initialized" });
				return true;
			}
			
			const result = autoFiller.removeHighlights();
			console.log("🎨 REMOVE HIGHLIGHT RESULT:", result);
			Logger.info("Remove highlight result:", result);
			sendResponse({ success: !!result?.success, removedCount: result?.removedCount || 0 });
		} catch (error) {
			console.error("❌ ERROR IN REMOVE HIGHLIGHT HANDLER:", error);
			Logger.error("Error removing highlights:", error);
			sendResponse({ success: false, error: "Error occurred while removing highlights: " + error.message });
		}
	}
	return true;
});

/**
 * Load saved user data from chrome storage for automatic filling
 * @returns {Promise<Object|null>} Saved user data or null
 */
async function loadSavedUserData() {
	try {
		// Check if auto-fill is enabled
		const settingsResult = await chrome.storage.local.get('autoFillSettings');
		const autoFillSettings = settingsResult.autoFillSettings || { enabled: true };
		
		if (!autoFillSettings.enabled) {
			console.log('[AutoFill] Auto-fill disabled by user settings');
			return null;
		}

		// Load saved state to get the last used profile/mode
		const stateResult = await chrome.storage.local.get('appState');
		const savedState = stateResult.appState;
		
		if (!savedState) {
			console.log('[AutoFill] No saved state found for auto-fill');
			return null;
		}

		console.log('[AutoFill] Loading saved user data for auto-fill...');
		console.log('├── Saved mode:', savedState.mode);
		console.log('├── Selected profile ID:', savedState.selectedProfileId);
		console.log('└── State timestamp:', new Date(savedState.timestamp).toISOString());

		if (savedState.mode === 'profiles' && savedState.selectedProfileId) {
			// Load from profiles cache
			const CLOUD_CONFIG = {
				cacheKey: "cloudProfilesCache",
				versionKey: "profilesVersion",
				lastUpdateKey: "profilesLastUpdate"
			};
			
			const cacheResult = await chrome.storage.local.get(CLOUD_CONFIG.cacheKey);
			const cachedProfiles = cacheResult[CLOUD_CONFIG.cacheKey];
			
			if (cachedProfiles && Array.isArray(cachedProfiles)) {
				const selectedProfile = cachedProfiles.find(p => p.id === savedState.selectedProfileId);
				if (selectedProfile) {
					console.log('[AutoFill] ✅ Found cached profile for auto-fill:', selectedProfile.id);
					return selectedProfile;
				} else {
					console.log('[AutoFill] ⚠️ Selected profile not found in cache');
				}
			} else {
				console.log('[AutoFill] ⚠️ No cached profiles available');
			}
		} else if (savedState.mode === 'csv') {
			// Load from CSV cache (if any)
			const csvCacheResult = await chrome.storage.local.get('lastCsvData');
			const lastCsvData = csvCacheResult.lastCsvData;
			
			if (lastCsvData) {
				console.log('[AutoFill] ✅ Found cached CSV data for auto-fill');
				return lastCsvData;
			} else {
				console.log('[AutoFill] ⚠️ No cached CSV data available');
			}
		}
		
		return null;
	} catch (error) {
		console.error('[AutoFill] Error loading saved user data:', error);
		return null;
	}
}

/**
 * Perform automatic form filling on page load
 */
async function performAutoFill() {
	try {
		// Only auto-fill on Google Forms pages
		if (pageType !== 'google-forms') {
			console.log('[AutoFill] Auto-fill skipped: Not a Google Forms page');
			return;
		}
		
		// Load saved user data
		const savedUserData = await loadSavedUserData();
		if (!savedUserData) {
			console.log('[AutoFill] Auto-fill skipped: No saved user data');
			return;
		}
		
		// Check if form elements are available
		const containers = FormDetector.findQuestionContainers();
		if (containers.length === 0) {
			console.log('[AutoFill] Auto-fill skipped: No form elements found');
			return;
		}
		
		console.log('[AutoFill] 🚀 Starting automatic form filling...');
		console.log('├── Found', containers.length, 'form containers');
		console.log('├── Using saved data from:', savedUserData.id || 'CSV upload');
		console.log('└── Page type:', pageType);
		
		// Update user profile with saved data
		if (autoFiller) {
			autoFiller.updateUserProfile(savedUserData);
			
			// Perform automatic filling
			const result = await autoFiller.fillForm();
			
			if (result && result.success) {
				const filledCount = result.fieldsFilled || 0;
				const totalCount = result.fieldsDetected || 0;
				
				console.log('[AutoFill] ✅ Automatic filling completed successfully!');
				console.log(`├── Filled ${filledCount}/${totalCount} fields`);
				console.log(`├── Success rate: ${result.overallSuccessRate || 0}%`);
				console.log('└── File uploads:', result.fileUploadFields || 0);
				
				// Show a discrete notification
				showAutoFillNotification(filledCount, totalCount);
			} else {
				console.log('[AutoFill] ⚠️ Automatic filling failed:', result?.message || 'Unknown error');
			}
		} else {
			console.error('[AutoFill] AutoFiller not available for automatic filling');
		}
	} catch (error) {
		console.error('[AutoFill] Error during automatic filling:', error);
	}
}

/**
 * Show a discrete notification about automatic filling
 * @param {number} filledCount - Number of fields filled
 * @param {number} totalCount - Total number of fields detected
 */
function showAutoFillNotification(filledCount, totalCount) {
	try {
		// Create notification element
		const notification = document.createElement('div');
		notification.id = 'autofill-notification';
		notification.style.cssText = `
			position: fixed;
			top: 20px;
			right: 20px;
			background: #4CAF50;
			color: white;
			padding: 12px 20px;
			border-radius: 8px;
			box-shadow: 0 4px 12px rgba(0,0,0,0.15);
			z-index: 10000;
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
			font-size: 14px;
			font-weight: 500;
			max-width: 300px;
			opacity: 0;
			transform: translateY(-10px);
			transition: all 0.3s ease;
			cursor: pointer;
		`;
		
		notification.innerHTML = `
			<div style="display: flex; align-items: center; gap: 8px;">
				<span style="font-size: 16px;">🤖</span>
				<div>
					<div><strong>FillEngine</strong></div>
					<div style="font-size: 12px; opacity: 0.9;">Rempli ${filledCount}/${totalCount} champs automatiquement</div>
				</div>
				<span style="font-size: 12px; opacity: 0.7; margin-left: auto;">×</span>
			</div>
		`;
		
		// Add click handler to close
		notification.addEventListener('click', () => {
			notification.style.opacity = '0';
			notification.style.transform = 'translateY(-10px)';
			setTimeout(() => notification.remove(), 100);
		});
		
		// Add to page
		document.body.appendChild(notification);
		
		// Animate in
		requestAnimationFrame(() => {
			notification.style.opacity = '1';
			notification.style.transform = 'translateY(0)';
		});
		
		// Auto-remove after 5 seconds
		setTimeout(() => {
			if (notification.parentElement) {
				notification.style.opacity = '0';
				notification.style.transform = 'translateY(-10px)';
				setTimeout(() => notification.remove(), 100);
			}
		}, 5000);
		
		console.log('[AutoFill] 📢 Auto-fill notification displayed');
	} catch (error) {
		console.error('[AutoFill] Error showing notification:', error);
	}
}

function initializeWhenReady() {
	if (document.readyState === "complete") {
		Logger.info(`Page is ready (${pageType})`);
		// Perform auto-fill immediately
		performAutoFill();
	} else {
		window.addEventListener("load", () => {
			Logger.info(`Page loaded (${pageType})`);
			// Perform auto-fill immediately
			performAutoFill();
		});
	}
}

initializeWhenReady();


