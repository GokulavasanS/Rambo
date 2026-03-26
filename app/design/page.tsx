'use client';

import React, { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { analyzeImage } from '@/lib/image-analysis';
import { generateThemesFromPalette } from '@/lib/theme';
import { useResumeStore } from '@/store/resumeStore';
import { getPlaceholderResumeData } from '@/lib/parsing';
import { Button } from '@/components/ui/Button';
import { ResumePreview } from '@/components/resume/ResumePreview';
import type { ImageAnalysisResult, ResumeTheme } from '@/types';

type DesignStep = 'upload' | 'analyzing' | 'confirm-layout' | 'choose-template';

export default function DesignPage() {
    const router = useRouter();
    const { setCurrentTheme, setResumeData, setActiveFlow } = useResumeStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropRef = useRef<HTMLDivElement>(null);

    const [step, setStep] = useState<DesignStep>('upload');
    const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
    const [themes, setThemes] = useState<[ResumeTheme, ResumeTheme] | null>(null);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const placeholder = getPlaceholderResumeData();

    const buildThemes = useCallback((result: ImageAnalysisResult, columns: 1 | 2) => {
        const generated = generateThemesFromPalette(result.palette, columns);
        setThemes(generated);
        setStep('choose-template');
    }, []);

    const processFile = useCallback(async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file (PNG, JPG, WEBP).');
            return;
        }
        setError(null);
        setPreviewImageUrl(URL.createObjectURL(file));
        setStep('analyzing');
        try {
            const result = await analyzeImage(file);
            setAnalysisResult(result);
            if (result.confidence < 0.5 || result.layout === 'unknown') {
                setStep('confirm-layout');
            } else {
                buildThemes(result, result.layout === '2-column' ? 2 : 1);
            }
        } catch {
            setError('Analysis failed. Please try a different image.');
            setStep('upload');
        }
    }, [buildThemes]);

    const selectTemplate = (theme: ResumeTheme) => {
        setResumeData(placeholder);
        setCurrentTheme(theme);
        setActiveFlow('match-design');
        router.push('/build');
    };

    return (
        <div className="min-h-screen" style={{ background: '#fafafa', fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}>
            {/* Header */}
            <header
                className="sticky top-0 z-20 px-6 py-3 flex items-center gap-3"
                style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e2e8f0' }}
            >
                <button onClick={() => router.push('/')} className="font-extrabold text-[#0f172a] text-xl tracking-tight">
                    Ram<span className="text-[#ff6b00]">bo</span>
                </button>
                <span className="text-[#e2e8f0] text-sm">/</span>
                <span className="text-sm font-medium text-[#94a3b8]">Match My Design</span>
                <Button variant="ghost" size="sm" onClick={() => router.push('/build')} className="ml-auto">
                    Skip → Editor
                </Button>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12">
                {/* ======= STEP: Upload ======= */}
                {step === 'upload' && (
                    <div className="max-w-lg mx-auto animate-fade-up">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#fff3e8] text-3xl mb-5">🎨</div>
                            <h1 className="text-3xl font-bold text-[#0f172a] mb-3">Match My Design</h1>
                            <p className="text-[#475569] text-base leading-relaxed">
                                Upload a screenshot of a resume you like.<br />
                                We&apos;ll extract the colors and layout, then generate matching templates.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 px-4 py-3 rounded-xl text-sm" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                                {error}
                            </div>
                        )}

                        {/* Drop zone */}
                        <div
                            ref={dropRef}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) processFile(f); }}
                            onClick={() => fileInputRef.current?.click()}
                            id="design-upload-dropzone"
                            className="flex flex-col items-center justify-center gap-5 rounded-2xl p-16 cursor-pointer transition-all duration-200"
                            style={{
                                border: `2px dashed ${isDragging ? '#ff6b00' : '#e2e8f0'}`,
                                background: isDragging ? '#fff3e8' : '#ffffff',
                                transform: isDragging ? 'scale(1.01)' : 'scale(1)',
                            }}
                        >
                            <div className="text-6xl">🖼️</div>
                            <div className="text-center">
                                <p className="font-semibold text-[#0f172a] mb-1">Drop your design here</p>
                                <p className="text-sm text-[#94a3b8]">PNG, JPG, WEBP — any resume screenshot</p>
                            </div>
                            <Button variant="secondary" size="md" id="browse-files-btn">Browse Files</Button>
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = ''; }} />

                        <div className="mt-6 text-center text-xs text-[#94a3b8]">
                            Or{' '}
                            <button onClick={() => router.push('/build')} className="text-[#ff6b00] underline hover:no-underline">
                                start from scratch
                            </button>
                        </div>
                    </div>
                )}

                {/* ======= STEP: Analyzing ======= */}
                {step === 'analyzing' && (
                    <div className="flex flex-col items-center gap-8 py-16 animate-fade-up">
                        {previewImageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={previewImageUrl} alt="Uploaded design" className="w-40 rounded-2xl shadow-md opacity-60" />
                        )}
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full border-4 border-[#ff6b00] border-t-transparent animate-spin mx-auto mb-5" />
                            <h2 className="text-xl font-bold text-[#0f172a] mb-2">Analyzing your design…</h2>
                            <p className="text-[#94a3b8] text-sm">Extracting colors and detecting layout</p>
                        </div>
                    </div>
                )}

                {/* ======= STEP: Confirm Layout ======= */}
                {step === 'confirm-layout' && analysisResult && (
                    <div className="max-w-sm mx-auto text-center animate-fade-up">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#fff3e8] text-2xl mb-5">🤔</div>
                        <h2 className="text-2xl font-bold text-[#0f172a] mb-3">One quick question</h2>
                        <p className="text-[#475569] text-sm mb-8 leading-relaxed">
                            Our layout detector wasn&apos;t confident. Which layout does your design use?
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            {([1, 2] as const).map((cols) => (
                                <button
                                    key={cols}
                                    onClick={() => buildThemes(analysisResult, cols)}
                                    className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all hover:border-[#ff6b00] hover:bg-[#fff3e8] group"
                                    style={{ borderColor: '#e2e8f0', background: '#fff' }}
                                >
                                    <LayoutIcon columns={cols} />
                                    <span className="text-sm font-semibold text-[#0f172a] group-hover:text-[#ff6b00]">{cols}-Column</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ======= STEP: Choose Template ======= */}
                {step === 'choose-template' && themes && analysisResult && (
                    <div className="animate-fade-up">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-[#0f172a] mb-3">Pick your template</h2>
                            <p className="text-[#475569]">Both use the colors extracted from your upload.</p>

                            {/* Color palette swatch */}
                            <div className="flex items-center justify-center gap-2 mt-5">
                                <span className="text-xs text-[#94a3b8]">Extracted palette:</span>
                                {Object.values(analysisResult.palette).filter(Boolean).map((hex, i) => (
                                    <span
                                        key={i}
                                        className="w-7 h-7 rounded-full border-2 border-white shadow"
                                        style={{ background: hex as string }}
                                        title={hex as string}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            {themes.map((theme, i) => (
                                <div key={theme.id} className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-[#0f172a]">{theme.name}</span>
                                        {i === 1 && (
                                            <span
                                                className="text-xs px-2.5 py-1 rounded-full font-medium"
                                                style={{ background: '#f0fdf4', color: '#10b981', border: '1px solid #bbf7d0' }}
                                            >
                                                ATS-recommended
                                            </span>
                                        )}
                                    </div>

                                    {/* Template preview card */}
                                    <div
                                        className="relative overflow-hidden rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.01] group"
                                        style={{
                                            borderColor: i === 0 ? `${theme.palette.primary}60` : '#e2e8f0',
                                            height: 380,
                                            boxShadow: '0 4px 20px rgba(15,23,42,0.06)',
                                        }}
                                        onClick={() => selectTemplate(theme)}
                                        onMouseEnter={(e) => {
                                            (e.currentTarget as HTMLDivElement).style.borderColor = '#ff6b00';
                                            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(255,107,0,0.15)';
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLDivElement).style.borderColor = i === 0 ? `${theme.palette.primary}60` : '#e2e8f0';
                                            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(15,23,42,0.06)';
                                        }}
                                    >
                                        <div className="overflow-hidden h-full pointer-events-none select-none">
                                            <ResumePreview
                                                data={placeholder}
                                                theme={theme}
                                                scale={0.48}
                                            />
                                        </div>
                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            style={{ background: 'rgba(0,0,0,0.35)' }}
                                        >
                                            <span
                                                className="font-semibold text-white px-5 py-2.5 rounded-xl text-sm"
                                                style={{ background: '#ff6b00' }}
                                            >
                                                Use This Template →
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center mt-10">
                            <Button variant="ghost" size="sm" onClick={() => setStep('upload')}>
                                ← Upload a different image
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function LayoutIcon({ columns }: { columns: 1 | 2 }) {
    if (columns === 1) {
        return (
            <svg width="48" height="56" viewBox="0 0 48 56" fill="none" style={{ color: '#ff6b00' }}>
                <rect x="8" y="4" width="32" height="4" rx="2" fill="currentColor" />
                <rect x="8" y="14" width="32" height="3" rx="1.5" fill="currentColor" opacity="0.5" />
                <rect x="8" y="21" width="32" height="3" rx="1.5" fill="currentColor" opacity="0.5" />
                <rect x="8" y="28" width="24" height="3" rx="1.5" fill="currentColor" opacity="0.5" />
                <rect x="8" y="38" width="32" height="3" rx="1.5" fill="currentColor" opacity="0.3" />
                <rect x="8" y="45" width="28" height="3" rx="1.5" fill="currentColor" opacity="0.3" />
            </svg>
        );
    }
    return (
        <svg width="48" height="56" viewBox="0 0 48 56" fill="none" style={{ color: '#ff6b00' }}>
            <rect x="2" y="4" width="20" height="48" rx="2" fill="currentColor" opacity="0.15" />
            <rect x="2" y="4" width="20" height="4" rx="2" fill="currentColor" />
            <rect x="2" y="14" width="20" height="3" rx="1.5" fill="currentColor" opacity="0.5" />
            <rect x="2" y="21" width="20" height="3" rx="1.5" fill="currentColor" opacity="0.5" />
            <rect x="26" y="4" width="20" height="4" rx="2" fill="currentColor" />
            <rect x="26" y="14" width="20" height="3" rx="1.5" fill="currentColor" opacity="0.5" />
            <rect x="26" y="21" width="20" height="3" rx="1.5" fill="currentColor" opacity="0.5" />
            <rect x="26" y="28" width="14" height="3" rx="1.5" fill="currentColor" opacity="0.5" />
        </svg>
    );
}
