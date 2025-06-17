import base64, json, os, logging
from google.cloud import pubsub_v1
import functions_framework
import google.auth

TOPIC = 'transcription-complete'          # Pub/Sub Topic

@functions_framework.http
def transcription_complete(request):
       # AssemblyAI sends a POST with JSON body; fall back to query params/headers if needed.
       data = request.get_json(silent=True) or {}
       status = data.get("status")
       # Log incoming headers once for debugging
       logging.info("AssemblyAI webhook status=%s headers=%s body_keys=%s", status, dict(request.headers), list(data.keys()))
       attributes = request.headers

       # Ignore intermediate AssemblyAI webhooks; only act on completed transcripts
       if status != "completed":
           logging.info("Ignoring webhook with status %s", status)
           return ("", 204)

       # Robust project ID detection (works in 1st- and 2nd-gen Cloud Functions)
       project = (
           os.environ.get("GCP_PROJECT")
           or os.environ.get("GOOGLE_CLOUD_PROJECT")
           or os.environ.get("GCLOUD_PROJECT")
       )
       if not project:
           # Fallback: derive project from default credentials
           _, project = google.auth.default()
       if not project:
           logging.error("Project ID environment variable not found; cannot publish Pub/Sub message.")
           return ("Project ID not set", 500)

       publisher = pubsub_v1.PublisherClient()
       topic_path = publisher.topic_path(project, TOPIC)

       # Publish transcription-complete payload for downstream functions
       future = publisher.publish(
           topic_path,
           json.dumps(data).encode("utf-8"),
           **{k.lower(): v for k, v in attributes.items()}
       )
       logging.info("Published transcription-complete message %s", future.result())
       return ("", 204)