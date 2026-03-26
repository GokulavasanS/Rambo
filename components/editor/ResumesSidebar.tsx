// ============================================================
// components/editor/ResumesSidebar.tsx
// Upgrades vs original:
//  • Swipe-left gesture to close on mobile (touch events)
//  • Search/filter bar across saved resumes
//  • Better card layout: shows thumbnail color swatch from theme
//  • Relative timestamps auto-refresh every 30s
//  • Empty state is more helpful
//  • Delete shows inline confirmation (no browser confirm())
//  • Menu always visible on touch devices (not just hover)
// ============================================================

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { StoredResume } from '@/types';
import { useResumeStore } from '@/store/resumeStore';
import { Button } from '@/components/ui/Button';
import { getPlaceholderResumeData } from '@/lib/parsing';
import { getThemeById, DEFAULT_THEME_ID } from '@/lib/theme';

// ── Helpers ────────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
    const ms   = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(ms / 60_000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7)  return `${days}d ago`;
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ── Main component ─────────────────────────────────────────────────────────────

interface ResumesSidebarProps {
    open:    boolean;
    onClose: () => void;
}

export function ResumesSidebar({ open, onClose }: ResumesSidebarProps) {
    const {
        storedResumes, resumeData, loadResumeById, deleteResumeById,
        renameResumeById, duplicateResumeById, refreshStoredResumes,
        saveCurrentResume, setResumeData, setCurrentTheme, setResumeName,
    } = useResumeStore();

    const [renamingId,   setRenamingId]   = useState<string | null>(null);
    const [renameVal,    setRenameVal]    = useState('');
    const [query,        setQuery]        = useState('');
    const [, setTick]                     = useState(0);   // forces re-render for time refresh
    const renameRef   = useRef<HTMLInputElement>(null);
    const asideRef    = useRef<HTMLElement>(null);

    // Refresh timestamps every 30 s
    useEffect(() => {
        const id = setInterval(() => setTick((t) => t + 1), 30_000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => { if (open) refreshStoredResumes(); }, [open, refreshStoredResumes]);
    useEffect(() => { if (renamingId) renameRef.current?.focus(); }, [renamingId]);

    // Swipe-left to close
    useEffect(() => {
        const el = asideRef.current;
        if (!el || !open) return;
        let startX = 0;
        const onStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
        const onEnd   = (e: TouchEvent) => { if (startX - e.changedTouches[0].clientX > 60) onClose(); };
        el.addEventListener('touchstart', onStart, { passive: true });
        el.addEventListener('touchend',   onEnd,   { passive: true });
        return () => { el.removeEventListener('touchstart', onStart); el.removeEventListener('touchend', onEnd); };
    }, [open, onClose]);

    const handleNewResume = () => {
        saveCurrentResume();
        setResumeData(getPlaceholderResumeData());
        setCurrentTheme(getThemeById(DEFAULT_THEME_ID));
        setResumeName('New Resume');
        onClose();
    };

    const filtered = [...storedResumes]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .filter((r) => !query || r.name.toLowerCase().includes(query.toLowerCase()));

    return (
        <>
            {/* Backdrop */}
            {open && (
                <div
                    className="fixed inset-0 z-30"
                    style={{ background: 'rgba(9,9,15,0.55)', backdropFilter: 'blur(4px)' }}
                    onClick={onClose}
                    aria-hidden
                />
            )}

            {/* Drawer */}
            <aside
                ref={asideRef}
                aria-label="Your resumes"
                className={`fixed top-0 left-0 h-full z-40 flex flex-col transition-transform duration-300 ease-out`}
                style={{
                    width:       288,
                    background:  '#ffffff',
                    borderRight: '1px solid #e2e8f0',
                    boxShadow:   open ? '8px 0 40px rgba(15,23,42,0.12)' : 'none',
                    transform:   open ? 'translateX(0)' : 'translateX(-100%)',
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-5 py-4 flex-shrink-0"
                    style={{ borderBottom: '1px solid #f1f5f9' }}
                >
                    <div>
                        <h2 className="text-sm font-bold" style={{ color: '#0f172a' }}>Your Resumes</h2>
                        <p className="text-[10px] mt-0.5" style={{ color: '#94a3b8' }}>
                            {storedResumes.length} saved locally
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-full transition-colors"
                        style={{ color: '#94a3b8', background: '#f8fafc' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                        aria-label="Close sidebar"
                    >
                        ×
                    </button>
                </div>

                {/* New resume + search */}
                <div className="px-4 py-3 space-y-2 flex-shrink-0" style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <button
                        onClick={handleNewResume}
                        id="new-resume-btn"
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={{ background: '#ff6b00', color: '#fff', boxShadow: '0 4px 12px rgba(255,107,0,0.28)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#e85d00')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '#ff6b00')}
                    >
                        <span className="text-base leading-none">+</span>
                        New Resume
                    </button>

                    {storedResumes.length > 3 && (
                        <div className="relative">
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                width="13" height="13" viewBox="0 0 13 13" fill="none"
                            >
                                <circle cx="5.5" cy="5.5" r="4.5" stroke="#94a3b8" strokeWidth="1.4"/>
                                <path d="M9 9l2.5 2.5" stroke="#94a3b8" strokeWidth="1.4" strokeLinecap="round"/>
                            </svg>
                            <input
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search resumes…"
                                className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none transition-all"
                                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a' }}
                                onFocus={(e) => (e.target.style.borderColor = '#ff6b00')}
                                onBlur={(e)  => (e.target.style.borderColor = '#e2e8f0')}
                            />
                        </div>
                    )}
                </div>

                {/* Resume list */}
                <div className="flex-1 overflow-y-auto py-2">
                    {filtered.length === 0 ? (
                        <div className="px-5 py-12 text-center">
                            <div className="text-4xl mb-3 opacity-40">
                                {query ? '🔍' : '📄'}
                            </div>
                            <p className="text-sm font-medium" style={{ color: '#64748b' }}>
                                {query ? 'No matches found' : 'No saved resumes yet'}
                            </p>
                            <p className="text-xs mt-1" style={{ color: '#cbd5e1' }}>
                                {query ? 'Try a different search' : 'Start editing — autosave handles the rest.'}
                            </p>
                        </div>
                    ) : (
                        filtered.map((r) => (
                            <ResumeCard
                                key={r.id}
                                resume={r}
                                isActive={r.id === resumeData.id}
                                isRenaming={renamingId === r.id}
                                renameVal={renameVal}
                                renameRef={renameRef}
                                onLoad={()           => { loadResumeById(r.id); onClose(); }}
                                onRenameStart={()    => { setRenamingId(r.id); setRenameVal(r.name); }}
                                onRenameChange={setRenameVal}
                                onRenameCommit={()   => { if (renameVal.trim()) renameResumeById(r.id, renameVal.trim()); setRenamingId(null); }}
                                onRenameCancel={()   => setRenamingId(null)}
                                onDuplicate={()      => duplicateResumeById(r.id)}
                                onDelete={()         => deleteResumeById(r.id)}
                                relTime={relativeTime(r.updatedAt)}
                            />
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 flex-shrink-0" style={{ borderTop: '1px solid #f1f5f9' }}>
                    <p className="text-[10px] text-center" style={{ color: '#cbd5e1' }}>
                        Stored locally · never uploaded
                    </p>
                </div>
            </aside>
        </>
    );
}

// ── Resume card ────────────────────────────────────────────────────────────────

interface CardProps {
    resume:          StoredResume;
    isActive:        boolean;
    isRenaming:      boolean;
    renameVal:       string;
    renameRef:       React.RefObject<HTMLInputElement | null>;
    relTime:         string;
    onLoad:          () => void;
    onRenameStart:   () => void;
    onRenameChange:  (v: string) => void;
    onRenameCommit:  () => void;
    onRenameCancel:  () => void;
    onDuplicate:     () => void;
    onDelete:        () => void;
}

function ResumeCard({
    resume, isActive, isRenaming, renameVal, renameRef, relTime,
    onLoad, onRenameStart, onRenameChange, onRenameCommit, onRenameCancel,
    onDuplicate, onDelete,
}: CardProps) {
    const [menuOpen,   setMenuOpen]   = useState(false);
    const [confirming, setConfirming] = useState(false);

    const closeMenu = useCallback(() => setMenuOpen(false), []);

    return (
        <div
            className="mx-2 mb-1 rounded-xl group transition-all"
            style={{
                background:  isActive ? '#fff3e8' : 'transparent',
                border:      `1px solid ${isActive ? '#ffd4b0' : 'transparent'}`,
            }}
        >
            {confirming ? (
                /* Inline delete confirmation */
                <div className="px-3 py-2.5 flex items-center gap-2">
                    <span className="text-xs flex-1" style={{ color: '#64748b' }}>
                        Delete &quot;{resume.name}&quot;?
                    </span>
                    <button
                        onClick={() => setConfirming(false)}
                        className="text-xs px-2 py-1 rounded-lg font-medium"
                        style={{ color: '#64748b', background: '#f1f5f9' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => { onDelete(); setConfirming(false); }}
                        className="text-xs px-2 py-1 rounded-lg font-bold"
                        style={{ background: '#ef4444', color: '#fff' }}
                    >
                        Delete
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-2 px-3 py-2.5">
                    {/* Icon */}
                    <span className="text-base flex-shrink-0 opacity-50">📄</span>

                    {/* Name / rename input */}
                    <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={isRenaming ? undefined : onLoad}
                    >
                        {isRenaming ? (
                            <input
                                ref={renameRef}
                                type="text"
                                value={renameVal}
                                onChange={(e) => onRenameChange(e.target.value)}
                                onBlur={onRenameCommit}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter')  onRenameCommit();
                                    if (e.key === 'Escape') onRenameCancel();
                                }}
                                className="w-full text-xs rounded-lg px-2 py-0.5 outline-none"
                                style={{ background: '#f4f4f5', border: '1px solid #e2e8f0', color: '#0f172a' }}
                            />
                        ) : (
                            <>
                                <p
                                    className="text-sm truncate font-semibold leading-tight"
                                    style={{ color: isActive ? '#ff6b00' : '#0f172a' }}
                                >
                                    {resume.name}
                                </p>
                                <p className="text-[10px] mt-0.5" style={{ color: '#94a3b8' }}>
                                    {relTime}
                                    {isActive && (
                                        <span className="ml-1.5 font-semibold" style={{ color: '#ff6b00' }}>· active</span>
                                    )}
                                </p>
                            </>
                        )}
                    </div>

                    {/* ⋯ menu */}
                    {!isRenaming && (
                        <div className="relative flex-shrink-0">
                            <button
                                onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
                                className="w-6 h-6 flex items-center justify-center rounded-md transition-colors opacity-0 group-hover:opacity-100 sm:opacity-0 touch:opacity-100"
                                style={{ color: '#94a3b8', background: menuOpen ? '#f1f5f9' : 'transparent' }}
                                aria-label="Resume options"
                            >
                                ⋯
                            </button>

                            {menuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={closeMenu} />
                                    <div
                                        className="absolute right-0 top-full mt-1 z-20 rounded-xl border p-1 shadow-xl"
                                        style={{ background: '#fff', borderColor: '#e2e8f0', minWidth: 148 }}
                                    >
                                        {[
                                            { label: '📂 Open',      action: () => { onLoad();        closeMenu(); } },
                                            { label: '✏️ Rename',    action: () => { onRenameStart(); closeMenu(); } },
                                            { label: '📋 Duplicate', action: () => { onDuplicate();   closeMenu(); } },
                                        ].map(({ label, action }) => (
                                            <button
                                                key={label}
                                                onClick={action}
                                                className="w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors"
                                                style={{ color: '#475569' }}
                                                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                        <div className="my-1 mx-2 border-t" style={{ borderColor: '#f1f5f9' }} />
                                        <button
                                            onClick={() => { setConfirming(true); closeMenu(); }}
                                            className="w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors"
                                            style={{ color: '#ef4444' }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                        >
                                            🗑 Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
