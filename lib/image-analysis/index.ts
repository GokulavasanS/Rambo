// ============================================================
// lib/image-analysis/index.ts
// Color palette extraction + layout classification from images
// ============================================================
//
// All processing is client-side using canvas pixel manipulation.
// K-means clustering for dominant color extraction.
// Simple vertical text-region heuristic for column detection.

import type { ThemePalette, LayoutType, ImageAnalysisResult } from '@/types';

// ---- K-Means Color Clustering ----

interface RGB {
    r: number;
    g: number;
    b: number;
}

function rgbToHex({ r, g, b }: RGB): string {
    return (
        '#' +
        [r, g, b]
            .map((v) => Math.round(v).toString(16).padStart(2, '0'))
            .join('')
    );
}

function colorDistance(a: RGB, b: RGB): number {
    return Math.sqrt(
        Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2)
    );
}

/**
 * Simple K-means clustering on a set of RGB pixels.
 * Returns k cluster centers.
 */
function kMeans(pixels: RGB[], k: number, iterations = 10): RGB[] {
    if (pixels.length === 0) return [];

    // Initialize centroids by picking random pixels
    let centroids: RGB[] = [];
    const step = Math.floor(pixels.length / k);
    for (let i = 0; i < k; i++) {
        centroids.push({ ...pixels[i * step] });
    }

    for (let iter = 0; iter < iterations; iter++) {
        // Assign pixels to nearest centroid
        const clusters: RGB[][] = Array.from({ length: k }, () => []);

        for (const pixel of pixels) {
            let minDist = Infinity;
            let closest = 0;
            for (let c = 0; c < centroids.length; c++) {
                const dist = colorDistance(pixel, centroids[c]);
                if (dist < minDist) {
                    minDist = dist;
                    closest = c;
                }
            }
            clusters[closest].push(pixel);
        }

        // Recompute centroids
        centroids = clusters.map((cluster, i) => {
            if (cluster.length === 0) return centroids[i];
            const avg = cluster.reduce(
                (acc, p) => ({ r: acc.r + p.r, g: acc.g + p.g, b: acc.b + p.b }),
                { r: 0, g: 0, b: 0 }
            );
            return {
                r: avg.r / cluster.length,
                g: avg.g / cluster.length,
                b: avg.b / cluster.length,
            };
        });
    }

    return centroids;
}

/**
 * Load an image File into an HTMLImageElement.
 */
async function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = reject;
        img.src = url;
    });
}

/**
 * Sample pixel data from an image using a canvas.
 * Down-samples for performance.
 */
function samplePixels(img: HTMLImageElement, maxSamples = 2000): { pixels: RGB[]; imageData: ImageData } {
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, Math.sqrt(maxSamples / (img.width * img.height)));
    canvas.width = Math.max(1, Math.floor(img.width * scale));
    canvas.height = Math.max(1, Math.floor(img.height * scale));

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels: RGB[] = [];

    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const a = imageData.data[i + 3];

        // Skip near-white (background) and near-transparent pixels
        if (a < 128) continue;
        if (r > 240 && g > 240 && b > 240) continue;

        pixels.push({ r, g, b });
    }

    return { pixels, imageData };
}

/**
 * Determine if a color is "dark" (suitable for use as text color on white).
 */
function isDark(c: RGB): boolean {
    const luminance = 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
    return luminance < 128;
}

/**
 * Sort clusters: darkest first (most likely to be primary brand color).
 */
function sortByDarkness(clusters: RGB[]): RGB[] {
    return [...clusters].sort((a, b) => {
        const lumA = 0.299 * a.r + 0.587 * a.g + 0.114 * a.b;
        const lumB = 0.299 * b.r + 0.587 * b.g + 0.114 * b.b;
        return lumA - lumB;
    });
}

/**
 * Extract a ThemePalette from an image file.
 */
export async function extractPalette(file: File): Promise<ThemePalette> {
    const img = await loadImage(file);
    const { pixels } = samplePixels(img);

    const k = 5;
    const clusters = kMeans(pixels, k);
    const sorted = sortByDarkness(clusters);

    const [primary, secondary, accent, ...rest] = sorted;

    return {
        primary: primary ? rgbToHex(primary) : '#1a1a2e',
        secondary: secondary ? rgbToHex(secondary) : '#444444',
        accent: accent ? rgbToHex(accent) : '#0ea5e9',
        neutralBackground: '#ffffff',
        textColor: primary && isDark(primary) ? rgbToHex(primary) : '#1a1a1a',
    };
}

/**
 * Classify image layout as 1-column or 2-column.
 *
 * Heuristic: Split the image into left and right halves.
 * Count "dark" pixel density in each half.
 * If both halves have significant content, likely 2-column.
 */
export async function classifyLayout(file: File): Promise<{ layout: LayoutType; confidence: number }> {
    const img = await loadImage(file);
    const { pixels, imageData } = samplePixels(img);

    const width = imageData.width;
    const height = imageData.height;
    const midX = Math.floor(width / 2);

    let leftDark = 0;
    let rightDark = 0;
    let totalLeft = 0;
    let totalRight = 0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = imageData.data[idx];
            const g = imageData.data[idx + 1];
            const b = imageData.data[idx + 2];
            const a = imageData.data[idx + 3];
            if (a < 128) continue;

            const isDarkPixel = r < 180 && g < 180 && b < 180;

            if (x < midX) {
                totalLeft++;
                if (isDarkPixel) leftDark++;
            } else {
                totalRight++;
                if (isDarkPixel) rightDark++;
            }
        }
    }

    const leftRatio = totalLeft > 0 ? leftDark / totalLeft : 0;
    const rightRatio = totalRight > 0 ? rightDark / totalRight : 0;

    // Both halves have significant text density → likely 2-column
    const threshold = 0.05;
    const isTwoColumn = leftRatio > threshold && rightRatio > threshold;
    const confidence = isTwoColumn
        ? Math.min(leftRatio, rightRatio) / Math.max(leftRatio, rightRatio)
        : 1 - Math.min(leftRatio, rightRatio) / (threshold + 0.001);

    return {
        layout: isTwoColumn ? '2-column' : '1-column',
        confidence: Math.max(0, Math.min(1, confidence)),
    };
}

/**
 * Full image analysis: palette + layout detection.
 */
export async function analyzeImage(file: File): Promise<ImageAnalysisResult> {
    const [palette, { layout, confidence }] = await Promise.all([
        extractPalette(file),
        classifyLayout(file),
    ]);

    return { palette, layout, confidence };
}
