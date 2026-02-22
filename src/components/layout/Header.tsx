'use client';

import { ReactNode } from 'react';
import { Search, Bell, User } from 'lucide-react';

interface HeaderProps {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
}

export const Header = ({ title, subtitle, actions }: HeaderProps) => {
    return (
        <header
            className="h-20 px-8 flex items-center justify-between bg-white border-b border-slate-200 sticky top-0 z-30"
        >
            {/* Title Section */}
            <div className="flex flex-col">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
                {subtitle && (
                    <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
                )}
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-6">
                {/* Search Bar */}
                <div className="hidden md:flex items-center relative w-72">
                    <Search className="absolute left-3 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search for hoardings..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm transition-all focus:bg-white focus:border-emerald-500 outline-none"
                    />
                </div>

                {/* Notifications & User */}
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all">
                        <Bell className="w-5 h-5" />
                    </button>
                    {actions && <div className="ml-4">{actions}</div>}
                </div>
            </div>
        </header>
    );
};
