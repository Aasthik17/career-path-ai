'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { ChatMessage, ParsedResume } from '@/lib/types';

interface ChatInterfaceProps {
    userProfile?: ParsedResume;
    onRoadmapGenerated?: (roadmap: Record<string, unknown>) => void;
}

export default function ChatInterface({ userProfile, onRoadmapGenerated }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'assistant',
            content: `👋 Hello! I'm your CareerPath AI mentor. I've analyzed your profile and I'm ready to help you navigate your career journey.

**Here's what I can help you with:**
- 🎯 Career path recommendations
- 📊 Skill gap analysis
- 📚 Learning resources & certifications
- 🗺️ Week-by-week career roadmaps

What would you like to explore first?`,
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Check if user is asking for a roadmap
            const isRoadmapRequest = inputValue.toLowerCase().includes('roadmap') ||
                inputValue.toLowerCase().includes('plan') ||
                inputValue.toLowerCase().includes('path');

            // In demo mode, generate a simulated response
            // In production, this would call the actual API
            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: inputValue,
                        user_profile: userProfile,
                        type: isRoadmapRequest ? 'roadmap' : 'chat',
                    }),
                });

                if (response.ok) {
                    const data = await response.json();

                    const assistantMessage: ChatMessage = {
                        id: (Date.now() + 1).toString(),
                        role: 'assistant',
                        content: data.response,
                        timestamp: new Date(),
                        sources: data.sources,
                    };

                    if (data.roadmap && onRoadmapGenerated) {
                        onRoadmapGenerated(data.roadmap);
                    }

                    setMessages((prev) => [...prev, assistantMessage]);
                } else {
                    // Demo fallback
                    const demoResponse = generateDemoResponse(inputValue, userProfile);
                    const assistantMessage: ChatMessage = {
                        id: (Date.now() + 1).toString(),
                        role: 'assistant',
                        content: demoResponse.content,
                        timestamp: new Date(),
                        sources: demoResponse.sources,
                    };
                    setMessages((prev) => [...prev, assistantMessage]);
                }
            } catch {
                // Demo mode fallback
                const demoResponse = generateDemoResponse(inputValue, userProfile);
                const assistantMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: demoResponse.content,
                    timestamp: new Date(),
                    sources: demoResponse.sources,
                };
                setMessages((prev) => [...prev, assistantMessage]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I apologize, but I encountered an error. Please try again.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const quickPrompts = [
        "What jobs match my skills?",
        "Create a 12-week career roadmap",
        "What skills should I learn next?",
        "Recommend certifications for me",
    ];

    return (
        <div className="flex flex-col h-[600px] bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold text-white">CareerPath AI Mentor</h3>
                    <p className="text-xs text-gray-400">Powered by Amazon Bedrock</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-gray-400">Online</span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {message.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                        )}
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                    ? 'bg-gradient-to-br from-cyan-600 to-purple-600 text-white'
                                    : 'bg-gray-800 text-gray-100'
                                }`}
                        >
                            <div className="prose prose-sm prose-invert max-w-none">
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>

                            {/* Sources */}
                            {message.sources && message.sources.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-700">
                                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                                        <BookOpen className="w-3 h-3" />
                                        <span>Sources</span>
                                    </div>
                                    <div className="space-y-1">
                                        {message.sources.map((source, idx) => (
                                            <div key={idx} className="text-xs text-gray-500 truncate">
                                                📄 {source.source}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        {message.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-gray-300" />
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                        </div>
                        <div className="bg-gray-800 rounded-2xl px-4 py-3">
                            <div className="flex gap-1">
                                {[0, 1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                                        style={{ animationDelay: `${i * 0.1}s` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts */}
            {messages.length <= 2 && (
                <div className="px-4 pb-2">
                    <div className="flex flex-wrap gap-2">
                        {quickPrompts.map((prompt, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setInputValue(prompt);
                                    inputRef.current?.focus();
                                }}
                                className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition-colors border border-gray-700"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-800 bg-gray-900/50">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Ask about your career..."
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        disabled={isLoading}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={isLoading || !inputValue.trim()}
                        className="px-4 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition-all"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Demo response generator
function generateDemoResponse(input: string, profile?: ParsedResume) {
    const inputLower = input.toLowerCase();
    const name = profile?.personal_info?.name || 'there';
    const skills = profile?.skills?.technical || ['Python', 'JavaScript'];

    if (inputLower.includes('roadmap') || inputLower.includes('plan')) {
        return {
            content: `## 🗺️ Your Personalized 12-Week Career Roadmap

Based on your profile as a **${profile?.career_level || 'Mid-level'} ${profile?.primary_domain || 'Software Engineer'}**, here's your customized growth plan:

### Weeks 1-4: Foundation Strengthening
- **Focus:** Deepen expertise in ${skills.slice(0, 2).join(' and ')}
- **Action:** Complete an advanced course on system design
- **Project:** Build a microservices demo application

### Weeks 5-8: Skill Expansion
- **Focus:** Learn cloud architecture (AWS Solutions Architect path)
- **Action:** Study for AWS certification
- **Project:** Deploy your app with full CI/CD pipeline

### Weeks 9-12: Leadership & Visibility
- **Focus:** Technical leadership and mentoring
- **Action:** Write 2 technical blog posts
- **Project:** Lead a cross-team technical initiative

**📊 Expected Outcomes:**
- 25% increase in interview callbacks
- Ready for Senior/Staff engineer roles
- Expanded professional network

Would you like me to dive deeper into any week?`,
            sources: [
                { content: 'Career progression data', source: 'skills_taxonomy.json' },
                { content: 'Learning paths', source: 'learning_resources.json' },
            ],
        };
    }

    if (inputLower.includes('job') || inputLower.includes('match')) {
        return {
            content: `## 🎯 Jobs Matching Your Profile

Based on your skills in **${skills.slice(0, 3).join(', ')}**, here are top matches:

### 1. Senior Software Engineer at TechCorp
**Match Score:** 92%
- ✅ Python, AWS, Microservices
- 💰 $150k - $200k
- 📍 Remote / San Francisco

### 2. Machine Learning Engineer at AI Labs
**Match Score:** 85%
- ✅ Python, SQL
- ⚡ Learn: PyTorch, MLOps
- 💰 $140k - $180k

### 3. Full Stack Developer at StartupXYZ
**Match Score:** 88%
- ✅ JavaScript, React, Node.js
- 💰 $120k - $160k
- 📍 Remote

Would you like tips on preparing for any of these roles?`,
            sources: [
                { content: 'Job postings database', source: 'job_postings.json' },
            ],
        };
    }

    if (inputLower.includes('skill') || inputLower.includes('learn')) {
        return {
            content: `## 📚 Skills Analysis & Recommendations

### ✅ Your Valuable Skills
${skills.map(s => `- ${s}`).join('\n')}

### 🎯 High-Priority Skills to Learn
Based on market demand and your career goals:

1. **Kubernetes** - 25% salary premium, essential for senior roles
2. **System Design** - Critical for Staff+ positions
3. **Machine Learning basics** - Growing demand across all tech roles

### 📖 Recommended Resources
- **Course:** "Kubernetes Administrator (CKA)" - $395, 40-60 hours
- **Course:** "System Design Interview" - Educative, $79
- **Free:** "LangChain for LLM Apps" - DeepLearning.AI

Shall I create a detailed learning plan for any of these?`,
            sources: [
                { content: 'Skills taxonomy', source: 'skills_taxonomy.json' },
                { content: 'Learning resources', source: 'learning_resources.json' },
            ],
        };
    }

    // Default response
    return {
        content: `Hi ${name}! I'd be happy to help with your career journey.

Based on your profile, you have strong skills in **${skills.slice(0, 3).join(', ')}** with **${profile?.total_experience_years || 5}** years of experience.

Here are some things I can help you with:
- 🎯 Find matching job opportunities
- 📊 Analyze your skill gaps
- 🗺️ Create a personalized career roadmap
- 📚 Recommend learning resources

What would you like to explore?`,
        sources: [],
    };
}
