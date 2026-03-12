// ============================================================
// lib/ocr/index.ts — OCR extraction using Tesseract.js
// ============================================================
//
// Supports: image files (PNG, JPG, WEBP) and PDFs.
// For PDFs, we use the browser's built-in PDF rendering via
// a canvas element to rasterize each page before OCR.
//
// All processing happens client-side — no server roundtrip.

import type { OCRResult } from '@/types';

/**
 * Extract text from an image File using Tesseract.js.
 */
async function extractFromImage(file: File): Promise<OCRResult> {
    // Dynamic import to avoid SSR issues
    const Tesseract = await import('tesseract.js');
    const { data } = await Tesseract.recognize(file, 'eng', {
        // Suppress Tesseract's console logging in production
        logger: process.env.NODE_ENV === 'development' ? (m: unknown) => console.log(m) : undefined,
    });
    return {
        text: data.text,
        confidence: data.confidence,
    };
}

/**
 * Rasterize a PDF page to a canvas and return as Blob.
 * Uses the browser's pdf.js-compatible rendering (via URL.createObjectURL).
 *
 * For v1, we load the PDF via an <img> in a canvas — this works for
 * single-page PDFs. Multi-page support can be added later with pdfjs-dist.
 */
async function pdfPageToBlob(file: File, pageIndex = 0): Promise<Blob> {
    // We'll use pdfjs-dist dynamically if available, otherwise treat as image
    try {
        const pdfjsLib = await import(
      /* webpackIgnore: true */ 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs' as string
        ).catch(() => null);

        if (!pdfjsLib) throw new Error('pdfjs not available');

        (pdfjsLib as any).GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await (pdfjsLib as any).getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(pageIndex + 1);

        const scale = 2.0; // Higher scale = better OCR accuracy
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;

        await page.render({ canvasContext: ctx, viewport }).promise;
        return await new Promise<Blob>((res, rej) =>
            canvas.toBlob((b) => (b ? res(b) : rej(new Error('Canvas toBlob failed'))), 'image/png')
        );
    } catch {
        // Fallback: raw file as blob (Tesseract handles some PDFs natively)
        return file;
    }
}

/**
 * Extract text from a PDF File.
 * Processes the first page only in v1.
 */
async function extractFromPDF(file: File): Promise<OCRResult> {
    const imageBlob = await pdfPageToBlob(file);
    const Tesseract = await import('tesseract.js');
    const { data } = await Tesseract.recognize(imageBlob, 'eng', {
        logger: process.env.NODE_ENV === 'development' ? (m: unknown) => console.log(m) : undefined,
    });
    return {
        text: data.text,
        confidence: data.confidence,
    };
}

/**
 * Public OCR entry point.
 * Automatically selects extraction method based on file type.
 */
export async function extractTextFromFile(file: File): Promise<OCRResult> {
    const type = file.type.toLowerCase();

    if (type === 'application/pdf') {
        return extractFromPDF(file);
    }

    if (type.startsWith('image/')) {
        return extractFromImage(file);
    }

    throw new Error(`Unsupported file type: ${file.type}`);
}
