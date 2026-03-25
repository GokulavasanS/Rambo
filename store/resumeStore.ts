// ============================================================
// store/resumeStore.ts — Global Zustand state for Rambo
// ============================================================

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { ResumeData, ResumeTheme, StoredResume, ThemePalette } from '@/types';
import { saveResume, listResumes, deleteResume, renameResume, duplicateResume, loadResume } from '@/lib/storage';
import { getPlaceholderResumeData } from '@/lib/parsing';
import { getThemeById, DEFAULT_THEME_ID } from '@/lib/theme';

const MAX_HISTORY = 50;

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
    jobDescription: string;

    // Undo/redo history
    history: ResumeData[];
    historyIndex: number;

    // Actions: resume data
    setResumeData: (data: ResumeData) => void;
    setCurrentTheme: (theme: ResumeTheme) => void;
    updateThemePalette: (key: keyof ThemePalette, value: string) => void;
    updateThemeProperty: <K extends keyof ResumeTheme>(key: K, value: ResumeTheme[K]) => void;
    setResumeName: (name: string) => void;
    setRawText: (text: string) => void;
    setActiveFlow: (flow: 'none' | 'fast-clean' | 'match-design') => void;
    setJobDescription: (jd: string) => void;

    // Undo / redo
    undo: () => void;
    redo: () => void;

    // Section reorder
    reorderSections: (fromIndex: number, toIndex: number) => void;

    // Actions: persistence
    saveCurrentResume: () => void;
    loadResumeById: (id: string) => void;
    getResumeById: (id: string) => StoredResume | null;
    deleteResumeById: (id: string) => void;
    renameResumeById: (id: string, name: string) => void;
    duplicateResumeById: (id: string) => void;
    refreshStoredResumes: () => void;

    // Actions: UI state
    setIsParsingText: (v: boolean) => void;
    setIsOCRProcessing: (v: boolean) => void;
}

export const useResumeStore = create<ResumeStore>()(
    subscribeWithSelector((set, get) => {
        const initialData = getPlaceholderResumeData();

        return {
            resumeData: initialData,
            currentTheme: getThemeById(DEFAULT_THEME_ID),
            resumeName: 'My Resume',
            storedResumes: [],
            rawText: '',
            activeFlow: 'none',
            isParsingText: false,
            isOCRProcessing: false,
            isSaving: false,
            jobDescription: '',

            // History starts with the initial data
            history: [initialData],
            historyIndex: 0,

            // ---- Data Actions ----

            setResumeData: (data) => {
                const { history, historyIndex } = get();
                // Slice off any future history when a new change comes in
                const newHistory = [...history.slice(0, historyIndex + 1), data].slice(-MAX_HISTORY);
                set({ resumeData: data, history: newHistory, historyIndex: newHistory.length - 1 });
            },

            setCurrentTheme: (theme) => set({ currentTheme: theme }),

            updateThemePalette: (key, value) => {
                const { currentTheme } = get();
                set({ currentTheme: { ...currentTheme, palette: { ...currentTheme.palette, [key]: value } } });
            },

            updateThemeProperty: (key, value) => {
                const { currentTheme } = get();
                set({ currentTheme: { ...currentTheme, [key]: value } });
            },

            setResumeName: (name) => set({ resumeName: name }),

            setRawText: (text) => set({ rawText: text }),

            setActiveFlow: (flow) => set({ activeFlow: flow }),

            setJobDescription: (jd) => set({ jobDescription: jd }),

            // ---- Undo / Redo ----

            undo: () => {
                const { history, historyIndex } = get();
                if (historyIndex <= 0) return;
                const newIndex = historyIndex - 1;
                set({ resumeData: history[newIndex], historyIndex: newIndex });
            },

            redo: () => {
                const { history, historyIndex } = get();
                if (historyIndex >= history.length - 1) return;
                const newIndex = historyIndex + 1;
                set({ resumeData: history[newIndex], historyIndex: newIndex });
            },

            // ---- Section Reorder ----

            reorderSections: (fromIndex, toIndex) => {
                const { resumeData } = get();
                const sections = [...resumeData.sections];
                const [moved] = sections.splice(fromIndex, 1);
                sections.splice(toIndex, 0, moved);
                get().setResumeData({ ...resumeData, sections });
            },

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
                const data = stored.data;
                const newHistory = [data];
                set({
                    resumeData: data,
                    currentTheme: theme,
                    resumeName: stored.name,
                    activeFlow: 'fast-clean',
                    history: newHistory,
                    historyIndex: 0,
                });
            },

            getResumeById: (id) => loadResume(id),

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

            setIsParsingText: (v) => set({ isParsingText: v }),

            setIsOCRProcessing: (v) => set({ isOCRProcessing: v }),
        };
    })
);
