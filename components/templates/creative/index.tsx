// ============================================================
// components/templates/creative/index.tsx
// 6 visually stunning creative resume templates
// All use print-safe inline styles · A4-optimized
// ============================================================

import React from 'react';
import type { ResumeData, ResumeTheme, ResumeSection } from '@/types';

// ============================================================
// Shared helpers
// ============================================================

function CreativeEntry({ entry, primaryColor, textColor, accentColor, compact }: {
    entry: { id: string; organization: string; role: string; period?: string; location?: string; description?: string; bullets: { id: string; text: string }[] };
    primaryColor: string; textColor: string; accentColor: string; compact?: boolean;
}) {
    return (
        <div className="resume-entry" style={{ marginBottom: compact ? 8 : 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, alignItems: 'baseline' }}>
                <div>
                    <span style={{ fontWeight: 700, fontSize: compact ? 10.5 : 11.5, color: primaryColor }}>{entry.organization}</span>
                    {entry.role && <span style={{ fontSize: compact ? 10 : 11, color: accentColor, marginLeft: 6, fontStyle: 'italic' }}>{entry.role}</span>}
                </div>
                {(entry.period || entry.location) && (
                    <span style={{ fontSize: 10, color: textColor, opacity: 0.6 }}>
                        {entry.period}{entry.location ? ` · ${entry.location}` : ''}
                    </span>
                )}
            </div>
            {entry.description && (
                <div style={{ marginTop: 4, fontSize: compact ? 10 : 10.5, color: textColor, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {entry.description}
                </div>
            )}
            {entry.bullets.length > 0 && (
                <ul className="resume-ul" style={{ margin: '4px 0 0', paddingLeft: 14, listStyle: 'none', fontSize: 10.5, color: textColor, lineHeight: 1.65 }}>
                    {entry.bullets.map(b => (
                        <li className="resume-li" key={b.id} style={{ marginBottom: 2, display: 'flex', gap: 6 }}>
                            <span style={{ color: accentColor, flexShrink: 0 }}>▸</span>
                            <span>{b.text}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

// ============================================================
// 13. Aurora Gradient
// Purple→teal gradient header · card-style sections · modern depth
// ============================================================

export function TemplateAuroraGradient({ data, theme }: { data: ResumeData; theme: ResumeTheme }) {
    const primary = theme.palette.primary || '#7c3aed';
    const secondary = theme.palette.secondary || '#0d9488';
    const accent = theme.palette.accent || '#06b6d4';
    const text = theme.palette.textColor || '#1e1e2e';
    const bg = theme.palette.neutralBackground || '#fafafa';

    return (
        <div style={{ background: bg, color: text, fontFamily: theme.fontFamily, minHeight: '100%' }}>
            {/* Aurora Header */}
            <div style={{
                background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
                padding: '36px 48px 28px',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Decorative orb */}
                <div style={{
                    position: 'absolute', top: -40, right: -40, width: 160, height: 160,
                    background: 'rgba(255,255,255,0.08)', borderRadius: '50%',
                }} />
                <div style={{
                    position: 'absolute', bottom: -20, right: 60, width: 80, height: 80,
                    background: 'rgba(255,255,255,0.05)', borderRadius: '50%',
                }} />
                {data.profilePhoto && (
                    <img src={data.profilePhoto} alt="Profile"
                        style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.5)', marginBottom: 12 }} />
                )}
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#ffffff', letterSpacing: -0.5 }}>{data.fullName}</h1>
                {data.title && <p style={{ margin: '6px 0 14px', fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 400 }}>{data.title}</p>}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {[data.contact?.email, data.contact?.phone, data.contact?.location, data.contact?.linkedin, data.contact?.github]
                        .filter(Boolean).map((p, i) => (
                            <span key={i} style={{
                                fontSize: 10, color: 'rgba(255,255,255,0.9)',
                                background: 'rgba(255,255,255,0.15)',
                                borderRadius: 20, padding: '2px 10px',
                                border: '1px solid rgba(255,255,255,0.25)',
                            }}>{p}</span>
                        ))}
                </div>
            </div>
            {/* Sections */}
            <div style={{ padding: '28px 48px' }}>
                {data.sections.map(s => (
                    <div key={s.id} style={{
                        marginBottom: 22, background: '#fff',
                        border: `1px solid ${primary}15`,
                        borderRadius: 10, padding: '16px 18px',
                        boxShadow: `0 2px 8px ${primary}08`,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <div style={{ width: 4, height: 18, background: `linear-gradient(${primary}, ${secondary})`, borderRadius: 2 }} />
                            <h2 style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: primary }}>{s.title}</h2>
                        </div>
                        {s.entries?.map(e => <CreativeEntry key={e.id} entry={e} primaryColor={text} textColor={text} accentColor={primary} />)}
                        {s.type !== 'skills' && s.bullets?.map(b => (
                            <div key={b.id} style={{ display: 'flex', gap: 8, fontSize: 10.5, color: text, marginBottom: 4, lineHeight: 1.65 }}>
                                <span style={{ color: accent, flexShrink: 0 }}>◆</span>
                                <span>{b.text}</span>
                            </div>
                        ))}
                        {s.type === 'skills' && s.bullets && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 8px' }}>
                                {s.bullets.map(b => (
                                    <span key={b.id} style={{
                                        fontSize: 10, color: '#fff', fontWeight: 500,
                                        background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                                        borderRadius: 20, padding: '3px 10px',
                                    }}>{b.text}</span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================
// 14. Neon Studio
// Dark background · neon glowing lines · bold design-agency feel
// ============================================================

export function TemplateNeonStudio({ data, theme }: { data: ResumeData; theme: ResumeTheme }) {
    const primary = theme.palette.primary || '#00ff88';
    const secondary = theme.palette.secondary || '#00ccff';
    const accent = theme.palette.accent || '#ff006e';
    const bg = theme.palette.neutralBackground || '#0a0a0f';
    const textColor = theme.palette.textColor || '#e0e0e0';

    return (
        <div style={{ background: bg, color: textColor, fontFamily: theme.fontFamily, minHeight: '100%' }}>
            {/* Neon Header */}
            <div style={{ padding: '36px 48px 24px', borderBottom: `1px solid ${primary}30` }}>
                <div style={{ fontSize: 10, letterSpacing: 4, color: primary, textTransform: 'uppercase', marginBottom: 6, fontWeight: 600 }}>
                    ◈ RÉSUMÉ
                </div>
                <h1 style={{
                    margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: -1,
                    color: '#ffffff',
                    textShadow: `0 0 20px ${primary}60`,
                }}>
                    {data.fullName}
                </h1>
                {data.title && (
                    <p style={{ margin: '6px 0 16px', fontSize: 13, color: secondary, fontWeight: 400, letterSpacing: 0.5 }}>
                        {data.title}
                    </p>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', fontSize: 10.5, color: textColor + 'bb' }}>
                    {[data.contact?.email, data.contact?.phone, data.contact?.location, data.contact?.linkedin, data.contact?.github]
                        .filter(Boolean).map((p, i) => (
                            <span key={i} style={{ borderBottom: `1px solid ${primary}30` }}>{p}</span>
                        ))}
                </div>
            </div>
            {/* Sections */}
            <div style={{ padding: '24px 48px' }}>
                {data.sections.map(s => (
                    <div key={s.id} style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <span style={{
                                fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase',
                                color: primary, textShadow: `0 0 8px ${primary}80`,
                            }}>{s.title}</span>
                            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${primary}60, transparent)` }} />
                        </div>
                        {s.entries?.map(e => (
                            <div key={e.id} style={{ marginBottom: 14, borderLeft: `2px solid ${primary}50`, paddingLeft: 14 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                    <span style={{ fontWeight: 700, fontSize: 12, color: '#fff' }}>{e.organization}</span>
                                    {e.period && <span style={{ fontSize: 10, color: primary + 'aa' }}>{e.period}</span>}
                                </div>
                                {e.role && <div style={{ fontSize: 11, color: secondary, marginBottom: 4, fontWeight: 500 }}>{e.role}{e.location ? ` · ${e.location}` : ''}</div>}
                                {e.bullets.map(b => (
                                    <div key={b.id} style={{ fontSize: 10.5, color: textColor + 'cc', marginBottom: 3, lineHeight: 1.65, paddingLeft: 4, display: 'flex', gap: 6 }}>
                                        <span style={{ color: primary, flexShrink: 0 }}>›</span>
                                        <span>{b.text}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                        {s.type !== 'skills' && s.bullets?.map(b => (
                            <div key={b.id} style={{ fontSize: 10.5, color: textColor + 'cc', marginBottom: 3, lineHeight: 1.65, display: 'flex', gap: 6, paddingLeft: 14 }}>
                                <span style={{ color: primary }}>›</span>
                                <span>{b.text}</span>
                            </div>
                        ))}
                        {s.type === 'skills' && s.bullets && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 8px', paddingLeft: 14 }}>
                                {s.bullets.map(b => (
                                    <span key={b.id} style={{
                                        fontSize: 10, color: primary, fontWeight: 600,
                                        border: `1px solid ${primary}50`,
                                        borderRadius: 4, padding: '2px 8px',
                                        background: `${primary}0a`,
                                        boxShadow: `0 0 8px ${primary}20`,
                                    }}>{b.text}</span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================
// 15. Editorial Bold
// Magazine layout · oversized typographic name · color-block sections
// ============================================================

export function TemplateEditorialBold({ data, theme }: { data: ResumeData; theme: ResumeTheme }) {
    const primary = theme.palette.primary || '#ff3b30';
    const secondary = theme.palette.secondary || '#1c1c1e';
    const accent = theme.palette.accent || '#ff9500';
    const text = theme.palette.textColor || '#1c1c1e';
    const bg = theme.palette.neutralBackground || '#ffffff';

    return (
        <div style={{ background: bg, color: text, fontFamily: theme.fontFamily, minHeight: '100%' }}>
            {/* Editorial Header */}
            <div style={{ padding: '0 48px', borderBottom: `4px solid ${primary}` }}>
                <div style={{ background: primary, margin: '0 -48px', padding: '8px 48px', marginBottom: 0 }}>
                    <span style={{ fontSize: 9, letterSpacing: 4, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Curriculum Vitae
                    </span>
                </div>
                <div style={{ paddingTop: 24, paddingBottom: 20 }}>
                    <h1 style={{ margin: 0, fontSize: 40, fontWeight: 900, color: text, lineHeight: 1, letterSpacing: -2, textTransform: 'uppercase' }}>
                        {data.fullName.split(' ').map((w, i) => (
                            <span key={i} style={{ color: i === 0 ? text : primary }}>{i > 0 ? ' ' : ''}{w}</span>
                        ))}
                    </h1>
                    {data.title && (
                        <p style={{ margin: '10px 0 14px', fontSize: 13, fontWeight: 500, color: accent, letterSpacing: 1, textTransform: 'uppercase' }}>
                            {data.title}
                        </p>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 16px', fontSize: 10.5, color: '#555' }}>
                        {[data.contact?.email, data.contact?.phone, data.contact?.location, data.contact?.linkedin]
                            .filter(Boolean).map((p, i) => <span key={i}>{p}</span>)}
                    </div>
                </div>
            </div>
            {/* Body */}
            <div style={{ padding: '24px 48px' }}>
                {data.sections.map((s, si) => (
                    <div key={s.id} style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'stretch', gap: 14, marginBottom: 12 }}>
                            <div style={{ width: 4, background: si % 2 === 0 ? primary : accent, borderRadius: 2 }} />
                            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900, letterSpacing: -0.5, textTransform: 'uppercase', color: secondary, alignSelf: 'center' }}>
                                {s.title}
                            </h2>
                        </div>
                        {s.entries?.map(e => <CreativeEntry key={e.id} entry={e} primaryColor={secondary} textColor={text} accentColor={si % 2 === 0 ? primary : accent} />)}
                        {s.type !== 'skills' && s.bullets?.map(b => (
                            <div key={b.id} style={{ display: 'flex', gap: 8, fontSize: 10.5, color: text, marginBottom: 4, lineHeight: 1.65 }}>
                                <span style={{ color: si % 2 === 0 ? primary : accent, flexShrink: 0, fontWeight: 700 }}>—</span>
                                <span>{b.text}</span>
                            </div>
                        ))}
                        {s.type === 'skills' && s.bullets && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 8px' }}>
                                {s.bullets.map(b => (
                                    <span key={b.id} style={{
                                        fontSize: 10, color: text, fontWeight: 600,
                                        background: si % 2 === 0 ? primary + '15' : accent + '15',
                                        border: `1px solid ${si % 2 === 0 ? primary : accent}40`,
                                        borderRadius: 4, padding: '2px 9px',
                                    }}>{b.text}</span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================
// 16. Portfolio Card
// Card-based section layout · profile photo support · modern SaaS aesthetic
// ============================================================

export function TemplatePortfolioCard({ data, theme }: { data: ResumeData; theme: ResumeTheme }) {
    const primary = theme.palette.primary || '#6366f1';
    const accent = theme.palette.accent || '#a855f7';
    const text = theme.palette.textColor || '#0f172a';
    const bg = theme.palette.neutralBackground || '#f8fafc';

    return (
        <div style={{ background: bg, color: text, fontFamily: theme.fontFamily, minHeight: '100%', padding: '0 0 32px' }}>
            {/* Gradient header with photo */}
            <div style={{
                background: `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`,
                padding: '32px 44px',
                display: 'flex', alignItems: 'center', gap: 20,
            }}>
                {data.profilePhoto ? (
                    <img src={data.profilePhoto} alt="Profile"
                        style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.6)', flexShrink: 0 }} />
                ) : (
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
                        border: '3px solid rgba(255,255,255,0.4)', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 26, color: '#fff', fontWeight: 700,
                    }}>
                        {data.fullName.charAt(0)}
                    </div>
                )}
                <div>
                    <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: -0.3 }}>{data.fullName}</h1>
                    {data.title && <p style={{ margin: '5px 0 12px', fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>{data.title}</p>}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 10px', fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>
                        {[data.contact?.email, data.contact?.phone, data.contact?.location, data.contact?.linkedin, data.contact?.github]
                            .filter(Boolean).map((p, i) => <span key={i}>{p}</span>)}
                    </div>
                </div>
            </div>
            {/* Cards grid */}
            <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {data.sections.map(s => (
                    <div key={s.id} style={{
                        background: '#ffffff', borderRadius: 12,
                        border: `1px solid ${primary}20`,
                        boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                        padding: '18px 22px',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: `linear-gradient(135deg, ${primary}, ${accent})` }} />
                            <h2 style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: primary }}>{s.title}</h2>
                        </div>
                        {s.entries?.map(e => <CreativeEntry key={e.id} entry={e} primaryColor={text} textColor={text} accentColor={accent} />)}
                        {s.type !== 'skills' && s.bullets?.map(b => (
                            <div key={b.id} style={{ display: 'flex', gap: 8, fontSize: 10.5, color: text, marginBottom: 4, lineHeight: 1.65 }}>
                                <span style={{ color: accent, flexShrink: 0, fontSize: 8, marginTop: 3 }}>◆</span>
                                <span>{b.text}</span>
                            </div>
                        ))}
                        {s.type === 'skills' && s.bullets && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 8px' }}>
                                {s.bullets.map(b => (
                                    <span key={b.id} style={{
                                        fontSize: 10, color: '#fff', fontWeight: 500,
                                        background: `linear-gradient(135deg, ${primary}, ${accent})`,
                                        borderRadius: 20, padding: '3px 10px',
                                    }}>{b.text}</span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================
// 17. Artisan Serif
// Warm cream · decorative dividers · high-end print aesthetic
// ============================================================

export function TemplateArtisanSerif({ data, theme }: { data: ResumeData; theme: ResumeTheme }) {
    const primary = theme.palette.primary || '#3d2b1f';
    const accent = theme.palette.accent || '#d4a574';
    const text = theme.palette.textColor || '#2c1810';
    const bg = theme.palette.neutralBackground || '#fef9f0';

    return (
        <div style={{ background: bg, color: text, fontFamily: theme.fontFamily, padding: '48px 56px', minHeight: '100%' }}>
            {/* Ornate header */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ fontSize: 10, letterSpacing: 6, color: accent, textTransform: 'uppercase', marginBottom: 8, fontFamily: theme.fontFamilyHeading || theme.fontFamily }}>
                    ✦ ✦ ✦
                </div>
                <h1 style={{
                    margin: 0, fontSize: 30, fontWeight: 700, color: primary,
                    fontFamily: theme.fontFamilyHeading || theme.fontFamily, letterSpacing: 0.5,
                }}>
                    {data.fullName}
                </h1>
                {data.title && (
                    <p style={{ margin: '7px 0 12px', fontSize: 12, fontStyle: 'italic', color: accent, fontFamily: theme.fontFamilyHeading || theme.fontFamily }}>
                        {data.title}
                    </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0 12px', fontSize: 10.5, color: '#7a6050' }}>
                    {[data.contact?.email, data.contact?.phone, data.contact?.location, data.contact?.linkedin]
                        .filter(Boolean).map((p, i) => (
                            <span key={i}>{i > 0 && <span style={{ opacity: 0.4, margin: '0 3px' }}>◆</span>}{p}</span>
                        ))}
                </div>
            </div>
            {/* Ornate divider */}
            <div style={{ textAlign: 'center', margin: '0 0 24px', color: accent, fontSize: 12, letterSpacing: 8 }}>
                ─────── ✦ ───────
            </div>
            {/* Sections */}
            {data.sections.map(s => (
                <div key={s.id} style={{ marginBottom: 26 }}>
                    <h2 style={{
                        margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: primary,
                        fontFamily: theme.fontFamilyHeading || theme.fontFamily,
                        fontStyle: 'italic', textAlign: 'center', letterSpacing: 0.5,
                    }}>
                        — {s.title} —
                    </h2>
                    <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${accent}80, transparent)`, marginBottom: 12 }} />
                    {s.entries?.map(e => (
                        <div key={e.id} style={{ marginBottom: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 700, fontSize: 11.5, color: primary, fontFamily: theme.fontFamily }}>{e.organization}</span>
                                {e.period && <span style={{ fontSize: 10, color: accent, fontFamily: theme.fontFamilyHeading, fontStyle: 'italic' }}>{e.period}</span>}
                            </div>
                            {e.role && <div style={{ fontSize: 11, fontStyle: 'italic', color: '#7a6050', marginBottom: 4, fontFamily: theme.fontFamilyHeading }}>{e.role}{e.location ? ` · ${e.location}` : ''}</div>}
                            {e.bullets.map(b => (
                                <div key={b.id} style={{ display: 'flex', gap: 8, fontSize: 10.5, color: text, marginBottom: 3, lineHeight: 1.7 }}>
                                    <span style={{ color: accent, flexShrink: 0 }}>•</span>
                                    <span>{b.text}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                    {s.type !== 'skills' && s.bullets?.map(b => (
                        <div key={b.id} style={{ display: 'flex', gap: 8, fontSize: 10.5, color: text, marginBottom: 4, lineHeight: 1.7 }}>
                            <span style={{ color: accent, flexShrink: 0 }}>•</span>
                            <span>{b.text}</span>
                        </div>
                    ))}
                    {s.type === 'skills' && s.bullets && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '5px 10px' }}>
                            {s.bullets.map(b => (
                                <span key={b.id} style={{
                                    fontSize: 10.5, color: text, fontStyle: 'italic',
                                    fontFamily: theme.fontFamilyHeading || theme.fontFamily,
                                    padding: '1px 4px',
                                    borderBottom: `1px dotted ${accent}`,
                                }}>{b.text}</span>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// ============================================================
// 18. Kinetic Dark
// All-dark resume · amber/orange gradient text · modern geometric
// ============================================================

export function TemplateKineticDark({ data, theme }: { data: ResumeData; theme: ResumeTheme }) {
    const primary = theme.palette.primary || '#f59e0b';
    const secondary = theme.palette.secondary || '#fb923c';
    const bg = theme.palette.neutralBackground || '#0f0f14';
    const textColor = theme.palette.textColor || '#e2e8f0';

    return (
        <div style={{ background: bg, color: textColor, fontFamily: theme.fontFamily, minHeight: '100%' }}>
            {/* Header */}
            <div style={{ padding: '38px 48px 26px', borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h1 style={{
                            margin: 0, fontSize: 30, fontWeight: 900, letterSpacing: -1,
                            background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                            WebkitBackgroundClip: 'text',
                            // For print, fall back to solid color
                            color: primary,
                        }}>
                            {data.fullName}
                        </h1>
                        {data.title && (
                            <p style={{ margin: '6px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 400, letterSpacing: 0.5 }}>
                                {data.title}
                            </p>
                        )}
                    </div>
                    {/* Contact block */}
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {[data.contact?.email, data.contact?.phone, data.contact?.location, data.contact?.linkedin, data.contact?.github]
                            .filter(Boolean).map((p, i) => (
                                <span key={i} style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>{p}</span>
                            ))}
                    </div>
                </div>
            </div>
            {/* Sections */}
            <div style={{ padding: '24px 48px' }}>
                {data.sections.map(s => (
                    <div key={s.id} style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <span style={{
                                fontSize: 9, fontWeight: 800, letterSpacing: 2.5, textTransform: 'uppercase',
                                color: primary,
                            }}>{s.title}</span>
                            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${primary}60, transparent)` }} />
                        </div>
                        {s.entries?.map(e => (
                            <div key={e.id} style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                                    <span style={{ fontWeight: 700, fontSize: 12, color: '#fff' }}>{e.organization}</span>
                                    {e.period && <span style={{ fontSize: 10, color: primary, fontWeight: 500 }}>{e.period}</span>}
                                </div>
                                {e.role && (
                                    <div style={{ fontSize: 11, color: secondary, marginBottom: 5, fontWeight: 500 }}>
                                        {e.role}{e.location ? ` · ${e.location}` : ''}
                                    </div>
                                )}
                                {e.bullets.map(b => (
                                    <div key={b.id} style={{ display: 'flex', gap: 8, fontSize: 10.5, color: 'rgba(255,255,255,0.65)', marginBottom: 3, lineHeight: 1.65 }}>
                                        <span style={{ color: primary, flexShrink: 0 }}>›</span>
                                        <span>{b.text}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                        {s.type !== 'skills' && s.bullets?.map(b => (
                            <div key={b.id} style={{ display: 'flex', gap: 8, fontSize: 10.5, color: 'rgba(255,255,255,0.65)', marginBottom: 4, lineHeight: 1.65 }}>
                                <span style={{ color: primary }}>›</span>
                                <span>{b.text}</span>
                            </div>
                        ))}
                        {s.type === 'skills' && s.bullets && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 8px' }}>
                                {s.bullets.map(b => (
                                    <span key={b.id} style={{
                                        fontSize: 10, color: primary, fontWeight: 600,
                                        border: `1px solid ${primary}50`,
                                        borderRadius: 4, padding: '2px 8px',
                                        background: `${primary}08`,
                                    }}>{b.text}</span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
