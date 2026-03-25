// ============================================================
// components/templates/legacy.tsx
// Original 6 resume template renderers (preserved as-is)
// ============================================================

import React from 'react';
import type { ResumeData, ResumeTheme, ResumeSection, ResumeEntry } from '@/types';

// ============================================================
// Shared helpers
// ============================================================

function ContactLine({ data }: { data: ResumeData }) {
    const parts = [
        data.contact?.email,
        data.contact?.phone,
        data.contact?.location,
        data.contact?.linkedin,
        data.contact?.github,
        data.contact?.website,
    ].filter(Boolean);
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 14px', fontSize: 11, lineHeight: 1.4 }}>
            {parts.map((p, i) => <span key={i}>{p}</span>)}
        </div>
    );
}

function EntryBlock({ entry, theme }: { entry: ResumeEntry; theme: ResumeTheme }) {
    const compact = theme.spacing === 'compact';
    return (
        <div style={{ marginBottom: compact ? 8 : 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 4 }}>
                <div>
                    <span style={{ fontWeight: 700, fontSize: compact ? 11 : 12, color: theme.palette.primary }}>
                        {entry.organization}
                    </span>
                    {entry.role && (
                        <span style={{ fontWeight: 500, fontSize: compact ? 10 : 11, color: theme.palette.textColor, marginLeft: 6 }}>
                            · {entry.role}
                        </span>
                    )}
                </div>
                {entry.period && (
                    <span style={{ fontSize: compact ? 10 : 11, color: theme.palette.secondary || '#555' }}>
                        {entry.period}{entry.location ? ` · ${entry.location}` : ''}
                    </span>
                )}
            </div>
            {entry.description && (
                <div style={{ marginTop: 4, fontSize: compact ? 10 : 11, color: theme.palette.textColor, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {entry.description}
                </div>
            )}
            {entry.bullets.length > 0 && (
                <ul style={{ margin: '4px 0 0 0', paddingLeft: 16, listStyle: 'disc', fontSize: compact ? 10 : 11, color: theme.palette.textColor, lineHeight: 1.55 }}>
                    {entry.bullets.map((b) => (
                        <li key={b.id} style={{ marginBottom: compact ? 1 : 3 }}>{b.text}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function BulletList({ bullets, theme }: { bullets: { id: string; text: string }[]; theme: ResumeTheme }) {
    const bullet = theme.bulletStyle;
    const mark = bullet === 'dash' ? '–' : bullet === 'arrow' ? '→' : bullet === 'square' ? '▪' : '•';
    const compact = theme.spacing === 'compact';
    return (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: compact ? 10 : 11, color: theme.palette.textColor, lineHeight: 1.6 }}>
            {bullets.map((b) => (
                <li key={b.id} style={{ display: 'flex', gap: 6, marginBottom: compact ? 1 : 2 }}>
                    <span style={{ flexShrink: 0, color: theme.palette.accent || '#555' }}>{mark}</span>
                    <span>{b.text}</span>
                </li>
            ))}
        </ul>
    );
}

// ============================================================
// 1. Classic Professional
// ============================================================

export function TemplateClassicProfessional({ data, theme }: { data: ResumeData; theme: ResumeTheme }) {
    const bg = theme.palette.neutralBackground || '#fff';
    const primary = theme.palette.primary;
    const text = theme.palette.textColor || '#222';

    return (
        <div style={{ background: bg, color: text, fontFamily: theme.fontFamily, padding: '48px 52px', minHeight: '100%' }}>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: -0.5, color: primary }}>{data.fullName}</h1>
                {data.title && <p style={{ margin: '4px 0 8px', fontSize: 13, fontWeight: 500, color: theme.palette.secondary || '#555' }}>{data.title}</p>}
                <div style={{ color: '#555', fontSize: 11 }}><ContactLine data={data} /></div>
            </div>
            {data.sections.map((s) => (
                <div key={s.id} style={{ marginBottom: 20 }}>
                    <h2 style={{
                        margin: '0 0 6px', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
                        color: primary, paddingBottom: 4, borderBottom: `1.5px solid ${primary}`,
                    }}>{s.title}</h2>
                    {s.entries?.map((e) => <EntryBlock key={e.id} entry={e} theme={theme} />)}
                    {s.bullets && <BulletList bullets={s.bullets} theme={theme} />}
                </div>
            ))}
        </div>
    );
}

// ============================================================
// 2. Minimal Clean
// ============================================================

export function TemplateMinimalClean({ data, theme }: { data: ResumeData; theme: ResumeTheme }) {
    const bg = theme.palette.neutralBackground || '#fff';
    const text = theme.palette.textColor || '#111';

    return (
        <div style={{ background: bg, color: text, fontFamily: theme.fontFamily, padding: '56px 64px', minHeight: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 300, letterSpacing: 3, textTransform: 'uppercase', color: '#000' }}>{data.fullName}</h1>
                {data.title && <p style={{ margin: '6px 0 10px', fontSize: 12, fontWeight: 400, letterSpacing: 1.5, textTransform: 'uppercase', color: '#888' }}>{data.title}</p>}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: 11, color: '#777', flexWrap: 'wrap' }}>
                    {[data.contact?.email, data.contact?.phone, data.contact?.location, data.contact?.linkedin].filter(Boolean).map((p, i) => (
                        <span key={i}>{i > 0 && <span style={{ margin: '0 4px', opacity: 0.4 }}>|</span>}{p}</span>
                    ))}
                </div>
            </div>
            {data.sections.map((s) => (
                <div key={s.id} style={{ marginBottom: 28 }}>
                    <h2 style={{ margin: '0 0 12px', fontSize: 10, fontWeight: 600, letterSpacing: 2.5, textTransform: 'uppercase', color: '#999', textAlign: 'center' }}>
                        {s.title}
                    </h2>
                    {s.entries?.map((e) => <EntryBlock key={e.id} entry={e} theme={{ ...theme, palette: { ...theme.palette, primary: '#111', textColor: '#333' } }} />)}
                    {s.bullets && <BulletList bullets={s.bullets} theme={{ ...theme, bulletStyle: 'dash' }} />}
                </div>
            ))}
        </div>
    );
}

// ============================================================
// 3. Modern ATS
// ============================================================

export function TemplateModernATS({ data, theme }: { data: ResumeData; theme: ResumeTheme }) {
    const accent = theme.palette.accent || '#ff6b00';
    const text = theme.palette.textColor || '#0f172a';

    return (
        <div style={{ background: '#fff', color: text, fontFamily: theme.fontFamily, padding: '0', minHeight: '100%' }}>
            <div style={{ background: accent, padding: '28px 40px 22px', color: '#fff' }}>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: -0.3 }}>{data.fullName}</h1>
                {data.title && <p style={{ margin: '3px 0 8px', fontSize: 12, fontWeight: 400, opacity: 0.88 }}>{data.title}</p>}
                <div style={{ display: 'flex', gap: 14, fontSize: 11, opacity: 0.85, flexWrap: 'wrap' }}>
                    {[data.contact?.email, data.contact?.phone, data.contact?.location, data.contact?.linkedin].filter(Boolean).map((p, i) => (
                        <span key={i}>{p}</span>
                    ))}
                </div>
            </div>
            <div style={{ padding: '28px 40px' }}>
                {data.sections.map((s) => (
                    <div key={s.id} style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                            <div style={{ width: 4, height: 18, background: accent, borderRadius: 2, flexShrink: 0 }} />
                            <h2 style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: theme.palette.secondary || '#0f172a' }}>{s.title}</h2>
                        </div>
                        {s.entries?.map((e) => <EntryBlock key={e.id} entry={e} theme={theme} />)}
                        {s.bullets && <BulletList bullets={s.bullets} theme={theme} />}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================
// 4. Compact Developer
// ============================================================

export function TemplateCompactDeveloper({ data, theme }: { data: ResumeData; theme: ResumeTheme }) {
    const primary = theme.palette.primary || '#4f46e5';
    const bg = theme.palette.neutralBackground || '#fafafa';
    const text = theme.palette.textColor || '#1e1b4b';

    return (
        <div style={{ background: bg, color: text, fontFamily: theme.fontFamily, padding: '32px 40px', minHeight: '100%' }}>
            <div style={{ borderLeft: `3px solid ${primary}`, paddingLeft: 12, marginBottom: 20 }}>
                <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: primary }}>{data.fullName}</h1>
                {data.title && <p style={{ margin: '2px 0 6px', fontSize: 11, color: text, opacity: 0.7 }}>{data.title}</p>}
                <div style={{ fontSize: 10, color: '#64748b', display: 'flex', flexWrap: 'wrap', gap: '0 12px' }}>
                    <ContactLine data={data} />
                </div>
            </div>
            {data.sections.map((s) => (
                <div key={s.id} style={{ marginBottom: 14 }}>
                    <div style={{
                        display: 'inline-block', background: primary + '18', color: primary,
                        fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
                        padding: '2px 8px', borderRadius: 4, marginBottom: 8, border: `1px solid ${primary}30`,
                    }}>{s.title}</div>
                    {s.entries?.map((e) => <EntryBlock key={e.id} entry={e} theme={theme} />)}
                    {s.bullets && <BulletList bullets={s.bullets} theme={theme} />}
                </div>
            ))}
        </div>
    );
}

// ============================================================
// 5. Elegant Serif
// ============================================================

export function TemplateElegantSerif({ data, theme }: { data: ResumeData; theme: ResumeTheme }) {
    const primary = theme.palette.primary || '#6b4c2a';
    const bg = theme.palette.neutralBackground || '#fdf8f3';
    const text = theme.palette.textColor || '#2d1f0e';

    return (
        <div style={{ background: bg, color: text, fontFamily: theme.fontFamily, padding: '52px 60px', minHeight: '100%' }}>
            <div style={{ textAlign: 'center', borderBottom: `1px solid ${primary}40`, paddingBottom: 20, marginBottom: 28 }}>
                <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, color: primary, fontFamily: theme.fontFamilyHeading || theme.fontFamily, letterSpacing: 0.5 }}>{data.fullName}</h1>
                {data.title && <p style={{ margin: '6px 0 10px', fontSize: 13, fontStyle: 'italic', color: theme.palette.secondary || '#8c6d47' }}>{data.title}</p>}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 14, fontSize: 11, color: '#7a6050', flexWrap: 'wrap' }}>
                    {[data.contact?.email, data.contact?.phone, data.contact?.location].filter(Boolean).map((p, i) => (
                        <span key={i}>{i > 0 && <span style={{ opacity: 0.5 }}> · </span>}{p}</span>
                    ))}
                </div>
            </div>
            {data.sections.map((s) => (
                <div key={s.id} style={{ marginBottom: 24 }}>
                    <h2 style={{
                        margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: primary,
                        fontFamily: theme.fontFamilyHeading || theme.fontFamily,
                        fontStyle: 'italic', borderBottom: `0.5px solid ${primary}30`, paddingBottom: 4,
                    }}>{s.title}</h2>
                    {s.entries?.map((e) => <EntryBlock key={e.id} entry={e} theme={theme} />)}
                    {s.bullets && <BulletList bullets={s.bullets} theme={theme} />}
                </div>
            ))}
        </div>
    );
}

// ============================================================
// 6. Two-Column Structured
// ============================================================

export function TemplateTwoColumn({ data, theme }: { data: ResumeData; theme: ResumeTheme }) {
    const sidebarBg = theme.palette.sidebarBackground || theme.palette.primary || '#1e3a5f';
    const mainBg = theme.palette.neutralBackground || '#fff';
    const accent = theme.palette.accent || '#4a9ed6';
    const text = theme.palette.textColor || '#1a2332';

    const sideSections = data.sections.filter(s => s.type === 'skills' || s.type === 'education' || s.type === 'certifications');
    const mainSections = data.sections.filter(s => s.type !== 'skills' && s.type !== 'education' && s.type !== 'certifications');

    return (
        <div style={{ display: 'flex', minHeight: '100%', fontFamily: theme.fontFamily }}>
            <div style={{ width: '34%', background: sidebarBg, padding: '40px 20px', flexShrink: 0, color: '#fff' }}>
                <div style={{ marginBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 16 }}>
                    <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{data.fullName}</h1>
                    {data.title && <p style={{ margin: '4px 0 0', fontSize: 10, color: accent, fontWeight: 500 }}>{data.title}</p>}
                </div>
                <div style={{ marginBottom: 20 }}>
                    <h3 style={{ margin: '0 0 8px', fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: accent }}>Contact</h3>
                    {[
                        { icon: '✉', val: data.contact?.email },
                        { icon: '📞', val: data.contact?.phone },
                        { icon: '📍', val: data.contact?.location },
                        { icon: '🔗', val: data.contact?.linkedin },
                        { icon: '💻', val: data.contact?.github },
                    ].filter(({ val }) => val).map(({ icon, val }, i) => (
                        <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 5, fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>
                            <span style={{ fontSize: 9, marginTop: 1 }}>{icon}</span>
                            <span style={{ wordBreak: 'break-all' }}>{val}</span>
                        </div>
                    ))}
                </div>
                {sideSections.map(s => (
                    <div key={s.id} style={{ marginBottom: 18 }}>
                        <h3 style={{ margin: '0 0 8px', fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: accent }}>{s.title}</h3>
                        {s.bullets?.map(b => (
                            <div key={b.id} style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', marginBottom: 3, lineHeight: 1.5 }}>{b.text}</div>
                        ))}
                        {s.entries?.map(e => (
                            <div key={e.id} style={{ marginBottom: 8 }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>{e.organization}</div>
                                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)' }}>{e.role}{e.period ? ` · ${e.period}` : ''}</div>
                                {e.description && (
                                    <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.7)', marginTop: 2, lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
                                        {e.description}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div style={{ flex: 1, background: mainBg, padding: '40px 28px', color: text }}>
                {mainSections.map(s => (
                    <div key={s.id} style={{ marginBottom: 20 }}>
                        <h2 style={{
                            margin: '0 0 10px', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
                            color: sidebarBg, borderBottom: `2px solid ${accent}`, paddingBottom: 4,
                        }}>{s.title}</h2>
                        {s.entries?.map(e => <EntryBlock key={e.id} entry={e} theme={theme} />)}
                        {s.bullets && <BulletList bullets={s.bullets} theme={theme} />}
                    </div>
                ))}
            </div>
        </div>
    );
}
