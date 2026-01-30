'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Lightbulb, Loader2 } from 'lucide-react';

interface Annotation {
    type: 'good' | 'improvement';
    text: string;
    suggestion?: string;
    category: 'content' | 'formatting' | 'language' | 'structure' | 'keywords';
}

interface Section {
    name: string;
    content: string;
    annotations: Annotation[];
}

interface AnalysisResult {
    sections: Section[];
    overall_suggestions: string[];
}

interface ResumeAnnotationModalProps {
    isOpen: boolean;
    onClose: () => void;
    resumeText: string;
}

export default function ResumeAnnotationModal({ isOpen, onClose, resumeText }: ResumeAnnotationModalProps) {
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && resumeText) {
            analyzeResume();
        }
    }, [isOpen, resumeText]);

    const analyzeResume = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/analyze-resume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resume_text: resumeText }),
            });

            if (!response.ok) {
                throw new Error('Failed to analyze resume');
            }

            const data = await response.json();
            setAnalysis(data.annotations);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Analysis failed');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            content: '📝 Content',
            formatting: '📐 Formatting',
            language: '✍️ Language',
            structure: '🏗️ Structure',
            keywords: '🔑 Keywords',
        };
        return labels[category] || category;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-5xl max-h-[90vh] bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-800/50">
                    <div>
                        <h2 className="text-xl font-bold text-white">Resume Analysis</h2>
                        <p className="text-sm text-gray-400">Powered by Amazon Bedrock Nova Pro</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
                            <p className="text-gray-400">Analyzing your resume with AI...</p>
                            <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
                            <p className="text-red-400">{error}</p>
                            <button
                                onClick={analyzeResume}
                                className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : analysis ? (
                        <div className="space-y-8">
                            {/* Overall Suggestions */}
                            {analysis.overall_suggestions && analysis.overall_suggestions.length > 0 && (
                                <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-700/50 rounded-xl p-5">
                                    <h3 className="flex items-center gap-2 text-lg font-semibold text-amber-400 mb-3">
                                        <Lightbulb className="w-5 h-5" />
                                        Overall Suggestions
                                    </h3>
                                    <ul className="space-y-2">
                                        {analysis.overall_suggestions.map((suggestion, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                                                <span className="text-amber-500 mt-1">•</span>
                                                {suggestion}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Sections with Annotations */}
                            {analysis.sections?.map((section, sectionIdx) => (
                                <div key={sectionIdx} className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
                                    {/* Section Header */}
                                    <div className="px-5 py-3 bg-gray-800 border-b border-gray-700">
                                        <h3 className="font-semibold text-white">{section.name}</h3>
                                    </div>

                                    {/* Section Content with Annotations */}
                                    <div className="p-5">
                                        {/* Original Content */}
                                        <div className="bg-gray-900/50 rounded-lg p-4 mb-4 font-mono text-sm whitespace-pre-wrap text-gray-300">
                                            {section.content}
                                        </div>

                                        {/* Annotations */}
                                        {section.annotations && section.annotations.length > 0 && (
                                            <div className="space-y-3">
                                                {section.annotations.map((annotation, annIdx) => (
                                                    <div
                                                        key={annIdx}
                                                        className={`rounded-lg p-3 ${annotation.type === 'good'
                                                                ? 'bg-green-900/30 border border-green-700/50'
                                                                : 'bg-red-900/30 border border-red-700/50'
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            {annotation.type === 'good' ? (
                                                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                            ) : (
                                                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                                            )}
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${annotation.type === 'good'
                                                                            ? 'bg-green-800/50 text-green-400'
                                                                            : 'bg-red-800/50 text-red-400'
                                                                        }`}>
                                                                        {annotation.type === 'good' ? 'Good' : 'Improve'}
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">
                                                                        {getCategoryLabel(annotation.category)}
                                                                    </span>
                                                                </div>

                                                                <p className={`font-medium ${annotation.type === 'good' ? 'text-green-300' : 'text-red-300'
                                                                    }`}>
                                                                    &ldquo;{annotation.text}&rdquo;
                                                                </p>

                                                                {annotation.suggestion && (
                                                                    <p className="mt-2 text-sm text-gray-400 flex items-start gap-2">
                                                                        <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                                                        <span><strong className="text-yellow-400">Suggestion:</strong> {annotation.suggestion}</span>
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {(!section.annotations || section.annotations.length === 0) && (
                                            <p className="text-gray-500 text-sm italic">No specific annotations for this section</p>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Legend */}
                            <div className="flex items-center justify-center gap-6 text-sm text-gray-400 pt-4 border-t border-gray-700">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-green-900/50 border border-green-700" />
                                    <span>Good - Keep this</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-red-900/50 border border-red-700" />
                                    <span>Improve - Needs attention</span>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
