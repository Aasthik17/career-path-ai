import { NextResponse } from 'next/server';

/**
 * Resume Parser API - Local Mode
 * Simulates the Lambda function behavior for local development
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

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Parse the resume locally
        const parsedResume = parseResumeLocally(resume_text);

        return NextResponse.json({
            resumeText: resume_text,
            parsedResume,
            mode: 'local'
        });
    } catch (error) {
        console.error('Parse resume error:', error);
        return NextResponse.json(
            { error: 'Failed to parse resume' },
            { status: 500 }
        );
    }
}

interface ParsedResume {
    personal_info: {
        name: string;
        email: string | null;
        phone: string | null;
        location: string;
        linkedin: string | null;
    };
    summary: string;
    skills: {
        technical: string[];
        soft: string[];
        tools: string[];
        languages: string[];
    };
    experience: Array<{
        title: string;
        company: string;
        location: string;
        start_date: string;
        end_date: string;
        duration_months: number;
        responsibilities: string[];
        achievements: string[];
    }>;
    education: Array<{
        degree: string;
        field: string;
        institution: string;
        graduation_year: string;
        gpa: string | null;
    }>;
    certifications: Array<{
        name: string;
        issuer: string;
        date: string;
        expiry: string | null;
    }>;
    projects: Array<{
        name: string;
        description: string;
        technologies: string[];
        url: string | null;
    }>;
    total_experience_years: number;
    career_level: string;
    primary_domain: string;
}

function parseResumeLocally(text: string): ParsedResume {
    const textLower = text.toLowerCase();

    // Extract name (first non-empty line that looks like a name)
    const lines = text.split('\n').filter(l => l.trim());
    const name = extractName(lines);

    // Extract email
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    const email = emailMatch ? emailMatch[0] : null;

    // Extract phone
    const phoneMatch = text.match(/\+?[\d\s()-]{10,}/);
    const phone = phoneMatch ? phoneMatch[0].trim() : null;

    // Extract location
    const location = extractLocation(text) || "Not specified";

    // Extract LinkedIn
    const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
    const linkedin = linkedinMatch ? `https://${linkedinMatch[0]}` : null;

    // Extract skills
    const skills = extractSkills(text);

    // Extract experience
    const experience = extractExperience(text);

    // Extract education
    const education = extractEducation(text);

    // Extract certifications
    const certifications = extractCertifications(text);

    // Calculate total experience
    const totalYears = experience.reduce((sum, exp) => sum + exp.duration_months, 0) / 12;

    // Determine career level
    let careerLevel = 'Entry';
    if (totalYears >= 8) careerLevel = 'Staff/Principal';
    else if (totalYears >= 5) careerLevel = 'Senior';
    else if (totalYears >= 2) careerLevel = 'Mid';

    // Determine primary domain
    const domain = determineDomain(skills.technical, textLower);

    // Extract summary
    const summary = extractSummary(text) ||
        `${careerLevel} professional with experience in ${domain}`;

    return {
        personal_info: {
            name,
            email,
            phone,
            location,
            linkedin
        },
        summary,
        skills,
        experience,
        education,
        certifications,
        projects: [],
        total_experience_years: Math.round(totalYears * 10) / 10,
        career_level: careerLevel,
        primary_domain: domain
    };
}

function extractName(lines: string[]): string {
    // First line is often the name
    const firstLine = lines[0]?.trim() || '';
    // Check if it looks like a name (2-4 words, no special chars except spaces)
    if (/^[A-Za-z\s]{2,50}$/.test(firstLine) && firstLine.split(' ').length <= 4) {
        return firstLine;
    }
    return "Anonymous User";
}

function extractLocation(text: string): string | null {
    const locationPatterns = [
        /(?:located?\s+in|based\s+in|from)\s+([A-Za-z\s,]+)/i,
        /([A-Za-z]+,\s*[A-Z]{2})/,
        /(San Francisco|New York|Los Angeles|Seattle|Austin|Boston|Chicago|Denver|Atlanta|Portland)/i
    ];

    for (const pattern of locationPatterns) {
        const match = text.match(pattern);
        if (match) return match[1].trim();
    }
    return null;
}

function extractSkills(text: string): { technical: string[]; soft: string[]; tools: string[]; languages: string[] } {
    const techKeywords = [
        'Python', 'JavaScript', 'TypeScript', 'Java', 'Go', 'Rust', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin',
        'React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask', 'FastAPI', 'Spring',
        'AWS', 'Azure', 'GCP', 'Kubernetes', 'Docker', 'Terraform', 'CloudFormation',
        'PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'SQL', 'DynamoDB', 'Elasticsearch',
        'Machine Learning', 'AI', 'Deep Learning', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision',
        'REST', 'GraphQL', 'gRPC', 'Microservices', 'API Design',
        'CI/CD', 'DevOps', 'Agile', 'Scrum', 'Git', 'Linux'
    ];

    const softSkills = [
        'Leadership', 'Communication', 'Problem Solving', 'Teamwork', 'Critical Thinking',
        'Project Management', 'Time Management', 'Mentoring', 'Collaboration', 'Adaptability'
    ];

    const tools = [
        'Git', 'GitHub', 'GitLab', 'Jira', 'Confluence', 'Slack', 'VS Code', 'IntelliJ',
        'Jenkins', 'CircleCI', 'GitHub Actions', 'Datadog', 'Splunk', 'New Relic'
    ];

    const textLower = text.toLowerCase();

    return {
        technical: techKeywords.filter(skill => textLower.includes(skill.toLowerCase())),
        soft: softSkills.filter(skill => textLower.includes(skill.toLowerCase())),
        tools: tools.filter(tool => textLower.includes(tool.toLowerCase())),
        languages: ['English'] // Default
    };
}

function extractExperience(text: string): ParsedResume['experience'] {
    const experiences: ParsedResume['experience'] = [];

    // Look for common patterns
    const expPatterns = [
        /(?:senior\s+)?(?:software\s+)?engineer(?:ing)?/gi,
        /developer/gi,
        /manager/gi,
        /lead/gi,
        /architect/gi
    ];

    // Simple extraction - in real implementation would be more sophisticated
    const hasExp = expPatterns.some(p => p.test(text));

    if (hasExp) {
        // Extract year ranges
        const yearRanges = text.match(/20\d{2}\s*[-–]\s*(?:20\d{2}|Present|Current)/gi) || [];

        experiences.push({
            title: "Software Engineer",
            company: "Company",
            location: "Location",
            start_date: "2020-01",
            end_date: "Present",
            duration_months: 36,
            responsibilities: ["Developed software applications"],
            achievements: ["Delivered projects on time"]
        });
    }

    return experiences;
}

function extractEducation(text: string): ParsedResume['education'] {
    const education: ParsedResume['education'] = [];
    const textLower = text.toLowerCase();

    const degrees = ['B.S.', 'B.A.', 'M.S.', 'M.A.', 'Ph.D.', 'Bachelor', 'Master', 'MBA'];
    const fields = ['Computer Science', 'Computer Engineering', 'Software Engineering',
        'Information Technology', 'Data Science', 'Mathematics', 'Physics'];

    const hasDegree = degrees.some(d => textLower.includes(d.toLowerCase()));
    const field = fields.find(f => textLower.includes(f.toLowerCase())) || 'Computer Science';

    if (hasDegree) {
        education.push({
            degree: "Bachelor's Degree",
            field,
            institution: "University",
            graduation_year: "2020",
            gpa: null
        });
    }

    return education;
}

function extractCertifications(text: string): ParsedResume['certifications'] {
    const certs: ParsedResume['certifications'] = [];
    const textLower = text.toLowerCase();

    const certKeywords = [
        { name: 'AWS Solutions Architect', issuer: 'Amazon' },
        { name: 'AWS Developer', issuer: 'Amazon' },
        { name: 'AWS Cloud Practitioner', issuer: 'Amazon' },
        { name: 'Google Cloud Professional', issuer: 'Google' },
        { name: 'Azure Administrator', issuer: 'Microsoft' },
        { name: 'Kubernetes Administrator', issuer: 'CNCF' },
        { name: 'PMP', issuer: 'PMI' }
    ];

    for (const cert of certKeywords) {
        if (textLower.includes(cert.name.toLowerCase())) {
            certs.push({
                name: cert.name,
                issuer: cert.issuer,
                date: "2023",
                expiry: null
            });
        }
    }

    return certs;
}

function extractSummary(text: string): string | null {
    const summaryPatterns = [
        /summary\s*:?\s*\n?([^\n]{50,300})/i,
        /professional\s+summary\s*:?\s*\n?([^\n]{50,300})/i,
        /about\s*:?\s*\n?([^\n]{50,300})/i
    ];

    for (const pattern of summaryPatterns) {
        const match = text.match(pattern);
        if (match) return match[1].trim();
    }
    return null;
}

function determineDomain(skills: string[], textLower: string): string {
    if (skills.some(s => ['Machine Learning', 'AI', 'Deep Learning', 'TensorFlow', 'PyTorch'].includes(s))) {
        return 'Machine Learning / AI';
    }
    if (skills.some(s => ['React', 'Vue', 'Angular', 'Next.js'].includes(s)) &&
        skills.some(s => ['Node.js', 'Python', 'Java'].includes(s))) {
        return 'Full Stack Development';
    }
    if (skills.some(s => ['AWS', 'Azure', 'GCP', 'Kubernetes', 'Terraform'].includes(s))) {
        return 'Cloud / DevOps';
    }
    if (skills.some(s => ['React', 'Vue', 'Angular'].includes(s))) {
        return 'Frontend Development';
    }
    if (skills.some(s => ['Node.js', 'Python', 'Java', 'Go'].includes(s))) {
        return 'Backend Development';
    }
    return 'Software Engineering';
}
