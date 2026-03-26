// ============================================================
// lib/storage/index.ts — Local-first resume storage abstraction
// ============================================================
//
// All resume data stays on the user's device.
// Uses localStorage for simplicity (v1). Can be swapped to
// IndexedDB for larger resumes in future versions.

import type { StoredResume, ResumeData, ResumeTheme } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'rambo:resumes';
const ACTIVE_KEY = 'rambo:active-resume-id';

// ---- Internal helpers ----

function readAll(): StoredResume[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as StoredResume[]) : [];
    } catch {
        return [];
    }
}

function writeAll(resumes: StoredResume[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
}

// ---- Public API ----

/**
 * List all stored resumes (metadata + data).
 */
export function listResumes(): StoredResume[] {
    return readAll();
}

/**
 * Load a single resume by ID.
 */
export function loadResume(id: string): StoredResume | null {
    return readAll().find((r) => r.id === id) ?? null;
}

/**
 * Save (create or update) a resume.
 */
export function saveResume(
    data: ResumeData,
    themeId: string,
    name?: string
): StoredResume {
    const all = readAll();
    const now = new Date().toISOString();
    const existing = all.find((r) => r.id === data.id);

    const stored: StoredResume = {
        id: data.id,
        name: name ?? existing?.name ?? data.fullName ?? 'Untitled Resume',
        data: { ...data, meta: { createdAt: existing?.data.meta?.createdAt ?? now, updatedAt: now } },
        themeId,
        updatedAt: now,
    };

    if (existing) {
        const updated = all.map((r) => (r.id === data.id ? stored : r));
        writeAll(updated);
    } else {
        writeAll([...all, stored]);
    }

    return stored;
}

/**
 * Rename a resume.
 */
export function renameResume(id: string, newName: string): void {
    const all = readAll();
    writeAll(all.map((r) => (r.id === id ? { ...r, name: newName } : r)));
}

/**
 * Duplicate a resume (creates a new ID).
 */
export function duplicateResume(id: string): StoredResume | null {
    const source = loadResume(id);
    if (!source) return null;

    const now = new Date().toISOString();
    const newResume: StoredResume = {
        ...source,
        id: uuidv4(),
        name: `${source.name} (Copy)`,
        data: {
            ...source.data,
            id: uuidv4(),
            meta: { createdAt: now, updatedAt: now },
        },
        updatedAt: now,
    };

    const all = readAll();
    writeAll([...all, newResume]);
    return newResume;
}

/**
 * Delete a resume by ID.
 */
export function deleteResume(id: string): void {
    writeAll(readAll().filter((r) => r.id !== id));
    // Clear active if it was this one
    if (getActiveResumeId() === id) {
        clearActiveResumeId();
    }
}

/**
 * Get the ID of the currently active resume.
 */
export function getActiveResumeId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACTIVE_KEY);
}

/**
 * Set the active resume ID.
 */
export function setActiveResumeId(id: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACTIVE_KEY, id);
}

/**
 * Clear the active resume ID.
 */
export function clearActiveResumeId(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACTIVE_KEY);
}
