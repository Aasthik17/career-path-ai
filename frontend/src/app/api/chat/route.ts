import { NextResponse } from 'next/server';
import { invokeGenerationModel, isBedrockAvailable, MODELS } from '@/lib/bedrock';

/**
 * Chat API - Career AI Mentor
 * Uses Amazon Bedrock (Nova Pro) for intelligent career guidance
 * Falls back to smart local responses if Bedrock is not available
 */

interface UserProfile {
    personal_info?: { name?: string };
    skills?: { technical?: string[]; soft?: string[] };
    career_level?: string;
    primary_domain?: string;
    total_experience_years?: number;
    certifications?: Array<{ name: string }>;
    summary?: string;
    experience?: Array<{ title?: string; company?: string }>;
    education?: Array<{ degree?: string; field?: string }>;
}

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { message, user_profile, conversation_history } = body;

        if (!message) {
            return NextResponse.json(
                { error: 'Missing message' },
                { status: 400 }
            );
        }

        // Check if Bedrock is available
        const bedrockAvailable = await isBedrockAvailable();

        let response;
        let mode: 'bedrock' | 'local';

        if (bedrockAvailable && user_profile) {
            // Use Amazon Bedrock for AI-powered responses
            response = await generateBedrockResponse(message, user_profile, conversation_history);
            mode = 'bedrock';
        } else {
            // Fallback to smart local responses
            console.log('Using local response generation');
            response = generateLocalResponse(message, user_profile);
            mode = 'local';
        }

        return NextResponse.json({
            ...response,
            mode
        });
    } catch (error) {
        console.error('Chat error:', error);
        // Fallback to local on any error
        try {
            const body = await request.clone().json();
            const response = generateLocalResponse(body.message || '', body.user_profile);
            return NextResponse.json({ ...response, mode: 'local' });
        } catch {
            return NextResponse.json(
                { error: 'Chat failed' },
                { status: 500 }
            );
        }
    }
}

/**
 * Generate response using Amazon Bedrock Nova Pro
 */
async function generateBedrockResponse(
    message: string,
    profile: UserProfile,
    history?: ChatMessage[]
) {
    // Build context from user profile
    const profileContext = buildProfileContext(profile);
    const conversationContext = history?.slice(-5).map(m =>
        `${m.role.toUpperCase()}: ${m.content}`
    ).join('\n') || '';

    const systemPrompt = `You are CareerPath AI, an expert career mentor powered by Amazon Bedrock. 
You provide personalized career guidance based on the user's actual resume and profile.

USER PROFILE:
${profileContext}

INSTRUCTIONS:
1. Provide specific, actionable advice based on the user's actual skills and experience
2. Reference their specific skills, certifications, and experience when giving advice
3. Be encouraging but honest about skill gaps
4. Format responses in markdown with headers, bullet points, and emphasis
5. Include specific recommendations for their career level (${profile.career_level || 'Mid'})
6. When suggesting jobs, base matches on their actual skills
7. When creating roadmaps, tailor to their specific gaps

${conversationContext ? `RECENT CONVERSATION:\n${conversationContext}\n` : ''}`;

    const prompt = `${systemPrompt}

USER MESSAGE: ${message}

Provide a helpful, personalized response. Use markdown formatting with headers (##), bullet points, and **bold** for emphasis.`;

    try {
        const responseText = await invokeGenerationModel(
            prompt,
            MODELS.generation.NOVA_PRO,
            { temperature: 0.7, maxTokens: 4096 }
        );

        return {
            response: responseText || generateLocalResponse(message, profile).response,
            type: 'text',
            sources: [
                { content: 'User profile analysis', source: 'uploaded_resume' },
                { content: 'Career data', source: 'knowledge_base' }
            ]
        };
    } catch (error) {
        console.error('Bedrock response failed:', error);
        return generateLocalResponse(message, profile);
    }
}

/**
 * Build profile context string from user profile
 */
function buildProfileContext(profile: UserProfile): string {
    const parts: string[] = [];

    if (profile.personal_info?.name) {
        parts.push(`Name: ${profile.personal_info.name}`);
    }

    if (profile.career_level) {
        parts.push(`Career Level: ${profile.career_level}`);
    }

    if (profile.primary_domain) {
        parts.push(`Primary Domain: ${profile.primary_domain}`);
    }

    if (profile.total_experience_years) {
        parts.push(`Total Experience: ${profile.total_experience_years} years`);
    }

    if (profile.summary) {
        parts.push(`Summary: ${profile.summary}`);
    }

    if (profile.skills?.technical?.length) {
        parts.push(`Technical Skills: ${profile.skills.technical.join(', ')}`);
    }

    if (profile.skills?.soft?.length) {
        parts.push(`Soft Skills: ${profile.skills.soft.join(', ')}`);
    }

    if (profile.certifications?.length) {
        parts.push(`Certifications: ${profile.certifications.map(c => c.name).join(', ')}`);
    }

    if (profile.experience?.length) {
        const expStr = profile.experience.map(e =>
            `${e.title || 'Role'} at ${e.company || 'Company'}`
        ).join('; ');
        parts.push(`Experience: ${expStr}`);
    }

    if (profile.education?.length) {
        const eduStr = profile.education.map(e =>
            `${e.degree || 'Degree'} in ${e.field || 'Field'}`
        ).join('; ');
        parts.push(`Education: ${eduStr}`);
    }

    return parts.join('\n');
}

/**
 * Local response generation (fallback)
 */
function generateLocalResponse(message: string, profile?: UserProfile) {
    const inputLower = message.toLowerCase();
    const skills = profile?.skills?.technical || [];
    const name = profile?.personal_info?.name || 'there';
    const careerLevel = profile?.career_level || 'Mid';
    const domain = profile?.primary_domain || 'Software Engineering';
    const experience = profile?.total_experience_years || 3;
    const certs = profile?.certifications || [];

    // Career Roadmap
    if (inputLower.includes('roadmap') || inputLower.includes('plan') || inputLower.includes('path')) {
        return {
            response: `## 🗺️ Your Personalized 12-Week Career Roadmap

Hey ${name}! Based on your profile as a **${careerLevel} ${domain}** professional with ${experience} years of experience and skills in **${skills.slice(0, 3).join(', ')}**, here's your customized growth plan:

### 📊 Current Assessment
- **Career Level:** ${careerLevel}
- **Primary Skills:** ${skills.slice(0, 5).join(', ') || 'General programming'}
- **Experience:** ${experience} years
${certs.length ? `- **Certifications:** ${certs.map(c => c.name).join(', ')}` : ''}

---

### 🎯 Weeks 1-4: Foundation Strengthening
${getWeek1to4Recommendations(skills, careerLevel)}

### 🚀 Weeks 5-8: Skill Expansion
${getWeek5to8Recommendations(skills, careerLevel)}

### 🏆 Weeks 9-12: Portfolio & Visibility
${getWeek9to12Recommendations(skills)}

Would you like me to dive deeper into any specific week?`,
            type: 'text',
            sources: [
                { content: 'Career data for ' + domain, source: 'skills_taxonomy.json' },
                { content: 'Learning resources', source: 'learning_resources.json' }
            ]
        };
    }

    // Job Matching
    if (inputLower.includes('job') || inputLower.includes('match') || inputLower.includes('opportunit')) {
        const matchScore1 = Math.min(95, 70 + skills.length * 3);
        return {
            response: `## 🎯 Jobs Matching Your Profile

Based on your skills in **${skills.slice(0, 3).join(', ') || 'programming'}** and ${experience} years of experience as a ${careerLevel} professional:

### 1. ${careerLevel === 'Senior' ? 'Staff' : 'Senior'} ${domain.includes('Full Stack') ? 'Full Stack' : 'Software'} Engineer
**Match Score:** ${matchScore1}%
- ✅ Your ${skills[0] || 'technical'} expertise is a strong match
${skills.length >= 3 ? `- ✅ ${skills[1]} and ${skills[2]} align with requirements` : '- ⚠️ Consider adding more specialized skills'}
**Salary Range:** $${careerLevel === 'Senior' ? '180,000 - 240,000' : '140,000 - 180,000'}

### 2. ${domain.includes('ML') ? 'ML Platform' : 'Platform'} Engineer
**Match Score:** ${matchScore1 - 10}%
${skills.includes('AWS') || skills.includes('Kubernetes') ? '- ✅ Strong cloud/infra skills' : '- ⚠️ Would benefit from more cloud experience'}

### 📈 How to Improve Match Scores
${getMatchImprovementTips(skills)}

Would you like tips for any specific role?`,
            type: 'text',
            sources: [{ content: 'Job market data', source: 'job_postings.json' }]
        };
    }

    // Skill Analysis
    if (inputLower.includes('skill') || inputLower.includes('learn') || inputLower.includes('gap')) {
        return {
            response: `## 📚 Skill Gap Analysis for ${name}

### ✅ Your Current Strengths
${skills.length ? skills.map(s => `- **${s}** - Market demand: High`).join('\n') : '- Upload your resume to see your skills analyzed'}

### 🎯 High-Priority Skills to Learn
${getSkillRecommendations(skills, careerLevel)}

### 📖 Recommended Learning Path
${getLearningPath(skills, careerLevel)}

Would you like specific resources for any skill?`,
            type: 'text',
            sources: [
                { content: 'Skills taxonomy', source: 'skills_taxonomy.json' },
                { content: 'Learning resources', source: 'learning_resources.json' }
            ]
        };
    }

    // Default greeting
    return {
        response: `## 👋 Hi ${name}! I'm your Career AI Mentor

${profile?.summary ? `I see you're a ${profile.summary.substring(0, 100)}...` : ''}

**📊 Your Profile Summary:**
- **Level:** ${careerLevel} ${domain}
- **Experience:** ${experience} years
- **Top Skills:** ${skills.slice(0, 5).join(', ') || 'Upload resume for analysis'}
${certs.length ? `- **Certifications:** ${certs.map(c => c.name).join(', ')}` : ''}

### 🎯 What I Can Help With:
1. **🗺️ Career Roadmap** - "Create a career roadmap for me"
2. **🎯 Job Matching** - "What jobs match my profile?"
3. **📚 Skill Analysis** - "What skills should I learn?"
4. **🎤 Interview Prep** - "Help me prepare for interviews"

What would you like to explore?`,
        type: 'text',
        sources: []
    };
}

// Helper functions for personalized recommendations
function getWeek1to4Recommendations(skills: string[], level: string): string {
    const needsSystemDesign = level === 'Senior' || level === 'Staff';
    const hasAWS = skills.includes('AWS');

    return `**Week 1-2: ${needsSystemDesign ? 'System Design Mastery' : 'Technical Fundamentals'}**
- ${needsSystemDesign ? 'Complete system design interview prep' : 'Strengthen core programming skills'}
- Build a project demonstrating ${skills[0] || 'your skills'}

**Week 3-4: ${hasAWS ? 'Advanced AWS' : 'Cloud Fundamentals'}**
- ${hasAWS ? 'Study for AWS Solutions Architect Professional' : 'Get AWS Cloud Practitioner certification'}
- Deploy a serverless application`;
}

function getWeek5to8Recommendations(skills: string[], level: string): string {
    const hasK8s = skills.includes('Kubernetes');

    return `**Week 5-6: ${hasK8s ? 'Advanced Kubernetes' : 'Container Orchestration'}**
- ${hasK8s ? 'Prepare for CKA certification' : 'Learn Kubernetes fundamentals'}
- Set up a CI/CD pipeline

**Week 7-8: ${level === 'Senior' ? 'Leadership Development' : 'Collaboration Skills'}**
- ${level === 'Senior' ? 'Lead a technical design review' : 'Contribute to team discussions'}
- Write a technical blog post`;
}

function getWeek9to12Recommendations(skills: string[]): string {
    return `**Week 9-10: Portfolio Project**
- Build a full-stack project showcasing ${skills.slice(0, 3).join(', ') || 'your skills'}
- Include documentation and deployment

**Week 11-12: Job Application**
- Update resume with new achievements
- Apply to 10+ target companies
- Practice mock interviews`;
}

function getMatchImprovementTips(skills: string[]): string {
    const tips: string[] = [];
    if (!skills.includes('Kubernetes')) tips.push('- Learn **Kubernetes** (+5-10% match)');
    if (!skills.includes('AWS')) tips.push('- Get **AWS certification** (+3-5% match)');
    if (!skills.includes('System Design')) tips.push('- Practice **system design** (+5-8% match)');
    return tips.length ? tips.join('\n') : '- Continue building expertise in your current stack';
}

function getSkillRecommendations(skills: string[], level: string): string {
    const recs: string[] = [];

    if (!skills.includes('System Design') && (level === 'Senior' || level === 'Mid')) {
        recs.push('| System Design | 🔴 Critical | +15-25% | 3-6 months |');
    }
    if (!skills.includes('Kubernetes')) {
        recs.push('| Kubernetes | 🟠 High | +20% | 2-3 months |');
    }
    if (!skills.includes('AWS') && !skills.includes('Azure') && !skills.includes('GCP')) {
        recs.push('| Cloud (AWS/GCP) | 🟠 High | +12% | 2-4 months |');
    }

    return `| Skill | Priority | Salary Premium | Time |\n|-------|----------|---------------|------|\n${recs.join('\n') || '| Advanced ${skills[0] || "Tech"} | 🟡 Medium | +10% | Ongoing |'}`;
}

function getLearningPath(skills: string[], level: string): string {
    if (level === 'Senior' || level === 'Staff') {
        return `1. **System Design** - "Designing Data-Intensive Applications" book
2. **Leadership** - Engineering Management courses
3. **Architecture** - Cloud certification (Professional level)`;
    }
    return `1. **Core Skills** - Strengthen ${skills[0] || 'programming'} fundamentals
2. **Cloud Basics** - AWS/GCP Cloud Practitioner
3. **DevOps** - Docker & CI/CD basics`;
}
