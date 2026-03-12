// ============================================================
// components/resume/PreviewPanel.tsx
// Right-hand preview panel with zoom controls, pan reset,
// and a "Fill Page" default mode.
// ============================================================

'use client';

import React, { useRef, useState, useCallback } from 'react';
import { ResumePreview } from './ResumePreview';
import { ThemeSelector } from '@/components/editor/ThemeSelector';
import { Tooltip } from '@/components/ui/Tooltip';
import { ContactEditor } from '@/components/editor/ContactEditor';
import type { ResumeData, ResumeTheme } from '@/types';
import { useExport } from '@/hooks/useExport';

interface PreviewPanelProps {
    data: ResumeData;
    theme: ResumeTheme;
    onThemeChange: (t: ResumeTheme) => void;
    onDataChange: (d: ResumeData) => void;
}

const ZOOM_STEPS = [0.45, 0.55, 0.65, 0.72, 0.80, 0.90, 1.0] as const;

export function PreviewPanel({ data, theme, onThemeChange, onDataChange }: PreviewPanelProps) {
    const previewRef = useRef<HTMLDivElement>(null);
    const { exportPDF, isExportingPDF } = useExport();
    const [zoomIdx, setZoomIdx] = useState(3); // default: 0.72

    const scale = ZOOM_STEPS[zoomIdx];

    const zoomIn = useCallback(() => setZoomIdx((i) => Math.min(i + 1, ZOOM_STEPS.length - 1)), []);
    const zoomOut = useCallback(() => setZoomIdx((i) => Math.max(i - 1, 0)), []);
    const zoomReset = useCallback(() => setZoomIdx(3), []);

    const handleExportPDF = async () => {
        await exportPDF('resume-preview-root', `${data.fullName.replace(/\s+/g, '_')}_resume.pdf`);
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/8 bg-[#0a0a10] flex-shrink-0">
                <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
                    Preview
                </span>

                {/* Zoom controls */}
                <div className="flex items-center gap-1 ml-2 bg-white/4 rounded-lg px-1 py-0.5">
                    <Tooltip content="Zoom out">
                        <button
                            onClick={zoomOut}
                            disabled={zoomIdx === 0}
                            className="w-5 h-5 flex items-center justify-center text-white/40 hover:text-white disabled:opacity-20 transition-colors text-sm"
                            aria-label="Zoom out"
                        >
                            −
                        </button>
                    </Tooltip>

                    <Tooltip content="Reset zoom">
                        <button
                            onClick={zoomReset}
                            className="text-[10px] text-white/30 hover:text-white/60 transition-colors px-1 tabular-nums"
                            aria-label="Reset zoom"
                        >
                            {Math.round(scale * 100)}%
                        </button>
                    </Tooltip>

                    <Tooltip content="Zoom in">
                        <button
                            onClick={zoomIn}
                            disabled={zoomIdx === ZOOM_STEPS.length - 1}
                            className="w-5 h-5 flex items-center justify-center text-white/40 hover:text-white disabled:opacity-20 transition-colors text-sm"
                            aria-label="Zoom in"
                        >
                            +
                        </button>
                    </Tooltip>
                </div>

                {/* ATS badge */}
                <span className="text-[10px] text-emerald-400/60 border border-emerald-500/20 rounded-full px-2 py-0.5 bg-emerald-500/5 hidden md:inline-flex">
                    ATS-ready
                </span>

                <div className="flex items-center gap-2 ml-auto">
                    {/* Theme selector */}
                    <ThemeSelector currentTheme={theme} onSelect={onThemeChange} />

                    {/* Quick PDF export */}
                    <Tooltip content="Export as PDF">
                        <button
                            onClick={handleExportPDF}
                            disabled={isExportingPDF}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/30 rounded-lg text-xs text-violet-300 hover:text-white transition-all disabled:opacity-50"
                            id="quick-export-pdf-btn"
                        >
                            {isExportingPDF ? (
                                <span className="w-3 h-3 border border-white/50 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                '↓'
                            )}
                            PDF
                        </button>
                    </Tooltip>
                </div>
            </div>

            {/* Contact inline editor */}
            <ContactEditor data={data} onUpdate={onDataChange} />

            {/* Scrollable preview area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#080810] flex justify-center pt-6 pb-12 px-4">
                <div className="w-full flex justify-center">
                    <ResumePreview
                        ref={previewRef}
                        data={data}
                        theme={theme}
                        scale={scale}
                        id="resume-preview-root"
                    />
                </div>
            </div>
        </div>
    );
}
