'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { firebaseUser, userData, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            // Not authenticated
            if (!firebaseUser) {
                router.push('/login');
                return;
            }

            // Check role-based access
            if (allowedRoles && userData && !allowedRoles.includes(userData.role)) {
                // Redirect to appropriate dashboard based on role
                switch (userData.role) {
                    case 'admin':
                        router.push('/admin/dashboard');
                        break;
                    case 'owner':
                        router.push('/owner/dashboard');
                        break;
                    case 'advertiser':
                        router.push('/advertiser/browse');
                        break;
                    default:
                        router.push('/login');
                }
            }

            // Check if owner is approved
            if (userData?.role === 'owner' && !userData.isApproved) {
                // Allow access but show pending approval message
                // This is handled in the dashboard
            }
        }
    }, [firebaseUser, userData, loading, allowedRoles, router]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-slate-100" />
                        <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-t-emerald-500 animate-spin" />
                    </div>
                    <p className="text-sm text-slate-500">Loading...</p>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!firebaseUser) {
        return null;
    }

    // Role check failed
    if (allowedRoles && userData && !allowedRoles.includes(userData.role)) {
        return null;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
