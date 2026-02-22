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
        { id: 'pending', label: 'Pending', count: bookings.filter((b) => b.status === 'pending').length },
        { id: 'approved', label: 'Approved', count: bookings.filter((b) => b.status === 'approved').length },
        { id: 'rejected', label: 'Rejected', count: bookings.filter((b) => b.status === 'rejected').length },
        { id: 'all', label: 'Show All', count: bookings.length },
    ];

    return (
        <div className="min-h-screen bg-white">
            <Header
                title="Booking Requests"
                subtitle={`You have ${pendingCount} pending request${pendingCount !== 1 ? 's' : ''} to review`}
            />

            <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8">
                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2 mr-4 pr-4 border-r border-slate-100 text-slate-400">
                        <Filter className="w-4 h-4" />
                        <span className="text-[12px] font-bold uppercase tracking-widest">Filter</span>
                    </div>
                    {filterTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id as any)}
                            className={`
                                flex items-center gap-2 h-10 px-5 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap
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
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-slate-50 animate-pulse h-40 rounded-2xl" />
                        ))}
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="py-24 text-center space-y-4">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-50 flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">No {filter !== 'all' ? filter : ''} requests</h3>
                        <p className="text-[14px] text-slate-400 max-w-xs mx-auto">
                            {filter === 'pending'
                                ? "Great job! You've reviewed all incoming booking requests."
                                : `No requests found matching the "${filter}" filter.`
                            }
                        </p>
                    </div>
                ) : (
                    <StaggerContainer className="space-y-6">
                        {filteredBookings.map((booking) => (
                            <StaggerItem key={booking.id}>
                                <div className="group bg-white border border-slate-150 rounded-2xl p-6 lg:p-8 hover:shadow-xl hover:border-emerald-500/20 transition-all duration-300 flex flex-col lg:flex-row gap-8 shadow-sm">

                                    {/* Advertiser Info */}
                                    <div className="flex-1 flex gap-6">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                <User className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border-4 border-white flex items-center justify-center shadow-lg">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            </div>
                                        </div>

                                        <div className="space-y-4 flex-1">
                                            <div>
                                                <div className="flex items-center gap-4 mb-1">
                                                    <h3 className="text-[18px] font-bold text-slate-800">
                                                        {booking.advertiserName || 'Anonymous Advertiser'}
                                                    </h3>
                                                    <StatusBadge status={booking.status} />
                                                </div>
                                                <p className="text-[14px] font-medium text-slate-500 flex items-center gap-1.5 italic">
                                                    Space: <span className="text-emerald-600 not-italic font-semibold">{booking.hoardingTitle || 'Hoarding Space'}</span>
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-x-8 gap-y-3">
                                                <div className="flex items-center gap-2.5 text-[13px] text-slate-500 font-medium">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                                        <Calendar className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                    <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                                                </div>
                                                <div className="flex items-center gap-2.5 text-[13px] text-slate-500 font-medium">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                                        <Clock className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                    <span>Requested on {formatDate(booking.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Amount & Quick Actions */}
                                    <div className="flex flex-col justify-between items-end gap-6 pt-6 lg:pt-0 lg:pl-8 lg:border-l lg:border-slate-50">
                                        <div className="text-right space-y-1">
                                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Calculated Revenue</p>
                                            <p className="text-3xl font-black text-slate-800 tracking-tight">
                                                ₹{booking.totalAmount.toLocaleString()}
                                            </p>
                                        </div>

                                        {booking.status === 'pending' && (
                                            <div className="flex gap-2 w-full lg:w-auto">
                                                <button
                                                    onClick={() => handleApprove(booking)}
                                                    disabled={processing}
                                                    className="flex-1 lg:flex-none h-11 px-6 bg-emerald-500 text-white text-[13px] font-bold rounded-xl hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    <Check className="w-4 h-4" /> Accept
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedBooking(booking);
                                                        setActionType('reject');
                                                    }}
                                                    className="flex-1 lg:flex-none h-11 px-6 bg-white border border-red-100 text-red-500 text-[13px] font-bold rounded-xl hover:bg-red-50 transition flex items-center justify-center gap-2"
                                                >
                                                    <X className="w-4 h-4" /> Reject
                                                </button>
                                            </div>
                                        )}

                                        {booking.status !== 'pending' && (
                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Review Locked</p>
                                            </div>
                                        )}
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
                title={actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
                size="sm"
            >
                <div className="space-y-6">
                    <p className="text-[15px] text-slate-500 leading-relaxed">
                        Are you sure you want to reject this request from <span className="font-bold text-slate-800">{selectedBooking?.advertiserName}</span>? This action will decline their booking attempt.
                    </p>
                    <div className="flex gap-3">
                        <button
                            className="flex-1 h-12 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition"
                            onClick={() => {
                                setSelectedBooking(null);
                                setActionType(null);
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            className="flex-1 h-12 text-white font-bold rounded-xl transition shadow-lg flex items-center justify-center bg-red-500 hover:bg-red-600 shadow-red-500/20"
                            onClick={handleReject}
                            disabled={processing}
                        >
                            {processing ? 'Processing...' : 'Reject Now'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
