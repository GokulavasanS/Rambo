// ============================================================
// components/editor/SplitPane.tsx
// Fixes:
//  • Mobile: tab-based switching (Editor | Preview) instead of tiny split
//  • Touch drag support for resizing on tablets
//  • Keyboard accessibility on drag handle (←/→ arrows)
//  • Min/max guards prevent panels from collapsing completely
//  • Persists split ratio to localStorage
// ============================================================

'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';

interface SplitPaneProps {
    left: React.ReactNode;
    right: React.ReactNode;
    defaultSplit?: number; // 0–1 fraction for left panel
    minLeft?: number;      // px
    minRight?: number;     // px
}

const STORAGE_KEY = 'rambo:split-ratio';

function useSavedSplit(defaultSplit: number) {
    const [split, setSplit] = useState(() => {
        if (typeof window === 'undefined') return defaultSplit;
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = saved ? parseFloat(saved) : NaN;
        return isNaN(parsed) ? defaultSplit : Math.min(0.75, Math.max(0.25, parsed));
    });

    const persistedSet = useCallback((v: number) => {
        setSplit(v);
        try { localStorage.setItem(STORAGE_KEY, String(v)); } catch {}
    }, []);

    return [split, persistedSet] as const;
}

export function SplitPane({
    left,
    right,
    defaultSplit = 0.48,
    minLeft  = 300,
    minRight = 320,
}: SplitPaneProps) {
    const containerRef    = useRef<HTMLDivElement>(null);
    const dragging        = useRef(false);
    const [split, setSplit] = useSavedSplit(defaultSplit);

    // Mobile tab state (only used on narrow screens)
    const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

    // ── Desktop drag ──────────────────────────────────────────
    const startDrag = useCallback((clientX: number) => {
        dragging.current = true;
        document.body.style.cursor      = 'col-resize';
        document.body.style.userSelect  = 'none';
        document.body.style.pointerEvents = 'none';
    }, []);

    const moveDrag = useCallback((clientX: number) => {
        if (!dragging.current || !containerRef.current) return;
        const rect  = containerRef.current.getBoundingClientRect();
        const total = rect.width;
        const offsetX = clientX - rect.left;
        const leftPx  = Math.max(minLeft, Math.min(total - minRight, offsetX));
        setSplit(leftPx / total);
    }, [minLeft, minRight, setSplit]);

    const endDrag = useCallback(() => {
        if (!dragging.current) return;
        dragging.current = false;
        document.body.style.cursor        = '';
        document.body.style.userSelect    = '';
        document.body.style.pointerEvents = '';
    }, []);

    useEffect(() => {
        const onMove = (e: MouseEvent)      => moveDrag(e.clientX);
        const onTouchMove = (e: TouchEvent) => moveDrag(e.touches[0].clientX);
        const onUp   = ()                   => endDrag();

        window.addEventListener('mousemove',  onMove);
        window.addEventListener('touchmove',  onTouchMove, { passive: true });
        window.addEventListener('mouseup',    onUp);
        window.addEventListener('touchend',   onUp);
        return () => {
            window.removeEventListener('mousemove',  onMove);
            window.removeEventListener('touchmove',  onTouchMove);
            window.removeEventListener('mouseup',    onUp);
            window.removeEventListener('touchend',   onUp);
        };
    }, [moveDrag, endDrag]);

    // Keyboard nudge on drag handle
    const onHandleKeyDown = (e: React.KeyboardEvent) => {
        const step = e.shiftKey ? 0.1 : 0.02;
        if (e.key === 'ArrowLeft')  { e.preventDefault(); setSplit(Math.max(0.2, split - step)); }
        if (e.key === 'ArrowRight') { e.preventDefault(); setSplit(Math.min(0.8, split + step)); }
    };

    return (
        <>
            {/* ── Mobile: Tab switcher (shown only on small screens) ── */}
            <div className="flex md:hidden flex-col h-full">
                {/* Tab bar */}
                <div
                    className="flex flex-shrink-0 border-b"
                    style={{ background: '#0b0b12', borderColor: 'rgba(255,255,255,0.08)' }}
                >
                    {(['editor', 'preview'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setMobileTab(tab)}
                            className="flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-all"
                            style={{
                                color:       mobileTab === tab ? '#ff6b00'                   : 'rgba(255,255,255,0.35)',
                                borderBottom: mobileTab === tab ? '2px solid #ff6b00'        : '2px solid transparent',
                                background:  mobileTab === tab ? 'rgba(255,107,0,0.05)'     : 'transparent',
                            }}
                        >
                            {tab === 'editor' ? '✏️ Editor' : '👁 Preview'}
                        </button>
                    ))}
                </div>

                {/* Active panel */}
                <div className="flex-1 overflow-hidden">
                    {mobileTab === 'editor' ? left : right}
                </div>
            </div>

            {/* ── Desktop: Side-by-side split pane ── */}
            <div
                ref={containerRef}
                className="hidden md:flex flex-1 overflow-hidden relative"
            >
                {/* Left panel */}
                <div
                    className="flex flex-col overflow-hidden"
                    style={{
                        width:      `${split * 100}%`,
                        flexShrink: 0,
                        borderRight: '1px solid rgba(255,255,255,0.07)',
                        background: '#0d0d14',
                    }}
                >
                    {left}
                </div>

                {/* Drag handle */}
                <div
                    role="separator"
                    aria-orientation="vertical"
                    aria-label="Resize panels"
                    tabIndex={0}
                    onMouseDown={(e) => { e.preventDefault(); startDrag(e.clientX); }}
                    onTouchStart={(e) => startDrag(e.touches[0].clientX)}
                    onKeyDown={onHandleKeyDown}
                    className="group relative z-10 flex-shrink-0 cursor-col-resize outline-none"
                    style={{ width: 8 }}
                    title="Drag to resize · Arrow keys to nudge"
                >
                    {/* Background line */}
                    <div
                        className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px transition-all duration-150 group-hover:w-0.5 group-focus:w-0.5"
                        style={{ background: 'rgba(255,255,255,0.08)' }}
                    />
                    {/* Center grip dots */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-[5px] opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="rounded-full transition-all duration-150"
                                style={{
                                    width: 3,
                                    height: 3,
                                    background: '#ff6b00',
                                    opacity: 1 - i * 0.15,
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Right panel */}
                <div
                    className="flex flex-col overflow-hidden"
                    style={{ flex: 1, background: '#0a0a10' }}
                >
                    {right}
                </div>
            </div>
        </>
    );
}
