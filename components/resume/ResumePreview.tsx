// ============================================================
// components/resume/ResumePreview.tsx
// Dispatches to the correct template based on theme.templateId.
// Wraps in an A4-ratio scaler for the preview panel.
// ============================================================

'use client';

import React, { forwardRef } from 'react';
import type { ResumeData, ResumeTheme } from '@/types';
import { ResumeTemplate } from '@/components/templates';

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

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
    function ResumePreview({ data, theme, scale = 1, id = 'resume-preview-root' }, ref) {
        const scaledWidth = A4_WIDTH_PX * scale;
        const spacing = theme.spacing || 'normal';

        // Dynamic CSS based on user's spacing choice
        const spacingCSS = `
            #${id} .resume-entry {
                margin-bottom: ${spacing === 'compact' ? '6px' : spacing === 'spacious' ? '18px' : '12px'} !important;
            }
            #${id} .resume-ul {
                margin-top: ${spacing === 'compact' ? '2px' : spacing === 'spacious' ? '6px' : '4px'} !important;
                line-height: ${spacing === 'compact' ? '1.4' : spacing === 'spacious' ? '1.8' : '1.6'} !important;
            }
            #${id} .resume-li {
                margin-bottom: ${spacing === 'compact' ? '0px' : spacing === 'spacious' ? '4px' : '2px'} !important;
            }
        `;

        return (
            <div
                style={{
                    width: scaledWidth,
                    flexShrink: 0,
                }}
            >
                {/* Dynamically injected styles to override templates */}
                <style>{spacingCSS}</style>

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
                    <ResumeTemplate data={data} theme={theme} />
                </div>
                {/* Spacer to make container match actual rendered height */}
                <div style={{ height: A4_HEIGHT_PX * scale - A4_HEIGHT_PX }} />
            </div>
        );
    }
);
