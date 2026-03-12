// ============================================================
// hooks/useAutosave.ts — Debounced autosave hook
// ============================================================

import { useEffect, useRef } from 'react';
import { useResumeStore } from '@/store/resumeStore';

/**
 * Watches resume data changes and auto-saves to localStorage
 * after a debounce period.
 */
export function useAutosave(debounceMs = 2000) {
    const { resumeData, currentTheme, resumeName, saveCurrentResume } = useResumeStore();
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isInitialMount = useRef(true);

    useEffect(() => {
        // Skip saving on the very first render
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
            saveCurrentResume();
        }, debounceMs);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [resumeData, currentTheme, resumeName, debounceMs]);
}
