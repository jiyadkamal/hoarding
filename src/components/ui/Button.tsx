'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gradient' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    children?: React.ReactNode;
}

const variants: Record<ButtonVariant, string> = {
    primary: 'bg-emerald-500 shadow-sm shadow-emerald-500/10 text-white hover:bg-emerald-600',
    secondary: 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-500/40 hover:text-emerald-600',
    ghost: 'bg-transparent text-slate-500 hover:text-emerald-500 hover:bg-slate-50',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    success: 'bg-emerald-500 text-white hover:bg-emerald-600',
    gradient: 'bg-slate-900 text-white hover:bg-slate-800',
};

const sizes: Record<ButtonSize, string> = {
    sm: 'h-9 px-3.5 text-[12px] gap-1.5',
    md: 'h-11 px-5 text-[13px] gap-2',
    lg: 'h-12 px-6 text-[14px] gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            loading = false,
            icon,
            iconPosition = 'left',
            fullWidth = false,
            children,
            className = '',
            disabled,
            ...props
        },
        ref
    ) => {
        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading || disabled}
                className={`
          inline-flex items-center justify-center font-semibold rounded-xl
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
                {...props}
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <>
                        {icon && iconPosition === 'left' && icon}
                        {children}
                        {icon && iconPosition === 'right' && icon}
                    </>
                )}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';
