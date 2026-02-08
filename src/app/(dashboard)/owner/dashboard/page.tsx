'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Building2,
    IndianRupee,
    TrendingUp,
    Calendar,
    Clock,
    AlertCircle,
    CheckCircle,
    ChevronRight
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent, Badge, StatusBadge, Button, Icon3D, StatsCardSkeleton } from '@/components/ui';
import { StaggerContainer, StaggerItem, FadeIn } from '@/components/layout/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { getOwnerHoardings, getOwnerBookings } from '@/lib/firebase/firestore';
import { Hoarding, Booking } from '@/types';
import { format } from 'date-fns';
import Link from 'next/link';

export default function OwnerDashboardPage() {
    const { userData } = useAuth();
    const [hoardings, setHoardings] = useState<Hoarding[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userData) {
            loadData();
        }
    }, [userData]);

    const loadData = async () => {
        if (!userData) return;
        try {
            setLoading(true);
            const [hoardingsData, bookingsData] = await Promise.all([
                getOwnerHoardings(userData.uid),
                getOwnerBookings(userData.uid),
            ]);
            setHoardings(hoardingsData);
            setBookings(bookingsData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        {
            label: 'Total Hoardings',
            value: hoardings.length,
            icon: Building2,
            color: 'primary' as const,
            trend: '+2 this month',
        },
        {
            label: 'Active Bookings',
            value: bookings.filter((b) => ['approved', 'paid'].includes(b.status)).length,
            icon: Calendar,
            color: 'success' as const,
        },
        {
            label: 'Pending Requests',
            value: bookings.filter((b) => b.status === 'pending').length,
            icon: Clock,
            color: 'warning' as const,
        },
        {
            label: 'Total Revenue',
            value: `₹${bookings
                .filter((b) => b.paymentStatus === 'confirmed')
                .reduce((sum, b) => sum + b.totalAmount, 0)
                .toLocaleString()}`,
            icon: IndianRupee,
            color: 'info' as const,
        },
    ];

    const recentBookings = bookings.slice(0, 5);

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        return format(timestamp.toDate(), 'MMM dd, yyyy');
    };

    // Check if owner is approved
    if (false) { // Approval check removed - all users auto-approved
        return (
            <div className="min-h-screen">
                <Header title="Owner Dashboard" />
                <div className="p-8">
                    <Card variant="glass" className="p-12 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                            <AlertCircle className="w-10 h-10 text-amber-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                            Pending Approval
                        </h2>
                        <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-6">
                            Your account is pending admin approval. You&apos;ll be able to add hoardings
                            and receive bookings once your account is verified.
                        </p>
                        <Badge variant="warning" className="text-sm">
                            Approval typically takes 24-48 hours
                        </Badge>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Header
                title="Owner Dashboard"
                subtitle={`Welcome back, ${userData?.displayName}`}
                actions={
                    <Link href="/owner/hoardings/new">
                        <Button variant="primary" icon={<Building2 className="w-4 h-4" />}>
                            Add Hoarding
                        </Button>
                    </Link>
                }
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
                        {stats.map((stat, index) => (
                            <StaggerItem key={stat.label}>
                                <Card variant="default" className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm text-[var(--text-secondary)] mb-1">{stat.label}</p>
                                            <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                                            {stat.trend && (
                                                <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                                                    <TrendingUp className="w-3 h-3" />
                                                    {stat.trend}
                                                </p>
                                            )}
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
                                <CardTitle>Recent Booking Requests</CardTitle>
                                <Link href="/owner/requests">
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
                                                        {booking.advertiserName || 'Advertiser'}
                                                    </p>
                                                    <p className="text-xs text-[var(--text-tertiary)]">
                                                        {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
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

                    {/* My Hoardings */}
                    <FadeIn delay={0.3}>
                        <Card variant="default" className="p-6">
                            <CardHeader className="flex items-center justify-between">
                                <CardTitle>My Hoardings</CardTitle>
                                <Link href="/owner/hoardings">
                                    <Button variant="ghost" size="sm" icon={<ChevronRight className="w-4 h-4" />} iconPosition="right">
                                        View All
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                {hoardings.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Building2 className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)]" />
                                        <p className="text-sm text-[var(--text-secondary)] mb-3">No hoardings added yet</p>
                                        <Link href="/owner/hoardings/new">
                                            <Button variant="primary" size="sm">Add Your First Hoarding</Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {hoardings.slice(0, 4).map((hoarding) => (
                                            <div
                                                key={hoarding.id}
                                                className="flex items-center gap-4 p-3 rounded-[var(--radius-md)] bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] transition-colors"
                                            >
                                                <div className="w-16 h-12 rounded-[var(--radius-sm)] bg-[var(--bg-secondary)] overflow-hidden flex-shrink-0">
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
                                                        {hoarding.location.city}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {hoarding.isVerified ? (
                                                        <Badge variant="success" className="text-xs">Verified</Badge>
                                                    ) : (
                                                        <Badge variant="warning" className="text-xs">Pending</Badge>
                                                    )}
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
