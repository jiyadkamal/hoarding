'use client';

import { ReactNode } from 'react';

type CardVariant = 'default' | 'elevated' | 'outline' | 'interactive';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
    children: ReactNode;
    variant?: CardVariant;
    padding?: CardPadding;
    className?: string;
    onClick?: () => void;
}

const variantStyles: Record<CardVariant, string> = {
    default: 'bg-white border border-slate-150 rounded-2xl shadow-sm',
    elevated: 'bg-white border border-slate-150 rounded-2xl shadow-md',
    outline: 'bg-white border-2 border-slate-100 rounded-xl',
    interactive: 'bg-white border border-slate-150 rounded-2xl shadow-sm cursor-pointer hover:border-emerald-500/40 hover:shadow-lg hover:translate-y-[-2px] active:scale-[0.98] transition-all duration-300',
};

const paddingStyles: Record<CardPadding, string> = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

export const Card = ({
    children,
    variant = 'default',
    padding = 'md',
    className = '',
    onClick,
}: CardProps) => {
    return (
        <div
            className={`
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${className}
      `}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
    <div className={`mb-4 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
    <h3 className={`text-lg font-bold text-slate-900 ${className}`}>{children}</h3>
);

export const CardContent = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
);

export const CardDescription = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
    <p className={`text-sm text-slate-500 ${className}`}>{children}</p>
);

export const CardFooter = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
    <div className={`mt-6 pt-6 border-t border-slate-100 ${className}`}>{children}</div>
);
