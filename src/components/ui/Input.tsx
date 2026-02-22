'use client';

import { forwardRef, InputHTMLAttributes, ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    id?: string;
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
            id,
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
                    <label htmlFor={id} className="block text-[12px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    {icon && iconPosition === 'left' && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none z-10">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={id}
                        type={inputType}
                        className={`
                          w-full px-4 py-3 rounded-xl
                          outline-none
                          bg-white border border-slate-200 text-slate-800
                          placeholder:text-slate-300
                          focus:bg-white focus:border-emerald-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]
                          transition-all duration-300
                          text-[14px]
                          ${icon && iconPosition === 'left' ? '!pl-10' : ''}
                          ${icon && iconPosition === 'right' || isPassword ? 'pr-10' : ''}
                          ${error ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]' : ''}
                          ${className}
                        `}
                        {...props}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors z-10"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    )}
                    {icon && iconPosition === 'right' && !isPassword && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
                            {icon}
                        </div>
                    )}
                </div>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1"
                    >
                        <span className="w-1 h-1 rounded-full bg-red-500" />
                        {error}
                    </motion.p>
                )}
                {hint && !error && (
                    <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    id?: string;
    label?: string;
    error?: string;
    fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ id, label, error, fullWidth = true, className = '', ...props }, ref) => (
        <div className={`${fullWidth ? 'w-full' : ''}`}>
            {label && (
                <label htmlFor={id} className="block text-[12px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                    {label}
                </label>
            )}
            <textarea
                ref={ref}
                id={id}
                className={`
                  w-full px-4 py-3 min-h-[120px] resize-y rounded-xl
                  outline-none
                  bg-white border border-slate-200 text-slate-800
                  placeholder:text-slate-300
                  focus:bg-white focus:border-emerald-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]
                  transition-all duration-300
                  text-[14px]
                  ${error ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]' : ''}
                  ${className}
                `}
                {...props}
            />
            {error && (
                <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-500" />
                    {error}
                </p>
            )}
        </div>
    )
);

Textarea.displayName = 'Textarea';

// Select Component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    id?: string;
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
    fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ id, label, error, options, fullWidth = true, className = '', ...props }, ref) => (
        <div className={`${fullWidth ? 'w-full' : ''}`}>
            {label && (
                <label htmlFor={id} className="block text-[12px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    ref={ref}
                    id={id}
                    className={`
                      w-full px-4 py-3 appearance-none rounded-xl
                      outline-none cursor-pointer
                      bg-white border border-slate-200 text-slate-800
                      focus:bg-white focus:border-emerald-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]
                      transition-all duration-300
                      text-[14px]
                      ${error ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]' : ''}
                      ${className}
                    `}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value} className="bg-white text-slate-800">
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400" />
                    </svg>
                </div>
            </div>
            {error && (
                <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-500" />
                    {error}
                </p>
            )}
        </div>
    )
);

Select.displayName = 'Select';

export default Input;
