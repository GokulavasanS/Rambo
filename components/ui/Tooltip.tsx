// ============================================================
// components/ui/Tooltip.tsx — Simple hover tooltip
// ============================================================

'use client';

import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
    children: React.ReactNode;
    content: string;
    delay?: number;
}

export function Tooltip({ children, content, delay = 500 }: TooltipProps) {
    const [visible, setVisible] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const triggerRef = useRef<HTMLSpanElement>(null);

    const show = () => {
        timerRef.current = setTimeout(() => {
            const el = triggerRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            setPos({
                top: rect.bottom + window.scrollY + 6,
                left: rect.left + window.scrollX + rect.width / 2,
            });
            setVisible(true);
        }, delay);
    };

    const hide = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setVisible(false);
    };

    return (
        <>
            <span ref={triggerRef} onMouseEnter={show} onMouseLeave={hide}>
                {children}
            </span>
            {visible &&
                typeof document !== 'undefined' &&
                createPortal(
                    <div
                        className="fixed z-[9999] pointer-events-none"
                        style={{ top: pos.top, left: pos.left, transform: 'translateX(-50%)' }}
                    >
                        <div className="bg-[#1a1a2e] border border-white/15 text-white/80 text-xs px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                            {content}
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}
