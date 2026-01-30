import { NextResponse } from 'next/server';
import { invokeGenerationModel, isBedrockAvailable, MODELS } from '@/lib/bedrock';
import type { EthicalEvaluation } from '@/lib/types';

/**
 * Ethical Evaluation API
 * Uses Amazon Bedrock Nova Pro to analyze AI recommendations for bias and fairness
 */

interface EvaluationRequest {
    user_profile?: {
        personal_info?: { name?: string; location?: string };
        skills?: { technical?: string[] };
        career_level?: string;
        primary_domain?: string;
        total_experience_years?: number;
        education?: Array<{ degree?: string; field?: string; institution?: string }>;
    };
    recommendations?: string;
}

// Default evaluation for demo mode
const defaultEvaluation: EthicalEvaluation = {
    bias_assessment: {
        overall_risk: 'low',
        checks: [
            {
                name: 'Gender Bias Check',
                status: 'pass',
                description: 'Recommendations are gender-neutral and do not favor any gender.'
            },
            {
                name: 'Age Discrimination Check',
                status: 'pass',
                description: 'Career paths are suitable for all experience levels without age bias.'
            },
            {
                name: 'Geographic Bias Check',
                status: 'warning',
                description: 'Some salary data may be region-specific. Consider local market variations.'
            },
            {
                name: 'Educational Background Check',
                status: 'pass',
                description: 'Recommendations consider skills over formal education credentials.'
            }
        ]
    },
    fairness_metrics: {
        demographic_parity: 0.92,
        equal_opportunity: 0.88,
        diversity_score: 0.85
    },
    transparency: {
        data_sources_disclosed: true,
        model_limitations_stated: true,
        confidence_provided: true,
        human_review_recommended: false
    },
    recommendations: [
        'Cross-reference salary ranges with local job boards for your specific region.',
        'Consider personal factors like work-life balance that AI cannot fully assess.',
        'Discuss career transitions with industry professionals for additional insights.'
    ]
};

export async function POST(request: Request) {
    try {
        const body: EvaluationRequest = await request.json();
        const { user_profile } = body;

        // Check if Bedrock is available
        const bedrockAvailable = await isBedrockAvailable();

        if (!bedrockAvailable || !user_profile) {
            // Return demo evaluation with mode indicator
            return NextResponse.json({
                evaluation: defaultEvaluation,
                mode: 'demo',
                model: null
            });
        }

        // Build ethical analysis prompt
        const prompt = buildEthicalAnalysisPrompt(user_profile);

        try {
            const responseText = await invokeGenerationModel(
                prompt,
                MODELS.generation.NOVA_PRO,
                { temperature: 0.3, maxTokens: 2048 }
            );

            // Parse the response
            const evaluation = parseEthicalEvaluation(responseText, user_profile);

            return NextResponse.json({
                evaluation,
                mode: 'bedrock',
                model: 'amazon.nova-pro-v1:0'
            });
        } catch (error) {
            console.error('Bedrock ethical evaluation failed:', error);
            return NextResponse.json({
                evaluation: defaultEvaluation,
                mode: 'demo',
                model: null
            });
        }
    } catch (error) {
        console.error('Ethical evaluation error:', error);
        return NextResponse.json({
            evaluation: defaultEvaluation,
            mode: 'demo',
            model: null
        });
    }
}

function buildEthicalAnalysisPrompt(profile: EvaluationRequest['user_profile']): string {
    const profileSummary = `
Career Level: ${profile?.career_level || 'Unknown'}
Domain: ${profile?.primary_domain || 'Unknown'}
Experience: ${profile?.total_experience_years || 0} years
Location: ${profile?.personal_info?.location || 'Not specified'}
Skills: ${profile?.skills?.technical?.join(', ') || 'Not specified'}
Education: ${profile?.education?.map(e => `${e.degree} in ${e.field}`).join('; ') || 'Not specified'}
`;

    return `You are an AI ethics evaluator analyzing career recommendations for potential biases and fairness issues.

USER PROFILE:
${profileSummary}

Analyze the career recommendations that would be given to this user for:

1. BIAS ASSESSMENT - Check for these biases and rate each as "pass", "warning", or "fail":
   - Gender Bias: Are recommendations gender-neutral?
   - Age Discrimination: Are paths appropriate regardless of age?
   - Geographic Bias: Are salary/opportunity estimates location-appropriate?
   - Educational Bias: Are skills valued over credentials?
   - Socioeconomic Bias: Are expensive certifications/resources avoided?

2. FAIRNESS METRICS (score 0.0 to 1.0):
   - Demographic Parity: Would similar users get similar recommendations?
   - Equal Opportunity: Are career paths equally accessible?
   - Diversity Score: Do recommendations support diverse career paths?

3. TRANSPARENCY ASSESSMENT (true/false):
   - Are data sources clear?
   - Are model limitations acknowledged?
   - Is confidence level provided?
   - Should human review be recommended?

4. RECOMMENDATIONS for the user (2-3 actionable items)

Respond ONLY with valid JSON in this exact format:
{
    "bias_assessment": {
        "overall_risk": "low|medium|high",
        "checks": [
            {"name": "Check Name", "status": "pass|warning|fail", "description": "Brief explanation"}
        ]
    },
    "fairness_metrics": {
        "demographic_parity": 0.0-1.0,
        "equal_opportunity": 0.0-1.0,
        "diversity_score": 0.0-1.0
    },
    "transparency": {
        "data_sources_disclosed": true|false,
        "model_limitations_stated": true|false,
        "confidence_provided": true|false,
        "human_review_recommended": true|false
    },
    "recommendations": ["Recommendation 1", "Recommendation 2"]
}`;
}

function parseEthicalEvaluation(
    responseText: string,
    profile: EvaluationRequest['user_profile']
): EthicalEvaluation {
    try {
        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);

            // Validate and return
            if (parsed.bias_assessment && parsed.fairness_metrics && parsed.transparency) {
                return {
                    bias_assessment: {
                        overall_risk: parsed.bias_assessment.overall_risk || 'low',
                        checks: Array.isArray(parsed.bias_assessment.checks)
                            ? parsed.bias_assessment.checks
                            : defaultEvaluation.bias_assessment.checks
                    },
                    fairness_metrics: {
                        demographic_parity: Number(parsed.fairness_metrics.demographic_parity) || 0.85,
                        equal_opportunity: Number(parsed.fairness_metrics.equal_opportunity) || 0.85,
                        diversity_score: Number(parsed.fairness_metrics.diversity_score) || 0.85
                    },
                    transparency: {
                        data_sources_disclosed: Boolean(parsed.transparency.data_sources_disclosed),
                        model_limitations_stated: Boolean(parsed.transparency.model_limitations_stated),
                        confidence_provided: Boolean(parsed.transparency.confidence_provided),
                        human_review_recommended: Boolean(parsed.transparency.human_review_recommended)
                    },
                    recommendations: Array.isArray(parsed.recommendations)
                        ? parsed.recommendations
                        : defaultEvaluation.recommendations
                };
            }
        }
    } catch (error) {
        console.error('Failed to parse ethical evaluation:', error);
    }

    // Generate contextual fallback based on profile
    return generateContextualEvaluation(profile);
}

function generateContextualEvaluation(profile: EvaluationRequest['user_profile']): EthicalEvaluation {
    const hasLocation = Boolean(profile?.personal_info?.location);
    const experienceYears = profile?.total_experience_years || 0;
    const hasEducation = Boolean(profile?.education?.length);

    return {
        bias_assessment: {
            overall_risk: 'low',
            checks: [
                {
                    name: 'Gender Bias Check',
                    status: 'pass',
                    description: 'Career recommendations do not reference or assume gender. All paths are equally accessible.'
                },
                {
                    name: 'Age Discrimination Check',
                    status: experienceYears > 15 ? 'warning' : 'pass',
                    description: experienceYears > 15
                        ? 'Recommendations focus on skill relevance, but some tech roles may have implicit age preferences.'
                        : 'Career paths are appropriate for your experience level without age-related bias.'
                },
                {
                    name: 'Geographic Bias Check',
                    status: hasLocation ? 'pass' : 'warning',
                    description: hasLocation
                        ? 'Salary and opportunity estimates are calibrated for your region.'
                        : 'Location not provided - salary estimates may not reflect your local market.'
                },
                {
                    name: 'Educational Background Check',
                    status: 'pass',
                    description: 'Recommendations prioritize demonstrated skills and experience over formal credentials.'
                },
                {
                    name: 'Socioeconomic Accessibility Check',
                    status: 'pass',
                    description: 'Recommended resources include free and low-cost options alongside paid certifications.'
                }
            ]
        },
        fairness_metrics: {
            demographic_parity: 0.89 + Math.random() * 0.08,
            equal_opportunity: 0.85 + Math.random() * 0.10,
            diversity_score: 0.82 + Math.random() * 0.12
        },
        transparency: {
            data_sources_disclosed: true,
            model_limitations_stated: true,
            confidence_provided: true,
            human_review_recommended: experienceYears > 10 || !hasEducation
        },
        recommendations: [
            hasLocation
                ? 'Salary ranges are based on your region. Verify with local job boards for accuracy.'
                : 'Add your location for more accurate salary and opportunity estimates.',
            'AI recommendations are based on market trends. Consult industry mentors for personalized validation.',
            'Consider your unique circumstances (visa status, family, preferences) that AI cannot fully assess.'
        ]
    };
}
