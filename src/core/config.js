"use strict";

// Configuration et sélecteurs par défaut
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
	skipFieldTypes: [
		"time",
		"datetime-local",
		"color",
		"range",
		"file",
		"submit",
		"button",
		"reset",
	],
	skipKeywords: ["sélectionn", "choisir"],
	// File upload configuration
	fileUploadSelectors: [
		'div[role="button"][aria-label*="Ajouter un fichier"]',
		'div[role="button"][aria-label*="Add file"]',
		'button[aria-label*="Ajouter un fichier"]',
		'button[aria-label*="Add file"]',
		'.freebirdFormviewerViewItemsFileUploadButton',
		'[data-value="Upload file"]',
		'input[type="file"]'
	],
	fileTypeMapping: {
		photo: ['image', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'],
		pdf: ['pdf', 'document']
	},
	fileUploadModalSelectors: {
		modal: 'iframe[src*="picker"], dialog[role="dialog"], .picker-dialog',
		recentTab: 'div[data-id="recent"], [aria-label*="Recent"], [aria-label*="Récents"]',
		fileList: '.picker-dataview, .picker-photos-albumsgrid, .docs-material-grid',
		loadingIndicator: '.picker-loading, .loading'
	},
	specialKeywords: {
		motifs: ["motifs", "raison", "passez-vous", "test", "académique"],
		signature: ["signer", "nom complet", "confirmez", "document", "veuillez"],
		engagement: ["engagement", "honneur", "responsabilité", "informations"],
		fileupload: ["fichier", "télécharger", "upload", "file", "document", "photo", "image", "pdf"]
	},
};

try {
	globalThis.CONFIG = CONFIG;
} catch (e) {}


