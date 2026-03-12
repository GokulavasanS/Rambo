// ============================================================
// components/ui/Badge.tsx
// ============================================================

import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'info';
    className?: string;
}

const variantClasses = {
    default: 'bg-white/5 text-white/60 border-white/10',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
    return (
        <span
            className={`
        inline-flex items-center px-2 py-0.5 text-xs font-medium
        rounded-full border ${variantClasses[variant]} ${className}
      `}
        >
            {children}
        </span>
    );
}
