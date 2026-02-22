'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ChevronRight, Clock, CreditCard } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { StatusBadge, Button, HoardingCardSkeleton } from '@/components/ui';
import { StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { getAdvertiserBookings } from '@/lib/firebase/firestore';
import { Booking } from '@/types';
import { format } from 'date-fns';
import Link from 'next/link';
import PaymentModal from '@/components/booking/PaymentModal';
import toast from 'react-hot-toast';

export default function AdvertiserBookingsPage() {
    const { userData } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'paid' | 'completed'>('all');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    useEffect(() => {
        if (userData) {
            loadBookings();
        }
    }, [userData]);

    const loadBookings = async () => {
        if (!userData) return;
        try {
            setLoading(true);
            const data = await getAdvertiserBookings(userData.uid);
            setBookings(data);
        } catch (error) {
            console.error('Error loading bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePayNow = (booking: Booking) => {
        setSelectedBooking(booking);
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = () => {
        setShowPaymentModal(false);
        setSelectedBooking(null);
        toast.success('Payment successful! Booking confirmed.');
        loadBookings(); // Refresh bookings
    };

    const filteredBookings = filter === 'all'
        ? bookings
        : bookings.filter((b) => b.status === filter);

    const filterTabs = [
        { id: 'all', label: 'All Campaigns', count: bookings.length },
        { id: 'pending', label: 'In Review', count: bookings.filter((b) => b.status === 'pending').length },
        { id: 'approved', label: 'Ready for Payment', count: bookings.filter((b) => b.status === 'approved').length },
        { id: 'paid', label: 'Active/Paid', count: bookings.filter((b) => b.status === 'paid').length },
        { id: 'completed', label: 'Past Campaigns', count: bookings.filter((b) => b.status === 'completed').length },
    ];

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        return format(timestamp.toDate(), 'MMM dd, yyyy');
    };

    return (
        <div className="min-h-screen bg-white">
            <Header
                title="My Campaigns"
                subtitle="Track and manage your advertisement inventory and bookings"
            />

            <div className="p-8 lg:p-12 max-w-[1400px] mx-auto space-y-10">
                {/* Filter Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2 border-b border-slate-50">
                    <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-2xl border border-slate-100/50 overflow-x-auto">
                        {filterTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setFilter(tab.id as any)}
                                className={`
                                    flex items-center gap-2.5 h-10 px-5 rounded-xl text-[12px] font-bold transition-all duration-300 relative group whitespace-nowrap
                                    ${filter === tab.id
                                        ? 'bg-white text-emerald-600 shadow-xl shadow-slate-200/50 border border-slate-100'
                                        : 'text-slate-400 hover:text-slate-600'
                                    }
                                `}
                            >
                                <span>{tab.label}</span>
                                {tab.count > 0 && (
                                    <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-lg text-[9px] font-black transition-colors ${filter === tab.id ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400 group-hover:bg-slate-300'
                                        }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bookings List */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => <HoardingCardSkeleton key={i} />)}
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="py-40 text-center space-y-8">
                        <div className="w-24 h-24 mx-auto bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-center shadow-inner">
                            <Calendar className="w-10 h-10 text-slate-200" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">No campaigns found</h3>
                            <p className="text-[15px] text-slate-400 font-medium max-w-sm mx-auto italic">
                                {filter === 'all'
                                    ? "You haven't initiated any bookings yet. Start your first campaign today."
                                    : `We couldn't find any campaigns with status "${filter}".`
                                }
                            </p>
                        </div>
                        <Link href="/advertiser/browse" className="inline-block">
                            <button className="h-14 px-8 bg-emerald-500 text-white text-[13px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-400 transition shadow-xl shadow-emerald-500/20 active:scale-[0.98]">
                                Explore Marketplace
                            </button>
                        </Link>
                    </div>
                ) : (
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredBookings.map((booking) => (
                            <StaggerItem key={booking.id}>
                                <div className="group bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] hover:border-emerald-500/10 transition-all duration-700 flex flex-col h-full relative">
                                    <div className="p-8 flex-1 space-y-8 flex flex-col">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <StatusBadge status={booking.status} />
                                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ID {booking.id.slice(0, 8)}</span>
                                                </div>
                                                <h3 className="text-[20px] font-bold text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors tracking-tight">
                                                    {booking.hoardingTitle || 'Verified Billboard'}
                                                </h3>
                                            </div>
                                            <div className="text-right space-y-0.5">
                                                <p className="text-[22px] font-black text-slate-900 tracking-tighter leading-none">₹{booking.totalAmount.toLocaleString()}</p>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Gross Price</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-6 border-t border-slate-50 flex-1">
                                            <div className="flex items-center gap-3 text-[14px] font-bold text-slate-600">
                                                <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-colors">
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <span>{formatDate(booking.startDate)} &mdash; {formatDate(booking.endDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[13px] font-bold text-slate-400 italic">
                                                <div className="p-2 rounded-lg bg-slate-50/50 text-slate-300">
                                                    <Clock className="w-4 h-4" />
                                                </div>
                                                <span>Booked {formatDate(booking.createdAt)}</span>
                                            </div>
                                        </div>

                                        {/* Status Messaging */}
                                        <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-700">
                                            {booking.status === 'pending' && (
                                                <div className="p-4 bg-amber-50/50 border border-amber-100/50 rounded-2xl flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                                    <p className="text-[11px] text-amber-700 font-bold uppercase tracking-widest">Under Owner Review</p>
                                                </div>
                                            )}
                                            {booking.status === 'approved' && (
                                                <div className="p-4 bg-emerald-50 border border-emerald-100/50 rounded-2xl flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    <p className="text-[11px] text-emerald-700 font-bold uppercase tracking-widest leading-relaxed">System Ready &bull; Payment Required</p>
                                                </div>
                                            )}
                                            {booking.status === 'rejected' && (
                                                <div className="p-4 bg-red-50/50 border border-red-100/50 rounded-2xl flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-red-400" />
                                                    <p className="text-[11px] text-red-700 font-bold uppercase tracking-widest">Submission Declined</p>
                                                </div>
                                            )}
                                            {booking.status === 'paid' && (
                                                <div className="p-4 bg-slate-900 rounded-2xl flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                                                    <p className="text-[11px] text-white font-bold uppercase tracking-[0.2em]">Campaign Confirmed</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-3">
                                        <Link href={`/advertiser/hoarding/${booking.hoardingId}`} className="flex-1">
                                            <button className="w-full h-12 bg-white border border-slate-100 text-[11px] font-black uppercase tracking-widest text-slate-500 rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                                                View Space <ChevronRight className="w-3.5 h-3.5" />
                                            </button>
                                        </Link>
                                        {booking.status === 'approved' && (
                                            <button
                                                onClick={() => handlePayNow(booking)}
                                                className="flex-1 h-12 bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-[0.98]"
                                            >
                                                <CreditCard className="w-4 h-4" /> Finalize Payment
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                )}
            </div>

            {/* Payment Modal */}
            {selectedBooking && (
                <PaymentModal
                    isOpen={showPaymentModal}
                    onClose={() => {
                        setShowPaymentModal(false);
                        setSelectedBooking(null);
                    }}
                    onSuccess={handlePaymentSuccess}
                    bookingId={selectedBooking.id}
                    amount={selectedBooking.totalAmount}
                />
            )}
        </div>
    );
}
