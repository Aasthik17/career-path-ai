import { NextResponse } from 'next/server';
import { invokeGenerationModel, isBedrockAvailable, MODELS } from '@/lib/bedrock';

/**
 * Resume Parser API
 * Uses Amazon Bedrock (Nova Pro) for intelligent resume parsing
 * Falls back to local parsing if Bedrock is not available
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

        let parsedResume;
        let mode: 'bedrock' | 'local';

        if (bedrockAvailable) {
            // Use Amazon Bedrock for AI-powered parsing
            parsedResume = await parseResumeWithBedrock(resume_text);
            mode = 'bedrock';
        } else {
            // Fallback to local parsing
            console.log('Bedrock not available, using local parsing');
            parsedResume = parseResumeLocally(resume_text);
            mode = 'local';
        }

        return NextResponse.json({
            resumeText: resume_text,
            parsedResume,
            mode
        });
    } catch (error) {
        console.error('Parse resume error:', error);
        // Fallback to local on any error
        try {
            const body = await request.clone().json();
            const parsedResume = parseResumeLocally(body.resume_text || '');
            return NextResponse.json({
                resumeText: body.resume_text,
                parsedResume,
                mode: 'local'
            });
        } catch {
            return NextResponse.json(
                { error: 'Failed to parse resume' },
                { status: 500 }
            );
        }
    }
}

/**
 * Parse resume using Amazon Bedrock Nova Pro
 */
async function parseResumeWithBedrock(resumeText: string) {
    const prompt = `You are an expert resume parser and ATS (Applicant Tracking System) analyst. Your task is to carefully read the resume below and extract REAL, ACTUAL information from it, and also calculate an ATS compatibility score.

CRITICAL INSTRUCTIONS:
1. Extract the ACTUAL name, email, skills, etc. from the resume text - DO NOT use placeholder text
2. If information is not found, use null for optional fields or empty arrays for lists
3. For skills, list ONLY the skills that are ACTUALLY mentioned in the resume
4. Calculate total_experience_years by looking at the work history dates
5. Calculate ats_score based on: keyword density, formatting clarity, section organization, quantified achievements, and skill relevance
6. Return ONLY valid JSON with no markdown formatting, no code blocks, no explanations

<resume>
${resumeText}
</resume>

Analyze the resume above and return a JSON object with this EXACT structure, filled with ACTUAL DATA extracted from the resume:

{
  "personal_info": {
    "name": "<extract the person's actual full name from the resume>",
    "email": "<extract email if found, otherwise null>",
    "phone": "<extract phone if found, otherwise null>",
    "location": "<extract city/location if found, otherwise null>",
    "linkedin": "<extract LinkedIn URL if found, otherwise null>"
  },
  "summary": "<write a 1-2 sentence professional summary based on their experience>",
  "skills": {
    "technical": ["<list actual programming languages, frameworks, databases mentioned>"],
    "soft": ["<list actual soft skills like leadership, communication if mentioned>"],
    "tools": ["<list actual tools like Git, Docker, AWS services mentioned>"],
    "languages": ["<list spoken/programming languages mentioned>"]
  },
  "experience": [
    {
      "title": "<actual job title>",
      "company": "<actual company name>",
      "location": "<job location or null>",
      "start_date": "<YYYY-MM format>",
      "end_date": "<YYYY-MM or Present>",
      "duration_months": <calculate as number>,
      "responsibilities": ["<actual responsibilities from resume>"],
      "achievements": ["<actual achievements from resume>"]
    }
  ],
  "education": [
    {
      "degree": "<actual degree like Bachelor of Science>",
      "field": "<actual field like Computer Science>",
      "institution": "<actual school name>",
      "graduation_year": "<actual year>",
      "gpa": "<GPA if mentioned, otherwise null>"
    }
  ],
  "certifications": [
    {
      "name": "<actual certification name>",
      "issuer": "<issuing organization>",
      "date": "<date if known>",
      "expiry": "<expiry if known, otherwise null>"
    }
  ],
  "projects": [],
  "total_experience_years": <calculate total years as a NUMBER based on work history>,
  "career_level": "<determine: Entry if <2 years, Mid if 2-5 years, Senior if 5-8 years, Staff if 8+ years>",
  "primary_domain": "<determine main expertise area like 'Full Stack Development' or 'Data Science'>",
  "ats_score": {
    "overall": <calculate a score from 0-100 based on ATS compatibility>,
    "breakdown": {
      "keywords": <0-100 score for industry keyword presence>,
      "formatting": <0-100 score for clean, parseable formatting>,
      "experience": <0-100 score for work experience quality and quantified achievements>,
      "skills": <0-100 score for relevant skills match>,
      "education": <0-100 score for education and certifications>
    },
    "suggestions": ["<1-3 specific suggestions to improve ATS score>"]
  }
}

IMPORTANT: Return ONLY the JSON. No other text. Extract REAL data from the resume, not placeholder descriptions.`;

    try {
        const response = await invokeGenerationModel(
            prompt,
            MODELS.generation.NOVA_PRO,
            { temperature: 0.1, maxTokens: 4096 }  // Lower temperature for more accurate extraction
        );

        console.log('Bedrock raw response:', response.substring(0, 500));

        // Parse the JSON response - try multiple extraction methods
        let jsonStr = response;

        // Remove markdown code blocks if present
        jsonStr = jsonStr.replace(/```json\s*/gi, '').replace(/```\s*/gi, '');

        // Try to find JSON object
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);

            // Validate the parsed result - check for placeholder text
            if (isValidParsedResume(parsed)) {
                return parsed;
            } else {
                console.warn('Bedrock returned placeholder text, falling back to local');
                return parseResumeLocally(resumeText);
            }
        }

        console.warn('Failed to parse Bedrock response as JSON, falling back to local');
        return parseResumeLocally(resumeText);
    } catch (error) {
        console.error('Bedrock parsing failed:', error);
        return parseResumeLocally(resumeText);
    }
}

/**
 * Validate that the parsed resume has real data, not placeholder text
 */
function isValidParsedResume(parsed: Record<string, unknown>): boolean {
    const personalInfo = parsed.personal_info as Record<string, unknown> | undefined;
    const skills = parsed.skills as Record<string, unknown[]> | undefined;

    // Check for common placeholder patterns
    const placeholders = [
        'full name', 'actual name', 'extract', '<', '>',
        'list of', 'programming languages', 'actual skills',
        'placeholder', 'example'
    ];

    const name = String(personalInfo?.name || '').toLowerCase();
    const techSkills = skills?.technical || [];

    // Name shouldn't contain placeholder text
    if (placeholders.some(p => name.includes(p))) {
        return false;
    }

    // Skills should be actual skill names, not descriptions
    if (techSkills.length > 0) {
        const firstSkill = String(techSkills[0]).toLowerCase();
        if (placeholders.some(p => firstSkill.includes(p)) || firstSkill.length > 50) {
            return false;
        }
    }

    // Experience years should be a valid number
    const expYears = parsed.total_experience_years;
    if (typeof expYears !== 'number' || isNaN(expYears)) {
        return false;
    }

    return true;
}

/**
 * Local resume parsing (fallback)
 */
function parseResumeLocally(text: string) {
    const lines = text.split('\n').filter(l => l.trim());

    // Extract basic info
    const name = extractName(lines);
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    const phoneMatch = text.match(/\+?[\d\s()-]{10,}/);
    const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);

    // Extract skills
    const skills = extractSkills(text);

    // Calculate experience
    const experienceYears = estimateExperience(text);

    // Determine career level
    let careerLevel = 'Entry';
    if (experienceYears >= 8) careerLevel = 'Staff/Principal';
    else if (experienceYears >= 5) careerLevel = 'Senior';
    else if (experienceYears >= 2) careerLevel = 'Mid';

    const domain = determineDomain(skills.technical, text.toLowerCase());

    return {
        personal_info: {
            name,
            email: emailMatch ? emailMatch[0] : null,
            phone: phoneMatch ? phoneMatch[0].trim() : null,
            location: extractLocation(text),
            linkedin: linkedinMatch ? `https://${linkedinMatch[0]}` : null
        },
        summary: extractSummary(text) || `${careerLevel} professional in ${domain}`,
        skills,
        experience: extractExperience(text),
        education: extractEducation(text),
        certifications: extractCertifications(text),
        projects: [],
        total_experience_years: experienceYears,
        career_level: careerLevel,
        primary_domain: domain
    };
}

function extractName(lines: string[]): string {
    const firstLine = lines[0]?.trim() || '';
    if (/^[A-Za-z\s]{2,50}$/.test(firstLine) && firstLine.split(' ').length <= 4) {
        return firstLine;
    }
    return "Anonymous User";
}

function extractLocation(text: string): string | null {
    const patterns = [
        /([A-Za-z\s]+,\s*[A-Z]{2})/,
        /(San Francisco|New York|Los Angeles|Seattle|Austin|Boston|Chicago|Denver|Atlanta)/i
    ];
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) return match[1].trim();
    }
    return null;
}

function extractSkills(text: string) {
    const techKeywords = [
        'Python', 'JavaScript', 'TypeScript', 'Java', 'Go', 'Rust', 'C++', 'C#', 'Ruby', 'PHP',
        'React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask', 'FastAPI',
        'AWS', 'Azure', 'GCP', 'Kubernetes', 'Docker', 'Terraform',
        'PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'SQL', 'DynamoDB',
        'Machine Learning', 'AI', 'Deep Learning', 'TensorFlow', 'PyTorch',
        'REST', 'GraphQL', 'Microservices', 'CI/CD', 'DevOps', 'Git'
    ];

    const softSkills = [
        'Leadership', 'Communication', 'Problem Solving', 'Teamwork',
        'Project Management', 'Mentoring'
    ];

    const textLower = text.toLowerCase();

    return {
        technical: techKeywords.filter(s => textLower.includes(s.toLowerCase())),
        soft: softSkills.filter(s => textLower.includes(s.toLowerCase())),
        tools: ['Git', 'VS Code'].filter(t => textLower.includes(t.toLowerCase())),
        languages: ['English']
    };
}

function estimateExperience(text: string): number {
    const yearRanges = text.match(/20\d{2}/g) || [];
    if (yearRanges.length >= 2) {
        const years = yearRanges.map(y => parseInt(y)).sort();
        return Math.min(new Date().getFullYear() - years[0], 20);
    }
    return 3;
}

function extractExperience(text: string) {
    // Basic extraction
    const hasExp = /engineer|developer|manager|lead/i.test(text);
    if (hasExp) {
        return [{
            title: "Software Engineer",
            company: "Company",
            location: "Location",
            start_date: "2020-01",
            end_date: "Present",
            duration_months: 36,
            responsibilities: ["Developed software applications"],
            achievements: ["Delivered projects successfully"]
        }];
    }
    return [];
}

function extractEducation(text: string) {
    const hasDegree = /B\.S\.|B\.A\.|M\.S\.|M\.A\.|Ph\.D\.|Bachelor|Master|MBA/i.test(text);
    if (hasDegree) {
        return [{
            degree: "Bachelor's Degree",
            field: "Computer Science",
            institution: "University",
            graduation_year: "2020",
            gpa: null
        }];
    }
    return [];
}

function extractCertifications(text: string) {
    const certs = [];
    const certKeywords = [
        { name: 'AWS Solutions Architect', issuer: 'Amazon' },
        { name: 'AWS Developer', issuer: 'Amazon' },
        { name: 'Kubernetes Administrator', issuer: 'CNCF' },
    ];

    const textLower = text.toLowerCase();
    for (const cert of certKeywords) {
        if (textLower.includes(cert.name.toLowerCase())) {
            certs.push({ ...cert, date: "2023", expiry: null });
        }
    }
    return certs;
}

function extractSummary(text: string): string | null {
    const match = text.match(/summary\s*:?\s*\n?([^\n]{50,300})/i);
    return match ? match[1].trim() : null;
}

function determineDomain(skills: string[], textLower: string): string {
    if (skills.some(s => ['Machine Learning', 'AI', 'Deep Learning'].includes(s))) {
        return 'Machine Learning / AI';
    }
    if (skills.some(s => ['React', 'Vue', 'Angular'].includes(s)) &&
        skills.some(s => ['Node.js', 'Python', 'Java'].includes(s))) {
        return 'Full Stack Development';
    }
    if (skills.some(s => ['AWS', 'Azure', 'GCP', 'Kubernetes'].includes(s))) {
        return 'Cloud / DevOps';
    }
    return 'Software Engineering';
}
