'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Building2,
    Calendar,
    IndianRupee,
    ChevronRight,
    CheckCircle,
    Clock,
    Shield,
    Activity,
    Server,
    Zap
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent, Badge, StatusBadge, Button, StatsCardSkeleton } from '@/components/ui';
import { StaggerContainer, StaggerItem, FadeIn } from '@/components/layout/PageTransition';
import { useAuth } from '@/context/AuthContext';
import {
    collection,
    getDocs,
    getCountFromServer
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Hoarding, Booking } from '@/types';
import Link from 'next/link';

export default function AdminDashboardPage() {
    const { userData } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalHoardings: 0,
        pendingVerifications: 0,
        totalBookings: 0,
        revenue: 0,
        pendingApprovals: 0,
    });
    const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
    const [pendingHoardings, setPendingHoardings] = useState<Hoarding[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const usersCount = await getCountFromServer(collection(db, 'users'));
            const hoardingsSnapshot = await getDocs(collection(db, 'hoardings'));
            const bookingsSnapshot = await getDocs(collection(db, 'bookings'));

            const hoardings = hoardingsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Hoarding));
            const bookings = bookingsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Booking));

            const pendingVerifications = hoardings.filter((h) => !h.isVerified).length;
            const pendingApprovals = bookings.filter((b) => b.status === 'pending').length;
            const totalRevenue = bookings
                .filter((b) => b.paymentStatus === 'confirmed')
                .reduce((sum, b) => sum + b.totalAmount, 0);

            setStats({
                totalUsers: usersCount.data().count,
                totalHoardings: hoardings.length,
                pendingVerifications,
                totalBookings: bookings.length,
                revenue: totalRevenue,
                pendingApprovals,
            });

            setRecentBookings(bookings.sort((a: any, b: any) => b.createdAt?.toMillis() - a.createdAt?.toMillis()).slice(0, 5));
            setPendingHoardings(hoardings.filter((h) => !h.isVerified).slice(0, 5));
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Total Users', value: stats.totalUsers, icon: Users, sub: "Verified Personnel" },
        { label: 'Total Listings', value: stats.totalHoardings, icon: Building2, sub: "Total Infrastructure" },
        { label: 'Verifications', value: stats.pendingVerifications, icon: Shield, sub: "Pending Approval" },
        { label: 'Total Revenue', value: `₹${(stats.revenue / 1000).toFixed(1)}K`, icon: IndianRupee, sub: "Confirmed Earnings" },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-base)]">
            <Header
                title="Admin Dashboard"
                subtitle="Platform overview and management."
            />

            <div className="p-8 space-y-12 max-w-[1600px] mx-auto">

                {/* Systems Status Bar */}
                <div className="flex items-center gap-6 px-6 py-4 bg-[var(--bg-surface)] border border-[var(--border-standard)] rounded-xl">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--brand-primary)] animate-pulse" />
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Platform Online</span>
                    </div>
                    <div className="h-4 w-px bg-[var(--border-standard)]" />
                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)]">
                        <span className="flex items-center gap-1"><Server className="w-3 h-3" /> Server: Primary</span>
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Status: Healthy</span>
                        <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> Uptime: 99.9%</span>
                    </div>
                </div>

                {/* Stats Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[...Array(4)].map((_, i) => <StatsCardSkeleton key={i} />)}
                    </div>
                ) : (
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {statCards.map((stat) => (
                            <StaggerItem key={stat.label}>
                                <Card className="p-8 !bg-[var(--bg-surface)] hover:!border-[var(--brand-primary)] group">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.2em]">{stat.label}</p>
                                            <p className="text-4xl font-black text-slate-900 italic">{stat.value}</p>
                                            <p className="text-[9px] font-black text-[var(--brand-primary)] uppercase tracking-widest">{stat.sub}</p>
                                        </div>
                                        <div className="p-3 bg-[var(--bg-base)] border border-[var(--border-standard)] rounded-xl text-[var(--brand-primary)] group-hover:scale-110 transition-transform">
                                            <stat.icon className="w-6 h-6" />
                                        </div>
                                    </div>
                                </Card>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Recent Transactions */}
                    <FadeIn delay={0.2}>
                        <Card className="p-8 !bg-[var(--bg-surface)]">
                            <CardHeader className="flex items-center justify-between pb-8 mb-4 border-b border-[var(--border-standard)]">
                                <CardTitle className="text-sm font-black uppercase tracking-[0.3em] !text-slate-900">Recent Transactions</CardTitle>
                                <Link href="/admin/bookings">
                                    <Button variant="ghost" size="sm" className="!text-[9px] font-black tracking-widest hover:!bg-[var(--bg-elevated)]">
                                        VIEW ALL <ChevronRight className="ml-2 w-3 h-3" />
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {recentBookings.length === 0 ? (
                                    <div className="text-center py-20 opacity-30">
                                        <Calendar className="w-12 h-12 mx-auto mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No transactions yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {recentBookings.map((booking) => (
                                            <div
                                                key={booking.id}
                                                className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)]/40 transition-colors"
                                            >
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-wider">{booking.hoardingTitle}</p>
                                                    <p className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest">{booking.advertiserName}</p>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <span className="text-xs font-black text-slate-900 italic">₹{booking.totalAmount}</span>
                                                    <StatusBadge status={booking.status} className="!text-[8px] !px-3 !py-1" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </FadeIn>

                    {/* Verification Queue */}
                    <FadeIn delay={0.3}>
                        <Card className="p-8 !bg-[var(--bg-surface)]">
                            <CardHeader className="flex items-center justify-between pb-8 mb-4 border-b border-[var(--border-standard)]">
                                <CardTitle className="text-sm font-black uppercase tracking-[0.3em] !text-slate-900">Verifications Needed</CardTitle>
                                <Link href="/admin/hoardings">
                                    <Button variant="ghost" size="sm" className="!text-[9px] font-black tracking-widest hover:!bg-[var(--bg-elevated)]">
                                        REVIEW ALL <ChevronRight className="ml-2 w-3 h-3" />
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {pendingHoardings.length === 0 ? (
                                    <div className="text-center py-20">
                                        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-[var(--brand-primary)]" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">All caught up!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {pendingHoardings.map((hoarding) => (
                                            <div
                                                key={hoarding.id}
                                                className="flex items-center gap-6 p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)]"
                                            >
                                                <div className="w-12 h-12 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-standard)] overflow-hidden flex-shrink-0">
                                                    {hoarding.images?.[0] ? (
                                                        <img src={hoarding.images[0]} alt="" className="w-full h-full object-cover grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Building2 className="w-5 h-5 text-[var(--text-dim)]" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-wider truncate">{hoarding.title}</p>
                                                    <p className="text-[8px] font-black text-[var(--brand-primary)] uppercase tracking-widest">{hoarding.ownerName || 'ASSET OWNER'}</p>
                                                </div>
                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--brand-primary)]/30 text-[8px] font-black text-[var(--brand-primary)] uppercase tracking-tighter">
                                                    <Clock className="w-3 h-3" /> PENDING
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </FadeIn>
                </div>
            </div>
        </div>
    );
}
