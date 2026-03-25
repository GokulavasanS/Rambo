// ============================================================
// app/share/[id]/page.tsx
// Public, read-only view of a saved resume
// ============================================================

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ResumePreview } from '@/components/resume/ResumePreview';
import { Button } from '@/components/ui/Button';
import { useExport } from '@/hooks/useExport';
import { getThemeById, DEFAULT_THEME_ID } from '@/lib/theme';
import { loadResume } from '@/lib/storage';
import type { ResumeData, ResumeTheme } from '@/types';

export default function SharedResumePage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { exportPDF, isExportingPDF } = useExport();

    const [loading, setLoading] = useState(true);
    const [resumeData, setResumeData] = useState<ResumeData | null>(null);
    const [theme, setTheme] = useState<ResumeTheme | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        try {
            const record = loadResume(id);
            if (record) {
                setResumeData(record.data);
                setTheme(getThemeById(record.themeId || DEFAULT_THEME_ID));
            } else {
                console.error('Resume not found for ID:', id);
            }
        } catch (err) {
            console.error('Error loading shared resume:', err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    const handleDownload = async () => {
        if (resumeData) {
            await exportPDF('shared-resume-preview', `${resumeData.fullName.replace(/\s+/g, '_')}_resume.pdf`);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#f8fafc] flex-col gap-4">
                <div className="w-10 h-10 border-4 border-[#ff6b00]/20 border-t-[#ff6b00] rounded-full animate-spin" />
                <p className="text-sm font-medium text-[#64748b]">Loading resume...</p>
            </div>
        );
    }

    if (!resumeData || !theme) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-[#f8fafc] gap-4 p-4 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-3xl mb-2">
                    📄
                </div>
                <h1 className="text-2xl font-bold text-[#0f172a]">Resume Not Found</h1>
                <p className="text-[#64748b] max-w-md">
                    The resume you are looking for doesn&apos;t exist or has been removed. 
                    Please check the link and try again.
                </p>
                <Button onClick={() => router.push('/')} variant="primary" className="mt-4">
                    Build Your Own Resume
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#f1f5f9] font-sans">
            {/* Top Bar */}
            <header className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-[#e2e8f0] shadow-sm">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => router.push('/')}
                        className="font-extrabold text-[#0f172a] text-lg tracking-tight hover:opacity-80 transition-opacity"
                    >
                        Ram<span className="text-[#ff6b00]">bo</span>
                    </button>
                    <span className="hidden sm:inline-block px-2 text-[#cbd5e1]">|</span>
                    <span className="hidden sm:inline-block text-sm font-medium text-[#475569] truncate max-w-[200px] lg:max-w-md">
                        {resumeData.fullName}&apos;s Resume
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <Button 
                        onClick={handleDownload} 
                        variant="primary" 
                        size="sm" 
                        loading={isExportingPDF}
                        className="flex items-center gap-2 shadow-sm"
                    >
                        {isExportingPDF ? 'Generating...' : 'Download PDF'}
                    </Button>
                    <div className="hidden sm:block border-l border-slate-200 h-6 mx-1"></div>
                    <Button 
                        onClick={() => router.push('/')} 
                        variant="secondary" 
                        size="sm"
                        className="hidden sm:flex"
                    >
                        Build Yours
                    </Button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-x-auto py-8 px-4 flex justify-center">
                {/* 
                    We wrap the preview in a container with a defined ID 
                    so the html2canvas exporter can target it easily.
                */}
                <div className="shadow-2xl rounded-sm overflow-hidden ring-1 ring-slate-900/5 bg-white">
                    <ResumePreview
                        data={resumeData}
                        theme={theme}
                        scale={1.0} // Always full scale on the share page, user can zoom via browser
                        id="shared-resume-preview"
                    />
                </div>
            </main>
        </div>
    );
}
