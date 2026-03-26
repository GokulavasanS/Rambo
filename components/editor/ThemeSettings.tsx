'use client';

import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useResumeStore } from '@/store/resumeStore';
import { getThemeById } from '@/lib/theme';
import type { ResumeTheme, ThemePalette } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const PALETTE_FIELDS: Array<{ key: keyof ThemePalette; label: string; description: string }> = [
    { key: 'primary',           label: 'Primary',  description: 'Headings & links'       },
    { key: 'secondary',         label: 'Secondary', description: 'Accents & tags'        },
    { key: 'accent',            label: 'Accent',    description: 'Highlights & icons'    },
    { key: 'textColor',         label: 'Body Text', description: 'Main text color'       },
    { key: 'neutralBackground', label: 'Canvas',    description: 'Page background'       },
    { key: 'sidebarBackground', label: 'Sidebar',   description: 'Left panel background' },
];

const FONT_OPTIONS = [
    { label: 'Inter',             value: "'Inter', sans-serif"              },
    { label: 'Roboto',            value: "'Roboto', sans-serif"             },
    { label: 'Open Sans',         value: "'Open Sans', sans-serif"          },
    { label: 'Lato',              value: "'Lato', sans-serif"               },
    { label: 'Manrope',           value: "'Manrope', sans-serif"            },
    { label: 'DM Sans',           value: "'DM Sans', sans-serif"            },
    { label: 'Plus Jakarta Sans', value: "'Plus Jakarta Sans', sans-serif"  },
    { label: 'Merriweather',      value: "'Merriweather', serif"            },
    { label: 'Georgia',           value: "'Georgia', 'Times New Roman', serif" },
] as const;

const HEADING_FONT_OPTIONS = [
    { label: 'Same as body', value: '' },
    ...FONT_OPTIONS,
] as const;

const BULLET_OPTIONS: NonNullable<ResumeTheme['bulletStyle']>[] = ['dot', 'dash', 'arrow', 'square'];

const BULLET_SYMBOLS: Record<NonNullable<ResumeTheme['bulletStyle']>, string> = {
    dot:    '•',
    dash:   '–',
    arrow:  '›',
    square: '▪',
};

const SPACING_PRESETS = [
    { label: 'Compact',  value: 0.85 },
    { label: 'Normal',   value: 1.00 },
    { label: 'Airy',     value: 1.25 },
];

// ─── Color Utilities ──────────────────────────────────────────────────────────

/** Expand 3-char hex and validate; returns a safe 6-char hex or fallback */
function normalizeColor(value: string, fallback = '#0f172a'): string {
    const trimmed = value?.trim() ?? '';
    if (/^#[0-9a-f]{6}$/i.test(trimmed)) return trimmed.toLowerCase();
    if (/^#[0-9a-f]{3}$/i.test(trimmed)) {
        const [, r, g, b] = trimmed;
        return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
    }
    return fallback;
}

function getLuminance(hex: string): number {
    const safe = normalizeColor(hex, '#888888');
    const m = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(safe);
    if (!m) return 0.5;
    return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
        .map((v) => {
            const s = v / 255;
            return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        })
        .reduce((acc, c, i) => acc + c * [0.2126, 0.7152, 0.0722][i], 0);
}

function getContrast(hex1: string, hex2: string): number {
    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
    return (lighter + 0.05) / (darker + 0.05);
}

function getContrastLabel(ratio: number): { label: string; color: string } {
    if (ratio >= 7)   return { label: 'AAA', color: '#34d399' };
    if (ratio >= 4.5) return { label: 'AA',  color: '#86efac' };
    if (ratio >= 3)   return { label: 'AA+', color: '#fbbf24' };
    return { label: 'Fail', color: '#f87171' };
}

// ─── Helper: numerical spacing ─────────────────────────────────────────────────

function toNumericalSpacing(spacing: ResumeTheme['spacing']): number {
    if (typeof spacing === 'number') return spacing;
    if (spacing === 'compact')  return 0.85;
    if (spacing === 'spacious') return 1.25;
    return 1.0;
}

// ─── Debounce hook ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useDebounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    return useCallback(
        (...args: Parameters<T>) => {
            clearTimeout(timer.current);
            timer.current = setTimeout(() => fn(...args), delay);
        },
        [fn, delay],
    ) as T;
}

// ─── ThemeCard (live mini-preview) ────────────────────────────────────────────

function ThemeCard({ theme }: { theme: ResumeTheme }) {
    const { palette } = theme;
    const bg   = palette.neutralBackground || '#ffffff';
    const text = palette.textColor         || '#0f172a';

    return (
        <div
            className="overflow-hidden rounded-2xl border transition-all duration-300"
            style={{ background: bg, borderColor: `${palette.primary}25`, color: text }}
        >
            {/* Header band */}
            <div
                className="px-4 py-3"
                style={{
                    background:
                        theme.category === 'creative'
                            ? `linear-gradient(135deg, ${palette.primary}, ${palette.accent || palette.secondary || palette.primary})`
                            : palette.primary,
                }}
            >
                <div className="text-base font-black tracking-tight" style={{ color: '#ffffff' }}>
                    Alex Johnson
                </div>
                <div className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.78)' }}>
                    Senior Product Engineer
                </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
                <div>
                    <div
                        className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.2em]"
                        style={{ color: palette.primary }}
                    >
                        Experience
                    </div>
                    <div className="space-y-1 text-[11px]">
                        <div className="font-semibold" style={{ color: text }}>
                            Rambo Labs
                        </div>
                        <div style={{ color: `${text}99` }}>Product Engineer · 2022–Present</div>
                        <div className="flex gap-1.5 items-start">
                            <span style={{ color: palette.accent || palette.primary, lineHeight: 1.4 }}>
                                {BULLET_SYMBOLS[theme.bulletStyle || 'dot']}
                            </span>
                            <span style={{ color: `${text}bb` }}>
                                Shipped a polished resume workflow used by thousands.
                            </span>
                        </div>
                    </div>
                </div>

                {/* Color swatches */}
                <div className="flex gap-1.5 pt-1">
                    {[palette.primary, palette.secondary, palette.accent]
                        .filter(Boolean)
                        .map((color, i) => (
                            <span
                                key={`${color}-${i}`}
                                className="h-5 flex-1 rounded-full border"
                                style={{ background: color, borderColor: 'rgba(0,0,0,0.08)' }}
                                title={color}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
}

// ─── ColorSwatch (color picker + hex input) ────────────────────────────────────

interface ColorSwatchProps {
    label: string;
    description: string;
    colorKey: keyof ThemePalette;
    value: string;
    canvasColor: string;
    onChange: (key: keyof ThemePalette, value: string) => void;
}

function ColorSwatch({ label, description, colorKey, value, canvasColor, onChange }: ColorSwatchProps) {
    const [localHex, setLocalHex] = useState(value);
    const safeValue = normalizeColor(value, '#0f172a');

    // Sync local state when external value changes
    useEffect(() => { setLocalHex(value); }, [value]);

    const debouncedChange = useDebounce(
        useCallback((v: string) => onChange(colorKey, v), [colorKey, onChange]),
        120,
    );

    const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        setLocalHex(raw);
        const normalized = normalizeColor(raw, '');
        if (normalized) debouncedChange(normalized);
    };

    const handleHexBlur = () => {
        const normalized = normalizeColor(localHex, safeValue);
        setLocalHex(normalized);
        onChange(colorKey, normalized);
    };

    const shouldCheckContrast = colorKey !== 'neutralBackground' && colorKey !== 'sidebarBackground';
    const contrast = shouldCheckContrast ? getContrast(safeValue, canvasColor) : null;
    const contrastInfo = contrast !== null ? getContrastLabel(contrast) : null;

    return (
        <label
            className="block rounded-2xl border p-3 cursor-pointer transition-all duration-150 hover:border-white/20"
            style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.15)' }}
        >
            <div className="mb-2.5 flex items-start justify-between gap-2">
                <div>
                    <div className="text-xs font-semibold text-white">{label}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">{description}</div>
                </div>
                {contrastInfo && (
                    <span
                        className="mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold tracking-wider"
                        style={{ color: contrastInfo.color, background: `${contrastInfo.color}18` }}
                        title={`Contrast ratio: ${contrast?.toFixed(1)}:1`}
                    >
                        {contrastInfo.label}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-2.5">
                {/* Native color picker — styled as a rounded swatch */}
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-white/15 shadow-inner">
                    <input
                        type="color"
                        value={safeValue}
                        onChange={(e) => { setLocalHex(e.target.value); onChange(colorKey, e.target.value); }}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        aria-label={`Pick ${label} color`}
                    />
                    <div
                        className="h-full w-full transition-colors duration-150"
                        style={{ background: safeValue }}
                    />
                </div>

                {/* Hex text input */}
                <input
                    type="text"
                    value={localHex}
                    onChange={handleHexInput}
                    onBlur={handleHexBlur}
                    placeholder="#000000"
                    maxLength={7}
                    spellCheck={false}
                    className="w-full rounded-xl border px-3 py-2 text-sm font-mono text-white outline-none transition-all duration-150 focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00]/30"
                    style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                    aria-label={`${label} hex value`}
                />
            </div>
        </label>
    );
}

// ─── BulletPicker ──────────────────────────────────────────────────────────────

function BulletPicker({
    value,
    onChange,
}: {
    value: NonNullable<ResumeTheme['bulletStyle']>;
    onChange: (v: NonNullable<ResumeTheme['bulletStyle']>) => void;
}) {
    return (
        <div>
            <div className="mb-2 text-[11px] font-semibold text-white/70">Bullet Style</div>
            <div className="grid grid-cols-4 gap-2">
                {BULLET_OPTIONS.map((opt) => (
                    <button
                        key={opt}
                        onClick={() => onChange(opt)}
                        aria-pressed={opt === value}
                        className="flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition-all duration-150"
                        style={{
                            background:     opt === value ? '#ff6b00'               : 'rgba(255,255,255,0.04)',
                            color:          opt === value ? '#ffffff'               : '#94a3b8',
                            borderColor:    opt === value ? '#ff6b00'               : 'rgba(255,255,255,0.08)',
                        }}
                    >
                        <span className="text-lg leading-none">{BULLET_SYMBOLS[opt]}</span>
                        <span className="capitalize">{opt}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── SpacingControl ────────────────────────────────────────────────────────────

function SpacingControl({
    value,
    onChange,
}: {
    value: number;
    onChange: (v: number) => void;
}) {
    const activePreset = SPACING_PRESETS.find((p) => Math.abs(p.value - value) < 0.01);

    return (
        <div>
            <div className="mb-2 flex items-center justify-between">
                <div className="text-[11px] font-semibold text-white/70">Spacing & Density</div>
                <div className="flex items-center gap-1.5">
                    {activePreset && (
                        <span className="rounded-md bg-[#ff6b00]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#ff6b00] uppercase tracking-wider">
                            {activePreset.label}
                        </span>
                    )}
                    <span className="text-[10px] font-mono text-white/40">{value.toFixed(2)}×</span>
                </div>
            </div>

            {/* Quick presets */}
            <div className="mb-3 flex gap-2">
                {SPACING_PRESETS.map((p) => (
                    <button
                        key={p.value}
                        onClick={() => onChange(p.value)}
                        className="flex-1 rounded-lg border py-1.5 text-[11px] font-semibold transition-all"
                        style={{
                            background:  Math.abs(p.value - value) < 0.01 ? '#ff6b00'              : 'rgba(255,255,255,0.04)',
                            color:       Math.abs(p.value - value) < 0.01 ? '#ffffff'              : '#94a3b8',
                            borderColor: Math.abs(p.value - value) < 0.01 ? '#ff6b00'              : 'rgba(255,255,255,0.08)',
                        }}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Fine-tuning slider */}
            <input
                type="range"
                min="0.8"
                max="1.4"
                step="0.05"
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full accent-[#ff6b00]"
                aria-label="Spacing density"
            />
            <div className="mt-1 flex justify-between text-[9px] text-white/30">
                <span>Tighter</span>
                <span>Looser</span>
            </div>
        </div>
    );
}

// ─── FontSelect ────────────────────────────────────────────────────────────────

function FontSelect({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: readonly { label: string; value: string }[];
    onChange: (v: string) => void;
}) {
    return (
        <div>
            <label className="mb-2 block text-[11px] font-semibold text-white/70">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full appearance-none rounded-xl border px-3 py-3 text-sm text-white outline-none transition-all duration-150 focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00]/30"
                    style={{
                        background:   'rgba(255,255,255,0.05)',
                        borderColor:  'rgba(255,255,255,0.10)',
                        fontFamily:   value || undefined,
                    }}
                >
                    {options.map((opt) => (
                        <option
                            key={opt.label}
                            value={opt.value}
                            style={{ color: '#0f172a', fontFamily: opt.value }}
                        >
                            {opt.label}
                        </option>
                    ))}
                </select>
                {/* Chevron */}
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
            </div>
            {/* Font preview line */}
            <div
                className="mt-1.5 truncate text-[11px] text-white/40"
                style={{ fontFamily: value || undefined }}
            >
                The quick brown fox jumps over the lazy dog
            </div>
        </div>
    );
}

// ─── ThemeSettings (main export) ──────────────────────────────────────────────

export function ThemeSettings() {
    const [open, setOpen] = useState(false);
    const { currentTheme, setCurrentTheme, updateThemePalette, updateThemeProperty } = useResumeStore();
    const baseTheme = useMemo(() => getThemeById(currentTheme.id), [currentTheme.id]);

    const handleReset = useCallback(() => {
        if (window.confirm('Reset all theme changes?')) setCurrentTheme(baseTheme);
    }, [baseTheme, setCurrentTheme]);

    const spacingValue = toNumericalSpacing(currentTheme.spacing);
    const canvasColor  = normalizeColor(currentTheme.palette.neutralBackground ?? '#ffffff', '#ffffff');

    return (
        <>
            {/* Trigger button */}
            <button
                onClick={() => setOpen(true)}
                id="theme-settings-btn"
                aria-label="Open Theme Studio"
                className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-[0_20px_48px_rgba(15,23,42,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_56px_rgba(15,23,42,0.28)] active:scale-[0.98]"
                style={{ background: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' }}
            >
                <span
                    className="inline-flex h-7 w-7 items-center justify-center rounded-xl text-sm text-white"
                    style={{ background: currentTheme.palette.primary }}
                >
                    ✦
                </span>
                Theme Studio
            </button>

            <Modal open={open} onClose={() => setOpen(false)} title="Theme Studio" maxWidth="max-w-5xl">
                <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">

                    {/* ── Left column: preview + spacing + bullets ── */}
                    <div className="space-y-5">
                        {/* Live preview card */}
                        <div
                            className="rounded-2xl border p-4"
                            style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-bold text-white">{currentTheme.name}</div>
                                    <div className="text-[11px] text-white/40 mt-0.5">Live preview</div>
                                </div>
                                <button
                                    onClick={handleReset}
                                    className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/60 transition-all hover:border-white/25 hover:text-white"
                                >
                                    Reset
                                </button>
                            </div>
                            <ThemeCard theme={currentTheme} />
                        </div>

                        <SpacingControl
                            value={spacingValue}
                            onChange={(v) => updateThemeProperty('spacing', v)}
                        />

                        <BulletPicker
                            value={currentTheme.bulletStyle || 'dot'}
                            onChange={(v) => updateThemeProperty('bulletStyle', v)}
                        />
                    </div>

                    {/* ── Right column: fonts + colors ── */}
                    <div className="space-y-5">
                        {/* Typography */}
                        <div
                            className="rounded-2xl border p-4 space-y-4"
                            style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
                        >
                            <div className="text-sm font-bold text-white">Typography</div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <FontSelect
                                    label="Body Font"
                                    value={currentTheme.fontFamily}
                                    options={FONT_OPTIONS}
                                    onChange={(v) => updateThemeProperty('fontFamily', v)}
                                />
                                <FontSelect
                                    label="Heading Font"
                                    value={currentTheme.fontFamilyHeading || ''}
                                    options={HEADING_FONT_OPTIONS}
                                    onChange={(v) => updateThemeProperty('fontFamilyHeading', v || undefined)}
                                />
                            </div>
                        </div>

                        {/* Color system */}
                        <div
                            className="rounded-2xl border p-4"
                            style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <div className="text-sm font-bold text-white">Color System</div>
                                <div className="text-[10px] text-white/30">AA = 4.5:1 • AAA = 7:1</div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                {PALETTE_FIELDS.map(({ key, label, description }) => (
                                    <ColorSwatch
                                        key={key}
                                        colorKey={key}
                                        label={label}
                                        description={description}
                                        value={currentTheme.palette[key] ?? (key === 'neutralBackground' ? '#ffffff' : '#0f172a')}
                                        canvasColor={canvasColor}
                                        onChange={updateThemePalette}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}
