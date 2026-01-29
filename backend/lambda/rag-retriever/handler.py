"""
CareerPath AI - RAG Retriever Lambda Function
Retrieves relevant job postings, skills, and learning resources from Bedrock Knowledge Base
"""

import json
import os
import boto3
from datetime import datetime
from typing import Any, List, Dict

# Initialize clients
bedrock_agent_runtime = boto3.client('bedrock-agent-runtime', region_name='us-east-1')
bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')

# Configuration
KNOWLEDGE_BASE_ID = os.environ.get('KNOWLEDGE_BASE_ID', 'PLACEHOLDER_KB_ID')
EMBEDDING_MODEL_ID = os.environ.get('EMBEDDING_MODEL_ID', 'amazon.titan-embed-text-v2:0')

# Retrieval prompt template
RETRIEVAL_QUERY_TEMPLATE = """Given the following user profile, find the most relevant:
1. Job postings that match their skills and experience level
2. Skills they should develop
3. Learning resources and certifications

User Profile:
{profile_summary}

Career Goals: {career_goals}
Current Skills: {current_skills}
Experience Level: {experience_level}
"""


def format_retrieval_query(user_profile: dict, query: str = None) -> str:
    """Format the retrieval query based on user profile."""
    if query:
        return query
    
    # Extract profile details
    skills = user_profile.get('skills', {})
    all_skills = []
    for category, skill_list in skills.items():
        if isinstance(skill_list, list):
            all_skills.extend(skill_list)
    
    return RETRIEVAL_QUERY_TEMPLATE.format(
        profile_summary=user_profile.get('summary', 'Not provided'),
        career_goals=user_profile.get('career_goals', 'Career advancement'),
        current_skills=', '.join(all_skills[:20]),
        experience_level=user_profile.get('career_level', 'Not specified')
    )


def retrieve_from_knowledge_base(query: str, top_k: int = 10) -> List[Dict]:
    """Retrieve relevant documents from Bedrock Knowledge Base."""
    try:
        response = bedrock_agent_runtime.retrieve(
            knowledgeBaseId=KNOWLEDGE_BASE_ID,
            retrievalQuery={
                'text': query
            },
            retrievalConfiguration={
                'vectorSearchConfiguration': {
                    'numberOfResults': top_k,
                    'overrideSearchType': 'HYBRID'  # Combines semantic + keyword search
                }
            }
        )
        
        results = []
        for item in response.get('retrievalResults', []):
            result = {
                'content': item.get('content', {}).get('text', ''),
                'score': item.get('score', 0),
                'metadata': item.get('metadata', {}),
                'location': item.get('location', {})
            }
            
            # Extract source information for explainability
            if 'location' in item:
                location = item['location']
                if 's3Location' in location:
                    result['source_url'] = location['s3Location'].get('uri', '')
                elif 'webLocation' in location:
                    result['source_url'] = location['webLocation'].get('url', '')
            
            results.append(result)
        
        return results
        
    except Exception as e:
        print(f"Knowledge base retrieval error: {e}")
        # Return empty results if KB not configured
        if 'PLACEHOLDER' in KNOWLEDGE_BASE_ID:
            return [{
                'content': 'Knowledge Base not configured. Please set up the Bedrock Knowledge Base.',
                'score': 0,
                'metadata': {'type': 'system'},
                'source_url': ''
            }]
        raise


def categorize_results(results: List[Dict]) -> Dict[str, List[Dict]]:
    """Categorize retrieved results by type."""
    categorized = {
        'job_postings': [],
        'skills': [],
        'learning_resources': [],
        'certifications': [],
        'other': []
    }
    
    for result in results:
        content = result.get('content', '').lower()
        metadata = result.get('metadata', {})
        doc_type = metadata.get('type', '').lower()
        
        # Categorize based on content or metadata
        if doc_type == 'job' or 'job posting' in content or 'position' in content:
            categorized['job_postings'].append(result)
        elif doc_type == 'skill' or 'skill' in content:
            categorized['skills'].append(result)
        elif doc_type == 'course' or 'learning' in content or 'tutorial' in content:
            categorized['learning_resources'].append(result)
        elif doc_type == 'certification' or 'certified' in content:
            categorized['certifications'].append(result)
        else:
            categorized['other'].append(result)
    
    return categorized


def lambda_handler(event: dict, context: Any) -> dict:
    """Lambda handler for RAG retrieval."""
    print(f"Event received: {json.dumps(event)}")
    
    try:
        # Handle preflight
        if event.get('httpMethod') == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                    'Access-Control-Allow-Methods': 'POST,OPTIONS'
                },
                'body': ''
            }
        
        body = json.loads(event.get('body', '{}'))
        
        # Get query or user profile
        query = body.get('query')
        user_profile = body.get('user_profile', {})
        top_k = body.get('top_k', 10)
        
        if not query and not user_profile:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Provide either query or user_profile'
                })
            }
        
        # Format retrieval query
        retrieval_query = format_retrieval_query(user_profile, query)
        
        # Retrieve from knowledge base
        raw_results = retrieve_from_knowledge_base(retrieval_query, top_k)
        
        # Categorize results
        categorized_results = categorize_results(raw_results)
        
        # Prepare response with explainability metadata
        result = {
            'query': retrieval_query,
            'total_results': len(raw_results),
            'results': raw_results,
            'categorized': categorized_results,
            'explainability': {
                'knowledge_base_id': KNOWLEDGE_BASE_ID,
                'retrieval_method': 'HYBRID',
                'top_k': top_k,
                'sources': [r.get('source_url', '') for r in raw_results if r.get('source_url')]
            },
            'retrieved_at': datetime.now().isoformat()
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result)
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': str(e),
                'message': 'Failed to retrieve from knowledge base'
            })
        }
