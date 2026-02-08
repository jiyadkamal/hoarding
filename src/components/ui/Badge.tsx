'use client';

import { ReactNode } from 'react';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
    children: ReactNode;
    variant?: BadgeVariant;
    size?: BadgeSize;
    dot?: boolean;
    className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
    primary: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    error: 'bg-red-500/10 text-red-600 dark:text-red-400',
    neutral: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]',
    info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
};

const dotColors: Record<BadgeVariant, string> = {
    primary: 'bg-indigo-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    neutral: 'bg-[var(--text-tertiary)]',
    info: 'bg-sky-500',
};

const sizeStyles: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
};

export const Badge = ({
    children,
    variant = 'neutral',
    size = 'md',
    dot = false,
    className = '',
}: BadgeProps) => (
    <span
        className={`
      inline-flex items-center gap-1.5 font-medium
      rounded-[var(--radius-full)]
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${className}
    `}
    >
        {dot && (
            <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
        )}
        {children}
    </span>
);

// Status Badge specifically for booking statuses
interface StatusBadgeProps {
    status: string;
    className?: string;
}

export const StatusBadge = ({ status, className = '' }: StatusBadgeProps) => {
    const statusConfig: Record<string, { variant: BadgeVariant; label: string }> = {
        pending: { variant: 'warning', label: 'Pending' },
        approved: { variant: 'success', label: 'Approved' },
        rejected: { variant: 'error', label: 'Rejected' },
        paid: { variant: 'primary', label: 'Paid' },
        completed: { variant: 'success', label: 'Completed' },
        cancelled: { variant: 'neutral', label: 'Cancelled' },
        confirmed: { variant: 'success', label: 'Confirmed' },
    };

    const config = statusConfig[status.toLowerCase()] || { variant: 'neutral', label: status };

    return (
        <Badge variant={config.variant} dot className={className}>
            {config.label}
        </Badge>
    );
};

export default Badge;
