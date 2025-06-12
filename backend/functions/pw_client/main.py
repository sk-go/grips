import functions_framework
import requests
from google.cloud import secretmanager, firestore
import os
import json
import re
from datetime import datetime

class ProfessionalWorksClient:
    def __init__(self):
        # Get secrets
        client = secretmanager.SecretManagerServiceClient()
        project_id = os.environ.get('GCP_PROJECT')
        
        self.api_token = self._get_secret(client, project_id, 'pw-api-token')
        self.base_url = 'https://api.professional.works/api/v1'
        self.headers = {
            'Authorization': f'Bearer {self.api_token}',
            'Content-Type': 'application/json'
        }
        
    def _get_secret(self, client, project_id, secret_id):
        name = f"projects/{project_id}/secrets/{secret_id}/versions/latest"
        response = client.access_secret_version(request={"name": name})
        return response.payload.data.decode("UTF-8")
    
    def create_client_note(self, client_id, title, content, note_type="general"):
        """Create a client note in Professional Works"""
        data = {
            'client_id': client_id,
            'title': title,
            'content': content,
            'type': note_type,
            'created_at': datetime.now().isoformat()
        }
        
        response = requests.post(
            f'{self.base_url}/client-notes',
            headers=self.headers,
            json=data
        )
        
        return response.json() if response.status_code < 400 else None
    
    def create_activity_log(self, description, entity_type="transcription", entity_id=None):
        """Create an activity log entry"""
        data = {
            'description': description,
            'entity_type': entity_type,
            'entity_id': entity_id,
            'created_at': datetime.now().isoformat()
        }
        
        response = requests.post(
            f'{self.base_url}/activity-log',
            headers=self.headers,
            json=data
        )
        
        return response.json() if response.status_code < 400 else None
    
    def search_client_by_name(self, name):
        """Search for a client by name"""
        params = {'search': name, 'limit': 5}
        
        response = requests.get(
            f'{self.base_url}/clients',
            headers=self.headers,
            params=params
        )
        
        if response.status_code == 200:
            clients = response.json().get('data', [])
            return clients[0] if clients else None
        return None
    
    def extract_insurance_info(self, text):
        """Extract insurance-relevant information from text"""
        info = {
            'client_names': [],
            'policy_numbers': [],
            'damage_mentions': [],
            'contract_mentions': [],
            'dates': []
        }
        
        # Extract potential client names
        name_patterns = r'(?:Herr|Frau|Hr\.|Fr\.)\s+([A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)*)'
        info['client_names'] = re.findall(name_patterns, text, re.IGNORECASE)
        
        # Extract policy numbers
        policy_patterns = r'(?:Police|Vertrag|Versicherung)(?:snummer|s-nr|nr)?\.?\s*:?\s*([A-Z0-9-]{6,20})'
        info['policy_numbers'] = re.findall(policy_patterns, text, re.IGNORECASE)
        
        # Extract damage mentions
        damage_keywords = ['schaden', 'unfall', 'beschädigung', 'defekt', 'reparatur']
        for keyword in damage_keywords:
            if keyword in text.lower():
                sentences = text.split('.')
                for sentence in sentences:
                    if keyword in sentence.lower():
                        info['damage_mentions'].append(sentence.strip())
        
        # Extract contract mentions
        contract_keywords = ['vertrag', 'police', 'versicherung', 'tarif']
        for keyword in contract_keywords:
            if keyword in text.lower():
                sentences = text.split('.')
                for sentence in sentences:
                    if keyword in sentence.lower():
                        info['contract_mentions'].append(sentence.strip())
        
        # Extract dates
        date_patterns = r'\b(\d{1,2}[./]\d{1,2}[./]\d{4})\b'
        info['dates'] = re.findall(date_patterns, text)
        
        return info

def analyze_transcript_for_insurance(transcript_text):
    """Analyze transcript for insurance-specific content"""
    analysis_result = {
        'has_damage_claim': False,
        'has_client_interaction': False,
        'has_contract_discussion': False,
        'priority': 'low',
        'action_items': []
    }
    
    text_lower = transcript_text.lower()
    
    # Check for damage claims
    damage_indicators = ['schaden', 'unfall', 'beschädigung', 'wasserschaden', 'sturmschaden']
    if any(indicator in text_lower for indicator in damage_indicators):
        analysis_result['has_damage_claim'] = True
        analysis_result['priority'] = 'high'
        analysis_result['action_items'].append('Schadensmeldung prüfen und bearbeiten')
    
    # Check for client interactions
    client_indicators = ['kunde', 'versicherungsnehmer', 'antragsteller', 'herr', 'frau']
    if any(indicator in text_lower for indicator in client_indicators):
        analysis_result['has_client_interaction'] = True
    
    # Check for contract discussions
    contract_indicators = ['vertrag', 'police', 'tarif', 'prämie', 'beitrag']
    if any(indicator in text_lower for indicator in contract_indicators):
        analysis_result['has_contract_discussion'] = True
        analysis_result['action_items'].append('Vertragsinformationen aktualisieren')
    
    # Check for urgent keywords
    urgent_indicators = ['dringend', 'sofort', 'eilig', 'notfall']
    if any(indicator in text_lower for indicator in urgent_indicators):
        analysis_result['priority'] = 'urgent'
    
    return analysis_result

@functions_framework.cloud_event
def handle_pw_action(cloud_event):
    """Handle actions that need to be sent to Professional Works"""
    
    message_data = cloud_event.data
    action_data = json.loads(message_data)
    
    transcript_id = action_data.get('transcript_id')
    analysis = action_data.get('analysis', '')
    
    if not action_data.get('action_required'):
        return {'status': 'no action required'}
    
    try:
        pw_client = ProfessionalWorksClient()
        db = firestore.Client()
        
        # Get the full transcript from Firestore
        transcript_doc = db.collection('transcriptions').document(transcript_id).get()
        if not transcript_doc.exists:
            return {'status': 'error', 'message': 'Transcript not found'}
        
        transcript_data = transcript_doc.to_dict()
        transcript_text = transcript_data.get('text', analysis)
        
        # Extract insurance-specific information
        insurance_info = pw_client.extract_insurance_info(transcript_text)
        insurance_analysis = analyze_transcript_for_insurance(transcript_text)
        
        results = {
            'status': 'success',
            'actions_taken': [],
            'insurance_analysis': insurance_analysis
        }
        
        # Create activity log entry
        activity_description = f"Audio transcript analyzed: {transcript_id}"
        if insurance_analysis['priority'] == 'urgent':
            activity_description += " [URGENT]"
        
        activity_response = pw_client.create_activity_log(
            description=activity_description,
            entity_type="transcription",
            entity_id=transcript_id
        )
        
        if activity_response:
            results['actions_taken'].append('activity_log_created')
        
        # If we found client names, try to link to existing clients
        if insurance_info['client_names']:
            for client_name in insurance_info['client_names'][:2]:
                client = pw_client.search_client_by_name(client_name)
                if client:
                    # Create client note
                    note_title = f"Transkription vom {datetime.now().strftime('%d.%m.%Y')}"
                    note_content = f"Automatisch erstellt aus Audio-Transkription {transcript_id}\n\n"
                    note_content += f"Analyse: {analysis}\n\n"
                    
                    if insurance_info['policy_numbers']:
                        note_content += f"Erwähnte Policen: {', '.join(insurance_info['policy_numbers'])}\n"
                    
                    if insurance_info['damage_mentions']:
                        note_content += f"Schadensbezug: {insurance_info['damage_mentions'][0]}\n"
                    
                    note_type = "damage" if insurance_analysis['has_damage_claim'] else "general"
                    
                    note_response = pw_client.create_client_note(
                        client_id=client['id'],
                        title=note_title,
                        content=note_content,
                        note_type=note_type
                    )
                    
                    if note_response:
                        results['actions_taken'].append(f'client_note_created_for_{client_name}')
                        results['client_id'] = client['id']
                        results['note_id'] = note_response.get('id')
                    
                    break
        
        # Store the enhanced analysis back to Firestore
        transcript_doc.reference.update({
            'insurance_info': insurance_info,
            'insurance_analysis': insurance_analysis,
            'pw_processed': True,
            'pw_results': results
        })
        
        return results
        
    except Exception as e:
        print(f"Error handling Professional Works action: {e}")
        return {'status': 'error', 'message': str(e)}