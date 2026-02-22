'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, IndianRupee, Check, X, User, ChevronRight, Filter } from 'lucide-react';
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

    const handleApprove = async (booking: Booking) => {
        setProcessing(true);
        try {
            await updateBookingStatus(booking.id, 'approved');
            setBookings((prev) =>
                prev.map((b) =>
                    b.id === booking.id ? { ...b, status: 'approved' as const } : b
                )
            );
            toast.success('Booking approved! Waiting for payment.');
        } catch (error) {
            toast.error('Failed to approve request');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedBooking) return;

        setProcessing(true);
        try {
            await updateBookingStatus(selectedBooking.id, 'rejected');
            setBookings((prev) =>
                prev.map((b) =>
                    b.id === selectedBooking.id ? { ...b, status: 'rejected' as const } : b
                )
            );
            toast.success('Booking rejected.');
            setSelectedBooking(null);
            setActionType(null);
        } catch (error) {
            toast.error('Failed to reject request');
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

    const filterTabs = [
        { id: 'pending', label: 'Review Required', count: bookings.filter((b) => b.status === 'pending').length },
        { id: 'approved', label: 'Accepted', count: bookings.filter((b) => b.status === 'approved').length },
        { id: 'rejected', label: 'Declined', count: bookings.filter((b) => b.status === 'rejected').length },
        { id: 'all', label: 'History', count: bookings.length },
    ];

    return (
        <div className="min-h-screen bg-white">
            <Header
                title="Booking Requests"
                subtitle={`You have ${pendingCount} pending request${pendingCount !== 1 ? 's' : ''} to review`}
            />

            <div className="p-8 lg:p-12 max-w-[1400px] mx-auto space-y-10">
                {/* Filter Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-500">
                            <Filter className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Workspace Filters</span>
                    </div>

                    <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-2xl border border-slate-100/50">
                        {filterTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setFilter(tab.id as any)}
                                className={`
                                    flex items-center gap-2.5 h-10 px-5 rounded-xl text-[12px] font-bold transition-all duration-300 relative group
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
                    <div className="space-y-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-slate-50 animate-pulse h-48 rounded-[2.5rem]" />
                        ))}
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="py-32 text-center space-y-6">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-[2.5rem] bg-slate-50 flex items-center justify-center shadow-inner border border-slate-100">
                            <Calendar className="w-10 h-10 text-slate-200" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">No requests in queue</h3>
                            <p className="text-[14px] text-slate-400 max-w-xs mx-auto font-medium">
                                {filter === 'pending'
                                    ? "Excellent! You've reached inbox zero for booking requests."
                                    : `We couldn't find any requests with the "${filter}" status.`
                                }
                            </p>
                        </div>
                    </div>
                ) : (
                    <StaggerContainer className="space-y-8">
                        {filteredBookings.map((booking) => (
                            <StaggerItem key={booking.id}>
                                <div className="group bg-white border border-slate-100 rounded-[2.5rem] p-8 lg:p-10 hover:shadow-2xl shadow-slate-200/40 hover:border-emerald-500/10 transition-all duration-500 flex flex-col lg:flex-row gap-10">

                                    {/* Advertiser Info */}
                                    <div className="flex-1 flex gap-8">
                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-500 group-hover:bg-emerald-50 group-hover:border-emerald-100">
                                                <User className="w-10 h-10 text-slate-200 group-hover:text-emerald-500 transition-colors" />
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border-[6px] border-white flex items-center justify-center shadow-2xl">
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                            </div>
                                        </div>

                                        <div className="space-y-6 flex-1">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-4 mb-2">
                                                    <h3 className="text-[22px] font-bold text-slate-900 tracking-tight">
                                                        {booking.advertiserName || 'Anonymous User'}
                                                    </h3>
                                                    <StatusBadge status={booking.status} />
                                                </div>
                                                <p className="text-[15px] font-medium text-slate-400 flex items-center gap-2">
                                                    Requested space: <span className="text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full italic">{booking.hoardingTitle || 'Verified Billboard'}</span>
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-x-10 gap-y-4 pt-2">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Campaign Duration</p>
                                                    <div className="flex items-center gap-2 text-[14px] font-bold text-slate-700">
                                                        <Calendar className="w-4 h-4 text-emerald-500/60" />
                                                        <span>{formatDate(booking.startDate)} &mdash; {formatDate(booking.endDate)}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Submission Date</p>
                                                    <div className="flex items-center gap-2 text-[14px] font-bold text-slate-500">
                                                        <Clock className="w-4 h-4 text-slate-300" />
                                                        <span>{formatDate(booking.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Amount & Quick Actions */}
                                    <div className="flex flex-col justify-between items-end gap-10 pt-8 lg:pt-0 lg:pl-12 lg:border-l lg:border-slate-50 relative">
                                        <div className="text-right space-y-1">
                                            <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">Projected Revenue</p>
                                            <p className="text-[36px] font-black text-slate-900 tracking-tighter leading-none">
                                                ₹{booking.totalAmount.toLocaleString()}
                                            </p>
                                        </div>

                                        <div className="w-full lg:w-auto">
                                            {booking.status === 'pending' ? (
                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={() => handleApprove(booking)}
                                                        disabled={processing}
                                                        className="h-14 px-8 bg-emerald-500 text-white text-[14px] font-black rounded-2xl hover:bg-emerald-400 transition shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-2.5 disabled:opacity-50 active:scale-[0.98]"
                                                    >
                                                        <Check className="w-5 h-5" /> Accept Request
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedBooking(booking);
                                                            setActionType('reject');
                                                        }}
                                                        className="h-14 px-8 bg-white border border-red-100 text-red-500 text-[14px] font-black rounded-2xl hover:bg-red-50 transition flex items-center justify-center gap-2.5 active:scale-[0.98]"
                                                    >
                                                        <X className="w-5 h-5" /> Decline
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="h-12 px-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-slate-300 shadow-sm" />
                                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Review Process Finalized</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
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
                title={actionType === 'approve' ? 'Review Submission' : 'Decline Request'}
                size="sm"
            >
                <div className="space-y-8 p-1">
                    <div className="p-7 bg-red-50/50 rounded-[2.5rem] border border-red-100/50 text-center">
                        <X className="w-12 h-12 text-red-500 mx-auto mb-5" />
                        <p className="text-[16px] text-slate-600 leading-relaxed font-medium">
                            Are you sure you want to decline the request from <br />
                            <span className="font-black text-slate-900 underline decoration-red-500/20 decoration-4 underline-offset-4 tracking-tight">&quot;{selectedBooking?.advertiserName}&quot;</span>?
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            className="flex-1 h-14 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition active:scale-[0.98]"
                            onClick={() => {
                                setSelectedBooking(null);
                                setActionType(null);
                            }}
                        >
                            Back to queue
                        </button>
                        <button
                            className="flex-1 h-14 text-white font-bold rounded-2xl transition shadow-2xl flex items-center justify-center bg-red-500 hover:bg-red-600 shadow-red-500/20 active:scale-[0.98]"
                            onClick={handleReject}
                            disabled={processing}
                        >
                            {processing ? 'Processing...' : 'Confirm Decline'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
