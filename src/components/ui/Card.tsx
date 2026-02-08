'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

type CardVariant = 'default' | 'elevated' | 'glass' | 'interactive';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
    variant?: CardVariant;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
    default: 'bg-[var(--bg-secondary)] border border-[var(--border-light)] shadow-[var(--shadow-sm)]',
    elevated: 'bg-[var(--bg-elevated)] border border-[var(--border-light)] shadow-[var(--shadow-lg)]',
    glass: 'bg-[var(--glass-bg)] backdrop-blur-[20px] border border-[var(--glass-border)] shadow-[var(--glass-shadow)]',
    interactive: 'bg-[var(--bg-secondary)] border border-[var(--border-light)] shadow-[var(--shadow-sm)] cursor-pointer',
};

const paddingStyles: Record<string, string> = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
    (
        {
            variant = 'default',
            padding = 'md',
            hover = true,
            className = '',
            children,
            ...props
        },
        ref
    ) => {
        const isInteractive = variant === 'interactive';

        return (
            <motion.div
                ref={ref}
                className={`
          rounded-[var(--radius-lg)] transition-all duration-200
          ${variantStyles[variant]}
          ${paddingStyles[padding]}
          ${className}
        `}
                whileHover={
                    hover
                        ? {
                            y: isInteractive ? -4 : -2,
                            boxShadow: isInteractive
                                ? 'var(--shadow-xl)'
                                : 'var(--shadow-md)',
                        }
                        : undefined
                }
                transition={{ duration: 0.2 }}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

Card.displayName = 'Card';

// Card Header Component
export const CardHeader = ({
    className = '',
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => (
    <div className={`mb-4 ${className}`}>
        {children}
    </div>
);

// Card Title Component
export const CardTitle = ({
    className = '',
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => (
    <h3 className={`text-lg font-semibold text-[var(--text-primary)] ${className}`}>
        {children}
    </h3>
);

// Card Description Component
export const CardDescription = ({
    className = '',
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => (
    <p className={`text-sm text-[var(--text-secondary)] mt-1 ${className}`}>
        {children}
    </p>
);

// Card Content Component
export const CardContent = ({
    className = '',
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => (
    <div className={className}>
        {children}
    </div>
);

// Card Footer Component
export const CardFooter = ({
    className = '',
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => (
    <div className={`mt-4 pt-4 border-t border-[var(--border-light)] ${className}`}>
        {children}
    </div>
);

export default Card;
