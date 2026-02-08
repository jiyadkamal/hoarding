'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard,
    Search,
    CalendarDays,
    Building2,
    Users,
    FileCheck,
    PlusCircle,
    LogOut,
    ChevronRight,
} from 'lucide-react';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

const advertiserNavItems: NavItem[] = [
    { label: 'Browse Hoardings', href: '/advertiser/browse', icon: <Search className="w-5 h-5" /> },
    { label: 'My Bookings', href: '/advertiser/bookings', icon: <CalendarDays className="w-5 h-5" /> },
];

const ownerNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/owner/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'My Hoardings', href: '/owner/hoardings', icon: <Building2 className="w-5 h-5" /> },
    { label: 'Add Hoarding', href: '/owner/hoardings/new', icon: <PlusCircle className="w-5 h-5" /> },
    { label: 'Booking Requests', href: '/owner/requests', icon: <FileCheck className="w-5 h-5" /> },
];

const adminNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Users', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { label: 'Hoardings', href: '/admin/hoardings', icon: <Building2 className="w-5 h-5" /> },
    { label: 'Bookings', href: '/admin/bookings', icon: <CalendarDays className="w-5 h-5" /> },
];

export const Sidebar = () => {
    const { userData, logout } = useAuth();
    const pathname = usePathname();

    const getNavItems = (): NavItem[] => {
        switch (userData?.role) {
            case 'admin':
                return adminNavItems;
            case 'owner':
                return ownerNavItems;
            case 'advertiser':
                return advertiserNavItems;
            default:
                return [];
        }
    };

    const navItems = getNavItems();

    const getRoleLabel = () => {
        switch (userData?.role) {
            case 'admin':
                return 'Administrator';
            case 'owner':
                return 'Hoarding Owner';
            case 'advertiser':
                return 'Advertiser';
            default:
                return 'User';
        }
    };

    return (
        <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="fixed left-0 top-0 bottom-0 w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-light)] flex flex-col z-40"
        >
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-[var(--border-light)]">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-lg text-[var(--text-primary)]">HoardBook</span>
                </Link>
            </div>

            {/* User Info */}
            <div className="px-4 py-4 border-b border-[var(--border-light)]">
                <div className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] bg-[var(--bg-tertiary)]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                        {userData?.displayName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {userData?.displayName}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)]">{getRoleLabel()}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)]
                    text-sm font-medium transition-all duration-200
                    ${isActive
                                            ? 'bg-[var(--accent-primary)] text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)]'
                                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                                        }
                  `}
                                >
                                    {item.icon}
                                    <span className="flex-1">{item.label}</span>
                                    {isActive && <ChevronRight className="w-4 h-4" />}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--border-light)] space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-tertiary)]">Theme</span>
                    <ThemeToggle />
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                </button>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
