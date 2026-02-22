'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Building2,
    Search,
    Calendar,
    Settings,
    LogOut,
    PlusCircle,
    UserCircle,
    ClipboardList,
    ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { logoutUser } from '@/lib/firebase/auth';

export const Sidebar = () => {
    const pathname = usePathname();
    const { userData } = useAuth();

    const adminLinks = [
        { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
        { href: '/admin/hoardings', label: 'All Hoardings', icon: Building2 },
        { href: '/admin/bookings', label: 'All Bookings', icon: Calendar },
        { href: '/admin/users', label: 'User Management', icon: UserCircle },
    ];

    const advertiserLinks = [
        { href: '/advertiser/browse', label: 'Find Hoardings', icon: Search },
        { href: '/advertiser/bookings', label: 'My Bookings', icon: ClipboardList },
    ];

    const ownerLinks = [
        { href: '/owner/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
        { href: '/owner/hoardings', label: 'My Hoardings', icon: Building2 },
        { href: '/owner/hoardings/new', label: 'Add New Space', icon: PlusCircle },
        { href: '/owner/requests', label: 'Booking Requests', icon: ClipboardList },
    ];

    const links = userData?.role === 'admin'
        ? adminLinks
        : userData?.role === 'owner'
            ? ownerLinks
            : advertiserLinks;

    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <aside
            className="fixed left-0 top-0 bottom-0 w-64 bg-[#0e1628] border-r border-white/5 flex flex-col z-40"
        >
            {/* Logo */}
            <div className="h-20 flex items-center px-7">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                        <Building2 className="w-[18px] h-[18px] text-white" />
                    </div>
                    <span className="text-[17px] font-bold tracking-tight text-white">
                        Hoard<span className="text-emerald-400">Book</span>
                    </span>
                </Link>
            </div>

            {/* User Profile Summary */}
            <div className="px-5 py-6">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center gap-3 group hover:bg-white/[0.05] transition-colors cursor-default">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 flex items-center justify-center text-emerald-400 font-bold border border-emerald-400/20">
                        {userData?.displayName?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-white/90 truncate">
                            {userData?.displayName || 'User'}
                        </p>
                        <p className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest">
                            {userData?.role || 'Guest'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar pt-2">
                <p className="px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Main Menu</p>
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all duration-200 group
                                ${isActive
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                    : 'text-white/40 hover:text-white/80 hover:bg-white/[0.03]'}
                            `}
                        >
                            <link.icon className={`w-[18px] h-[18px] transition-colors ${isActive ? 'text-white' : 'text-white/20 group-hover:text-white/60'}`} />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-5 border-t border-white/5">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold text-white/30 hover:bg-red-500/10 hover:text-red-400 transition-all group"
                >
                    <LogOut className="w-[18px] h-[18px] text-white/10 group-hover:text-red-400/60" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};
