// ============================================================
// components/ui/Modal.tsx — Simple accessible modal dialog
// ============================================================

'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
    // Close on Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onClose]);

    // Prevent body scroll when open
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    if (!open) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={title}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div
                className={`
          relative w-full ${maxWidth} bg-[#12121a] border border-white/10
          rounded-2xl shadow-2xl shadow-black/60 animate-fade-in
        `}
            >
                {title && (
                    <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">{title}</h2>
                        <button
                            onClick={onClose}
                            className="text-white/40 hover:text-white/80 transition-colors text-xl leading-none"
                            aria-label="Close modal"
                        >
                            ×
                        </button>
                    </div>
                )}
                <div className="p-6">{children}</div>
            </div>
        </div>,
        document.body
    );
}
