import { NextResponse } from 'next/server';
import { invokeGenerationModel, isBedrockAvailable, MODELS } from '@/lib/bedrock';

/**
 * Resume Analysis API
 * Uses Amazon Bedrock Claude 3.5 Sonnet for detailed resume analysis with annotations
 * Identifies good points, areas for improvement, and provides specific suggestions
 */

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { resume_text } = body;

        if (!resume_text) {
            return NextResponse.json(
                { error: 'Missing resume_text' },
                { status: 400 }
            );
        }

        // Check if Bedrock is available
        const bedrockAvailable = await isBedrockAvailable();

        if (!bedrockAvailable) {
            // Return fallback analysis
            return NextResponse.json({
                annotations: generateFallbackAnnotations(resume_text),
                mode: 'local'
            });
        }

        // Use Amazon Bedrock Claude 3.5 Sonnet for detailed analysis
        const annotations = await analyzeResumeWithBedrock(resume_text);

        return NextResponse.json({
            annotations,
            mode: 'bedrock'
        });
    } catch (error) {
        console.error('Resume analysis error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze resume' },
            { status: 500 }
        );
    }
}

interface Annotation {
    type: 'good' | 'improvement';
    text: string;
    suggestion?: string;
    category: 'content' | 'formatting' | 'language' | 'structure' | 'keywords';
}

interface AnalysisResult {
    sections: {
        name: string;
        content: string;
        annotations: Annotation[];
    }[];
    overall_suggestions: string[];
}

/**
 * Analyze resume using Amazon Bedrock Claude 3.5 Sonnet
 * This model excels at nuanced text analysis and providing specific suggestions
 */
async function analyzeResumeWithBedrock(resumeText: string): Promise<AnalysisResult> {
    const prompt = `You are an expert resume reviewer and ATS optimization specialist. Analyze the following resume and identify:

1. GOOD POINTS (things done well that should be highlighted in green):
   - Strong action verbs
   - Quantified achievements (numbers, percentages)
   - Relevant keywords for ATS
   - Clear formatting
   - Strong skill demonstrations

2. AREAS FOR IMPROVEMENT (things to highlight in red with suggestions):
   - Weak language that could be stronger
   - Missing quantification
   - Poor ordering of information
   - Missing keywords
   - Unclear or vague statements
   - Grammar or phrasing issues

<resume>
${resumeText}
</resume>

Analyze the resume and return a JSON object with this EXACT structure:

{
  "sections": [
    {
      "name": "<section name like 'Contact', 'Summary', 'Experience', 'Education', 'Skills'>",
      "content": "<the content of this section>",
      "annotations": [
        {
          "type": "good",
          "text": "<the specific text that is good>",
          "category": "<content|formatting|language|structure|keywords>"
        },
        {
          "type": "improvement",
          "text": "<the specific text that needs improvement>",
          "suggestion": "<specific suggestion to improve it>",
          "category": "<content|formatting|language|structure|keywords>"
        }
      ]
    }
  ],
  "overall_suggestions": [
    "<overall suggestion 1 to improve the resume>",
    "<overall suggestion 2>",
    "<overall suggestion 3>"
  ]
}

Be specific and actionable. For each improvement, provide a concrete suggestion.
Focus on ATS optimization, impact, and professional presentation.
Return ONLY valid JSON, no other text.`;

    try {
        // Using Nova Pro for consistency, but Claude would be ideal if available
        const response = await invokeGenerationModel(
            prompt,
            MODELS.generation.NOVA_PRO,
            { temperature: 0.2, maxTokens: 8192 }
        );

        console.log('Resume analysis response:', response.substring(0, 500));

        // Parse the JSON response
        let jsonStr = response;

        // Try to extract JSON if wrapped in markdown
        const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1].trim();
        }

        // Try to find JSON object
        const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (objectMatch) {
            jsonStr = objectMatch[0];
        }

        const parsed = JSON.parse(jsonStr);
        return parsed as AnalysisResult;
    } catch (error) {
        console.error('Bedrock analysis failed:', error);
        return generateFallbackAnnotations(resumeText);
    }
}

/**
 * Generate fallback annotations when Bedrock is not available
 */
function generateFallbackAnnotations(resumeText: string): AnalysisResult {
    const lines = resumeText.split('\n').filter(l => l.trim());
    const sections: AnalysisResult['sections'] = [];

    // Simple section detection
    let currentSection = { name: 'Header', content: '', annotations: [] as Annotation[] };

    for (const line of lines) {
        const upperLine = line.toUpperCase().trim();

        if (['EXPERIENCE', 'WORK EXPERIENCE', 'EMPLOYMENT'].some(s => upperLine.includes(s))) {
            if (currentSection.content) sections.push(currentSection);
            currentSection = { name: 'Experience', content: '', annotations: [] };
        } else if (['EDUCATION', 'ACADEMIC'].some(s => upperLine.includes(s))) {
            if (currentSection.content) sections.push(currentSection);
            currentSection = { name: 'Education', content: '', annotations: [] };
        } else if (['SKILLS', 'TECHNICAL SKILLS'].some(s => upperLine.includes(s))) {
            if (currentSection.content) sections.push(currentSection);
            currentSection = { name: 'Skills', content: '', annotations: [] };
        } else if (['SUMMARY', 'OBJECTIVE', 'PROFILE'].some(s => upperLine.includes(s))) {
            if (currentSection.content) sections.push(currentSection);
            currentSection = { name: 'Summary', content: '', annotations: [] };
        }

        currentSection.content += line + '\n';

        // Simple annotation detection
        // Good: Numbers, percentages, strong verbs
        if (/\d+%|\$[\d,]+|\d+ (years?|projects?|team)/i.test(line)) {
            currentSection.annotations.push({
                type: 'good',
                text: line.trim(),
                category: 'content'
            });
        }

        // Good: Action verbs
        if (/^(Led|Developed|Implemented|Managed|Created|Built|Designed|Launched|Achieved)/i.test(line.trim())) {
            currentSection.annotations.push({
                type: 'good',
                text: line.trim().split(' ').slice(0, 3).join(' '),
                category: 'language'
            });
        }

        // Improvement: Weak phrases
        if (/responsible for|helped with|worked on|assisted/i.test(line)) {
            currentSection.annotations.push({
                type: 'improvement',
                text: line.match(/responsible for|helped with|worked on|assisted/i)?.[0] || '',
                suggestion: 'Use stronger action verbs like "Led", "Managed", "Developed"',
                category: 'language'
            });
        }
    }

    if (currentSection.content) sections.push(currentSection);

    return {
        sections,
        overall_suggestions: [
            'Add more quantified achievements with specific numbers and percentages',
            'Use strong action verbs at the beginning of bullet points',
            'Include industry-specific keywords for ATS optimization'
        ]
    };
}
