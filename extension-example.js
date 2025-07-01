// ============================================================================
// EXAMPLE: How to extend the Auto-Fill Extension
// ============================================================================

// This file shows how to easily add new data fields and categories
// to the Auto-Fill Google Forms Extension

// ============================================================================
// STEP 1: Extend USER_PROFILE with new data
// ============================================================================

const EXTENDED_USER_PROFILE = {
  // Existing categories...
  personal: {
    lastName: "KONE",
    firstName: "Amadou",
    fullName: "Amadou KONE",
    gender: "Masculin",
    sex: "Homme",
    // NEW: Additional personal fields
    middleName: "Ibrahim",
    title: "Mr",
    maritalStatus: "Célibataire",
  },

  // NEW CATEGORY: Education
  education: {
    currentLevel: "Master 2",
    institution: "Université Felix Houphouet-Boigny",
    fieldOfStudy: "Informatique et Systèmes",
    graduationYear: "2024",
    gpa: "16.5/20",
    previousDiploma: "Licence Informatique",
  },

  // NEW CATEGORY: Work Experience
  workExperience: {
    currentPosition: "Développeur Senior",
    yearsExperience: "5 ans",
    previousCompany: "Orange Digital Center",
    startDate: "01/01/2020",
    endDate: "31/12/2023",
    salary: "850,000 FCFA",
  },

  // NEW CATEGORY: Emergency Contact
  emergencyContact: {
    name: "Fatou KONE",
    relationship: "Épouse",
    phone: "+225 05 04 03 02 01",
    email: "fatou.kone@example.com",
    address: "Cocody Riviera, Abidjan",
  },

  // NEW CATEGORY: Health Information
  health: {
    bloodType: "O+",
    allergies: "Aucune allergie connue",
    medications: "Aucune",
    emergencyMedicalInfo: "Aucune condition particulière",
    insuranceNumber: "CI-HEALTH-789123",
  },

  // NEW CATEGORY: Travel/Visa
  travel: {
    passportIssueDate: "15/01/2020",
    passportExpiryDate: "15/01/2030",
    visaType: "Étudiant",
    intendedStayDuration: "2 ans",
    purposeOfVisit: "Études supérieures",
    previousVisits: "Première visite",
  },

  // Existing categories remain unchanged...
  contact: {
    email: "amadou.kone@example.com",
    phone: "+225 07 08 09 10 11",
    mobile: "+225 07 08 09 10 11",
  },
  // ... other existing categories
};

// ============================================================================
// STEP 2: Extend FIELD_MAPPINGS with new field patterns
// ============================================================================

const EXTENDED_FIELD_MAPPINGS = {
  // Existing mappings...
  personal: {
    lastName: ["nom", "noms", "name", "lastname"],
    firstName: ["prénom", "prenom", "prenoms", "firstname"],
    // NEW: Additional personal mappings
    middleName: ["deuxième prénom", "deuxieme prenom", "middle name", "nom du milieu", "second prénom"],
    title: ["titre", "civilité", "title", "mr", "mrs", "miss", "monsieur", "madame", "mademoiselle"],
    maritalStatus: ["état civil", "etat civil", "marital status", "situation familiale", "célibataire", "marié"],
  },

  // NEW: Education mappings
  education: {
    currentLevel: [
      "niveau actuel",
      "niveau d'études",
      "niveau etudes",
      "current level",
      "education level",
      "diplôme en cours",
      "niveau scolaire",
      "classe",
      "année d'études",
    ],
    institution: ["établissement", "etablissement", "université", "universite", "institution", "school", "college", "école", "ecole"],
    fieldOfStudy: [
      "domaine d'études",
      "domaine etudes",
      "field of study",
      "spécialité",
      "specialite",
      "filière",
      "filiere",
      "discipline",
      "matière principale",
    ],
    graduationYear: ["année d'obtention", "annee obtention", "graduation year", "année de fin", "date graduation", "fin études"],
    gpa: ["moyenne", "note moyenne", "gpa", "average grade", "résultats", "notes", "mention"],
    previousDiploma: ["diplôme précédent", "diplome precedent", "previous diploma", "dernier diplôme", "qualification antérieure"],
  },

  // NEW: Work Experience mappings
  workExperience: {
    currentPosition: ["poste actuel", "position actuelle", "current position", "fonction", "titre du poste", "job title", "emploi"],
    yearsExperience: [
      "années d'expérience",
      "annees experience",
      "years experience",
      "expérience professionnelle",
      "durée expérience",
    ],
    previousCompany: [
      "entreprise précédente",
      "entreprise precedente",
      "previous company",
      "ancien employeur",
      "dernière entreprise",
      "ex-employeur",
    ],
    startDate: ["date de début", "date debut", "start date", "commencement", "début emploi", "date d'embauche"],
    endDate: ["date de fin", "date fin", "end date", "fin emploi", "date départ", "dernière date"],
    salary: ["salaire", "rémunération", "remuneration", "salary", "traitement", "appointements", "revenus"],
  },

  // NEW: Emergency Contact mappings
  emergencyContact: {
    name: [
      "contact d'urgence",
      "contact urgence",
      "emergency contact",
      "personne à contacter",
      "nom contact urgence",
      "référent",
      "referent",
    ],
    relationship: ["relation", "lien de parenté", "lien parente", "relationship", "parenté", "parente", "lien familial"],
    phone: ["téléphone urgence", "telephone urgence", "emergency phone", "numéro contact urgence", "tel urgence"],
    email: ["email contact urgence", "courriel urgence", "adresse mail contact", "email référent"],
    address: ["adresse contact urgence", "adresse référent", "adresse personne contact"],
  },

  // NEW: Health mappings
  health: {
    bloodType: ["groupe sanguin", "type sanguin", "blood type", "sang", "rhésus", "rhesus"],
    allergies: ["allergies", "allergie", "allergique à", "intolérances", "reactions allergiques"],
    medications: ["médicaments", "medicaments", "medications", "traitements", "médicaments pris", "prescriptions"],
    emergencyMedicalInfo: [
      "informations médicales urgence",
      "info medicales urgence",
      "emergency medical info",
      "conditions médicales",
      "problèmes de santé",
      "antécédents médicaux",
    ],
    insuranceNumber: ["numéro assurance", "numero assurance", "insurance number", "assurance santé", "mutuelle", "sécurité sociale"],
  },

  // NEW: Travel/Visa mappings
  travel: {
    passportIssueDate: ["date émission passeport", "date emission passeport", "passport issue date", "date délivrance passeport"],
    passportExpiryDate: ["date expiration passeport", "passport expiry date", "validité passeport", "fin validité passeport"],
    visaType: ["type de visa", "visa type", "catégorie visa", "nature du visa", "visa category"],
    intendedStayDuration: ["durée de séjour", "duree sejour", "intended stay duration", "durée prévue", "période de séjour"],
    purposeOfVisit: ["motif du voyage", "purpose of visit", "raison du séjour", "objectif voyage", "but de la visite"],
    previousVisits: ["visites précédentes", "visites precedentes", "previous visits", "voyages antérieurs", "séjours précédents"],
  },

  // Existing mappings remain unchanged...
};

// ============================================================================
// STEP 3: Optional - Extend CONFIG for new field types
// ============================================================================

const EXTENDED_CONFIG = {
  // All existing config...
  minMatchScore: 0.7,

  // NEW: Category-specific match scores
  categoryMatchScores: {
    personal: 0.8, // Higher confidence for personal info
    contact: 0.8, // Higher confidence for contact info
    education: 0.7, // Standard confidence
    workExperience: 0.6, // Lower confidence for work info
    health: 0.9, // Very high confidence for health info
    travel: 0.7, // Standard confidence for travel
  },

  // NEW: Priority categories (filled first)
  priorityCategories: ["personal", "contact", "documents", "location"],

  // NEW: Optional categories (filled only if high confidence)
  optionalCategories: ["workExperience", "emergencyContact", "health", "travel"],
};

// ============================================================================
// STEP 4: Usage Example
// ============================================================================

/*
To use these extensions:

1. Replace USER_PROFILE with EXTENDED_USER_PROFILE in content.js
2. Replace FIELD_MAPPINGS with EXTENDED_FIELD_MAPPINGS in content.js
3. Optionally update CONFIG with category-specific rules
4. Test on forms with the new field types

The system will automatically:
- Generate flat dictionary with all new fields
- Apply intelligent matching to new field patterns
- Provide statistics for new categories
- Handle errors gracefully for unsupported fields
*/

// ============================================================================
// STEP 5: Testing New Categories
// ============================================================================

// Test function to validate new mappings (for development)
function validateExtensions() {
  console.log("=== EXTENSION VALIDATION ===");

  // Check USER_PROFILE structure
  const categories = Object.keys(EXTENDED_USER_PROFILE);
  console.log(`Total categories: ${categories.length}`);
  console.log("Categories:", categories);

  // Check FIELD_MAPPINGS completeness
  for (const [category, fields] of Object.entries(EXTENDED_FIELD_MAPPINGS)) {
    if (!EXTENDED_USER_PROFILE[category]) {
      console.warn(`Missing USER_PROFILE category: ${category}`);
      continue;
    }

    for (const fieldName of Object.keys(fields)) {
      if (!EXTENDED_USER_PROFILE[category][fieldName]) {
        console.warn(`Missing USER_PROFILE field: ${category}.${fieldName}`);
      }
    }
  }

  // Count total field variations
  let totalVariations = 0;
  for (const [category, fields] of Object.entries(EXTENDED_FIELD_MAPPINGS)) {
    for (const [fieldName, variations] of Object.entries(fields)) {
      totalVariations += variations.length;
    }
  }

  console.log(`Total field variations: ${totalVariations}`);
  console.log("=== VALIDATION COMPLETE ===");
}

// Run validation (uncomment for testing)
// validateExtensions();

export { EXTENDED_CONFIG, EXTENDED_FIELD_MAPPINGS, EXTENDED_USER_PROFILE, validateExtensions };
