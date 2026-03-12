'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

const FEATURES = [
  {
    icon: '✦',
    title: 'AI Inline Editing',
    desc: 'Select any text and instantly strengthen, shorten, or formalize it with AI assistance.',
  },
  {
    icon: '◈',
    title: 'ATS-Safe Templates',
    desc: '6 professionally crafted templates optimized for applicant tracking systems.',
  },
  {
    icon: '⬡',
    title: 'Design Matching',
    desc: 'Upload a resume design you love. We extract the palette and recreate the style.',
  },
  {
    icon: '◉',
    title: 'Privacy First',
    desc: 'Everything stays in your browser. No accounts, no servers, no tracking.',
  },
];

const TEMPLATES = [
  { name: 'Classic Professional', color: '#1a2e4a', tag: 'Most popular' },
  { name: 'Modern ATS', color: '#ff6b00', tag: 'ATS-optimized' },
  { name: 'Minimal Clean', color: '#000000', tag: 'Clean & timeless' },
  { name: 'Two-Column', color: '#1e3a5f', tag: 'Creative layout' },
  { name: 'Compact Developer', color: '#4f46e5', tag: 'For engineers' },
  { name: 'Elegant Serif', color: '#6b4c2a', tag: 'Premium look' },
];

export default function LandingPage() {
  const router = useRouter();
  const [hoveredTemplate, setHoveredTemplate] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}>

      {/* ---- Navbar ---- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#e2e8f0] px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-xl font-extrabold text-[#0f172a] tracking-tight">
            Ram<span className="text-[#ff6b00]">bo</span>
          </span>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#94a3b8] bg-[#f4f4f5] px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" />
              Free forever
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push('/build')}
              id="nav-cta-btn"
            >
              Start Building
            </Button>
          </div>
        </div>
      </nav>

      {/* ---- Hero ---- */}
      <section className="relative overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#fff3e8] rounded-full blur-[120px] opacity-60" />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #000 1px, transparent 0)`,
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#fff3e8] border border-[#ffd4b0] text-[#ff6b00] text-xs font-semibold px-4 py-2 rounded-full mb-8 animate-fade-up">
            <span className="w-2 h-2 bg-[#ff6b00] rounded-full" />
            AI-Assisted · ATS-Friendly · Free
          </div>

          {/* Headline */}
          <h1
            className="text-5xl md:text-7xl font-extrabold text-[#0f172a] tracking-tight leading-[1.05] mb-6 animate-fade-up"
            style={{ animationDelay: '40ms' }}
          >
            Build an{' '}
            <span
              className="gradient-text"
            >
              ATS-ready resume
            </span>
            <br />
            in minutes.
          </h1>

          {/* Subtext */}
          <p
            className="text-xl text-[#475569] max-w-xl mx-auto mb-10 leading-relaxed animate-fade-up"
            style={{ animationDelay: '80ms' }}
          >
            AI-assisted editing. Privacy-first. No accounts required.
            Everything runs in your browser.
          </p>

          {/* CTA buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
            style={{ animationDelay: '120ms' }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/build')}
              id="hero-primary-cta"
              className="w-full sm:w-auto shadow-[0_8px_24px_rgba(255,107,0,0.25)] hover:shadow-[0_12px_32px_rgba(255,107,0,0.35)] transition-shadow"
            >
              ⚡ Start Building — Free
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.push('/design')}
              id="hero-secondary-cta"
              className="w-full sm:w-auto"
            >
              🎨 Match My Design
            </Button>
          </div>

          {/* Social proof */}
          <p className="mt-6 text-xs text-[#94a3b8] animate-fade-up" style={{ animationDelay: '160ms' }}>
            No signup · Your data never leaves your device · Export PDF instantly
          </p>
        </div>

        {/* Hero preview image */}
        <div className="relative max-w-5xl mx-auto px-6 pb-24">
          <div
            className="relative rounded-2xl border border-[#e2e8f0] shadow-[0_24px_80px_rgba(15,23,42,0.10)] overflow-hidden animate-scale-in"
            style={{ background: 'linear-gradient(120deg, #fafafa 0%, #fff3e8 100%)', minHeight: 320 }}
          >
            <div className="flex items-stretch min-h-[320px]">
              {/* Mock editor panel */}
              <div className="w-1/2 bg-[#0f172a] p-6 hidden md:block">
                <div className="text-[#64748b] text-xs font-mono mb-4">// Your resume content</div>
                {['Alex Johnson', 'Senior Software Engineer', '', 'Experience', '↳ Led migration to microservices...', '↳ Built component library...', '', 'Skills', '↳ TypeScript · React · Node.js'].map((line, i) => (
                  <div
                    key={i}
                    className="text-xs font-mono mb-1.5"
                    style={{ color: line.startsWith('↳') ? '#94a3b8' : line === '' ? 'transparent' : i === 0 ? '#f1f5f9' : '#e2e8f0', opacity: line === 'Experience' || line === 'Skills' ? 0.9 : 1 }}
                  >
                    {line || '​'}
                  </div>
                ))}
                {/* AI pill */}
                <div className="mt-4 inline-flex items-center gap-2 bg-[#ff6b00]/20 border border-[#ff6b00]/30 rounded-lg px-3 py-1.5 text-xs text-[#ff9a44]">
                  ✦ Strengthen · Shorten · Fix Grammar
                </div>
              </div>
              {/* Mock preview panel */}
              <div className="flex-1 bg-white p-6 flex items-center justify-center">
                <div className="w-full max-w-[280px]">
                  <div className="bg-[#1a2e4a] text-white text-sm font-bold px-3 py-1.5 mb-2 rounded">Alex Johnson</div>
                  <div className="text-[#475569] text-xs mb-3">Senior Software Engineer · alex@example.com</div>
                  <div className="border-l-2 border-[#1a2e4a] pl-3 mb-2">
                    <div className="text-[10px] font-bold text-[#1a2e4a] uppercase tracking-wider mb-1">Experience</div>
                    <div className="text-xs text-[#0f172a] font-semibold">Acme Corp — Software Engineer</div>
                    <div className="text-[10px] text-[#94a3b8] mb-1">2021 – Present</div>
                    <div className="text-[10px] text-[#475569]">• Led migration to microservices, reducing deploy time by 40%</div>
                  </div>
                  <div className="border-l-2 border-[#1a2e4a] pl-3">
                    <div className="text-[10px] font-bold text-[#1a2e4a] uppercase tracking-wider mb-1">Skills</div>
                    <div className="text-[10px] text-[#475569]">TypeScript · React · Node.js · AWS</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Features ---- */}
      <section className="py-24 px-6 bg-[#fafafa] border-y border-[#e2e8f0]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">
              Everything you need to land the job.
            </h2>
            <p className="text-[#475569] text-lg max-w-xl mx-auto">
              Rambo packs professional-grade tools into a simple, private browser experience.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 border border-[#e2e8f0] card-hover animate-fade-up"
              >
                <div className="w-10 h-10 bg-[#fff3e8] rounded-xl flex items-center justify-center text-[#ff6b00] text-lg font-bold mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-[#0f172a] mb-2 text-sm">{f.title}</h3>
                <p className="text-[#94a3b8] text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Template Gallery ---- */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">
              6 templates. All ATS-optimized.
            </h2>
            <p className="text-[#94a3b8] text-base">Choose your style — every template passes ATS screening.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {TEMPLATES.map((t, i) => (
              <button
                key={t.name}
                onMouseEnter={() => setHoveredTemplate(i)}
                onMouseLeave={() => setHoveredTemplate(null)}
                onClick={() => router.push('/build')}
                className="group text-left rounded-2xl border border-[#e2e8f0] overflow-hidden transition-all duration-200 hover:border-[#ffd4b0] hover:shadow-[0_8px_24px_rgba(255,107,0,0.10)]"
              >
                {/* Template color preview */}
                <div
                  className="h-28 flex items-center justify-center relative overflow-hidden"
                  style={{ background: `${t.color}12` }}
                >
                  <div
                    className="w-24 h-20 rounded shadow-md transition-transform duration-200 group-hover:scale-105"
                    style={{ background: '#fff', border: `2px solid ${t.color}`, position: 'relative' }}
                  >
                    <div style={{ background: t.color, height: 20, borderRadius: '3px 3px 0 0', marginBottom: 4 }} />
                    {[100, 70, 85, 60].map((w, j) => (
                      <div key={j} style={{ background: `${t.color}30`, height: 5, margin: '3px 8px', borderRadius: 2, width: `${w}%` }} />
                    ))}
                  </div>
                  {hoveredTemplate === i && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 animate-fade-in">
                      <span className="text-white text-xs font-semibold bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        Use Template →
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-white">
                  <div className="text-xs font-semibold text-[#0f172a]">{t.name}</div>
                  <div className="text-[10px] text-[#94a3b8] mt-0.5">{t.tag}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/build')}
              id="template-cta-btn"
              className="shadow-[0_8px_24px_rgba(255,107,0,0.20)]"
            >
              Build My Resume →
            </Button>
          </div>
        </div>
      </section>

      {/* ---- How it works ---- */}
      <section className="py-24 px-6 bg-[#0f172a]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready in 3 steps.
          </h2>
          <p className="text-[#64748b] text-base mb-14">No tutorials needed. Just start.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Paste or type', desc: 'Paste your existing resume text or type from scratch.' },
              { step: '02', title: 'AI polishes it', desc: 'Select bullets. The AI strengthens, shortens, or formalizes with one click.' },
              { step: '03', title: 'Export PDF', desc: 'Download a pixel-perfect A4 PDF ready to submit anywhere.' },
            ].map((s) => (
              <div key={s.step} className="text-left">
                <div className="text-[#ff6b00] text-4xl font-black mb-4 opacity-40">{s.step}</div>
                <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-[#64748b] text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-14">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/build')}
              id="steps-cta-btn"
              className="shadow-[0_8px_24px_rgba(255,107,0,0.30)]"
            >
              Start Building — It's Free
            </Button>
          </div>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="bg-white border-t border-[#e2e8f0] py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[#0f172a] font-extrabold text-lg">
            Ram<span className="text-[#ff6b00]">bo</span>
          </span>
          <p className="text-[#94a3b8] text-xs text-center">
            Open-source · Privacy-first · Your data stays in your browser
          </p>
          <div className="flex gap-4 text-xs text-[#94a3b8]">
            <button onClick={() => router.push('/build')} className="hover:text-[#ff6b00] transition-colors">Builder</button>
            <button onClick={() => router.push('/design')} className="hover:text-[#ff6b00] transition-colors">Match Design</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
