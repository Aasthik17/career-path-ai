// Type definitions for CareerPath AI

export interface PersonalInfo {
    name: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
    linkedin: string | null;
}

export interface Skills {
    technical: string[];
    soft: string[];
    tools: string[];
    languages: string[];
}

export interface Experience {
    title: string;
    company: string;
    location: string;
    start_date: string;
    end_date: string;
    duration_months: number;
    responsibilities: string[];
    achievements: string[];
}

export interface Education {
    degree: string;
    field: string;
    institution: string;
    graduation_year: string;
    gpa: string | null;
}

export interface Certification {
    name: string;
    issuer: string;
    date: string;
    expiry: string | null;
}

export interface Project {
    name: string;
    description: string;
    technologies: string[];
    url: string | null;
}

export interface ATSScore {
    overall: number;
    breakdown: {
        keywords: number;
        formatting: number;
        experience: number;
        skills: number;
        education: number;
    };
    suggestions: string[];
}

export interface ParsedResume {
    personal_info: PersonalInfo;
    summary: string;
    skills: Skills;
    experience: Experience[];
    education: Education[];
    certifications: Certification[];
    projects: Project[];
    total_experience_years: number;
    career_level: 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Executive';
    primary_domain: string;
    ats_score?: ATSScore;
}

export interface CareerPath {
    title: string;
    description: string;
    alignment_score: number;
    timeline_months: number;
    salary_range?: string;
    reasoning: string;
}

export interface SkillGap {
    existing_valuable: string[];
    missing_critical: string[];
    nice_to_have: string[];
}

export interface RoadmapWeek {
    week: number;
    focus: string;
    tasks: string[];
    resources: string[];
    time_hours: number;
    milestone?: string;
}

export interface Resource {
    name: string;
    platform?: string;
    url?: string;
    duration?: string;
    description?: string;
}

export interface EthicalEvaluation {
    bias_assessment: {
        overall_risk: 'low' | 'medium' | 'high';
        checks: {
            name: string;
            status: 'pass' | 'warning' | 'fail';
            description: string;
        }[];
    };
    fairness_metrics: {
        demographic_parity: number;
        equal_opportunity: number;
        diversity_score: number;
    };
    transparency: {
        data_sources_disclosed: boolean;
        model_limitations_stated: boolean;
        confidence_provided: boolean;
        human_review_recommended: boolean;
    };
    recommendations: string[];
}

export interface Explainability {
    source_quotes: {
        text: string;
        source: string;
        relevance: string;
    }[];
    reasoning_steps: string[];
    ethical_evaluation?: EthicalEvaluation;
}

export interface CareerRoadmap {
    current_analysis: {
        strengths: string[];
        experience_level: string;
        primary_domain: string;
        notable_achievements?: string[];
    };
    career_paths: CareerPath[];
    skill_gaps: SkillGap;
    roadmap: RoadmapWeek[];
    resources: {
        courses: Resource[];
        certifications: Resource[];
        projects: Resource[];
        communities: Resource[];
    };
    explainability: Explainability;
    confidence_score: number;
    limitations?: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    sources?: {
        content: string;
        source: string;
    }[];
    roadmap?: CareerRoadmap;
}

export interface User {
    id: string;
    email: string;
    name?: string;
    profile?: ParsedResume;
}
