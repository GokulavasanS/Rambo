// ============================================================
// components/editor/SplitPane.tsx
// Draggable split panel for editor / preview layout
// ============================================================

'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';

interface SplitPaneProps {
    left: React.ReactNode;
    right: React.ReactNode;
    /** Default split fraction 0–1 (default 0.48) */
    defaultSplit?: number;
    minLeft?: number;  // px
    minRight?: number; // px
}

export function SplitPane({
    left,
    right,
    defaultSplit = 0.48,
    minLeft = 300,
    minRight = 320,
}: SplitPaneProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [split, setSplit] = useState(defaultSplit); // fraction of total width for left
    const dragging = useRef(false);

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        dragging.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, []);

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (!dragging.current || !containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const total = rect.width;
            const offsetX = e.clientX - rect.left;
            const leftPx = Math.max(minLeft, Math.min(total - minRight, offsetX));
            setSplit(leftPx / total);
        };

        const onUp = () => {
            if (dragging.current) {
                dragging.current = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [minLeft, minRight]);

    return (
        <div ref={containerRef} className="flex flex-1 overflow-hidden relative">
            {/* Left panel */}
            <div
                className="flex flex-col overflow-hidden border-r border-white/8 bg-[#0d0d14]"
                style={{ width: `${split * 100}%`, flexShrink: 0 }}
            >
                {left}
            </div>

            {/* Drag handle */}
            <div
                onMouseDown={onMouseDown}
                className="
          w-1 flex-shrink-0 relative z-10 cursor-col-resize group
          hover:bg-violet-500/40 transition-colors duration-150
        "
                title="Drag to resize"
            >
                {/* Visual indicator dots */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="w-1 h-1 rounded-full bg-violet-400" />
                    ))}
                </div>
            </div>

            {/* Right panel */}
            <div
                className="flex flex-col overflow-hidden bg-[#0a0a10]"
                style={{ flex: 1 }}
            >
                {right}
            </div>
        </div>
    );
}
