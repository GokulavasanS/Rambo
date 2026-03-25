// ============================================================
// components/editor/StructuredEditor.tsx — Premium UX Overhaul
// Intuitive · Visual · Interactive · AI-powered bullet editing
// ============================================================

'use client';

import React, { useState, useEffect, useRef } from 'react';
import type {
    ResumeData, ResumeSection, ResumeEntry, ResumeBullet,
    ResumeSectionType, AIActionType, AIResponse,
} from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { useResumeStore } from '@/store/resumeStore';
import { AIWritingAssistant } from './AIWritingAssistant';
import { askAI, buildAIRequest } from '@/lib/ai';

interface StructuredEditorProps {
    data: ResumeData;
    onChange: (data: ResumeData) => void;
}

function updateSection(data: ResumeData, sectionId: string, updater: (s: ResumeSection) => ResumeSection): ResumeData {
    return { ...data, sections: data.sections.map((s) => s.id === sectionId ? updater(s) : s) };
}

function newBullet(text = ''): ResumeBullet { return { id: uuidv4(), text }; }

function newEntry(): ResumeEntry {
    return { id: uuidv4(), organization: '', role: '', period: '', location: '', bullets: [newBullet()] };
}

function newSection(type: ResumeSectionType): ResumeSection {
    const hasEntries = ['experience', 'education', 'projects'].includes(type);
    return {
        id: uuidv4(),
        type,
        title: type.charAt(0).toUpperCase() + type.slice(1),
        entries: hasEntries ? [newEntry()] : undefined,
        bullets: hasEntries ? undefined : [newBullet()],
    };
}

const SECTION_TYPES: { type: ResumeSectionType; label: string; icon: string; color: string }[] = [
    { type: 'summary', label: 'Summary', icon: '📝', color: '#6366f1' },
    { type: 'experience', label: 'Experience', icon: '💼', color: '#ff6b00' },
    { type: 'education', label: 'Education', icon: '🎓', color: '#0ea5e9' },
    { type: 'projects', label: 'Projects', icon: '🚀', color: '#8b5cf6' },
    { type: 'skills', label: 'Skills', icon: '⚡', color: '#10b981' },
    { type: 'certifications', label: 'Certifications', icon: '🏆', color: '#f59e0b' },
    { type: 'other', label: 'Other', icon: '➕', color: '#64748b' },
];

const SECTION_COLORS: Record<ResumeSectionType, string> = {
    summary: '#6366f1',
    experience: '#ff6b00',
    education: '#0ea5e9',
    projects: '#8b5cf6',
    skills: '#10b981',
    certifications: '#f59e0b',
    other: '#64748b',
};

// ============================================================
// Main Component
// ============================================================

export function StructuredEditor({ data, onChange }: StructuredEditorProps) {
    const [addMenuOpen, setAddMenuOpen] = useState(false);
    const { jobDescription, setJobDescription, undo, redo, historyIndex, history, reorderSections } = useResumeStore();

    const handleContactChange = (field: keyof NonNullable<ResumeData['contact']>, value: string) => {
        onChange({ ...data, contact: { ...data.contact, [field]: value } });
    };

    const handleAddSection = (type: ResumeSectionType) => {
        onChange({ ...data, sections: [...data.sections, newSection(type)] });
        setAddMenuOpen(false);
    };

    const handleDeleteSection = (id: string) => {
        onChange({ ...data, sections: data.sections.filter((s) => s.id !== id) });
    };

    const handleSectionChange = (updated: ResumeSection) => {
        onChange(updateSection(data, updated.id, () => updated));
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        if (result.destination.index === result.source.index) return;
        reorderSections(result.source.index, result.destination.index);
    };

    // Keyboard shortcuts for undo/redo
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                if (e.shiftKey) { e.preventDefault(); redo(); }
                else { e.preventDefault(); undo(); }
            } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
                e.preventDefault(); redo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    return (
        <div className="flex flex-col h-full" style={{ background: '#0f172a', color: '#e2e8f0' }}>

            {/* ── Top Action Bar ────────────────────────────── */}
            <div
                className="sticky top-0 z-10 px-4 py-2.5 flex items-center justify-between flex-shrink-0"
                style={{ background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
                <div className="flex items-center gap-1.5">
                    {/* Undo */}
                    <button
                        onClick={undo}
                        disabled={!canUndo}
                        title="Undo (Ctrl+Z)"
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all border"
                        style={{
                            background: canUndo ? 'rgba(255,255,255,0.05)' : 'transparent',
                            borderColor: canUndo ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                            color: canUndo ? '#94a3b8' : '#334155',
                            cursor: canUndo ? 'pointer' : 'not-allowed',
                        }}
                    >
                        <span style={{ fontSize: 13 }}>↩</span>
                        <span className="hidden sm:inline text-[10px]">Ctrl+Z</span>
                    </button>
                    {/* Redo */}
                    <button
                        onClick={redo}
                        disabled={!canRedo}
                        title="Redo (Ctrl+Y)"
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all border"
                        style={{
                            background: canRedo ? 'rgba(255,255,255,0.05)' : 'transparent',
                            borderColor: canRedo ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                            color: canRedo ? '#94a3b8' : '#334155',
                            cursor: canRedo ? 'pointer' : 'not-allowed',
                        }}
                    >
                        <span style={{ fontSize: 13 }}>↪</span>
                        <span className="hidden sm:inline text-[10px]">Ctrl+Y</span>
                    </button>
                </div>
                <span className="text-[10px] text-[#334155] font-medium tracking-wide uppercase">Editor</span>
            </div>

            {/* ── Scrollable Content ────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 pb-10">

                {/* ── Job Description Card ─────────────────── */}
                <div
                    className="rounded-xl p-3.5 relative overflow-hidden"
                    style={{ background: '#1e293b', border: '1px solid rgba(255,107,0,0.15)' }}
                >
                    <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 70%)' }} />
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">🎯</span>
                        <span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">Target Job</span>
                        <span className="ml-auto text-[9px] font-bold text-[#ff6b00] border border-[#ff6b00]/30 bg-[#ff6b00]/08 px-2 py-0.5 rounded-full whitespace-nowrap">
                            Boosts ATS Score
                        </span>
                    </div>
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the job description here to boost ATS keywords and tailor your content…"
                        className="w-full text-xs text-[#94a3b8] p-2.5 rounded-lg border outline-none resize-none min-h-[60px] transition-all placeholder-[#475569]"
                        style={{
                            background: 'rgba(15,23,42,0.5)',
                            borderColor: jobDescription ? 'rgba(255,107,0,0.3)' : 'rgba(255,255,255,0.08)',
                            color: jobDescription ? '#e2e8f0' : '#94a3b8',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = 'rgba(255,107,0,0.5)')}
                        onBlur={(e) => (e.target.style.borderColor = jobDescription ? 'rgba(255,107,0,0.3)' : 'rgba(255,255,255,0.08)')}
                    />
                </div>

                {/* ── Header Block ─────────────────────────── */}
                <HeaderBlock data={data} onChange={onChange} onContactChange={handleContactChange} />

                {/* ── Draggable Sections ───────────────────── */}
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="sections-list">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2.5">
                                {data.sections.map((section, index) => (
                                    <Draggable key={section.id} draggableId={section.id} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                style={{ ...provided.draggableProps.style, opacity: snapshot.isDragging ? 0.9 : 1 }}
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

                {/* ── Add Section ──────────────────────────── */}
                <div className="relative pt-1">
                    <button
                        onClick={() => setAddMenuOpen((v) => !v)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed text-sm font-medium transition-all"
                        style={{
                            borderColor: addMenuOpen ? '#ff6b00' : 'rgba(255,255,255,0.10)',
                            color: addMenuOpen ? '#ff9a44' : '#475569',
                            background: addMenuOpen ? 'rgba(255,107,0,0.05)' : 'rgba(255,255,255,0.01)',
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget).style.borderColor = '#ff6b00';
                            (e.currentTarget).style.color = '#ff9a44';
                            (e.currentTarget).style.background = 'rgba(255,107,0,0.04)';
                        }}
                        onMouseLeave={(e) => {
                            if (!addMenuOpen) {
                                (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.10)';
                                (e.currentTarget).style.color = '#475569';
                                (e.currentTarget).style.background = 'rgba(255,255,255,0.01)';
                            }
                        }}
                        id="add-section-btn"
                    >
                        <span className="text-lg leading-none">{addMenuOpen ? '✕' : '+'}</span>
                        {addMenuOpen ? 'Cancel' : 'Add Section'}
                    </button>

                    {addMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setAddMenuOpen(false)} />
                            <div
                                className="absolute bottom-full left-0 mb-2 z-20 rounded-2xl shadow-2xl p-3 w-full"
                                style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)' }}
                            >
                                <div className="text-[10px] font-bold uppercase tracking-wider text-[#475569] mb-2 px-1">Add a section</div>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {SECTION_TYPES.map(({ type, label, icon, color }) => (
                                        <button
                                            key={type}
                                            onClick={() => handleAddSection(type)}
                                            className="flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all hover:scale-[1.02]"
                                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                                            onMouseEnter={(e) => {
                                                (e.currentTarget).style.background = `${color}15`;
                                                (e.currentTarget).style.borderColor = `${color}40`;
                                            }}
                                            onMouseLeave={(e) => {
                                                (e.currentTarget).style.background = 'rgba(255,255,255,0.03)';
                                                (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.06)';
                                            }}
                                        >
                                            <span className="text-base">{icon}</span>
                                            <span className="text-xs font-semibold text-[#94a3b8]">{label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ============================================================
// Header Block — Personal Details
// ============================================================

function HeaderBlock({ data, onChange, onContactChange }: {
    data: ResumeData;
    onChange: (d: ResumeData) => void;
    onContactChange: (field: keyof NonNullable<ResumeData['contact']>, v: string) => void;
}) {
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            onChange({ ...data, profilePhoto: dataUrl });
        };
        reader.readAsDataURL(file);
    };

    return (
        <div
            className="rounded-xl overflow-hidden"
            style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.06)' }}
        >
            {/* Section header */}
            <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', borderLeft: '3px solid #6366f1' }}>
                <span className="text-sm">👤</span>
                <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">Personal Details</span>
            </div>

            <div className="p-4 space-y-3">
                <div className="flex gap-4">
                    {/* Photo uploader */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
                        <div
                            className="w-14 h-14 rounded-xl border-2 border-dashed border-white/15 bg-white/04 flex items-center justify-center overflow-hidden relative group cursor-pointer hover:border-[#6366f1]/50 transition-colors"
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
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-lg">📸</span>
                                    <span className="text-[8px] text-white/25 font-medium text-center leading-tight">Photo</span>
                                </div>
                            )}
                            <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handlePhotoUpload} />
                        </div>
                        {data.profilePhoto && (
                            <button className="text-[9px] text-red-400 hover:text-red-300 transition-colors" onClick={() => onChange({ ...data, profilePhoto: undefined })}>
                                Remove
                            </button>
                        )}
                    </div>

                    <div className="flex-1 space-y-2">
                        <PremiumInput
                            label="Full Name"
                            value={data.fullName}
                            onChange={(v) => onChange({ ...data, fullName: v })}
                            placeholder="Alex Johnson"
                            large
                        />
                        <PremiumInput
                            label="Job Title"
                            value={data.title || ''}
                            onChange={(v) => onChange({ ...data, title: v })}
                            placeholder="Senior Software Engineer"
                        />
                    </div>
                </div>

                {/* Contact fields — 2 column grid */}
                <div className="grid grid-cols-2 gap-2">
                    <PremiumInput label="Email" value={data.contact?.email || ''} onChange={(v) => onContactChange('email', v)} placeholder="alex@example.com" />
                    <PremiumInput label="Phone" value={data.contact?.phone || ''} onChange={(v) => onContactChange('phone', v)} placeholder="+1 555 000 0000" />
                    <PremiumInput label="Location" value={data.contact?.location || ''} onChange={(v) => onContactChange('location', v)} placeholder="San Francisco, CA" />
                    <PremiumInput label="LinkedIn" value={data.contact?.linkedin || ''} onChange={(v) => onContactChange('linkedin', v)} placeholder="linkedin.com/in/..." />
                    <PremiumInput label="GitHub" value={data.contact?.github || ''} onChange={(v) => onContactChange('github', v)} placeholder="github.com/..." />
                    <PremiumInput label="Website" value={data.contact?.website || ''} onChange={(v) => onContactChange('website', v)} placeholder="yoursite.com" />
                </div>
            </div>
        </div>
    );
}

// ============================================================
// Section Card
// ============================================================

function SectionCard({ section, onChange, onDelete, dragHandleProps, isDragging }: {
    section: ResumeSection;
    onChange: (s: ResumeSection) => void;
    onDelete: () => void;
    dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
    isDragging?: boolean;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const hasEntries = ['experience', 'education', 'projects'].includes(section.type);
    const accentColor = SECTION_COLORS[section.type] || '#64748b';

    const { jobDescription, resumeData } = useResumeStore();
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [summaryAIResponse, setSummaryAIResponse] = useState<AIResponse | null>(null);

    const handleAddEntry = () => onChange({ ...section, entries: [...(section.entries || []), newEntry()] });
    const handleDeleteEntry = (id: string) => onChange({ ...section, entries: (section.entries || []).filter((e) => e.id !== id) });
    const handleUpdateEntry = (updated: ResumeEntry) => onChange({ ...section, entries: (section.entries || []).map((e) => e.id === updated.id ? updated : e) });
    const handleAddBullet = () => onChange({ ...section, bullets: [...(section.bullets || []), newBullet()] });
    const handleUpdateBullet = (id: string, text: string) => onChange({ ...section, bullets: (section.bullets || []).map((b) => b.id === id ? { ...b, text } : b) });
    const handleDeleteBullet = (id: string) => onChange({ ...section, bullets: (section.bullets || []).filter((b) => b.id !== id) });

    const typeInfo = SECTION_TYPES.find((t) => t.type === section.type);

    const generateAISummary = async () => {
        setIsGeneratingSummary(true);
        try {
            const req = buildAIRequest('', 'generateSummary', { jobDescription, resumeData, sectionType: section.type });
            const res = await askAI(req);
            setSummaryAIResponse(res);
        } catch (e) { console.error('AI summary failed', e); }
        finally { setIsGeneratingSummary(false); }
    };

    return (
        <div
            className={`rounded-xl overflow-hidden transition-all duration-200 ${isDragging ? 'shadow-2xl' : ''}`}
            style={{
                background: '#1e293b',
                border: isDragging ? `1px solid ${accentColor}` : '1px solid rgba(255,255,255,0.07)',
                borderLeft: `3px solid ${accentColor}`,
            }}
        >
            {/* Section header */}
            <div
                className="flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none group/header"
                onClick={() => setCollapsed((v) => !v)}
                style={{ borderBottom: collapsed ? 'none' : '1px solid rgba(255,255,255,0.05)' }}
            >
                {/* Drag handle */}
                <div
                    {...dragHandleProps}
                    className="cursor-grab active:cursor-grabbing text-white/20 hover:text-white/50 transition-colors flex-shrink-0 p-1"
                    onClick={(e) => e.stopPropagation()}
                    title="Drag to reorder"
                >
                    <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
                        <circle cx="2.5" cy="2.5" r="1.5" fill="currentColor" />
                        <circle cx="7.5" cy="2.5" r="1.5" fill="currentColor" />
                        <circle cx="2.5" cy="7" r="1.5" fill="currentColor" />
                        <circle cx="7.5" cy="7" r="1.5" fill="currentColor" />
                        <circle cx="2.5" cy="11.5" r="1.5" fill="currentColor" />
                        <circle cx="7.5" cy="11.5" r="1.5" fill="currentColor" />
                    </svg>
                </div>

                <span className="text-sm flex-shrink-0">{typeInfo?.icon || '📋'}</span>

                {/* Section title inline edit */}
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
                        onClick={(e) => { e.stopPropagation(); generateAISummary(); }}
                        disabled={isGeneratingSummary}
                        className="opacity-0 group-hover/header:opacity-100 flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-md transition-all disabled:opacity-50"
                        style={{ background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}40` }}
                    >
                        {isGeneratingSummary
                            ? <><span className="w-2 h-2 rounded-full border border-current border-t-transparent animate-spin" /> Writing…</>
                            : <>✨ AI Write</>
                        }
                    </button>
                )}

                <div className="ml-auto flex items-center gap-1 flex-shrink-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="opacity-0 group-hover/header:opacity-100 text-[#334155] hover:text-red-400 transition-all px-1"
                        title="Delete section"
                    >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                    <span className="text-[#334155] text-xs">{collapsed ? '▸' : '▾'}</span>
                </div>
            </div>

            {/* Section body */}
            {!collapsed && (
                <div className="p-3.5 space-y-3">
                    {/* AI Summary response */}
                    {summaryAIResponse && (
                        <AIWritingAssistant
                            originalText=""
                            action="generateSummary"
                            response={summaryAIResponse}
                            onAccept={(text) => {
                                const targetBullet = section.bullets?.[0];
                                if (targetBullet) handleUpdateBullet(targetBullet.id, text);
                                else onChange({ ...section, bullets: [newBullet(text)] });
                                setSummaryAIResponse(null);
                            }}
                            onReject={() => setSummaryAIResponse(null)}
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
                            <button
                                onClick={handleAddEntry}
                                className="w-full py-2 text-xs font-medium rounded-lg border border-dashed transition-all flex items-center justify-center gap-1.5"
                                style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#475569' }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget).style.color = accentColor;
                                    (e.currentTarget).style.borderColor = `${accentColor}50`;
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget).style.color = '#475569';
                                    (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.08)';
                                }}
                            >
                                <span>+</span> Add {typeInfo?.label || 'Item'}
                            </button>
                        </>
                    ) : (
                        <>
                            {(section.bullets || []).length === 0 && (
                                <div className="text-center py-4 text-[11px] text-[#334155]">
                                    No content yet. Add a line below ↓
                                </div>
                            )}
                            {(section.bullets || []).map((bullet) => (
                                <BulletRow
                                    key={bullet.id}
                                    bullet={bullet}
                                    onUpdate={(text) => handleUpdateBullet(bullet.id, text)}
                                    onDelete={() => handleDeleteBullet(bullet.id)}
                                    accentColor={accentColor}
                                    ai={false}
                                />
                            ))}
                            <button
                                onClick={handleAddBullet}
                                className="w-full py-2 text-xs font-medium rounded-lg border border-dashed transition-all flex items-center justify-center gap-1.5"
                                style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#475569' }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget).style.color = accentColor;
                                    (e.currentTarget).style.borderColor = `${accentColor}50`;
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget).style.color = '#475569';
                                    (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.08)';
                                }}
                            >
                                <span>+</span> Add Line
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

// ============================================================
// Entry Card (experience / education / project)
// ============================================================

function EntryCard({ entry, onChange, onDelete, accentColor }: {
    entry: ResumeEntry;
    onChange: (e: ResumeEntry) => void;
    onDelete: () => void;
    accentColor: string;
}) {
    const handleBulletAdd = () => onChange({ ...entry, bullets: [...entry.bullets, newBullet()] });
    const handleBulletUpdate = (id: string, text: string) => onChange({ ...entry, bullets: entry.bullets.map((b) => b.id === id ? { ...b, text } : b) });
    const handleBulletDelete = (id: string) => onChange({ ...entry, bullets: entry.bullets.filter((b) => b.id !== id) });

    const showDescription = typeof entry.description === 'string';

    return (
        <div
            className="rounded-xl p-3 space-y-2.5 relative group/entry"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
            {/* Delete entry button */}
            <button
                onClick={onDelete}
                className="absolute top-2 right-2 opacity-0 group-hover/entry:opacity-100 text-[#334155] hover:text-red-400 transition-all w-5 h-5 flex items-center justify-center rounded"
                title="Remove entry"
            >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </button>

            {/* Header row: Organization & Role */}
            <div className="grid grid-cols-2 gap-2">
                <PremiumInput
                    value={entry.organization || ''}
                    placeholder="Company / School"
                    onChange={(v) => onChange({ ...entry, organization: v })}
                    accentColor={accentColor}
                    large
                />
                <PremiumInput
                    value={entry.role || ''}
                    placeholder="Role / Degree"
                    onChange={(v) => onChange({ ...entry, role: v })}
                    accentColor={accentColor}
                    large
                />
            </div>

            {/* Sub-header row: Period & Location & Toggle Paragraph */}
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

                {/* Paragraph toggle */}
                <button
                    onClick={() => onChange({ ...entry, description: showDescription ? undefined : '' })}
                    className={`shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${showDescription ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-white/20 hover:text-white/60'}`}
                    title={showDescription ? "Remove paragraph" : "Add paragraph description"}
                >
                    <span className="text-xs font-bold leading-none">¶</span>
                </button>
            </div>

            {/* Paragraph Description */}
            {showDescription && (
                <div className="pt-1">
                    <textarea
                        value={entry.description || ''}
                        onChange={(e) => onChange({ ...entry, description: e.target.value })}
                        placeholder="Write a paragraph about your experience or key achievements..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-[11px] text-white/80 outline-none focus:border-white/20 transition-all min-h-[80px] resize-none leading-relaxed"
                    />
                </div>
            )}

            {/* Bullets List */}
            <div className="space-y-1">
                {entry.bullets.map((bullet) => (
                    <BulletRow
                        key={bullet.id}
                        bullet={bullet}
                        onUpdate={(text) => handleBulletUpdate(bullet.id, text)}
                        onDelete={() => handleBulletDelete(bullet.id)}
                        accentColor={accentColor}
                    />
                ))}
                <button
                    onClick={handleBulletAdd}
                    className="w-full py-1.5 text-[11px] rounded-lg transition-all border border-dashed flex items-center justify-center gap-1"
                    style={{ color: '#334155', borderColor: 'rgba(255,255,255,0.06)' }}
                    onMouseEnter={(e) => {
                        (e.currentTarget).style.color = accentColor;
                        (e.currentTarget).style.borderColor = `${accentColor}40`;
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget).style.color = '#334155';
                        (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.06)';
                    }}
                >
                    + Add bullet
                </button>
            </div>
        </div>
    );
}

// ============================================================
// Bullet Row — with floating AI toolbar above
// ============================================================

const AI_ACTIONS: Array<{ key: Extract<AIActionType, 'strengthen' | 'shorten' | 'quantify' | 'formalize' | 'tailorToJob'>; label: string }> = [
    { key: 'strengthen', label: '💪 Strengthen' },
    { key: 'shorten', label: '✂️ Shorten' },
    { key: 'quantify', label: '📊 Quantify' },
    { key: 'formalize', label: '🎩 Formalize' },
    { key: 'tailorToJob', label: '🎯 Tailor to JD' },
];

function BulletRow({ bullet, onUpdate, onDelete, accentColor = '#ff6b00', ai = false }: {
    bullet: ResumeBullet;
    onUpdate: (text: string) => void;
    onDelete: () => void;
    accentColor?: string;
    ai?: boolean;
}) {
    const [focused, setFocused] = useState(false);
    const [showAI, setShowAI] = useState(false);
    const { jobDescription } = useResumeStore();
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    const autoResize = () => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
    };

    const handleAIAction = async (actionKey: string) => {
        if (!bullet.text.trim()) return;
        setIsGenerating(true);
        setShowAI(false);
        try {
            const req = buildAIRequest(bullet.text, actionKey as AIActionType, { jobDescription });
            const res = await askAI(req);
            setAiResponse(res);
        } catch (error) {
            console.error('AI Action failed', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="group/bullet relative">
            {/* Floating AI toolbar — appears ABOVE the bullet when focused */}
            {ai && showAI && !isGenerating && !aiResponse && bullet.text.trim().length > 0 && (
                <div
                    className="absolute bottom-full left-4 mb-1.5 z-30 flex items-center gap-1 px-2 py-1.5 rounded-xl shadow-2xl"
                    style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                    onMouseDown={(e) => e.preventDefault()} // prevent blur
                >
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/25 mr-1">AI</span>
                    {AI_ACTIONS.map(({ key, label }) => (
                        <button
                            key={key}
                            onMouseDown={(e) => { e.preventDefault(); handleAIAction(key); }}
                            className="flex items-center gap-1 px-2 py-1 text-[9px] font-semibold rounded-lg transition-all hover:scale-105"
                            style={{ background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}30` }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}

            {/* Bullet row */}
            <div
                className="flex items-start gap-2 rounded-lg px-2 py-1.5 transition-all"
                style={{
                    background: focused ? `${accentColor}08` : 'transparent',
                    border: `1px solid ${focused ? `${accentColor}30` : 'transparent'}`,
                }}
            >
                <span className="flex-shrink-0 mt-[3px] text-xs font-bold" style={{ color: accentColor }}>•</span>
                <textarea
                    ref={textareaRef}
                    value={bullet.text}
                    onChange={(e) => { onUpdate(e.target.value); autoResize(); }}
                    onFocus={() => { setFocused(true); if (ai) setShowAI(true); }}
                    onBlur={() => { setFocused(false); setTimeout(() => setShowAI(false), 150); }}
                    placeholder="Describe your achievement or responsibility…"
                    rows={1}
                    className="flex-1 bg-transparent text-xs resize-none outline-none leading-relaxed"
                    style={{
                        color: '#cbd5e1',
                        fontFamily: 'inherit',
                        minHeight: 20,
                        overflowY: 'hidden',
                        caretColor: accentColor,
                    }}
                    onInput={autoResize}
                />
                {/* Delete */}
                <button
                    onClick={onDelete}
                    className="opacity-0 group-hover/bullet:opacity-100 text-[#334155] hover:text-red-400 transition-all flex-shrink-0 mt-0.5"
                >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>
            </div>

            {/* AI response */}
            {aiResponse && (
                <div className="ml-4 mt-1.5">
                    <AIWritingAssistant
                        originalText={bullet.text}
                        action={aiResponse.actionType}
                        response={aiResponse}
                        onAccept={(text) => { onUpdate(text); setAiResponse(null); }}
                        onReject={() => setAiResponse(null)}
                    />
                </div>
            )}

            {/* Generating indicator */}
            {isGenerating && (
                <div className="ml-6 mt-1 flex items-center gap-1.5 text-[10px] font-medium animate-pulse" style={{ color: accentColor }}>
                    <span className="w-2.5 h-2.5 rounded-full border border-current border-t-transparent animate-spin" />
                    AI thinking…
                </div>
            )}
        </div>
    );
}

// ============================================================
// PremiumInput — polished, auto-sizing input for editor
// ============================================================

function PremiumInput({ label, value, onChange, placeholder, large, accentColor = '#6366f1', className, style, onClick }: {
    label?: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    large?: boolean;
    accentColor?: string;
    className?: string;
    style?: React.CSSProperties;
    onClick?: (e: React.MouseEvent) => void;
}) {
    const [focused, setFocused] = useState(false);

    if (style !== undefined || className !== undefined) {
        // Legacy mode (InlineInput compatibility)
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
        <div className="flex flex-col gap-0.5">
            {label && (
                <label className="text-[9px] font-bold uppercase tracking-wider transition-colors" style={{ color: focused ? accentColor : '#334155' }}>
                    {label}
                </label>
            )}
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="bg-transparent outline-none w-full transition-all rounded-lg px-2 py-1.5 border"
                style={{
                    fontSize: large ? 14 : 11.5,
                    fontWeight: large ? 700 : 500,
                    color: value ? '#e2e8f0' : '#475569',
                    borderColor: focused ? `${accentColor}50` : 'rgba(255,255,255,0.07)',
                    background: focused ? `${accentColor}06` : 'rgba(255,255,255,0.02)',
                    caretColor: accentColor,
                }}
            />
        </div>
    );
}

// Legacy alias for backward compat
export { PremiumInput as InlineInput };
