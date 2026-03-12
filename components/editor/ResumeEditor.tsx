// ============================================================
// components/editor/ResumeEditor.tsx
// TipTap-based rich text editor with AI toolbar
// ============================================================

'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { AIToolbar } from './AIToolbar';
import { Button } from '@/components/ui/Button';
import type { ResumeSectionType } from '@/types';

interface ResumeEditorProps {
    initialText?: string;
    onChange: (text: string) => void;
    onUpload: (file: File) => void;
    isOCRProcessing?: boolean;
    sectionType?: ResumeSectionType;
    roleTitle?: string;
}

export function ResumeEditor({
    initialText = '',
    onChange,
    onUpload,
    isOCRProcessing = false,
    sectionType,
    roleTitle,
}: ResumeEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const prevTextRef = useRef('');

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Placeholder.configure({
                placeholder:
                    'Paste your resume here — or upload a PDF/image using the button above.\n\nUse headings like "Experience", "Education", "Skills", "Projects" to organize sections.',
            }),
        ],
        content: initialText || '',
        editorProps: {
            attributes: {
                class: 'tiptap-editor',
                spellcheck: 'true',
            },
        },
        onUpdate: ({ editor }) => {
            const text = editor.getText();
            if (text !== prevTextRef.current) {
                prevTextRef.current = text;
                onChange(text);
            }
        },
    });

    // Sync external initialText changes (e.g. after OCR)
    useEffect(() => {
        if (editor && initialText && initialText !== prevTextRef.current) {
            editor.commands.setContent(initialText);
            prevTextRef.current = initialText;
        }
    }, [editor, initialText]);

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            // Reset so same file can be re-uploaded
            e.target.value = '';
        },
        [onUpload]
    );

    const triggerFileUpload = () => fileInputRef.current?.click();

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 bg-white/2 flex-shrink-0">
                <span className="text-xs text-white/40 font-medium uppercase tracking-wider">Editor</span>

                <div className="flex items-center gap-2 ml-auto">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={triggerFileUpload}
                        disabled={isOCRProcessing}
                        loading={isOCRProcessing}
                        id="upload-file-btn"
                    >
                        {isOCRProcessing ? 'Processing…' : '📄 Upload File'}
                    </Button>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    id="resume-file-input"
                />
            </div>

            {/* Helper text */}
            <div className="px-4 py-2.5 bg-violet-500/5 border-b border-violet-500/10 flex-shrink-0">
                <p className="text-xs text-violet-300/70">
                    💡 Paste your resume with headings like <strong className="text-violet-300">"Experience"</strong>,{' '}
                    <strong className="text-violet-300">"Education"</strong>, or{' '}
                    <strong className="text-violet-300">"Skills"</strong>. You can also upload a PDF or image.
                    <span className="text-white/40 ml-2">Select any text for AI assistance.</span>
                </p>
            </div>

            {/* Editor area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 tiptap-editor">
                {editor ? (
                    <>
                        <AIToolbar editor={editor} sectionType={sectionType} roleTitle={roleTitle} />
                        <EditorContent editor={editor} className="min-h-full" />
                    </>
                ) : (
                    <div className="text-white/20 text-sm">Loading editor…</div>
                )}
            </div>
        </div>
    );
}
