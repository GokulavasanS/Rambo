// ============================================================
// components/templates/ats/index.tsx
// 6 new ATS-friendly resume templates
// All use print-safe inline styles · A4-optimized · No Tailwind inside templates
// ============================================================

import React from 'react';
import type { ResumeData, ResumeTheme, ResumeSection, ResumeEntry } from '@/types';

// ============================================================
// Shared Helpers
// ============================================================

function ContactRow({ data, color = '#555', separator = ' · ' }: { data: ResumeData; color?: string; separator?: string }) {
    const parts = [
        data.contact?.email,
        data.contact?.phone,
        data.contact?.location,
        data.contact?.linkedin,
        data.contact?.github,
        data.contact?.website,
    ].filter(Boolean) as string[];
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 12px', fontSize: 10.5, color, lineHeight: 1.5 }}>
            {parts.map((p, i) => (
                <span key={i}>
                    {i > 0 && <span style={{ opacity: 0.5, marginRight: 4 }}>{separator}</span>}
                    {p}
                </span>
            ))}
        </div>
    );
}

function Entry({ entry, primaryColor, textColor, compact }: {
    entry: ResumeEntry; primaryColor: string; textColor: string; compact?: boolean;
}) {
    return (
        <div className="resume-entry" style={{ marginBottom: compact ? 8 : 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <div>
                    <span style={{ fontWeight: 700, fontSize: compact ? 10.5 : 11.5, color: primaryColor }}>{entry.organization}</span>
                    {entry.role && <span style={{ fontWeight: 500, fontSize: compact ? 10 : 11, color: textColor, marginLeft: 6 }}>— {entry.role}</span>}
                </div>
                {(entry.period || entry.location) && (
                    <span style={{ fontSize: 10, color: '#666', fontStyle: 'italic' }}>
                        {entry.period}{entry.location ? `, ${entry.location}` : ''}
                    </span>
                )}
            </div>
            {entry.description && (
                <div style={{ marginTop: 4, fontSize: compact ? 10 : 10.5, color: textColor, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {entry.description}
                </div>
            )}
            {entry.bullets.length > 0 && (
                <ul className="resume-ul" style={{ margin: '4px 0 0', paddingLeft: 16, listStyle: 'disc', fontSize: compact ? 10 : 10.5, color: textColor, lineHeight: 1.6 }}>
                    {entry.bullets.map(b => <li className="resume-li" key={b.id} style={{ marginBottom: 2 }}>{b.text}</li>)}
                </ul>
            )}
        </div>
    );
}

function Skills({ bullets, color, textColor }: { bullets: { id: string; text: string }[]; color: string; textColor: string }) {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px' }}>
            {bullets.map(b => (
                <span key={b.id} style={{ fontSize: 10, color: textColor, background: color + '12', border: `1px solid ${color}30`, borderRadius: 3, padding: '2px 7px' }}>
                    {b.text}
                </span>
            ))}
        </div>
    );
}

// ============================================================
// 7. Executive Impact
// Dark navy serif header · crisp underline sections · C-suite gravitas
// ============================================================

export function TemplateExecutiveImpact({ data, theme }: { data: ResumeData; theme: ResumeTheme }) {
    const primary = theme.palette.primary || '#0d1b2a';
    const accent = theme.palette.accent || '#2e86ab';
    const text = theme.palette.textColor || '#1a1a2e';
    const bg = theme.palette.neutralBackground || '#ffffff';

    return (
        <div style={{ background: bg, color: text, fontFamily: theme.fontFamily, padding: 0, minHeight: '100%' }}>
            {/* Header */}
            <div style={{ borderTop: `6px solid ${primary}`, padding: '36px 52px 24px', borderBottom: `1px solid ${primary}30` }}>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: primary, letterSpacing: -0.5, fontFamily: theme.fontFamilyHeading || theme.fontFamily }}>
                    {data.fullName}
                </h1>
                {data.title && (
                    <p style={{ margin: '6px 0 10px', fontSize: 13, fontWeight: 400, color: accent, letterSpacing: 0.3 }}>
                        {data.title}
                    </p>
                )}
                <ContactRow data={data} color="#555" separator="  |  " />
            </div>
            {/* Body */}
            <div style={{ padding: '24px 52px' }}>
                {data.sections.map(s => (
                    <div key={s.id} style={{ marginBottom: 22 }}>
                        <h2 style={{
                            margin: '0 0 8px', fontSize: 11, fontWeight: 700, letterSpacing: 1.8,
                            textTransform: 'uppercase', color: primary,
                            borderBottom: `1.5px solid ${primary}`,
                            paddingBottom: 4, fontFamily: theme.fontFamily,
                        }}>{s.title}</h2>
                        {s.entries?.map(e => <Entry key={e.id} entry={e} primaryColor={primary} textColor={text} />)}
                        {s.bullets?.map(b => (
                            <div key={b.id} style={{ display: 'flex', gap: 8, fontSize: 10.5, color: text, marginBottom: 3, lineHeight: 1.6 }}>
                                <span style={{ color: accent, flexShrink: 0, marginTop: 1 }}>•</span>
                                <span>{b.text}</span>
                            </div>
                        ))}
                        {s.type === 'skills' && s.bullets && <Skills bullets={s.bullets} color={primary} textColor={text} />}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================
// 8. Apex Recruiter
// Solid black header banner · red accent bar · crisp list formatting
// ============================================================

export function TemplateApexRecruiter({ data, theme }: { data: ResumeData; theme: ResumeTheme }) {
    const accent = theme.palette.accent || '#e63946';
    const text = theme.palette.textColor || '#111111';
    const bg = theme.palette.neutralBackground || '#ffffff';

    return (
        <div style={{ background: bg, color: text, fontFamily: theme.fontFamily, minHeight: '100%' }}>
            {/* Header Banner */}
            <div style={{ background: '#111111', padding: '30px 48px 22px' }}>
                <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, transparent)`, marginBottom: 14, width: '60%' }} />
                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#ffffff', letterSpacing: -0.3 }}>{data.fullName}</h1>
                {data.title && <p style={{ margin: '5px 0 10px', fontSize: 12, fontWeight: 400, color: '#aaaaaa', letterSpacing: 0.5 }}>{data.title}</p>}
                <ContactRow data={data} color="#cccccc" separator="  ·  " />
            </div>
            {/* Body */}
            <div style={{ padding: '28px 48px' }}>
                {data.sections.map(s => (
                    <div key={s.id} style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            <div style={{ width: 3, height: 16, background: accent, borderRadius: 1, flexShrink: 0 }} />
                            <h2 style={{ margin: 0, fontSize: 11.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#111' }}>
                                {s.title}
                            </h2>
                        </div>
                        {s.entries?.map(e => <Entry key={e.id} entry={e} primaryColor="#111" textColor={text} />)}
                        {s.type !== 'skills' && s.bullets?.map(b => (
                            <div key={b.id} style={{ display: 'flex', gap: 8, fontSize: 10.5, color: text, marginBottom: 3, lineHeight: 1.6 }}>
                                <span style={{ color: accent, flexShrink: 0 }}>▸</span>
                                <span>{b.text}</span>
                            </div>
                        ))}
                        {s.type === 'skills' && s.bullets && <Skills bullets={s.bullets} color={accent} textColor={text} />}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================
// 9. LinkedIn Smart
// Blue professional accents · rounded contact pills · LinkedIn-native feel
// ============================================================

export function TemplateLinkedInSmart({ data, theme }: { data: ResumeData; theme: ResumeTheme }) {
    const primary = theme.palette.primary || '#0077b5';
    const text = theme.palette.textColor || '#1c1c1c';
    const bg = theme.palette.neutralBackground || '#ffffff';

    const contactParts = [
        data.contact?.email,
        data.contact?.phone,
        data.contact?.location,
        data.contact?.linkedin,
        data.contact?.github,
        data.contact?.website,
    ].filter(Boolean) as string[];

    return (
        <div style={{ background: bg, color: text, fontFamily: theme.fontFamily, minHeight: '100%' }}>
            {/* Header */}
            <div style={{ background: `linear-gradient(135deg, ${primary} 0%, ${theme.palette.secondary || '#004182'} 100%)`, padding: '32px 48px 24px' }}>
                {data.profilePhoto && (
                    <img src={data.profilePhoto} alt="Profile"
                        style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.4)', marginBottom: 12 }} />
                )}
                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#ffffff', letterSpacing: -0.3 }}>{data.fullName}</h1>
                {data.title && <p style={{ margin: '5px 0 12px', fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.85)' }}>{data.title}</p>}
                {/* Contact pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {contactParts.map((p, i) => (
                        <span key={i} style={{
                            fontSize: 10, color: '#fff', background: 'rgba(255,255,255,0.18)',
                            border: '1px solid rgba(255,255,255,0.3)', borderRadius: 20, padding: '2px 10px',
                        }}>{p}</span>
                    ))}
                </div>
            </div>
            {/* Body */}
            <div style={{ padding: '24px 48px' }}>
                {data.sections.map(s => (
                    <div key={s.id} style={{ marginBottom: 22 }}>
                        <h2 style={{
                            margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: primary,
                            borderBottom: `2px solid ${primary}`, paddingBottom: 5,
                        }}>{s.title}</h2>
                        {s.entries?.map(e => <Entry key={e.id} entry={e} primaryColor={primary} textColor={text} />)}
                        {s.type !== 'skills' && s.bullets?.map(b => (
                            <div key={b.id} style={{ display: 'flex', gap: 8, fontSize: 10.5, color: text, marginBottom: 4, lineHeight: 1.6 }}>
                                <span style={{ color: primary, flexShrink: 0 }}>•</span>
                                <span>{b.text}</span>
                            </div>
                        ))}
                        {s.type === 'skills' && s.bullets && <Skills bullets={s.bullets} color={primary} textColor={text} />}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================
// 10. Federal Standard
// Plain text style · monospace labels · GS-formatted · max ATS parse safety
// ============================================================

export function TemplateFederalStandard({ data, theme }: { data: ResumeData; theme: ResumeTheme }) {
    const primary = theme.palette.primary || '#1a237e';
    const text = theme.palette.textColor || '#212121';
    const bg = theme.palette.neutralBackground || '#ffffff';

    return (
        <div style={{ background: bg, color: text, fontFamily: theme.fontFamily, padding: '40px 52px', minHeight: '100%' }}>
            {/* Header */}
            <div style={{ marginBottom: 24, borderBottom: `2px solid ${primary}`, paddingBottom: 14 }}>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: primary, textTransform: 'uppercase', letterSpacing: 1 }}>{data.fullName}</h1>
                {data.title && <p style={{ margin: '4px 0 8px', fontSize: 11, fontWeight: 500, color: text, textTransform: 'uppercase', letterSpacing: 1 }}>{data.title}</p>}
                <div style={{ fontSize: 10.5, color: '#444', marginTop: 4, lineHeight: 1.8 }}>
                    {data.contact?.email && <div>Email: {data.contact.email}</div>}
                    {data.contact?.phone && <div>Phone: {data.contact.phone}</div>}
                    {data.contact?.location && <div>Location: {data.contact.location}</div>}
                    {data.contact?.linkedin && <div>LinkedIn: {data.contact.linkedin}</div>}
                    {data.contact?.github && <div>GitHub: {data.contact.github}</div>}
                </div>
            </div>
            {/* Body */}
            {data.sections.map(s => (
                <div key={s.id} style={{ marginBottom: 20 }}>
                    <h2 style={{
                        margin: '0 0 8px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: 1.5, color: primary, borderBottom: `1px solid ${primary}40`, paddingBottom: 3,
                    }}>{s.title}</h2>
                    {s.entries?.map(e => (
                        <div key={e.id} style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: text }}>{e.organization}</div>
                            {e.role && <div style={{ fontSize: 10.5, color: '#444', marginBottom: 1 }}>{e.role}{e.period ? ` | ${e.period}` : ''}{e.location ? ` | ${e.location}` : ''}</div>}
                            {e.bullets.map(b => (
                                <div key={b.id} style={{ fontSize: 10.5, color: text, paddingLeft: 14, marginBottom: 2, lineHeight: 1.6 }}>
                                    - {b.text}
                                </div>
                            ))}
                        </div>
                    ))}
                    {s.bullets?.map(b => (
                        <div key={b.id} style={{ fontSize: 10.5, color: text, paddingLeft: 8, marginBottom: 2, lineHeight: 1.6 }}>
                            - {b.text}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

// ============================================================
// 11. Harvard Classic
// Centered serif name · full-caps section headers · academic dignity
// ============================================================

export function TemplateHarvardClassic({ data, theme }: { data: ResumeData; theme: ResumeTheme }) {
    const primary = theme.palette.primary || '#a41034';
    const text = theme.palette.textColor || '#1a1a1a';
    const bg = theme.palette.neutralBackground || '#ffffff';

    return (
        <div style={{ background: bg, color: text, fontFamily: theme.fontFamily, padding: '48px 56px', minHeight: '100%' }}>
            {/* Centered header */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: text, fontFamily: theme.fontFamilyHeading || theme.fontFamily, letterSpacing: 0.3 }}>
                    {data.fullName}
                </h1>
                {data.title && <p style={{ margin: '5px 0 10px', fontSize: 12, color: '#555', fontStyle: 'italic' }}>{data.title}</p>}
                <div style={{ width: 60, height: 1.5, background: primary, margin: '8px auto 10px' }} />
                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0 12px', fontSize: 10.5, color: '#444' }}>
                    {[data.contact?.email, data.contact?.phone, data.contact?.location, data.contact?.linkedin].filter(Boolean).map((p, i) => (
                        <span key={i}>{i > 0 && <span style={{ margin: '0 4px', opacity: 0.4 }}>|</span>}{p}</span>
                    ))}
                </div>
            </div>
            {/* Sections */}
            {data.sections.map(s => (
                <div key={s.id} style={{ marginBottom: 22 }}>
                    <h2 style={{
                        margin: '0 0 8px', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: 2.5, color: primary, textAlign: 'center',
                        borderTop: `1px solid ${primary}40`, borderBottom: `1px solid ${primary}40`,
                        padding: '5px 0',
                    }}>{s.title}</h2>
                    {s.entries?.map(e => <Entry key={e.id} entry={e} primaryColor={text} textColor="#333" />)}
                    {s.type !== 'skills' && s.bullets?.map(b => (
                        <div key={b.id} style={{ display: 'flex', gap: 8, fontSize: 10.5, color: text, marginBottom: 3, lineHeight: 1.6, paddingLeft: 4 }}>
                            <span style={{ color: primary, flexShrink: 0 }}>•</span>
                            <span>{b.text}</span>
                        </div>
                    ))}
                    {s.type === 'skills' && s.bullets && <Skills bullets={s.bullets} color={primary} textColor={text} />}
                </div>
            ))}
        </div>
    );
}

// ============================================================
// 12. Tech Minimal
// GitHub-inspired · monospace section labels · grid contact bar · developer-first
// ============================================================

export function TemplateTechMinimal({ data, theme }: { data: ResumeData; theme: ResumeTheme }) {
    const primary = theme.palette.primary || '#24292e';
    const accent = theme.palette.accent || '#0366d6';
    const text = theme.palette.textColor || '#24292e';
    const bg = theme.palette.neutralBackground || '#ffffff';

    const contactParts = [
        data.contact?.email && `✉ ${data.contact.email}`,
        data.contact?.phone && `📞 ${data.contact.phone}`,
        data.contact?.github && `⌨ ${data.contact.github}`,
        data.contact?.linkedin && `🔗 ${data.contact.linkedin}`,
        data.contact?.website && `🌐 ${data.contact.website}`,
        data.contact?.location && `📍 ${data.contact.location}`,
    ].filter(Boolean) as string[];

    return (
        <div style={{ background: bg, color: text, fontFamily: theme.fontFamily, padding: '36px 48px', minHeight: '100%' }}>
            {/* Header */}
            <div style={{ borderBottom: `1px solid #e1e4e8`, paddingBottom: 16, marginBottom: 22 }}>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: primary, fontFamily: theme.fontFamilyHeading || theme.fontFamily }}>
                    {data.fullName}
                </h1>
                {data.title && <p style={{ margin: '3px 0 10px', fontSize: 12, color: '#586069', fontFamily: theme.fontFamilyHeading || theme.fontFamily }}>{data.title}</p>}
                {/* Grid contact */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '3px 20px' }}>
                    {contactParts.map((p, i) => (
                        <span key={i} style={{ fontSize: 10, color: '#586069', fontFamily: theme.fontFamily }}>{p}</span>
                    ))}
                </div>
            </div>
            {/* Sections */}
            {data.sections.map(s => (
                <div key={s.id} style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 9, fontFamily: theme.fontFamily, color: accent, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                            ## {s.title}
                        </span>
                        <div style={{ flex: 1, height: 1, background: '#e1e4e8' }} />
                    </div>
                    {s.entries?.map(e => (
                        <div key={e.id} style={{ marginBottom: 10, borderLeft: `2px solid ${accent}30`, paddingLeft: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 700, fontSize: 11.5, color: primary, fontFamily: theme.fontFamilyHeading || theme.fontFamily }}>{e.organization}</span>
                                {e.period && <span style={{ fontSize: 10, color: '#586069', fontFamily: theme.fontFamily }}>{e.period}</span>}
                            </div>
                            {e.role && <div style={{ fontSize: 10.5, color: accent, marginBottom: 3, fontFamily: theme.fontFamilyHeading || theme.fontFamily }}>{e.role}{e.location ? ` · ${e.location}` : ''}</div>}
                            {e.bullets.map(b => (
                                <div key={b.id} style={{ fontSize: 10.5, color: text, paddingLeft: 4, marginBottom: 2, lineHeight: 1.6 }}>
                                    <span style={{ color: '#586069' }}>- </span>{b.text}
                                </div>
                            ))}
                        </div>
                    ))}
                    {s.type !== 'skills' && s.bullets?.map(b => (
                        <div key={b.id} style={{ fontSize: 10.5, color: text, paddingLeft: 4, marginBottom: 2, lineHeight: 1.6 }}>
                            <span style={{ color: '#586069' }}>- </span>{b.text}
                        </div>
                    ))}
                    {s.type === 'skills' && s.bullets && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px' }}>
                            {s.bullets.map(b => (
                                <code key={b.id} style={{
                                    fontSize: 10, color: accent, background: accent + '12',
                                    border: `1px solid ${accent}30`, borderRadius: 4,
                                    padding: '1px 6px', fontFamily: theme.fontFamily,
                                }}>{b.text}</code>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
