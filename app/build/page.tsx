// ============================================================
// app/build/page.tsx — Fast & Clean flow (v3)
// Light UI · Structured editor · 6 templates · Print export
// ============================================================

'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useResumeStore } from '@/store/resumeStore';
import { useAutosave } from '@/hooks/useAutosave';
import { useExport } from '@/hooks/useExport';
import { StructuredEditor } from '@/components/editor/StructuredEditor';
import { ResumePreview } from '@/components/resume/ResumePreview';
import { ThemeSelector } from '@/components/editor/ThemeSelector';
import { Button } from '@/components/ui/Button';
import { ResumesSidebar } from '@/components/editor/ResumesSidebar';
import { parseResumeText } from '@/lib/parsing';
import { extractTextFromFile } from '@/lib/ocr';
import type { ResumeData } from '@/types';
import { askAI, buildAIRequest } from '@/lib/ai';

// ---- AI bullet event listener helper ----
function useAIBulletHandler() {
    useEffect(() => {
        const handler = async (e: Event) => {
            const { text, action, onResult } = (e as CustomEvent).detail;
            try {
                const req = buildAIRequest(text, action, { sectionType: undefined });
                const res = await askAI(req);
                onResult(res.suggestion);
            } catch {
                // silent fail — keep original text
            }
        };
        window.addEventListener('rambo:ai-bullet', handler);
        return () => window.removeEventListener('rambo:ai-bullet', handler);
    }, []);
}

// ============================================================

export default function BuildPage() {
    const router = useRouter();
    const {
        resumeData, currentTheme, resumeName, isSaving,
        setResumeData, setCurrentTheme, setResumeName, saveCurrentResume,
        refreshStoredResumes, isOCRProcessing, setIsOCRProcessing,
    } = useResumeStore();

    useAutosave(3000);
    useAIBulletHandler();

    const { exportPDF, exportPlainText, isExportingPDF } = useExport();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Mobile tab state
    const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [exportMenuOpen, setExportMenuOpen] = useState(false);
    const [previewZoom, setPreviewZoom] = useState(0.65);
    const [editingName, setEditingName] = useState(false);
    const [nameDraft, setNameDraft] = useState('');

    useEffect(() => { refreshStoredResumes(); }, [refreshStoredResumes]);

    // OCR upload
    const handleFileUpload = useCallback(async (file: File) => {
        setIsOCRProcessing(true);
        try {
            const result = await extractTextFromFile(file);
            const parsed = parseResumeText(result.text);
            setResumeData(parsed);
        } catch {
            alert('Could not extract text. Please paste your resume text in the editor instead.');
        } finally {
            setIsOCRProcessing(false);
        }
    }, [setIsOCRProcessing, setResumeData]);

    const handleExportPDF = async () => {
        setExportMenuOpen(false);
        await exportPDF('resume-preview-root', `${resumeData.fullName.replace(/\s+/g, '_')}_resume.pdf`);
    };

    const handleExportText = () => {
        setExportMenuOpen(false);
        exportPlainText(resumeData, `${resumeData.fullName.replace(/\s+/g, '_')}_resume.txt`);
    };

    const commitName = () => {
        if (nameDraft.trim()) setResumeName(nameDraft.trim());
        setEditingName(false);
    };

    return (
        <div
            className="flex flex-col h-screen overflow-hidden"
            style={{ background: '#fafafa', fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}
        >
            {/* ============================================================
          TOP NAVIGATION BAR
          ============================================================ */}
            <header
                className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0 z-20"
                style={{
                    background: '#ffffff',
                    borderBottom: '1px solid #e2e8f0',
                    boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
                }}
            >
                {/* Sidebar toggle */}
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="flex items-center gap-1.5 text-sm font-medium text-[#475569] hover:text-[#0f172a] transition-colors p-1.5 rounded-lg"
                    style={{ border: '1px solid transparent' }}
                    id="sidebar-toggle-btn"
                >
                    <span className="text-base">☰</span>
                </button>

                {/* Brand */}
                <button
                    onClick={() => router.push('/')}
                    className="font-extrabold text-[#0f172a] text-lg tracking-tight"
                    id="nav-home-btn"
                >
                    Ram<span className="text-[#ff6b00]">bo</span>
                </button>

                <span className="text-[#e2e8f0] mx-1">/</span>

                {/* Resume name */}
                {editingName ? (
                    <input
                        type="text"
                        value={nameDraft}
                        autoFocus
                        onChange={(e) => setNameDraft(e.target.value)}
                        onBlur={commitName}
                        onKeyDown={(e) => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') setEditingName(false); }}
                        className="text-sm font-medium outline-none border-b-2 border-[#ff6b00] bg-transparent text-[#0f172a] px-0 w-40"
                        id="resume-name-input"
                    />
                ) : (
                    <button
                        onClick={() => { setNameDraft(resumeName); setEditingName(true); }}
                        className="text-sm font-medium text-[#475569] hover:text-[#0f172a] transition-colors truncate max-w-[160px]"
                        id="resume-name-display"
                        title="Click to rename"
                    >
                        {resumeName}
                    </button>
                )}

                {/* Mobile tab switcher */}
                <div
                    className="flex md:hidden ml-auto bg-[#f4f4f5] rounded-lg p-0.5"
                >
                    {(['editor', 'preview'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className="px-3 py-1 rounded-md text-xs font-semibold transition-all capitalize"
                            style={{
                                background: activeTab === tab ? '#ffffff' : 'transparent',
                                color: activeTab === tab ? '#0f172a' : '#94a3b8',
                                boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Right actions */}
                <div className="hidden md:flex items-center gap-2 ml-auto">
                    {/* Autosave */}
                    <span
                        className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full"
                        style={{
                            color: isSaving ? '#94a3b8' : '#10b981',
                            background: isSaving ? '#f4f4f5' : '#f0fdf4',
                        }}
                    >
                        {isSaving
                            ? <><span className="w-2 h-2 rounded-full border border-[#94a3b8] border-t-transparent animate-spin" /> Saving…</>
                            : <>✓ Saved</>
                        }
                    </span>

                    {/* OCR upload */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isOCRProcessing}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all"
                        style={{ borderColor: '#e2e8f0', color: '#475569', background: '#fff' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#ffd4b0'; (e.currentTarget as HTMLButtonElement).style.color = '#ff6b00'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLButtonElement).style.color = '#475569'; }}
                        id="upload-ocr-btn"
                    >
                        {isOCRProcessing
                            ? <><span className="w-3 h-3 border border-[#ff6b00] border-t-transparent rounded-full animate-spin" /> Extracting…</>
                            : <>📄 Import</>
                        }
                    </button>
                    <input ref={fileInputRef} type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ''; }} />

                    {/* Theme */}
                    <ThemeSelector currentTheme={currentTheme} onSelect={setCurrentTheme} />

                    {/* Export */}
                    <div className="relative">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setExportMenuOpen((v) => !v)}
                            loading={isExportingPDF}
                            id="export-btn"
                        >
                            Export ↓
                        </Button>
                        {exportMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setExportMenuOpen(false)} />
                                <div
                                    className="absolute right-0 top-full mt-2 z-20 rounded-2xl shadow-xl border p-1.5 min-w-[160px] animate-scale-in"
                                    style={{ background: '#fff', borderColor: '#e2e8f0' }}
                                >
                                    <ExportItem icon="📄" label="PDF (Print-perfect)" onClick={handleExportPDF} id="export-pdf-btn" />
                                    <ExportItem icon="📋" label="Plain Text (ATS)" onClick={handleExportText} id="export-txt-btn" />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile export button */}
                <div className="md:hidden ml-2">
                    <Button variant="primary" size="sm" onClick={handleExportPDF} loading={isExportingPDF} id="mobile-export-btn">
                        PDF
                    </Button>
                </div>
            </header>

            {/* ============================================================
          MAIN SPLIT LAYOUT
          ============================================================ */}
            <div className="flex flex-1 overflow-hidden">

                {/* Left: Editor (dark panel) */}
                <div
                    className={`
            flex flex-col overflow-hidden
            md:w-[420px] md:flex-shrink-0
            ${activeTab === 'editor' ? 'flex' : 'hidden'} md:flex
          `}
                    style={{ borderRight: '1px solid #e2e8f0', background: '#0f172a' }}
                >
                    {/* Editor top bar */}
                    <div
                        className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0"
                        style={{ background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Editor</span>
                        <div className="ml-auto flex items-center gap-1.5">
                            <span className="text-[10px] text-[#475569]">Click any field to edit</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b00] animate-pulse" />
                        </div>
                    </div>

                    {/* Structured editor */}
                    <StructuredEditor
                        data={resumeData}
                        onChange={setResumeData}
                    />
                </div>

                {/* Right: Preview (light panel) */}
                <div
                    className={`
            flex flex-col overflow-hidden flex-1
            ${activeTab === 'preview' ? 'flex' : 'hidden'} md:flex
          `}
                    style={{ background: '#f1f5f9' }}
                >
                    {/* Preview top bar */}
                    <div
                        className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0"
                        style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}
                    >
                        <span className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Live Preview</span>

                        {/* Zoom controls */}
                        <div className="flex items-center gap-1 ml-2 bg-[#f4f4f5] rounded-lg px-1 py-0.5">
                            <button
                                onClick={() => setPreviewZoom((z) => Math.max(0.4, z - 0.1))}
                                className="w-6 h-6 flex items-center justify-center text-[#94a3b8] hover:text-[#0f172a] transition-colors text-sm"
                            >−</button>
                            <span className="text-[10px] text-[#94a3b8] tabular-nums w-8 text-center">{Math.round(previewZoom * 100)}%</span>
                            <button
                                onClick={() => setPreviewZoom((z) => Math.min(1.2, z + 0.1))}
                                className="w-6 h-6 flex items-center justify-center text-[#94a3b8] hover:text-[#0f172a] transition-colors text-sm"
                            >+</button>
                        </div>

                        {/* ATS badge */}
                        <span
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full hidden sm:inline-flex"
                            style={{ color: '#10b981', background: '#f0fdf4', border: '1px solid #bbf7d0' }}
                        >
                            ATS-safe
                        </span>

                        <div className="ml-auto flex items-center gap-2">
                            {/* Mobile theme selector */}
                            <div className="md:hidden">
                                <ThemeSelector currentTheme={currentTheme} onSelect={setCurrentTheme} />
                            </div>
                            {/* Quick PDF on preview bar */}
                            <button
                                onClick={handleExportPDF}
                                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
                                style={{ background: '#fff3e8', color: '#ff6b00', border: '1px solid #ffd4b0' }}
                                id="preview-export-pdf-btn"
                            >
                                ↓ PDF
                            </button>
                        </div>
                    </div>

                    {/* Preview scroll area */}
                    <div className="flex-1 overflow-y-auto overflow-x-auto p-6 flex justify-center items-start">
                        <ResumePreview
                            data={resumeData}
                            theme={currentTheme}
                            scale={previewZoom}
                            id="resume-preview-root"
                        />
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <ResumesSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>
    );
}

function ExportItem({ icon, label, onClick, id }: { icon: string; label: string; onClick: () => void; id?: string }) {
    return (
        <button
            onClick={onClick}
            id={id}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#475569] hover:bg-[#f4f4f5] hover:text-[#0f172a] transition-all"
        >
            {icon} {label}
        </button>
    );
}
