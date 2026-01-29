"""
CareerPath AI - Agent Orchestrator Lambda Function
Coordinates the full RAG pipeline and generates personalized career roadmaps
Uses Amazon Nova Pro v1 for intelligent planning with explainability
"""

import json
import os
import boto3
from datetime import datetime
from typing import Any, Dict, List

# Initialize clients
bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
bedrock_agent_runtime = boto3.client('bedrock-agent-runtime', region_name='us-east-1')
lambda_client = boto3.client('lambda', region_name='us-east-1')

# Configuration
GENERATION_MODEL_ID = os.environ.get('GENERATION_MODEL_ID', 'amazon.nova-pro-v1:0')
KNOWLEDGE_BASE_ID = os.environ.get('KNOWLEDGE_BASE_ID', 'PLACEHOLDER_KB_ID')

# Intent Analysis Prompt
INTENT_ANALYSIS_PROMPT = """Analyze the user's message and determine their intent.

User Message: {user_message}

User Profile Summary:
{profile_summary}

Classify the intent into one of these categories:
1. CAREER_ADVICE - User wants career guidance or recommendations
2. SKILL_GAP - User wants to understand what skills they need
3. JOB_SEARCH - User is looking for job recommendations
4. LEARNING_PATH - User wants learning resources or courses
5. ROADMAP - User wants a step-by-step career plan
6. GENERAL_CHAT - General conversation or clarification

Return a JSON object:
{{
    "intent": "INTENT_CATEGORY",
    "confidence": 0.0-1.0,
    "key_topics": ["topic1", "topic2"],
    "requires_retrieval": true/false,
    "retrieval_query": "optimized query for knowledge base if needed"
}}

Return ONLY valid JSON."""

# Career Roadmap Planner Prompt
CAREER_PLANNER_PROMPT = """You are an expert career mentor AI. Based on the user's profile and the retrieved context, create a comprehensive, personalized career roadmap.

## User Profile
{user_profile}

## User's Question/Goal
{user_query}

## Retrieved Context
{retrieved_context}

## Instructions
Create a detailed career roadmap that includes:

1. **Current Position Analysis**
   - Summarize the user's current skills and experience
   - Identify their career level and domain

2. **Career Goal Recommendations**
   - Suggest 2-3 realistic career paths based on their profile
   - Rank them by alignment with their existing skills

3. **Skill Gap Analysis**
   - List skills they have that are valuable
   - Identify critical skills they're missing
   - Prioritize skills by importance and ease of acquisition

4. **Week-by-Week Roadmap** (12 weeks)
   - Provide specific, actionable steps
   - Include estimated time commitment
   - Suggest specific resources from the retrieved context

5. **Recommended Resources**
   - Courses and certifications (with links if available)
   - Projects to build
   - Communities to join

6. **Explainability Trace**
   - Quote specific passages from the retrieved context that informed your recommendations
   - Explain your reasoning for each major recommendation

Return a well-structured JSON object:
{{
    "current_analysis": {{
        "strengths": [],
        "experience_level": "",
        "primary_domain": ""
    }},
    "career_paths": [
        {{
            "title": "",
            "description": "",
            "alignment_score": 0.0-1.0,
            "timeline_months": 0,
            "reasoning": ""
        }}
    ],
    "skill_gaps": {{
        "existing_valuable": [],
        "missing_critical": [],
        "nice_to_have": []
    }},
    "roadmap": [
        {{
            "week": 1,
            "focus": "",
            "tasks": [],
            "resources": [],
            "time_hours": 0
        }}
    ],
    "resources": {{
        "courses": [],
        "certifications": [],
        "projects": [],
        "communities": []
    }},
    "explainability": {{
        "source_quotes": [
            {{
                "text": "",
                "source": "",
                "relevance": ""
            }}
        ],
        "reasoning_steps": []
    }},
    "confidence_score": 0.0-1.0,
    "limitations": ""
}}

Be specific, actionable, and always cite your sources."""

# Conversational Response Prompt
CONVERSATIONAL_PROMPT = """You are CareerPath AI, a friendly and knowledgeable career mentor. 
Respond to the user's question in a conversational but informative manner.

User Profile Summary:
{profile_summary}

User's Question:
{user_query}

Relevant Context:
{retrieved_context}

Previous Conversation:
{conversation_history}

Instructions:
- Be encouraging and supportive
- Provide specific, actionable advice
- Reference the user's actual skills and experience
- If recommending resources, cite sources
- Keep responses concise but comprehensive
- Use bullet points for lists
- End with a follow-up question or call-to-action

Respond naturally as a career mentor would."""


def invoke_bedrock_model(prompt: str, max_tokens: int = 4096) -> str:
    """Invoke Amazon Nova Pro model."""
    try:
        request_body = {
            "messages": [
                {
                    "role": "user",
                    "content": [{"text": prompt}]
                }
            ],
            "inferenceConfig": {
                "maxTokens": max_tokens,
                "temperature": 0.7,
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
        output_text = response_body.get('output', {}).get('message', {}).get('content', [{}])[0].get('text', '')
        
        return output_text
        
    except Exception as e:
        print(f"Bedrock invocation error: {e}")
        raise


def retrieve_context(query: str, top_k: int = 10) -> List[Dict]:
    """Retrieve relevant context from Knowledge Base."""
    try:
        response = bedrock_agent_runtime.retrieve(
            knowledgeBaseId=KNOWLEDGE_BASE_ID,
            retrievalQuery={'text': query},
            retrievalConfiguration={
                'vectorSearchConfiguration': {
                    'numberOfResults': top_k,
                    'overrideSearchType': 'HYBRID'
                }
            }
        )
        
        results = []
        for item in response.get('retrievalResults', []):
            results.append({
                'content': item.get('content', {}).get('text', ''),
                'score': item.get('score', 0),
                'source': item.get('location', {}).get('s3Location', {}).get('uri', 'Unknown')
            })
        return results
        
    except Exception as e:
        print(f"Retrieval error: {e}")
        return []


def analyze_intent(user_message: str, profile_summary: str) -> Dict:
    """Analyze user intent using LLM."""
    prompt = INTENT_ANALYSIS_PROMPT.format(
        user_message=user_message,
        profile_summary=profile_summary
    )
    
    response = invoke_bedrock_model(prompt, max_tokens=512)
    
    try:
        # Extract JSON from response
        import re
        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            return json.loads(json_match.group())
    except:
        pass
    
    return {
        'intent': 'GENERAL_CHAT',
        'confidence': 0.5,
        'requires_retrieval': True,
        'retrieval_query': user_message
    }


def generate_career_roadmap(user_profile: Dict, user_query: str, retrieved_context: List[Dict]) -> Dict:
    """Generate a comprehensive career roadmap."""
    # Format retrieved context
    context_text = "\n\n".join([
        f"[Source: {ctx.get('source', 'Unknown')}]\n{ctx.get('content', '')}"
        for ctx in retrieved_context[:5]
    ])
    
    prompt = CAREER_PLANNER_PROMPT.format(
        user_profile=json.dumps(user_profile, indent=2),
        user_query=user_query,
        retrieved_context=context_text if context_text else "No specific context retrieved."
    )
    
    response = invoke_bedrock_model(prompt, max_tokens=4096)
    
    try:
        import re
        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            return json.loads(json_match.group())
    except:
        pass
    
    return {
        'response': response,
        'type': 'text'
    }


def generate_conversational_response(
    user_profile: Dict,
    user_query: str,
    retrieved_context: List[Dict],
    conversation_history: List[Dict] = None
) -> str:
    """Generate a conversational response."""
    # Format profile summary
    profile_summary = f"""
    Career Level: {user_profile.get('career_level', 'Not specified')}
    Domain: {user_profile.get('primary_domain', 'Not specified')}
    Experience: {user_profile.get('total_experience_years', 'N/A')} years
    Key Skills: {', '.join(user_profile.get('skills', {}).get('technical', [])[:10])}
    """
    
    # Format context
    context_text = "\n".join([
        f"- {ctx.get('content', '')[:500]}..."
        for ctx in retrieved_context[:3]
    ])
    
    # Format history
    history_text = ""
    if conversation_history:
        history_text = "\n".join([
            f"{msg.get('role', 'user')}: {msg.get('content', '')}"
            for msg in conversation_history[-5:]
        ])
    
    prompt = CONVERSATIONAL_PROMPT.format(
        profile_summary=profile_summary,
        user_query=user_query,
        retrieved_context=context_text if context_text else "No specific context available.",
        conversation_history=history_text if history_text else "No previous messages."
    )
    
    return invoke_bedrock_model(prompt, max_tokens=2048)


def lambda_handler(event: dict, context: Any) -> dict:
    """Lambda handler for agent orchestration."""
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
        
        user_message = body.get('message', '')
        user_profile = body.get('user_profile', {})
        conversation_history = body.get('conversation_history', [])
        request_type = body.get('type', 'chat')  # chat, roadmap, skills
        
        if not user_message:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Missing message'})
            }
        
        # Step 1: Analyze intent
        profile_summary = json.dumps(user_profile) if user_profile else "No profile provided"
        intent_analysis = analyze_intent(user_message, profile_summary)
        
        # Step 2: Retrieve context if needed
        retrieved_context = []
        if intent_analysis.get('requires_retrieval', True):
            retrieval_query = intent_analysis.get('retrieval_query', user_message)
            retrieved_context = retrieve_context(retrieval_query)
        
        # Step 3: Generate response based on intent
        if request_type == 'roadmap' or intent_analysis.get('intent') == 'ROADMAP':
            # Generate comprehensive roadmap
            roadmap = generate_career_roadmap(user_profile, user_message, retrieved_context)
            response_content = roadmap
            response_type = 'roadmap'
        else:
            # Generate conversational response
            response_text = generate_conversational_response(
                user_profile,
                user_message,
                retrieved_context,
                conversation_history
            )
            response_content = response_text
            response_type = 'text'
        
        # Build response with full context
        result = {
            'response': response_content,
            'type': response_type,
            'intent': intent_analysis,
            'sources': [
                {'content': ctx.get('content', '')[:200], 'source': ctx.get('source', '')}
                for ctx in retrieved_context[:3]
            ],
            'metadata': {
                'model': GENERATION_MODEL_ID,
                'knowledge_base': KNOWLEDGE_BASE_ID,
                'timestamp': datetime.now().isoformat()
            }
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
                'message': 'Agent orchestration failed'
            })
        }
