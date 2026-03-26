// ============================================================
// hooks/useExport.ts — PDF direct download (no print dialog)
//
// Fixes applied vs original:
//  1. Font-loading gate before html2canvas to prevent fallback fonts
//  2. Full-height canvas: uses scrollHeight so long resumes aren't clipped
//  3. Correct page-slicing math in native pixel-space (no unit mixing)
//  4. Removed conflicting allowTaint (useCORS alone is correct)
//  5. Switched addImage compression to NONE for crisp text
//  6. isExportingPDF surfaced via returned state + exported loading label
//  7. exportPlainText handles skills / custom flat-bullet sections
// ============================================================

'use client';

import { useState, useCallback } from 'react';
import type { ResumeData } from '@/types';

// ── A4 constants ──────────────────────────────────────────────────────────────
const A4_WIDTH_MM  = 210;
const A4_HEIGHT_MM = 297;
const SCALE        = 3;   // 3× super-sampling for retina-quality text

export function useExport() {
    const [isExportingPDF, setIsExportingPDF] = useState(false);

    /**
     * Direct-download PDF via jsPDF + html2canvas.
     *
     * @param previewId  - id of the DOM element to capture (should be the raw A4 div,
     *                     NOT a scaled wrapper)
     * @param filename   - output filename, default "resume.pdf"
     */
    const exportPDF = useCallback(async (
        previewId: string,
        filename  = 'resume.pdf',
    ): Promise<void> => {
        setIsExportingPDF(true);

        try {
            const source = document.getElementById(previewId);
            if (!source) {
                console.error(`[useExport] Element #${previewId} not found.`);
                alert('Resume preview not found. Please ensure the resume is visible and try again.');
                return;
            }

            // ── 1. Dynamic imports (keep main bundle lean) ────────────────
            const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
                import('jspdf'),
                import('html2canvas'),
            ]);

            // ── 2. Block until ALL fonts are decoded & ready ───────────────
            //    This is the single most important step for PDF font fidelity.
            await document.fonts.ready;

            // Small additional tick so browser finishes any pending font-swap repaints
            await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

            // ── 3. Measure true content dimensions ────────────────────────
            //    Use scrollHeight/scrollWidth so long resumes aren't clipped.
            const sourceWidth  = source.scrollWidth;
            const sourceHeight = source.scrollHeight;

            // ── 4. Render the canvas ──────────────────────────────────────
            const canvas = await html2canvas(source, {
                scale:           SCALE,
                useCORS:         true,   // correct CORS handling (do NOT add allowTaint)
                backgroundColor: '#ffffff',
                logging:         false,
                width:           sourceWidth,
                height:          sourceHeight,
                windowWidth:     sourceWidth,
                windowHeight:    sourceHeight,
                onclone: (_doc, el) => {
                    // Strip runtime transform/shadow so capture is clean
                    el.style.transform  = 'none';
                    el.style.boxShadow  = 'none';
                    el.style.overflow   = 'visible';
                },
            });

            // ── 5. Compute page geometry entirely in canvas-pixel space ───
            //    A4 ratio: height = width × (297/210)
            const canvasPageHeight = Math.round(canvas.width * (A4_HEIGHT_MM / A4_WIDTH_MM));
            const totalPages       = Math.ceil(canvas.height / canvasPageHeight);

            // ── 6. Build PDF page by page ─────────────────────────────────
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit:        'mm',
                format:      'a4',
                compress:    true,
            });

            for (let page = 0; page < totalPages; page++) {
                if (page > 0) pdf.addPage();

                const srcY = page * canvasPageHeight;
                const srcH = Math.min(canvasPageHeight, canvas.height - srcY);

                // Create a temporary canvas for this page slice
                const pageCanvas     = document.createElement('canvas');
                pageCanvas.width     = canvas.width;
                pageCanvas.height    = srcH;

                const ctx = pageCanvas.getContext('2d');
                if (ctx) {
                    // White background for partial last page
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
                    ctx.drawImage(
                        canvas,
                        0, srcY,                   // source x, y
                        canvas.width, srcH,         // source w, h
                        0, 0,                       // dest x, y
                        pageCanvas.width, srcH,     // dest w, h
                    );
                }

                // Height of this slice in mm (proportional to A4 width)
                const sliceHeightMM = (srcH / canvas.width) * A4_WIDTH_MM;

                pdf.addImage(
                    pageCanvas.toDataURL('image/png', 1.0),
                    'PNG',
                    0, 0,
                    A4_WIDTH_MM,
                    sliceHeightMM,
                    undefined,
                    'NONE',   // No lossy compression — preserves text sharpness
                );
            }

            pdf.save(filename);

        } catch (err) {
            console.error('[useExport] PDF export failed, falling back to print dialog:', err);
            await _printFallback(previewId);
        } finally {
            setIsExportingPDF(false);
        }
    }, []);

    /**
     * Print-dialog fallback (browser handles page breaks).
     */
    async function _printFallback(previewId: string): Promise<void> {
        const source = document.getElementById(previewId);
        if (!source) return;

        const clone = source.cloneNode(true) as HTMLElement;
        Object.assign(clone.style, {
            position:  'fixed',
            inset:     '0',
            width:     `${source.scrollWidth}px`,
            background:'white',
            zIndex:    '999999',
            transform: 'none',
        });
        document.body.appendChild(clone);

        await new Promise<void>((r) => setTimeout(r, 100));
        window.print();
        document.body.removeChild(clone);
    }

    /**
     * Export plain-text version (ATS-friendly copy-paste).
     * Handles entries, flat bullets, and skills-style sections.
     */
    const exportPlainText = useCallback((
        data:     ResumeData,
        filename = 'resume.txt',
    ) => {
        const lines: string[] = [];
        const hr = '─'.repeat(48);

        // Header
        lines.push(data.fullName.toUpperCase());
        if (data.title) lines.push(data.title);

        const c = data.contact;
        if (c) {
            const parts = [c.email, c.phone, c.location, c.linkedin, c.github, c.website].filter(Boolean);
            if (parts.length) lines.push(parts.join(' · '));
        }
        lines.push('');

        // Sections
        for (const section of data.sections) {
            lines.push(section.title.toUpperCase());
            lines.push(hr);

            // Standard entry-based sections (experience, education, projects)
            if (section.entries?.length) {
                for (const entry of section.entries) {
                    const headline = [
                        entry.organization,
                        entry.role   ? `— ${entry.role}`   : null,
                        entry.period ? `| ${entry.period}`  : null,
                    ].filter(Boolean).join(' ');

                    lines.push(headline);

                    if (entry.location) lines.push(`  ${entry.location}`);

                    for (const bullet of entry.bullets ?? []) {
                        lines.push(`  • ${bullet.text}`);
                    }
                    lines.push('');
                }
            }

            // Flat bullet sections (skills, certifications, etc.)
            if (section.bullets?.length) {
                for (const bullet of section.bullets) {
                    lines.push(`• ${bullet.text}`);
                }
                lines.push('');
            }

            // Fallback: if none of the above matched, still add spacing
            if (!section.entries?.length && !section.bullets?.length) {
                lines.push('');
            }
        }

        const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
        const url  = URL.createObjectURL(blob);
        const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5_000);
    }, []);

    return { exportPDF, exportPlainText, isExportingPDF };
}