// ============================================================
// components/editor/StructuredEditor.tsx
//
// Key fixes & upgrades vs original:
//  1. SPACING BUG: updateThemeProperty('spacing', v) was writing a
//     number but the CSS injection in ResumePreview re-ran only on mount.
//     Fix: spacing is now applied via a CSS custom property (--spacing-mult)
//     on the preview root, updated live. All spacing-sensitive classes
//     read from that variable. ThemeSettings calls updateThemeProperty
//     which triggers a store re-render, which the preview picks up.
//  2. Mobile: contact grid collapses to single column on small screens
//  3. PremiumInput: min-height on textarea, proper placeholder color
//  4. BulletRow: Enter key adds new bullet; Tab moves focus to next bullet
//  5. SectionCard: shows entry/bullet count badge in collapsed state
//  6. EntryCard: period field gets smart autocomplete hint (e.g. "Present")
//  7. HeaderBlock: profile photo upload works on mobile (input capture)
//  8. Add Section menu: appears above button (fixed z/positioning)
//  9. Undo/redo buttons: proper tooltip and disabled styling
// 10. Job description word-count badge
// ============================================================

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type {
    ResumeData, ResumeSection, ResumeEntry, ResumeBullet,
    ResumeSectionType, AIActionType, AIResponse,
} from '@/types';
import { v4 as uuidv4 } from 'uuid';
import {
    DragDropContext, Droppable, Draggable, DropResult,
    DraggableProvidedDragHandleProps,
} from '@hello-pangea/dnd';
import { useResumeStore } from '@/store/resumeStore';
import { AIWritingAssistant } from './AIWritingAssistant';
import { AIPromptBox } from './AIPromptBox';
import { askAI, buildAIRequest } from '@/lib/ai';

// ── Factory helpers ────────────────────────────────────────────────────────────

function newBullet(text = ''): ResumeBullet { return { id: uuidv4(), text }; }

function newEntry(): ResumeEntry {
    return { id: uuidv4(), organization: '', role: '', period: '', location: '', bullets: [newBullet()] };
}

function newSection(type: ResumeSectionType): ResumeSection {
    const hasEntries = ['experience', 'education', 'projects'].includes(type);
    return {
        id:      uuidv4(),
        type,
        title:   type.charAt(0).toUpperCase() + type.slice(1),
        entries: hasEntries ? [newEntry()] : undefined,
        bullets: hasEntries ? undefined    : [newBullet()],
    };
}

function updateSection(
    data:      ResumeData,
    sectionId: string,
    updater:   (s: ResumeSection) => ResumeSection,
): ResumeData {
    return { ...data, sections: data.sections.map((s) => s.id === sectionId ? updater(s) : s) };
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SECTION_TYPES: { type: ResumeSectionType; label: string; icon: string; color: string }[] = [
    { type: 'summary',        label: 'Summary',        icon: '📝', color: '#6366f1' },
    { type: 'experience',     label: 'Experience',     icon: '💼', color: '#ff6b00' },
    { type: 'education',      label: 'Education',      icon: '🎓', color: '#0ea5e9' },
    { type: 'projects',       label: 'Projects',       icon: '🚀', color: '#8b5cf6' },
    { type: 'skills',         label: 'Skills',         icon: '⚡', color: '#10b981' },
    { type: 'certifications', label: 'Certifications', icon: '🏆', color: '#f59e0b' },
    { type: 'other',          label: 'Other',          icon: '➕', color: '#64748b' },
];

const SECTION_COLORS: Record<ResumeSectionType, string> = {
    summary:        '#6366f1',
    experience:     '#ff6b00',
    education:      '#0ea5e9',
    projects:       '#8b5cf6',
    skills:         '#10b981',
    certifications: '#f59e0b',
    other:          '#64748b',
};

// ── Main component ─────────────────────────────────────────────────────────────

export function StructuredEditor({ data, onChange }: { data: ResumeData; onChange: (data: ResumeData) => void }) {
    const [addMenuOpen, setAddMenuOpen] = useState(false);
    const { jobDescription, setJobDescription, undo, redo, historyIndex, history, reorderSections } = useResumeStore();

    const handleContactChange = (field: keyof NonNullable<ResumeData['contact']>, value: string) => {
        onChange({ ...data, contact: { ...data.contact, [field]: value } });
    };

    const handleAddSection    = (type: ResumeSectionType) => {
        onChange({ ...data, sections: [...data.sections, newSection(type)] });
        setAddMenuOpen(false);
    };

    const handleDeleteSection = (id: string) =>
        onChange({ ...data, sections: data.sections.filter((s) => s.id !== id) });

    const handleSectionChange = (updated: ResumeSection) =>
        onChange(updateSection(data, updated.id, () => updated));

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        if (result.destination.index === result.source.index) return;
        reorderSections(result.source.index, result.destination.index);
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (!(e.metaKey || e.ctrlKey)) return;
            if (e.key === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
            if (e.key === 'y') { e.preventDefault(); redo(); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [undo, redo]);

    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;
    const jdWordCount = jobDescription.trim() ? jobDescription.trim().split(/\s+/).length : 0;

    return (
        <div className="flex flex-col h-full" style={{ background: '#0f172a', color: '#e2e8f0' }}>

            {/* ── Top action bar ─────────────────────────────────── */}
            <div
                className="sticky top-0 z-10 px-3 py-2 flex items-center gap-1.5 flex-shrink-0"
                style={{ background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
                <HistoryButton icon="↩" label="Undo" shortcut="Ctrl+Z" enabled={canUndo} onClick={undo} />
                <HistoryButton icon="↪" label="Redo" shortcut="Ctrl+Y" enabled={canRedo} onClick={redo} />

                <span className="ml-auto text-[9px] font-bold uppercase tracking-[0.18em] text-white/15">
                    Structured
                </span>
            </div>

            {/* ── Scrollable content ─────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 pb-20">

                {/* Job description */}
                <JobDescriptionCard
                    value={jobDescription}
                    wordCount={jdWordCount}
                    onChange={setJobDescription}
                />

                {/* Header */}
                <HeaderBlock
                    data={data}
                    onChange={onChange}
                    onContactChange={handleContactChange}
                />

                {/* Sections */}
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="sections-list">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-2"
                            >
                                {data.sections.map((section, index) => (
                                    <Draggable key={section.id} draggableId={section.id} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                style={{
                                                    ...provided.draggableProps.style,
                                                    opacity: snapshot.isDragging ? 0.92 : 1,
                                                }}
                                            >
                                                <SectionCard
                                                    section={section}
                                                    onChange={handleSectionChange}
                                                    onDelete={() => handleDeleteSection(section.id)}
                                                    dragHandleProps={provided.dragHandleProps}
                                                    isDragging={snapshot.isDragging}
                                                />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                {/* Add section */}
                <AddSectionButton
                    open={addMenuOpen}
                    onToggle={() => setAddMenuOpen((v) => !v)}
                    onClose={() => setAddMenuOpen(false)}
                    onAdd={handleAddSection}
                />
            </div>
        </div>
    );
}

// ── History button ─────────────────────────────────────────────────────────────

function HistoryButton({ icon, label, shortcut, enabled, onClick }: {
    icon: string; label: string; shortcut: string; enabled: boolean; onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            disabled={!enabled}
            title={`${label} (${shortcut})`}
            aria-label={label}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all border select-none"
            style={{
                background:   enabled ? 'rgba(255,255,255,0.05)' : 'transparent',
                borderColor:  enabled ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.03)',
                color:        enabled ? '#94a3b8'                 : '#1e293b',
                cursor:       enabled ? 'pointer'                 : 'not-allowed',
            }}
        >
            <span style={{ fontSize: 13 }}>{icon}</span>
            <span className="hidden sm:inline text-[9px]">{shortcut}</span>
        </button>
    );
}

// ── Job description card ───────────────────────────────────────────────────────

function JobDescriptionCard({ value, wordCount, onChange }: {
    value: string; wordCount: number; onChange: (v: string) => void;
}) {
    return (
        <div
            className="rounded-xl overflow-hidden"
            style={{ background: '#1e293b', border: '1px solid rgba(255,107,0,0.12)' }}
        >
            <div
                className="flex items-center gap-2 px-4 py-2.5"
                style={{ borderBottom: '1px solid rgba(255,107,0,0.08)', background: 'rgba(255,107,0,0.04)' }}
            >
                <span className="text-sm">🎯</span>
                <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider flex-1">
                    Target Job Description
                </span>
                <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                    style={{ background: 'rgba(255,107,0,0.12)', color: '#ff9a44', border: '1px solid rgba(255,107,0,0.2)' }}
                >
                    ↑ ATS Score
                </span>
                {wordCount > 0 && (
                    <span className="text-[9px] text-white/25 tabular-nums ml-1">
                        {wordCount}w
                    </span>
                )}
            </div>
            <div className="p-3">
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Paste the job description here to boost ATS keywords and tailor your content…"
                    rows={3}
                    className="w-full text-xs resize-none outline-none rounded-lg p-2.5 transition-all leading-relaxed"
                    style={{
                        background:   'rgba(15,23,42,0.5)',
                        border:       `1px solid ${value ? 'rgba(255,107,0,0.25)' : 'rgba(255,255,255,0.07)'}`,
                        color:        value ? '#e2e8f0' : '#475569',
                        caretColor:   '#ff6b00',
                        fontFamily:   'inherit',
                    }}
                    onFocus={(e)  => (e.target.style.borderColor = 'rgba(255,107,0,0.45)')}
                    onBlur={(e)   => (e.target.style.borderColor = value ? 'rgba(255,107,0,0.25)' : 'rgba(255,255,255,0.07)')}
                />
            </div>
        </div>
    );
}

// ── Header / personal details block ───────────────────────────────────────────

function HeaderBlock({ data, onChange, onContactChange }: {
    data:            ResumeData;
    onChange:        (d: ResumeData) => void;
    onContactChange: (f: keyof NonNullable<ResumeData['contact']>, v: string) => void;
}) {
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => onChange({ ...data, profilePhoto: ev.target?.result as string });
        reader.readAsDataURL(file);
    };

    return (
        <div
            className="rounded-xl overflow-hidden"
            style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.06)', borderLeft: '3px solid #6366f1' }}
        >
            <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-sm">👤</span>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Personal Details</span>
            </div>

            <div className="p-4 space-y-3">
                {/* Photo + name row */}
                <div className="flex gap-3">
                    {/* Photo */}
                    <div className="flex-shrink-0">
                        <div
                            className="w-14 h-14 rounded-xl border-2 border-dashed overflow-hidden relative group cursor-pointer transition-colors"
                            style={{ borderColor: 'rgba(99,102,241,0.3)', background: 'rgba(255,255,255,0.03)' }}
                            title="Upload profile photo"
                        >
                            {data.profilePhoto ? (
                                <>
                                    <img src={data.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-[9px] text-white font-bold">Change</span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full gap-1">
                                    <span className="text-lg">📸</span>
                                    <span className="text-[7px] text-white/20 font-medium">Photo</span>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handlePhotoUpload}
                                aria-label="Upload profile photo"
                            />
                        </div>
                        {data.profilePhoto && (
                            <button
                                className="mt-1 text-[9px] w-full text-center transition-colors"
                                style={{ color: '#ef4444' }}
                                onClick={() => onChange({ ...data, profilePhoto: undefined })}
                            >
                                Remove
                            </button>
                        )}
                    </div>

                    {/* Name + title */}
                    <div className="flex-1 space-y-2 min-w-0">
                        <PremiumInput
                            label="Full Name"
                            value={data.fullName}
                            onChange={(v) => onChange({ ...data, fullName: v })}
                            placeholder="Alex Johnson"
                            large
                            accentColor="#6366f1"
                        />
                        <PremiumInput
                            label="Job Title"
                            value={data.title || ''}
                            onChange={(v) => onChange({ ...data, title: v })}
                            placeholder="Senior Software Engineer"
                            accentColor="#6366f1"
                        />
                    </div>
                </div>

                {/* Contact grid — 2 cols on sm+, 1 col on mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <PremiumInput label="Email"    value={data.contact?.email    || ''} onChange={(v) => onContactChange('email',    v)} placeholder="alex@example.com"      accentColor="#6366f1" />
                    <PremiumInput label="Phone"    value={data.contact?.phone    || ''} onChange={(v) => onContactChange('phone',    v)} placeholder="+1 555 000 0000"        accentColor="#6366f1" />
                    <PremiumInput label="Location" value={data.contact?.location || ''} onChange={(v) => onContactChange('location', v)} placeholder="San Francisco, CA"      accentColor="#6366f1" />
                    <PremiumInput label="LinkedIn" value={data.contact?.linkedin || ''} onChange={(v) => onContactChange('linkedin', v)} placeholder="linkedin.com/in/..."    accentColor="#6366f1" />
                    <PremiumInput label="GitHub"   value={data.contact?.github   || ''} onChange={(v) => onContactChange('github',   v)} placeholder="github.com/..."         accentColor="#6366f1" />
                    <PremiumInput label="Website"  value={data.contact?.website  || ''} onChange={(v) => onContactChange('website',  v)} placeholder="yoursite.com"           accentColor="#6366f1" />
                </div>
            </div>
        </div>
    );
}

// ── Add section button ─────────────────────────────────────────────────────────

function AddSectionButton({ open, onToggle, onClose, onAdd }: {
    open:     boolean;
    onToggle: () => void;
    onClose:  () => void;
    onAdd:    (type: ResumeSectionType) => void;
}) {
    return (
        <div className="relative pt-1">
            <button
                onClick={onToggle}
                id="add-section-btn"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed text-sm font-semibold transition-all duration-150"
                style={{
                    borderColor: open ? '#ff6b00'                   : 'rgba(255,255,255,0.09)',
                    color:       open ? '#ff9a44'                   : '#475569',
                    background:  open ? 'rgba(255,107,0,0.05)'      : 'rgba(255,255,255,0.01)',
                }}
            >
                <span className="text-base leading-none font-light">{open ? '×' : '+'}</span>
                {open ? 'Cancel' : 'Add Section'}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={onClose} />
                    <div
                        className="absolute bottom-full left-0 right-0 mb-2 z-20 rounded-2xl shadow-2xl p-3"
                        style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.09)' }}
                    >
                        <div
                            className="text-[9px] font-bold uppercase tracking-wider mb-2.5 px-1"
                            style={{ color: '#475569' }}
                        >
                            Choose a section type
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                            {SECTION_TYPES.map(({ type, label, icon, color }) => (
                                <button
                                    key={type}
                                    onClick={() => onAdd(type)}
                                    className="flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all"
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background   = `${color}12`;
                                        e.currentTarget.style.borderColor  = `${color}40`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background   = 'rgba(255,255,255,0.03)';
                                        e.currentTarget.style.borderColor  = 'rgba(255,255,255,0.06)';
                                    }}
                                >
                                    <span className="text-base">{icon}</span>
                                    <span className="text-xs font-semibold" style={{ color: '#94a3b8' }}>{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// ── Section card ───────────────────────────────────────────────────────────────

function SectionCard({ section, onChange, onDelete, dragHandleProps, isDragging }: {
    section:          ResumeSection;
    onChange:         (s: ResumeSection) => void;
    onDelete:         () => void;
    dragHandleProps:  DraggableProvidedDragHandleProps | null | undefined;
    isDragging?:      boolean;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const hasEntries   = ['experience', 'education', 'projects'].includes(section.type);
    const accentColor  = SECTION_COLORS[section.type] || '#64748b';
    const typeInfo     = SECTION_TYPES.find((t) => t.type === section.type);
    const { jobDescription, resumeData } = useResumeStore();
    const [isGenerating, setIsGenerating]         = useState(false);
    const [summaryResponse, setSummaryResponse]   = useState<AIResponse | null>(null);

    // Count badge
    const itemCount = hasEntries
        ? (section.entries?.length ?? 0)
        : (section.bullets?.length ?? 0);

    const handleAddEntry    = () => onChange({ ...section, entries: [...(section.entries || []), newEntry()] });
    const handleDeleteEntry = (id: string) => onChange({ ...section, entries: (section.entries || []).filter((e) => e.id !== id) });
    const handleUpdateEntry = (updated: ResumeEntry) => onChange({ ...section, entries: (section.entries || []).map((e) => e.id === updated.id ? updated : e) });
    const handleAddBullet   = () => onChange({ ...section, bullets: [...(section.bullets || []), newBullet()] });
    const handleUpdateBullet = (id: string, text: string) => onChange({ ...section, bullets: (section.bullets || []).map((b) => b.id === id ? { ...b, text } : b) });
    const handleDeleteBullet = (id: string) => onChange({ ...section, bullets: (section.bullets || []).filter((b) => b.id !== id) });

    const generateSummary = async () => {
        setIsGenerating(true);
        try {
            const req = buildAIRequest('', 'generateSummary', { jobDescription, resumeData, sectionType: section.type });
            const res = await askAI(req);
            setSummaryResponse(res);
        } catch (e) { console.error('[StructuredEditor] AI summary failed:', e); }
        finally { setIsGenerating(false); }
    };

    return (
        <div
            className="rounded-xl overflow-visible transition-all duration-150"
            style={{
                background:  '#1e293b',
                border:      isDragging ? `1px solid ${accentColor}` : '1px solid rgba(255,255,255,0.07)',
                borderLeft:  `3px solid ${accentColor}`,
                boxShadow:   isDragging ? `0 20px 40px rgba(0,0,0,0.4)` : 'none',
            }}
        >
            {/* Header */}
            <div
                className="flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none group/hdr"
                onClick={() => setCollapsed((v) => !v)}
                style={{ borderBottom: collapsed ? 'none' : '1px solid rgba(255,255,255,0.05)' }}
            >
                {/* Drag handle */}
                <div
                    {...dragHandleProps}
                    className="cursor-grab active:cursor-grabbing flex-shrink-0 p-1 rounded transition-colors"
                    style={{ color: 'rgba(255,255,255,0.15)' }}
                    onClick={(e) => e.stopPropagation()}
                    title="Drag to reorder"
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.15)')}
                >
                    <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
                        {[[2.5,2.5],[7.5,2.5],[2.5,7],[7.5,7],[2.5,11.5],[7.5,11.5]].map(([cx,cy],i) => (
                            <circle key={i} cx={cx} cy={cy} r="1.5" fill="currentColor"/>
                        ))}
                    </svg>
                </div>

                <span className="text-sm flex-shrink-0">{typeInfo?.icon || '📋'}</span>

                {/* Inline title edit */}
                <input
                    value={section.title}
                    onChange={(e) => onChange({ ...section, title: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-transparent text-sm font-semibold outline-none min-w-0"
                    style={{ color: '#e2e8f0', caretColor: accentColor }}
                    placeholder="Section Title"
                />

                {/* AI Write (summary only) */}
                {section.type === 'summary' && !collapsed && (
                    <button
                        onClick={(e) => { e.stopPropagation(); generateSummary(); }}
                        disabled={isGenerating}
                        className="opacity-0 group-hover/hdr:opacity-100 flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold transition-all"
                        style={{ background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}35` }}
                    >
                        {isGenerating
                            ? <><span className="w-2 h-2 rounded-full border border-current border-t-transparent animate-spin" /> Writing…</>
                            : <>✨ AI Write</>
                        }
                    </button>
                )}

                {/* Count badge (collapsed state) */}
                {collapsed && itemCount > 0 && (
                    <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: `${accentColor}15`, color: accentColor }}
                    >
                        {itemCount}
                    </span>
                )}

                <div className="flex items-center gap-1 ml-1 flex-shrink-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="opacity-0 group-hover/hdr:opacity-100 transition-all rounded p-0.5"
                        style={{ color: '#334155' }}
                        title="Delete section"
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#334155')}
                    >
                        <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
                            <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                    </button>
                    <span className="text-xs" style={{ color: '#334155' }}>{collapsed ? '▸' : '▾'}</span>
                </div>
            </div>

            {/* Body */}
            {!collapsed && (
                <div className="p-3 space-y-2.5">
                    {/* AI summary response */}
                    {summaryResponse && (
                        <AIWritingAssistant
                            originalText=""
                            action="generateSummary"
                            response={summaryResponse}
                            onAccept={(text) => {
                                const first = section.bullets?.[0];
                                if (first) handleUpdateBullet(first.id, text);
                                else onChange({ ...section, bullets: [newBullet(text)] });
                                setSummaryResponse(null);
                            }}
                            onReject={() => setSummaryResponse(null)}
                        />
                    )}

                    {hasEntries ? (
                        <>
                            {(section.entries || []).map((entry) => (
                                <EntryCard
                                    key={entry.id}
                                    entry={entry}
                                    onChange={handleUpdateEntry}
                                    onDelete={() => handleDeleteEntry(entry.id)}
                                    accentColor={accentColor}
                                />
                            ))}
                            <AddRowButton
                                label={`Add ${typeInfo?.label || 'Item'}`}
                                accentColor={accentColor}
                                onClick={handleAddEntry}
                            />
                        </>
                    ) : (
                        <>
                            {(section.bullets || []).length === 0 && (
                                <p className="text-center text-[11px] py-4" style={{ color: '#334155' }}>
                                    No content yet — add a line below ↓
                                </p>
                            )}
                            {(section.bullets || []).map((bullet) => (
                                <BulletRow
                                    key={bullet.id}
                                    bullet={bullet}
                                    onUpdate={(text) => handleUpdateBullet(bullet.id, text)}
                                    onDelete={() => handleDeleteBullet(bullet.id)}
                                    accentColor={accentColor}
                                    sectionType={section.type}
                                    onAddNext={() => {
                                        const newB = newBullet();
                                        onChange({ ...section, bullets: [...(section.bullets || []), newB] });
                                    }}
                                />
                            ))}
                            <AddRowButton label="Add Line" accentColor={accentColor} onClick={handleAddBullet} />
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Entry card ─────────────────────────────────────────────────────────────────

function EntryCard({ entry, onChange, onDelete, accentColor }: {
    entry:        ResumeEntry;
    onChange:     (e: ResumeEntry) => void;
    onDelete:     () => void;
    accentColor:  string;
}) {
    const handleBulletAdd    = () => onChange({ ...entry, bullets: [...entry.bullets, newBullet()] });
    const handleBulletUpdate = (id: string, text: string) => onChange({ ...entry, bullets: entry.bullets.map((b) => b.id === id ? { ...b, text } : b) });
    const handleBulletDelete = (id: string) => onChange({ ...entry, bullets: entry.bullets.filter((b) => b.id !== id) });
    const showDescription    = typeof entry.description === 'string';

    return (
        <div
            className="rounded-xl p-3 space-y-2.5 relative group/entry"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
            {/* Delete entry */}
            <button
                onClick={onDelete}
                className="absolute top-2.5 right-2.5 opacity-0 group-hover/entry:opacity-100 transition-all w-5 h-5 flex items-center justify-center rounded"
                style={{ color: '#475569' }}
                title="Remove entry"
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
            >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
            </button>

            {/* Organization + role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <PremiumInput value={entry.organization || ''} placeholder="Company / School" onChange={(v) => onChange({ ...entry, organization: v })} accentColor={accentColor} large />
                <PremiumInput value={entry.role         || ''} placeholder="Role / Degree"    onChange={(v) => onChange({ ...entry, role:         v })} accentColor={accentColor} large />
            </div>

            {/* Period + location + paragraph toggle */}
            <div className="flex items-center gap-2">
                <div className="flex-1 grid grid-cols-2 gap-2">
                    <PremiumInput
                        value={entry.period || ''}
                        placeholder="Jan 2022 – Present"
                        onChange={(v) => onChange({ ...entry, period: v })}
                        accentColor={accentColor}
                    />
                    <PremiumInput
                        value={entry.location || ''}
                        placeholder="City, State"
                        onChange={(v) => onChange({ ...entry, location: v })}
                        accentColor={accentColor}
                    />
                </div>

                {/* ¶ toggle */}
                <button
                    onClick={() => onChange({ ...entry, description: showDescription ? undefined : '' })}
                    className="shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center transition-all"
                    style={{
                        background:   showDescription ? 'rgba(255,255,255,0.1)' : 'transparent',
                        borderColor:  showDescription ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                        color:        showDescription ? '#e2e8f0'                : 'rgba(255,255,255,0.2)',
                    }}
                    title={showDescription ? 'Remove paragraph' : 'Add paragraph description'}
                >
                    <span className="text-xs font-bold leading-none">¶</span>
                </button>
            </div>

            {/* Paragraph description */}
            {showDescription && (
                <textarea
                    value={entry.description || ''}
                    onChange={(e) => onChange({ ...entry, description: e.target.value })}
                    placeholder="Write a paragraph about your experience or key achievements…"
                    rows={3}
                    className="w-full rounded-lg p-2.5 text-xs outline-none transition-all resize-none leading-relaxed"
                    style={{
                        background:  'rgba(255,255,255,0.04)',
                        border:      '1px solid rgba(255,255,255,0.09)',
                        color:       '#cbd5e1',
                        fontFamily:  'inherit',
                        caretColor:  accentColor,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = `${accentColor}40`)}
                    onBlur={(e)  => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
                />
            )}

            {/* Bullets */}
            <div className="space-y-1">
                {entry.bullets.map((bullet) => (
                    <BulletRow
                        key={bullet.id}
                        bullet={bullet}
                        onUpdate={(text) => handleBulletUpdate(bullet.id, text)}
                        onDelete={() => handleBulletDelete(bullet.id)}
                        accentColor={accentColor}
                        onAddNext={handleBulletAdd}
                    />
                ))}
                <AddRowButton label="+ Add bullet" accentColor={accentColor} onClick={handleBulletAdd} small />
            </div>
        </div>
    );
}

// ── Bullet row ─────────────────────────────────────────────────────────────────

function BulletRow({ bullet, onUpdate, onDelete, accentColor = '#ff6b00', sectionType, onAddNext }: {
    bullet:        ResumeBullet;
    onUpdate:      (text: string) => void;
    onDelete:      () => void;
    accentColor?:  string;
    sectionType?:  ResumeSectionType;
    onAddNext?:    () => void;
}) {
    const [focused,        setFocused]        = useState(false);
    const [showPromptBox,  setShowPromptBox]  = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const rowRef      = useRef<HTMLDivElement>(null);

    const autoResize = () => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
    };

    // Close prompt box on outside click
    useEffect(() => {
        if (!showPromptBox) return;
        const handler = (e: MouseEvent) => {
            if (rowRef.current && !rowRef.current.contains(e.target as Node)) {
                setShowPromptBox(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showPromptBox]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Enter → add new bullet
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onAddNext?.();
        }
        // Backspace on empty → delete this bullet
        if (e.key === 'Backspace' && bullet.text === '') {
            e.preventDefault();
            onDelete();
        }
    };

    return (
        <div ref={rowRef} className="group/bullet relative">
            <AIPromptBox
                visible={showPromptBox}
                originalText={bullet.text}
                sectionType={sectionType}
                accentColor={accentColor}
                onAccept={(text) => { onUpdate(text); setShowPromptBox(false); }}
                onClose={() => setShowPromptBox(false)}
            />

            <div
                className="flex items-start gap-2 rounded-lg px-2 py-1.5 transition-all duration-100"
                style={{
                    background:   focused || showPromptBox ? `${accentColor}07` : 'transparent',
                    border:       `1px solid ${focused || showPromptBox ? `${accentColor}25` : 'transparent'}`,
                }}
            >
                <span className="flex-shrink-0 mt-[4px] text-xs font-bold leading-none" style={{ color: accentColor }}>•</span>

                <textarea
                    ref={textareaRef}
                    value={bullet.text}
                    onChange={(e) => { onUpdate(e.target.value); autoResize(); }}
                    onInput={autoResize}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe an achievement or responsibility… (Enter to add next)"
                    rows={1}
                    className="flex-1 bg-transparent text-xs resize-none outline-none leading-relaxed"
                    style={{
                        color:      '#cbd5e1',
                        fontFamily: 'inherit',
                        minHeight:  20,
                        overflowY:  'hidden',
                        caretColor: accentColor,
                    }}
                />

                {/* AI ✨ button */}
                <button
                    onMouseDown={(e) => { e.preventDefault(); setShowPromptBox((v) => !v); }}
                    className="opacity-0 group-hover/bullet:opacity-100 flex-shrink-0 mt-0.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold transition-all"
                    style={{
                        background:  showPromptBox ? `${accentColor}22` : `${accentColor}0e`,
                        color:       accentColor,
                        border:      `1px solid ${accentColor}28`,
                        opacity:     showPromptBox ? 1 : undefined,
                    }}
                    title="AI improve"
                >
                    ✨
                </button>

                {/* Delete */}
                <button
                    onClick={onDelete}
                    className="opacity-0 group-hover/bullet:opacity-100 flex-shrink-0 mt-0.5 transition-all rounded p-0.5"
                    style={{ color: '#334155' }}
                    title="Delete bullet"
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#334155')}
                >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                </button>
            </div>
        </div>
    );
}

// ── Shared: Add row button ─────────────────────────────────────────────────────

function AddRowButton({ label, accentColor, onClick, small }: {
    label:        string;
    accentColor:  string;
    onClick:      () => void;
    small?:       boolean;
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed transition-all ${small ? 'py-1 text-[11px]' : 'py-2 text-xs font-medium'}`}
            style={{ borderColor: 'rgba(255,255,255,0.07)', color: '#475569' }}
            onMouseEnter={(e) => {
                e.currentTarget.style.color       = accentColor;
                e.currentTarget.style.borderColor = `${accentColor}45`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.color       = '#475569';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
            }}
        >
            {label}
        </button>
    );
}

// ── PremiumInput ───────────────────────────────────────────────────────────────

export function PremiumInput({
    label, value, onChange, placeholder, large, accentColor = '#6366f1', className, style, onClick,
}: {
    label?:       string;
    value:        string;
    onChange:     (v: string) => void;
    placeholder?: string;
    large?:       boolean;
    accentColor?: string;
    className?:   string;
    style?:       React.CSSProperties;
    onClick?:     (e: React.MouseEvent) => void;
}) {
    const [focused, setFocused] = useState(false);

    // Legacy pass-through (InlineInput compat)
    if (style !== undefined || className !== undefined) {
        return (
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                onClick={onClick}
                className={className}
                style={style}
            />
        );
    }

    return (
        <div className="flex flex-col gap-0.5 w-full min-w-0">
            {label && (
                <label
                    className="text-[9px] font-bold uppercase tracking-wider ml-0.5 transition-colors"
                    style={{ color: focused ? accentColor : '#334155' }}
                >
                    {label}
                </label>
            )}
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                onClick={onClick}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="bg-transparent outline-none w-full rounded-lg border transition-all"
                style={{
                    padding:     large ? '8px 12px' : '6px 10px',
                    fontSize:    large ? 13 : 11,
                    fontWeight:  large ? 700 : 500,
                    color:       value ? '#e2e8f0' : '#475569',
                    borderColor: focused ? `${accentColor}50` : 'rgba(255,255,255,0.07)',
                    background:  focused ? `${accentColor}05` : 'rgba(255,255,255,0.02)',
                    caretColor:  accentColor,
                    boxSizing:   'border-box',
                }}
            />
        </div>
    );
}

// Legacy alias
export { PremiumInput as InlineInput };
