# 📋 TODO - Système de Profils Multiples

## 🎯 Objectif

Ajouter un système de base de données CSV intégrée permettant de gérer plusieurs profils utilisateur avec un double workflow :

1. **Mode Profils** (par défaut) : Sélection d'un profil prédéfini
2. **Mode CSV Upload** (existant) : Upload d'un fichier CSV personnalisé

## 📦 Tâches à réaliser

### 1. 🗄️ **Création de la base de données intégrée**

- [x] Créer `data/profiles.csv` avec plusieurs profils exemple
- [x] Ajouter une colonne `id` unique pour chaque profil
- [x] Structurer le fichier avec 5-10 profils types différents
- [x] Intégrer ce fichier directement dans l'extension (pas d'upload)

### 2. 🔄 **Refactoring du système de parsing CSV**

- [x] Modifier `parseCSV()` pour supporter la colonne `id`
- [x] Créer `parseProfilesDatabase()` pour lire le CSV intégré
- [x] Adapter la structure de données pour gérer plusieurs profils
- [x] Maintenir la compatibilité avec le format CSV existant

### 3. 🎨 **Modification de l'interface utilisateur**

- [x] Ajouter un mode switcher dans `popup.html` (Profils / CSV Upload)
- [x] Créer une liste déroulante pour la sélection de profils
- [x] Afficher les profils disponibles avec nom + quelques détails
- [x] Masquer/afficher les sections selon le mode sélectionné
- [x] Adapter le styling pour les nouveaux éléments

### 4. ⚡ **Logique de gestion des modes**

- [ ] Implémenter `loadProfilesDatabase()` dans `popup.js`
- [ ] Créer `selectProfile(profileId)` pour charger un profil spécifique
- [ ] Modifier `fillForm()` pour utiliser le profil sélectionné
- [ ] Ajouter la gestion d'état entre les deux modes
- [ ] Sauvegarder le mode préféré de l'utilisateur

### 5. 🔍 **Interface de sélection des profils**

#### Interface proposée :

```
┌─────────────────────────────────┐
│ Mode: [Profils ▼] [CSV Upload]  │
├─────────────────────────────────┤
│ Sélectionner un profil:         │
│ ┌─────────────────────────────┐ │
│ │ [1] Jean DUPONT - Étudiant  │ │
│ │ [2] Marie MARTIN - Pro      │ │
│ │ [3] Ahmed HASSAN - Senior   │ │
│ └─────────────────────────────┘ │
│ [Remplir le formulaire]         │
└─────────────────────────────────┘
```

### 6. 🛠️ **Modifications techniques spécifiques**

#### Dans `popup.html` :

- [ ] Ajouter un toggle/switch pour choisir le mode
- [ ] Créer un `<select>` ou liste pour les profils
- [ ] Réorganiser le layout pour deux sections distinctes

#### Dans `popup.js` :

- [ ] Nouvelle fonction `initializeProfilesMode()`
- [ ] Modification de `initialize()` pour détecter le mode par défaut
- [ ] Ajout de `handleProfileSelection(profileId)`
- [ ] Adaptation de `currentUserData` pour les profils

#### Dans `content.js` :

- [ ] Aucune modification majeure nécessaire (réutilise le système existant)
- [ ] Peut-être ajout de logs pour identifier la source des données

### 7. 📁 **Fichier de données exemple**

Créer `data/profiles.csv` avec structure :

```csv
id,lastName,firstName,fullName,gender,email,phone,birthDate,...
1,DUPONT,Jean,"Jean DUPONT",Masculin,jean.dupont@email.com,0123456789,1990-01-15,...
2,MARTIN,Marie,"Marie MARTIN",Féminin,marie.martin@email.com,0234567890,1985-05-20,...
3,HASSAN,Ahmed,"Ahmed HASSAN",Masculin,ahmed.hassan@email.com,0345678901,1992-12-10,...
```

### 8. 🔧 **Gestion d'état et persistance**

- [ ] Sauvegarder le profil sélectionné dans `chrome.storage.local`
- [ ] Sauvegarder le mode préféré (Profils vs CSV)
- [ ] Restaurer l'état au prochain lancement de la popup
- [ ] Gérer les cas d'erreur (profil inexistant, etc.)

### 9. ✅ **Tests et validation**

- [ ] Tester le passage entre les deux modes
- [ ] Valider que tous les profils se chargent correctement
- [ ] Vérifier que le CSV upload fonctionne toujours
- [ ] Tester sur différents types de formulaires Google
- [ ] Validation des statistiques de remplissage

### 10. 📚 **Documentation**

- [ ] Mettre à jour `README.md` avec les nouvelles fonctionnalités
- [ ] Créer des captures d'écran de la nouvelle interface
- [ ] Documenter le format du fichier `profiles.csv`
- [ ] Ajouter des exemples d'utilisation des deux modes

## 🎯 **Priorité des tâches**

### Phase 1 (Essential) : ✅ **TERMINÉE**

1. ✅ Création du fichier `data/profiles.csv`
2. ✅ Modification de l'interface pour le mode switcher
3. ✅ Implémentation de la sélection de profils

### Phase 2 (Fonctionnel) : 🔄 **EN COURS**

4. ✅ Logique de chargement des profils
5. ✅ Intégration avec le système de remplissage existant
6. [ ] Tests basiques

### Phase 3 (Polish) :

7. [ ] Persistance de l'état
8. [ ] Interface utilisateur améliorée
9. [ ] Documentation complète

## 📝 **Notes techniques**

- L'architecture actuelle est parfaitement adaptée pour cette évolution
- Le système de `currentUserData` peut être réutilisé tel quel
- Les classes `FormAutoFiller`, `FieldMatcher`, etc. n'ont pas besoin de modifications
- La compatibilité descendante sera maintenue pour les utilisateurs actuels

## ⏱️ **Estimation**

- **Phase 1** : 2-3 heures
- **Phase 2** : 3-4 heures
- **Phase 3** : 2-3 heures
- **Total** : 7-10 heures de développement

Cette fonctionnalité transformera l'extension en un outil encore plus pratique et accessible ! 🚀
