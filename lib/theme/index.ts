// ============================================================
// lib/theme/index.ts — 18 expertly crafted resume themes
// 10 ATS-Optimized · 8 Design-Forward Creative
// ============================================================

import type { ResumeTheme, ThemePalette, TemplateCategory } from '@/types';

export const BUILTIN_THEMES: ResumeTheme[] = [

    // ──────────────────────────────────────────────────────────
    // ATS-OPTIMIZED (10) — Machine-parsable, recruiter-optimized
    // ──────────────────────────────────────────────────────────

    {
        id: 'classic-professional',
        name: 'Classic Professional',
        description: 'Timeless left-aligned layout trusted by Fortune 500 recruiters. Clean, readable, and universally compatible.',
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

    {
        id: 'minimal-clean',
        name: 'Minimal Clean',
        description: 'Ultra-clean centered layout with generous whitespace and elegant typography. Timeless and sophisticated.',
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

    {
        id: 'modern-ats',
        name: 'Modern ATS',
        description: 'Bold orange accents with maximum ATS parser readability. Optimized for tech and startup roles.',
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

    {
        id: 'compact-developer',
        name: 'Compact Developer',
        description: 'Dense technical layout optimized for software engineers. Maximizes content while staying highly readable.',
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

    {
        id: 'executive-impact',
        name: 'Executive Impact',
        description: 'Dark navy header with crisp underline sections. Commands C-suite gravitas and conveys authority.',
        category: 'ats',
        templateId: 'executive-impact',
        columns: 1,
        palette: {
            primary: '#0d1b2a',
            secondary: '#1b4f72',
            accent: '#2e86ab',
            neutralBackground: '#ffffff',
            textColor: '#1a1a2e',
        },
        fontFamily: "'Inter', sans-serif",
        fontFamilyHeading: "'Inter', sans-serif",
        headerStyle: 'left',
        sectionHeadingStyle: 'underline',
        bulletStyle: 'dot',
        spacing: 'normal',
        borderStyle: 'thick',
    },

    {
        id: 'apex-recruiter',
        name: 'Apex Recruiter',
        description: 'Solid black banner header with a striking red accent bar. Instantly grabs recruiter attention.',
        category: 'ats',
        templateId: 'apex-recruiter',
        columns: 1,
        palette: {
            primary: '#111111',
            secondary: '#222222',
            accent: '#e63946',
            neutralBackground: '#ffffff',
            textColor: '#111111',
        },
        fontFamily: "'Inter', sans-serif",
        headerStyle: 'banner',
        sectionHeadingStyle: 'bold-bar',
        bulletStyle: 'arrow',
        spacing: 'normal',
        borderStyle: 'none',
    },

    {
        id: 'linkedin-smart',
        name: 'LinkedIn Smart',
        description: 'LinkedIn-native blue gradient header with pill contact items. Perfect for corporate professionals.',
        category: 'ats',
        templateId: 'linkedin-smart',
        columns: 1,
        palette: {
            primary: '#0077b5',
            secondary: '#004182',
            accent: '#00a0dc',
            neutralBackground: '#ffffff',
            textColor: '#1c1c1c',
        },
        fontFamily: "'Inter', sans-serif",
        headerStyle: 'banner',
        sectionHeadingStyle: 'underline',
        bulletStyle: 'dot',
        spacing: 'normal',
        borderStyle: 'none',
    },

    {
        id: 'federal-standard',
        name: 'Federal Standard',
        description: 'Plain-text GS-formatted layout with maximum ATS parse safety. Ideal for government and federal applications.',
        category: 'ats',
        templateId: 'federal-standard',
        columns: 1,
        palette: {
            primary: '#1a237e',
            secondary: '#283593',
            accent: '#3f51b5',
            neutralBackground: '#ffffff',
            textColor: '#212121',
        },
        fontFamily: "'Times New Roman', 'Georgia', serif",
        fontFamilyHeading: "'Times New Roman', serif",
        headerStyle: 'left',
        sectionHeadingStyle: 'underline',
        bulletStyle: 'dash',
        spacing: 'spacious',
        borderStyle: 'thin',
    },

    {
        id: 'harvard-classic',
        name: 'Harvard Classic',
        description: 'Centered serif name with full-caps section headers and academic dignity. Trusted by graduates worldwide.',
        category: 'ats',
        templateId: 'harvard-classic',
        columns: 1,
        palette: {
            primary: '#a41034',
            secondary: '#6b0c24',
            accent: '#c41230',
            neutralBackground: '#ffffff',
            textColor: '#1a1a1a',
        },
        fontFamily: "'Garamond', 'Georgia', serif",
        fontFamilyHeading: "'Garamond', 'Georgia', serif",
        headerStyle: 'centered',
        sectionHeadingStyle: 'underline',
        bulletStyle: 'dot',
        spacing: 'spacious',
        borderStyle: 'none',
    },

    {
        id: 'tech-minimal',
        name: 'Tech Minimal',
        description: 'GitHub-inspired monospace feel with grid contact bar. Developer-first with crisp code-style section labels.',
        category: 'ats',
        templateId: 'tech-minimal',
        columns: 1,
        palette: {
            primary: '#24292e',
            secondary: '#1b1f23',
            accent: '#0366d6',
            neutralBackground: '#ffffff',
            textColor: '#24292e',
        },
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontFamilyHeading: "'Inter', sans-serif",
        headerStyle: 'left',
        sectionHeadingStyle: 'simple',
        bulletStyle: 'dash',
        spacing: 'compact',
        borderStyle: 'thin',
    },

    // ──────────────────────────────────────────────────────────
    // DESIGN-FORWARD CREATIVE (8) — Stand out visually
    // ──────────────────────────────────────────────────────────

    {
        id: 'elegant-serif',
        name: 'Elegant Serif',
        description: 'Refined serif typography on warm parchment for executive and academic roles. Exudes quiet confidence.',
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

    {
        id: 'two-column-structured',
        name: 'Two-Column',
        description: 'Professional two-column sidebar layout with navy blue accent. Structured and visually striking.',
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

    {
        id: 'aurora-gradient',
        name: 'Aurora Gradient',
        description: 'Purple-to-teal gradient header with elegant card-style sections. A modern depth that captivates.',
        category: 'creative',
        templateId: 'aurora-gradient',
        columns: 1,
        palette: {
            primary: '#7c3aed',
            secondary: '#0d9488',
            accent: '#06b6d4',
            neutralBackground: '#fafafa',
            textColor: '#1e1e2e',
        },
        fontFamily: "'Inter', sans-serif",
        headerStyle: 'banner',
        sectionHeadingStyle: 'pill',
        bulletStyle: 'dot',
        spacing: 'normal',
        borderStyle: 'none',
    },

    {
        id: 'neon-studio',
        name: 'Neon Studio',
        description: 'Dark background with glowing neon lines. Bold design-agency aesthetic for creative professionals.',
        category: 'creative',
        templateId: 'neon-studio',
        columns: 1,
        palette: {
            primary: '#00ff88',
            secondary: '#00ccff',
            accent: '#ff006e',
            neutralBackground: '#0a0a0f',
            textColor: '#e0e0e0',
        },
        fontFamily: "'Inter', sans-serif",
        headerStyle: 'left',
        sectionHeadingStyle: 'simple',
        bulletStyle: 'dash',
        spacing: 'normal',
        borderStyle: 'none',
    },

    {
        id: 'editorial-bold',
        name: 'Editorial Bold',
        description: 'Magazine-style oversized typographic name with color-block sections. Maximum visual impact.',
        category: 'creative',
        templateId: 'editorial-bold',
        columns: 1,
        palette: {
            primary: '#ff3b30',
            secondary: '#1c1c1e',
            accent: '#ff9500',
            neutralBackground: '#ffffff',
            textColor: '#1c1c1e',
        },
        fontFamily: "'Inter', sans-serif",
        headerStyle: 'left',
        sectionHeadingStyle: 'bold-bar',
        bulletStyle: 'dash',
        spacing: 'normal',
        borderStyle: 'none',
    },

    {
        id: 'portfolio-card',
        name: 'Portfolio Card',
        description: 'Card-based sections with gradient header and profile photo support. Perfect for designers and product managers.',
        category: 'creative',
        templateId: 'portfolio-card',
        columns: 1,
        palette: {
            primary: '#6366f1',
            secondary: '#4f46e5',
            accent: '#a855f7',
            neutralBackground: '#f8fafc',
            textColor: '#0f172a',
        },
        fontFamily: "'Inter', sans-serif",
        headerStyle: 'banner',
        sectionHeadingStyle: 'pill',
        bulletStyle: 'dot',
        spacing: 'normal',
        borderStyle: 'none',
    },

    {
        id: 'artisan-serif',
        name: 'Artisan Serif',
        description: 'Warm cream background with ornate decorative dividers and serif typography. Luxurious print-quality feel.',
        category: 'creative',
        templateId: 'artisan-serif',
        columns: 1,
        palette: {
            primary: '#3d2b1f',
            secondary: '#6b4c2a',
            accent: '#d4a574',
            neutralBackground: '#fef9f0',
            textColor: '#2c1810',
        },
        fontFamily: "'Merriweather', 'Georgia', serif",
        fontFamilyHeading: "'Merriweather', 'Georgia', serif",
        headerStyle: 'centered',
        sectionHeadingStyle: 'underline',
        bulletStyle: 'dot',
        spacing: 'spacious',
        borderStyle: 'none',
    },

    {
        id: 'kinetic-dark',
        name: 'Kinetic Dark',
        description: 'All-dark resume with amber/orange gradient text and geometric lines. For bold modern professionals.',
        category: 'creative',
        templateId: 'kinetic-dark',
        columns: 1,
        palette: {
            primary: '#f59e0b',
            secondary: '#fb923c',
            accent: '#fbbf24',
            neutralBackground: '#0f0f14',
            textColor: '#e2e8f0',
        },
        fontFamily: "'Inter', sans-serif",
        headerStyle: 'left',
        sectionHeadingStyle: 'simple',
        bulletStyle: 'arrow',
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
