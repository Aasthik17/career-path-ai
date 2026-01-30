'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Upload,
  MessageSquare,
  BarChart3,
  Map,
  ArrowRight,
  CheckCircle2,
  Zap,
  Brain,
  Target
} from 'lucide-react';
import ResumeUpload from '@/components/ResumeUpload';
import type { ParsedResume } from '@/lib/types';

export default function Home() {
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);

  const handleResumeUpload = (data: { resumeText: string; parsedResume: Record<string, unknown> }) => {
    console.log('Resume upload received:', data);
    const parsed = data.parsedResume as unknown as ParsedResume;
    console.log('Parsed resume:', parsed);
    console.log('Skills:', parsed?.skills?.technical);

    setParsedResume(parsed);
    setResumeUploaded(true);

    // Save to localStorage for use in chat and dashboard pages
    if (typeof window !== 'undefined') {
      localStorage.setItem('careerpath_resume', JSON.stringify(parsed));
      localStorage.setItem('careerpath_resume_text', data.resumeText);
      console.log('Saved to localStorage');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-hidden">
      {/* Enhanced animated background with waves and glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Purple glow orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-purple-500/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-700/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-[100px]" />

        {/* Animated wave SVG background */}
        <svg
          className="absolute bottom-0 left-0 w-full h-1/2 opacity-30"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path
            fill="url(#waveGradient)"
            d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
        <svg
          className="absolute bottom-0 left-0 w-full h-1/3 opacity-20"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="#a855f7"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,234.7C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>

        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-purple-400/40 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-purple-300/30 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }} />
        <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-fuchsia-400/40 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-4 border-b border-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="CareerPath AI Logo"
            width={48}
            height={48}
            className="object-contain"
          />
          <span className="text-xl font-bold text-white">CareerPath AI</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/chat" className="text-gray-400 hover:text-white transition-colors">
            Chat
          </Link>
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
            Dashboard
          </Link>
          <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-600 hover:from-purple-500 hover:to-purple-500 rounded-lg text-white font-medium transition-all shadow-lg shadow-purple-500/20">
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-8 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-full border border-gray-700 mb-6">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-300">Powered by Amazon Bedrock</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-white">Your AI-Powered</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-400 to-pink-400">
              Career Mentor
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Upload your resume and get personalized career guidance, skill gap analysis,
            and a week-by-week roadmap to reach your career goals.
          </p>

          <div className="flex justify-center gap-4 mb-12">
            <Link
              href="#upload"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-600 hover:from-purple-500 hover:to-purple-500 rounded-xl text-white font-semibold text-lg transition-all shadow-lg shadow-purple-500/30 flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/chat"
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white font-semibold text-lg transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              Try Chat Demo
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-20">
          {[
            { icon: Upload, title: 'Resume Analysis', desc: 'AI extracts skills, experience, and certifications' },
            { icon: Brain, title: 'Smart Matching', desc: 'Find jobs that match your unique profile' },
            { icon: Target, title: 'Skill Gap Analysis', desc: 'See what skills you need for target roles' },
            { icon: Map, title: 'Career Roadmap', desc: 'Get a personalized week-by-week plan' },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="p-6 bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl hover:border-purple-500/40 hover:bg-gray-800/50 transition-all duration-300 group hover:shadow-lg hover:shadow-purple-500/10"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/30 to-fuchsia-600/30 flex items-center justify-center mb-4 group-hover:from-purple-500/50 group-hover:to-fuchsia-500/50 transition-all duration-300 group-hover:scale-110">
                <feature.icon className="w-6 h-6 text-purple-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Upload Section */}
        <section id="upload" className="scroll-mt-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-3">
              Start Your Career Journey
            </h2>
            <p className="text-gray-400">
              Upload your resume and get instant AI-powered insights
            </p>
          </div>

          <ResumeUpload onUploadComplete={handleResumeUpload} />

          {/* Post-upload CTA */}
          {resumeUploaded && parsedResume && (
            <div className="mt-8 text-center animate-fade-in">
              <div className="inline-flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-green-400">Resume analyzed successfully!</span>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 max-w-md mx-auto mb-6">
                <h3 className="font-semibold text-white mb-2">
                  {parsedResume.personal_info?.name || 'Your Profile'}
                </h3>
                <p className="text-gray-400 text-sm mb-3">
                  {parsedResume.career_level} • {parsedResume.primary_domain}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {parsedResume.skills?.technical?.slice(0, 5).map((skill: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Link
                  href="/chat"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-600 hover:from-purple-500 hover:to-purple-500 rounded-xl text-white font-medium transition-all flex items-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Chat with AI Mentor
                </Link>
                <Link
                  href="/dashboard"
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white font-medium transition-all flex items-center gap-2"
                >
                  <BarChart3 className="w-5 h-5" />
                  View Dashboard
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* How It Works */}
        <section className="mt-32">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            How It Works
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            {[
              { step: 1, title: 'Upload Resume', desc: 'Drop your PDF, DOCX, or text file' },
              { step: 2, title: 'AI Analysis', desc: 'We extract skills, roles, and experience' },
              { step: 3, title: 'Get Insights', desc: 'Chat with AI for personalized guidance' },
              { step: 4, title: 'Follow Roadmap', desc: 'Execute your week-by-week plan' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-purple-500/30">
                    {item.step}
                  </div>
                </div>
                <div className="text-left flex-1 min-w-[150px]">
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
                {idx < 3 && (
                  <ArrowRight className="w-6 h-6 text-gray-600 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-32 pt-8 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="CareerPath AI Logo"
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="text-gray-400">CareerPath AI</span>
            </div>
            <p className="text-sm text-gray-500">
              Powered by Amazon Bedrock • Built for Hackathon 2026
            </p>
          </div>
        </footer>
      </section>
    </main>
  );
}
