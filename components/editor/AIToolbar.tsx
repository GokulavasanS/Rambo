// ============================================================
// components/editor/AIToolbar.tsx
// Floating AI action toolbar that appears on text selection
// Custom-positioned without BubbleMenu for TipTap v3 compat
// ============================================================

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { Editor } from '@tiptap/react';
import { askAI, buildAIRequest } from '@/lib/ai';
import type { AIActionType, ResumeSectionType } from '@/types';
import { Button } from '@/components/ui/Button';

interface AIToolbarProps {
    editor: Editor;
    sectionType?: ResumeSectionType;
    roleTitle?: string;
}

interface AISuggestion {
    text: string;
    actionType: AIActionType;
    originalText: string;
    from: number;
    to: number;
}

interface ToolbarPosition {
    top: number;
    left: number;
}

const AI_ACTIONS: { key: AIActionType; label: string; emoji: string }[] = [
    { key: 'strengthen', label: 'Strengthen', emoji: '💪' },
    { key: 'shorten', label: 'Shorten', emoji: '✂️' },
    { key: 'formalize', label: 'Formalize', emoji: '👔' },
    { key: 'fix-grammar', label: 'Fix Grammar', emoji: '✅' },
    { key: 'custom', label: 'Custom…', emoji: '✨' },
];

export function AIToolbar({ editor, sectionType, roleTitle }: AIToolbarProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState<AIActionType | null>(null);
    const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
    const [customPrompt, setCustomPrompt] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [toolbarPos, setToolbarPos] = useState<ToolbarPosition | null>(null);
    const [hasSelection, setHasSelection] = useState(false);
    const toolbarRef = useRef<HTMLDivElement>(null);

    // Track selection and position toolbar accordingly
    useEffect(() => {
        if (!editor) return;

        const updateToolbar = () => {
            const { from, to } = editor.state.selection;
            const hasText = from !== to;

            setHasSelection(hasText);

            if (!hasText || suggestion) {
                setToolbarPos(null);
                return;
            }

            // Get bounding rect of selection via browser selection API
            const domSelection = window.getSelection();
            if (!domSelection || domSelection.rangeCount === 0) {
                setToolbarPos(null);
                return;
            }

            const range = domSelection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            if (!rect || rect.width === 0) {
                setToolbarPos(null);
                return;
            }

            const scrollY = window.scrollY;
            const scrollX = window.scrollX;

            setToolbarPos({
                top: rect.top + scrollY - 52, // Above selection
                left: rect.left + scrollX + rect.width / 2, // Centered on selection
            });
        };

        editor.on('selectionUpdate', updateToolbar);
        editor.on('blur', () => {
            // Delay so clicks on toolbar don't dismiss it
            setTimeout(() => {
                if (!document.activeElement?.closest('[data-ai-toolbar]')) {
                    setToolbarPos(null);
                    setHasSelection(false);
                }
            }, 150);
        });

        return () => {
            editor.off('selectionUpdate', updateToolbar);
        };
    }, [editor, suggestion]);

    const handleAction = useCallback(
        async (actionType: AIActionType, customPromptOverride?: string) => {
            const { from, to } = editor.state.selection;
            const selectedText = editor.state.doc.textBetween(from, to, ' ');
            if (!selectedText.trim()) return;

            setToolbarPos(null);
            setIsLoading(true);
            setLoadingAction(actionType);

            try {
                const request = buildAIRequest(selectedText, actionType, {
                    sectionType,
                    roleTitle,
                    customPrompt: customPromptOverride,
                });
                const response = await askAI(request);

                setSuggestion({
                    text: response.suggestion,
                    actionType,
                    originalText: selectedText,
                    from,
                    to,
                });
            } catch (err) {
                console.error('[Rambo AI] Request failed:', err);
            } finally {
                setIsLoading(false);
                setLoadingAction(null);
            }
        },
        [editor, sectionType, roleTitle]
    );

    const acceptSuggestion = useCallback(() => {
        if (!suggestion) return;
        editor
            .chain()
            .focus()
            .setTextSelection({ from: suggestion.from, to: suggestion.to })
            .insertContent(suggestion.text)
            .run();
        setSuggestion(null);
    }, [editor, suggestion]);

    const insertBelow = useCallback(() => {
        if (!suggestion) return;
        editor
            .chain()
            .focus()
            .setTextSelection({ from: suggestion.to, to: suggestion.to })
            .insertContent('\n' + suggestion.text)
            .run();
        setSuggestion(null);
    }, [editor, suggestion]);

    const cancelSuggestion = useCallback(() => {
        setSuggestion(null);
        setShowCustomInput(false);
        setCustomPrompt('');
    }, []);

    return (
        <>
            {/* ---- Floating Toolbar ---- */}
            {toolbarPos && hasSelection && !suggestion && (
                <div
                    ref={toolbarRef}
                    data-ai-toolbar="true"
                    className="fixed z-50 animate-fade-in"
                    style={{
                        top: `${toolbarPos.top}px`,
                        left: `${toolbarPos.left}px`,
                        transform: 'translateX(-50%)',
                    }}
                >
                    <div className="flex items-center gap-1 bg-[#1a1a2e] border border-white/15 rounded-xl p-1 shadow-2xl shadow-black/60 whitespace-nowrap">
                        {showCustomInput ? (
                            <div className="flex items-center gap-2 px-2">
                                <input
                                    type="text"
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && customPrompt.trim()) {
                                            handleAction('custom', customPrompt);
                                            setShowCustomInput(false);
                                            setCustomPrompt('');
                                        }
                                        if (e.key === 'Escape') {
                                            setShowCustomInput(false);
                                            setCustomPrompt('');
                                        }
                                    }}
                                    placeholder="Your prompt…"
                                    autoFocus
                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 outline-none w-48 focus:border-violet-500/50"
                                />
                                <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={() => {
                                        if (customPrompt.trim()) {
                                            handleAction('custom', customPrompt);
                                            setShowCustomInput(false);
                                            setCustomPrompt('');
                                        }
                                    }}
                                >
                                    Go
                                </Button>
                                <button
                                    onClick={() => setShowCustomInput(false)}
                                    className="text-white/40 hover:text-white text-sm px-1"
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <>
                                <span className="text-xs text-white/40 px-2 font-medium">AI</span>
                                {AI_ACTIONS.map((action) => (
                                    <button
                                        key={action.key}
                                        disabled={isLoading}
                                        onClick={() => {
                                            if (action.key === 'custom') {
                                                setShowCustomInput(true);
                                            } else {
                                                handleAction(action.key);
                                            }
                                        }}
                                        className={`
                      flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                      transition-all duration-150 whitespace-nowrap
                      ${loadingAction === action.key
                                                ? 'bg-violet-600 text-white'
                                                : 'text-white/70 hover:text-white hover:bg-white/8'
                                            }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                                        title={action.label}
                                    >
                                        {loadingAction === action.key ? (
                                            <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <span>{action.emoji}</span>
                                        )}
                                        <span>{action.label}</span>
                                    </button>
                                ))}
                            </>
                        )}
                    </div>

                    {/* Arrow pointer */}
                    <div className="w-2 h-2 bg-[#1a1a2e] border-b border-r border-white/15 rotate-45 mx-auto -mt-1 relative z-10" />
                </div>
            )}

            {/* ---- AI Suggestion UI (bottom fixed) ---- */}
            {suggestion && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 animate-fade-in">
                    <div className="bg-[#1a1a2e] border border-violet-500/30 rounded-2xl shadow-2xl shadow-violet-900/30 p-4">
                        <div className="flex items-start gap-2 mb-3">
                            <span className="text-violet-400 text-sm font-medium">✨ AI Suggestion</span>
                            <span className="ml-auto text-white/40 text-xs capitalize">{suggestion.actionType}</span>
                        </div>

                        {/* Diff preview */}
                        <div className="space-y-2 mb-4">
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-300 line-through opacity-70 break-words">
                                {suggestion.originalText}
                            </div>
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 text-xs text-emerald-300 font-medium break-words">
                                {suggestion.text}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="primary" size="sm" onClick={acceptSuggestion}>
                                Replace
                            </Button>
                            <Button variant="secondary" size="sm" onClick={insertBelow}>
                                Insert Below
                            </Button>
                            <Button variant="ghost" size="sm" onClick={cancelSuggestion} className="ml-auto">
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
