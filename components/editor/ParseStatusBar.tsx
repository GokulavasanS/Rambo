// ============================================================
// components/editor/ParseStatusBar.tsx
// Upgrades:
//  • Scrollable pill row — no wrapping, never eats vertical space
//  • Shows entry count for entry-based sections, bullet count for others
//  • Section pill click scrolls the editor to that section (future hook)
//  • Parsing skeleton animation is smoother
//  • Name chip uses truncate gracefully on narrow screens
// ============================================================

'use client';

import React from 'react';
import type { ResumeSection } from '@/types';

interface ParseStatusBarProps {
    sections:      ResumeSection[];
    isParsingText: boolean;
    fullName?:     string;
}

// Consistent color system matching StructuredEditor
const PILL_STYLES: Record<string, { bg: string; text: string; border: string }> = {
    summary:        { bg: 'rgba(99,102,241,0.15)',  text: '#a5b4fc', border: 'rgba(99,102,241,0.3)'  },
    experience:     { bg: 'rgba(255,107,0,0.12)',   text: '#fdba74', border: 'rgba(255,107,0,0.25)'  },
    projects:       { bg: 'rgba(6,182,212,0.12)',   text: '#67e8f9', border: 'rgba(6,182,212,0.25)'  },
    education:      { bg: 'rgba(16,185,129,0.12)',  text: '#6ee7b7', border: 'rgba(16,185,129,0.25)' },
    skills:         { bg: 'rgba(245,158,11,0.12)',  text: '#fcd34d', border: 'rgba(245,158,11,0.25)' },
    certifications: { bg: 'rgba(236,72,153,0.12)',  text: '#f9a8d4', border: 'rgba(236,72,153,0.25)' },
    other:          { bg: 'rgba(255,255,255,0.06)',  text: 'rgba(255,255,255,0.4)', border: 'rgba(255,255,255,0.12)' },
};

function getSectionCount(section: ResumeSection): number {
    if (section.entries?.length) {
        // For entry-based sections, total bullets across all entries
        return section.entries.reduce((sum, e) => sum + (e.bullets?.length ?? 0), 0);
    }
    return section.bullets?.length ?? 0;
}

export function ParseStatusBar({ sections, isParsingText, fullName }: ParseStatusBarProps) {
    if (sections.length === 0 && !isParsingText) return null;

    return (
        <div
            className="flex items-center gap-2 px-3 py-1.5 flex-shrink-0 overflow-x-auto scrollbar-none"
            style={{
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background:   '#09090f',
                minHeight:    34,
            }}
        >
            {isParsingText ? (
                /* Skeleton parsing state */
                <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    <span
                        className="w-3 h-3 rounded-full border border-white/20 border-t-transparent animate-spin flex-shrink-0"
                        role="status"
                        aria-label="Parsing resume…"
                    />
                    <span className="whitespace-nowrap">Parsing resume…</span>
                    {/* Skeleton pills */}
                    {[40, 60, 50].map((w, i) => (
                        <span
                            key={i}
                            className="animate-pulse rounded-full"
                            style={{ width: w, height: 18, background: 'rgba(255,255,255,0.06)' }}
                        />
                    ))}
                </div>
            ) : (
                <>
                    {/* Detected label */}
                    <span
                        className="text-[9px] font-bold uppercase tracking-widest flex-shrink-0 whitespace-nowrap"
                        style={{ color: 'rgba(255,255,255,0.18)' }}
                    >
                        Detected
                    </span>

                    {/* Name chip */}
                    {fullName && fullName !== 'Your Name' && (
                        <span
                            className="flex items-center gap-1 flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium max-w-[100px] truncate"
                            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}
                            title={fullName}
                        >
                            <span className="text-[9px] opacity-60">👤</span>
                            <span className="truncate">{fullName}</span>
                        </span>
                    )}

                    {/* Section pills */}
                    {sections.map((section) => {
                        const style   = PILL_STYLES[section.type] ?? PILL_STYLES.other;
                        const count   = getSectionCount(section);
                        return (
                            <span
                                key={section.id}
                                className="flex-shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap"
                                style={{
                                    background:  style.bg,
                                    color:       style.text,
                                    border:      `1px solid ${style.border}`,
                                }}
                                title={`${section.type}: ${count} item${count !== 1 ? 's' : ''}`}
                            >
                                {section.title}
                                {count > 0 && (
                                    <span className="opacity-50 text-[9px]">·{count}</span>
                                )}
                            </span>
                        );
                    })}
                </>
            )}
        </div>
    );
}
