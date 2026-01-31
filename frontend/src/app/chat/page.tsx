'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Upload, RefreshCw } from 'lucide-react';
import ChatInterface from '@/components/ChatInterface';
import type { ParsedResume } from '@/lib/types';

export default function ChatPage() {
    const [userProfile, setUserProfile] = useState<ParsedResume | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user profile from localStorage on mount
    useEffect(() => {
        const loadProfile = () => {
            if (typeof window !== 'undefined') {
                const savedResume = localStorage.getItem('careerpath_resume');
                if (savedResume) {
                    try {
                        const parsed = JSON.parse(savedResume) as ParsedResume;
                        setUserProfile(parsed);
                    } catch (e) {
                        console.error('Failed to parse saved resume:', e);
                    }
                }
            }
            setIsLoading(false);
        };

        loadProfile();
    }, []);

    // Reload profile from localStorage
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

    // Get validated profile data
    const getName = (): string => {
        const name = userProfile?.personal_info?.name;
        return isValidValue(name) ? String(name) : 'Your Profile';
    };

    const getExperience = () => {
        const exp = userProfile?.total_experience_years;
        return typeof exp === 'number' && !isNaN(exp) ? `${exp} years exp` : '';
    };

    const getCareerInfo = () => {
        const level = userProfile?.career_level;
        const domain = userProfile?.primary_domain;
        const parts: string[] = [];
        if (isValidValue(level)) parts.push(level as string);
        if (isValidValue(domain)) parts.push(domain as string);
        return parts.join(' ');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800" />
            </div>
        );
    }

    const validSkills = getValidSkills(userProfile?.skills?.technical);

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
            {/* Background effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-800/10 via-transparent to-transparent rounded-full blur-3xl" />
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-800/10 via-transparent to-transparent rounded-full blur-3xl" />
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
                        <Image
                            src="/logo.png"
                            alt="CareerPath AI Logo"
                            width={32}
                            height={32}
                            className="object-contain"
                        />
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
                    <Link
                        href="/#upload"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white transition-colors"
                    >
                        <Upload className="w-4 h-4" />
                        Upload Resume
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <div className="relative z-10 max-w-4xl mx-auto px-8 py-8">
                {/* Profile Summary Card */}
                {userProfile ? (
                    <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-800 to-blue-900 flex items-center justify-center text-xl font-bold text-white">
                                {getName().charAt(0)}
                            </div>
                            <div>
                                <h2 className="font-semibold text-white">{getName()}</h2>
                                <p className="text-sm text-gray-400">
                                    {getCareerInfo()}{getExperience() && ` • ${getExperience()}`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex flex-wrap gap-2 max-w-md">
                                {validSkills.length > 0 ? (
                                    validSkills.slice(0, 5).map((skill, idx) => (
                                        <span key={idx} className="px-2 py-1 text-xs bg-blue-800/20 text-amber-300 rounded-lg">
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-gray-500">No skills extracted</span>
                                )}
                            </div>
                            <button
                                onClick={refreshProfile}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                                title="Refresh profile"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6 mb-6 text-center">
                        <p className="text-gray-400 mb-4">No resume uploaded yet. Upload your resume to get personalized advice!</p>
                        <Link
                            href="/#upload"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-900 to-blue-900 rounded-lg text-white"
                        >
                            <Upload className="w-4 h-4" />
                            Upload Resume
                        </Link>
                    </div>
                )}

                {/* Chat Interface - passes actual user profile */}
                <ChatInterface userProfile={userProfile || undefined} />

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
