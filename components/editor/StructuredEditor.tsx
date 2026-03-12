// ============================================================
// components/editor/StructuredEditor.tsx
// Section-by-section resume editor with cards, add/edit/delete.
// ============================================================

'use client';

import React, { useState, useCallback } from 'react';
import type {
    ResumeData, ResumeSection, ResumeEntry, ResumeBullet,
    ResumeSectionType,
} from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/Button';
import { AIToolbar } from './AIToolbar';

interface StructuredEditorProps {
    data: ResumeData;
    onChange: (data: ResumeData) => void;
}

// ---- Helper updaters ----

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

const SECTION_TYPES: { type: ResumeSectionType; label: string; icon: string }[] = [
    { type: 'summary', label: 'Summary', icon: '📝' },
    { type: 'experience', label: 'Experience', icon: '💼' },
    { type: 'education', label: 'Education', icon: '🎓' },
    { type: 'projects', label: 'Projects', icon: '🚀' },
    { type: 'skills', label: 'Skills', icon: '⚡' },
    { type: 'certifications', label: 'Certifications', icon: '🏆' },
    { type: 'other', label: 'Other', icon: '➕' },
];

// ============================================================
// Main Component
// ============================================================

export function StructuredEditor({ data, onChange }: StructuredEditorProps) {
    const [addMenuOpen, setAddMenuOpen] = useState(false);

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

    return (
        <div className="flex flex-col h-full overflow-y-auto" style={{ background: '#0f172a', color: '#e2e8f0' }}>
            {/* Scrollable content */}
            <div className="flex-1 px-4 py-4 space-y-4 pb-8">

                {/* ---- Header Block ---- */}
                <HeaderBlock data={data} onChange={onChange} onContactChange={handleContactChange} />

                {/* ---- Sections ---- */}
                {data.sections.map((section) => (
                    <SectionCard
                        key={section.id}
                        section={section}
                        onChange={handleSectionChange}
                        onDelete={() => handleDeleteSection(section.id)}
                    />
                ))}

                {/* ---- Add Section ---- */}
                <div className="relative">
                    <button
                        onClick={() => setAddMenuOpen((v) => !v)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed transition-all text-sm font-medium"
                        style={{
                            borderColor: 'rgba(255,255,255,0.12)',
                            color: '#64748b',
                            background: 'transparent',
                        }}
                        onMouseEnter={(e) => {
                            (e.target as HTMLButtonElement).style.borderColor = '#ff6b00';
                            (e.target as HTMLButtonElement).style.color = '#ff6b00';
                        }}
                        onMouseLeave={(e) => {
                            (e.target as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)';
                            (e.target as HTMLButtonElement).style.color = '#64748b';
                        }}
                        id="add-section-btn"
                    >
                        + Add Section
                    </button>

                    {addMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setAddMenuOpen(false)} />
                            <div
                                className="absolute bottom-full left-0 mb-2 z-20 rounded-2xl shadow-2xl border p-2 w-full animate-scale-in"
                                style={{ background: '#1e293b', borderColor: 'rgba(255,255,255,0.1)' }}
                            >
                                <div className="grid grid-cols-2 gap-1">
                                    {SECTION_TYPES.map(({ type, label, icon }) => (
                                        <button
                                            key={type}
                                            onClick={() => handleAddSection(type)}
                                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-left text-sm transition-all"
                                            style={{ color: '#94a3b8' }}
                                            onMouseEnter={(e) => {
                                                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,107,0,0.1)';
                                                (e.currentTarget as HTMLButtonElement).style.color = '#ff9a44';
                                            }}
                                            onMouseLeave={(e) => {
                                                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                                                (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8';
                                            }}
                                        >
                                            <span>{icon}</span><span>{label}</span>
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
// Header Block
// ============================================================

function HeaderBlock({
    data,
    onChange,
    onContactChange,
}: {
    data: ResumeData;
    onChange: (d: ResumeData) => void;
    onContactChange: (field: keyof NonNullable<ResumeData['contact']>, v: string) => void;
}) {
    return (
        <div
            className="rounded-2xl p-4 space-y-3"
            style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)' }}
        >
            <div className="flex items-center gap-2 mb-1">
                <span className="text-[#ff6b00] text-sm">👤</span>
                <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Personal Details</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
                <InlineInput
                    label="Full Name"
                    value={data.fullName}
                    onChange={(v) => onChange({ ...data, fullName: v })}
                    placeholder="Alex Johnson"
                    large
                />
                <InlineInput
                    label="Job Title"
                    value={data.title || ''}
                    onChange={(v) => onChange({ ...data, title: v })}
                    placeholder="Senior Software Engineer"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <InlineInput label="Email" value={data.contact?.email || ''} onChange={(v) => onContactChange('email', v)} placeholder="alex@example.com" />
                <InlineInput label="Phone" value={data.contact?.phone || ''} onChange={(v) => onContactChange('phone', v)} placeholder="+1 555 000 0000" />
                <InlineInput label="Location" value={data.contact?.location || ''} onChange={(v) => onContactChange('location', v)} placeholder="San Francisco, CA" />
                <InlineInput label="LinkedIn" value={data.contact?.linkedin || ''} onChange={(v) => onContactChange('linkedin', v)} placeholder="linkedin.com/in/..." />
                <InlineInput label="GitHub" value={data.contact?.github || ''} onChange={(v) => onContactChange('github', v)} placeholder="github.com/..." />
                <InlineInput label="Website" value={data.contact?.website || ''} onChange={(v) => onContactChange('website', v)} placeholder="yoursite.com" />
            </div>
        </div>
    );
}

// ============================================================
// Section Card
// ============================================================

function SectionCard({
    section,
    onChange,
    onDelete,
}: {
    section: ResumeSection;
    onChange: (s: ResumeSection) => void;
    onDelete: () => void;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const hasEntries = ['experience', 'education', 'projects'].includes(section.type);

    const handleAddEntry = () => {
        onChange({ ...section, entries: [...(section.entries || []), newEntry()] });
    };

    const handleDeleteEntry = (id: string) => {
        onChange({ ...section, entries: (section.entries || []).filter((e) => e.id !== id) });
    };

    const handleUpdateEntry = (updated: ResumeEntry) => {
        onChange({ ...section, entries: (section.entries || []).map((e) => e.id === updated.id ? updated : e) });
    };

    const handleAddBullet = () => {
        onChange({ ...section, bullets: [...(section.bullets || []), newBullet()] });
    };

    const handleUpdateBullet = (id: string, text: string) => {
        onChange({ ...section, bullets: (section.bullets || []).map((b) => b.id === id ? { ...b, text } : b) });
    };

    const handleDeleteBullet = (id: string) => {
        onChange({ ...section, bullets: (section.bullets || []).filter((b) => b.id !== id) });
    };

    const type = SECTION_TYPES.find((t) => t.type === section.type);

    return (
        <div
            className="rounded-2xl overflow-hidden"
            style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)' }}
        >
            {/* Section header */}
            <div
                className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none"
                onClick={() => setCollapsed((v) => !v)}
                style={{ borderBottom: collapsed ? 'none' : '1px solid rgba(255,255,255,0.06)' }}
            >
                <span className="text-sm">{type?.icon || '📋'}</span>
                <InlineInput
                    value={section.title}
                    onChange={(v) => onChange({ ...section, title: v })}
                    placeholder="Section Title"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 text-sm font-semibold"
                    style={{ background: 'transparent', border: 'none', color: '#e2e8f0', padding: 0 }}
                />
                <div className="ml-auto flex items-center gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="text-xs text-[#475569] hover:text-red-400 transition-colors px-1.5 py-1 rounded"
                        title="Delete section"
                    >
                        🗑
                    </button>
                    <span className="text-[#475569] text-sm">{collapsed ? '▸' : '▾'}</span>
                </div>
            </div>

            {/* Section body */}
            {!collapsed && (
                <div className="p-4 space-y-3">
                    {hasEntries ? (
                        <>
                            {(section.entries || []).map((entry) => (
                                <EntryCard
                                    key={entry.id}
                                    entry={entry}
                                    onChange={handleUpdateEntry}
                                    onDelete={() => handleDeleteEntry(entry.id)}
                                />
                            ))}
                            <button
                                onClick={handleAddEntry}
                                className="w-full py-2 text-xs font-medium rounded-xl border border-dashed transition-all"
                                style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#64748b' }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.color = '#ff6b00';
                                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#ff6b00';
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.color = '#64748b';
                                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
                                }}
                            >
                                + Add {type?.label || 'Item'}
                            </button>
                        </>
                    ) : (
                        <>
                            {(section.bullets || []).map((bullet) => (
                                <BulletRow
                                    key={bullet.id}
                                    bullet={bullet}
                                    onUpdate={(text) => handleUpdateBullet(bullet.id, text)}
                                    onDelete={() => handleDeleteBullet(bullet.id)}
                                />
                            ))}
                            <button
                                onClick={handleAddBullet}
                                className="w-full py-2 text-xs font-medium rounded-xl border border-dashed transition-all"
                                style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#64748b' }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.color = '#ff6b00';
                                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#ff6b00';
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.color = '#64748b';
                                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
                                }}
                            >
                                + Add Line
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

function EntryCard({
    entry,
    onChange,
    onDelete,
}: {
    entry: ResumeEntry;
    onChange: (e: ResumeEntry) => void;
    onDelete: () => void;
}) {
    const handleBulletAdd = () => {
        onChange({ ...entry, bullets: [...entry.bullets, newBullet()] });
    };
    const handleBulletUpdate = (id: string, text: string) => {
        onChange({ ...entry, bullets: entry.bullets.map((b) => b.id === id ? { ...b, text } : b) });
    };
    const handleBulletDelete = (id: string) => {
        onChange({ ...entry, bullets: entry.bullets.filter((b) => b.id !== id) });
    };

    return (
        <div
            className="rounded-xl p-3 space-y-2"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
            <div className="flex items-start gap-2">
                <div className="flex-1 grid grid-cols-2 gap-2">
                    <InlineInput
                        label="Organization"
                        value={entry.organization}
                        onChange={(v) => onChange({ ...entry, organization: v })}
                        placeholder="Company / University"
                    />
                    <InlineInput
                        label="Role / Degree"
                        value={entry.role}
                        onChange={(v) => onChange({ ...entry, role: v })}
                        placeholder="Software Engineer"
                    />
                    <InlineInput
                        label="Period"
                        value={entry.period || ''}
                        onChange={(v) => onChange({ ...entry, period: v })}
                        placeholder="2021 – Present"
                    />
                    <InlineInput
                        label="Location"
                        value={entry.location || ''}
                        onChange={(v) => onChange({ ...entry, location: v })}
                        placeholder="San Francisco, CA"
                    />
                </div>
                <button
                    onClick={onDelete}
                    className="text-[#475569] hover:text-red-400 transition-colors mt-5 flex-shrink-0"
                    title="Delete entry"
                >
                    ✕
                </button>
            </div>

            {/* Bullets */}
            <div className="space-y-1.5 pt-1">
                {entry.bullets.map((b) => (
                    <BulletRow
                        key={b.id}
                        bullet={b}
                        onUpdate={(text) => handleBulletUpdate(b.id, text)}
                        onDelete={() => handleBulletDelete(b.id)}
                        ai
                    />
                ))}
                <button
                    onClick={handleBulletAdd}
                    className="w-full py-1.5 text-[11px] rounded-lg transition-all"
                    style={{ color: '#64748b', border: '1px dashed rgba(255,255,255,0.08)' }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color = '#ff9a44';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = '#ff6b0050';
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color = '#64748b';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)';
                    }}
                >
                    + Add bullet
                </button>
            </div>
        </div>
    );
}

// ============================================================
// Bullet Row with inline AI actions
// ============================================================

function BulletRow({
    bullet,
    onUpdate,
    onDelete,
    ai = false,
}: {
    bullet: ResumeBullet;
    onUpdate: (text: string) => void;
    onDelete: () => void;
    ai?: boolean;
}) {
    const [focused, setFocused] = useState(false);
    const [showAI, setShowAI] = useState(false);

    return (
        <div className="group relative">
            <div
                className="flex items-start gap-2 rounded-lg px-2 py-1.5 transition-colors"
                style={{ background: focused ? 'rgba(255,107,0,0.06)' : 'transparent' }}
            >
                <span className="text-[#ff6b00] mt-1 flex-shrink-0 text-xs">•</span>
                <textarea
                    value={bullet.text}
                    onChange={(e) => onUpdate(e.target.value)}
                    onFocus={() => { setFocused(true); if (ai) setShowAI(true); }}
                    onBlur={() => { setFocused(false); setTimeout(() => setShowAI(false), 200); }}
                    placeholder="Describe your responsibility or achievement..."
                    rows={1}
                    className="flex-1 bg-transparent text-xs resize-none outline-none leading-relaxed"
                    style={{
                        color: '#cbd5e1',
                        fontFamily: 'inherit',
                        minHeight: 20,
                        overflowY: 'hidden',
                        caretColor: '#ff6b00',
                    }}
                    onInput={(e) => {
                        const el = e.currentTarget;
                        el.style.height = 'auto';
                        el.style.height = el.scrollHeight + 'px';
                    }}
                />
                <button
                    onClick={onDelete}
                    className="opacity-0 group-hover:opacity-100 text-[#475569] hover:text-red-400 transition-all text-xs flex-shrink-0 mt-0.5"
                >
                    ✕
                </button>
            </div>

            {/* Inline AI actions */}
            {ai && showAI && (
                <div
                    className="absolute left-6 -bottom-7 z-10 flex items-center gap-1 rounded-lg px-2 py-1 animate-fade-in"
                    style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}
                >
                    {[
                        { key: 'strengthen', label: '💪 Strengthen' },
                        { key: 'shorten', label: '✂️ Shorten' },
                        { key: 'quantify', label: '📊 Quantify' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                // Trigger AI via a global event or use the store
                                const event = new CustomEvent('rambo:ai-bullet', {
                                    detail: { text: bullet.text, action: key, onResult: onUpdate },
                                });
                                window.dispatchEvent(event);
                            }}
                            className="text-[10px] px-2 py-0.5 rounded transition-colors whitespace-nowrap"
                            style={{ color: '#94a3b8' }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#ff9a44'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ============================================================
// InlineInput — styled text input for the dark editor
// ============================================================

function InlineInput({
    label,
    value,
    onChange,
    placeholder,
    large,
    onClick,
    className,
    style,
}: {
    label?: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    large?: boolean;
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
    style?: React.CSSProperties;
}) {
    return (
        <div className={className} onClick={onClick}>
            {label && (
                <label className="block text-[10px] font-medium mb-1 uppercase tracking-wider" style={{ color: '#64748b' }}>
                    {label}
                </label>
            )}
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    width: '100%',
                    background: style?.background ?? 'rgba(255,255,255,0.04)',
                    border: style?.border ?? '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    padding: style?.padding ?? '6px 10px',
                    fontSize: large ? 18 : 12,
                    fontWeight: large ? 700 : 400,
                    color: style?.color ?? '#e2e8f0',
                    outline: 'none',
                    transition: 'border-color 150ms, box-shadow 150ms',
                    fontFamily: 'inherit',
                    ...style,
                }}
                onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#ff6b00';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,107,0,0.12)';
                }}
                onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            />
        </div>
    );
}
