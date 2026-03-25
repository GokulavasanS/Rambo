// ============================================================
// lib/theme/index.ts — 6 truly distinct resume themes
// ============================================================

import type { ResumeTheme, ThemePalette, TemplateCategory } from '@/types';

export const BUILTIN_THEMES: ResumeTheme[] = [
    // ----------------------------------------------------------
    // 1. Classic Professional — left-aligned, thin separators
    // ----------------------------------------------------------
    {
        id: 'classic-professional',
        name: 'Classic Professional',
        description: 'Timeless left-aligned layout trusted by Fortune 500 recruiters.',
        category: 'ats',
        templateId: 'classic-professional',
        columns: 1,
        palette: {
            primary: '#1a2e4a',
            secondary: '#2d4a6e',
            accent: '#1a2e4a',
            neutralBackground: '#ffffff',
            textColor: '#1a2332',
        },
        fontFamily: "'Inter', 'Roboto', sans-serif",
        headerStyle: 'left',
        sectionHeadingStyle: 'underline',
        bulletStyle: 'dot',
        spacing: 'normal',
        borderStyle: 'none',
    },

    // ----------------------------------------------------------
    // 2. Minimal Clean — centered header, generous whitespace
    // ----------------------------------------------------------
    {
        id: 'minimal-clean',
        name: 'Minimal Clean',
        description: 'Ultra-clean centered layout with generous whitespace. Timeless.',
        category: 'ats',
        templateId: 'minimal-clean',
        columns: 1,
        palette: {
            primary: '#000000',
            secondary: '#333333',
            accent: '#888888',
            neutralBackground: '#ffffff',
            textColor: '#111111',
        },
        fontFamily: "'Inter', system-ui, sans-serif",
        headerStyle: 'centered',
        sectionHeadingStyle: 'simple',
        bulletStyle: 'dash',
        spacing: 'spacious',
        borderStyle: 'none',
    },

    // ----------------------------------------------------------
    // 3. Modern ATS — bold section headings, high readability
    // ----------------------------------------------------------
    {
        id: 'modern-ats',
        name: 'Modern ATS',
        description: 'Bold orange accents with maximum ATS parser readability.',
        category: 'ats',
        templateId: 'modern-ats',
        columns: 1,
        palette: {
            primary: '#ff6b00',
            secondary: '#0f172a',
            accent: '#ff6b00',
            neutralBackground: '#ffffff',
            textColor: '#0f172a',
        },
        fontFamily: "'Inter', sans-serif",
        headerStyle: 'left',
        sectionHeadingStyle: 'bold-bar',
        bulletStyle: 'arrow',
        spacing: 'normal',
        borderStyle: 'none',
    },

    // ----------------------------------------------------------
    // 4. Compact Developer — dense layout, monospace feel
    // ----------------------------------------------------------
    {
        id: 'compact-developer',
        name: 'Compact Developer',
        description: 'Dense technical layout optimized for software engineers.',
        category: 'ats',
        templateId: 'compact-developer',
        columns: 1,
        palette: {
            primary: '#4f46e5',
            secondary: '#1e1b4b',
            accent: '#818cf8',
            neutralBackground: '#fafafa',
            textColor: '#1e1b4b',
        },
        fontFamily: "'Inter', 'JetBrains Mono', monospace",
        fontFamilyHeading: "'Inter', sans-serif",
        headerStyle: 'left',
        sectionHeadingStyle: 'pill',
        bulletStyle: 'square',
        spacing: 'compact',
        borderStyle: 'thin',
    },

    // ----------------------------------------------------------
    // 5. Elegant Serif — serif typography, refined aesthetics
    // ----------------------------------------------------------
    {
        id: 'elegant-serif',
        name: 'Elegant Serif',
        description: 'Refined serif typography for high-end executive and academic roles.',
        category: 'creative',
        templateId: 'elegant-serif',
        columns: 1,
        palette: {
            primary: '#6b4c2a',
            secondary: '#8c6d47',
            accent: '#c9a96e',
            neutralBackground: '#fdf8f3',
            textColor: '#2d1f0e',
        },
        fontFamily: "'Merriweather', 'Georgia', serif",
        fontFamilyHeading: "'Merriweather', 'Georgia', serif",
        headerStyle: 'centered',
        sectionHeadingStyle: 'underline',
        bulletStyle: 'dot',
        spacing: 'spacious',
        borderStyle: 'none',
    },

    // ----------------------------------------------------------
    // 6. Two-Column Structured — sidebar layout
    // ----------------------------------------------------------
    {
        id: 'two-column-structured',
        name: 'Two-Column',
        description: 'Creative two-column sidebar layout that visually pops.',
        category: 'creative',
        templateId: 'two-column-structured',
        columns: 2,
        palette: {
            primary: '#1e3a5f',
            secondary: '#2d6a8f',
            accent: '#4a9ed6',
            neutralBackground: '#ffffff',
            textColor: '#1a2332',
            sidebarBackground: '#1e3a5f',
        },
        fontFamily: "'Inter', sans-serif",
        headerStyle: 'left',
        sectionHeadingStyle: 'simple',
        bulletStyle: 'dot',
        spacing: 'normal',
        borderStyle: 'none',
    },
];

export const DEFAULT_THEME_ID = 'classic-professional';

export function getThemeById(id: string): ResumeTheme {
    return BUILTIN_THEMES.find((t) => t.id === id) ?? BUILTIN_THEMES[0];
}

export function getThemesByCategory(category: TemplateCategory): ResumeTheme[] {
    return BUILTIN_THEMES.filter((t) => t.category === category);
}

/**
 * Generate two ResumeTheme variants from an extracted palette.
 */
export function generateThemesFromPalette(
    palette: ThemePalette,
    columns: 1 | 2
): [ResumeTheme, ResumeTheme] {
    const id1 = `custom-styled-${Date.now()}`;
    const id2 = `custom-clean-${Date.now() + 1}`;

    const themeA: ResumeTheme = {
        id: id1,
        name: 'Style Match',
        description: 'Matched from uploaded resume image.',
        category: 'creative',
        templateId: columns === 2 ? 'two-column-structured' : 'classic-professional',
        columns,
        palette,
        fontFamily: "'Inter', sans-serif",
        headerStyle: columns === 2 ? 'left' : 'centered',
        sectionHeadingStyle: 'underline',
        bulletStyle: 'dot',
        spacing: 'normal',
        borderStyle: columns === 2 ? 'none' : 'thin',
    };

    const themeB: ResumeTheme = {
        id: id2,
        name: 'ATS Safe',
        description: 'ATS-optimized version using your extracted palette.',
        category: 'ats',
        templateId: 'modern-ats',
        columns: 1,
        palette: {
            primary: palette.primary,
            secondary: '#444444',
            accent: palette.accent ?? palette.primary,
            neutralBackground: '#ffffff',
            textColor: '#1a1a1a',
        },
        fontFamily: "'Inter', sans-serif",
        headerStyle: 'left',
        sectionHeadingStyle: 'bold-bar',
        bulletStyle: 'arrow',
        spacing: 'normal',
        borderStyle: 'none',
    };

    return [themeA, themeB];
}
