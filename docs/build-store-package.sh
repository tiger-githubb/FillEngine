#!/bin/bash

# Script de création du package Chrome Store
# Usage: ./build-store-package.sh

echo "🚀 Création du package pour Chrome Web Store..."

# Créer le dossier de build
BUILD_DIR="chrome-store-build"
PACKAGE_NAME="fillengine-v$(grep '"version"' ../manifest.json | cut -d'"' -f4).zip"

# Nettoyer le dossier de build s'il existe
if [ -d "$BUILD_DIR" ]; then
    echo "🧹 Nettoyage du dossier de build existant..."
    rm -rf "$BUILD_DIR"
fi

# Créer le nouveau dossier de build
echo "📁 Création du dossier de build..."
mkdir "$BUILD_DIR"

# Copier les fichiers essentiels
echo "📋 Copie des fichiers essentiels..."
cp ../manifest.json "$BUILD_DIR/"
cp ../background.js "$BUILD_DIR/"
cp ../content.js "$BUILD_DIR/"
cp ../popup.html "$BUILD_DIR/"
cp ../popup.js "$BUILD_DIR/"
cp ../example_data.csv "$BUILD_DIR/"
cp ../README.md "$BUILD_DIR/"
cp PRIVACY_POLICY.md "$BUILD_DIR/"

# Copier le dossier public avec les icônes
echo "🎨 Copie des icônes..."
mkdir -p "$BUILD_DIR/public/icons"
cp ../public/icons/*.png "$BUILD_DIR/public/icons/"

# Copier la base de données des profils par défaut
cp ../data/profiles.csv "$BUILD_DIR/"

# Vérifier que toutes les icônes requises sont présentes
echo "🔍 Vérification des icônes..."
REQUIRED_ICONS=("icon16.png" "icon32.png" "icon48.png" "icon128.png")
ICONS_OK=true

for icon in "${REQUIRED_ICONS[@]}"; do
    if [ -f "$BUILD_DIR/public/icons/$icon" ]; then
        echo "✅ $icon"
    else
        echo "❌ MANQUANT: $icon"
        ICONS_OK=false
    fi
done

if [ "$ICONS_OK" = false ]; then
    echo "❌ Erreur: Des icônes sont manquantes. Arrêt du processus."
    exit 1
fi

# Afficher les fichiers inclus
echo "📦 Fichiers inclus dans le package :"
find "$BUILD_DIR" -type f | sort

# Calculer la taille
TOTAL_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
echo "📏 Taille totale : $TOTAL_SIZE"

# Créer le fichier ZIP
echo "🗜️ Création du fichier ZIP..."
cd "$BUILD_DIR"
zip -r "../$PACKAGE_NAME" ./* -x "*.DS_Store*" "*.git*"
cd ..

# Vérifier le ZIP créé
if [ -f "$PACKAGE_NAME" ]; then
    ZIP_SIZE=$(du -sh "$PACKAGE_NAME" | cut -f1)
    echo "✅ Package créé avec succès : $PACKAGE_NAME ($ZIP_SIZE)"
    echo ""
    echo "📋 Étapes suivantes :"
    echo "1. Allez sur https://chrome.google.com/webstore/devconsole"
    echo "2. Cliquez 'Add new item'"
    echo "3. Uploadez le fichier : $PACKAGE_NAME"
    echo "4. Remplissez les informations marketing"
    echo "5. Soumettez pour révision"
    echo ""
    echo "⚠️ N'oubliez pas :"
    echo "- Politique de confidentialité : $(pwd)/PRIVACY_POLICY.md"
    echo "- Screenshots à créer (1280x800px)"
    echo "- Description marketing à rédiger"
else
    echo "❌ Erreur lors de la création du package"
    exit 1
fi

# Nettoyer le dossier de build
echo "🧹 Nettoyage..."
rm -rf "$BUILD_DIR"

echo "🎉 Processus terminé !"
