#!/bin/bash
# Script de déploiement FillEngine Cloud Storage

set -e

BUCKET_NAME=""
PROFILES_FILE="profiles.csv"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Vérifier gsutil
check_prerequisites() {
    if ! command -v gsutil &> /dev/null; then
        log_error "gsutil non installé"
        exit 1
    fi
    log_info "Prérequis OK"
}

# Créer et configurer bucket
setup_bucket() {
    log_info "Configuration bucket $BUCKET_NAME..."
    
    # Créer bucket
    gsutil mb "gs://$BUCKET_NAME" 2>/dev/null || true
    
    # Permissions publiques
    gsutil iam ch allUsers:objectViewer "gs://$BUCKET_NAME"
    
    log_info "Bucket configuré"
}

# Upload fichier
upload_profiles() {
    if [ ! -f "$PROFILES_FILE" ]; then
        log_error "Fichier $PROFILES_FILE introuvable"
        exit 1
    fi
    
    gsutil -h "Cache-Control:no-cache" cp "$PROFILES_FILE" "gs://$BUCKET_NAME/"
    log_info "Fichier uploadé"
}

# Test déploiement
test_deployment() {
    curl -f -s "https://storage.googleapis.com/$BUCKET_NAME/$PROFILES_FILE" > /dev/null
    log_info "Test réussi"
}

# Usage
if [ -z "$1" ]; then
    echo "Usage: $0 BUCKET_NAME [PROFILES_FILE]"
    exit 1
fi

BUCKET_NAME="$1"
[ -n "$2" ] && PROFILES_FILE="$2"

# Exécution
log_info "Déploiement sur $BUCKET_NAME"
check_prerequisites
setup_bucket  
upload_profiles
test_deployment

echo ""
log_info "URL à utiliser dans popup.js:"
echo "baseUrl: \"https://storage.googleapis.com/$BUCKET_NAME\""
log_info "Déploiement terminé!"