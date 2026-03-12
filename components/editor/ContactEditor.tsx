// ============================================================
// components/editor/ContactEditor.tsx
// Inline editor for name, title, and contact fields shown
// above the preview panel — edits ResumeData directly.
// ============================================================

'use client';

import React, { useState, useCallback } from 'react';
import type { ResumeData, ResumeContact } from '@/types';

interface ContactEditorProps {
    data: ResumeData;
    onUpdate: (updated: ResumeData) => void;
}

interface FieldProps {
    value: string;
    placeholder: string;
    onSave: (val: string) => void;
    className?: string;
    id?: string;
}

/** Single inline-editable field */
function InlineField({ value, placeholder, onSave, className = '', id }: FieldProps) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);

    const commit = useCallback(() => {
        onSave(draft.trim() || value);
        setEditing(false);
    }, [draft, value, onSave]);

    if (editing) {
        return (
            <input
                id={id}
                type="text"
                value={draft}
                autoFocus
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') commit();
                    if (e.key === 'Escape') setEditing(false);
                }}
                className={`bg-transparent border-b border-violet-500/60 outline-none text-white px-0 ${className}`}
                style={{ minWidth: 60 }}
            />
        );
    }

    return (
        <span
            id={id}
            role="button"
            tabIndex={0}
            onClick={() => { setDraft(value); setEditing(true); }}
            onKeyDown={(e) => e.key === 'Enter' && setEditing(true)}
            className={`cursor-text hover:opacity-70 transition-opacity ${value ? '' : 'opacity-30'
                } ${className}`}
            title="Click to edit"
        >
            {value || placeholder}
        </span>
    );
}

export function ContactEditor({ data, onUpdate }: ContactEditorProps) {
    const updateField = useCallback(
        (field: keyof ResumeData, value: string) => {
            onUpdate({ ...data, [field]: value });
        },
        [data, onUpdate]
    );

    const updateContact = useCallback(
        (field: keyof ResumeContact, value: string) => {
            onUpdate({
                ...data,
                contact: { ...data.contact, [field]: value },
            });
        },
        [data, onUpdate]
    );

    return (
        <div className="px-4 py-3 border-b border-white/8 bg-[#0d0d14] flex-shrink-0">
            {/* Name + Title row */}
            <div className="flex flex-wrap items-baseline gap-2 mb-2">
                <InlineField
                    id="edit-full-name"
                    value={data.fullName}
                    placeholder="Your Name"
                    onSave={(v) => updateField('fullName', v)}
                    className="text-white font-semibold text-sm"
                />
                {data.title !== undefined && (
                    <>
                        <span className="text-white/20 text-xs">·</span>
                        <InlineField
                            id="edit-title"
                            value={data.title ?? ''}
                            placeholder="Job Title"
                            onSave={(v) => updateField('title', v)}
                            className="text-white/50 text-xs"
                        />
                    </>
                )}
                <span className="ml-auto text-white/20 text-xs hidden sm:block" title="Click any field to edit">
                    ✎ click to edit
                </span>
            </div>

            {/* Contact fields row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <ContactChip
                    icon="✉"
                    value={data.contact?.email ?? ''}
                    placeholder="email@domain.com"
                    onSave={(v) => updateContact('email', v)}
                    id="edit-email"
                />
                <ContactChip
                    icon="📞"
                    value={data.contact?.phone ?? ''}
                    placeholder="+1 555 000 0000"
                    onSave={(v) => updateContact('phone', v)}
                    id="edit-phone"
                />
                <ContactChip
                    icon="📍"
                    value={data.contact?.location ?? ''}
                    placeholder="City, Country"
                    onSave={(v) => updateContact('location', v)}
                    id="edit-location"
                />
            </div>
        </div>
    );
}

function ContactChip({
    icon,
    value,
    placeholder,
    onSave,
    id,
}: {
    icon: string;
    value: string;
    placeholder: string;
    onSave: (v: string) => void;
    id: string;
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);

    const commit = () => {
        onSave(draft.trim());
        setEditing(false);
    };

    return (
        <div className="flex items-center gap-1 text-xs text-white/40 group">
            <span className="text-white/20 text-[10px]">{icon}</span>
            {editing ? (
                <input
                    id={id}
                    type="text"
                    value={draft}
                    autoFocus
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={commit}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') commit();
                        if (e.key === 'Escape') setEditing(false);
                    }}
                    className="bg-transparent border-b border-violet-500/50 outline-none text-white/70 text-xs px-0 w-40"
                />
            ) : (
                <span
                    id={id}
                    role="button"
                    tabIndex={0}
                    onClick={() => { setDraft(value); setEditing(true); }}
                    onKeyDown={(e) => e.key === 'Enter' && setEditing(true)}
                    className={`cursor-text hover:text-white/70 transition-colors ${value ? 'text-white/40' : 'text-white/15 italic'
                        }`}
                >
                    {value || placeholder}
                </span>
            )}
        </div>
    );
}
