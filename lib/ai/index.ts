// ============================================================
// lib/ai/index.ts — AI abstraction layer (swappable provider)
// ============================================================
//
// This module is the single integration point for AI features.
// To swap providers, only this file needs updating.
//
// Current implementation: Google Gemini API (free tier)
// Fallback: deterministic mock for development / offline use

import type { AIRequest, AIResponse, AIActionType } from '@/types';

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
    custom: '', // Custom prompts are passed directly
};

/**
 * Build the full prompt string from an AIRequest.
 */
function buildPrompt(request: AIRequest): string {
    const { prompt, selectedText, context } = request;
    const { actionType, sectionType, roleTitle } = context;

    const systemContext = [
        'You are an expert resume writer helping improve resume content.',
        sectionType ? `The text is from the "${sectionType}" section.` : '',
        roleTitle ? `The target role is: ${roleTitle}.` : '',
    ]
        .filter(Boolean)
        .join(' ');

    const actionInstruction =
        actionType === 'custom' ? prompt : ACTION_PROMPTS[actionType];

    return `${systemContext}\n\n${actionInstruction}\n\nText to improve:\n"${selectedText}"`;
}

/**
 * Mock AI implementation — deterministic responses for dev/offline use.
 * Returns a slightly modified version of the selected text.
 */
async function mockAskAI(request: AIRequest): Promise<AIResponse> {
    await new Promise((r) => setTimeout(r, 800)); // Simulate network latency

    const { selectedText, context } = request;

    const transforms: Record<AIActionType, string> = {
        strengthen: `Drove ${selectedText.toLowerCase().replace(/^led |^built |^created /i, '')} resulting in measurable improvement across key performance indicators.`,
        shorten: selectedText.split(' ').slice(0, Math.ceil(selectedText.split(' ').length * 0.6)).join(' ') + '.',
        formalize: selectedText.charAt(0).toUpperCase() + selectedText.slice(1).replace(/\bi\b/g, 'I'),
        'fix-grammar': selectedText.trim().replace(/\s+/g, ' '),
        quantify: selectedText.replace(/(improved|increased|reduced|built|led)/i, '$1 by X%'),
        custom: `[AI Response] ${selectedText}`,
    };

    return {
        suggestion: transforms[context.actionType] ?? selectedText,
        actionType: context.actionType,
    };
}

/**
 * Gemini API implementation.
 * Uses the free Gemini 1.5 Flash model via REST API.
 */
async function geminiAskAI(request: AIRequest, apiKey: string): Promise<AIResponse> {
    const prompt = buildPrompt(request);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512,
        },
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

    return {
        suggestion,
        actionType: request.context.actionType,
    };
}

/**
 * Primary askAI function — selects provider based on environment.
 *
 * If NEXT_PUBLIC_GEMINI_API_KEY is set, uses Gemini.
 * Otherwise falls back to the deterministic mock.
 *
 * This function is always safe to call from client components.
 */
export async function askAI(request: AIRequest): Promise<AIResponse> {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey && apiKey.trim().length > 0) {
        try {
            return await geminiAskAI(request, apiKey);
        } catch (err) {
            console.warn('[Rambo AI] Gemini failed, falling back to mock:', err);
            return mockAskAI(request);
        }
    }

    return mockAskAI(request);
}

/**
 * Helper: build a pre-filled AIRequest for a given action type.
 */
export function buildAIRequest(
    selectedText: string,
    actionType: AIActionType,
    options: {
        sectionType?: import('@/types').ResumeSectionType;
        roleTitle?: string;
        customPrompt?: string;
    } = {}
): AIRequest {
    return {
        prompt: options.customPrompt ?? ACTION_PROMPTS[actionType],
        selectedText,
        context: {
            actionType,
            sectionType: options.sectionType,
            roleTitle: options.roleTitle,
        },
    };
}
