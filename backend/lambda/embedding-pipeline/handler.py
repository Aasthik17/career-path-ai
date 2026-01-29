"""
CareerPath AI - Embedding Pipeline Lambda Function
Creates embeddings using Amazon Titan Embed v2 for user profiles
"""

import json
import os
import boto3
from datetime import datetime
from typing import Any, List

# Initialize clients
bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
s3_client = boto3.client('s3')

# Configuration
EMBEDDING_MODEL_ID = os.environ.get('EMBEDDING_MODEL_ID', 'amazon.titan-embed-text-v2:0')
SOURCE_DATA_BUCKET = os.environ.get('SOURCE_DATA_BUCKET', 'careerpath-sourcedata')


def create_embedding(text: str) -> List[float]:
    """Create embedding using Amazon Titan Embed Text v2."""
    try:
        request_body = {
            "inputText": text[:8000],  # Titan v2 limit
            "dimensions": 1024,  # Optimal for semantic search
            "normalize": True
        }
        
        response = bedrock_runtime.invoke_model(
            modelId=EMBEDDING_MODEL_ID,
            contentType='application/json',
            accept='application/json',
            body=json.dumps(request_body)
        )
        
        response_body = json.loads(response['body'].read())
        embedding = response_body.get('embedding', [])
        
        return embedding
        
    except Exception as e:
        print(f"Embedding creation error: {e}")
        raise


def create_profile_text(parsed_resume: dict) -> str:
    """Create a searchable text representation of the user profile."""
    parts = []
    
    # Add summary
    if parsed_resume.get('summary'):
        parts.append(f"Summary: {parsed_resume['summary']}")
    
    # Add skills
    skills = parsed_resume.get('skills', {})
    all_skills = []
    for category, skill_list in skills.items():
        if isinstance(skill_list, list):
            all_skills.extend(skill_list)
    if all_skills:
        parts.append(f"Skills: {', '.join(all_skills)}")
    
    # Add experience
    experience = parsed_resume.get('experience', [])
    for exp in experience[:3]:  # Top 3 experiences
        exp_text = f"{exp.get('title', '')} at {exp.get('company', '')}"
        if exp.get('responsibilities'):
            exp_text += f": {'; '.join(exp['responsibilities'][:3])}"
        parts.append(exp_text)
    
    # Add certifications
    certs = parsed_resume.get('certifications', [])
    cert_names = [c.get('name', '') for c in certs if c.get('name')]
    if cert_names:
        parts.append(f"Certifications: {', '.join(cert_names)}")
    
    # Add career level and domain
    if parsed_resume.get('career_level'):
        parts.append(f"Career Level: {parsed_resume['career_level']}")
    if parsed_resume.get('primary_domain'):
        parts.append(f"Domain: {parsed_resume['primary_domain']}")
    
    return '\n'.join(parts)


def store_embedding(user_id: str, profile_text: str, embedding: List[float], metadata: dict) -> dict:
    """Store embedding and profile data in S3 for later retrieval."""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    key = f"profiles/{user_id}/{timestamp}_profile.json"
    
    data = {
        'user_id': user_id,
        'created_at': datetime.now().isoformat(),
        'profile_text': profile_text,
        'embedding': embedding,
        'metadata': metadata
    }
    
    s3_client.put_object(
        Bucket=SOURCE_DATA_BUCKET,
        Key=key,
        Body=json.dumps(data),
        ContentType='application/json'
    )
    
    return {'key': key, 'bucket': SOURCE_DATA_BUCKET}


def lambda_handler(event: dict, context: Any) -> dict:
    """Lambda handler for embedding pipeline."""
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
        
        # Get parsed resume data
        parsed_resume = body.get('parsed_resume', {})
        user_id = body.get('user_id', 'anonymous')
        
        if not parsed_resume:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Missing parsed_resume in request body'
                })
            }
        
        # Create profile text for embedding
        profile_text = create_profile_text(parsed_resume)
        
        # Create embedding
        embedding = create_embedding(profile_text)
        
        # Store embedding
        storage_info = store_embedding(
            user_id=user_id,
            profile_text=profile_text,
            embedding=embedding,
            metadata={
                'career_level': parsed_resume.get('career_level'),
                'primary_domain': parsed_resume.get('primary_domain'),
                'total_experience_years': parsed_resume.get('total_experience_years')
            }
        )
        
        result = {
            'user_id': user_id,
            'embedding_created': True,
            'embedding_dimensions': len(embedding),
            'profile_text_length': len(profile_text),
            'storage': storage_info,
            'created_at': datetime.now().isoformat()
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
                'message': 'Failed to create embedding'
            })
        }
