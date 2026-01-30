'use client';

import { useState, useEffect } from 'react';
import {
    Shield,
    Scale,
    Eye,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ChevronDown,
    ChevronUp,
    Lightbulb,
    Info,
    Cpu,
    Loader2
} from 'lucide-react';
import type { EthicalEvaluation, ParsedResume } from '@/lib/types';

interface EthicalXAIPanelProps {
    userProfile?: ParsedResume | null;
}

// Default demo evaluation data
const defaultEvaluation: EthicalEvaluation = {
    bias_assessment: {
        overall_risk: 'low',
        checks: [
            {
                name: 'Gender Bias Check',
                status: 'pass',
                description: 'Recommendations are gender-neutral and do not favor any gender.'
            },
            {
                name: 'Age Discrimination Check',
                status: 'pass',
                description: 'Career paths are suitable for all experience levels without age bias.'
            },
            {
                name: 'Geographic Bias Check',
                status: 'warning',
                description: 'Some salary data may be region-specific. Consider local market variations.'
            },
            {
                name: 'Educational Background Check',
                status: 'pass',
                description: 'Recommendations consider skills over formal education credentials.'
            }
        ]
    },
    fairness_metrics: {
        demographic_parity: 0.92,
        equal_opportunity: 0.88,
        diversity_score: 0.85
    },
    transparency: {
        data_sources_disclosed: true,
        model_limitations_stated: true,
        confidence_provided: true,
        human_review_recommended: false
    },
    recommendations: [
        'Cross-reference salary ranges with local job boards for your specific region.',
        'Consider personal factors like work-life balance that AI cannot fully assess.',
        'Discuss career transitions with industry professionals for additional insights.'
    ]
};

export default function EthicalXAIPanel({ userProfile }: EthicalXAIPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showAllChecks, setShowAllChecks] = useState(false);
    const [evaluation, setEvaluation] = useState<EthicalEvaluation>(defaultEvaluation);
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<'demo' | 'bedrock'>('demo');
    const [model, setModel] = useState<string | null>(null);

    // Fetch real evaluation when profile is available
    useEffect(() => {
        async function fetchEvaluation() {
            if (!userProfile) return;

            setIsLoading(true);
            try {
                const response = await fetch('/api/ethical-evaluation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_profile: userProfile })
                });

                if (response.ok) {
                    const data = await response.json();
                    setEvaluation(data.evaluation);
                    setMode(data.mode);
                    setModel(data.model);
                }
            } catch (error) {
                console.error('Failed to fetch ethical evaluation:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchEvaluation();
    }, [userProfile]);

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'low': return 'text-green-400 bg-green-500/20 border-green-500/50';
            case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
            case 'high': return 'text-red-400 bg-red-500/20 border-red-500/50';
            default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pass':
                return <CheckCircle2 className="w-4 h-4 text-green-400" />;
            case 'warning':
                return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
            case 'fail':
                return <XCircle className="w-4 h-4 text-red-400" />;
            default:
                return <Info className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'pass': return 'bg-green-500/10 border-green-500/30';
            case 'warning': return 'bg-yellow-500/10 border-yellow-500/30';
            case 'fail': return 'bg-red-500/10 border-red-500/30';
            default: return 'bg-gray-500/10 border-gray-500/30';
        }
    };

    // Circular progress component
    const CircularProgress = ({ value, label, color }: { value: number; label: string; color: string }) => {
        const percentage = Math.round(value * 100);
        const circumference = 2 * Math.PI * 36;
        const strokeDashoffset = circumference - (value * circumference);

        return (
            <div className="flex flex-col items-center">
                <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                            cx="40"
                            cy="40"
                            r="36"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            className="text-gray-700"
                        />
                        <circle
                            cx="40"
                            cy="40"
                            r="36"
                            stroke={color}
                            strokeWidth="6"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">{percentage}%</span>
                    </div>
                </div>
                <span className="mt-2 text-xs text-gray-400 text-center">{label}</span>
            </div>
        );
    };

    const visibleChecks = showAllChecks
        ? evaluation.bias_assessment.checks
        : evaluation.bias_assessment.checks.slice(0, 2);

    return (
        <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-white">AI Ethics & Transparency</h3>
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-400">Explainable AI evaluation for fair recommendations</p>
                            {/* Model badge */}
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${mode === 'bedrock'
                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                }`}>
                                <Cpu className="w-3 h-3" />
                                {mode === 'bedrock' ? 'Amazon Nova Pro' : 'Demo Mode'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                    ) : (
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getRiskColor(evaluation.bias_assessment.overall_risk)}`}>
                            {evaluation.bias_assessment.overall_risk.toUpperCase()} BIAS RISK
                        </span>
                    )}
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="px-6 pb-6 space-y-6">
                    {/* Model Info Banner */}
                    {model && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-purple-500/10 border border-purple-500/20">
                            <Cpu className="w-4 h-4 text-purple-400" />
                            <span className="text-xs text-gray-300">
                                Powered by <span className="font-semibold text-purple-400">{model}</span> — Amazon Bedrock Foundation Model
                            </span>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                            <p className="text-sm text-gray-400">Analyzing recommendations for ethical considerations...</p>
                        </div>
                    ) : (
                        <>
                            {/* Bias Assessment Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                    <h4 className="text-sm font-medium text-white">Bias Assessment Checks</h4>
                                </div>
                                <div className="space-y-2">
                                    {visibleChecks.map((check, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-3 rounded-lg border ${getStatusBg(check.status)}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {getStatusIcon(check.status)}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white">{check.name}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{check.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {evaluation.bias_assessment.checks.length > 2 && (
                                    <button
                                        onClick={() => setShowAllChecks(!showAllChecks)}
                                        className="mt-2 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                                    >
                                        {showAllChecks ? 'Show less' : `Show ${evaluation.bias_assessment.checks.length - 2} more checks`}
                                    </button>
                                )}
                            </div>

                            {/* Fairness Metrics */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Scale className="w-4 h-4 text-purple-500" />
                                    <h4 className="text-sm font-medium text-white">Fairness Metrics</h4>
                                </div>
                                <div className="flex justify-around">
                                    <CircularProgress
                                        value={evaluation.fairness_metrics.demographic_parity}
                                        label="Demographic Parity"
                                        color="#22d3ee"
                                    />
                                    <CircularProgress
                                        value={evaluation.fairness_metrics.equal_opportunity}
                                        label="Equal Opportunity"
                                        color="#a855f7"
                                    />
                                    <CircularProgress
                                        value={evaluation.fairness_metrics.diversity_score}
                                        label="Diversity Score"
                                        color="#10b981"
                                    />
                                </div>
                            </div>

                            {/* Transparency Checklist */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Eye className="w-4 h-4 text-purple-500" />
                                    <h4 className="text-sm font-medium text-white">Transparency Checklist</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { key: 'data_sources_disclosed', label: 'Data Sources Disclosed' },
                                        { key: 'model_limitations_stated', label: 'Limitations Stated' },
                                        { key: 'confidence_provided', label: 'Confidence Scores Provided' },
                                        { key: 'human_review_recommended', label: 'Human Review Recommended' }
                                    ].map((item) => (
                                        <div
                                            key={item.key}
                                            className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/50"
                                        >
                                            {evaluation.transparency[item.key as keyof typeof evaluation.transparency] ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                            )}
                                            <span className="text-xs text-gray-300">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recommendations */}
                            {evaluation.recommendations.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Lightbulb className="w-4 h-4 text-amber-500" />
                                        <h4 className="text-sm font-medium text-white">Recommendations</h4>
                                    </div>
                                    <ul className="space-y-2">
                                        {evaluation.recommendations.map((rec, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-xs text-gray-400">
                                                <span className="text-purple-400 mt-0.5">•</span>
                                                {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
