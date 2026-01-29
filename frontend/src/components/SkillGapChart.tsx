'use client';

import { useMemo } from 'react';
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    Legend,
    Tooltip,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';

interface SkillData {
    skill: string;
    current: number;
    required: number;
    gap: number;
}

interface SkillGapChartProps {
    userSkills?: string[];
    targetRole?: string;
}

export default function SkillGapChart({ userSkills = [], targetRole = 'Senior Software Engineer' }: SkillGapChartProps) {
    // Generate skill data based on user skills and target role requirements
    const skillData: SkillData[] = useMemo(() => {
        const roleRequirements: Record<string, Record<string, number>> = {
            'Senior Software Engineer': {
                'System Design': 85,
                'Cloud (AWS)': 80,
                'Backend': 90,
                'Frontend': 70,
                'DevOps': 75,
                'Leadership': 70,
                'Testing': 80,
                'Security': 65,
            },
            'Machine Learning Engineer': {
                'Python': 95,
                'ML/DL': 90,
                'Math/Stats': 85,
                'Data Eng': 75,
                'MLOps': 80,
                'Cloud': 70,
                'Research': 75,
                'Coding': 85,
            },
            'Full Stack Developer': {
                'Frontend': 90,
                'Backend': 85,
                'Database': 80,
                'API Design': 85,
                'DevOps': 65,
                'Testing': 75,
                'UX/UI': 60,
                'Mobile': 50,
            },
        };

        const requirements = roleRequirements[targetRole] || roleRequirements['Senior Software Engineer'];

        // Estimate user's current skill levels based on provided skills
        const userSkillLower = userSkills.map(s => s.toLowerCase());

        return Object.entries(requirements).map(([skill, required]) => {
            // Estimate current level based on whether user has related skills
            let current = 30; // Base level

            if (skill.toLowerCase().includes('python') && userSkillLower.some(s => s.includes('python'))) {
                current = 75;
            } else if (skill.toLowerCase().includes('system') && userSkillLower.some(s => s.includes('architecture') || s.includes('design'))) {
                current = 65;
            } else if (skill.toLowerCase().includes('cloud') || skill.toLowerCase().includes('aws')) {
                current = userSkillLower.some(s => s.includes('aws') || s.includes('cloud')) ? 70 : 40;
            } else if (skill.toLowerCase().includes('frontend') || skill.toLowerCase().includes('react')) {
                current = userSkillLower.some(s => s.includes('react') || s.includes('javascript')) ? 75 : 50;
            } else if (skill.toLowerCase().includes('backend') || skill.toLowerCase().includes('node')) {
                current = userSkillLower.some(s => s.includes('node') || s.includes('python') || s.includes('java')) ? 80 : 45;
            } else if (skill.toLowerCase().includes('devops')) {
                current = userSkillLower.some(s => s.includes('docker') || s.includes('kubernetes')) ? 60 : 35;
            } else if (skill.toLowerCase().includes('leadership')) {
                current = userSkills.length > 5 ? 55 : 35;
            } else {
                // Random variation for other skills
                current = 40 + Math.random() * 30;
            }

            return {
                skill,
                current: Math.round(current),
                required,
                gap: Math.max(0, required - current),
            };
        });
    }, [userSkills, targetRole]);

    // Calculate overall readiness
    const overallReadiness = useMemo(() => {
        const totalRequired = skillData.reduce((sum, s) => sum + s.required, 0);
        const totalCurrent = skillData.reduce((sum, s) => sum + Math.min(s.current, s.required), 0);
        return Math.round((totalCurrent / totalRequired) * 100);
    }, [skillData]);

    // Get top gaps
    const topGaps = useMemo(() => {
        return [...skillData]
            .sort((a, b) => b.gap - a.gap)
            .slice(0, 3);
    }, [skillData]);

    // Get strengths
    const strengths = useMemo(() => {
        return skillData
            .filter(s => s.current >= s.required - 10)
            .slice(0, 3);
    }, [skillData]);

    return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-cyan-500" />
                        Skill Gap Analysis
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">Target: {targetRole}</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                        {overallReadiness}%
                    </div>
                    <p className="text-gray-400 text-sm">Career Ready</p>
                </div>
            </div>

            {/* Radar Chart */}
            <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={skillData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                        <PolarGrid stroke="#374151" />
                        <PolarAngleAxis
                            dataKey="skill"
                            tick={{ fill: '#9CA3AF', fontSize: 11 }}
                        />
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tick={{ fill: '#6B7280', fontSize: 10 }}
                        />
                        <Radar
                            name="Current Level"
                            dataKey="current"
                            stroke="#06B6D4"
                            fill="#06B6D4"
                            fillOpacity={0.3}
                            strokeWidth={2}
                        />
                        <Radar
                            name="Required Level"
                            dataKey="required"
                            stroke="#A855F7"
                            fill="#A855F7"
                            fillOpacity={0.1}
                            strokeWidth={2}
                            strokeDasharray="5 5"
                        />
                        <Legend
                            wrapperStyle={{ paddingTop: '10px' }}
                            formatter={(value) => <span className="text-gray-300 text-xs">{value}</span>}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1F2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#F3F4F6',
                            }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* Top Gaps */}
                <div className="bg-gray-800/50 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                        Priority Skills to Learn
                    </h4>
                    <div className="space-y-2">
                        {topGaps.map((skill, idx) => (
                            <div key={skill.skill} className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">
                                    {idx + 1}. {skill.skill}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">
                                    +{skill.gap}pts
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Strengths */}
                <div className="bg-gray-800/50 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-green-500" />
                        Your Strengths
                    </h4>
                    <div className="space-y-2">
                        {strengths.length > 0 ? (
                            strengths.map((skill) => (
                                <div key={skill.skill} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-400">{skill.skill}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                                        {skill.current}%
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                                <Minus className="w-4 h-4" />
                                Keep developing skills
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
