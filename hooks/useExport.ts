// ============================================================
// hooks/useExport.ts — PDF & plain text export
// Uses window.print() with @media print CSS for pixel-perfect
// PDF that matches the preview exactly.
// ============================================================

'use client';

import { useState, useCallback } from 'react';
import type { ResumeData } from '@/types';

export function useExport() {
    const [isExportingPDF, setIsExportingPDF] = useState(false);

    /**
     * Reliable print-based PDF export.
     * Clones the resume DOM node, injects it as a full-screen overlay,
     * triggers window.print(), then removes it.
     */
    const exportPDF = useCallback(async (
        previewId: string,
        _filename?: string,
    ): Promise<void> => {
        setIsExportingPDF(true);
        try {
            const source = document.getElementById(previewId);
            if (!source) {
                alert('Preview not found. Please make sure the resume is visible.');
                return;
            }

            // Clone the element for printing
            const clone = source.cloneNode(true) as HTMLElement;
            clone.id = 'resume-print-target';
            clone.style.cssText = `
        display: block !important;
        position: fixed;
        inset: 0;
        width: 794px;
        background: white;
        z-index: 999999;
        transform: none !important;
      `;

            // Collect all stylesheets to inject into clone context
            document.body.appendChild(clone);

            // Short delay to let styles apply
            await new Promise((r) => setTimeout(r, 80));
            window.print();

            // Clean up after print dialog closes
            document.body.removeChild(clone);
        } finally {
            setIsExportingPDF(false);
        }
    }, []);

    /**
     * Export plain text for ATS paste
     */
    const exportPlainText = useCallback((data: ResumeData, filename?: string) => {
        const lines: string[] = [];

        lines.push(data.fullName.toUpperCase());
        if (data.title) lines.push(data.title);

        const contact = data.contact;
        if (contact) {
            const parts = [contact.email, contact.phone, contact.location, contact.linkedin, contact.github].filter(Boolean);
            if (parts.length) lines.push(parts.join(' | '));
        }

        lines.push('');

        for (const section of data.sections) {
            lines.push(section.title.toUpperCase());
            lines.push('─'.repeat(40));

            if (section.entries) {
                for (const entry of section.entries) {
                    lines.push(`${entry.organization}${entry.role ? ' — ' + entry.role : ''}${entry.period ? ' | ' + entry.period : ''}`);
                    for (const b of entry.bullets) lines.push(`  • ${b.text}`);
                }
            }
            if (section.bullets) {
                for (const b of section.bullets) lines.push(`• ${b.text}`);
            }
            lines.push('');
        }

        const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'resume.txt';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 3000);
    }, []);

    return { exportPDF, exportPlainText, isExportingPDF };
}
