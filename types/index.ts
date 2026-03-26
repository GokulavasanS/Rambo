// ============================================================
// types/index.ts — Central type definitions for Rambo
// ============================================================

export type ResumeSectionType =
    | 'summary'
    | 'experience'
    | 'projects'
    | 'education'
    | 'skills'
    | 'certifications'
    | 'other';

export interface ResumeBullet {
    id: string;
    text: string;
}

/** Each experience/project/education entry */
export interface ResumeEntry {
    id: string;
    /** Company, School, or Project name */
    organization: string;
    /** Role title, degree, or project subtitle */
    role: string;
    /** Date range or year e.g. "2021 – Present" */
    period?: string;
    /** Location (optional) */
    location?: string;
    /** Optional paragraph description (alternative to bullets) */
    description?: string;
    bullets: ResumeBullet[];
}

export interface ResumeSection {
    id: string;
    type: ResumeSectionType;
    title: string;
    /** Structured entries (experience, education, projects) */
    entries?: ResumeEntry[];
    /** Flat bullets (skills, summary, certifications) */
    bullets?: ResumeBullet[];
    rawText?: string;
}

export interface ResumeContact {
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
    links?: string[];
}

export interface ResumeMeta {
    createdAt: string;
    updatedAt: string;
}

export interface ResumeData {
    id: string;
    fullName: string;
    title?: string;
    /** Optional base64 data URL for profile photo */
    profilePhoto?: string;
    contact?: ResumeContact;
    sections: ResumeSection[];
    meta?: ResumeMeta;
}

// ============================================================
// Theme System — 6 distinct templates
// ============================================================

export type TemplateId =
    // ATS-Optimized (10)
    | 'classic-professional'
    | 'minimal-clean'
    | 'modern-ats'
    | 'compact-developer'
    | 'executive-impact'
    | 'apex-recruiter'
    | 'linkedin-smart'
    | 'federal-standard'
    | 'harvard-classic'
    | 'tech-minimal'
    // Design-Forward Creative (8)
    | 'elegant-serif'
    | 'two-column-structured'
    | 'aurora-gradient'
    | 'neon-studio'
    | 'editorial-bold'
    | 'portfolio-card'
    | 'artisan-serif'
    | 'kinetic-dark';

export type TemplateCategory = 'ats' | 'creative';

export interface ThemePalette {
    primary: string;
    secondary?: string;
    accent?: string;
    neutralBackground?: string;
    textColor?: string;
    sidebarBackground?: string;
}

export interface ResumeTheme {
    id: string;
    name: string;
    /** Human-readable description shown in the template picker */
    description?: string;
    /** Whether this template is ATS-safe or visually creative */
    category?: TemplateCategory;
    templateId: TemplateId;
    columns: 1 | 2;
    palette: ThemePalette;
    fontFamily: string;
    fontFamilyHeading?: string;
    headerStyle: 'centered' | 'left' | 'banner';
    sectionHeadingStyle: 'simple' | 'underline' | 'bold-bar' | 'pill';
    bulletStyle?: 'dot' | 'dash' | 'arrow' | 'square';
    spacing?: 'compact' | 'normal' | 'spacious' | number;
    borderStyle?: 'none' | 'thin' | 'thick';
}

// ============================================================
// AI Types
// ============================================================

export type AIActionType =
    | 'strengthen'
    | 'shorten'
    | 'formalize'
    | 'fix-grammar'
    | 'quantify'
    | 'custom'
    | 'tailorToJob'
    | 'generateSummary';

export interface AIRequest {
    prompt: string;
    selectedText: string;
    context: {
        sectionType?: ResumeSectionType;
        roleTitle?: string;
        jobDescription?: string;
        actionType: AIActionType;
        customPrompt?: string;
    };
}

export interface AIResponse {
    suggestion: string;
    actionType: AIActionType;
    /** Optional array of alternative suggestions for multi-choice UI */
    variants?: string[];
}

// ============================================================
// ATS Score Types
// ============================================================

export interface ATSScoreBreakdown {
    keywordMatch: number;
    formatting: number;
    completeness: number;
}

export interface ATSScore {
    total: number;
    breakdown: ATSScoreBreakdown;
    suggestions: string[];
    missingSections: string[];
    matchedKeywords: string[];
}

// ============================================================
// Storage Types
// ============================================================

export interface StoredResume {
    id: string;
    name: string;
    data: ResumeData;
    themeId: string;
    updatedAt: string;
}

// ============================================================
// OCR / Image Analysis
// ============================================================

export interface OCRResult {
    text: string;
    confidence: number;
}

export type LayoutType = '1-column' | '2-column' | 'unknown';

export interface ImageAnalysisResult {
    palette: ThemePalette;
    layout: LayoutType;
    confidence: number;
}
