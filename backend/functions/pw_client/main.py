import functions_framework
import requests
from google.cloud import secretmanager, firestore
import os
import json
import re
from datetime import datetime
from utils import (
    get_secret,
    get_project_id,
    handle_processing_error,
    update_document_status
)

class ProfessionalWorksClient:
    def __init__(self):
        # Get secrets
        client = secretmanager.SecretManagerServiceClient()
        project_id = get_project_id()
        
        self.api_token = get_secret(client, project_id, 'pw-api-token')
        self.pw_user = get_secret(client, project_id, 'pw-user-id')
        self.base_url = 'https://api.professional.works/api/v1'
        self.headers = {
            'Authorization': f'Bearer {self.api_token}',
            'Content-Type': 'application/json'
        }
    
    def _make_request(self, method, endpoint, **kwargs):
        """Generic request handler with error handling"""
        url = f'{self.base_url}/{endpoint}'
        try:
            response = requests.request(method, url, headers=self.headers, **kwargs)
            response.raise_for_status()
            return response.json() if response.content else None
        except requests.exceptions.RequestException as e:
            print(f"API request failed: {str(e)}")
            return None

    def create_client_note(self, client_id, title, content, note_type="general"):
        """Create a client note in Professional Works"""
        data = {
            'client_id': client_id,
            'title': title,
            'content': content,
            'type': note_type,
            'created_at': datetime.now().isoformat()
        }
        return self._make_request('POST', f'{self.pw_user}/client-notes', json=data)
    
    def create_activity_log(self, description, entity_type="transcription", entity_id=None):
        """Create an activity log entry"""
        data = {
            'description': description,
            'entity_type': entity_type,
            'entity_id': entity_id,
            'created_at': datetime.now().isoformat()
        }
        return self._make_request('POST', f'{self.pw_user}/activity-log', json=data)
    
    def search_client_by_name(self, name, limit=5):
        """Search for a client by name with pagination"""
        params = {
            'q': name,
            'clients': limit,
            'contracts': 0  # We don't need contracts in the search results
        }
        response = self._make_request('GET', f'{self.pw_user}/search', params=params)
        if response and 'data' in response:
            clients = response['data'].get('clients', [])
            return clients[0] if clients else None
        return None

    def get_client_details(self, client_id):
        """Get detailed client information"""
        return self._make_request('GET', f'{self.pw_user}/clients/{client_id}')

    def get_client_contracts(self, client_id, limit=10):
        """Get client's contracts with pagination"""
        params = {'per_page': limit}
        return self._make_request('GET', f'{self.pw_user}/clients/{client_id}/contracts', params=params)

    def get_insurance_companies(self, name=None, limit=15):
        """Get insurance companies with optional name filter"""
        params = {'per_page': limit}
        if name:
            params['q'] = name
        return self._make_request('GET', 'insurance-companies', params=params)

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
    client_id = action_data.get('client_id')
    upload_id = action_data.get('upload_id')
    analysis = action_data.get('analysis', '')
    
    if not action_data.get('action_required'):
        return {'status': 'no action required'}
    
    try:
        pw_client = ProfessionalWorksClient()
        db = firestore.Client()
        
        # Get the full transcript from Firestore
        transcript_doc = db.collection('transcriptions').document(transcript_id).get()
        if not transcript_doc.exists:
            return handle_processing_error(db, 'Transcript not found')
        
        transcript_data = transcript_doc.to_dict()
        transcript_text = transcript_data.get('text', analysis)
        
        # Extract insurance-specific information
        insurance_info = pw_client.extract_insurance_info(transcript_text)
        insurance_analysis = analyze_transcript_for_insurance(transcript_text)
        
        results = {
            'status': 'success',
            'actions_taken': [],
            'insurance_analysis': insurance_analysis,
            'client_id': client_id
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
        update_document_status(db, 'transcriptions', transcript_id, 'pw_processed', {
            'insurance_info': insurance_info,
            'insurance_analysis': insurance_analysis,
            'pw_results': results
        })
        
        # Update upload document if it exists
        if upload_id:
            update_document_status(db, 'uploads', upload_id, 'pw_processed')
        
        return results
        
    except Exception as e:
        return handle_processing_error(db, e, transcript_id, upload_id)