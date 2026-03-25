// ============================================================
// components/editor/AIWritingAssistant.tsx
// Inline UI for displaying and selecting AI suggestions
// ============================================================

import React, { useState } from 'react';
import type { AIActionType, AIResponse } from '@/types';

interface AIWritingAssistantProps {
    originalText: string;
    action: AIActionType;
    response: AIResponse;
    onAccept: (text: string) => void;
    onReject: () => void;
}

export function AIWritingAssistant({
    originalText,
    action,
    response,
    onAccept,
    onReject
}: AIWritingAssistantProps) {
    // If it's a single suggestion, just show it. If it's an array of variants, let the user pick.
    const hasVariants = response.variants && response.variants.length > 0;
    const items = hasVariants ? response.variants! : [response.suggestion];
    
    // Default to the first one
    const [selectedIndex, setSelectedIndex] = useState(0);

    const getActionLabel = (act: AIActionType) => {
        switch(act) {
            case 'strengthen': return 'Strengthened';
            case 'shorten': return 'Shortened';
            case 'formalize': return 'Formalized';
            case 'fix-grammar': return 'Grammar Fixed';
            case 'quantify': return 'Quantified';
            case 'tailorToJob': return 'Tailored to JD';
            case 'generateSummary': return 'Generated Summary';
            default: return 'AI Suggestion';
        }
    };

    return (
        <div className="bg-[#1e293b] border border-[#ff6b00]/30 rounded-xl p-3 shadow-2xl animate-fade-in my-2">
            
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                    <span className="text-[#ff6b00] text-sm animate-pulse">✨</span>
                    <span className="text-xs font-bold text-[#e2e8f0] uppercase tracking-wide">
                        {getActionLabel(action)}
                    </span>
                </div>
                {hasVariants && (
                    <span className="text-[10px] text-[#64748b] font-medium bg-black/20 px-2 py-0.5 rounded-full">
                        {items.length} Options
                    </span>
                )}
            </div>

            {hasVariants ? (
                <div className="space-y-2 mb-3">
                    {items.map((text, idx) => (
                        <div 
                            key={idx}
                            onClick={() => setSelectedIndex(idx)}
                            className={`p-2.5 rounded-lg text-sm cursor-pointer border transition-all leading-relaxed ${
                                selectedIndex === idx 
                                ? 'bg-[#ff6b00]/10 border-[#ff6b00]/50 text-[#f8fafc]' 
                                : 'bg-black/20 border-transparent text-[#94a3b8] hover:bg-black/40 hover:text-[#cbd5e1]'
                            }`}
                        >
                            {text}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-2.5 rounded-lg text-sm bg-[#ff6b00]/10 border border-[#ff6b00]/50 text-[#f8fafc] mb-3 leading-relaxed">
                    {items[0]}
                </div>
            )}

            <div className="flex items-center gap-2 justify-end">
                <button 
                    onClick={onReject}
                    className="px-3 py-1.5 text-xs font-medium text-[#94a3b8] hover:text-[#f8fafc] hover:bg-white/5 rounded-lg transition-colors"
                >
                    Discard
                </button>
                <button 
                    onClick={() => onAccept(items[selectedIndex])}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-[#ff6b00] hover:bg-[#e85d00] rounded-lg shadow-lg shadow-[#ff6b00]/20 transition-all active:scale-95"
                >
                    Accept {hasVariants && `Option ${selectedIndex + 1}`}
                </button>
            </div>
            
        </div>
    );
}
