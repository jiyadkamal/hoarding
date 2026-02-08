'use client';

import { forwardRef, InputHTMLAttributes, ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            error,
            hint,
            icon,
            iconPosition = 'left',
            fullWidth = true,
            className = '',
            type,
            ...props
        },
        ref
    ) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === 'password';
        const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

        return (
            <div className={`${fullWidth ? 'w-full' : ''}`}>
                {label && (
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && iconPosition === 'left' && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        type={inputType}
                        className={`
              w-full px-4 py-3 text-sm
              text-[var(--text-primary)] bg-[var(--bg-secondary)]
              border rounded-[var(--radius-md)]
              transition-all duration-150
              placeholder:text-[var(--text-tertiary)]
              hover:border-[var(--border-medium)]
              focus:border-[var(--accent-primary)] focus:ring-[3px] focus:ring-[rgba(99,102,241,0.15)]
              outline-none
              ${icon && iconPosition === 'left' ? 'pl-10' : ''}
              ${icon && iconPosition === 'right' || isPassword ? 'pr-10' : ''}
              ${error ? 'border-[var(--error)] focus:ring-[rgba(239,68,68,0.15)]' : 'border-[var(--border-light)]'}
              ${className}
            `}
                        {...props}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    )}
                    {icon && iconPosition === 'right' && !isPassword && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
                            {icon}
                        </div>
                    )}
                </div>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1.5 text-xs text-[var(--error)]"
                    >
                        {error}
                    </motion.p>
                )}
                {hint && !error && (
                    <p className="mt-1.5 text-xs text-[var(--text-tertiary)]">{hint}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, fullWidth = true, className = '', ...props }, ref) => (
        <div className={`${fullWidth ? 'w-full' : ''}`}>
            {label && (
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    {label}
                </label>
            )}
            <textarea
                ref={ref}
                className={`
          w-full px-4 py-3 text-sm min-h-[120px] resize-y
          text-[var(--text-primary)] bg-[var(--bg-secondary)]
          border rounded-[var(--radius-md)]
          transition-all duration-150
          placeholder:text-[var(--text-tertiary)]
          hover:border-[var(--border-medium)]
          focus:border-[var(--accent-primary)] focus:ring-[3px] focus:ring-[rgba(99,102,241,0.15)]
          outline-none
          ${error ? 'border-[var(--error)]' : 'border-[var(--border-light)]'}
          ${className}
        `}
                {...props}
            />
            {error && (
                <p className="mt-1.5 text-xs text-[var(--error)]">{error}</p>
            )}
        </div>
    )
);

Textarea.displayName = 'Textarea';

// Select Component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
    fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, fullWidth = true, className = '', ...props }, ref) => (
        <div className={`${fullWidth ? 'w-full' : ''}`}>
            {label && (
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    {label}
                </label>
            )}
            <select
                ref={ref}
                className={`
          w-full px-4 py-3 text-sm appearance-none
          text-[var(--text-primary)] bg-[var(--bg-secondary)]
          border rounded-[var(--radius-md)]
          transition-all duration-150
          hover:border-[var(--border-medium)]
          focus:border-[var(--accent-primary)] focus:ring-[3px] focus:ring-[rgba(99,102,241,0.15)]
          outline-none cursor-pointer
          ${error ? 'border-[var(--error)]' : 'border-[var(--border-light)]'}
          ${className}
        `}
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '16px',
                }}
                {...props}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-1.5 text-xs text-[var(--error)]">{error}</p>
            )}
        </div>
    )
);

Select.displayName = 'Select';

export default Input;
