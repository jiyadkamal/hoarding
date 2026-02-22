'use client';
import { motion } from 'framer-motion';
import { BookingStatus } from '@/types';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    size?: BadgeSize;
    className?: string;
    showDot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
    primary: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    error: 'bg-red-50 text-red-700 border-red-100',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
    info: 'bg-blue-50 text-blue-700 border-blue-100',
};

const dotColors: Record<BadgeVariant, string> = {
    primary: 'bg-emerald-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    neutral: 'bg-slate-400',
    info: 'bg-blue-500',
};

const sizeStyles: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
};

export const Badge = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    showDot = false,
}: BadgeProps) => {
    return (
        <span
            className={`
        inline-flex items-center gap-1.5 font-semibold rounded-md border
        transition-colors duration-200
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
        >
            {showDot && (
                <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
            )}
            {children}
        </span>
    );
};

export const StatusBadge = ({ status, className = '' }: { status: BookingStatus; className?: string }) => {
    const config: Record<BookingStatus, { variant: BadgeVariant; label: string }> = {
        pending: { variant: 'warning', label: 'Pending' },
        approved: { variant: 'info', label: 'Approved' },
        paid: { variant: 'success', label: 'Paid' },
        completed: { variant: 'neutral', label: 'Completed' },
        rejected: { variant: 'error', label: 'Rejected' },
        cancelled: { variant: 'neutral', label: 'Cancelled' },
    };

    const { variant, label } = config[status] || { variant: 'neutral', label: status };

    return (
        <Badge variant={variant} className={className} showDot>
            {label}
        </Badge>
    );
};
