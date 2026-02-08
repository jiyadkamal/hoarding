'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Building2,
    Calendar,
    IndianRupee,
    TrendingUp,
    ChevronRight,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent, Badge, StatusBadge, Button, Icon3D, StatsCardSkeleton } from '@/components/ui';
import { StaggerContainer, StaggerItem, FadeIn } from '@/components/layout/PageTransition';
import { useAuth } from '@/context/AuthContext';
import {
    collection,
    query,
    getDocs,
    where,
    orderBy,
    limit,
    getCountFromServer
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User, Hoarding, Booking } from '@/types';
import { format } from 'date-fns';
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

            // Get counts
            const usersCount = await getCountFromServer(collection(db, 'users'));
            const hoardingsSnapshot = await getDocs(collection(db, 'hoardings'));
            const bookingsSnapshot = await getDocs(collection(db, 'bookings'));

            const hoardings = hoardingsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Hoarding));
            const bookings = bookingsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Booking));

            // Calculate stats
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

            // Recent bookings
            const sortedBookings = bookings
                .sort((a: any, b: any) => b.createdAt?.toMillis() - a.createdAt?.toMillis())
                .slice(0, 5);
            setRecentBookings(sortedBookings);

            // Pending hoardings
            const pending = hoardings.filter((h) => !h.isVerified).slice(0, 5);
            setPendingHoardings(pending);

        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            label: 'Total Users',
            value: stats.totalUsers,
            icon: Users,
            color: 'primary' as const,
        },
        {
            label: 'Total Hoardings',
            value: stats.totalHoardings,
            icon: Building2,
            color: 'info' as const,
        },
        {
            label: 'Pending Verifications',
            value: stats.pendingVerifications,
            icon: Clock,
            color: 'warning' as const,
        },
        {
            label: 'Total Revenue',
            value: `₹${stats.revenue.toLocaleString()}`,
            icon: IndianRupee,
            color: 'success' as const,
        },
    ];

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        return format(timestamp.toDate(), 'MMM dd, yyyy');
    };

    return (
        <div className="min-h-screen">
            <Header
                title="Admin Dashboard"
                subtitle={`Welcome back, ${userData?.displayName}`}
            />

            <div className="p-8">
                {/* Stats Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <StatsCardSkeleton key={i} />
                        ))}
                    </div>
                ) : (
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {statCards.map((stat) => (
                            <StaggerItem key={stat.label}>
                                <Card variant="default" className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm text-[var(--text-secondary)] mb-1">{stat.label}</p>
                                            <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                                        </div>
                                        <Icon3D icon={stat.icon} color={stat.color} size="md" />
                                    </div>
                                </Card>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Bookings */}
                    <FadeIn delay={0.2}>
                        <Card variant="default" className="p-6">
                            <CardHeader className="flex items-center justify-between">
                                <CardTitle>Recent Bookings</CardTitle>
                                <Link href="/admin/bookings">
                                    <Button variant="ghost" size="sm" icon={<ChevronRight className="w-4 h-4" />} iconPosition="right">
                                        View All
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                {recentBookings.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Calendar className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)]" />
                                        <p className="text-sm text-[var(--text-secondary)]">No bookings yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {recentBookings.map((booking) => (
                                            <div
                                                key={booking.id}
                                                className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] transition-colors"
                                            >
                                                <div>
                                                    <p className="font-medium text-[var(--text-primary)] text-sm">
                                                        {booking.hoardingTitle || 'Hoarding'}
                                                    </p>
                                                    <p className="text-xs text-[var(--text-tertiary)]">
                                                        {booking.advertiserName || 'Advertiser'}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-medium text-[var(--text-primary)]">
                                                        ₹{booking.totalAmount.toLocaleString()}
                                                    </span>
                                                    <StatusBadge status={booking.status} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </FadeIn>

                    {/* Pending Verifications */}
                    <FadeIn delay={0.3}>
                        <Card variant="default" className="p-6">
                            <CardHeader className="flex items-center justify-between">
                                <CardTitle>Pending Verifications</CardTitle>
                                <Link href="/admin/hoardings">
                                    <Button variant="ghost" size="sm" icon={<ChevronRight className="w-4 h-4" />} iconPosition="right">
                                        View All
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                {pendingHoardings.length === 0 ? (
                                    <div className="text-center py-8">
                                        <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                                        <p className="text-sm text-[var(--text-secondary)]">All hoardings verified!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {pendingHoardings.map((hoarding) => (
                                            <div
                                                key={hoarding.id}
                                                className="flex items-center gap-4 p-3 rounded-[var(--radius-md)] bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] transition-colors"
                                            >
                                                <div className="w-12 h-12 rounded-[var(--radius-sm)] bg-[var(--bg-secondary)] overflow-hidden flex-shrink-0">
                                                    {hoarding.images && hoarding.images[0] ? (
                                                        <img src={hoarding.images[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Building2 className="w-5 h-5 text-[var(--text-tertiary)]" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-[var(--text-primary)] text-sm truncate">
                                                        {hoarding.title}
                                                    </p>
                                                    <p className="text-xs text-[var(--text-tertiary)]">
                                                        {hoarding.ownerName || 'Owner'}
                                                    </p>
                                                </div>
                                                <Badge variant="warning">Pending</Badge>
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
