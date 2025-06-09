terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "europe-west3"
}

# Storage bucket for audio files
resource "google_storage_bucket" "audio_bucket" {
  name          = "${var.project_id}-audio"
  location      = var.region
  force_destroy = true
  
  uniform_bucket_level_access = true
}

# Firestore database
resource "google_firestore_database" "database" {
  project     = var.project_id
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
}

# Pub/Sub topics
resource "google_pubsub_topic" "transcription_complete" {
  name = "transcription-complete"
}

resource "google_pubsub_topic" "pw_actions" {
  name = "pw-actions"
} 