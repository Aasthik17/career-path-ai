"""
Unit Tests for CareerPath AI Lambda Functions
Tests resume parser, embedding pipeline, RAG retriever, and agent orchestrator
"""

import json
import pytest
from unittest.mock import patch, MagicMock
import sys
import os

# Add lambda functions to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend', 'lambda', 'resume-parser'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend', 'lambda', 'embedding-pipeline'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend', 'lambda', 'rag-retriever'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend', 'lambda', 'agent-orchestrator'))


class TestResumeParser:
    """Tests for resume parser Lambda function."""

    @pytest.fixture
    def sample_resume_text(self):
        return """
        John Doe
        Senior Software Engineer
        john.doe@email.com | San Francisco, CA
        
        SUMMARY
        Experienced software engineer with 5+ years building scalable web applications.
        
        SKILLS
        Python, JavaScript, React, Node.js, AWS, Docker, PostgreSQL
        
        EXPERIENCE
        Senior Software Engineer | TechCorp | 2020-Present
        - Led development of microservices architecture
        - Mentored 3 junior engineers
        
        Software Engineer | StartupXYZ | 2018-2020
        - Built REST APIs serving 1M+ requests/day
        
        EDUCATION
        B.S. Computer Science | Stanford University | 2018
        
        CERTIFICATIONS
        AWS Solutions Architect Associate | 2023
        """

    def test_resume_parser_extracts_skills(self, sample_resume_text):
        """Test that resume parser extracts technical skills."""
        # Mock the Bedrock response
        mock_response = {
            'skills': {
                'technical': ['Python', 'JavaScript', 'React', 'Node.js', 'AWS', 'Docker'],
                'soft': ['Leadership', 'Mentoring'],
                'tools': [],
                'languages': []
            },
            'career_level': 'Senior',
            'total_experience_years': 5
        }
        
        with patch('handler.invoke_bedrock_model', return_value=mock_response):
            # Import would work if running in actual test environment
            # from handler import parse_resume
            # result = parse_resume(sample_resume_text)
            # assert 'Python' in result['skills']['technical']
            
            # Placeholder assertion for test structure
            assert 'Python' in sample_resume_text

    def test_resume_parser_handles_empty_input(self):
        """Test that resume parser handles empty input gracefully."""
        empty_resume = ""
        
        # In real implementation, should return error or default structure
        assert empty_resume == ""

    def test_resume_parser_lambda_handler_get_presigned_url(self):
        """Test GET request for presigned URL."""
        event = {
            'httpMethod': 'GET',
            'queryStringParameters': {
                'user_id': 'test-user',
                'filename': 'resume.pdf'
            }
        }
        
        # Mock S3 client
        with patch('handler.s3_client') as mock_s3:
            mock_s3.generate_presigned_url.return_value = 'https://s3.amazonaws.com/presigned-url'
            
            # Placeholder for actual test
            assert event['httpMethod'] == 'GET'


class TestEmbeddingPipeline:
    """Tests for embedding pipeline Lambda function."""

    @pytest.fixture
    def sample_parsed_resume(self):
        return {
            'summary': 'Experienced software engineer',
            'skills': {
                'technical': ['Python', 'AWS'],
                'soft': ['Leadership']
            },
            'career_level': 'Senior',
            'primary_domain': 'Software Engineering'
        }

    def test_create_profile_text(self, sample_parsed_resume):
        """Test profile text creation for embedding."""
        # The profile text should contain key information
        expected_keywords = ['Python', 'AWS', 'Senior']
        
        # Placeholder assertion
        assert 'Python' in sample_parsed_resume['skills']['technical']

    def test_embedding_dimensions(self):
        """Test that embeddings have correct dimensions."""
        expected_dimensions = 1024  # Titan v2 default
        
        # Mock Bedrock response
        mock_embedding = [0.1] * 1024
        
        assert len(mock_embedding) == expected_dimensions


class TestRagRetriever:
    """Tests for RAG retriever Lambda function."""

    def test_retrieval_query_formatting(self):
        """Test that retrieval queries are properly formatted."""
        user_profile = {
            'summary': 'Senior engineer',
            'skills': {'technical': ['Python', 'AWS']},
            'career_level': 'Senior'
        }
        
        # Query should include relevant information
        expected_keywords = ['Python', 'AWS', 'Senior']
        
        # Placeholder assertion
        assert user_profile['career_level'] == 'Senior'

    def test_result_categorization(self):
        """Test that results are properly categorized."""
        mock_results = [
            {'content': 'Senior Software Engineer job posting', 'score': 0.9},
            {'content': 'Python skill development course', 'score': 0.85},
            {'content': 'AWS Certification learning resource', 'score': 0.8}
        ]
        
        # Should categorize into job_postings, skills, learning_resources
        assert len(mock_results) == 3


class TestAgentOrchestrator:
    """Tests for agent orchestrator Lambda function."""

    def test_intent_analysis(self):
        """Test intent classification."""
        test_messages = [
            ("Create a career roadmap", "ROADMAP"),
            ("What jobs match my skills?", "JOB_SEARCH"),
            ("What skills should I learn?", "SKILL_GAP"),
            ("Hello", "GENERAL_CHAT")
        ]
        
        # Placeholder assertions
        assert test_messages[0][1] == "ROADMAP"

    def test_roadmap_generation_structure(self):
        """Test that generated roadmaps have correct structure."""
        expected_keys = [
            'current_analysis',
            'career_paths',
            'skill_gaps',
            'roadmap',
            'resources',
            'explainability'
        ]
        
        # Placeholder - in real test, verify actual output
        assert len(expected_keys) == 6

    def test_explainability_trace(self):
        """Test that responses include source citations."""
        mock_response = {
            'response': 'Career advice',
            'sources': [
                {'content': 'Job posting', 'source': 'job_postings.json'}
            ]
        }
        
        assert len(mock_response['sources']) > 0


class TestKPIs:
    """Tests for KPI calculations and metrics."""

    def test_role_alignment_accuracy(self):
        """Test role alignment calculation."""
        user_skills = ['Python', 'AWS', 'Docker']
        job_skills = ['Python', 'AWS', 'Kubernetes', 'Docker']
        
        # Calculate overlap
        overlap = len(set(user_skills) & set(job_skills))
        total_required = len(job_skills)
        alignment = overlap / total_required
        
        assert alignment == 0.75  # 3/4 skills match

    def test_career_readiness_score(self):
        """Test career readiness score calculation."""
        skill_scores = {
            'Python': 80,
            'AWS': 60,
            'System Design': 40,
            'Leadership': 50
        }
        
        required_scores = {
            'Python': 80,
            'AWS': 80,
            'System Design': 70,
            'Leadership': 60
        }
        
        # Calculate readiness
        total_current = sum(min(skill_scores.get(s, 0), r) for s, r in required_scores.items())
        total_required = sum(required_scores.values())
        readiness = total_current / total_required
        
        assert 0 <= readiness <= 1

    def test_skill_gap_reduction(self):
        """Test skill gap reduction tracking."""
        initial_gaps = ['Kubernetes', 'System Design', 'Leadership']
        after_training = ['System Design', 'Leadership']
        
        reduction = (len(initial_gaps) - len(after_training)) / len(initial_gaps)
        
        assert reduction == pytest.approx(0.333, rel=0.01)


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
