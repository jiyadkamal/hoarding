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
        { label: 'Total Listings', value: hoardings.length, icon: Building2, sub: "Verified Inventory", color: "emerald" },
        { label: 'Active Bookings', value: bookings.filter(b => ['approved', 'paid'].includes(b.status)).length, icon: Calendar, sub: "Active Contracts", color: "blue" },
        { label: 'New Requests', value: bookings.filter(b => b.status === 'pending').length, icon: Clock, sub: "Pending Approval", color: "violet" },
        { label: 'Total Revenue', value: `₹${bookings.filter(b => b.paymentStatus === 'confirmed').reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}`, icon: IndianRupee, sub: "Gross Earnings", color: "amber" },
    ];

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        return format(timestamp.toDate(), 'MMM dd, yyyy');
    };

    return (
        <div className="min-h-screen bg-white">
            <Header
                title="Dashboard"
                subtitle="Overview of your listings and business performance."
                actions={
                    <Link href="/owner/hoardings/new">
                        <button className="h-11 px-6 bg-emerald-500 text-white text-[13px] font-bold rounded-xl hover:bg-emerald-400 transition flex items-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-[0.98]">
                            <Plus className="w-4 h-4" /> Add New Space
                        </button>
                    </Link>
                }
            />

            <div className="p-8 lg:p-12 space-y-12 max-w-[1400px] mx-auto">

                {/* Performance Analytics Header */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-7 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-between group hover:bg-white hover:border-emerald-200 hover:shadow-xl transition-all duration-300">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-slate-400">
                                <BarChart className="w-4 h-4 text-emerald-500/70" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Earnings Growth</span>
                            </div>
                            <p className="text-3xl font-black text-slate-900 tracking-tighter">+14.2% <span className="text-[12px] font-bold text-emerald-500 ml-1">↑</span></p>
                        </div>
                    </div>
                    <div className="p-7 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-between group hover:bg-white hover:border-blue-200 hover:shadow-xl transition-all duration-300">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-slate-400">
                                <PieChart className="w-4 h-4 text-blue-500/70" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Occupancy rate</span>
                            </div>
                            <p className="text-3xl font-black text-slate-900 tracking-tighter">82.4% <span className="text-[12px] font-bold text-blue-500 ml-1">Optimal</span></p>
                        </div>
                    </div>
                    <div className="p-7 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-between group hover:bg-white hover:border-violet-200 hover:shadow-xl transition-all duration-300">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Layers className="w-4 h-4 text-violet-500/70" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Platform Rank</span>
                            </div>
                            <p className="text-3xl font-black text-slate-900 tracking-tighter">TOP 5% <span className="text-[12px] font-bold text-amber-500 ml-1">Pro Owner</span></p>
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
                                <div className="relative p-7 bg-white border border-slate-100 rounded-[2rem] hover:border-emerald-500/30 hover:shadow-2xl transition-all duration-500 group overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-emerald-50 transition-colors" />

                                    <div className="relative z-10 space-y-4">
                                        <div className={`w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-lg shadow-slate-200/50 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500`}>
                                            <stat.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                            <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                                        </div>
                                        <p className="text-[10px] font-bold text-emerald-600/80 uppercase tracking-widest bg-emerald-50 w-fit px-2.5 py-1 rounded-full">{stat.sub}</p>
                                    </div>
                                </div>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-4">
                    {/* Recent Bookings */}
                    <FadeIn delay={0.2}>
                        <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/40">
                            <div className="p-8 pb-4 flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recent Bookings</h3>
                                    <p className="text-[13px] text-slate-400">Latest business activity</p>
                                </div>
                                <Link href="/owner/requests">
                                    <button className="h-10 px-5 rounded-full border border-slate-100 text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition flex items-center gap-1.5">
                                        Manage All <ChevronRight className="w-4 h-4" />
                                    </button>
                                </Link>
                            </div>
                            <div className="p-8 pt-4">
                                {bookings.length === 0 ? (
                                    <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 space-y-4">
                                        <Calendar className="w-12 h-12 text-slate-200 mx-auto" />
                                        <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">No active bookings</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {bookings.slice(0, 5).map((booking) => (
                                            <div
                                                key={booking.id}
                                                className="flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-50 hover:border-emerald-200 hover:shadow-lg transition-all group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center font-bold text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                                        {booking.advertiserName?.charAt(0) || 'A'}
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-[14px] font-bold text-slate-900">{booking.advertiserName || 'Anonymous'}</p>
                                                        <p className="text-[11px] font-medium text-slate-400">
                                                            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <span className="text-[15px] font-black text-slate-900">₹{booking.totalAmount.toLocaleString()}</span>
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
                        <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/40">
                            <div className="p-8 pb-4 flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Your Listings</h3>
                                    <p className="text-[13px] text-slate-400">Total active real-estate</p>
                                </div>
                                <Link href="/owner/hoardings">
                                    <button className="h-10 px-5 rounded-full border border-slate-100 text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition flex items-center gap-1.5">
                                        View Inventory <ChevronRight className="w-4 h-4" />
                                    </button>
                                </Link>
                            </div>
                            <div className="p-8 pt-4">
                                {hoardings.length === 0 ? (
                                    <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 space-y-6">
                                        <Building2 className="w-12 h-12 text-slate-200 mx-auto" />
                                        <div className="space-y-2">
                                            <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">Inventory is empty</p>
                                            <p className="text-[11px] text-slate-300">Add your first billboards to start earning</p>
                                        </div>
                                        <Link href="/owner/hoardings/new">
                                            <Button variant="primary" className="h-11 px-6 rounded-xl font-bold text-[13px] shadow-lg shadow-emerald-500/20">Add first space</Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {hoardings.slice(0, 5).map((hoarding) => (
                                            <div
                                                key={hoarding.id}
                                                className="flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-50 hover:border-emerald-200 hover:shadow-lg transition-all group"
                                            >
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className="w-14 h-11 rounded-xl bg-slate-100 border border-slate-100 overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                                                        {hoarding.images?.[0] ? (
                                                            <img src={hoarding.images[0]} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Building2 className="w-5 h-5 text-slate-300" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-0.5 min-w-0">
                                                        <p className="text-[14px] font-bold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">{hoarding.title}</p>
                                                        <p className="text-[11px] font-bold text-emerald-500/80 uppercase tracking-widest">{hoarding.location.city}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {hoarding.isVerified ? (
                                                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100/50">Verified</span>
                                                    ) : (
                                                        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest border border-amber-100/50">Pending</span>
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
