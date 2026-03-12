// ============================================================
// lib/parsing/index.ts — Resume text parser
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import type { ResumeData, ResumeSection, ResumeBullet, ResumeEntry, ResumeSectionType } from '@/types';

// --- Section keyword detection ---

const SECTION_KEYWORDS: Record<ResumeSectionType, string[]> = {
    summary: ['summary', 'profile', 'objective', 'about', 'overview', 'professional summary'],
    experience: ['experience', 'work experience', 'employment', 'work history', 'career', 'positions'],
    projects: ['projects', 'personal projects', 'side projects', 'portfolio', 'work samples'],
    education: ['education', 'academic', 'qualifications', 'degrees', 'university', 'college'],
    skills: ['skills', 'technical skills', 'competencies', 'technologies', 'tools', 'expertise', 'proficiencies'],
    certifications: ['certifications', 'certificates', 'licenses', 'awards', 'achievements', 'honors'],
    other: ['languages', 'interests', 'hobbies', 'volunteer', 'publications', 'references'],
};

function detectSectionType(heading: string): ResumeSectionType {
    const lower = heading.toLowerCase().trim();
    for (const [type, keywords] of Object.entries(SECTION_KEYWORDS)) {
        if (keywords.some((kw) => lower.includes(kw))) {
            return type as ResumeSectionType;
        }
    }
    return 'other';
}

function isHeading(line: string): boolean {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length > 80) return false;
    if (trimmed.endsWith(':') && trimmed.length < 50) return true;
    const wordCount = trimmed.split(/\s+/).length;
    if (wordCount <= 5 && trimmed === trimmed.toUpperCase() && trimmed.length > 3) return true;
    if (/^(summary|experience|education|skills|projects|certifications|awards?|languages?|interests?|volunteer|publications?|references?)/i.test(trimmed)) return true;
    return false;
}

function extractContactInfo(text: string) {
    const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.]{2,}/);
    const phoneMatch = text.match(/(\+?[\d][\d\s\-().]{6,18}[\d])/);
    const linkedinMatch = text.match(/linkedin\.com\/in\/([\w-]+)/i);
    const githubMatch = text.match(/github\.com\/([\w-]+)/i);
    const websiteMatch = text.match(/https?:\/\/(?!linkedin|github)([\w.-]+\.[\w]{2,})/i);

    return {
        email: emailMatch?.[0] ?? '',
        phone: phoneMatch?.[0]?.trim() ?? '',
        linkedin: linkedinMatch ? `linkedin.com/in/${linkedinMatch[1]}` : '',
        github: githubMatch ? `github.com/${githubMatch[1]}` : '',
        website: websiteMatch?.[0] ?? '',
        location: '',
    };
}

function extractName(lines: string[]): string {
    for (const line of lines.slice(0, 6)) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (/[@\d()\-+]/.test(trimmed)) continue;
        if (trimmed.length < 3 || trimmed.length > 50) continue;
        if (/resume|curriculum|vitae|cv\b/i.test(trimmed)) continue;
        const words = trimmed.split(/\s+/);
        if (words.length >= 1 && words.length <= 5) return trimmed;
    }
    return 'Your Name';
}

function extractTitle(lines: string[], nameIdx: number): string {
    for (let i = nameIdx + 1; i < Math.min(nameIdx + 4, lines.length); i++) {
        const line = lines[i].trim();
        if (!line) continue;
        if (/[@\d()+]/.test(line)) continue;
        if (line.length < 3 || line.length > 80) continue;
        if (isHeading(line)) break;
        if (/engineer|developer|designer|manager|analyst|scientist|consultant|director|lead|architect|specialist|coordinator/i.test(line)) {
            return line;
        }
    }
    return '';
}

/**
 * Parse raw resume text into structured ResumeData.
 */
export function parseResumeText(rawText: string): ResumeData {
    const lines = rawText.split('\n');
    const fullName = extractName(lines);
    const nameIdx = lines.findIndex((l) => l.trim() === fullName);
    const title = extractTitle(lines, nameIdx);
    const contact = extractContactInfo(rawText);

    // Split into sections
    const sectionBlocks: { heading: string; lines: string[] }[] = [];
    let currentHeading = 'intro';
    let currentLines: string[] = [];

    for (const line of lines) {
        if (isHeading(line)) {
            sectionBlocks.push({ heading: currentHeading, lines: currentLines });
            currentHeading = line.trim().replace(/:$/, '');
            currentLines = [];
        } else {
            currentLines.push(line);
        }
    }
    sectionBlocks.push({ heading: currentHeading, lines: currentLines });

    const sections: ResumeSection[] = [];

    for (const block of sectionBlocks) {
        if (block.heading === 'intro') continue;

        const type = detectSectionType(block.heading);
        const bullets: ResumeBullet[] = block.lines
            .map((l) => l.replace(/^[-•·*▸▹>→\s]+/, '').trim())
            .filter((l) => l.length > 2 && !isHeading(l))
            .map((text) => ({ id: uuidv4(), text }));

        if (bullets.length === 0) continue;

        // For experience / education / projects: try to parse entries
        if (['experience', 'education', 'projects'].includes(type)) {
            const entries = parseEntries(bullets);
            sections.push({
                id: uuidv4(),
                type,
                title: block.heading,
                entries: entries.length > 0 ? entries : undefined,
                bullets: entries.length === 0 ? bullets : undefined,
            });
        } else {
            sections.push({ id: uuidv4(), type, title: block.heading, bullets });
        }
    }

    return {
        id: uuidv4(),
        fullName,
        title,
        contact: {
            email: contact.email,
            phone: contact.phone,
            linkedin: contact.linkedin,
            github: contact.github,
            website: contact.website,
            location: contact.location,
        },
        sections: sections.length > 0 ? sections : getPlaceholderResumeData().sections,
        meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    };
}

/** Group flat bullets into ResumeEntry objects (organization + role + bullets) */
function parseEntries(bullets: ResumeBullet[]): ResumeEntry[] {
    const entries: ResumeEntry[] = [];
    let current: ResumeEntry | null = null;

    for (const b of bullets) {
        const datePattern = /(\d{4}|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b)/i;
        const isMeta = datePattern.test(b.text) && b.text.length < 80;
        const isHeader = /^[A-Z][^.!?]*[—–-]/.test(b.text) || (b.text.split(/\s+/).length <= 6 && !b.text.startsWith('•'));

        if (isHeader && !current) {
            const parts = b.text.split(/\s*[—–|-]\s*/);
            current = {
                id: uuidv4(),
                organization: parts[0]?.trim() ?? b.text,
                role: parts[1]?.trim() ?? '',
                period: parts[2]?.trim() ?? '',
                bullets: [],
            };
        } else if (isMeta && current && current.bullets.length === 0) {
            current.period = b.text;
        } else {
            if (!current) {
                current = { id: uuidv4(), organization: '', role: b.text, bullets: [] };
            }
            current.bullets.push(b);
        }

        // If we have a full entry, push it
        if (current && current.bullets.length >= 4) {
            entries.push(current);
            current = null;
        }
    }

    if (current) entries.push(current);
    return entries;
}

/**
 * Returns rich placeholder resume data for previews + new resumes.
 */
export function getPlaceholderResumeData(): ResumeData {
    return {
        id: uuidv4(),
        fullName: 'Alex Johnson',
        title: 'Senior Software Engineer',
        contact: {
            email: 'alex@example.com',
            phone: '+1 (555) 000-0000',
            location: 'San Francisco, CA',
            linkedin: 'linkedin.com/in/alexjohnson',
            github: 'github.com/alexj',
            website: '',
        },
        sections: [
            {
                id: uuidv4(),
                type: 'summary',
                title: 'Summary',
                bullets: [
                    {
                        id: uuidv4(),
                        text: 'Results-driven software engineer with 6+ years of experience building scalable web applications. Passionate about clean architecture, developer experience, and shipping high-quality products.',
                    },
                ],
            },
            {
                id: uuidv4(),
                type: 'experience',
                title: 'Experience',
                entries: [
                    {
                        id: uuidv4(),
                        organization: 'Acme Corp',
                        role: 'Software Engineer',
                        period: '2021 – Present',
                        location: 'San Francisco, CA',
                        bullets: [
                            { id: uuidv4(), text: 'Led migration of monolith to microservices, reducing deploy time by 40%.' },
                            { id: uuidv4(), text: 'Built React component library used across 4 product teams.' },
                            { id: uuidv4(), text: 'Mentored 3 junior engineers; introduced code review best practices.' },
                        ],
                    },
                    {
                        id: uuidv4(),
                        organization: 'Startup Inc',
                        role: 'Junior Developer',
                        period: '2018 – 2021',
                        location: 'Remote',
                        bullets: [
                            { id: uuidv4(), text: 'Developed REST APIs serving 2M daily requests with 99.9% uptime.' },
                            { id: uuidv4(), text: 'Implemented CI/CD pipeline using GitHub Actions and Docker.' },
                        ],
                    },
                ],
            },
            {
                id: uuidv4(),
                type: 'education',
                title: 'Education',
                entries: [
                    {
                        id: uuidv4(),
                        organization: 'State University',
                        role: 'B.S. Computer Science',
                        period: '2018',
                        location: '',
                        bullets: [
                            { id: uuidv4(), text: 'GPA: 3.8 / 4.0 · Dean\'s List' },
                        ],
                    },
                ],
            },
            {
                id: uuidv4(),
                type: 'skills',
                title: 'Skills',
                bullets: [
                    { id: uuidv4(), text: 'TypeScript · React · Node.js · PostgreSQL · Docker · AWS' },
                    { id: uuidv4(), text: 'System Design · Agile · CI/CD · GraphQL · Redis' },
                ],
            },
        ],
        meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    };
}
