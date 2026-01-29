'use client';

import { useState } from 'react';
import {
    Calendar,
    CheckCircle2,
    Circle,
    Clock,
    BookOpen,
    Trophy,
    ChevronDown,
    ChevronUp,
    ExternalLink
} from 'lucide-react';

interface RoadmapWeek {
    week: number;
    focus: string;
    tasks: string[];
    resources: { name: string; url?: string }[];
    timeHours: number;
    milestone?: string;
    status: 'completed' | 'current' | 'upcoming';
}

interface RoadmapTimelineProps {
    weeks?: RoadmapWeek[];
    currentWeek?: number;
}

export default function RoadmapTimeline({ weeks, currentWeek = 1 }: RoadmapTimelineProps) {
    const [expandedWeek, setExpandedWeek] = useState<number | null>(currentWeek);

    // Default demo roadmap
    const defaultWeeks: RoadmapWeek[] = [
        {
            week: 1,
            focus: 'System Design Fundamentals',
            tasks: [
                'Complete "Grokking System Design" chapters 1-3',
                'Design a URL shortener system',
                'Practice explaining designs in mock interviews',
            ],
            resources: [
                { name: 'Grokking System Design', url: 'https://educative.io' },
                { name: 'System Design Primer (GitHub)' },
            ],
            timeHours: 10,
            milestone: 'Complete first system design',
            status: 'current',
        },
        {
            week: 2,
            focus: 'Cloud Architecture Basics',
            tasks: [
                'Set up AWS free tier account',
                'Complete AWS Cloud Practitioner modules',
                'Deploy a simple app to EC2',
            ],
            resources: [
                { name: 'AWS Skill Builder' },
                { name: 'A Cloud Guru - AWS Essentials' },
            ],
            timeHours: 12,
            status: 'upcoming',
        },
        {
            week: 3,
            focus: 'Kubernetes Fundamentals',
            tasks: [
                'Complete Kubernetes crash course',
                'Set up local K8s with minikube',
                'Deploy app with Deployment and Service',
            ],
            resources: [
                { name: 'Kubernetes in Action' },
                { name: 'KodeKloud - CKA Course' },
            ],
            timeHours: 15,
            status: 'upcoming',
        },
        {
            week: 4,
            focus: 'Advanced System Design',
            tasks: [
                'Design a distributed cache system',
                'Study CAP theorem and trade-offs',
                'Mock interview practice',
            ],
            resources: [
                { name: 'Designing Data-Intensive Applications' },
            ],
            timeHours: 12,
            milestone: 'Complete 5 system designs',
            status: 'upcoming',
        },
        {
            week: 5,
            focus: 'AWS Solutions Architect',
            tasks: [
                'Study VPC, IAM, and S3 in depth',
                'Complete hands-on labs',
                'Take practice exam',
            ],
            resources: [
                { name: 'AWS Official Practice Exam' },
            ],
            timeHours: 15,
            status: 'upcoming',
        },
        {
            week: 6,
            focus: 'CI/CD & DevOps',
            tasks: [
                'Set up GitHub Actions pipeline',
                'Implement automated testing',
                'Configure deployment automation',
            ],
            resources: [
                { name: 'GitHub Actions Documentation' },
            ],
            timeHours: 10,
            milestone: 'Full CI/CD pipeline working',
            status: 'upcoming',
        },
        {
            week: 7,
            focus: 'Leadership & Communication',
            tasks: [
                'Write technical blog post',
                'Practice presenting technical concepts',
                'Start mentoring session with junior dev',
            ],
            resources: [
                { name: 'Staff Engineer by Will Larson' },
            ],
            timeHours: 8,
            status: 'upcoming',
        },
        {
            week: 8,
            focus: 'Portfolio Project - Part 1',
            tasks: [
                'Define project scope and architecture',
                'Set up repository and documentation',
                'Implement core backend services',
            ],
            resources: [],
            timeHours: 15,
            status: 'upcoming',
        },
        {
            week: 9,
            focus: 'Portfolio Project - Part 2',
            tasks: [
                'Implement frontend with React',
                'Add authentication and authorization',
                'Write integration tests',
            ],
            resources: [],
            timeHours: 15,
            status: 'upcoming',
        },
        {
            week: 10,
            focus: 'Portfolio Project - Part 3',
            tasks: [
                'Deploy to cloud with K8s',
                'Set up monitoring and logging',
                'Write project documentation',
            ],
            resources: [],
            timeHours: 12,
            milestone: 'Portfolio project deployed',
            status: 'upcoming',
        },
        {
            week: 11,
            focus: 'Interview Preparation',
            tasks: [
                'Review common system design questions',
                'Practice behavioral interview questions',
                'Update resume and LinkedIn',
            ],
            resources: [
                { name: 'Interviewing.io' },
            ],
            timeHours: 10,
            status: 'upcoming',
        },
        {
            week: 12,
            focus: 'Job Applications & Networking',
            tasks: [
                'Apply to 10 target companies',
                'Reach out to network connections',
                'Schedule informational interviews',
            ],
            resources: [],
            timeHours: 8,
            milestone: 'Career roadmap complete!',
            status: 'upcoming',
        },
    ];

    const displayWeeks = weeks || defaultWeeks;

    const toggleWeek = (week: number) => {
        setExpandedWeek(expandedWeek === week ? null : week);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'current':
                return <Circle className="w-5 h-5 text-cyan-500 fill-cyan-500/30" />;
            default:
                return <Circle className="w-5 h-5 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'border-green-500 bg-green-500/10';
            case 'current':
                return 'border-cyan-500 bg-cyan-500/10';
            default:
                return 'border-gray-700 bg-gray-800/50';
        }
    };

    // Calculate total hours
    const totalHours = displayWeeks.reduce((sum, w) => sum + w.timeHours, 0);
    const completedHours = displayWeeks
        .filter(w => w.status === 'completed')
        .reduce((sum, w) => sum + w.timeHours, 0);

    return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 p-6 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-purple-500" />
                        12-Week Career Roadmap
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                        Week {currentWeek} of 12 • {totalHours} hours total
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">
                        {completedHours}/{totalHours} hrs complete
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${(currentWeek / 12) * 100}%` }}
                    />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>Start</span>
                    <span>Halfway</span>
                    <span>Complete</span>
                </div>
            </div>

            {/* Timeline */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {displayWeeks.map((week) => (
                    <div
                        key={week.week}
                        className={`border rounded-xl transition-all duration-200 ${getStatusColor(week.status)}`}
                    >
                        {/* Week Header */}
                        <button
                            onClick={() => toggleWeek(week.week)}
                            className="w-full px-4 py-3 flex items-center justify-between text-left"
                        >
                            <div className="flex items-center gap-3">
                                {getStatusIcon(week.status)}
                                <div>
                                    <span className="text-sm font-medium text-white">
                                        Week {week.week}: {week.focus}
                                    </span>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {week.timeHours} hours
                                        </span>
                                        {week.milestone && (
                                            <span className="text-xs text-purple-400 flex items-center gap-1">
                                                <Trophy className="w-3 h-3" />
                                                {week.milestone}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {expandedWeek === week.week ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                        </button>

                        {/* Week Details */}
                        {expandedWeek === week.week && (
                            <div className="px-4 pb-4 border-t border-gray-700/50 pt-3">
                                {/* Tasks */}
                                <div className="mb-3">
                                    <h5 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                                        Tasks
                                    </h5>
                                    <ul className="space-y-1.5">
                                        {week.tasks.map((task, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                                                <span className="text-cyan-500 mt-1">•</span>
                                                {task}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Resources */}
                                {week.resources.length > 0 && (
                                    <div>
                                        <h5 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                                            <BookOpen className="w-3 h-3" />
                                            Resources
                                        </h5>
                                        <div className="flex flex-wrap gap-2">
                                            {week.resources.map((resource, idx) => (
                                                <a
                                                    key={idx}
                                                    href={resource.url || '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                                                >
                                                    {resource.name}
                                                    {resource.url && <ExternalLink className="w-3 h-3" />}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-gray-800 flex justify-center gap-6">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Completed
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Circle className="w-4 h-4 text-cyan-500 fill-cyan-500/30" />
                    Current
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Circle className="w-4 h-4 text-gray-600" />
                    Upcoming
                </div>
            </div>
        </div>
    );
}
