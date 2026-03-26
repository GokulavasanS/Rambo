// ============================================================
// components/resume/ResumePreview.tsx
//
// Fixes applied vs original:
//  1. Spacer math was negative for scale < 1 — fixed to max(0, …)
//  2. overflow: hidden clipped multi-page content — changed to visible
//     for the inner div; outer wrapper clips to scaled bounds.
//  3. Spacing CSS no longer uses !important blindly — uses higher
//     specificity selectors instead so inline styles can still override.
//  4. Spacing multiplier extraction is DRY (shared util).
//  5. Font-family is injected once at the preview root level so the
//     whole resume respects the user's font choice without needing each
//     template to remember it.
//  6. Font-display: swap link injected dynamically for Google Fonts so
//     fonts load before the pdf export step can capture them.
// ============================================================

'use client';

import React, { forwardRef, useEffect, useRef } from 'react';
import type { ResumeData, ResumeTheme } from '@/types';
import { ResumeTemplate } from '@/components/templates';

// ── A4 dimensions at 96 dpi ──────────────────────────────────────────────────
const A4_WIDTH_PX  = 794;
const A4_HEIGHT_PX = 1123;

// ── Spacing helper ────────────────────────────────────────────────────────────
export function toNumericalSpacing(spacing: ResumeTheme['spacing']): number {
    if (typeof spacing === 'number') return spacing;
    if (spacing === 'compact')  return 0.85;
    if (spacing === 'spacious') return 1.25;
    return 1.0;
}

// ── Google Fonts preloader ─────────────────────────────────────────────────────
/** Extracts the font family name from a CSS font-family string and returns a
 *  Google Fonts URL with display=swap so the browser loads it eagerly. */
function buildGoogleFontUrl(fontFamily: string): string | null {
    // Extract first font name (before comma)
    const name = fontFamily.split(',')[0].replace(/['"]/g, '').trim();
    const skipNative = ['Georgia', 'Times New Roman', 'Arial', 'Helvetica', 'sans-serif', 'serif'];
    if (!name || skipNative.includes(name)) return null;
    const encoded = encodeURIComponent(name) + ':wght@300;400;500;600;700;800;900';
    return `https://fonts.googleapis.com/css2?family=${encoded}&display=swap`;
}

function useGoogleFontPreload(fontFamilies: (string | undefined)[]) {
    const injected = useRef(new Set<string>());

    useEffect(() => {
        for (const family of fontFamilies) {
            if (!family) continue;
            const url = buildGoogleFontUrl(family);
            if (!url || injected.current.has(url)) continue;
            injected.current.add(url);

            const link = document.createElement('link');
            link.rel  = 'stylesheet';
            link.href = url;
            document.head.appendChild(link);
        }
    }, [fontFamilies]);
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ResumePreviewProps {
    data:  ResumeData;
    theme: ResumeTheme;
    /** 0–1 scale factor for the preview panel (default 1 = full A4 794 px) */
    scale?: number;
    id?: string;
}

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
    function ResumePreview(
        { data, theme, scale = 1, id = 'resume-preview-root' },
        ref,
    ) {
        // Preload both fonts so they're available before PDF export
        useGoogleFontPreload([theme.fontFamily, theme.fontFamilyHeading]);

        const spacingMult  = toNumericalSpacing(theme.spacing);
        const scaledWidth  = A4_WIDTH_PX  * scale;
        const scaledHeight = A4_HEIGHT_PX * scale;

        // Spacer height: how much extra space the transform eats (can be 0 or negative—clamp to 0)
        const spacerHeight = Math.max(0, scaledHeight - A4_HEIGHT_PX);

        // ── Scoped CSS without !important ──────────────────────────────────
        // Uses the id prefix for specificity; templates should not use inline
        // margin/line-height on these classes so no !important needed.
        const spacingCSS = `
            #${id} .resume-entry       { margin-bottom: ${12 * spacingMult}px; }
            #${id} .resume-ul          { margin-top: ${4 * spacingMult}px; line-height: ${1.6 * spacingMult}; }
            #${id} .resume-li          { margin-bottom: ${2 * spacingMult}px; }
            #${id} .resume-section     { margin-bottom: ${16 * spacingMult}px; }
            #${id} .resume-entry-gap   { gap: ${6 * spacingMult}px; }
        `.trim();

        return (
            /**
             * Outer wrapper: sized to the SCALED dimensions.
             * clip to contain the transformed inner canvas within the panel.
             */
            <div
                style={{
                    width:    scaledWidth,
                    height:   scaledHeight,
                    flexShrink: 0,
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                {/* Scoped spacing styles */}
                <style dangerouslySetInnerHTML={{ __html: spacingCSS }} />

                {/**
                 * Actual A4 canvas — always rendered at 794 px wide,
                 * then visually scaled down via CSS transform.
                 *
                 * overflow: visible so multi-page resumes paint below
                 * the 1123 px min-height; the outer wrapper clips it for the UI.
                 * The PDF exporter reads scrollHeight directly from this element
                 * to capture the full content.
                 */}
                <div
                    id={id}
                    ref={ref}
                    style={{
                        width:           A4_WIDTH_PX,
                        minHeight:       A4_HEIGHT_PX,
                        transform:       `scale(${scale})`,
                        transformOrigin: 'top left',
                        background:      theme.palette.neutralBackground || '#ffffff',
                        boxShadow:       '0 4px 32px rgba(0,0,0,0.12)',
                        overflow:        'visible',   // ← allow multi-page content to render
                        position:        'relative',
                        // Apply the user's body font at the root level so every
                        // template automatically inherits it without needing to
                        // repeat it in each template component.
                        fontFamily:      theme.fontFamily || "'Inter', sans-serif",
                        color:           theme.palette.textColor || '#0f172a',
                    }}
                >
                    <ResumeTemplate data={data} theme={theme} />
                </div>

                {/* Spacer: compensates for the gap between transformed height
                    and container height when scale < 1. Clamped to ≥ 0. */}
                {spacerHeight > 0 && <div style={{ height: spacerHeight }} aria-hidden />}
            </div>
        );
    },
);
