'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, IndianRupee, ChevronRight, Clock, CreditCard } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, Badge, StatusBadge, Button, Skeleton } from '@/components/ui';
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
        { id: 'approved', label: 'Approved', count: bookings.filter((b) => b.status === 'approved').length },
        { id: 'paid', label: 'Paid', count: bookings.filter((b) => b.status === 'paid').length },
        { id: 'completed', label: 'Completed', count: bookings.filter((b) => b.status === 'completed').length },
    ];

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        return format(timestamp.toDate(), 'MMM dd, yyyy');
    };

    return (
        <div className="min-h-screen">
            <Header
                title="My Bookings"
                subtitle="Track and manage your hoarding bookings"
            />

            <div className="p-8">
                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {filterTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id as any)}
                            className={`
                px-4 py-2 rounded-[var(--radius-full)] text-sm font-medium whitespace-nowrap transition-all
                ${filter === tab.id
                                    ? 'bg-[var(--accent-primary)] text-white'
                                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                                }
              `}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${filter === tab.id ? 'bg-white/20' : 'bg-[var(--border-light)]'
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Bookings List */}
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <Card key={i} variant="default" className="p-6">
                                <div className="flex gap-6">
                                    <Skeleton variant="rect" width={200} height={120} />
                                    <div className="flex-1 space-y-3">
                                        <Skeleton variant="heading" className="w-1/3" />
                                        <Skeleton variant="text" className="w-1/4" />
                                        <Skeleton variant="text" className="w-1/2" />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <Card variant="glass" className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-[var(--text-tertiary)]" />
                        </div>
                        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                            No bookings found
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] mb-4">
                            {filter === 'all'
                                ? "You haven't made any bookings yet."
                                : `No ${filter} bookings at the moment.`
                            }
                        </p>
                        <Link href="/advertiser/browse">
                            <Button variant="primary">Browse Hoardings</Button>
                        </Link>
                    </Card>
                ) : (
                    <StaggerContainer className="space-y-4">
                        {filteredBookings.map((booking) => (
                            <StaggerItem key={booking.id}>
                                <Card variant="default" className="p-6 hover:shadow-[var(--shadow-lg)] transition-all">
                                    <div className="flex flex-col lg:flex-row gap-6">
                                        {/* Booking Info */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                                                        {booking.hoardingTitle || 'Hoarding'}
                                                    </h3>
                                                    <StatusBadge status={booking.status} />
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xl font-bold text-[var(--text-primary)]">
                                                        ₹{booking.totalAmount.toLocaleString()}
                                                    </span>
                                                    <p className="text-xs text-[var(--text-tertiary)]">Total</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>
                                                        {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                                    <Clock className="w-4 h-4" />
                                                    <span>Booked {formatDate(booking.createdAt)}</span>
                                                </div>
                                            </div>

                                            {/* Status Messages */}
                                            {booking.status === 'pending' && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mt-4 p-3 rounded-[var(--radius-md)] bg-blue-500/10 border border-blue-500/20"
                                                >
                                                    <p className="text-sm text-blue-600">
                                                        ⏳ Waiting for owner approval...
                                                    </p>
                                                </motion.div>
                                            )}
                                            {booking.status === 'approved' && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mt-4 p-3 rounded-[var(--radius-md)] bg-emerald-500/10 border border-emerald-500/20"
                                                >
                                                    <p className="text-sm text-emerald-600">
                                                        ✅ Approved! Complete payment to confirm your booking.
                                                    </p>
                                                </motion.div>
                                            )}
                                            {booking.status === 'rejected' && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mt-4 p-3 rounded-[var(--radius-md)] bg-red-500/10 border border-red-500/20"
                                                >
                                                    <p className="text-sm text-red-600">
                                                        ❌ This booking was rejected by the owner.
                                                    </p>
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex lg:flex-col items-center justify-end gap-3">
                                            {booking.status === 'approved' && (
                                                <Button
                                                    variant="gradient"
                                                    size="sm"
                                                    icon={<CreditCard className="w-4 h-4" />}
                                                    onClick={() => handlePayNow(booking)}
                                                >
                                                    Pay Now
                                                </Button>
                                            )}
                                            <Link href={`/advertiser/hoarding/${booking.hoardingId}`}>
                                                <Button variant="secondary" size="sm" icon={<ChevronRight className="w-4 h-4" />} iconPosition="right">
                                                    View Hoarding
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </Card>
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

