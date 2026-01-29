"""
CareerPath AI - Resume Parser Lambda Function
Extracts skills, roles, experience, and certifications from uploaded resumes
Uses Amazon Nova Pro v1 for intelligent parsing
"""

import json
import os
import boto3
import base64
import re
from datetime import datetime
from typing import Any

# Initialize clients
s3_client = boto3.client('s3')
bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')

# Configuration
RESUME_BUCKET = os.environ.get('RESUME_BUCKET', 'careerpath-resumes')
GENERATION_MODEL_ID = os.environ.get('GENERATION_MODEL_ID', 'amazon.nova-pro-v1:0')

# Resume parsing prompt
RESUME_PARSER_PROMPT = """You are an expert resume analyzer. Extract the following structured information from the resume text provided.

<resume>
{resume_text}
</resume>

Extract and return a JSON object with the following structure:
{{
    "personal_info": {{
        "name": "Full name",
        "email": "Email address if present",
        "phone": "Phone number if present",
        "location": "City/State/Country if present",
        "linkedin": "LinkedIn URL if present"
    }},
    "summary": "Professional summary or objective statement",
    "skills": {{
        "technical": ["List of technical skills"],
        "soft": ["List of soft skills"],
        "tools": ["List of tools/software"],
        "languages": ["Programming or spoken languages"]
    }},
    "experience": [
        {{
            "title": "Job title",
            "company": "Company name",
            "location": "Location",
            "start_date": "Start date",
            "end_date": "End date or 'Present'",
            "duration_months": estimated duration in months,
            "responsibilities": ["Key responsibilities"],
            "achievements": ["Key achievements with metrics if available"]
        }}
    ],
    "education": [
        {{
            "degree": "Degree name",
            "field": "Field of study",
            "institution": "School/University name",
            "graduation_year": "Year of graduation",
            "gpa": "GPA if mentioned"
        }}
    ],
    "certifications": [
        {{
            "name": "Certification name",
            "issuer": "Issuing organization",
            "date": "Date obtained",
            "expiry": "Expiration date if applicable"
        }}
    ],
    "projects": [
        {{
            "name": "Project name",
            "description": "Brief description",
            "technologies": ["Technologies used"],
            "url": "Project URL if available"
        }}
    ],
    "total_experience_years": estimated total years of professional experience,
    "career_level": "Entry/Mid/Senior/Lead/Executive",
    "primary_domain": "Primary career domain/industry"
}}

Important:
- Be thorough and extract ALL relevant information
- Estimate durations and experience levels based on available information
- If information is not available, use null
- Return ONLY valid JSON, no additional text
"""


def extract_text_from_pdf(content: bytes) -> str:
    """Extract text from PDF content using basic parsing."""
    try:
        # Try to extract text using PyPDF2 if available
        try:
            import PyPDF2
            from io import BytesIO
            
            pdf_reader = PyPDF2.PdfReader(BytesIO(content))
            text_parts = []
            for page in pdf_reader.pages:
                text_parts.append(page.extract_text())
            return '\n'.join(text_parts)
        except ImportError:
            # Fallback: basic text extraction for simple PDFs
            text = content.decode('utf-8', errors='ignore')
            # Remove binary garbage
            text = re.sub(r'[^\x20-\x7E\n\r\t]', ' ', text)
            return text
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return content.decode('utf-8', errors='ignore')


def extract_text_from_docx(content: bytes) -> str:
    """Extract text from DOCX content."""
    try:
        from docx import Document
        from io import BytesIO
        
        doc = Document(BytesIO(content))
        text_parts = []
        for para in doc.paragraphs:
            text_parts.append(para.text)
        return '\n'.join(text_parts)
    except Exception as e:
        print(f"DOCX extraction error: {e}")
        return content.decode('utf-8', errors='ignore')


def invoke_bedrock_model(prompt: str) -> dict:
    """Invoke Amazon Nova Pro model for resume parsing."""
    try:
        request_body = {
            "messages": [
                {
                    "role": "user",
                    "content": [{"text": prompt}]
                }
            ],
            "inferenceConfig": {
                "maxTokens": 4096,
                "temperature": 0.1,
                "topP": 0.9
            }
        }
        
        response = bedrock_runtime.invoke_model(
            modelId=GENERATION_MODEL_ID,
            contentType='application/json',
            accept='application/json',
            body=json.dumps(request_body)
        )
        
        response_body = json.loads(response['body'].read())
        
        # Extract text from Nova response format
        output_text = response_body.get('output', {}).get('message', {}).get('content', [{}])[0].get('text', '{}')
        
        # Parse JSON from response
        # Find JSON object in response
        json_match = re.search(r'\{[\s\S]*\}', output_text)
        if json_match:
            return json.loads(json_match.group())
        return json.loads(output_text)
        
    except Exception as e:
        print(f"Bedrock invocation error: {e}")
        raise


def generate_presigned_url(user_id: str, filename: str) -> dict:
    """Generate a presigned URL for resume upload."""
    key = f"uploads/{user_id}/{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
    
    presigned_url = s3_client.generate_presigned_url(
        'put_object',
        Params={
            'Bucket': RESUME_BUCKET,
            'Key': key,
            'ContentType': 'application/octet-stream'
        },
        ExpiresIn=3600
    )
    
    return {
        'upload_url': presigned_url,
        'key': key,
        'expires_in': 3600
    }


def parse_resume(resume_text: str) -> dict:
    """Parse resume text using Bedrock model."""
    prompt = RESUME_PARSER_PROMPT.format(resume_text=resume_text)
    parsed_data = invoke_bedrock_model(prompt)
    return parsed_data


def lambda_handler(event: dict, context: Any) -> dict:
    """Lambda handler for resume parsing."""
    print(f"Event received: {json.dumps(event)}")
    
    try:
        # Handle preflight requests
        if event.get('httpMethod') == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
                },
                'body': ''
            }
        
        # Handle GET request for presigned URL
        if event.get('httpMethod') == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            user_id = params.get('user_id', 'anonymous')
            filename = params.get('filename', 'resume.pdf')
            
            url_data = generate_presigned_url(user_id, filename)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(url_data)
            }
        
        # Handle POST request for resume parsing
        body = json.loads(event.get('body', '{}'))
        
        # Check if resume content is provided directly
        if 'resume_text' in body:
            resume_text = body['resume_text']
        elif 's3_key' in body:
            # Fetch from S3
            s3_key = body['s3_key']
            s3_response = s3_client.get_object(Bucket=RESUME_BUCKET, Key=s3_key)
            content = s3_response['Body'].read()
            
            # Determine file type and extract text
            if s3_key.lower().endswith('.pdf'):
                resume_text = extract_text_from_pdf(content)
            elif s3_key.lower().endswith('.docx'):
                resume_text = extract_text_from_docx(content)
            else:
                resume_text = content.decode('utf-8', errors='ignore')
        elif 'resume_base64' in body:
            # Decode base64 content
            content = base64.b64decode(body['resume_base64'])
            file_type = body.get('file_type', 'pdf')
            
            if file_type == 'pdf':
                resume_text = extract_text_from_pdf(content)
            elif file_type == 'docx':
                resume_text = extract_text_from_docx(content)
            else:
                resume_text = content.decode('utf-8', errors='ignore')
        else:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Missing resume content. Provide resume_text, s3_key, or resume_base64'
                })
            }
        
        # Parse the resume
        parsed_resume = parse_resume(resume_text)
        
        # Add metadata
        result = {
            'parsed_at': datetime.now().isoformat(),
            'resume_data': parsed_resume,
            'raw_text_length': len(resume_text)
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
                'message': 'Failed to parse resume'
            })
        }
