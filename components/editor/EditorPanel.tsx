// ============================================================
// components/editor/EditorPanel.tsx
// Left-hand editor panel with toolbar, file upload, parse
// status bar, and the TipTap rich text editor.
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
    initialText?: string;
    onChange: (text: string) => void;
    onUpload: (file: File) => void;
    isOCRProcessing?: boolean;
    isParsingText?: boolean;
    detectedSections?: ResumeSection[];
    detectedName?: string;
    sectionType?: ResumeSectionType;
    roleTitle?: string;
}

export function EditorPanel({
    initialText = '',
    onChange,
    onUpload,
    isOCRProcessing = false,
    isParsingText = false,
    detectedSections = [],
    detectedName,
    sectionType,
    roleTitle,
}: EditorPanelProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const prevTextRef = useRef('');

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
            Placeholder.configure({
                placeholder:
                    'Paste your resume here — or upload a PDF/image.\n\nStart with your name, then use headings like:\nExperience\nEducation\nSkills\nProjects',
                emptyEditorClass: 'is-editor-empty',
            }),
        ],
        content: initialText || '',
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
        if (!editor) return;
        if (initialText && initialText !== prevTextRef.current) {
            editor.commands.setContent(initialText);
            prevTextRef.current = initialText;
        }
    }, [editor, initialText]);

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = '';
        },
        [onUpload]
    );

    const triggerFileUpload = () => fileInputRef.current?.click();

    const charCount = editor?.getText().length ?? 0;

    return (
        <div className="flex flex-col h-full">
            {/* ---- Toolbar ---- */}
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/8 bg-[#0b0b12] flex-shrink-0">
                <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mr-1">
                    Editor
                </span>

                {/* Format helpers */}
                <EditorButton
                    label="B"
                    title="Bold"
                    active={editor?.isActive('bold') ?? false}
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    className="font-bold"
                />
                <EditorButton
                    label="I"
                    title="Italic"
                    active={editor?.isActive('italic') ?? false}
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    className="italic"
                />
                <EditorButton
                    label="H2"
                    title="Heading 2"
                    active={editor?.isActive('heading', { level: 2 }) ?? false}
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                    className="text-[10px]"
                />
                <EditorButton
                    label="• List"
                    title="Bullet list"
                    active={editor?.isActive('bulletList') ?? false}
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    className="text-[10px]"
                />

                <div className="h-3 w-px bg-white/10 mx-1" />

                {/* Upload */}
                <Tooltip content="Upload PDF or image for OCR">
                    <button
                        onClick={triggerFileUpload}
                        disabled={isOCRProcessing}
                        className={`
              flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all
              ${isOCRProcessing
                                ? 'bg-violet-600/20 text-violet-300 cursor-wait'
                                : 'bg-white/4 hover:bg-white/8 text-white/50 hover:text-white border border-white/8 hover:border-white/20'
                            }
            `}
                        id="upload-file-btn"
                    >
                        {isOCRProcessing ? (
                            <>
                                <span className="w-3 h-3 border border-violet-400 border-t-transparent rounded-full animate-spin" />
                                Extracting…
                            </>
                        ) : (
                            <>📄 Upload</>
                        )}
                    </button>
                </Tooltip>

                {/* Clear */}
                <Tooltip content="Clear editor">
                    <button
                        onClick={() => {
                            if (window.confirm('Clear all text?')) {
                                editor?.commands.clearContent();
                                onChange('');
                            }
                        }}
                        className="ml-auto px-2 py-1.5 text-xs text-white/20 hover:text-red-400 transition-colors"
                        id="clear-editor-btn"
                    >
                        ✕
                    </button>
                </Tooltip>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    id="resume-file-input"
                />
            </div>

            {/* ---- Helper strip ---- */}
            <div className="flex items-center gap-2 px-3 py-2 bg-violet-950/30 border-b border-violet-900/20 flex-shrink-0">
                <span className="text-[10px] text-violet-400/60 leading-relaxed">
                    💡 Use headings like <strong className="text-violet-300/80">Experience</strong>,{' '}
                    <strong className="text-violet-300/80">Education</strong>,{' '}
                    <strong className="text-violet-300/80">Skills</strong>.
                    Select text for AI actions.
                </span>
            </div>

            {/* ---- Parse status ---- */}
            <ParseStatusBar
                sections={detectedSections}
                isParsingText={isParsingText}
                fullName={detectedName}
            />

            {/* ---- TipTap editor ---- */}
            <div className="flex-1 overflow-y-auto px-4 py-3 relative">
                {editor ? (
                    <>
                        <AIToolbar editor={editor} sectionType={sectionType} roleTitle={roleTitle} />
                        <EditorContent editor={editor} className="min-h-full" />
                    </>
                ) : (
                    <div className="text-white/20 text-sm animate-pulse">Loading editor…</div>
                )}
            </div>

            {/* ---- Footer: char count ---- */}
            <div className="flex items-center justify-end px-4 py-1.5 border-t border-white/6 flex-shrink-0 bg-[#09090f]">
                <span className="text-[10px] text-white/15 tabular-nums">
                    {charCount.toLocaleString()} characters
                </span>
            </div>
        </div>
    );
}

// ---- Tiny format button ----

function EditorButton({
    label,
    title,
    active,
    onClick,
    className = '',
}: {
    label: string;
    title: string;
    active: boolean;
    onClick: () => void;
    className?: string;
}) {
    return (
        <Tooltip content={title}>
            <button
                onClick={onClick}
                className={`
          px-2 py-1 text-xs rounded-md transition-all leading-none
          ${active
                        ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40'
                        : 'text-white/30 hover:text-white hover:bg-white/6'
                    }
          ${className}
        `}
            >
                {label}
            </button>
        </Tooltip>
    );
}
