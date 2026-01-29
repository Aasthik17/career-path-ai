'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
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
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/10 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-4 border-b border-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">CareerPath AI</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/chat" className="text-gray-400 hover:text-white transition-colors">
            Chat
          </Link>
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
            Dashboard
          </Link>
          <button className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 rounded-lg text-white font-medium transition-all shadow-lg shadow-purple-500/20">
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
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
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
              className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 rounded-xl text-white font-semibold text-lg transition-all shadow-lg shadow-purple-500/30 flex items-center gap-2"
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
              className="p-6 bg-gray-800/30 border border-gray-700/50 rounded-2xl hover:border-gray-600 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 flex items-center justify-center mb-4 group-hover:from-cyan-500/30 group-hover:to-purple-600/30 transition-all">
                <feature.icon className="w-6 h-6 text-cyan-400" />
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
                    <span key={idx} className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Link
                  href="/chat"
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 rounded-xl text-white font-medium transition-all flex items-center gap-2"
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
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-purple-500/30">
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
              <Sparkles className="w-5 h-5 text-cyan-500" />
              <span className="text-gray-400">CareerPath AI</span>
            </div>
            <p className="text-sm text-gray-500">
              Powered by Amazon Bedrock • Built for Hackathon 2024
            </p>
          </div>
        </footer>
      </section>
    </main>
  );
}
