'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, Upload } from 'lucide-react';
import ChatInterface from '@/components/ChatInterface';
import type { ParsedResume } from '@/lib/types';

export default function ChatPage() {
    const [userProfile] = useState<ParsedResume>({
        personal_info: {
            name: "Demo User",
            email: "demo@example.com",
            phone: null,
            location: "San Francisco, CA",
            linkedin: null
        },
        summary: "Full-stack software engineer with 5+ years of experience building scalable web applications.",
        skills: {
            technical: ["Python", "JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL", "AWS", "Docker"],
            soft: ["Problem Solving", "Team Leadership", "Communication"],
            tools: ["Git", "VS Code", "Jira"],
            languages: ["Python", "JavaScript", "SQL"]
        },
        experience: [
            {
                title: "Senior Software Engineer",
                company: "TechCorp",
                location: "San Francisco, CA",
                start_date: "2021-01",
                end_date: "Present",
                duration_months: 36,
                responsibilities: ["Led development of microservices", "Mentored junior engineers"],
                achievements: ["Reduced API latency by 40%", "Led team of 5 engineers"]
            }
        ],
        education: [
            {
                degree: "B.S. Computer Science",
                field: "Computer Science",
                institution: "Stanford University",
                graduation_year: "2018",
                gpa: "3.8"
            }
        ],
        certifications: [
            { name: "AWS Solutions Architect Associate", issuer: "Amazon", date: "2023", expiry: "2026" }
        ],
        projects: [],
        total_experience_years: 5,
        career_level: "Senior",
        primary_domain: "Software Engineering"
    });

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
                        href="/dashboard"
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        Dashboard
                    </Link>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white transition-colors">
                        <Upload className="w-4 h-4" />
                        Upload Resume
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <div className="relative z-10 max-w-4xl mx-auto px-8 py-8">
                {/* Profile Summary Card */}
                <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white">
                            {userProfile.personal_info.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h2 className="font-semibold text-white">{userProfile.personal_info.name}</h2>
                            <p className="text-sm text-gray-400">
                                {userProfile.career_level} {userProfile.primary_domain} • {userProfile.total_experience_years} years exp
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 max-w-md">
                        {userProfile.skills.technical.slice(0, 5).map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded-lg">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Chat Interface */}
                <ChatInterface userProfile={userProfile} />

                {/* Tips */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        💡 Try asking: &quot;What skills should I learn?&quot; or &quot;Create a 12-week career roadmap&quot;
                    </p>
                </div>
            </div>
        </main>
    );
}
