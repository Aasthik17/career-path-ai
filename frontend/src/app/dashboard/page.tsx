'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Sparkles,
    ArrowLeft,
    MessageSquare,
    TrendingUp,
    Award,
    Briefcase,
    GraduationCap,
    Target
} from 'lucide-react';
import SkillGapChart from '@/components/SkillGapChart';
import RoadmapTimeline from '@/components/RoadmapTimeline';

export default function DashboardPage() {
    const [targetRole, setTargetRole] = useState('Senior Software Engineer');

    // Demo user data
    const userSkills = ['Python', 'JavaScript', 'React', 'Node.js', 'AWS', 'Docker', 'PostgreSQL'];
    const careerLevel = 'Mid-Senior';
    const experienceYears = 5;

    const roleOptions = [
        'Senior Software Engineer',
        'Machine Learning Engineer',
        'Full Stack Developer',
        'Engineering Manager',
        'Staff Engineer',
    ];

    return (
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Career Dashboard</h1>
                    <p className="text-gray-400">Track your progress and explore career opportunities</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    {[
                        { icon: Target, label: 'Career Readiness', value: '72%', color: 'cyan' },
                        { icon: TrendingUp, label: 'Skills Matched', value: '8/12', color: 'purple' },
                        { icon: Award, label: 'Certifications', value: '2', color: 'pink' },
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
                    {/* Skill Gap Chart */}
                    <SkillGapChart userSkills={userSkills} targetRole={targetRole} />

                    {/* Career Roadmap */}
                    <RoadmapTimeline currentWeek={1} />
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
                            {userSkills.map((skill, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1.5 text-sm bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-gray-200 rounded-lg border border-gray-700"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Recommended Certifications */}
                    <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5 text-purple-500" />
                            Recommended Certs
                        </h3>
                        <ul className="space-y-2">
                            {[
                                { name: 'AWS Solutions Architect Pro', priority: 'High' },
                                { name: 'Kubernetes Administrator (CKA)', priority: 'Medium' },
                                { name: 'Terraform Associate', priority: 'Medium' },
                            ].map((cert, idx) => (
                                <li key={idx} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-300">{cert.name}</span>
                                    <span className={`px-2 py-0.5 rounded text-xs ${cert.priority === 'High'
                                            ? 'bg-orange-500/20 text-orange-400'
                                            : 'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {cert.priority}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Job Matches */}
                    <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-pink-500" />
                            Top Job Matches
                        </h3>
                        <ul className="space-y-3">
                            {[
                                { title: 'Senior SWE @ TechCorp', match: 92 },
                                { title: 'Staff Engineer @ StartupXYZ', match: 87 },
                                { title: 'ML Engineer @ AI Labs', match: 78 },
                            ].map((job, idx) => (
                                <li key={idx} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-300">{job.title}</span>
                                    <span className="text-sm font-medium text-green-400">{job.match}%</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
}
