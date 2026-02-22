'use client';

import { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function AdvertiserLayout({ children }: { children: ReactNode }) {
    return (
        <ProtectedRoute allowedRoles={['advertiser', 'admin']}>
            <div className="min-h-screen bg-white">
                <Sidebar />
                <main className="ml-64 min-h-screen bg-slate-50/50">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
