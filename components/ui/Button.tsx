'use client';
import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    icon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
    primary:
        'bg-[#ff6b00] hover:bg-[#ff7f24] text-white border border-[#ff6b00] hover:border-[#ff7f24] btn-accent-glow',
    secondary:
        'bg-white hover:bg-[#fff3e8] text-[#0f172a] border border-[#e2e8f0] hover:border-[#ffd4b0]',
    ghost:
        'bg-transparent hover:bg-[#f4f4f5] text-[#475569] hover:text-[#0f172a] border border-transparent',
    danger:
        'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300',
    outline:
        'bg-transparent hover:bg-[#fff3e8] text-[#ff6b00] border border-[#ff6b00] hover:border-[#ff7f24]',
};

const sizeClasses: Record<Size, string> = {
    xs: 'h-6 px-2.5 text-[11px] rounded-md gap-1',
    sm: 'h-8 px-3.5 text-xs rounded-lg gap-1.5',
    md: 'h-10 px-5 text-sm rounded-xl gap-2',
    lg: 'h-12 px-7 text-base rounded-xl gap-2.5',
};

export function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    children,
    className = '',
    disabled,
    ...rest
}: ButtonProps) {
    return (
        <button
            {...rest}
            disabled={disabled || loading}
            className={`
        inline-flex items-center justify-center font-semibold
        transition-all duration-200 cursor-pointer select-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
        >
            {loading ? (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin flex-shrink-0" />
            ) : icon ? (
                <span className="flex-shrink-0">{icon}</span>
            ) : null}
            {children}
        </button>
    );
}
