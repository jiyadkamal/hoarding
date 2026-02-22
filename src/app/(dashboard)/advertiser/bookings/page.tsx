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
        { id: 'all', label: 'All', count: bookings.length },
        { id: 'pending', label: 'Pending', count: bookings.filter((b) => b.status === 'pending').length },
        { id: 'approved', label: 'To Pay', count: bookings.filter((b) => b.status === 'approved').length },
        { id: 'paid', label: 'Paid', count: bookings.filter((b) => b.status === 'paid').length },
        { id: 'completed', label: 'Completed', count: bookings.filter((b) => b.status === 'completed').length },
    ];

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        return format(timestamp.toDate(), 'MMM dd, yyyy');
    };

    return (
        <div className="min-h-screen bg-white">
            <Header
                title="My Bookings"
                subtitle="Track and manage your hoarding bookings"
            />

            <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-4 border-b border-slate-100">
                    {filterTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id as any)}
                            className={`
                                flex items-center gap-2 h-10 px-5 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap
                                ${filter === tab.id
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                }
                            `}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${filter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Bookings List */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[...Array(6)].map((_, i) => <HoardingCardSkeleton key={i} />)}
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="py-24 text-center space-y-4">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-50 flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-slate-200" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-400">
                            No bookings found
                        </h3>
                        <p className="text-[14px] text-slate-300 max-w-xs mx-auto">
                            {filter === 'all'
                                ? "You haven't made any bookings yet."
                                : `You don't have any bookings with status "${filter}".`
                            }
                        </p>
                        <Link href="/advertiser/browse" className="inline-block mt-4">
                            <Button variant="primary">Browse Hoardings</Button>
                        </Link>
                    </div>
                ) : (
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBookings.map((booking) => (
                            <StaggerItem key={booking.id}>
                                <div className="group bg-white border border-slate-150 rounded-xl overflow-hidden hover:shadow-lg hover:border-slate-200 transition-all duration-300 flex flex-col h-full">
                                    <div className="p-6 space-y-5 flex-1">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <h3 className="text-[16px] font-semibold text-slate-800 leading-snug group-hover:text-emerald-600 transition-colors">
                                                    {booking.hoardingTitle || 'Hoarding Space'}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <StatusBadge status={booking.status} />
                                                    <span className="text-[11px] font-medium text-slate-300">ID: {booking.id.slice(0, 8)}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[18px] font-bold text-slate-800">₹{booking.totalAmount.toLocaleString()}</p>
                                                <p className="text-[11px] text-slate-300">Total Price</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-2 border-t border-slate-50">
                                            <div className="flex items-center gap-2.5 text-[13px] text-slate-500">
                                                <Calendar className="w-4 h-4 text-slate-300" />
                                                <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-2.5 text-[13px] text-slate-500">
                                                <Clock className="w-4 h-4 text-slate-300" />
                                                <span>Booked on {formatDate(booking.createdAt)}</span>
                                            </div>
                                        </div>

                                        {/* Contextual Messages */}
                                        {booking.status === 'pending' && (
                                            <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                                                <p className="text-[12px] text-amber-700 font-medium">
                                                    Awaiting review by site owner. You&apos;ll be notified once approved.
                                                </p>
                                            </div>
                                        )}
                                        {booking.status === 'approved' && (
                                            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                                                <p className="text-[12px] text-emerald-700 font-medium">
                                                    Booking approved! Please complete payment to secure your dates.
                                                </p>
                                            </div>
                                        )}
                                        {booking.status === 'rejected' && (
                                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                                                <p className="text-[12px] text-red-700 font-medium">
                                                    This request was declined. Please choose different dates.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                                        <Link href={`/advertiser/hoarding/${booking.hoardingId}`} className="flex-1">
                                            <button className="w-full h-10 bg-white border border-slate-200 text-[12px] font-medium text-slate-600 rounded-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5">
                                                View Space <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </Link>
                                        {booking.status === 'approved' && (
                                            <button
                                                onClick={() => handlePayNow(booking)}
                                                className="flex-1 h-10 bg-emerald-500 text-white text-[12px] font-semibold rounded-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
                                            >
                                                <CreditCard className="w-4 h-4" /> Pay Now
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
