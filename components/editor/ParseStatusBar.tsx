// ============================================================
// components/editor/ParseStatusBar.tsx
// Minimal status strip shown beneat the editor's helper text —
// shows which sections were detected in the last parse.
// ============================================================

'use client';

import React from 'react';
import type { ResumeSection } from '@/types';

interface ParseStatusBarProps {
    sections: ResumeSection[];
    isParsingText: boolean;
    fullName?: string;
}

const SECTION_COLORS: Record<string, string> = {
    summary: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    experience: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    projects: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    education: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    skills: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    certifications: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    other: 'bg-white/10 text-white/40 border-white/15',
};

export function ParseStatusBar({ sections, isParsingText, fullName }: ParseStatusBarProps) {
    if (sections.length === 0 && !isParsingText) return null;

    return (
        <div className="px-4 py-2 border-b border-white/6 bg-[#09090f] flex items-center gap-2 flex-wrap min-h-[36px] flex-shrink-0">
            {isParsingText ? (
                <div className="flex items-center gap-2 text-white/30 text-xs">
                    <span className="w-3 h-3 rounded-full border border-white/20 border-t-transparent animate-spin flex-shrink-0" />
                    Parsing…
                </div>
            ) : (
                <>
                    {fullName && fullName !== 'Your Name' && (
                        <span className="text-xs text-white/30 flex items-center gap-1 mr-1">
                            <span className="text-white/20">👤</span>
                            <span className="text-white/50 font-medium truncate max-w-[120px]">{fullName}</span>
                        </span>
                    )}

                    <span className="text-xs text-white/20 mr-1">Detected:</span>

                    {sections.map((section) => {
                        const colorClass = SECTION_COLORS[section.type] ?? SECTION_COLORS.other;
                        const count = section.bullets?.length ?? 0;
                        return (
                            <span
                                key={section.id}
                                className={`text-xs px-2 py-0.5 rounded-full border ${colorClass} whitespace-nowrap`}
                                title={`${section.type}: ${count} line${count !== 1 ? 's' : ''}`}
                            >
                                {section.title}
                                {count > 0 && (
                                    <span className="ml-1 opacity-50">·{count}</span>
                                )}
                            </span>
                        );
                    })}
                </>
            )}
        </div>
    );
}
