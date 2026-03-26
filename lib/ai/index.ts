// ============================================================
// lib/ai/index.ts — AI abstraction layer
// Provider priority: OpenRouter → Gemini → Mock
// ============================================================

import type { AIRequest, AIResponse, AIActionType, ResumeSectionType, ResumeData } from '@/types';

// ---- Prompt templates per action ----

const ACTION_PROMPTS: Record<AIActionType, string> = {
    strengthen:
        'Rewrite the following resume bullet point to be stronger, more impactful, and include quantifiable metrics where possible. Keep it concise and professional. Return only the improved text, nothing else.',
    shorten:
        'Shorten the following resume text while preserving its core impact and key information. Make it concise. Return only the shortened text, nothing else.',
    formalize:
        'Rewrite the following resume text in a more formal, professional tone suitable for a corporate resume. Return only the rewritten text, nothing else.',
    'fix-grammar':
        'Fix any grammar, punctuation, and spelling errors in the following resume text. Preserve the original meaning and style. Return only the corrected text, nothing else.',
    quantify:
        'Rewrite the following resume bullet point to include specific numbers, percentages, or metrics that demonstrate measurable impact. Return only the improved text, nothing else.',
    tailorToJob:
        'Rewrite the following resume bullet point to better match the provided job description by incorporating relevant keywords and aligning with the job requirements. Return only the improved text, nothing else.',
    generateSummary:
        'Write a compelling 2-3 sentence professional summary for a resume based on the provided resume content. It should highlight key skills, experience, and value proposition. Return only the summary text, nothing else.',
    custom: '', // Custom prompts are passed directly
};

/**
 * Build the full prompt string from an AIRequest.
 */
function buildPrompt(request: AIRequest): string {
    const { prompt, selectedText, context } = request;
    const { actionType, sectionType, roleTitle, jobDescription } = context;

    const systemContext = [
        'You are an expert resume writer helping improve resume content.',
        sectionType ? `The text is from the "${sectionType}" section.` : '',
        roleTitle ? `The target role is: ${roleTitle}.` : '',
        jobDescription ? `Job Description context: ${jobDescription.slice(0, 600)}` : '',
    ]
        .filter(Boolean)
        .join(' ');

    const actionInstruction =
        actionType === 'custom' ? prompt : ACTION_PROMPTS[actionType];

    return `${systemContext}\n\n${actionInstruction}\n\nText to improve:\n"${selectedText}"`;
}

// ============================================================
// Provider: OpenRouter
// ============================================================

async function openRouterAskAI(request: AIRequest, apiKey: string): Promise<AIResponse> {
    const prompt = buildPrompt(request);

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://rambo.ai',
            'X-Title': 'Rambo AI Resume Builder',
        },
        body: JSON.stringify({
            model: process.env.NEXT_PUBLIC_OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert resume writer. Return only the improved text, no explanations or preamble.',
                },
                { role: 'user', content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 512,
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`OpenRouter error: ${res.status} — ${JSON.stringify(err)}`);
    }

    const data = await res.json();
    const suggestion: string =
        data?.choices?.[0]?.message?.content?.trim() ?? request.selectedText;

    return { suggestion, actionType: request.context.actionType };
}

// ============================================================
// Provider: Gemini
// ============================================================

async function geminiAskAI(request: AIRequest, apiKey: string): Promise<AIResponse> {
    const prompt = buildPrompt(request);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`Gemini API error: ${res.status} — ${JSON.stringify(err)}`);
    }

    const data = await res.json();
    const suggestion: string =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? request.selectedText;

    return { suggestion, actionType: request.context.actionType };
}

// ============================================================
// Provider: Mock (offline/dev fallback)
// ============================================================

async function mockAskAI(request: AIRequest): Promise<AIResponse> {
    await new Promise((r) => setTimeout(r, 700));

    const { selectedText, context } = request;

    const transforms: Partial<Record<AIActionType, string>> = {
        strengthen: `Drove ${selectedText.toLowerCase().replace(/^led |^built |^created /i, '')} resulting in measurable improvement across key performance indicators, exceeding targets by 25%.`,
        shorten: selectedText.split(' ').slice(0, Math.ceil(selectedText.split(' ').length * 0.6)).join(' ') + '.',
        formalize: selectedText.charAt(0).toUpperCase() + selectedText.slice(1).replace(/\bi\b/g, 'I'),
        'fix-grammar': selectedText.trim().replace(/\s+/g, ' '),
        quantify: selectedText.replace(/(improved|increased|reduced|built|led)/i, '$1 by 30%'),
        tailorToJob: `[Tailored] ${selectedText} — aligned with job requirements and key skills from the job description.`,
        generateSummary: 'Results-driven professional with 5+ years of expertise delivering high-impact solutions in fast-paced environments. Proven track record of collaborating cross-functionally to drive business outcomes, exceed KPIs, and lead transformative initiatives.',
        custom: `[AI Response] ${selectedText}`,
    };

    return {
        suggestion: transforms[context.actionType] ?? selectedText,
        actionType: context.actionType,
    };
}

// ============================================================
// Primary askAI — provider selection with fallback chain
// ============================================================

export async function askAI(request: AIRequest): Promise<AIResponse> {
    const openRouterKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    // 1. Try OpenRouter (primary)
    if (openRouterKey?.trim()) {
        try {
            return await openRouterAskAI(request, openRouterKey);
        } catch (err) {
            console.warn('[Rambo AI] OpenRouter failed, trying Gemini:', err);
        }
    }

    // 2. Try Gemini (secondary)
    if (geminiKey?.trim()) {
        try {
            return await geminiAskAI(request, geminiKey);
        } catch (err) {
            console.warn('[Rambo AI] Gemini failed, using mock:', err);
        }
    }

    // 3. Mock fallback
    return mockAskAI(request);
}

/**
 * Helper: build a pre-filled AIRequest for a given action type.
 */
export function buildAIRequest(
    selectedText: string,
    actionType: AIActionType,
    options: {
        sectionType?: ResumeSectionType;
        roleTitle?: string;
        customPrompt?: string;
        jobDescription?: string;
        resumeData?: ResumeData;
    } = {}
): AIRequest {
    const selectedOrSummary =
        actionType === 'generateSummary' && options.resumeData
            ? `Resume sections: ${options.resumeData.sections.map((s) => s.title).join(', ')}. Name: ${options.resumeData.fullName}. Title: ${options.resumeData.title || ''}`.trim()
            : selectedText;

    return {
        prompt: options.customPrompt ?? (actionType === 'custom' ? '' : ACTION_PROMPTS[actionType]),
        selectedText: selectedOrSummary,
        context: {
            actionType,
            sectionType: options.sectionType,
            roleTitle: options.roleTitle,
            jobDescription: options.jobDescription,
            customPrompt: options.customPrompt,
        },
    };
}
