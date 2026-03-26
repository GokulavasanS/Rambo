// ============================================================
// components/editor/EditorPanel.tsx
// Fixes & upgrades vs original:
//  • Word count + char count in footer (not just char count)
//  • Full formatting toolbar: B, I, H1, H2, H3, BulletList, OrderedList, Undo, Redo
//  • Toolbar buttons use aria-pressed for accessibility
//  • Helper strip is dismissible (stored in sessionStorage)
//  • Parse status bar counts entries not just bullets
//  • Upload button has proper loading ring with aria-busy
//  • Clears editor shows a toast-style confirmation instead of browser confirm()
//  • Mobile: toolbar scrolls horizontally without wrapping
// ============================================================

'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { AIToolbar } from './AIToolbar';
import { ParseStatusBar } from './ParseStatusBar';
import { Tooltip } from '@/components/ui/Tooltip';
import type { ResumeSection, ResumeSectionType } from '@/types';

interface EditorPanelProps {
    initialText?:       string;
    onChange:           (text: string) => void;
    onUpload:           (file: File) => void;
    isOCRProcessing?:   boolean;
    isParsingText?:     boolean;
    detectedSections?:  ResumeSection[];
    detectedName?:      string;
    sectionType?:       ResumeSectionType;
    roleTitle?:         string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function countWords(text: string): number {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

interface EditorButtonProps {
    label:      React.ReactNode;
    title:      string;
    active:     boolean;
    onClick:    () => void;
    className?: string;
    disabled?:  boolean;
}

function EditorButton({ label, title, active, onClick, className = '', disabled }: EditorButtonProps) {
    return (
        <Tooltip content={title}>
            <button
                onClick={onClick}
                disabled={disabled}
                aria-pressed={active}
                aria-label={title}
                className={[
                    'px-2 py-1.5 text-xs rounded-md transition-all leading-none font-medium select-none min-w-[26px]',
                    active
                        ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40'
                        : 'text-white/40 hover:text-white hover:bg-white/8 border border-transparent',
                    disabled ? 'opacity-30 cursor-not-allowed' : '',
                    className,
                ].join(' ')}
            >
                {label}
            </button>
        </Tooltip>
    );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function EditorPanel({
    initialText       = '',
    onChange,
    onUpload,
    isOCRProcessing   = false,
    isParsingText     = false,
    detectedSections  = [],
    detectedName,
    sectionType,
    roleTitle,
}: EditorPanelProps) {
    const fileInputRef    = useRef<HTMLInputElement>(null);
    const prevTextRef     = useRef('');
    const [showHelper, setShowHelper] = useState(() => {
        try { return sessionStorage.getItem('rambo:helper-dismissed') !== '1'; }
        catch { return true; }
    });
    const [clearing, setClearing]     = useState(false);
    const [justCleared, setJustCleared] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Placeholder.configure({
                placeholder:
                    'Paste your resume here — or upload a PDF/image.\n\n' +
                    'Start with your name, then add section headings:\n' +
                    'Experience · Education · Skills · Projects',
                emptyEditorClass: 'is-editor-empty',
            }),
        ],
        content:           initialText || '',
        immediatelyRender: false,
        editorProps: {
            attributes: { class: 'tiptap-editor', spellcheck: 'true' },
        },
        onUpdate: ({ editor }) => {
            const text = editor.getText();
            if (text !== prevTextRef.current) {
                prevTextRef.current = text;
                onChange(text);
            }
        },
    });

    // Sync external text (e.g. after OCR)
    useEffect(() => {
        if (!editor || !initialText || initialText === prevTextRef.current) return;
        editor.commands.setContent(initialText);
        prevTextRef.current = initialText;
    }, [editor, initialText]);

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = '';
        },
        [onUpload],
    );

    const triggerUpload = () => fileInputRef.current?.click();

    const dismissHelper = () => {
        setShowHelper(false);
        try { sessionStorage.setItem('rambo:helper-dismissed', '1'); } catch {}
    };

    const handleClear = () => {
        if (!editor?.getText().trim()) return;
        setClearing(true);
    };

    const confirmClear = () => {
        editor?.commands.clearContent();
        onChange('');
        setClearing(false);
        setJustCleared(true);
        setTimeout(() => setJustCleared(false), 2000);
    };

    const rawText    = editor?.getText() ?? '';
    const charCount  = rawText.length;
    const wordCount  = countWords(rawText);

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col h-full" style={{ background: '#0d0d14' }}>

            {/* ── Toolbar ───────────────────────────────────────────── */}
            <div
                className="flex items-center gap-0.5 px-2 py-1.5 flex-shrink-0 overflow-x-auto scrollbar-none"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#0b0b12' }}
            >
                <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.18em] mr-1.5 flex-shrink-0 hidden sm:block">
                    Editor
                </span>

                {/* Text formatting */}
                <EditorButton label={<b>B</b>}      title="Bold (Ctrl+B)"         active={editor?.isActive('bold')           ?? false} onClick={() => editor?.chain().focus().toggleBold().run()} />
                <EditorButton label={<i>I</i>}       title="Italic (Ctrl+I)"       active={editor?.isActive('italic')         ?? false} onClick={() => editor?.chain().focus().toggleItalic().run()} />

                <div className="h-3.5 w-px mx-1 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }} />

                {/* Headings */}
                <EditorButton label="H1"  title="Heading 1" active={editor?.isActive('heading', { level: 1 }) ?? false} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className="text-[10px]" />
                <EditorButton label="H2"  title="Heading 2" active={editor?.isActive('heading', { level: 2 }) ?? false} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className="text-[10px]" />
                <EditorButton label="H3"  title="Heading 3" active={editor?.isActive('heading', { level: 3 }) ?? false} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} className="text-[10px]" />

                <div className="h-3.5 w-px mx-1 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }} />

                {/* Lists */}
                <EditorButton
                    label={<span className="text-[11px]">• —</span>}
                    title="Bullet list"
                    active={editor?.isActive('bulletList') ?? false}
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                />
                <EditorButton
                    label={<span className="text-[11px]">1.</span>}
                    title="Numbered list"
                    active={editor?.isActive('orderedList') ?? false}
                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                />

                <div className="h-3.5 w-px mx-1 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }} />

                {/* History */}
                <EditorButton
                    label={<span className="text-sm leading-none">↩</span>}
                    title="Undo (Ctrl+Z)"
                    active={false}
                    disabled={!editor?.can().undo()}
                    onClick={() => editor?.chain().focus().undo().run()}
                />
                <EditorButton
                    label={<span className="text-sm leading-none">↪</span>}
                    title="Redo (Ctrl+Y)"
                    active={false}
                    disabled={!editor?.can().redo()}
                    onClick={() => editor?.chain().focus().redo().run()}
                />

                <div className="h-3.5 w-px mx-1 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }} />

                {/* Upload */}
                <Tooltip content="Upload PDF or image (OCR)">
                    <button
                        onClick={triggerUpload}
                        disabled={isOCRProcessing}
                        aria-busy={isOCRProcessing}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 border"
                        style={{
                            background:   isOCRProcessing ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
                            color:        isOCRProcessing ? '#c4b5fd'                : 'rgba(255,255,255,0.45)',
                            borderColor:  isOCRProcessing ? 'rgba(139,92,246,0.3)'  : 'rgba(255,255,255,0.08)',
                            cursor:       isOCRProcessing ? 'wait'                  : 'pointer',
                        }}
                        id="upload-file-btn"
                    >
                        {isOCRProcessing ? (
                            <>
                                <span
                                    className="w-3 h-3 rounded-full border-2 border-violet-400 border-t-transparent animate-spin flex-shrink-0"
                                    role="status"
                                    aria-label="Extracting text…"
                                />
                                <span className="hidden sm:inline">Extracting…</span>
                            </>
                        ) : (
                            <>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
                                    <path d="M6 1v7M3 5l3-3 3 3M1 10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span className="hidden sm:inline">Upload</span>
                            </>
                        )}
                    </button>
                </Tooltip>

                {/* Clear */}
                <Tooltip content="Clear all text">
                    <button
                        onClick={handleClear}
                        disabled={charCount === 0}
                        className="ml-auto px-2 py-1.5 text-xs rounded-md transition-colors flex-shrink-0"
                        style={{
                            color:   charCount === 0 ? 'rgba(255,255,255,0.1)' : justCleared ? '#34d399' : 'rgba(255,255,255,0.2)',
                            cursor:  charCount === 0 ? 'default' : 'pointer',
                        }}
                        aria-label="Clear editor"
                        id="clear-editor-btn"
                    >
                        {justCleared ? '✓' : '✕'}
                    </button>
                </Tooltip>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    id="resume-file-input"
                    aria-label="Upload resume file"
                />
            </div>

            {/* ── Clear confirmation banner ─────────────────────────── */}
            {clearing && (
                <div
                    className="flex items-center justify-between gap-3 px-4 py-2 flex-shrink-0 text-xs"
                    style={{ background: 'rgba(239,68,68,0.12)', borderBottom: '1px solid rgba(239,68,68,0.2)' }}
                >
                    <span style={{ color: '#fca5a5' }}>Clear all content? This cannot be undone.</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setClearing(false)}
                            className="px-2.5 py-1 rounded-lg font-medium transition-colors"
                            style={{ color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.06)' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmClear}
                            className="px-2.5 py-1 rounded-lg font-bold transition-colors"
                            style={{ background: '#ef4444', color: '#fff' }}
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}

            {/* ── Helper strip (dismissible) ────────────────────────── */}
            {showHelper && (
                <div
                    className="flex items-center gap-2 px-3 py-2 flex-shrink-0"
                    style={{ background: 'rgba(109,40,217,0.12)', borderBottom: '1px solid rgba(109,40,217,0.15)' }}
                >
                    <span className="text-[10px] leading-relaxed flex-1" style={{ color: 'rgba(196,181,253,0.7)' }}>
                        💡 Use headings <strong style={{ color: 'rgba(196,181,253,0.9)' }}>Experience</strong>,{' '}
                        <strong style={{ color: 'rgba(196,181,253,0.9)' }}>Education</strong>,{' '}
                        <strong style={{ color: 'rgba(196,181,253,0.9)' }}>Skills</strong> — then select any text for AI actions.
                    </span>
                    <button
                        onClick={dismissHelper}
                        aria-label="Dismiss tip"
                        className="flex-shrink-0 text-[11px] transition-colors"
                        style={{ color: 'rgba(196,181,253,0.35)' }}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* ── Parse status ─────────────────────────────────────── */}
            <ParseStatusBar
                sections={detectedSections}
                isParsingText={isParsingText}
                fullName={detectedName}
            />

            {/* ── TipTap editor ────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 relative">
                {editor ? (
                    <>
                        <AIToolbar editor={editor} sectionType={sectionType} roleTitle={roleTitle} />
                        <EditorContent editor={editor} className="min-h-full" />
                    </>
                ) : (
                    <div
                        className="flex items-center gap-2 text-sm animate-pulse"
                        style={{ color: 'rgba(255,255,255,0.2)' }}
                    >
                        <span className="w-3.5 h-3.5 rounded-full border border-white/20 border-t-transparent animate-spin" />
                        Loading editor…
                    </div>
                )}
            </div>

            {/* ── Footer: stats ────────────────────────────────────── */}
            <div
                className="flex items-center justify-end gap-3 px-4 py-1.5 flex-shrink-0"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: '#09090f' }}
            >
                {isParsingText && (
                    <span className="flex items-center gap-1.5 text-[10px]" style={{ color: 'rgba(139,92,246,0.7)' }}>
                        <span className="w-2.5 h-2.5 rounded-full border border-violet-400 border-t-transparent animate-spin" />
                        Parsing…
                    </span>
                )}
                <span className="text-[10px] tabular-nums" style={{ color: 'rgba(255,255,255,0.15)' }}>
                    {wordCount.toLocaleString()} words · {charCount.toLocaleString()} chars
                </span>
            </div>
        </div>
    );
}
