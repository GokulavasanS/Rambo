// ============================================================
// store/resumeStore.ts — Global Zustand state for Rambo
// ============================================================

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { ResumeData, ResumeTheme, StoredResume } from '@/types';
import { saveResume, listResumes, deleteResume, renameResume, duplicateResume, loadResume } from '@/lib/storage';
import { getPlaceholderResumeData } from '@/lib/parsing';
import { getThemeById, BUILTIN_THEMES, DEFAULT_THEME_ID } from '@/lib/theme';

interface ResumeStore {
    // Current active resume
    resumeData: ResumeData;
    currentTheme: ResumeTheme;
    resumeName: string;

    // All stored resumes
    storedResumes: StoredResume[];

    // UI state
    rawText: string;
    activeFlow: 'none' | 'fast-clean' | 'match-design';
    isParsingText: boolean;
    isOCRProcessing: boolean;
    isSaving: boolean;

    // Actions: resume data
    setResumeData: (data: ResumeData) => void;
    setCurrentTheme: (theme: ResumeTheme) => void;
    setResumeName: (name: string) => void;
    setRawText: (text: string) => void;
    setActiveFlow: (flow: 'none' | 'fast-clean' | 'match-design') => void;

    // Actions: persistence
    saveCurrentResume: () => void;
    loadResumeById: (id: string) => void;
    deleteResumeById: (id: string) => void;
    renameResumeById: (id: string, name: string) => void;
    duplicateResumeById: (id: string) => void;
    refreshStoredResumes: () => void;

    // Actions: UI state
    setIsParsingText: (v: boolean) => void;
    setIsOCRProcessing: (v: boolean) => void;
}

export const useResumeStore = create<ResumeStore>()(
    subscribeWithSelector((set, get) => ({
        resumeData: getPlaceholderResumeData(),
        currentTheme: getThemeById(DEFAULT_THEME_ID),
        resumeName: 'My Resume',
        storedResumes: [],
        rawText: '',
        activeFlow: 'none',
        isParsingText: false,
        isOCRProcessing: false,
        isSaving: false,

        // ---- Data Actions ----

        setResumeData: (data) => set({ resumeData: data }),

        setCurrentTheme: (theme) => set({ currentTheme: theme }),

        setResumeName: (name) => set({ resumeName: name }),

        setRawText: (text) => set({ rawText: text }),

        setActiveFlow: (flow) => set({ activeFlow: flow }),

        setIsParsingText: (v) => set({ isParsingText: v }),

        setIsOCRProcessing: (v) => set({ isOCRProcessing: v }),

        // ---- Persistence Actions ----

        saveCurrentResume: () => {
            const { resumeData, currentTheme, resumeName } = get();
            set({ isSaving: true });
            try {
                saveResume(resumeData, currentTheme.id, resumeName);
                set({ storedResumes: listResumes() });
            } finally {
                set({ isSaving: false });
            }
        },

        loadResumeById: (id) => {
            const stored = loadResume(id);
            if (!stored) return;
            const theme = getThemeById(stored.themeId);
            set({
                resumeData: stored.data,
                currentTheme: theme,
                resumeName: stored.name,
                activeFlow: 'fast-clean',
            });
        },

        deleteResumeById: (id) => {
            deleteResume(id);
            set({ storedResumes: listResumes() });
        },

        renameResumeById: (id, name) => {
            renameResume(id, name);
            set({ storedResumes: listResumes() });
        },

        duplicateResumeById: (id) => {
            duplicateResume(id);
            set({ storedResumes: listResumes() });
        },

        refreshStoredResumes: () => {
            set({ storedResumes: listResumes() });
        },
    }))
);
