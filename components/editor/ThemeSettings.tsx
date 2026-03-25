'use client';

import React, { useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useResumeStore } from '@/store/resumeStore';
import { getThemeById } from '@/lib/theme';
import type { ResumeTheme, ThemePalette } from '@/types';

const PALETTE_FIELDS: Array<{ key: keyof ThemePalette; label: string }> = [
    { key: 'primary', label: 'Primary' },
    { key: 'secondary', label: 'Secondary' },
    { key: 'accent', label: 'Accent' },
    { key: 'textColor', label: 'Text' },
    { key: 'neutralBackground', label: 'Canvas' },
    { key: 'sidebarBackground', label: 'Sidebar' },
];

const FONT_OPTIONS = [
    { label: 'Inter', value: "'Inter', 'Plus Jakarta Sans', sans-serif" },
    { label: 'Outfit', value: "'Outfit', 'Inter', sans-serif" },
    { label: 'Jakarta Sans', value: "'Plus Jakarta Sans', 'Inter', sans-serif" },
    { label: 'Georgia', value: "'Georgia', 'Times New Roman', serif" },
    { label: 'Monospace', value: "'SFMono-Regular', 'Consolas', monospace" },
];

const HEADING_FONT_OPTIONS = [
    { label: 'Match body', value: '' },
    { label: 'Outfit', value: "'Outfit', 'Inter', sans-serif" },
    { label: 'Inter', value: "'Inter', 'Plus Jakarta Sans', sans-serif" },
    { label: 'Georgia', value: "'Georgia', serif" },
];

const SPACING_OPTIONS: NonNullable<ResumeTheme['spacing']>[] = ['compact', 'normal', 'spacious'];
const BULLET_OPTIONS: NonNullable<ResumeTheme['bulletStyle']>[] = ['dot', 'dash', 'arrow', 'square'];

function ThemeCard({ theme }: { theme: ResumeTheme }) {
    const palette = theme.palette;

    return (
        <div
            className="rounded-2xl border p-4"
            style={{
                background: palette.neutralBackground || '#ffffff',
                borderColor: `${palette.primary}30`,
                color: palette.textColor || '#0f172a',
            }}
        >
            <div
                className="rounded-xl p-4"
                style={{
                    background:
                        theme.category === 'creative'
                            ? `linear-gradient(135deg, ${palette.primary}, ${palette.accent || palette.secondary || palette.primary})`
                            : palette.primary,
                    color: '#ffffff',
                }}
            >
                <div className="text-lg font-black">Alex Johnson</div>
                <div className="text-xs opacity-80">Senior Product Engineer</div>
            </div>

            <div className="mt-4 space-y-3">
                <div>
                    <div
                        className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em]"
                        style={{ color: palette.primary }}
                    >
                        Experience
                    </div>
                    <div className="space-y-1.5 text-xs">
                        <div className="font-semibold">Rambo Labs</div>
                        <div className="opacity-70">Product Engineer</div>
                        <div className="flex gap-2">
                            <span style={{ color: palette.accent || palette.primary }}>•</span>
                            <span className="opacity-80">Shipped a polished resume workflow used by thousands.</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    {[palette.primary, palette.secondary, palette.accent].filter(Boolean).map((color, index) => (
                        <span
                            key={`${color}-${index}`}
                            className="h-6 flex-1 rounded-full border"
                            style={{ background: color, borderColor: 'rgba(15,23,42,0.08)' }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function Segmented<T extends string>({
    label,
    options,
    value,
    onChange,
}: {
    label: string;
    options: T[];
    value: T;
    onChange: (next: T) => void;
}) {
    return (
        <div>
            <div className="mb-2 text-[11px] font-semibold text-white/70">{label}</div>
            <div className="grid grid-cols-3 gap-2">
                {options.map((option) => {
                    const active = option === value;
                    return (
                        <button
                            key={option}
                            onClick={() => onChange(option)}
                            className="rounded-xl border px-3 py-2 text-xs font-semibold capitalize transition-all"
                            style={{
                                background: active ? '#ff6b00' : 'rgba(255,255,255,0.04)',
                                color: active ? '#ffffff' : '#cbd5e1',
                                borderColor: active ? '#ff6b00' : 'rgba(255,255,255,0.08)',
                            }}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export function ThemeSettings() {
    const [open, setOpen] = useState(false);
    const { currentTheme, setCurrentTheme, updateThemePalette, updateThemeProperty } = useResumeStore();

    const baseTheme = useMemo(() => getThemeById(currentTheme.id), [currentTheme.id]);

    const handleReset = () => {
        setCurrentTheme(baseTheme);
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition-all hover:-translate-y-0.5"
                style={{
                    background: '#ffffff',
                    borderColor: '#e2e8f0',
                    color: '#0f172a',
                }}
                id="theme-settings-btn"
            >
                <span
                    className="inline-flex h-7 w-7 items-center justify-center rounded-xl text-white"
                    style={{ background: currentTheme.palette.primary }}
                >
                    ✦
                </span>
                Theme Studio
            </button>

            <Modal open={open} onClose={() => setOpen(false)} title="Theme Studio" maxWidth="max-w-5xl">
                <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-bold text-white">{currentTheme.name}</div>
                                    <div className="text-xs text-white/50">
                                        Live adjustments for color, typography, and layout density.
                                    </div>
                                </div>
                                <button
                                    onClick={handleReset}
                                    className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 transition-all hover:border-[#ff6b00]/40 hover:text-white"
                                >
                                    Reset
                                </button>
                            </div>
                            <ThemeCard theme={currentTheme} />
                        </div>

                        <Segmented
                            label="Spacing"
                            options={SPACING_OPTIONS}
                            value={currentTheme.spacing || 'normal'}
                            onChange={(value) => updateThemeProperty('spacing', value)}
                        />

                        <Segmented
                            label="Bullet Style"
                            options={BULLET_OPTIONS}
                            value={currentTheme.bulletStyle || 'dot'}
                            onChange={(value) => updateThemeProperty('bulletStyle', value)}
                        />
                    </div>

                    <div className="space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-[11px] font-semibold text-white/70">Body Font</label>
                                <select
                                    value={currentTheme.fontFamily}
                                    onChange={(e) => updateThemeProperty('fontFamily', e.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none"
                                >
                                    {FONT_OPTIONS.map((option) => (
                                        <option key={option.label} value={option.value} style={{ color: '#0f172a' }}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-[11px] font-semibold text-white/70">Heading Font</label>
                                <select
                                    value={currentTheme.fontFamilyHeading || ''}
                                    onChange={(e) => updateThemeProperty('fontFamilyHeading', e.target.value || undefined)}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none"
                                >
                                    {HEADING_FONT_OPTIONS.map((option) => (
                                        <option key={option.label} value={option.value} style={{ color: '#0f172a' }}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="mb-3 text-sm font-bold text-white">Color System</div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {PALETTE_FIELDS.map(({ key, label }) => {
                                    const color = currentTheme.palette[key] || (key === 'neutralBackground' ? '#ffffff' : '#0f172a');
                                    return (
                                        <label key={key} className="rounded-2xl border border-white/8 bg-black/10 p-3">
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-xs font-semibold text-white/80">{label}</span>
                                                <span className="text-[11px] text-white/40">{color}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="color"
                                                    value={normalizeColor(color)}
                                                    onChange={(e) => updateThemePalette(key, e.target.value)}
                                                    className="h-11 w-14 cursor-pointer rounded-xl border border-white/10 bg-transparent"
                                                />
                                                <input
                                                    type="text"
                                                    value={color}
                                                    onChange={(e) => updateThemePalette(key, e.target.value)}
                                                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                                                />
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}

function normalizeColor(value: string): string {
    if (/^#[0-9a-f]{6}$/i.test(value)) return value;
    if (/^#[0-9a-f]{3}$/i.test(value)) {
        const [, r, g, b] = value;
        return `#${r}${r}${g}${g}${b}${b}`;
    }

    return '#0f172a';
}
