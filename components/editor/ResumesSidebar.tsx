'use client';
import React, { useEffect, useState, useRef } from 'react';
import type { StoredResume } from '@/types';
import { useResumeStore } from '@/store/resumeStore';
import { Button } from '@/components/ui/Button';
import { getPlaceholderResumeData } from '@/lib/parsing';
import { getThemeById, DEFAULT_THEME_ID } from '@/lib/theme';

interface ResumesSidebarProps {
    open: boolean;
    onClose: () => void;
}

function relativeTime(iso: string): string {
    const ms = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export function ResumesSidebar({ open, onClose }: ResumesSidebarProps) {
    const {
        storedResumes, resumeData, loadResumeById, deleteResumeById,
        renameResumeById, duplicateResumeById, refreshStoredResumes,
        saveCurrentResume, setResumeData, setCurrentTheme, setResumeName,
    } = useResumeStore();

    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameVal, setRenameVal] = useState('');
    const renameRef = useRef<HTMLInputElement>(null);

    useEffect(() => { if (open) refreshStoredResumes(); }, [open, refreshStoredResumes]);
    useEffect(() => { if (renamingId) renameRef.current?.focus(); }, [renamingId]);

    const handleNewResume = () => {
        saveCurrentResume();
        setResumeData(getPlaceholderResumeData());
        setCurrentTheme(getThemeById(DEFAULT_THEME_ID));
        setResumeName('New Resume');
        onClose();
    };

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 z-30"
                    style={{ background: 'rgba(15,23,42,0.25)', backdropFilter: 'blur(4px)' }}
                    onClick={onClose}
                />
            )}
            <aside
                className={`fixed top-0 left-0 h-full z-40 w-72 flex flex-col transition-transform duration-300 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ background: '#ffffff', borderRight: '1px solid #e2e8f0', boxShadow: '4px 0 32px rgba(15,23,42,0.08)' }}
            >
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <h2 className="text-sm font-bold text-[#0f172a]">Your Resumes</h2>
                    <button onClick={onClose} className="text-[#94a3b8] hover:text-[#0f172a] text-xl transition-colors">×</button>
                </div>

                <div className="px-4 py-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <Button variant="outline" size="sm" className="w-full justify-center" onClick={handleNewResume} id="new-resume-btn">
                        + New Resume
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto py-2">
                    {storedResumes.length === 0 ? (
                        <div className="px-5 py-10 text-center">
                            <div className="text-4xl mb-3 opacity-50">📄</div>
                            <p className="text-sm text-[#94a3b8]">No saved resumes yet.</p>
                            <p className="text-xs text-[#cbd5e1] mt-1">Start editing — autosave handles the rest.</p>
                        </div>
                    ) : (
                        [...storedResumes]
                            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                            .map((r) => (
                                <ResumeCard
                                    key={r.id}
                                    resume={r}
                                    isActive={r.id === resumeData.id}
                                    isRenaming={renamingId === r.id}
                                    renameVal={renameVal}
                                    renameRef={renameRef}
                                    onLoad={() => { loadResumeById(r.id); onClose(); }}
                                    onRenameStart={() => { setRenamingId(r.id); setRenameVal(r.name); }}
                                    onRenameChange={setRenameVal}
                                    onRenameCommit={() => { if (renameVal.trim()) renameResumeById(r.id, renameVal.trim()); setRenamingId(null); }}
                                    onRenameCancel={() => setRenamingId(null)}
                                    onDuplicate={() => duplicateResumeById(r.id)}
                                    onDelete={() => deleteResumeById(r.id)}
                                />
                            ))
                    )}
                </div>

                <div className="px-5 py-3" style={{ borderTop: '1px solid #f1f5f9' }}>
                    <p className="text-[10px] text-center text-[#cbd5e1]">Stored locally in your browser</p>
                </div>
            </aside>
        </>
    );
}

interface CardProps {
    resume: StoredResume;
    isActive: boolean;
    isRenaming: boolean;
    renameVal: string;
    renameRef: React.RefObject<HTMLInputElement | null>;
    onLoad: () => void;
    onRenameStart: () => void;
    onRenameChange: (v: string) => void;
    onRenameCommit: () => void;
    onRenameCancel: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
}

function ResumeCard({ resume, isActive, isRenaming, renameVal, renameRef, onLoad, onRenameStart, onRenameChange, onRenameCommit, onRenameCancel, onDuplicate, onDelete }: CardProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <div
            className="mx-2 mb-1 rounded-xl group"
            style={{
                background: isActive ? '#fff3e8' : 'transparent',
                border: `1px solid ${isActive ? '#ffd4b0' : 'transparent'}`,
            }}
        >
            <div className="flex items-center gap-2 px-3 py-2.5">
                <span className="text-base opacity-60">📄</span>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={isRenaming ? undefined : onLoad}>
                    {isRenaming ? (
                        <input
                            ref={renameRef}
                            type="text"
                            value={renameVal}
                            onChange={(e) => onRenameChange(e.target.value)}
                            onBlur={onRenameCommit}
                            onKeyDown={(e) => { if (e.key === 'Enter') onRenameCommit(); if (e.key === 'Escape') onRenameCancel(); }}
                            className="w-full text-xs rounded px-1.5 py-0.5 outline-none"
                            style={{ background: '#f4f4f5', border: '1px solid #e2e8f0', color: '#0f172a' }}
                        />
                    ) : (
                        <>
                            <p className={`text-sm truncate font-medium ${isActive ? 'text-[#ff6b00]' : 'text-[#0f172a]'}`}>{resume.name}</p>
                            <p className="text-[10px] text-[#94a3b8]">
                                {relativeTime(resume.updatedAt)}{isActive && <span className="ml-1 text-[#ff6b00]">· active</span>}
                            </p>
                        </>
                    )}
                </div>
                {!isRenaming && (
                    <div className="relative">
                        <button
                            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
                            className="opacity-0 group-hover:opacity-100 text-[#94a3b8] hover:text-[#0f172a] transition-all px-1"
                        >⋯</button>
                        {menuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                                <div
                                    className="absolute right-0 top-full mt-1 z-20 rounded-xl shadow-lg border p-1 min-w-[140px] animate-scale-in"
                                    style={{ background: '#fff', borderColor: '#e2e8f0' }}
                                >
                                    {[
                                        { label: '📂 Open', action: () => { onLoad(); setMenuOpen(false); } },
                                        { label: '✏️ Rename', action: () => { onRenameStart(); setMenuOpen(false); } },
                                        { label: '📋 Duplicate', action: () => { onDuplicate(); setMenuOpen(false); } },
                                    ].map(({ label, action }) => (
                                        <button key={label} onClick={action} className="w-full text-left px-3 py-1.5 text-xs rounded-lg text-[#475569] hover:bg-[#f4f4f5] transition-colors">{label}</button>
                                    ))}
                                    <hr className="my-1 border-[#f1f5f9]" />
                                    <button
                                        onClick={() => { if (confirm(`Delete "${resume.name}"?`)) onDelete(); setMenuOpen(false); }}
                                        className="w-full text-left px-3 py-1.5 text-xs rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                    >🗑 Delete</button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
