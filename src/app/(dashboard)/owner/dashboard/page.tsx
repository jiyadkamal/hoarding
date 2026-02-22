'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Building2,
    IndianRupee,
    Calendar,
    Clock,
    ChevronRight,
    Plus,
    BarChart,
    PieChart,
    Layers
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { StatusBadge, Button, StatsCardSkeleton } from '@/components/ui';
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
        { label: 'Total Listings', value: hoardings.length, icon: Building2, sub: "Verified Inventory" },
        { label: 'Active Bookings', value: bookings.filter(b => ['approved', 'paid'].includes(b.status)).length, icon: Calendar, sub: "Active Contracts" },
        { label: 'New Requests', value: bookings.filter(b => b.status === 'pending').length, icon: Clock, sub: "Pending Approval" },
        { label: 'Total Revenue', value: `₹${bookings.filter(b => b.paymentStatus === 'confirmed').reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}`, icon: IndianRupee, sub: "Gross Settlements" },
    ];

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        return format(timestamp.toDate(), 'MMM dd, yyyy');
    };

    return (
        <div className="min-h-screen bg-white">
            <Header
                title="Dashboard"
                subtitle="Overview of your listings and performance."
                actions={
                    <Link href="/owner/hoardings/new">
                        <button className="h-10 px-5 bg-emerald-500 text-white text-[13px] font-semibold rounded-lg hover:bg-emerald-600 transition flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                            <Plus className="w-4 h-4" /> Add New Hoarding
                        </button>
                    </Link>
                }
            />

            <div className="p-6 lg:p-8 space-y-10 max-w-[1400px] mx-auto">

                {/* Performance Analytics Header */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-slate-400">
                                <BarChart className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Earnings Growth</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-800">+14.2% <span className="text-[12px] font-medium text-emerald-500 ml-1">vs last month</span></p>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-slate-400">
                                <PieChart className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Occupancy rate</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-800">82.4% <span className="text-[12px] font-medium text-blue-500 ml-1">Optimal</span></p>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Layers className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Platform Rank</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-800">TOP 5% <span className="text-[12px] font-medium text-amber-500 ml-1">Verified Owner</span></p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => <StatsCardSkeleton key={i} />)}
                    </div>
                ) : (
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat) => (
                            <StaggerItem key={stat.label}>
                                <div className="p-6 bg-white border border-slate-150 rounded-2xl hover:border-emerald-500/50 hover:shadow-lg transition-all flex items-start justify-between group">
                                    <div className="space-y-2">
                                        <p className="text-[12px] font-medium text-slate-400">{stat.label}</p>
                                        <p className="text-3xl font-bold text-slate-900 leading-none">{stat.value}</p>
                                        <p className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider pt-2">{stat.sub}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                </div>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Requests */}
                    <FadeIn delay={0.2}>
                        <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
                            <div className="p-6 flex items-center justify-between border-b border-slate-50">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Recent Bookings</h3>
                                <Link href="/owner/requests">
                                    <button className="text-[12px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition">
                                        View all <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </Link>
                            </div>
                            <div className="p-6">
                                {bookings.length === 0 ? (
                                    <div className="text-center py-16 opacity-30 flex flex-col items-center gap-3">
                                        <Calendar className="w-10 h-10 text-slate-300" />
                                        <p className="text-[13px] font-medium text-slate-400 uppercase tracking-wider">No bookings yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {bookings.slice(0, 5).map((booking) => (
                                            <div
                                                key={booking.id}
                                                className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-100 hover:border-emerald-500/30 hover:shadow-sm transition-all"
                                            >
                                                <div className="space-y-1">
                                                    <p className="text-[14px] font-semibold text-slate-800">{booking.advertiserName || 'Anonymous'}</p>
                                                    <p className="text-[11px] text-slate-400">
                                                        {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-5">
                                                    <span className="text-[14px] font-bold text-slate-800">₹{booking.totalAmount.toLocaleString()}</span>
                                                    <StatusBadge status={booking.status} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </FadeIn>

                    {/* Inventory Snapshot */}
                    <FadeIn delay={0.3}>
                        <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
                            <div className="p-6 flex items-center justify-between border-b border-slate-50">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Your Listings</h3>
                                <Link href="/owner/hoardings">
                                    <button className="text-[12px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition">
                                        Manage inventory <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </Link>
                            </div>
                            <div className="p-6">
                                {hoardings.length === 0 ? (
                                    <div className="text-center py-16 flex flex-col items-center gap-4">
                                        <Building2 className="w-10 h-10 text-slate-200" />
                                        <p className="text-[13px] font-medium text-slate-400 uppercase tracking-wider">Empty Inventory</p>
                                        <Link href="/owner/hoardings/new">
                                            <Button variant="primary" size="sm" className="!h-9 !px-4 !text-[12px]">Add first space</Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {hoardings.slice(0, 5).map((hoarding) => (
                                            <div
                                                key={hoarding.id}
                                                className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-100 hover:border-emerald-500/30 transition-all"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-10 rounded-lg bg-slate-50 border border-slate-150 overflow-hidden flex-shrink-0">
                                                        {hoarding.images?.[0] ? (
                                                            <img src={hoarding.images[0]} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Building2 className="w-4 h-4 text-slate-200" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[14px] font-semibold text-slate-800 leading-tight">{hoarding.title}</p>
                                                        <p className="text-[11px] font-medium text-emerald-500 uppercase tracking-widest">{hoarding.location.city}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {hoarding.isVerified ? (
                                                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase border border-emerald-100 italic">VERIFIED</span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[9px] font-bold uppercase border border-amber-100 italic">PENDING</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </div>
    );
}
