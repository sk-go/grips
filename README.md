# GRIPS Assistant

Ein KI-gestützter Assistent für die Analyse von Audio-Aufzeichnungen und Dokumenten.

## Struktur

- **backend/**: Python-basierte Cloud Functions und API
  - **functions/**: Google Cloud Functions
    - **audio_processor/**: Verarbeitung von Audio-Dateien
    - **pw_client/**: Client für Professional Works Integration
    - **nlp_engine/**: NLP-Verarbeitung mit OpenAI
  - **api/**: Haupt-API Gateway
- **frontend/**: Next.js Web-Anwendung
- **infrastructure/**: Terraform-Konfiguration und Deployment-Skripte

## Setup

1. `.env` Datei erstellen mit erforderlichen Umgebungsvariablen
2. `setup.ps1` ausführen für initiales Setup
3. `setup-secrets.ps1` ausführen für API-Schlüssel Konfiguration
4. `deploy.ps1` für Deployment

## Anforderungen

- Google Cloud Platform Account
- Node.js und npm
- Python 3.9+
- Terraform 
