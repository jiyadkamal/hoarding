'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, IndianRupee, Check, X, User } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, Button, Badge, StatusBadge, Modal, Skeleton } from '@/components/ui';
import { StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { getOwnerBookings, updateBookingStatus } from '@/lib/firebase/firestore';
import { Booking } from '@/types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function OwnerRequestsPage() {
    const { userData } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
    const [processing, setProcessing] = useState(false);
    const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

    useEffect(() => {
        if (userData) {
            loadBookings();
        }
    }, [userData]);

    const loadBookings = async () => {
        if (!userData) return;
        try {
            setLoading(true);
            const data = await getOwnerBookings(userData.uid);
            setBookings(data);
        } catch (error) {
            console.error('Error loading bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async () => {
        if (!selectedBooking || !actionType) return;

        setProcessing(true);
        try {
            await updateBookingStatus(selectedBooking.id, actionType === 'approve' ? 'approved' : 'rejected');
            setBookings((prev) =>
                prev.map((b) =>
                    b.id === selectedBooking.id
                        ? { ...b, status: actionType === 'approve' ? 'approved' : 'rejected' }
                        : b
                )
            );
            toast.success(
                actionType === 'approve'
                    ? 'Booking approved! Waiting for payment.'
                    : 'Booking rejected.'
            );
            setSelectedBooking(null);
            setActionType(null);
        } catch (error) {
            toast.error('Failed to process request');
        } finally {
            setProcessing(false);
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        return format(timestamp.toDate(), 'MMM dd, yyyy');
    };

    const filteredBookings = filter === 'all'
        ? bookings
        : bookings.filter((b) => b.status === filter);

    const pendingCount = bookings.filter((b) => b.status === 'pending').length;

    return (
        <div className="min-h-screen">
            <Header
                title="Booking Requests"
                subtitle={`${pendingCount} pending request${pendingCount !== 1 ? 's' : ''}`}
            />

            <div className="p-8">
                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {[
                        { id: 'pending', label: 'Pending', count: bookings.filter((b) => b.status === 'pending').length },
                        { id: 'approved', label: 'Approved', count: bookings.filter((b) => b.status === 'approved').length },
                        { id: 'rejected', label: 'Rejected', count: bookings.filter((b) => b.status === 'rejected').length },
                        { id: 'all', label: 'All', count: bookings.length },
                    ].map((tab) => (
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
                            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${filter === tab.id ? 'bg-white/20' : 'bg-[var(--border-light)]'
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Bookings List */}
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <Card key={i} variant="default" className="p-6">
                                <div className="flex gap-4">
                                    <Skeleton variant="circle" size={48} />
                                    <div className="flex-1 space-y-3">
                                        <Skeleton variant="heading" className="w-1/3" />
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
                            No {filter === 'all' ? '' : filter} requests
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)]">
                            {filter === 'pending'
                                ? "You don't have any pending booking requests."
                                : `No ${filter} bookings found.`
                            }
                        </p>
                    </Card>
                ) : (
                    <StaggerContainer className="space-y-4">
                        {filteredBookings.map((booking) => (
                            <StaggerItem key={booking.id}>
                                <Card variant="default" className="p-6 hover:shadow-[var(--shadow-lg)] transition-all">
                                    <div className="flex flex-col lg:flex-row gap-6">
                                        {/* Advertiser Info */}
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                                                <User className="w-6 h-6 text-[var(--accent-primary)]" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="font-semibold text-[var(--text-primary)]">
                                                        {booking.advertiserName || 'Advertiser'}
                                                    </h3>
                                                    <StatusBadge status={booking.status} />
                                                </div>
                                                <p className="text-sm text-[var(--text-secondary)] mb-3">
                                                    Hoarding: {booking.hoardingTitle || 'Hoarding'}
                                                </p>

                                                <div className="flex flex-wrap gap-4 text-sm">
                                                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>
                                                            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                                        <Clock className="w-4 h-4" />
                                                        <span>Requested {formatDate(booking.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Amount & Actions */}
                                        <div className="flex items-center gap-4 lg:flex-col lg:items-end">
                                            <div className="text-right">
                                                <span className="text-2xl font-bold text-[var(--text-primary)]">
                                                    ₹{booking.totalAmount.toLocaleString()}
                                                </span>
                                                <p className="text-xs text-[var(--text-tertiary)]">Total Amount</p>
                                            </div>

                                            {booking.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        icon={<Check className="w-4 h-4" />}
                                                        onClick={() => {
                                                            setSelectedBooking(booking);
                                                            setActionType('approve');
                                                        }}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        icon={<X className="w-4 h-4" />}
                                                        onClick={() => {
                                                            setSelectedBooking(booking);
                                                            setActionType('reject');
                                                        }}
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                )}
            </div>

            {/* Confirmation Modal */}
            <Modal
                isOpen={!!selectedBooking && !!actionType}
                onClose={() => {
                    setSelectedBooking(null);
                    setActionType(null);
                }}
                title={actionType === 'approve' ? 'Approve Booking' : 'Reject Booking'}
                size="sm"
            >
                <p className="text-[var(--text-secondary)] mb-6">
                    {actionType === 'approve'
                        ? `Are you sure you want to approve this booking request from ${selectedBooking?.advertiserName}? They will be notified to complete payment.`
                        : `Are you sure you want to reject this booking request from ${selectedBooking?.advertiserName}?`
                    }
                </p>
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        fullWidth
                        onClick={() => {
                            setSelectedBooking(null);
                            setActionType(null);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant={actionType === 'approve' ? 'success' : 'danger'}
                        fullWidth
                        loading={processing}
                        onClick={handleAction}
                    >
                        {actionType === 'approve' ? 'Approve' : 'Reject'}
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
