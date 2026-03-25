// ============================================================
// app/build/page.tsx — Premium Build Experience
// Single PDF export · Match Design link · No share/QR modal
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
import { ThemeSettings } from '@/components/editor/ThemeSettings';
import { Button } from '@/components/ui/Button';
import { ResumesSidebar } from '@/components/editor/ResumesSidebar';
import { ATSScorePanel } from '@/components/editor/ATSScorePanel';
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

    const { exportPDF, isExportingPDF } = useExport();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [previewZoom, setPreviewZoom] = useState(0.55);
    const [editingName, setEditingName] = useState(false);
    const [nameDraft, setNameDraft] = useState('');
    const [showAtsPanel, setShowAtsPanel] = useState(false);

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
        await exportPDF('resume-preview-root', `${resumeData.fullName.replace(/\s+/g, '_')}_resume.pdf`);
    };

    const commitName = () => {
        if (nameDraft.trim()) setResumeName(nameDraft.trim());
        setEditingName(false);
    };

    return (
        <div
            className="flex flex-col h-screen overflow-hidden"
            style={{ background: '#f1f5f9', fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}
        >
            {/* ── TOP NAV ─────────────────────────────────── */}
            <header
                className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0 z-20"
                style={{
                    background: '#ffffff',
                    borderBottom: '1px solid #e2e8f0',
                    boxShadow: '0 1px 4px rgba(15,23,42,0.05)',
                }}
            >
                {/* Sidebar toggle */}
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-[#475569] hover:text-[#0f172a] hover:bg-[#f4f4f5] transition-all"
                    id="sidebar-toggle-btn"
                    title="My Resumes"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect y="2" width="16" height="1.5" rx="1" fill="currentColor" />
                        <rect y="7" width="12" height="1.5" rx="1" fill="currentColor" />
                        <rect y="12" width="10" height="1.5" rx="1" fill="currentColor" />
                    </svg>
                </button>

                {/* Brand */}
                <button
                    onClick={() => router.push('/')}
                    className="font-extrabold text-[#0f172a] text-lg tracking-tight"
                    id="nav-home-btn"
                >
                    Ram<span className="text-[#ff6b00]">bo</span>
                </button>

                <span className="text-[#e2e8f0] mx-1 text-sm">/</span>

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
                        className="text-sm font-medium text-[#475569] hover:text-[#0f172a] transition-colors truncate max-w-[160px] group flex items-center gap-1"
                        id="resume-name-display"
                        title="Click to rename"
                    >
                        {resumeName}
                        <svg className="opacity-0 group-hover:opacity-100 transition-opacity" width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M1 9h1.5L7.5 3.5 6 2 1 7v2zm7.2-7.7a.4.4 0 000-.6L7.3.8a.4.4 0 00-.6 0l-.8.8L7.4 3l.8-.7z" fill="#94a3b8" />
                        </svg>
                    </button>
                )}

                {/* Mobile tab switcher */}
                <div className="flex md:hidden ml-auto bg-[#f4f4f5] rounded-lg p-0.5">
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
                    {/* Autosave indicator */}
                    <span
                        className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full transition-all"
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

                    {/* OCR import */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isOCRProcessing}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all hover:border-[#ffd4b0] hover:text-[#ff6b00]"
                        style={{ borderColor: '#e2e8f0', color: '#475569', background: '#fff' }}
                        id="upload-ocr-btn"
                    >
                        {isOCRProcessing
                            ? <><span className="w-3 h-3 border border-[#ff6b00] border-t-transparent rounded-full animate-spin" /> Extracting…</>
                            : <>📄 Import</>
                        }
                    </button>
                    <input ref={fileInputRef} type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ''; }} />

                    {/* Match Design */}
                    <button
                        onClick={() => router.push('/design')}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all hover:border-[#6366f1]/50 hover:text-[#6366f1]"
                        style={{ borderColor: '#e2e8f0', color: '#475569', background: '#fff' }}
                        id="match-design-btn"
                    >
                        🎨 Match Design
                    </button>

                    {/* Theme selector */}
                    <ThemeSelector currentTheme={currentTheme} onSelect={setCurrentTheme} />

                    {/* PDF Download — single clean button */}
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleExportPDF}
                        loading={isExportingPDF}
                        id="download-pdf-btn"
                    >
                        ⬇ Download PDF
                    </Button>
                </div>

                {/* Mobile PDF button */}
                <div className="md:hidden ml-2">
                    <Button variant="primary" size="sm" onClick={handleExportPDF} loading={isExportingPDF} id="mobile-export-btn">
                        PDF
                    </Button>
                </div>
            </header>

            {/* ── MAIN SPLIT LAYOUT ────────────────────────── */}
            <div className="flex flex-1 overflow-hidden">

                {/* Left: Editor */}
                <div
                    className={`flex flex-col overflow-hidden md:w-[440px] md:flex-shrink-0 ${activeTab === 'editor' ? 'flex' : 'hidden'} md:flex`}
                    style={{ borderRight: '1px solid #e2e8f0', background: '#0f172a' }}
                >
                    <StructuredEditor
                        data={resumeData}
                        onChange={setResumeData}
                    />
                </div>

                {/* Right: Preview */}
                <div
                    className={`flex flex-col overflow-hidden flex-1 ${activeTab === 'preview' ? 'flex' : 'hidden'} md:flex`}
                    style={{ background: '#f1f5f9' }}
                >
                    {/* Preview toolbar */}
                    <div
                        className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0"
                        style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}
                    >
                        <span className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Live Preview</span>

                        {/* Zoom controls */}
                        <div className="flex items-center gap-1 ml-2 bg-[#f4f4f5] rounded-lg px-1 py-0.5">
                            <button
                                onClick={() => setPreviewZoom((z) => Math.max(0.35, z - 0.05))}
                                className="w-6 h-6 flex items-center justify-center text-[#94a3b8] hover:text-[#0f172a] transition-colors text-sm"
                            >−</button>
                            <span className="text-[10px] text-[#94a3b8] tabular-nums w-8 text-center">{Math.round(previewZoom * 100)}%</span>
                            <button
                                onClick={() => setPreviewZoom((z) => Math.min(1.2, z + 0.05))}
                                className="w-6 h-6 flex items-center justify-center text-[#94a3b8] hover:text-[#0f172a] transition-colors text-sm"
                            >+</button>
                        </div>

                        {/* ATS toggle */}
                        <button
                            onClick={() => setShowAtsPanel(v => !v)}
                            className="text-[10px] font-medium px-3 py-1.5 rounded-full hidden sm:inline-flex items-center gap-1.5 ml-1 transition-all"
                            style={{
                                color: showAtsPanel ? '#fff' : '#10b981',
                                background: showAtsPanel ? '#10b981' : '#f0fdf4',
                                border: `1px solid ${showAtsPanel ? '#059669' : '#bbf7d0'}`
                            }}
                        >
                            <span>🎯</span> {showAtsPanel ? 'Hide ATS Score' : 'ATS Score'}
                        </button>

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
                                id="preview-pdf-btn"
                            >
                                ⬇ PDF
                            </button>
                        </div>
                    </div>

                    {/* Preview + ATS side panel */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* ATS panel — desktop side pane */}
                        {showAtsPanel && (
                            <div className="w-[300px] border-r border-[#e2e8f0] bg-white overflow-y-auto hidden lg:block shrink-0 p-4">
                                <ATSScorePanel />
                            </div>
                        )}

                        {/* Preview canvas */}
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
            </div>

            {/* Sidebar */}
            <ResumesSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Mobile ATS modal */}
            {showAtsPanel && (
                <div className="fixed inset-0 z-50 bg-black/50 lg:hidden flex items-end sm:items-center justify-center p-4" onClick={() => setShowAtsPanel(false)}>
                    <div className="bg-white rounded-xl w-full max-w-md max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b border-[#e2e8f0] sticky top-0 bg-white z-10">
                            <h3 className="text-sm font-bold text-[#0f172a]">ATS Intelligence</h3>
                            <button onClick={() => setShowAtsPanel(false)} className="text-[#94a3b8] hover:text-[#0f172a]">✕</button>
                        </div>
                        <div className="p-4">
                            <ATSScorePanel />
                        </div>
                    </div>
                </div>
            )}
            <ThemeSettings />
        </div>
    );
}
