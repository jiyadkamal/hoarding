'use client';

import { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AuthProvider } from '@/context/AuthContext';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <ProtectedRoute>
                <div className="min-h-screen bg-[var(--bg-primary)]">
                    <Sidebar />
                    <main className="ml-64 min-h-screen">
                        {children}
                    </main>
                </div>
            </ProtectedRoute>
        </AuthProvider>
    );
}
