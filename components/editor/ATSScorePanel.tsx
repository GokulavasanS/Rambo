// ============================================================
// components/editor/ATSScorePanel.tsx — Premium ATS Score UI
// Animated SVG ring · recruiter badge · keyword breakdown
// ============================================================

'use client';
import React, { useMemo, useState } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { calculateATSScore } from '@/lib/ats/scorer';

export function ATSScorePanel() {
    const { resumeData, jobDescription } = useResumeStore();
    const score = useMemo(() => calculateATSScore(resumeData, jobDescription), [resumeData, jobDescription]);

    const getColor = (total: number) => {
        if (total >= 80) return '#10b981';
        if (total >= 50) return '#f59e0b';
        return '#ef4444';
    };
    const getLabel = (total: number) => {
        if (total >= 80) return { text: 'Excellent', bg: '#f0fdf4', color: '#10b981', border: '#bbf7d0' };
        if (total >= 50) return { text: 'Good', bg: '#fffbeb', color: '#f59e0b', border: '#fde68a' };
        return { text: 'Needs Work', bg: '#fef2f2', color: '#ef4444', border: '#fecaca' };
    };

    const color = getColor(score.total);
    const label = getLabel(score.total);

    // Ring SVG params
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score.total / 100) * circumference;

    return (
        <div className="flex flex-col gap-4">

            {/* Score ring + label */}
            <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                    <svg width="92" height="92" viewBox="0 0 92 92" style={{ transform: 'rotate(-90deg)' }}>
                        {/* Background track */}
                        <circle cx="46" cy="46" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="6" />
                        {/* Score arc */}
                        <circle
                            cx="46" cy="46" r={radius}
                            fill="none"
                            stroke={color}
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            style={{ transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.4s ease' }}
                        />
                    </svg>
                    {/* Score number */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black leading-none" style={{ color }}>{score.total}</span>
                        <span className="text-[9px] text-[#94a3b8] font-semibold">/100</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div>
                        <h3 className="text-sm font-bold text-[#0f172a]">ATS Match Score</h3>
                        <p className="text-[11px] text-[#64748b] mt-0.5 leading-relaxed">
                            {jobDescription ? 'Tailored to your target job.' : 'Add a job description to enable keyword scoring.'}
                        </p>
                    </div>
                    {/* Recruiter friendliness badge */}
                    <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold w-fit border"
                        style={{ background: label.bg, color: label.color, borderColor: label.border }}
                    >
                        {score.total >= 80 ? '🌟' : score.total >= 50 ? '⚡' : '⚠️'}
                        {label.text}
                    </span>
                </div>
            </div>

            {/* Score breakdown bars */}
            <div className="space-y-2">
                <div className="text-[10px] font-bold text-[#0f172a] uppercase tracking-wider mb-1">Breakdown</div>
                <ScoreBar label="Keywords" value={score.breakdown.keywordMatch} max={50} color={color} />
                <ScoreBar label="Completeness" value={score.breakdown.completeness} max={30} color={color} />
                <ScoreBar label="Formatting" value={score.breakdown.formatting} max={20} color={color} />
            </div>

            {/* Matched keywords */}
            {score.matchedKeywords.length > 0 && (
                <div>
                    <div className="text-[10px] font-bold text-[#0f172a] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] inline-block"></span>
                        Matched Keywords
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {score.matchedKeywords.map((kw, i) => (
                            <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-md" style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
                                ✓ {kw}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Missing / critical items */}
            {score.missingSections.length > 0 && (
                <div>
                    <div className="text-[10px] font-bold text-[#0f172a] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] inline-block"></span>
                        Missing Items
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {score.missingSections.map((item, i) => (
                            <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-md" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Suggestions */}
            {score.suggestions.length > 0 && (
                <div>
                    <div className="text-[10px] font-bold text-[#0f172a] uppercase tracking-wider mb-1.5">Suggestions</div>
                    <ul className="space-y-1.5">
                        {score.suggestions.map((s, i) => (
                            <li key={i} className="text-[11px] text-[#475569] flex gap-2 items-start leading-relaxed">
                                <span className="text-[#ff6b00] flex-shrink-0 mt-0.5">▸</span>
                                <span>{s}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {score.suggestions.length === 0 && score.missingSections.length === 0 && (
                <div className="flex items-center gap-2 text-[11px] text-[#10b981] font-medium">
                    <span>🎉</span> Looking great! No major issues found.
                </div>
            )}
        </div>
    );
}

function ScoreBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
    const pct = Math.max(0, Math.min(100, (value / max) * 100));
    return (
        <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wider">{label}</span>
                <span className="text-[10px] font-bold" style={{ color }}>{value}<span className="text-[#94a3b8] font-normal">/{max}</span></span>
            </div>
            <div className="h-1.5 w-full bg-[#f1f5f9] rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${pct}%`, background: color }}
                />
            </div>
        </div>
    );
}
