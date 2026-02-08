'use client';

import { motion } from 'framer-motion';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

export const Header = ({ title, subtitle, actions }: HeaderProps) => {
    const { userData } = useAuth();

    return (
        <motion.header
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="h-16 px-8 flex items-center justify-between border-b border-[var(--border-light)] bg-[var(--bg-secondary)]/80 backdrop-blur-md sticky top-0 z-30"
        >
            {/* Title Section */}
            <div>
                <h1 className="text-xl font-semibold text-[var(--text-primary)]">{title}</h1>
                {subtitle && (
                    <p className="text-sm text-[var(--text-secondary)]">{subtitle}</p>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="relative hidden lg:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-64 pl-9 pr-4 py-2 text-sm bg-[var(--bg-tertiary)] border border-transparent rounded-[var(--radius-full)] focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[rgba(99,102,241,0.15)] outline-none transition-all"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                {/* Custom Actions */}
                {actions}

                {/* User Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                    {userData?.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
            </div>
        </motion.header>
    );
};

export default Header;
