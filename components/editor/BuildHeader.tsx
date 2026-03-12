// ============================================================
// components/editor/BuildHeader.tsx
// Top navigation bar for the /build page.
// Has: back link, resume name (inline edit), autosave status,
// sidebar toggle, and export menu.
// ============================================================

'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useResumeStore } from '@/store/resumeStore';
import { useExport } from '@/hooks/useExport';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';

interface BuildHeaderProps {
    onToggleSidebar: () => void;
}

export function BuildHeader({ onToggleSidebar }: BuildHeaderProps) {
    const router = useRouter();
    const {
        resumeName,
        resumeData,
        currentTheme,
        isSaving,
        setResumeName,
        saveCurrentResume,
    } = useResumeStore();

    const { exportPDF, exportPlainText, isExportingPDF } = useExport();
    const [editingName, setEditingName] = useState(false);
    const [nameDraft, setNameDraft] = useState('');
    const nameInputRef = useRef<HTMLInputElement>(null);
    const [exportMenuOpen, setExportMenuOpen] = useState(false);

    const beginEditName = () => {
        setNameDraft(resumeName);
        setEditingName(true);
        setTimeout(() => nameInputRef.current?.select(), 50);
    };

    const commitName = () => {
        const trimmed = nameDraft.trim();
        if (trimmed) setResumeName(trimmed);
        setEditingName(false);
    };

    const handleExportPDF = async () => {
        setExportMenuOpen(false);
        await exportPDF(
            'resume-preview-root',
            `${resumeData.fullName.replace(/\s+/g, '_')}_resume.pdf`
        );
    };

    const handleExportText = () => {
        setExportMenuOpen(false);
        exportPlainText(
            resumeData,
            `${resumeData.fullName.replace(/\s+/g, '_')}_resume.txt`
        );
    };

    return (
        <header className="flex items-center gap-2 px-4 py-2.5 border-b border-white/8 bg-[#0c0c14] flex-shrink-0 z-20">
            {/* Sidebar toggle */}
            <Tooltip content="Your resumes">
                <button
                    onClick={onToggleSidebar}
                    className="text-white/30 hover:text-white transition-colors text-base px-1.5 py-1 rounded-lg hover:bg-white/6"
                    id="toggle-sidebar-btn"
                    aria-label="Toggle resumes sidebar"
                >
                    ☰
                </button>
            </Tooltip>

            {/* Brand */}
            <button
                onClick={() => router.push('/')}
                className="flex items-center gap-1 text-white/60 hover:text-white transition-colors ml-1"
                id="nav-home-btn"
                aria-label="Go to home"
            >
                <span className="font-bold text-base text-white leading-none">
                    R<span className="text-violet-400">am</span>bo
                </span>
            </button>

            <span className="text-white/15 mx-1">/</span>

            {/* Resume name (inline editable) */}
            {editingName ? (
                <input
                    ref={nameInputRef}
                    type="text"
                    value={nameDraft}
                    autoFocus
                    onChange={(e) => setNameDraft(e.target.value)}
                    onBlur={commitName}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') commitName();
                        if (e.key === 'Escape') setEditingName(false);
                    }}
                    className="
            bg-white/5 border border-violet-500/40 rounded-lg px-2 py-1
            text-sm text-white outline-none w-44 md:w-56
          "
                    id="resume-name-input"
                />
            ) : (
                <Tooltip content="Click to rename">
                    <button
                        onClick={beginEditName}
                        className="text-sm text-white/60 hover:text-white transition-colors truncate max-w-[140px] md:max-w-[220px] text-left"
                        id="resume-name-display"
                    >
                        {resumeName}
                    </button>
                </Tooltip>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Autosave indicator */}
            <div className="hidden sm:flex items-center gap-1.5 mr-2">
                {isSaving ? (
                    <span className="flex items-center gap-1.5 text-[10px] text-white/25">
                        <span className="w-2 h-2 border border-white/25 border-t-transparent rounded-full animate-spin" />
                        Saving
                    </span>
                ) : (
                    <Tooltip content="Save now">
                        <button
                            onClick={() => saveCurrentResume()}
                            className="flex items-center gap-1 text-[10px] text-white/20 hover:text-white/50 transition-colors"
                        >
                            ✓ Saved
                        </button>
                    </Tooltip>
                )}
            </div>

            {/* Export dropdown */}
            <div className="relative">
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setExportMenuOpen((v) => !v)}
                    id="export-menu-btn"
                    loading={isExportingPDF}
                >
                    {isExportingPDF ? 'Exporting…' : 'Export ↓'}
                </Button>

                {exportMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setExportMenuOpen(false)} />
                        <div className="absolute right-0 top-full mt-2 z-20 bg-[#12121a] border border-white/12 rounded-xl shadow-2xl p-1.5 min-w-[160px] animate-fade-in">
                            <button
                                onClick={handleExportPDF}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/6 transition-all"
                                id="export-pdf-btn"
                            >
                                📄 Export as PDF
                            </button>
                            <button
                                onClick={handleExportText}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/6 transition-all"
                                id="export-txt-btn"
                            >
                                📋 Plain Text (ATS)
                            </button>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
}
