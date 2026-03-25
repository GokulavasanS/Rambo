// ============================================================
// lib/ats/scorer.ts
// Client-side ATS heuristics engine to score resumes against JDs
// ============================================================

import type { ResumeData, ATSScore } from '@/types';

// Stop words to ignore when extracting keywords
const STOP_WORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 'into', 'is', 'it', 'no', 'not', 'of', 'on', 'or', 'such', 'that', 'the', 'their', 'then', 'there', 'these', 'they', 'this', 'to', 'was', 'will', 'with', 'you', 'your',
    'we', 'our', 'what', 'can', 'has', 'have', 'do', 'from', 'about', 'how', 'who', 'which', 'would', 'should', 'could'
]);

// Basic keyword extraction (simplified for client-side speed)
function extractKeywords(text: string): string[] {
    if (!text) return [];
    const words = text.toLowerCase()
        // Replace punctuation with spaces
        .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !STOP_WORDS.has(w));
    
    // Identify 2-word phrases (bigrams) that might be tech terms (e.g., "machine learning")
    const bigrams: string[] = [];
    for (let i = 0; i < words.length - 1; i++) {
        bigrams.push(`${words[i]} ${words[i + 1]}`);
    }
    
    // Deduplicate
    return Array.from(new Set([...words, ...bigrams]));
}

// Extract all text from the resume object
function extractResumeText(data: ResumeData): string {
    const parts = [
        data.fullName,
        data.title,
        data.contact?.email,
        data.contact?.phone,
        data.contact?.location,
        data.contact?.linkedin,
    ];

    data.sections.forEach(s => {
        parts.push(s.title);
        s.bullets?.forEach(b => parts.push(b.text));
        s.entries?.forEach(e => {
            parts.push(e.organization, e.role, e.location, e.period);
            e.bullets.forEach(b => parts.push(b.text));
        });
    });

    return parts.filter(Boolean).join(' ');
}

// Main Scoring Function
export function calculateATSScore(data: ResumeData, jobDescription: string): ATSScore {
    const suggestions: string[] = [];
    const missingSections: string[] = [];
    const matchedKeywords: string[] = [];
    
    // --------------------------------------------------------
    // 1. Completeness Check (Max 30 points)
    // --------------------------------------------------------
    let completenessScore = 30;
    
    // Contact Info (up to 10 pts)
    if (!data.contact?.email) { completenessScore -= 5; suggestions.push("Add an email address."); }
    if (!data.contact?.phone) { completenessScore -= 5; suggestions.push("Add a phone number."); }
    if (!data.contact?.linkedin) { completenessScore -= 2; suggestions.push("Adding a LinkedIn profile URL is highly recommended."); }
    
    // Core Sections (up to 20 pts)
    const hasExperience = data.sections.some(s => s.type === 'experience' && (s.entries?.length || 0) > 0);
    const hasEducation = data.sections.some(s => s.type === 'education' && (s.entries?.length || 0) > 0);
    const hasSkills = data.sections.some(s => s.type === 'skills' && (s.bullets?.length || 0) > 0);
    
    if (!hasExperience) { completenessScore -= 10; missingSections.push("Experience"); suggestions.push("Add your work experience."); }
    if (!hasEducation) { completenessScore -= 5; missingSections.push("Education"); suggestions.push("Add an education section."); }
    if (!hasSkills) { completenessScore -= 5; missingSections.push("Skills"); suggestions.push("Add a skills section for better keyword matching."); }

    // --------------------------------------------------------
    // 2. Formatting & Best Practices (Max 20 points)
    // --------------------------------------------------------
    let formattingScore = 20;
    
    let totalBullets = 0;
    let quantifiedBullets = 0;
    
    data.sections.forEach(s => {
        const allBullets = [...(s.bullets || []), ...(s.entries?.flatMap(e => e.bullets) || [])];
        totalBullets += allBullets.length;
        
        allBullets.forEach(b => {
            // Check for numbers, % or $ signs (quantification)
            if (/\d|%|\$|percent/.test(b.text)) {
                quantifiedBullets++;
            }
        });
    });

    if (totalBullets === 0 && hasExperience) {
        formattingScore -= 10;
        suggestions.push("Use bullet points to describe your experience instead of paragraphs.");
    } else if (totalBullets > 0) {
        const quantificationRatio = quantifiedBullets / totalBullets;
        if (quantificationRatio < 0.2) {
            formattingScore -= 10;
            suggestions.push("Quantify more achievements! Use numbers, metrics, or percentages in your bullet points.");
        } else if (quantificationRatio < 0.4) {
            formattingScore -= 5;
            suggestions.push("Good job using numbers, but try to quantify even more achievements.");
        }
    }

    // --------------------------------------------------------
    // 3. Keyword Match (Max 50 points)
    // Only calculated if a JD is provided
    // --------------------------------------------------------
    let keywordScore = 50;
    
    if (!jobDescription || jobDescription.trim().length === 0) {
        keywordScore = 50; // Give full points if no JD provided, but add suggestion
        suggestions.unshift("Paste a Job Description to get a personalized keyword match score.");
    } else {
        const resumeText = extractResumeText(data).toLowerCase();
        
        // Extract common Nouns/Tech Terms from JD
        // For a client side heuristic, we just extract longer words and check overlap.
        const jdKeywords = extractKeywords(jobDescription);
        
        // We only care about top keywords based on some frequency or length heuristic, 
        // but here we'll just check existence.
        let matchCount = 0;
        const totalImportantKeywords = Math.min(jdKeywords.length, 30); // Cap at 30 to prevent dilution
        
        if (totalImportantKeywords > 0) {
            // Sort by length assuming longer words are more specific (e.g. "kubernetes" vs "data")
            jdKeywords.sort((a,b) => b.length - a.length);
            const targetKeywords = jdKeywords.slice(0, totalImportantKeywords);
            
            targetKeywords.forEach(kw => {
                if (resumeText.includes(kw)) {
                    matchCount++;
                    matchedKeywords.push(kw);
                } else if (kw.length > 4 && jdKeywords.indexOf(kw) < 15) {
                    // Only push longer, top missed keywords as suggestions
                    missingSections.push(`Keyword: ${kw}`);
                }
            });

            const matchRatio = matchCount / totalImportantKeywords;
            keywordScore = Math.round(matchRatio * 50);
            
            if (matchRatio < 0.4) {
                suggestions.push("Your resume is missing many keywords from the job description. Try to organically include them in your skills and experience.");
            } else if (matchRatio < 0.7) {
                suggestions.push("Good keyword overlap, but you can still match a few more terms from the JD.");
            }
        }
    }

    // Ensure scores are bounded
    completenessScore = Math.max(0, completenessScore);
    formattingScore = Math.max(0, formattingScore);
    keywordScore = Math.max(0, keywordScore);

    const total = completenessScore + formattingScore + keywordScore;

    return {
        total,
        breakdown: {
            keywordMatch: keywordScore,
            formatting: formattingScore,
            completeness: completenessScore
        },
        suggestions,
        missingSections,
        matchedKeywords: matchedKeywords.slice(0, 15) // Limit matched keywords for UI
    };
}
