'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface Icon3DProps {
    icon: LucideIcon;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
    animated?: boolean;
    className?: string;
}

const sizeStyles: Record<string, { container: string; icon: string }> = {
    sm: { container: 'w-10 h-10', icon: 'w-5 h-5' },
    md: { container: 'w-12 h-12', icon: 'w-6 h-6' },
    lg: { container: 'w-16 h-16', icon: 'w-8 h-8' },
    xl: { container: 'w-20 h-20', icon: 'w-10 h-10' },
};

const colorStyles: Record<string, { gradient: string; iconColor: string; shadow: string }> = {
    primary: {
        gradient: 'from-indigo-500/20 via-purple-500/20 to-pink-500/20',
        iconColor: 'text-indigo-500',
        shadow: 'shadow-[0_8px_30px_rgba(99,102,241,0.2)]',
    },
    success: {
        gradient: 'from-emerald-500/20 via-green-500/20 to-teal-500/20',
        iconColor: 'text-emerald-500',
        shadow: 'shadow-[0_8px_30px_rgba(16,185,129,0.2)]',
    },
    warning: {
        gradient: 'from-amber-500/20 via-orange-500/20 to-yellow-500/20',
        iconColor: 'text-amber-500',
        shadow: 'shadow-[0_8px_30px_rgba(245,158,11,0.2)]',
    },
    error: {
        gradient: 'from-red-500/20 via-rose-500/20 to-pink-500/20',
        iconColor: 'text-red-500',
        shadow: 'shadow-[0_8px_30px_rgba(239,68,68,0.2)]',
    },
    info: {
        gradient: 'from-blue-500/20 via-cyan-500/20 to-sky-500/20',
        iconColor: 'text-blue-500',
        shadow: 'shadow-[0_8px_30px_rgba(59,130,246,0.2)]',
    },
};

export const Icon3D = ({
    icon: IconComponent,
    size = 'md',
    color = 'primary',
    animated = true,
    className = '',
}: Icon3DProps) => {
    const { container, icon } = sizeStyles[size];
    const { gradient, iconColor, shadow } = colorStyles[color];

    return (
        <motion.div
            className={`
        relative ${container} rounded-[var(--radius-lg)]
        bg-gradient-to-br ${gradient}
        flex items-center justify-center
        ${shadow}
        ${className}
      `}
            whileHover={animated ? { scale: 1.05, rotate: 5 } : undefined}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            {/* Glass overlay */}
            <div className="absolute inset-0 rounded-[var(--radius-lg)] overflow-hidden">
                <div
                    className="absolute inset-x-0 top-0 h-1/2"
                    style={{
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
                    }}
                />
            </div>

            {/* Icon */}
            <IconComponent className={`${icon} ${iconColor} relative z-10`} strokeWidth={1.5} />

            {/* Glow effect */}
            <div
                className={`absolute inset-0 rounded-[var(--radius-lg)] bg-gradient-to-br ${gradient} blur-xl opacity-50`}
            />
        </motion.div>
    );
};

// Simple icon wrapper for inline icons with subtle styling
interface IconWrapperProps {
    children: ReactNode;
    className?: string;
}

export const IconWrapper = ({ children, className = '' }: IconWrapperProps) => (
    <div
        className={`
      inline-flex items-center justify-center
      w-8 h-8 rounded-[var(--radius-sm)]
      bg-[var(--bg-tertiary)]
      ${className}
    `}
    >
        {children}
    </div>
);

export default Icon3D;
