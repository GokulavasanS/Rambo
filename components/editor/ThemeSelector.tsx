'use client';
import React, { useState } from 'react';
import { getThemesByCategory } from '@/lib/theme';
import type { ResumeTheme, TemplateCategory } from '@/types';
import { Modal } from '@/components/ui/Modal';

interface ThemeSelectorProps {
    currentTheme: ResumeTheme;
    onSelect: (t: ResumeTheme) => void;
}

// Premium mini resume mockup thumbnail for each template
function TemplateThumbnail({ theme, isActive }: { theme: ResumeTheme; isActive: boolean }) {
    const p = theme.palette;
    const isCreative = theme.category === 'creative';
    const isDoubleBg = theme.id.includes('neon') || theme.id.includes('kinetic');
    const bg = isDoubleBg ? '#0f0f14' : (p.neutralBackground || '#ffffff');
    const primary = p.primary || '#2563eb';
    const accent = p.accent || '#64748b';
    const text = p.textColor || '#1a1a1a';
    const isDark = isDoubleBg;

    // Layout variant
    const isTwoCol = theme.id.includes('two-column') || theme.id.includes('portfolio');

    return (
        <div
            className="w-full h-32 rounded-t-xl overflow-hidden relative flex-shrink-0 template-card-thumb"
            style={{ background: bg, border: `1px solid ${isActive ? primary : 'transparent'}` }}
        >
            {/* Header */}
            <div
                className="w-full flex flex-col justify-center px-3 pt-2 pb-1.5 relative"
                style={{
                    background: isCreative
                        ? `linear-gradient(135deg, ${primary} 0%, ${accent || primary} 100%)`
                        : theme.id.includes('federal') || theme.id.includes('harvard')
                            ? bg
                            : primary,
                    minHeight: isCreative ? 40 : 32,
                }}
            >
                {/* Name skeleton */}
                {(isCreative || !theme.id.includes('federal')) ? (
                    <div className="w-20 h-2 rounded-full mb-1.5" style={{ background: isCreative ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.85)' }} />
                ) : (
                    <div className="w-20 h-2 rounded-full mb-1" style={{ background: primary, opacity: 0.85 }} />
                )}
                {/* Role skeleton */}
                <div className="w-14 h-1 rounded-full" style={{ background: isCreative ? 'rgba(255,255,255,0.45)' : isDark ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.5)' }} />
                {/* Separator */}
                {!isCreative && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: `${primary}40` }} />}
            </div>

            {/* Body */}
            {isTwoCol ? (
                <div className="flex mt-1.5 px-2 gap-2">
                    {/* Col 1 */}
                    <div className="w-1/3 flex flex-col gap-1.5">
                        <div className="w-full h-1 rounded-full" style={{ background: isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0' }} />
                        <div className="w-4/5 h-1 rounded-full" style={{ background: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }} />
                        <div className="w-3/4 h-1 rounded-full mt-1" style={{ background: primary, opacity: 0.3 }} />
                        <div className="w-full h-1 rounded-full" style={{ background: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }} />
                    </div>
                    {/* Col 2 */}
                    <div className="flex-1 flex flex-col gap-1.5">
                        <div className="w-3/4 h-1 rounded-full" style={{ background: isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0' }} />
                        <div className="w-full h-1 rounded-full" style={{ background: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }} />
                        <div className="w-2/3 h-1 rounded-full" style={{ background: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }} />
                    </div>
                </div>
            ) : (
                <div className="px-3 mt-1.5 flex flex-col gap-1.5">
                    {/* Section header skeleton */}
                    <div className="w-14 h-1 rounded-full" style={{ background: primary, opacity: 0.6 }} />
                    {/* Content lines */}
                    <div className="w-full h-1 rounded-full" style={{ background: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0' }} />
                    <div className="w-11/12 h-1 rounded-full" style={{ background: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }} />
                    <div className="w-16 h-1 rounded-full mt-0.5" style={{ background: primary, opacity: 0.4 }} />
                    <div className="w-full h-1 rounded-full" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }} />
                    <div className="w-4/5 h-1 rounded-full" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }} />
                </div>
            )}

            {/* Active indicator */}
            {isActive && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center shadow-md" style={{ background: primary }}>
                    <span className="text-white text-[9px]">✓</span>
                </div>
            )}
        </div>
    );
}

export function ThemeSelector({ currentTheme, onSelect }: ThemeSelectorProps) {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TemplateCategory>(currentTheme.category ?? 'ats');

    const atsThemes = getThemesByCategory('ats');
    const creativeThemes = getThemesByCategory('creative');
    const displayThemes = activeTab === 'ats' ? atsThemes : creativeThemes;

    return (
        <>
            <button
                onClick={() => { setActiveTab(currentTheme.category ?? 'ats'); setOpen(true); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all hover:border-[#ffd4b0] hover:text-[#ff6b00]"
                style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#475569' }}
                id="theme-selector-btn"
            >
                <span className="text-[10px] text-[#94a3b8] hidden sm:inline-block">Theme:</span>
                <span className="w-3 h-3 rounded-full flex-shrink-0 border border-black/10" style={{ background: currentTheme.palette.primary }} />
                <span className="truncate max-w-[120px]">{currentTheme.name}</span>
            </button>

            <Modal open={open} onClose={() => setOpen(false)} title="Choose a Template">
                <div className="flex flex-col h-[70vh] min-h-[540px]">
                    {/* Tabs */}
                    <div className="flex p-1 bg-[#f1f5f9] rounded-xl mb-5 mx-1 shrink-0">
                        {(['ats', 'creative'] as TemplateCategory[]).map((tab) => {
                            const count = tab === 'ats' ? atsThemes.length : creativeThemes.length;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                                    style={{
                                        background: activeTab === tab ? '#ffffff' : 'transparent',
                                        color: activeTab === tab ? '#0f172a' : '#64748b',
                                        boxShadow: activeTab === tab ? '0 1px 4px rgba(15,23,42,0.07)' : 'none',
                                    }}
                                >
                                    <span>{tab === 'ats' ? '🤖 ATS-Friendly' : '✨ Creative'}</span>
                                    <span
                                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                        style={{
                                            background: activeTab === tab
                                                ? tab === 'ats' ? '#ecfdf5' : '#f3e8ff'
                                                : '#f1f5f9',
                                            color: activeTab === tab
                                                ? tab === 'ats' ? '#059669' : '#7c3aed'
                                                : '#94a3b8',
                                        }}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Category description */}
                    <p className="text-[11px] text-[#64748b] mx-2 mb-4 leading-relaxed">
                        {activeTab === 'ats'
                            ? '✅ Machine-parsable, recruiter-optimized layouts designed to pass ATS filters.'
                            : '🎨 Visually stunning designs that stand out while remaining professional.'}
                    </p>

                    {/* Template grid */}
                    <div className="overflow-y-auto px-1 pb-4 flex-1">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {displayThemes.map((t) => {
                                const isActive = t.id === currentTheme.id;
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => { onSelect(t); setOpen(false); }}
                                        className="group relative flex flex-col text-left rounded-xl transition-all duration-200 overflow-hidden bg-white"
                                        style={{
                                            border: `2px solid ${isActive ? t.palette.primary : '#e2e8f0'}`,
                                            boxShadow: isActive ? `0 4px 14px ${t.palette.primary}25` : 'none',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.transform = 'translateY(-3px)';
                                                e.currentTarget.style.boxShadow = `0 12px 24px rgba(15,23,42,0.08)`;
                                                e.currentTarget.style.borderColor = t.palette.primary;
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.transform = 'none';
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = '#e2e8f0';
                                            }
                                        }}
                                    >
                                        {/* Mini resume thumbnail */}
                                        <TemplateThumbnail theme={t} isActive={isActive} />

                                        {/* Info panel */}
                                        <div className="p-3 flex-1">
                                            <div className="flex items-start justify-between gap-1 mb-1">
                                                <span className="font-bold text-sm text-[#0f172a] leading-tight">{t.name}</span>
                                                {isActive && (
                                                    <span className="text-[9px] font-bold text-[#ff6b00] bg-[#fff3e8] px-1.5 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap flex-shrink-0">
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-[#64748b] leading-relaxed line-clamp-2">{t.description}</p>

                                            {/* Color + layout badges */}
                                            <div className="flex items-center justify-between mt-2.5">
                                                <div className="flex items-center gap-1">
                                                    {[t.palette.primary, t.palette.secondary, t.palette.accent].filter(Boolean).map((c, i) => (
                                                        <span key={i} className="w-3 h-3 rounded-full border border-black/08 flex-shrink-0" style={{ background: c as string }} />
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span
                                                        className="text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                                                        style={{
                                                            background: t.category === 'ats' ? '#ecfdf5' : '#f3e8ff',
                                                            color: t.category === 'ats' ? '#059669' : '#7c3aed',
                                                        }}
                                                    >
                                                        {t.category === 'ats' ? '✓ ATS' : '✦ Creative'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl pointer-events-none">
                                            <div
                                                className="text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xl translate-y-2 group-hover:translate-y-0 transition-all duration-200"
                                                style={{ background: t.palette.primary }}
                                            >
                                                Use Template →
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}
