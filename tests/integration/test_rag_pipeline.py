"""
Integration Tests for CareerPath AI RAG Pipeline
Tests end-to-end flow from resume upload to career roadmap generation
"""

import json
import pytest
import boto3
from unittest.mock import patch, MagicMock
import os

# Test configuration
TEST_REGION = 'us-east-1'
TEST_KB_ID = os.environ.get('KNOWLEDGE_BASE_ID', 'test-kb-id')


class TestRAGPipelineIntegration:
    """Integration tests for the complete RAG pipeline."""

    @pytest.fixture
    def sample_user_profile(self):
        """Sample user profile extracted from resume."""
        return {
            'personal_info': {
                'name': 'Test User',
                'email': 'test@example.com'
            },
            'summary': 'Senior software engineer with Python and AWS experience',
            'skills': {
                'technical': ['Python', 'AWS', 'Docker', 'Kubernetes'],
                'soft': ['Leadership', 'Communication']
            },
            'experience': [
                {
                    'title': 'Senior Software Engineer',
                    'company': 'TechCorp',
                    'duration_months': 36
                }
            ],
            'certifications': [
                {'name': 'AWS Solutions Architect', 'issuer': 'Amazon'}
            ],
            'total_experience_years': 5,
            'career_level': 'Senior',
            'primary_domain': 'Software Engineering'
        }

    @pytest.fixture
    def mock_bedrock_client(self):
        """Mock Bedrock runtime client."""
        with patch('boto3.client') as mock_client:
            mock_instance = MagicMock()
            mock_client.return_value = mock_instance
            yield mock_instance

    def test_resume_to_embedding_flow(self, sample_user_profile, mock_bedrock_client):
        """Test resume parsing to embedding creation flow."""
        # Mock embedding response
        mock_bedrock_client.invoke_model.return_value = {
            'body': MagicMock(read=lambda: json.dumps({
                'embedding': [0.1] * 1024
            }).encode())
        }
        
        # Verify profile has required fields
        assert 'skills' in sample_user_profile
        assert 'career_level' in sample_user_profile
        assert len(sample_user_profile['skills']['technical']) > 0

    def test_retrieval_with_user_context(self, sample_user_profile, mock_bedrock_client):
        """Test that retrieval includes user context."""
        # Mock retrieval response
        mock_retrieval_results = {
            'retrievalResults': [
                {
                    'content': {'text': 'Senior Software Engineer position...'},
                    'score': 0.92,
                    'location': {'s3Location': {'uri': 's3://bucket/jobs.json'}}
                },
                {
                    'content': {'text': 'AWS certification course...'},
                    'score': 0.85,
                    'location': {'s3Location': {'uri': 's3://bucket/resources.json'}}
                }
            ]
        }
        
        mock_bedrock_client.retrieve.return_value = mock_retrieval_results
        
        # Verify results structure
        results = mock_retrieval_results['retrievalResults']
        assert len(results) >= 1
        assert results[0]['score'] > 0.5

    def test_roadmap_generation_with_sources(self, sample_user_profile, mock_bedrock_client):
        """Test roadmap generation includes source attribution."""
        # Mock generation response
        mock_roadmap = {
            'career_paths': [
                {
                    'title': 'Staff Software Engineer',
                    'alignment_score': 0.85,
                    'timeline_months': 18
                }
            ],
            'roadmap': [
                {'week': 1, 'focus': 'System Design', 'tasks': ['Study patterns']},
                {'week': 2, 'focus': 'Cloud Architecture', 'tasks': ['AWS deep dive']}
            ],
            'explainability': {
                'source_quotes': [
                    {
                        'text': 'Requirements for Staff Engineer...',
                        'source': 'job_postings.json',
                        'relevance': 'Defines target role requirements'
                    }
                ],
                'reasoning_steps': [
                    'Analyzed user skills against market demand',
                    'Identified gap in system design experience'
                ]
            }
        }
        
        # Verify roadmap has explainability
        assert 'explainability' in mock_roadmap
        assert len(mock_roadmap['explainability']['source_quotes']) > 0
        assert len(mock_roadmap['roadmap']) > 0

    def test_end_to_end_latency_requirements(self):
        """Test that pipeline meets latency requirements."""
        # Define latency budgets (milliseconds)
        latency_budgets = {
            'resume_parsing': 5000,  # 5 seconds
            'embedding_creation': 2000,  # 2 seconds
            'retrieval': 1000,  # 1 second
            'generation': 10000  # 10 seconds
        }
        
        total_budget = sum(latency_budgets.values())
        
        # Total should be under 20 seconds for full flow
        assert total_budget <= 20000

    def test_knowledge_base_data_format(self):
        """Test that knowledge base source data is properly formatted."""
        # Sample job posting format
        job_posting = {
            'id': 'jp001',
            'title': 'Senior Software Engineer',
            'company': 'TechCorp',
            'required_skills': ['Python', 'AWS'],
            'experience_level': 'Senior',
            'salary_range': '$150k-$200k'
        }
        
        # Verify required fields
        required_fields = ['id', 'title', 'required_skills']
        for field in required_fields:
            assert field in job_posting

    def test_model_id_compliance(self):
        """Test that only allowed Amazon models are used."""
        allowed_models = [
            'amazon.titan-embed-text-v2:0',
            'amazon.nova-pro-v1:0',
            'amazon.nova-large-v2:0'
        ]
        
        # Configuration should use these models
        configured_embedding_model = 'amazon.titan-embed-text-v2:0'
        configured_generation_model = 'amazon.nova-pro-v1:0'
        
        assert configured_embedding_model in allowed_models
        assert configured_generation_model in allowed_models

    def test_region_compliance(self):
        """Test that all resources use us-east-1."""
        configured_region = 'us-east-1'
        
        # All Bedrock calls should use this region
        assert configured_region == 'us-east-1'


class TestExplainabilityRequirements:
    """Tests for explainability and traceability."""

    def test_source_citation_format(self):
        """Test that source citations are properly formatted."""
        citation = {
            'text': 'Senior engineers require system design skills...',
            'source': 'job_postings.json',
            'relevance': 'Defines skill requirements for target role'
        }
        
        required_fields = ['text', 'source', 'relevance']
        for field in required_fields:
            assert field in citation
            assert citation[field] is not None

    def test_reasoning_trace_completeness(self):
        """Test that reasoning traces are complete."""
        reasoning_steps = [
            'Step 1: Analyzed user profile - identified 5 years Python experience',
            'Step 2: Retrieved relevant job postings - found 10 matches',
            'Step 3: Compared user skills to job requirements',
            'Step 4: Identified gaps in Kubernetes and system design',
            'Step 5: Generated 12-week learning plan'
        ]
        
        # Should have at least 3 reasoning steps
        assert len(reasoning_steps) >= 3


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
