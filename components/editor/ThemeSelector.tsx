'use client';
import React, { useState } from 'react';
import { BUILTIN_THEMES } from '@/lib/theme';
import type { ResumeTheme } from '@/types';

interface ThemeSelectorProps {
    currentTheme: ResumeTheme;
    onSelect: (t: ResumeTheme) => void;
}

export function ThemeSelector({ currentTheme, onSelect }: ThemeSelectorProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all"
                style={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    color: '#475569',
                }}
                id="theme-selector-btn"
            >
                {/* Swatch */}
                <span
                    className="w-3 h-3 rounded-full flex-shrink-0 border border-black/10"
                    style={{ background: currentTheme.palette.primary }}
                />
                {currentTheme.name}
                <span style={{ opacity: 0.5 }}>{open ? '▴' : '▾'}</span>
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div
                        className="absolute right-0 top-full mt-2 z-20 rounded-2xl shadow-xl border p-2 w-64 animate-scale-in"
                        style={{ background: '#fff', borderColor: '#e2e8f0' }}
                    >
                        <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider px-2 py-1 mb-1">Templates</p>
                        {BUILTIN_THEMES.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => { onSelect(t); setOpen(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                                style={{
                                    background: t.id === currentTheme.id ? '#fff3e8' : 'transparent',
                                    border: t.id === currentTheme.id ? '1px solid #ffd4b0' : '1px solid transparent',
                                }}
                                onMouseEnter={(e) => {
                                    if (t.id !== currentTheme.id) (e.currentTarget as HTMLButtonElement).style.background = '#f4f4f5';
                                }}
                                onMouseLeave={(e) => {
                                    if (t.id !== currentTheme.id) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                                }}
                            >
                                <span
                                    className="w-6 h-6 rounded-lg flex-shrink-0 border border-black/10"
                                    style={{ background: t.palette.primary }}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-semibold text-[#0f172a] truncate">{t.name}</div>
                                    <div className="text-[10px] text-[#94a3b8]">
                                        {t.columns === 2 ? '2-column' : '1-column'} · {t.spacing || 'normal'}
                                    </div>
                                </div>
                                {t.id === currentTheme.id && (
                                    <span className="text-[#ff6b00] text-sm flex-shrink-0">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
