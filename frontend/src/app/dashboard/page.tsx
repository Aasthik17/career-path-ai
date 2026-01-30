'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Sparkles,
    ArrowLeft,
    MessageSquare,
    TrendingUp,
    Award,
    Briefcase,
    GraduationCap,
    Target,
    Upload,
    RefreshCw,
    FileCheck
} from 'lucide-react';
import SkillGapChart from '@/components/SkillGapChart';
import RoadmapTimeline from '@/components/RoadmapTimeline';
import ResumeAnnotationModal from '@/components/ResumeAnnotationModal';
import EthicalXAIPanel from '@/components/EthicalXAIPanel';
import type { ParsedResume } from '@/lib/types';

export default function DashboardPage() {
    const [targetRole, setTargetRole] = useState('Senior Software Engineer');
    const [userProfile, setUserProfile] = useState<ParsedResume | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnnotationModalOpen, setIsAnnotationModalOpen] = useState(false);
    const [resumeText, setResumeText] = useState('');

    // Load user profile from localStorage on mount
    useEffect(() => {
        const loadProfile = () => {
            if (typeof window !== 'undefined') {
                const savedResume = localStorage.getItem('careerpath_resume');
                const savedResumeText = localStorage.getItem('careerpath_resume_text');
                console.log('Dashboard: Loading from localStorage:', savedResume ? 'Found data' : 'No data');
                if (savedResume) {
                    try {
                        const parsed = JSON.parse(savedResume) as ParsedResume;
                        console.log('Dashboard: Parsed profile:', parsed);
                        console.log('Dashboard: Skills:', parsed?.skills?.technical);
                        setUserProfile(parsed);
                    } catch (e) {
                        console.error('Failed to parse saved resume:', e);
                    }
                }
                if (savedResumeText) {
                    setResumeText(savedResumeText);
                }
            }
            setIsLoading(false);
        };

        loadProfile();
    }, []);

    const refreshProfile = () => {
        if (typeof window !== 'undefined') {
            const savedResume = localStorage.getItem('careerpath_resume');
            if (savedResume) {
                setUserProfile(JSON.parse(savedResume));
            }
        }
    };

    // Helper to check if a value is valid (not placeholder text)
    const isValidValue = (val: unknown): boolean => {
        if (val === null || val === undefined) return false;
        const str = String(val).toLowerCase();
        const placeholders = ['full name', 'list of', '<', '>', 'actual', 'extract', 'placeholder', 'example', 'number'];
        return !placeholders.some(p => str.includes(p)) && str.length > 0 && str.length < 100;
    };

    // Helper to get valid skills (filter out placeholder text)
    const getValidSkills = (skills: string[] | undefined): string[] => {
        if (!skills || !Array.isArray(skills)) return [];
        return skills.filter(skill =>
            skill &&
            typeof skill === 'string' &&
            skill.length > 0 &&
            skill.length < 50 &&
            !skill.toLowerCase().includes('list of') &&
            !skill.toLowerCase().includes('<') &&
            !skill.toLowerCase().includes('actual')
        );
    };

    // Extract data from profile with proper validation
    const rawSkills = userProfile?.skills?.technical;
    const userSkills = getValidSkills(rawSkills).length > 0
        ? getValidSkills(rawSkills)
        : ['Upload resume to see skills'];

    const rawName = userProfile?.personal_info?.name;
    const userName = isValidValue(rawName) ? rawName : 'User';

    const rawCareerLevel = userProfile?.career_level;
    const careerLevel = isValidValue(rawCareerLevel) ? rawCareerLevel : 'Mid';

    const rawExpYears = userProfile?.total_experience_years;
    const experienceYears = typeof rawExpYears === 'number' && !isNaN(rawExpYears) && rawExpYears >= 0
        ? rawExpYears
        : 3;

    const certCount = Array.isArray(userProfile?.certifications) ? userProfile.certifications.length : 0;

    const roleOptions = [
        'Senior Software Engineer',
        'Machine Learning Engineer',
        'Full Stack Developer',
        'Engineering Manager',
        'Staff Engineer',
    ];

    // Calculate readiness based on skills
    const calculateReadiness = () => {
        const validSkillCount = userSkills[0] === 'Upload resume to see skills' ? 0 : userSkills.length;
        const baseReadiness = Math.min(95, 50 + validSkillCount * 5 + experienceYears * 3);
        return Math.round(baseReadiness);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
            </div>
        );
    }

    return (
        <>
            <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
                {/* Background effects */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent rounded-full blur-3xl" />
                    <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/10 via-transparent to-transparent rounded-full blur-3xl" />
                </div>

                {/* Navigation */}
                <nav className="relative z-10 flex items-center justify-between px-8 py-4 border-b border-gray-800/50 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </Link>
                        <div className="h-6 w-px bg-gray-700" />
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold text-white">CareerPath AI</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={refreshProfile}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                            title="Refresh data"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <Link
                            href="/chat"
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 rounded-lg text-white transition-all"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Chat with AI
                        </Link>
                    </div>
                </nav>

                {/* Main Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-8 py-8">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                {userProfile ? `${userName}'s Career Dashboard` : 'Career Dashboard'}
                            </h1>
                            <p className="text-gray-400">
                                {userProfile
                                    ? `Tracking your progress as a ${careerLevel} professional`
                                    : 'Upload your resume to see personalized insights'}
                            </p>
                        </div>
                        {!userProfile && (
                            <Link
                                href="/#upload"
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg text-white"
                            >
                                <Upload className="w-4 h-4" />
                                Upload Resume
                            </Link>
                        )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-5 gap-4 mb-8">
                        {/* ATS Score Card - Clickable for analysis */}
                        <div
                            onClick={() => resumeText && setIsAnnotationModalOpen(true)}
                            className={`bg-gradient-to-br from-emerald-900/40 to-emerald-950/40 border border-emerald-700/50 rounded-xl p-4 hover:border-emerald-500 transition-all ${resumeText ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <FileCheck className="w-5 h-5 text-emerald-500" />
                                <span className="text-sm text-gray-400">ATS Score</span>
                            </div>
                            <p className={`text-2xl font-bold ${(userProfile?.ats_score?.overall || 0) >= 80 ? 'text-emerald-400' :
                                (userProfile?.ats_score?.overall || 0) >= 60 ? 'text-yellow-400' : 'text-orange-400'
                                }`}>
                                {userProfile?.ats_score?.overall || '--'}<span className="text-lg text-gray-500">/100</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {resumeText ? 'Click for details' : 'Upload resume'}
                            </p>
                        </div>

                        {[
                            { icon: Target, label: 'Career Readiness', value: `${calculateReadiness()}%`, color: 'cyan' },
                            { icon: TrendingUp, label: 'Skills Matched', value: `${Math.min(userSkills.length, 12)}/12`, color: 'purple' },
                            { icon: Award, label: 'Certifications', value: String(certCount), color: 'pink' },
                            { icon: Briefcase, label: 'Experience', value: `${experienceYears} yrs`, color: 'orange' },
                        ].map((stat, idx) => (
                            <div
                                key={idx}
                                className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 hover:border-gray-600 transition-all"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                                    <span className="text-sm text-gray-400">{stat.label}</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Target Role Selector */}
                    <div className="mb-8 flex items-center gap-4">
                        <label className="text-gray-400">Target Role:</label>
                        <select
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        >
                            {roleOptions.map((role) => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>

                    {/* Main Dashboard Grid */}
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Skill Gap Chart - uses actual user skills */}
                        <SkillGapChart userSkills={userSkills} targetRole={targetRole} />

                        {/* Career Roadmap */}
                        <RoadmapTimeline currentWeek={1} />
                    </div>

                    {/* AI Ethics & Transparency Panel */}
                    <div className="mt-8">
                        <EthicalXAIPanel userProfile={userProfile} />
                    </div>

                    {/* Profile Summary */}
                    <div className="mt-8 grid md:grid-cols-3 gap-6">
                        {/* Current Skills */}
                        <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
                            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-cyan-500" />
                                Your Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {userSkills.length > 0 ? (
                                    userSkills.map((skill, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1.5 text-sm bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-gray-200 rounded-lg border border-gray-700"
                                        >
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm">Upload resume to see skills</p>
                                )}
                            </div>
                        </div>

                        {/* Recommended Certifications */}
                        <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
                            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-purple-500" />
                                Recommended Certs
                            </h3>
                            <ul className="space-y-2">
                                {(() => {
                                    // Get user's existing skills (lowercase for comparison)
                                    const existingSkills = userSkills.map(s => s.toLowerCase());
                                    const hasSkill = (skill: string) => existingSkills.some(s => s.includes(skill.toLowerCase()));

                                    // Certification recommendations based on skill gaps
                                    const certMap = [
                                        { name: 'AWS Solutions Architect Pro', skill: 'aws', domain: 'cloud' },
                                        { name: 'AWS Developer Associate', skill: 'aws', domain: 'cloud' },
                                        { name: 'Google Cloud Professional', skill: 'gcp', domain: 'cloud' },
                                        { name: 'Azure Solutions Architect', skill: 'azure', domain: 'cloud' },
                                        { name: 'Kubernetes Administrator (CKA)', skill: 'kubernetes', domain: 'devops' },
                                        { name: 'Docker Certified Associate', skill: 'docker', domain: 'devops' },
                                        { name: 'Terraform Associate', skill: 'terraform', domain: 'devops' },
                                        { name: 'TensorFlow Developer', skill: 'tensorflow', domain: 'ml' },
                                        { name: 'AWS Machine Learning Specialty', skill: 'machine learning', domain: 'ml' },
                                        { name: 'MongoDB Developer', skill: 'mongodb', domain: 'database' },
                                        { name: 'PostgreSQL Professional', skill: 'postgresql', domain: 'database' },
                                    ];

                                    // Determine user's domain focus
                                    const domain = userProfile?.primary_domain?.toLowerCase() || '';
                                    const isML = domain.includes('ml') || domain.includes('machine') || hasSkill('tensorflow') || hasSkill('pytorch');
                                    const isCloud = domain.includes('cloud') || hasSkill('aws') || hasSkill('azure') || hasSkill('gcp');
                                    const isDevOps = domain.includes('devops') || hasSkill('kubernetes') || hasSkill('docker');

                                    // Filter and prioritize certifications
                                    const recommendations = certMap
                                        .filter(cert => {
                                            // Skip if user already has the skill
                                            if (hasSkill(cert.skill)) return true; // Keep to show as "Already skilled"
                                            return true;
                                        })
                                        .map(cert => ({
                                            ...cert,
                                            priority: hasSkill(cert.skill)
                                                ? 'Skilled'
                                                : (cert.domain === 'ml' && isML) ||
                                                    (cert.domain === 'cloud' && isCloud) ||
                                                    (cert.domain === 'devops' && isDevOps)
                                                    ? 'High'
                                                    : 'Medium'
                                        }))
                                        .filter(cert => cert.priority !== 'Skilled')
                                        .slice(0, 3);

                                    return recommendations.length > 0 ? recommendations.map((cert, idx) => (
                                        <li key={idx} className="flex items-center justify-between text-sm">
                                            <span className="text-gray-300">{cert.name}</span>
                                            <span className={`px-2 py-0.5 rounded text-xs ${cert.priority === 'High'
                                                ? 'bg-orange-500/20 text-orange-400'
                                                : 'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                {cert.priority}
                                            </span>
                                        </li>
                                    )) : (
                                        <li className="text-gray-500 text-sm">Upload resume for personalized recommendations</li>
                                    );
                                })()}
                            </ul>
                        </div>

                        {/* Job Matches */}
                        <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
                            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-pink-500" />
                                Top Job Matches
                            </h3>
                            <ul className="space-y-3">
                                {(() => {
                                    // Get user's existing skills (lowercase for comparison)
                                    const existingSkills = userSkills.map(s => s.toLowerCase());
                                    const hasSkill = (skill: string) => existingSkills.some(s => s.includes(skill.toLowerCase()));

                                    // Determine next career level
                                    const nextLevel = careerLevel === 'Entry' ? 'Mid-Level' :
                                        careerLevel === 'Mid' ? 'Senior' :
                                            careerLevel === 'Senior' ? 'Staff' : 'Principal';

                                    // Determine role type based on skills and domain
                                    const domain = userProfile?.primary_domain?.toLowerCase() || '';
                                    const isML = domain.includes('ml') || domain.includes('machine') || hasSkill('tensorflow') || hasSkill('pytorch');
                                    const isFrontend = hasSkill('react') || hasSkill('vue') || hasSkill('angular') || domain.includes('frontend');
                                    const isBackend = hasSkill('node') || hasSkill('python') || hasSkill('java') || hasSkill('go') || domain.includes('backend');
                                    const isFullStack = isFrontend && isBackend;
                                    const isDevOps = hasSkill('kubernetes') || hasSkill('docker') || hasSkill('terraform') || domain.includes('devops');
                                    const isCloud = hasSkill('aws') || hasSkill('azure') || hasSkill('gcp') || domain.includes('cloud');

                                    // Generate role title based on user's profile
                                    const getRoleTitle = () => {
                                        if (isML) return 'ML Engineer';
                                        if (isFullStack) return 'Full Stack Engineer';
                                        if (isDevOps) return 'Platform/DevOps Engineer';
                                        if (isCloud) return 'Cloud Engineer';
                                        if (isFrontend) return 'Frontend Engineer';
                                        if (isBackend) return 'Backend Engineer';
                                        return 'Software Engineer';
                                    };

                                    // Calculate match percentage based on skill count and experience
                                    const baseMatch = Math.min(40 + (userSkills.length * 4) + (experienceYears * 2), 95);

                                    // Generate job matches
                                    const jobs = [
                                        {
                                            title: `${nextLevel} ${getRoleTitle()}`,
                                            company: isML ? 'AI Startup' : isCloud ? 'Cloud Provider' : 'Tech Company',
                                            match: baseMatch
                                        },
                                        {
                                            title: getRoleTitle(),
                                            company: 'Fortune 500',
                                            match: Math.max(baseMatch - 5, 60)
                                        },
                                        {
                                            title: isDevOps ? 'Site Reliability Engineer' : isML ? 'Data Scientist' : 'Software Engineer',
                                            company: 'High-Growth Startup',
                                            match: Math.max(baseMatch - 10, 55)
                                        },
                                    ];

                                    return userSkills[0] === 'Upload resume to see skills' ? (
                                        <li className="text-gray-500 text-sm">Upload resume for personalized job matches</li>
                                    ) : jobs.map((job, idx) => (
                                        <li key={idx} className="flex items-center justify-between">
                                            <span className="text-sm text-gray-300">{job.title} @ {job.company}</span>
                                            <span className="text-sm font-medium text-green-400">{job.match}%</span>
                                        </li>
                                    ));
                                })()}
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            {/* Resume Annotation Modal */}
            <ResumeAnnotationModal
                isOpen={isAnnotationModalOpen}
                onClose={() => setIsAnnotationModalOpen(false)}
                resumeText={resumeText}
            />
        </>
    );
}
