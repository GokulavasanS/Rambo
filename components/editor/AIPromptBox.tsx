// ============================================================
// components/editor/AIPromptBox.tsx
// Floating AI prompt box for inline AI assistance on any bullet or section.
// Opens via "✨ Ask AI" button — users can type custom instructions
// or pick from quick-action presets. Streams/displays result inline.
// ============================================================

'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { AIActionType, ResumeSectionType } from '@/types';
import { askAI, buildAIRequest } from '@/lib/ai';
import { useResumeStore } from '@/store/resumeStore';

interface AIPromptBoxProps {
    /** The original text this AI box operates on */
    originalText: string;
    /** Called when user accepts an AI result */
    onAccept: (text: string) => void;
    /** Called to close without accepting */
    onClose: () => void;
    sectionType?: ResumeSectionType;
    accentColor?: string;
    /** Whether to show the box (controlled externally) */
    visible: boolean;
}

const QUICK_ACTIONS: Array<{ key: AIActionType; icon: string; label: string; desc: string }> = [
    { key: 'strengthen',  icon: '💪', label: 'Strengthen',    desc: 'More impactful language' },
    { key: 'quantify',    icon: '📊', label: 'Quantify',       desc: 'Add metrics & numbers' },
    { key: 'shorten',     icon: '✂️',  label: 'Shorten',        desc: 'Trim to essentials' },
    { key: 'formalize',   icon: '🎩', label: 'Formalize',      desc: 'More professional tone' },
    { key: 'fix-grammar', icon: '✅', label: 'Fix Grammar',    desc: 'Polish writing' },
    { key: 'tailorToJob', icon: '🎯', label: 'Tailor to JD',  desc: 'Match job description' },
];

export function AIPromptBox({
    originalText,
    onAccept,
    onClose,
    sectionType,
    accentColor = '#ff6b00',
    visible,
}: AIPromptBoxProps) {
    const { jobDescription } = useResumeStore();
    const [customPrompt, setCustomPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [activeAction, setActiveAction] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);

    // Focus input when opened
    useEffect(() => {
        if (visible) {
            setResult(null);
            setError(null);
            setCustomPrompt('');
            setActiveAction(null);
            setTimeout(() => inputRef.current?.focus(), 60);
        }
    }, [visible]);

    if (!visible) return null;

    const runAction = async (actionKey: AIActionType, customInstruction?: string) => {
        if (!originalText.trim() && !customInstruction) return;
        setIsLoading(true);
        setResult(null);
        setError(null);
        setActiveAction(actionKey);

        try {
            const req = buildAIRequest(
                originalText,
                actionKey,
                {
                    sectionType,
                    jobDescription,
                    customPrompt: actionKey === 'custom' ? customInstruction : undefined,
                }
            );
            const res = await askAI(req);
            setResult(res.suggestion);
        } catch (err) {
            setError('AI is unavailable right now. Please try again.');
            console.error('[AIPromptBox]', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCustomSubmit = () => {
        if (!customPrompt.trim()) return;
        runAction('custom', customPrompt);
    };

    return (
        <div
            ref={boxRef}
            className="ai-prompt-box"
            onMouseDown={(e) => e.stopPropagation()}
            style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                right: 0,
                marginBottom: 8,
                zIndex: 50,
                borderRadius: 14,
                background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,107,0,0.08)',
                overflow: 'hidden',
                animation: 'aiBoxSlideIn 0.15s ease-out',
            }}
        >
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px 8px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                background: 'rgba(255,107,0,0.04)',
            }}>
                <span style={{ fontSize: 14 }}>✨</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0', letterSpacing: 0.3 }}>
                    Rambo AI
                </span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginLeft: 2 }}>
                    — improve this text
                </span>
                <button
                    onClick={onClose}
                    style={{
                        marginLeft: 'auto', background: 'none', border: 'none',
                        color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 14,
                        padding: '0 2px', lineHeight: 1,
                    }}
                >×</button>
            </div>

            {/* Quick actions */}
            {!result && !isLoading && (
                <div style={{ padding: '10px 12px 6px' }}>
                    <div style={{
                        fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)',
                        textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
                    }}>Quick Actions</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
                        {QUICK_ACTIONS.map(({ key, icon, label }) => (
                            <button
                                key={key}
                                onClick={() => runAction(key)}
                                disabled={!originalText.trim()}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    padding: '6px 8px', borderRadius: 8, border: 'none',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                                    fontSize: 10, fontWeight: 600, textAlign: 'left',
                                    transition: 'all 0.15s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = `${accentColor}18`;
                                    e.currentTarget.style.color = accentColor;
                                    e.currentTarget.style.borderColor = `${accentColor}40`;
                                    (e.currentTarget as HTMLButtonElement).style.border = `1px solid ${accentColor}40`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                                    (e.currentTarget as HTMLButtonElement).style.border = 'none';
                                }}
                            >
                                <span style={{ fontSize: 12 }}>{icon}</span>
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Custom prompt area */}
            {!result && !isLoading && (
                <div style={{ padding: '6px 12px 12px' }}>
                    <div style={{
                        fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)',
                        textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
                    }}>Custom Instruction</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <textarea
                            ref={inputRef}
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleCustomSubmit();
                                }
                                if (e.key === 'Escape') onClose();
                            }}
                            placeholder={`e.g. "Make this sound more senior" or "Add a leadership angle"…`}
                            rows={2}
                            style={{
                                flex: 1, background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                                color: '#e2e8f0', fontSize: 11, padding: '7px 10px',
                                resize: 'none', outline: 'none', fontFamily: 'inherit',
                                lineHeight: 1.5, caretColor: accentColor,
                            }}
                            onFocus={(e) => { e.target.style.borderColor = `${accentColor}50`; }}
                            onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                        />
                        <button
                            onClick={handleCustomSubmit}
                            disabled={!customPrompt.trim()}
                            style={{
                                padding: '0 12px', borderRadius: 8,
                                background: customPrompt.trim() ? accentColor : 'rgba(255,255,255,0.06)',
                                border: 'none', color: customPrompt.trim() ? '#fff' : 'rgba(255,255,255,0.2)',
                                cursor: customPrompt.trim() ? 'pointer' : 'not-allowed',
                                fontSize: 14, fontWeight: 700, transition: 'all 0.15s',
                                alignSelf: 'stretch',
                            }}
                        >
                            →
                        </button>
                    </div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>
                        Enter to send · Shift+Enter for new line · Esc to close
                    </div>
                </div>
            )}

            {/* Loading state */}
            {isLoading && (
                <div style={{
                    padding: '20px 14px', display: 'flex', alignItems: 'center', gap: 10,
                }}>
                    <div style={{
                        width: 16, height: 16, borderRadius: '50%',
                        border: `2px solid ${accentColor}`,
                        borderTopColor: 'transparent',
                        animation: 'spin 0.7s linear infinite',
                        flexShrink: 0,
                    }} />
                    <div>
                        <div style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 600 }}>
                            Rambo AI is thinking…
                        </div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                            {QUICK_ACTIONS.find(a => a.key === activeAction)?.desc || 'Applying custom instruction'}
                        </div>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div style={{ padding: '10px 14px' }}>
                    <div style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#fca5a5',
                    }}>
                        {error}
                    </div>
                    <button
                        onClick={() => setError(null)}
                        style={{ marginTop: 8, fontSize: 11, color: accentColor, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                        ← Try again
                    </button>
                </div>
            )}

            {/* Result */}
            {result && !isLoading && (
                <div style={{ padding: '10px 14px 14px' }}>
                    <div style={{
                        fontSize: 9, fontWeight: 700, color: accentColor,
                        textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
                        display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                        <span>✨</span> AI Suggestion
                    </div>
                    <div style={{
                        background: `${accentColor}0d`,
                        border: `1px solid ${accentColor}30`,
                        borderRadius: 8, padding: '10px 12px',
                        fontSize: 11, color: '#e2e8f0', lineHeight: 1.65,
                        marginBottom: 10, whiteSpace: 'pre-wrap',
                    }}>
                        {result}
                    </div>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                            onClick={() => { setResult(null); setActiveAction(null); }}
                            style={{
                                padding: '6px 12px', borderRadius: 7, fontSize: 11,
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'rgba(255,255,255,0.55)', cursor: 'pointer',
                                fontWeight: 600,
                            }}
                        >
                            ↩ Retry
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '6px 12px', borderRadius: 7, fontSize: 11,
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
                                fontWeight: 600,
                            }}
                        >
                            Discard
                        </button>
                        <button
                            onClick={() => { onAccept(result); onClose(); }}
                            style={{
                                padding: '6px 14px', borderRadius: 7, fontSize: 11,
                                background: accentColor, border: 'none',
                                color: '#fff', cursor: 'pointer', fontWeight: 700,
                                boxShadow: `0 4px 12px ${accentColor}40`,
                            }}
                        >
                            ✓ Accept
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes aiBoxSlideIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
