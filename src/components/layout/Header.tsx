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
            className="h-20 px-10 flex items-center justify-between bg-white/70 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-30"
        >
            {/* Title Section */}
            <div className="flex flex-col gap-0.5">
                <h1 className="text-[20px] font-bold text-slate-900 tracking-tight leading-tight">{title}</h1>
                {subtitle && (
                    <p className="text-[12px] text-slate-400 font-medium">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-8">
                {/* Search Bar */}
                <div className="hidden lg:flex items-center relative w-[320px] group">
                    <Search className="absolute left-4 w-4 h-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search workspace..."
                        className="w-full pl-11 pr-4 h-11 bg-slate-50/50 border border-slate-100 rounded-[12px] text-[13px] transition-all focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none placeholder:text-slate-300"
                    />
                </div>

                {/* Notifications & User */}
                <div className="flex items-center gap-3">
                    <button className="relative w-11 h-11 rounded-[12px] border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-50/50 transition-all group">
                        <Bell className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
                        <span className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white" />
                    </button>
                    {actions && <div className="ml-2 flex items-center gap-2">{actions}</div>}

                    <div className="h-8 w-[1px] bg-slate-100 mx-2 hidden md:block" />

                    {/* User Mini Avatar/Info (Optional but adds premium feel) */}
                    <button className="hidden md:flex items-center gap-2 p-1 pl-1 pr-3 rounded-full hover:bg-slate-50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-400" />
                        </div>
                        <span className="text-[12px] font-bold text-slate-700 tracking-tight">Account</span>
                    </button>
                </div>
            </div>
        </header>
    );
};
