"use strict";

class FormAutoFiller {
	constructor() {
		this.dictionary = generateFlatDictionary();
		this.fieldMatcher = new FieldMatcher(this.dictionary);
		this.statistics = {
			fieldsDetected: 0,
			fieldsFilled: 0,
			detectionResults: [],
			fileUploadFields: 0,
			fileUploadProcessed: 0,
			fileUploadErrors: []
		};
	}

	updateUserProfile(newProfile) {
		console.log("🔄 UPDATE USER PROFILE CALLED");
		console.log("├── New profile provided:", !!newProfile);
		console.log("├── Current USER_PROFILE before update:", USER_PROFILE);
		console.log("└── New profile data:", newProfile);

		if (newProfile) {
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

	async fillForm() {
		console.log("🚀 FILL FORM PROCESS STARTED");
		console.log("├── USER_PROFILE.personal:", USER_PROFILE.personal);
		console.log("├── USER_PROFILE keys:", Object.keys(USER_PROFILE));
		console.log("└── Dictionary available:", !!this.dictionary);

		Logger.info("Starting form fill process...");

		if (!USER_PROFILE.personal || Object.keys(USER_PROFILE.personal).length === 0) {
			console.log("❌ NO USER DATA - form fill aborted");
			console.log("├── USER_PROFILE.personal:", USER_PROFILE.personal);
			console.log(
				"├── Keys length:",
				USER_PROFILE.personal ? Object.keys(USER_PROFILE.personal).length : 0
			);
			Logger.error("No user data loaded. Please upload a CSV file first.");
			return {
				success: false,
				message:
					"Aucune donnée utilisateur chargée. Veuillez d'abord télécharger un fichier CSV.",
				fieldsDetected: 0,
				fieldsFilled: 0,
				supportedFields: 0,
				unsupportedFields: 0,
				fieldsWithoutInput: 0,
				supportedSuccessRate: 0,
				overallSuccessRate: 0,
				detectionResults: [],
				fileUploadFields: 0,
				fileUploadProcessed: 0,
				fileUploadErrors: []
			};
		}

		this.statistics = {
			fieldsDetected: 0,
			fieldsFilled: 0,
			detectionResults: [],
			fileUploadFields: 0,
			fileUploadProcessed: 0,
			fileUploadErrors: []
		};

		const containers = FormDetector.findQuestionContainers();

		// First, process regular form fields

		containers.forEach((container, index) => {
			const questionLabel = FormDetector.extractQuestionLabel(container);
			Logger.debug(`Question ${index + 1}: "${questionLabel}"`);
			if (!questionLabel) return;
			this.statistics.fieldsDetected++;
			const inputField = FormDetector.findInputField(container);
			let matchFound = false;
			let matchedKey = "";
			let matchedValue = "";
			let inputType = "unknown";
			let fieldCategory = "unknown";
			if (inputField) {
				inputType =
					inputField.type ||
					inputField.tagName.toLowerCase() ||
					inputField.getAttribute("role") ||
					"element";
				if (inputType === "date") {
					fieldCategory = "date";
				} else if (
					inputType === "select" ||
					inputField.querySelector('[role="listbox"]') ||
					container.querySelector('[role="listbox"]')
				) {
					fieldCategory = "select";
				} else if (
					inputType === "radio" ||
					inputField.getAttribute("role") === "radio" ||
					container.querySelector('[role="radio"]')
				) {
					fieldCategory = "radio";
				} else if (
					inputType === "checkbox" ||
					inputField.getAttribute("role") === "checkbox" ||
					container.querySelector('[role="checkbox"]')
				) {
					fieldCategory = "checkbox";
				} else if (
					inputType === "text" ||
					inputType === "email" ||
					inputType === "tel" ||
					inputType === "textarea"
				) {
					fieldCategory = "text";
				} else {
					fieldCategory = "other";
				}
				if (
					fieldCategory === "text" ||
					fieldCategory === "radio" ||
					fieldCategory === "checkbox" ||
					fieldCategory === "date" ||
					fieldCategory === "select"
				) {
					if (this.dictionary[questionLabel]) {
						const dictValue = this.dictionary[questionLabel];
						// Validate the value before setting
						if (dictValue !== undefined && dictValue !== null && dictValue !== '') {
							Logger.info(
								`✅ Exact match found: "${questionLabel}" -> "${dictValue}"`
							);
							const success = FieldFiller.setFieldValue(
								inputField,
								dictValue
							);
							if (success) {
								this.statistics.fieldsFilled++;
								matchFound = true;
								matchedKey = questionLabel;
								matchedValue = dictValue;
							}
						} else {
							Logger.debug(`Skipping exact match with empty/null value for: "${questionLabel}"`);
						}
					} else {
						const bestMatch = this.fieldMatcher.findBestMatch(questionLabel);
						if (bestMatch && bestMatch.value !== undefined && bestMatch.value !== null && bestMatch.value !== '') {
							Logger.info(
								`✅ Best match found: "${bestMatch.key}" -> "${bestMatch.value}" (score: ${bestMatch.score.toFixed(2)})`
							);
							const success = FieldFiller.setFieldValue(
								inputField,
								bestMatch.value
							);
							if (success) {
								this.statistics.fieldsFilled++;
								matchFound = true;
								matchedKey = bestMatch.key;
								matchedValue = bestMatch.value;
							}
						} else if (bestMatch) {
							Logger.debug(`Skipping best match with empty/null value for: "${questionLabel}" -> "${bestMatch.value}"`);
						}
					}
				} else {
					Logger.debug(
						`⏭️ Skipped question ${index + 1}: unsupported field type "${fieldCategory}" (${inputType})`
					);
				}
			} else {
				Logger.debug(`⏭️ Skipped question ${index + 1}: no input field found`);
				inputType = "no-input-field";
				fieldCategory = "no-input";
			}
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
		const supportedSuccessRate =
			supportedFields > 0 ? Math.round((this.statistics.fieldsFilled / supportedFields) * 100) : 0;
		const overallSuccessRate =
			this.statistics.fieldsDetected > 0
				? Math.round((this.statistics.fieldsFilled / this.statistics.fieldsDetected) * 100)
				: 0;

		Logger.info(
			`Form fill complete: ${this.statistics.fieldsFilled}/${supportedFields} champs supportés remplis, ${unsupportedFields} champs non supportés, ${fieldsWithoutInput} sans champ d'entrée (Total: ${this.statistics.fieldsDetected} questions)`
		);
		Logger.debug("Detection results:", this.statistics.detectionResults);

		// Automatically highlight unfilled fields after form filling
		this.highlightUnfilledFields();

		// After form filling is complete, process file upload fields
		Logger.info("Form filling completed, now processing file upload fields...");
		await this.processFileUploadFields();

		// After form filling and file processing, automatically click first "Ajouter un fichier" button
		Logger.info("Form processing completed, now clicking first 'Ajouter un fichier' button...");
		const buttonClickResult = await this.clickFirstAjouterFichierButton();

		return {
			success: true,
			message: `Analysé ${this.statistics.fieldsDetected} questions - Rempli ${this.statistics.fieldsFilled} champs (${overallSuccessRate}%) - Puis traité ${this.statistics.fileUploadProcessed} fichiers upload - ${buttonClickResult.success ? 'Cliqué bouton "Ajouter un fichier"' : 'Aucun bouton "Ajouter un fichier" cliqué'}`,
			fieldsDetected: this.statistics.fieldsDetected,
			fieldsFilled: this.statistics.fieldsFilled,
			supportedFields: supportedFields,
			unsupportedFields: unsupportedFields,
			fieldsWithoutInput: fieldsWithoutInput,
			supportedSuccessRate: supportedSuccessRate,
			overallSuccessRate: overallSuccessRate,
			detectionResults: this.statistics.detectionResults,
			fileUploadFields: this.statistics.fileUploadFields,
			fileUploadProcessed: this.statistics.fileUploadProcessed,
			fileUploadErrors: this.statistics.fileUploadErrors,
			buttonClickResult: buttonClickResult
		};
	}

	getUserProfile() {
		return { ...USER_PROFILE };
	}

	getFieldMappings() {
		return { ...FIELD_MAPPINGS };
	}

	/**
	 * Highlight unfilled fields with visual indicators and labels
	 * @returns {Object} Result object with success status and statistics
	 */
	highlightUnfilledFields() {
		Logger.info("Starting automatic highlighting of unfilled fields...");
		
		// Remove any existing highlights first
		this.removeHighlights();
		
		let highlightedCount = 0;
		const containers = FormDetector.findQuestionContainers();
		
		containers.forEach((container, index) => {
			const questionLabel = FormDetector.extractQuestionLabel(container);
			if (!questionLabel) return;
			
			// Check if this field was filled by looking at our statistics
			const fieldResult = this.statistics.detectionResults.find(
				result => result.questionLabel === questionLabel
			);
			
			// Only highlight if field was not filled and is a supported field type
			if (fieldResult && !fieldResult.matched && fieldResult.hasInputField && 
				(fieldResult.fieldCategory === "text" || fieldResult.fieldCategory === "radio" || 
				 fieldResult.fieldCategory === "checkbox" || fieldResult.fieldCategory === "date" || 
				 fieldResult.fieldCategory === "select")) {
				
				this.addHighlightToField(container, questionLabel);
				highlightedCount++;
			}
		});
		
		Logger.info(`Highlighted ${highlightedCount} unfilled fields`);
		
		return {
			success: true,
			highlightedCount: highlightedCount,
			message: `${highlightedCount} champs non remplis surlignés`
		};
	}
	
	/**
	 * Add highlight styling to a specific field container
	 * @param {Element} container - The field container element
	 * @param {string} questionLabel - The question label text
	 */
	addHighlightToField(container, questionLabel) {
		try {
			// Add highlight class to container
			container.classList.add('autofill-highlight-unfilled');
			
			// Find input field in container and add change listener
			const inputField = FormDetector.findInputField(container);
			if (inputField) {
				this.addFieldChangeListener(container, inputField);
			}
			
			Logger.debug(`Added highlight to field: "${questionLabel}"`);
		} catch (error) {
			Logger.error(`Error adding highlight to field: ${error.message}`);
		}
	}
	
	/**
	 * Add change listener to an input field to remove highlighting when filled
	 * @param {Element} container - The field container element
	 * @param {Element} inputField - The input field element
	 */
	addFieldChangeListener(container, inputField) {
		try {
			const removeHighlightOnChange = () => {
				if (this.isFieldFilled(inputField)) {
					container.classList.remove('autofill-highlight-unfilled');
					Logger.debug('Removed highlight from filled field');
				}
			};
			
			// Add multiple event listeners to catch different types of input
			inputField.addEventListener('input', removeHighlightOnChange);
			inputField.addEventListener('change', removeHighlightOnChange);
			inputField.addEventListener('blur', removeHighlightOnChange);
			
			// For radio buttons and checkboxes, listen for click events
			if (inputField.type === 'radio' || inputField.type === 'checkbox') {
				inputField.addEventListener('click', removeHighlightOnChange);
			}
			
			// For select elements
			if (inputField.tagName.toLowerCase() === 'select') {
				inputField.addEventListener('change', removeHighlightOnChange);
			}
			
			// For elements with role attributes (Google Forms)
			if (inputField.getAttribute('role')) {
				inputField.addEventListener('click', removeHighlightOnChange);
				// Also listen for mutations on the container for Google Forms dynamic updates
				const observer = new MutationObserver(() => {
					if (this.isFieldFilled(inputField)) {
						container.classList.remove('autofill-highlight-unfilled');
						Logger.debug('Removed highlight from filled field (mutation)');
						observer.disconnect();
					}
				});
				observer.observe(container, { childList: true, subtree: true, attributes: true });
			}
			
		} catch (error) {
			Logger.error(`Error adding field change listener: ${error.message}`);
		}
	}
	
	/**
	 * Check if a field is filled with a value
	 * @param {Element} inputField - The input field element
	 * @returns {boolean} True if field has a value
	 */
	isFieldFilled(inputField) {
		try {
			if (!inputField) return false;
			
			// For text inputs, textareas, selects
			if (inputField.value && inputField.value.trim() !== '') {
				return true;
			}
			
			// For radio buttons - check if any in the group is selected
			if (inputField.type === 'radio') {
				const radioGroup = document.querySelectorAll(`input[name="${inputField.name}"]`);
				return Array.from(radioGroup).some(radio => radio.checked);
			}
			
			// For checkboxes
			if (inputField.type === 'checkbox') {
				return inputField.checked;
			}
			
			// For Google Forms elements with role attributes
			if (inputField.getAttribute('role')) {
				// Check for aria-checked attribute
				if (inputField.getAttribute('aria-checked') === 'true') {
					return true;
				}
				
				// Check for selected options in dropdowns
				if (inputField.getAttribute('role') === 'listbox') {
					const selectedOption = inputField.querySelector('[aria-selected="true"]');
					return !!selectedOption;
				}
				
				// Check for text content in text-like fields
				if (inputField.textContent && inputField.textContent.trim() !== '') {
					return true;
				}
			}
			
			return false;
		} catch (error) {
			Logger.error(`Error checking if field is filled: ${error.message}`);
			return false;
		}
	}

	/**
	 * Process file upload fields in the form
	 * @returns {Promise<Object>} Processing results
	 */
	async processFileUploadFields() {
		try {
			Logger.info("Processing file upload fields after form filling completion...");
			
			// Wait a bit and check if FileUploadHandler is available
			let retryCount = 0;
			const maxRetries = 5;
			
			while (retryCount < maxRetries) {
				if (typeof FileUploadHandler !== 'undefined' && typeof globalThis.FileUploadHandler !== 'undefined' &&
					typeof FileUploadModalHandler !== 'undefined' && typeof globalThis.FileUploadModalHandler !== 'undefined') {
					break;
				}
				
				retryCount++;
				Logger.debug(`Waiting for file upload handlers... retry ${retryCount}/${maxRetries}`);
				await this.delay(500);
			}
			
			// Final check if FileUploadHandler is available
			if (typeof FileUploadHandler === 'undefined' && typeof globalThis.FileUploadHandler === 'undefined') {
				Logger.info("FileUploadHandler not available after retries, skipping file upload processing");
				return {
					success: true,
					processed: 0,
					total: 0,
					errors: ['FileUploadHandler not available']
				};
			}
			
			// Use globalThis reference to ensure availability
			const FileUploadHandlerRef = globalThis.FileUploadHandler || FileUploadHandler;
			
			// Detect file upload fields
			const uploadFields = FileUploadHandlerRef.detectFileUploadFields();
			this.statistics.fileUploadFields = uploadFields.length;
			
			if (uploadFields.length === 0) {
				Logger.info("No file upload fields detected");
				return { success: true, processed: 0, errors: [] };
			}
			
			Logger.info(`Found ${uploadFields.length} file upload fields`);
			
			// Process each file upload field
			for (const fieldInfo of uploadFields) {
				try {
					Logger.info(`Processing file upload: ${fieldInfo.questionLabel} (expected: ${fieldInfo.expectedFileType})`);
					
					// Check if FileUploadModalHandler is available (should be available if we got this far)
					const FileUploadModalHandlerRef = globalThis.FileUploadModalHandler || FileUploadModalHandler;
					if (!FileUploadModalHandlerRef) {
						this.statistics.fileUploadErrors.push({
							field: fieldInfo.questionLabel,
							error: 'FileUploadModalHandler not available',
							step: 'initialization'
						});
						Logger.error(`FileUploadModalHandler not available for: ${fieldInfo.questionLabel}`);
						continue;
					}
					
					// Use the modal handler to process the upload field
					const result = await FileUploadModalHandlerRef.handleUploadModal(fieldInfo);
					
					if (result.success) {
						this.statistics.fileUploadProcessed++;
						Logger.info(`✅ Successfully processed file upload: ${fieldInfo.questionLabel}`);
						
						// Add to detection results for reporting
						this.statistics.detectionResults.push({
							questionLabel: fieldInfo.questionLabel,
							matched: true,
							key: 'fileupload',
							value: `File upload processed (${fieldInfo.expectedFileType})`,
							inputType: 'fileupload',
							fieldCategory: 'fileupload',
							hasInputField: true,
							expectedFileType: fieldInfo.expectedFileType,
							processingResult: result
						});
					} else {
						this.statistics.fileUploadErrors.push({
							field: fieldInfo.questionLabel,
							error: result.error,
							step: result.step
						});
						Logger.error(`Failed to process file upload: ${fieldInfo.questionLabel} - ${result.error}`);
						
						// Add to detection results as failed
						this.statistics.detectionResults.push({
							questionLabel: fieldInfo.questionLabel,
							matched: false,
							key: 'fileupload',
							value: `Failed: ${result.error}`,
							inputType: 'fileupload',
							fieldCategory: 'fileupload',
							hasInputField: true,
							expectedFileType: fieldInfo.expectedFileType,
							processingResult: result
						});
					}
					
					// Add delay between file upload processing
					await this.delay(2000);
					
				} catch (error) {
					this.statistics.fileUploadErrors.push({
						field: fieldInfo.questionLabel,
						error: error.message,
						step: 'exception'
					});
					Logger.error(`Exception processing file upload ${fieldInfo.questionLabel}:`, error);
				}
			}
			
			Logger.info(`File upload processing complete (after form filling): ${this.statistics.fileUploadProcessed}/${this.statistics.fileUploadFields} processed`);
			
			return {
				success: true,
				processed: this.statistics.fileUploadProcessed,
				total: this.statistics.fileUploadFields,
				errors: this.statistics.fileUploadErrors
			};
			
		} catch (error) {
			Logger.error('Error in file upload processing:', error);
			return {
				success: false,
				error: error.message,
				processed: this.statistics.fileUploadProcessed,
				total: this.statistics.fileUploadFields,
				errors: this.statistics.fileUploadErrors
			};
		}
	}

	/**
	 * Automatically click the first "Ajouter un fichier" button found on the page
	 * @returns {Promise<Object>} Click result object
	 */
	async clickFirstAjouterFichierButton() {
		try {
			Logger.info("Searching for 'Ajouter un fichier' buttons to click...");
			
			// Use the same selectors from CONFIG
			const selectors = [
				'div[role="button"][aria-label*="Ajouter un fichier"]',
				'div[role="button"][aria-label*="ajouter un fichier"]',
				'button[aria-label*="Ajouter un fichier"]',
				'button[aria-label*="ajouter un fichier"]',
				'div[role="button"][aria-label*="Add file"]',
				'button[aria-label*="Add file"]',
				'[aria-label*="Ajouter un fichier"]',
				'[aria-label*="Add file"]'
			];
			
			let totalFound = 0;
			let clickedButton = null;
			
			for (const selector of selectors) {
				try {
					const elements = document.querySelectorAll(selector);
					Logger.debug(`Selector "${selector}" found ${elements.length} elements`);
					
					for (const element of elements) {
						const ariaLabel = element.getAttribute('aria-label');
						const isVisible = element.offsetWidth > 0 && element.offsetHeight > 0;
						
						Logger.debug(`Found button:`, {
							tagName: element.tagName.toLowerCase(),
							role: element.getAttribute('role'),
							ariaLabel: ariaLabel,
							isVisible: isVisible,
							classes: element.className
						});
						
						totalFound++;
						
						// Click the first visible button we find
						if (!clickedButton && isVisible) {
							try {
								Logger.info(`Clicking first "Ajouter un fichier" button: ${ariaLabel}`);
								
								// Find the question container for context
								const container = element.closest('[role="listitem"], .freebirdFormviewerViewItemsItemItem, .m2, .geS5n');
								if (container) {
									const questionText = container.querySelector('[role="heading"], .M7eMe, .freebirdFormviewerViewItemsItemItemTitle');
									if (questionText) {
										Logger.info(`Question context: "${questionText.textContent.trim()}"`);  
									}
								}
								
								// Perform the click with multiple event types for maximum compatibility
								element.focus();
								element.click();
								
								// Dispatch mouse events for better compatibility
								const mouseEvents = ['mousedown', 'mouseup', 'click'];
								mouseEvents.forEach(eventType => {
									try {
										element.dispatchEvent(new MouseEvent(eventType, { 
											bubbles: true, 
											cancelable: true,
											view: window
										}));
									} catch (eventError) {
										Logger.debug(`Failed to dispatch ${eventType} event:`, eventError.message);
									}
								});
								
								clickedButton = {
									element: element,
									ariaLabel: ariaLabel,
									selector: selector
								};
								
								Logger.info(`✅ Successfully clicked "Ajouter un fichier" button`);
								break;
								
							} catch (clickError) {
								Logger.error(`Failed to click button: ${clickError.message}`);
							}
						}
					}
					
					// If we found and clicked a button, stop searching
					if (clickedButton) {
						break;
					}
					
				} catch (selectorError) {
					Logger.error(`Error with selector "${selector}": ${selectorError.message}`);
				}
			}
			
			Logger.info(`Button search complete: ${totalFound} total buttons found, ${clickedButton ? 'clicked first one' : 'none clicked'}`);
			
			return {
				success: !!clickedButton,
				totalFound: totalFound,
				clickedButton: clickedButton,
				message: clickedButton ? 
					`Successfully clicked first "Ajouter un fichier" button: ${clickedButton.ariaLabel}` : 
					`Found ${totalFound} "Ajouter un fichier" buttons but none were clickable`
			};
			
		} catch (error) {
			Logger.error('Error in clickFirstAjouterFichierButton:', error);
			return {
				success: false,
				error: error.message,
				totalFound: 0,
				clickedButton: null
			};
		}
	}

	/**
	 * Simple delay utility
	 * @param {number} ms - Milliseconds to delay
	 * @returns {Promise} Promise that resolves after delay
	 */
	delay(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	
	/**
	 * Remove all highlighting from unfilled fields
	 * @returns {Object} Result object with success status
	 */
	removeHighlights() {
		try {
			// Remove all highlight classes
			const highlightedElements = document.querySelectorAll('.autofill-highlight-unfilled');
			highlightedElements.forEach(element => {
				element.classList.remove('autofill-highlight-unfilled');
			});
			
			Logger.debug(`Removed highlights from ${highlightedElements.length} fields`);
			
			return {
				success: true,
				removedCount: highlightedElements.length
			};
		} catch (error) {
			Logger.error(`Error removing highlights: ${error.message}`);
			return {
				success: false,
				error: error.message
			};
		}
	}
}

try {
	globalThis.FormAutoFiller = FormAutoFiller;
} catch (e) {}



try {
	globalThis.FormAutoFiller = FormAutoFiller;
} catch (e) {}


