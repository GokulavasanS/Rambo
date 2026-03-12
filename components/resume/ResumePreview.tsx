// ============================================================
// components/resume/ResumePreview.tsx
// Dispatches to the correct template based on theme.templateId.
// Wraps in an A4-ratio scaler for the preview panel.
// ============================================================

'use client';

import React, { forwardRef } from 'react';
import type { ResumeData, ResumeTheme } from '@/types';
import {
    TemplateClassicProfessional,
    TemplateMinimalClean,
    TemplateModernATS,
    TemplateCompactDeveloper,
    TemplateElegantSerif,
    TemplateTwoColumn,
} from '@/components/templates';

interface ResumePreviewProps {
    data: ResumeData;
    theme: ResumeTheme;
    /** 0–1 scale factor for preview (default 1 = full A4 width 794px) */
    scale?: number;
    id?: string;
}

// A4 dimensions at 96dpi
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

function TemplateRouter({ data, theme }: { data: ResumeData; theme: ResumeTheme }) {
    const id = theme.templateId || theme.id;
    switch (id) {
        case 'minimal-clean': return <TemplateMinimalClean data={data} theme={theme} />;
        case 'modern-ats': return <TemplateModernATS data={data} theme={theme} />;
        case 'compact-developer': return <TemplateCompactDeveloper data={data} theme={theme} />;
        case 'elegant-serif': return <TemplateElegantSerif data={data} theme={theme} />;
        case 'two-column-structured': return <TemplateTwoColumn data={data} theme={theme} />;
        case 'classic-professional':
        default: return <TemplateClassicProfessional data={data} theme={theme} />;
    }
}

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
    function ResumePreview({ data, theme, scale = 1, id = 'resume-preview-root' }, ref) {
        const scaledWidth = A4_WIDTH_PX * scale;

        return (
            <div
                style={{
                    width: scaledWidth,
                    flexShrink: 0,
                }}
            >
                {/* Actual A4 canvas — scaled with transform */}
                <div
                    id={id}
                    ref={ref}
                    style={{
                        width: A4_WIDTH_PX,
                        minHeight: A4_HEIGHT_PX,
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                        background: theme.palette.neutralBackground || '#ffffff',
                        boxShadow: '0 4px 32px rgba(0,0,0,0.12)',
                        overflow: 'hidden',
                        position: 'relative',
                    }}
                >
                    <TemplateRouter data={data} theme={theme} />
                </div>
                {/* Spacer to make container match actual rendered height */}
                <div style={{ height: A4_HEIGHT_PX * scale - A4_HEIGHT_PX }} />
            </div>
        );
    }
);
