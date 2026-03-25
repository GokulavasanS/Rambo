'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

/* ─────────────────────────────────────────────────────────
   Data
───────────────────────────────────────────────────────── */

const FEATURES = [
  { icon: '✦', title: 'AI Inline Editing',   desc: 'Select any bullet and instantly strengthen, shorten, or formalize it with one click.', color: '#ff6b00' },
  { icon: '◈', title: 'ATS-Safe Templates',  desc: '18 professionally crafted templates fully optimized for applicant tracking systems.', color: '#6366f1' },
  { icon: '⬡', title: 'Match My Design',     desc: 'Upload any resume image. We extract its color palette and recreate the style instantly.', color: '#0ea5e9' },
  { icon: '◉', title: 'Privacy First',       desc: 'Everything lives in your browser. No accounts, no servers, no data collection — ever.', color: '#10b981' },
  { icon: '⚡', title: 'ATS Score Checker',  desc: 'Paste a job description and get an instant match score with targeted improvement tips.', color: '#f59e0b' },
  { icon: '⤓', title: 'Instant PDF Export',  desc: 'One-click pixel-perfect A4 PDF that renders consistently across all devices.', color: '#ef4444' },
];

const TEMPLATES = [
  { name: 'Classic Professional', color: '#1a2e4a', tag: 'Most popular',      type: 'ATS' },
  { name: 'Modern ATS',           color: '#ff6b00', tag: 'ATS-optimized',     type: 'ATS' },
  { name: 'Minimal Clean',        color: '#0f172a', tag: 'Clean & timeless',  type: 'ATS' },
  { name: 'Harvard Classic',      color: '#a41034', tag: 'Academic prestige', type: 'ATS' },
  { name: 'Executive Impact',     color: '#0d1b2a', tag: 'C-suite gravitas',  type: 'ATS' },
  { name: 'Compact Developer',    color: '#4f46e5', tag: 'For engineers',     type: 'ATS' },
  { name: 'Aurora Gradient',      color: '#7c3aed', tag: 'Vivid & modern',   type: 'Creative' },
  { name: 'Neon Studio',          color: '#059669', tag: 'Bold agency feel',  type: 'Creative' },
  { name: 'Editorial Bold',       color: '#dc2626', tag: 'Magazine style',    type: 'Creative' },
  { name: 'Portfolio Card',       color: '#6366f1', tag: 'SaaS-inspired',     type: 'Creative' },
  { name: 'Artisan Serif',        color: '#b45309', tag: 'High-end print',    type: 'Creative' },
  { name: 'Kinetic Dark',         color: '#d97706', tag: 'Dark & bold',       type: 'Creative' },
];

// Only 6 templates shown in the hero auto-cycle
const HERO_CYCLE_TEMPLATES = TEMPLATES.slice(0, 6);

const TESTIMONIALS = [
  {
    name: 'Priya Sharma', role: 'Software Engineer, Google', avatar: 'PS', rating: 5,
    text: "Rambo helped me land 3 interviews in my first week. The AI rewrote my bullet points so effectively. I couldn't believe it was free.",
  },
  {
    name: 'Marcus Chen', role: 'Product Designer, Figma', avatar: 'MC', rating: 5,
    text: 'The "Match My Design" feature is a game-changer. I uploaded a resume I loved and Rambo recreated the style perfectly. My portfolio resume finally looks premium.',
  },
  {
    name: 'Amara Okafor', role: 'Recent Graduate, University of Lagos', avatar: 'AO', rating: 5,
    text: "As a fresher, I had no idea how to make my resume ATS-friendly. Rambo helped me format it right and rewrote my internship bullets to sound professional.",
  },
];

const PERSONAS = [
  { icon: '🎓', title: 'Students & Fresh Grads', tag: 'Entry-level friendly', desc: 'Turn internships, projects, and coursework into compelling resume bullets. Start from zero — Rambo guides you.' },
  { icon: '💼', title: 'Professionals',          tag: 'Level up your career', desc: 'Polish your existing resume with AI-powered language upgrades. Make every bullet punchy and metrics-driven.' },
  { icon: '🎨', title: 'Designers & Creatives',  tag: 'Stand out creatively', desc: 'Use Match My Design to build a visually stunning resume that still passes ATS checks effortlessly.' },
  { icon: '🔄', title: 'Career Switchers',       tag: 'Land the pivot',       desc: "Frame transferable skills for a new industry. AI helps rewrite your experience to match the role you want." },
];

const FAQS = [
  { q: 'Is Rambo ATS-friendly?', a: 'Yes. Every template is built with ATS compatibility as the primary concern. We avoid columns, tables, headers/footers, and unusual fonts that confuse parsing algorithms.' },
  { q: 'Is it completely free?', a: 'Rambo is free forever. No trial periods, no credit cards, no premium tiers — just open the app and start building. Everything runs in your browser.' },
  { q: 'Can I edit my resume later?', a: "Your progress is saved in your browser's local storage, so you can come back and continue editing anytime from the same device and browser." },
  { q: 'Will the formatting break in PDF?', a: 'No. Rambo uses a carefully tuned PDF rendering engine that produces pixel-perfect A4 output. What you see in the editor is exactly what you get in the PDF.' },
  { q: 'Is my data secure?', a: "Completely. Rambo is 100% client-side — your resume data never leaves your device. There are no servers, no databases, and no user accounts." },
  { q: 'Can I use Rambo without an account?', a: 'Yes — no account is ever required. Just open the app and start building immediately. This is by design to protect your privacy.' },
];

const SKILLS_TICKER = [
  'ATS Optimization', 'AI Content Rewriting', 'Instant PDF Export', 'Privacy-First',
  'Match My Design', 'Job Description Score', 'Open Source', 'No Signup Required',
  'Free Forever', 'Instant Results', '18 Templates', 'Browser-Based',
];

const POWER_FEATURES = [
  { icon: '🤖', title: 'AI Rewriting Engine',            desc: 'Select any text and get instant suggestions to strengthen, shorten, formalize, or make it more impactful.' },
  { icon: '📊', title: 'ATS Score Checker',              desc: 'Analyze your resume against a live job description and receive a percentage match score with specific recommendations.' },
  { icon: '🎯', title: 'Job-Targeted Optimizer',         desc: 'Paste any job description and Rambo highlights gaps, suggests keyword additions, and rewrites bullets to match.' },
  { icon: '🖼', title: 'Design Extraction (Match Style)', desc: 'Upload a resume image or PDF you admire. Rambo uses OCR and color detection to extract the design and apply it to your content.' },
  { icon: '📤', title: 'Multi-Format Export',            desc: 'Export as pixel-perfect PDF, or generate a shareable link to your live resume that you can send directly to recruiters.' },
  { icon: '✏️', title: 'Rich In-Browser Editor',         desc: 'A fully-featured Tiptap-powered editor with inline AI — no app install, no cloud sync, no friction.' },
];

const NAV_LINKS = [
  { label: 'Features',    href: '#features' },
  { label: 'Templates',   href: '#templates' },
  { label: 'How It Works',href: '#how-it-works' },
  { label: 'FAQ',         href: '#faq' },
];

/* ─────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────── */

export default function LandingPage() {
  const router = useRouter();

  const [hoveredTemplate, setHoveredTemplate] = useState<number | null>(null);
  const [activeHeroTemplate, setActiveHeroTemplate] = useState(0);
  const [activeTab, setActiveTab] = useState<'ATS' | 'Creative'>('ATS');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* ── Scroll listener ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Close mobile menu on route change / resize ── */
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* ── Prevent body scroll when mobile menu is open ── */
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  /* ── Scroll-reveal ── */
  const revealRefs = useRef<HTMLElement[]>([]);
  const addRevealRef = useCallback((el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    revealRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* ── Hero template auto-cycle ── */
  useEffect(() => {
    const id = setInterval(() => setActiveHeroTemplate((p) => (p + 1) % HERO_CYCLE_TEMPLATES.length), 2800);
    return () => clearInterval(id);
  }, []);

  const filteredTemplates = TEMPLATES.filter((t) => t.type === activeTab);
  const currentHeroTemplate = HERO_CYCLE_TEMPLATES[activeHeroTemplate];

  /* ── Smooth-scroll helper ── */
  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>

      {/* ═══════════════════════════════════════
          Navbar
      ═══════════════════════════════════════ */}
      <nav
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom: scrolled ? '1px solid #e2e8f0' : '1px solid transparent',
          boxShadow: scrolled ? '0 2px 20px rgba(15,23,42,0.07)' : 'none',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => router.push('/')}
            className="text-xl font-extrabold text-[#0f172a] tracking-tight cursor-pointer bg-transparent border-0 p-0"
          >
            Ram<span className="text-[#ff6b00]">bo</span>
          </button>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6 text-[13px] font-semibold text-[#475569]">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="hover:text-[#ff6b00] transition-colors duration-150">
                {l.label}
              </a>
            ))}
            <button
              onClick={() => router.push('/design')}
              className="flex items-center gap-1.5 text-[13px] font-semibold px-3 py-1.5 rounded-lg transition-all border hover:opacity-90"
              style={{ color: '#6366f1', borderColor: '#e0e7ff', background: '#f5f3ff' }}
            >
              🎨 Match Design
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#94a3b8] bg-[#f4f4f5] px-3 py-1.5 rounded-full font-medium">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" />
              Free forever
            </span>
            <Button variant="primary" size="sm" onClick={() => router.push('/build')} id="nav-cta-btn">
              Start Building
            </Button>
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-[#f4f4f5] transition-colors"
              aria-label="Open menu"
            >
              <span className="block w-5 h-0.5 bg-[#475569] rounded-full" />
              <span className="block w-5 h-0.5 bg-[#475569] rounded-full" />
              <span className="block w-5 h-0.5 bg-[#475569] rounded-full" />
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════
          Mobile Nav Drawer
      ═══════════════════════════════════════ */}
      {mobileMenuOpen && (
        <div className="mobile-nav">
          {/* Backdrop */}
          <div className="mobile-nav-backdrop" onClick={() => setMobileMenuOpen(false)} />
          {/* Panel */}
          <div className="mobile-nav-panel">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xl font-extrabold text-[#0f172a]">
                Ram<span className="text-[#ff6b00]">bo</span>
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f4f4f5] text-[#94a3b8] text-lg transition-colors"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {/* Links */}
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="mobile-nav-link"
                onClick={() => { setMobileMenuOpen(false); }}
              >
                {l.label}
              </a>
            ))}
            <a className="mobile-nav-link" href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); router.push('/design'); }}>
              🎨 Match My Design
            </a>

            <div className="mt-auto pt-6 flex flex-col gap-3">
              <Button variant="primary" size="md" onClick={() => { setMobileMenuOpen(false); router.push('/build'); }} className="w-full justify-center">
                ⚡ Build My Resume — Free
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          Hero
      ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: 'min(90vh, 900px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[600px] rounded-full opacity-50"
            style={{ background: 'radial-gradient(ellipse, #fff3e8 0%, transparent 70%)', filter: 'blur(60px)' }} />
          <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full opacity-25"
            style={{ background: 'radial-gradient(ellipse, #e0e7ff 0%, transparent 70%)', filter: 'blur(80px)' }} />
          <div className="absolute inset-0 opacity-[0.022]"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-10 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

            {/* ── Left — copy ── */}
            <div className="flex-1 text-center lg:text-left w-full">
              <div className="inline-flex items-center gap-2 bg-[#fff3e8] border border-[#ffd4b0] text-[#ff6b00] text-xs font-bold px-4 py-2 rounded-full mb-6 animate-fade-up tracking-wide">
                <span className="w-2 h-2 bg-[#ff6b00] rounded-full" />
                AI-Powered · ATS-Optimized · 100% Free
              </div>

              <h1
                className="font-black text-[#0f172a] tracking-tight leading-[1.05] mb-5 animate-fade-up"
                style={{
                  fontSize: 'clamp(2.4rem, 6vw, 4.5rem)',
                  animationDelay: '60ms',
                  fontFamily: "'Outfit','Inter',sans-serif",
                }}
              >
                Build an{' '}
                <span className="gradient-text">Interview-Winning</span>
                <br />
                Resume in Minutes.
              </h1>

              <p
                className="text-[#475569] max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed animate-fade-up"
                style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', animationDelay: '120ms' }}
              >
                AI that rewrites your bullets. 18 templates that pass ATS screening.
                Design matching from any image. All in your browser — no signup ever.
              </p>

              {/* CTAs */}
              <div
                className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3 animate-fade-up"
                style={{ animationDelay: '180ms' }}
              >
                <Button
                  variant="primary" size="lg"
                  onClick={() => router.push('/build')}
                  id="hero-primary-cta"
                  className="w-full sm:w-auto"
                  style={{ boxShadow: '0 10px 32px rgba(255,107,0,0.30)', fontSize: '15px', padding: '14px 28px' } as React.CSSProperties}
                >
                  ⚡ Build My Resume — Free
                </Button>
                <Button
                  variant="secondary" size="lg"
                  onClick={() => scrollTo('templates')}
                  id="hero-secondary-cta"
                  className="w-full sm:w-auto"
                  style={{ fontSize: '15px', padding: '14px 28px' } as React.CSSProperties}
                >
                  See Templates
                </Button>
                <button
                  onClick={() => router.push('/design')}
                  id="hero-match-design-cta"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: '15px', boxShadow: '0 8px 24px rgba(99,102,241,0.28)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(99,102,241,0.38)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.28)'; }}
                >
                  ✦ Match My Design
                </button>
              </div>

              <p className="mt-5 text-xs text-[#94a3b8] animate-fade-up font-medium" style={{ animationDelay: '220ms' }}>
                No signup · Data stays in your browser · Export PDF in seconds
              </p>

              {/* Trust badges — mobile & desktop */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-6">
                {[{ icon: '🔒', text: '100% Private' }, { icon: '⚡', text: 'Instant PDF' }, { icon: '✅', text: 'ATS Tested' }].map((b) => (
                  <div key={b.text} className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64748b] bg-white border border-[#e2e8f0] px-3 py-1.5 rounded-full shadow-sm">
                    {b.icon} {b.text}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right — animated resume mockup ── */}
            <div className="flex-1 w-full max-w-md lg:max-w-none animate-scale-in" style={{ animationDelay: '200ms' }}>
              <div className="relative rounded-2xl overflow-hidden shadow-[0_24px_64px_rgba(15,23,42,0.14)]" style={{ border: '1px solid #e2e8f0' }}>
                {/* Window chrome */}
                <div className="bg-[#0f172a] px-4 py-2.5 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ef4444] inline-block" />
                  <span className="w-3 h-3 rounded-full bg-[#f59e0b] inline-block" />
                  <span className="w-3 h-3 rounded-full bg-[#10b981] inline-block" />
                  <span className="ml-2 text-[11px] text-[#64748b] font-mono">rambo — resume builder</span>
                </div>

                <div className="flex" style={{ minHeight: 300 }}>
                  {/* Editor panel (hidden on mobile to save space) */}
                  <div className="w-[42%] bg-[#0f172a] p-4 hidden sm:block">
                    <div className="text-[#64748b] text-[10px] font-mono mb-3">// Your content</div>
                    {[
                      { text: 'Alex Johnson', color: '#f1f5f9', bold: true },
                      { text: 'Senior Engineer · alex@dev.io', color: '#64748b', bold: false },
                      { text: '', color: '', bold: false },
                      { text: 'EXPERIENCE', color: '#ff6b00', bold: true },
                      { text: '↳ Led migration to microservices', color: '#94a3b8', bold: false },
                      { text: '   reduced deploy time 40%', color: '#64748b', bold: false },
                      { text: '↳ Shipped component library', color: '#94a3b8', bold: false },
                      { text: '   used by 80+ engineers', color: '#64748b', bold: false },
                      { text: '', color: '', bold: false },
                      { text: 'SKILLS', color: '#ff6b00', bold: true },
                      { text: '↳ TypeScript · React · Node.js', color: '#94a3b8', bold: false },
                    ].map((l, idx) => (
                      <div key={idx} className="text-[11px] font-mono mb-1" style={{ color: l.color || 'transparent', fontWeight: l.bold ? 700 : 400 }}>
                        {l.text || '\u200b'}
                      </div>
                    ))}
                    <div
                      className="mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold animate-pulse-accent"
                      style={{ background: 'rgba(255,107,0,0.15)', border: '1px solid rgba(255,107,0,0.25)', color: '#ff9a44' }}
                    >
                      ✦ Strengthen · Shorten · Fix
                    </div>
                  </div>

                  {/* Preview panel — cycles templates */}
                  <div className="flex-1 bg-white p-4 flex items-center justify-center relative overflow-hidden">
                    <div
                      className="w-full max-w-[220px]"
                      key={activeHeroTemplate}
                      style={{ animation: 'fadeIn 0.5s ease-out both' }}
                    >
                      <div className="text-white text-sm font-bold px-3 py-1.5 mb-2 rounded-lg" style={{ background: currentHeroTemplate.color }}>
                        Alex Johnson
                      </div>
                      <div className="text-[#475569] text-[11px] mb-3 font-medium">Senior Engineer · alex@dev.io</div>
                      <div className="pl-3 mb-3" style={{ borderLeft: `2px solid ${currentHeroTemplate.color}` }}>
                        <div className="text-[9px] font-extrabold uppercase tracking-widest mb-1" style={{ color: currentHeroTemplate.color }}>Experience</div>
                        <div className="text-[11px] text-[#0f172a] font-semibold">Acme Corp</div>
                        <div className="text-[9px] text-[#94a3b8] mb-1">2021 – Present</div>
                        <div className="text-[10px] text-[#475569]">• Led migration to microservices, reducing deploy time by 40%</div>
                        <div className="text-[10px] text-[#475569]">• Built component library used by 80+ engineers</div>
                      </div>
                      <div className="pl-3" style={{ borderLeft: `2px solid ${currentHeroTemplate.color}` }}>
                        <div className="text-[9px] font-extrabold uppercase tracking-widest mb-1" style={{ color: currentHeroTemplate.color }}>Skills</div>
                        <div className="text-[10px] text-[#475569]">TypeScript · React · Node.js · AWS</div>
                      </div>
                    </div>

                    {/* Template name chip */}
                    <div
                      className="absolute bottom-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: `${currentHeroTemplate.color}18`, color: currentHeroTemplate.color }}
                    >
                      {currentHeroTemplate.name}
                    </div>

                    {/* Template dots */}
                    <div className="absolute bottom-3 left-3 flex gap-1.5">
                      {HERO_CYCLE_TEMPLATES.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveHeroTemplate(i)}
                          className="rounded-full transition-all"
                          style={{
                            width: i === activeHeroTemplate ? 16 : 6,
                            height: 6,
                            background: i === activeHeroTemplate ? currentHeroTemplate.color : '#e2e8f0',
                          }}
                          aria-label={`Template ${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          Scrolling Ticker
      ═══════════════════════════════════════ */}
      <div className="py-3.5 border-y border-[#e2e8f0] overflow-hidden bg-[#fafafa]" aria-hidden>
        <div className="flex overflow-hidden">
          {/* Duplicate content so ticker appears seamless */}
          <div className="ticker-track">
            {[...SKILLS_TICKER, ...SKILLS_TICKER].map((item, i) => (
              <span key={i} className="ticker-item">
                <span style={{ color: '#ff6b00' }}>✦</span>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          Stats
      ═══════════════════════════════════════ */}
      <section className="py-12 px-4 sm:px-6 bg-white border-b border-[#e2e8f0]">
        <div ref={addRevealRef} className="reveal max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { number: '50K+',  label: 'Resumes Created' },
            { number: '18',    label: 'Templates (ATS + Creative)' },
            { number: '100%',  label: 'Browser-Based' },
            { number: 'Free',  label: 'Forever & Always' },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-number">{s.number}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          Features
      ═══════════════════════════════════════ */}
      <section id="features" className="py-20 px-4 sm:px-6 bg-[#fafafa] border-b border-[#e2e8f0]">
        <div className="max-w-6xl mx-auto">
          <div ref={addRevealRef} className="reveal text-center mb-14">
            <div className="section-tag">Why Rambo</div>
            <h2 className="font-black text-[#0f172a] mb-4 mt-2" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontFamily: "'Outfit',sans-serif" }}>
              Everything you need to{' '}
              <span className="gradient-text">land the job.</span>
            </h2>
            <p className="text-[#475569] text-lg max-w-xl mx-auto">
              Professional-grade resume tools in a simple, fast, privacy-first browser experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
            {FEATURES.map((f) => (
              <div key={f.title} ref={addRevealRef} className="reveal bg-white rounded-2xl p-6 border border-[#e2e8f0] card-hover">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold mb-4" style={{ background: `${f.color}15`, color: f.color }}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-[#0f172a] mb-2">{f.title}</h3>
                <p className="text-[#94a3b8] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          Match My Design spotlight
      ═══════════════════════════════════════ */}
      <section id="match-design" className="py-20 px-4 sm:px-6 bg-white border-b border-[#e2e8f0]">
        <div className="max-w-5xl mx-auto">
          <div ref={addRevealRef} className="reveal text-center mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full mb-5" style={{ background: '#f3e8ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}>
              ✦ UNIQUE FEATURE
            </div>
            <h2 className="font-black text-[#0f172a] mb-4" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontFamily: "'Outfit',sans-serif" }}>
              Like someone&apos;s resume?{' '}
              <span style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Match it.</span>
            </h2>
            <p className="text-[#475569] text-lg max-w-xl mx-auto leading-relaxed">
              Upload any resume image. Rambo extracts the layout, color palette, and typography — then recreates the style around your own content.
            </p>
          </div>

          <div ref={addRevealRef} className="reveal grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
            {[
              { step: '01', icon: '📸', title: 'Upload the Image',   desc: 'Drop any resume screenshot, PDF, or photo. PNG, JPG, or PDF all work.' },
              { step: '02', icon: '🎨', title: 'We Extract the Style', desc: 'OCR reads text, color analysis grabs the palette, layout is detected automatically.' },
              { step: '03', icon: '✏️', title: 'Edit & Export',      desc: 'Your content appears in the matching style, ready to customize and download as PDF.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="relative rounded-2xl p-6 text-center card-hover" style={{ background: '#fafafa', border: '1px solid #e2e8f0' }}>
                <div className="text-xs font-black tracking-widest mb-3" style={{ color: '#a78bfa' }}>{step}</div>
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-bold text-[#0f172a] mb-2">{title}</h3>
                <p className="text-sm text-[#64748b] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push('/design')}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-white font-bold text-base transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)', boxShadow: '0 12px 36px rgba(99,102,241,0.30)' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
            >
              <span className="text-xl">🖼</span> Try Match My Design — Free
            </button>
            <p className="mt-3 text-xs text-[#94a3b8]">No signup · Works with any resume image</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          How It Works
      ═══════════════════════════════════════ */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-[#0f172a]">
        <div className="max-w-5xl mx-auto">
          <div ref={addRevealRef} className="reveal text-center mb-14">
            <div className="section-tag" style={{ background: 'rgba(255,107,0,0.12)', borderColor: 'rgba(255,107,0,0.25)', color: '#ff9a44' }}>
              Simple Process
            </div>
            <h2 className="font-black text-white mb-3 mt-2" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontFamily: "'Outfit',sans-serif" }}>
              Ready in <span className="gradient-text">3 steps.</span>
            </h2>
            <p className="text-[#64748b] text-lg">No tutorials. No learning curve. Just results.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
            {/* Connector line — desktop only */}
            <div className="hidden sm:block absolute top-8 left-[20%] right-[20%] h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(255,107,0,0.2),transparent)' }} />
            {[
              { step: '01', emoji: '⌨️', title: 'Enter Your Details', desc: 'Paste your existing resume text, or type from scratch. The editor is intuitive and instant.' },
              { step: '02', emoji: '✦',  title: 'AI Optimizes It',    desc: 'Select any bullet and watch the AI rewrite it to be sharper, stronger, and more impactful.' },
              { step: '03', emoji: '⤓',  title: 'Download & Apply',   desc: 'Export a pixel-perfect A4 PDF or share a live link. Submit to any job, anywhere, immediately.' },
            ].map((s, i) => (
              <div key={s.step} ref={addRevealRef} className="reveal text-center relative z-10" style={{ transitionDelay: `${i * 120}ms` }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-5 mx-auto" style={{ background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.2)', color: '#ff6b00' }}>
                  {s.emoji}
                </div>
                <div className="text-[#ff6b00] text-2xl font-black mb-2 opacity-30 font-mono">{s.step}</div>
                <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-[#64748b] text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div ref={addRevealRef} className="reveal text-center mt-14">
            <Button
              variant="primary" size="lg"
              onClick={() => router.push('/build')}
              id="steps-cta-btn"
              style={{ boxShadow: '0 10px 32px rgba(255,107,0,0.30)', fontSize: '15px', padding: '14px 36px' } as React.CSSProperties}
            >
              Start Building — It&apos;s Free
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          Template Showcase
      ═══════════════════════════════════════ */}
      <section id="templates" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div ref={addRevealRef} className="reveal text-center mb-10">
            <div className="section-tag">Template Gallery</div>
            <h2 className="font-black text-[#0f172a] mb-4 mt-2" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontFamily: "'Outfit',sans-serif" }}>
              18 templates.{' '}
              <span className="gradient-text">All ATS-tested.</span>
            </h2>
            <p className="text-[#94a3b8] text-base mb-7">
              Every template is tested against leading ATS platforms. Choose your style with confidence.
            </p>

            {/* Tabs */}
            <div className="inline-flex items-center bg-[#f4f4f5] rounded-xl p-1 gap-1">
              {(['ATS', 'Creative'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200"
                  style={{
                    background: activeTab === tab ? 'white' : 'transparent',
                    color: activeTab === tab ? '#0f172a' : '#94a3b8',
                    boxShadow: activeTab === tab ? '0 2px 8px rgba(15,23,42,0.08)' : 'none',
                  }}
                >
                  {tab === 'ATS' ? '📋 ATS-Friendly' : '🎨 Creative'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredTemplates.map((t, i) => (
              <button
                key={t.name}
                onMouseEnter={() => setHoveredTemplate(i)}
                onMouseLeave={() => setHoveredTemplate(null)}
                onClick={() => router.push('/build')}
                className="group text-left rounded-2xl border border-[#e2e8f0] overflow-hidden transition-all duration-200 hover:shadow-[0_10px_32px_rgba(255,107,0,0.12)] hover:border-[#ffd4b0] focus:outline-none focus:ring-2 focus:ring-[#ff6b00] focus:ring-offset-2"
              >
                {/* Color preview */}
                <div className="h-36 sm:h-44 flex items-center justify-center relative overflow-hidden" style={{ background: `${t.color}10` }}>
                  <div
                    className="w-24 h-[115px] rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105 overflow-hidden"
                    style={{ background: 'white', border: `2px solid ${t.color}` }}
                  >
                    <div style={{ background: t.color, height: 26, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                      <div style={{ background: 'rgba(255,255,255,0.9)', height: 5, width: '60%', borderRadius: 3 }} />
                    </div>
                    <div style={{ padding: '6px 8px' }}>
                      {[80, 55, 70, 45, 62, 50].map((w, j) => (
                        <div key={j} style={{ background: j === 0 ? `${t.color}40` : `${t.color}20`, height: j === 0 ? 5 : 4, margin: '4px 0', borderRadius: 2, width: `${w}%` }} />
                      ))}
                    </div>
                  </div>
                  {hoveredTemplate === i && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 animate-fade-in">
                      <span className="text-white text-xs font-bold bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">Use This →</span>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-white">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="text-xs sm:text-sm font-bold text-[#0f172a]">{t.name}</div>
                    <div className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${t.color}12`, color: t.color }}>{t.tag}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div ref={addRevealRef} className="reveal text-center mt-10">
            <Button variant="primary" size="lg" onClick={() => router.push('/build')} id="template-cta-btn"
              style={{ boxShadow: '0 10px 28px rgba(255,107,0,0.22)' } as React.CSSProperties}>
              Build My Resume →
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          Who It's For
      ═══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 bg-[#fafafa] border-y border-[#e2e8f0]">
        <div className="max-w-6xl mx-auto">
          <div ref={addRevealRef} className="reveal text-center mb-12">
            <div className="section-tag">Who It&apos;s For</div>
            <h2 className="font-black text-[#0f172a] mb-3 mt-2" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontFamily: "'Outfit',sans-serif" }}>
              Built for every <span className="gradient-text">job seeker.</span>
            </h2>
            <p className="text-[#94a3b8] text-base">
              Whether you&apos;re just starting or pivoting careers, Rambo meets you where you are.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PERSONAS.map((p, i) => (
              <div key={p.title} ref={addRevealRef} className="reveal persona-card" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="text-4xl mb-4">{p.icon}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3 inline-block" style={{ background: '#fff3e8', color: '#ff6b00', border: '1px solid #ffd4b0' }}>
                  {p.tag}
                </div>
                <h3 className="font-black text-[#0f172a] text-base mb-2" style={{ fontFamily: "'Outfit',sans-serif" }}>{p.title}</h3>
                <p className="text-[#94a3b8] text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          Power Features
      ═══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 bg-[#0f172a]">
        <div className="max-w-6xl mx-auto">
          <div ref={addRevealRef} className="reveal text-center mb-14">
            <div className="section-tag" style={{ background: 'rgba(255,107,0,0.12)', borderColor: 'rgba(255,107,0,0.25)', color: '#ff9a44' }}>
              Power Features
            </div>
            <h2 className="font-black text-white mb-3 mt-2" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontFamily: "'Outfit',sans-serif" }}>
              A resume builder that actually <span className="gradient-text">thinks.</span>
            </h2>
            <p className="text-[#64748b] text-lg max-w-xl mx-auto">
              Advanced capabilities that set Rambo apart from every generic builder out there.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {POWER_FEATURES.map((f, i) => (
              <div key={f.title} ref={addRevealRef} className="reveal feature-card-dark p-6" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-white font-bold mb-2">{f.title}</h3>
                <p className="text-[#64748b] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          Testimonials
      ═══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 bg-white border-b border-[#e2e8f0]">
        <div className="max-w-6xl mx-auto">
          <div ref={addRevealRef} className="reveal text-center mb-12">
            <div className="section-tag">Social Proof</div>
            <h2 className="font-black text-[#0f172a] mb-3 mt-2" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontFamily: "'Outfit',sans-serif" }}>
              Trusted by job seekers <span className="gradient-text">worldwide.</span>
            </h2>
            <p className="text-[#94a3b8] text-base">
              Don&apos;t take our word for it — here&apos;s what people are saying.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} ref={addRevealRef} className="reveal testimonial-card" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, idx) => (
                    <span key={idx} className="text-[#ff6b00] text-base">★</span>
                  ))}
                </div>
                <p className="text-[#475569] text-sm leading-relaxed mb-6 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#ff6b00,#ff9a44)' }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-[#0f172a] text-sm">{t.name}</div>
                    <div className="text-[#94a3b8] text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FAQ
      ═══════════════════════════════════════ */}
      <section id="faq" className="py-20 px-4 sm:px-6 bg-[#fafafa] border-b border-[#e2e8f0]">
        <div className="max-w-3xl mx-auto">
          <div ref={addRevealRef} className="reveal text-center mb-12">
            <div className="section-tag">FAQ</div>
            <h2 className="font-black text-[#0f172a] mb-3 mt-2" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontFamily: "'Outfit',sans-serif" }}>
              Questions? We&apos;ve got <span className="gradient-text">answers.</span>
            </h2>
          </div>

          <div ref={addRevealRef} className="reveal">
            {FAQS.map((faq, i) => (
              <div key={i} className="faq-item">
                <button
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  id={`faq-q-${i}`}
                  aria-expanded={openFaq === i}
                >
                  <span>{faq.q}</span>
                  <span
                    className="text-[#ff6b00] text-xl flex-shrink-0"
                    style={{
                      display: 'inline-block',
                      transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)',
                      transition: 'transform 220ms ease',
                    }}
                  >
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div className="faq-answer animate-fade-up">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          Final CTA
      ═══════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)' }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 left-1/2 -translate-x-1/2"
            style={{ width: 600, height: 600, background: 'radial-gradient(ellipse,rgba(255,107,0,0.16) 0%,transparent 70%)', filter: 'blur(40px)' }} />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <div ref={addRevealRef} className="reveal">
            <div className="section-tag mx-auto mb-5 w-fit" style={{ background: 'rgba(255,107,0,0.12)', borderColor: 'rgba(255,107,0,0.25)', color: '#ff9a44' }}>
              Get Started Today
            </div>
            <h2 className="font-black text-white mb-5 leading-tight" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontFamily: "'Outfit',sans-serif" }}>
              Your next interview is one{' '}
              <span className="gradient-text">resume away.</span>
            </h2>
            <p className="text-[#94a3b8] text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Join thousands of professionals who built interview-winning resumes with Rambo. Free, private, and ready in minutes.
            </p>
            <Button
              variant="primary" size="lg"
              onClick={() => router.push('/build')}
              id="final-cta-btn"
              style={{ fontSize: '17px', padding: '16px 44px', boxShadow: '0 16px 48px rgba(255,107,0,0.34)', borderRadius: 14 } as React.CSSProperties}
            >
              ⚡ Build My Resume — Free
            </Button>
            <p className="mt-5 text-[#64748b] text-xs font-medium">
              No signup required · No data collected · Export PDF in seconds
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          Footer
      ═══════════════════════════════════════ */}
      <footer className="bg-[#0f172a] border-t py-10 px-4 sm:px-6" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="text-center md:text-left">
              <span className="text-white font-extrabold text-xl">Ram<span className="text-[#ff6b00]">bo</span></span>
              <p className="text-[#475569] text-xs mt-1">Open-source · Privacy-first · Your browser, your data.</p>
            </div>
            <div className="flex flex-wrap gap-4 text-[13px] text-[#64748b] justify-center">
              {[
                { label: 'Builder',       href: '/build' },
                { label: 'Match Design',  href: '/design' },
                { label: 'Features',      href: '#features' },
                { label: 'Templates',     href: '#templates' },
                { label: 'How It Works',  href: '#how-it-works' },
                { label: 'FAQ',           href: '#faq' },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={(e) => { if (l.href.startsWith('/')) { e.preventDefault(); router.push(l.href); } }}
                  className="hover:text-[#ff6b00] transition-colors font-medium"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>
          <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#475569]" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <span>© {new Date().getFullYear()} Rambo. Built with ❤️ for job seekers everywhere.</span>
            <span>No data is collected or stored.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
