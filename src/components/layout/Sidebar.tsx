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
        { href: '/advertiser/profile', label: 'My Profile', icon: UserCircle },
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
            className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 flex flex-col z-40"
        >
            {/* Logo */}
            <div className="h-20 flex items-center px-6 border-b border-slate-100 bg-slate-50/50">
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center shadow-md shadow-emerald-500/10">
                        <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg text-slate-900 tracking-tight">
                        Hoard<span className="text-emerald-500">Book</span>
                    </span>
                </Link>
            </div>

            {/* User Profile Summary */}
            <div className="p-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                        {userData?.displayName?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                            {userData?.displayName || 'User'}
                        </p>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                            {userData?.role || 'Guest'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                                ${isActive
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                            `}
                        >
                            <link.icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-100">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};
