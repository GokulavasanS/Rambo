// ============================================================
// components/templates/index.tsx
// Central dispatch: maps TemplateId → renderer component
// ============================================================

import React from 'react';
import type { ResumeData, ResumeTheme } from '@/types';

// ---- Original 6 templates ----
export { TemplateClassicProfessional } from './legacy';
export { TemplateMinimalClean } from './legacy';
export { TemplateModernATS } from './legacy';
export { TemplateCompactDeveloper } from './legacy';
export { TemplateElegantSerif } from './legacy';
export { TemplateTwoColumn } from './legacy';

// ---- New ATS templates ----
export { TemplateExecutiveImpact, TemplateApexRecruiter, TemplateLinkedInSmart, TemplateFederalStandard, TemplateHarvardClassic, TemplateTechMinimal } from './ats';

// ---- New Creative templates ----
export { TemplateAuroraGradient, TemplateNeonStudio, TemplateEditorialBold, TemplatePortfolioCard, TemplateArtisanSerif, TemplateKineticDark } from './creative';

// ============================================================
// Central renderer — maps templateId to the correct component
// ============================================================

import {
    TemplateClassicProfessional as TCP,
    TemplateMinimalClean as TMC,
    TemplateModernATS as TMATS,
    TemplateCompactDeveloper as TCD,
    TemplateElegantSerif as TES,
    TemplateTwoColumn as TTC,
} from './legacy';

import {
    TemplateExecutiveImpact as TEI,
    TemplateApexRecruiter as TAR,
    TemplateLinkedInSmart as TLS,
    TemplateFederalStandard as TFS,
    TemplateHarvardClassic as THC,
    TemplateTechMinimal as TTM,
} from './ats';

import {
    TemplateAuroraGradient as TAG,
    TemplateNeonStudio as TNS,
    TemplateEditorialBold as TEB,
    TemplatePortfolioCard as TPC,
    TemplateArtisanSerif as TAS,
    TemplateKineticDark as TKD,
} from './creative';

const TEMPLATE_MAP: Record<string, React.ComponentType<{ data: ResumeData; theme: ResumeTheme }>> = {
    'classic-professional': TCP,
    'minimal-clean': TMC,
    'modern-ats': TMATS,
    'compact-developer': TCD,
    'elegant-serif': TES,
    'two-column-structured': TTC,
    'executive-impact': TEI,
    'apex-recruiter': TAR,
    'linkedin-smart': TLS,
    'federal-standard': TFS,
    'harvard-classic': THC,
    'tech-minimal': TTM,
    'aurora-gradient': TAG,
    'neon-studio': TNS,
    'editorial-bold': TEB,
    'portfolio-card': TPC,
    'artisan-serif': TAS,
    'kinetic-dark': TKD,
};

interface ResumeTemplateProps {
    data: ResumeData;
    theme: ResumeTheme;
}

export function ResumeTemplate({ data, theme }: ResumeTemplateProps) {
    const Component = TEMPLATE_MAP[theme.templateId] ?? TCP;
    return <Component data={data} theme={theme} />;
}
