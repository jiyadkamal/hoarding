'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    Maximize2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    X,
    ArrowLeft
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button, HoardingCardSkeleton } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { getHoarding, createBooking, checkDateAvailability, getHoardingBookedDates } from '@/lib/firebase/firestore';
import { Hoarding } from '@/types';
import { Timestamp } from 'firebase/firestore';
import { differenceInDays, format } from 'date-fns';
import toast from 'react-hot-toast';
import BookingCalendar from '@/components/booking/BookingCalendar';

export default function HoardingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { userData } = useAuth();
    const [hoarding, setHoarding] = useState<Hoarding | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showGallery, setShowGallery] = useState(false);

    // Booking State
    const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
    const [bookedDates, setBookedDates] = useState<{ start: Date; end: Date }[]>([]);
    const [bookingLoading, setBookingLoading] = useState(false);

    useEffect(() => {
        loadHoarding();
    }, [params.id]);

    const loadHoarding = async () => {
        try {
            setLoading(true);
            const data = await getHoarding(params.id as string);
            setHoarding(data);
            if (data) {
                const dates = await getHoardingBookedDates(data.id);
                setBookedDates(dates);
            }
        } catch (error) {
            console.error('Error loading hoarding:', error);
            toast.error('Failed to load hoarding details');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        if (!selectedStartDate || !selectedEndDate || !hoarding) return 0;
        const days = differenceInDays(selectedEndDate, selectedStartDate) + 1;
        return days * hoarding.pricePerDay;
    };

    const handleBooking = async () => {
        if (!selectedStartDate || !selectedEndDate) {
            toast.error('Please select booking dates');
            return;
        }

        if (!hoarding || !userData) return;

        if (selectedEndDate < selectedStartDate) {
            toast.error('End date must be after start date');
            return;
        }

        setBookingLoading(true);

        try {
            const isAvailable = await checkDateAvailability(hoarding.id, selectedStartDate, selectedEndDate);
            if (!isAvailable) {
                toast.error('These dates are already booked');
                setBookingLoading(false);
                return;
            }

            await createBooking({
                hoardingId: hoarding.id,
                hoardingTitle: hoarding.title,
                advertiserId: userData.uid,
                advertiserName: userData.displayName,
                ownerId: hoarding.ownerId,
                startDate: Timestamp.fromDate(selectedStartDate),
                endDate: Timestamp.fromDate(selectedEndDate),
                totalAmount: calculateTotal(),
            });

            toast.success('Booking request sent! Waiting for owner approval.');
            router.push('/advertiser/bookings');
        } catch (error) {
            console.error('Booking error:', error);
            toast.error('Failed to create booking');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Header title="Loading details..." />
                <div className="p-8 max-w-[1400px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="aspect-video bg-slate-50 animate-pulse rounded-2xl border border-slate-100" />
                            <div className="h-10 w-1/3 bg-slate-50 animate-pulse rounded-lg" />
                            <div className="h-32 w-full bg-slate-50 animate-pulse rounded-xl" />
                        </div>
                        <div className="bg-slate-50 animate-pulse rounded-2xl h-[500px]" />
                    </div>
                </div>
            </div>
        );
    }

    if (!hoarding) {
        return (
            <div className="min-h-screen bg-white">
                <Header title="Not Found" />
                <div className="p-8 flex flex-col items-center justify-center py-40 gap-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                        <X className="w-8 h-8 text-slate-200" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800">Hoarding not found</h3>
                    <p className="text-slate-400 max-w-xs">This advertising space may have been removed or the ID is incorrect.</p>
                    <button
                        onClick={() => router.push('/advertiser/browse')}
                        className="mt-2 px-6 h-11 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20"
                    >
                        Browse all listings
                    </button>
                </div>
            </div>
        );
    }

    const days = selectedStartDate && selectedEndDate ? differenceInDays(selectedEndDate, selectedStartDate) + 1 : 0;

    return (
        <div className="min-h-screen bg-white">
            <Header
                title={hoarding.title}
                actions={
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to listings
                    </button>
                }
            />

            <div className="p-6 lg:p-8 max-w-[1400px] mx-auto pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* Content Column */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Image Showcase */}
                        <div className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group relative aspect-video rounded-3xl overflow-hidden bg-slate-50 border border-slate-150 shadow-sm"
                            >
                                {hoarding.images && hoarding.images.length > 0 ? (
                                    <>
                                        <img
                                            src={hoarding.images[selectedImageIndex]}
                                            alt={hoarding.title}
                                            className="w-full h-full object-cover cursor-zoom-in group-hover:scale-[1.02] transition-transform duration-700"
                                            onClick={() => setShowGallery(true)}
                                        />
                                        {hoarding.images.length > 1 && (
                                            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedImageIndex(prev => prev === 0 ? hoarding.images.length - 1 : prev - 1);
                                                    }}
                                                    className="pointer-events-auto w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-slate-800 hover:bg-white transition"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedImageIndex(prev => prev === hoarding.images.length - 1 ? 0 : prev + 1);
                                                    }}
                                                    className="pointer-events-auto w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-slate-800 hover:bg-white transition"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => setShowGallery(true)}
                                            className="absolute bottom-4 right-4 px-3 py-2 bg-black/50 backdrop-blur rounded-lg text-white text-[12px] font-medium flex items-center gap-2 hover:bg-black/60 transition"
                                        >
                                            <Maximize2 className="w-3.5 h-3.5" />
                                            View gallery ({selectedImageIndex + 1}/{hoarding.images.length})
                                        </button>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center flex-col gap-3 text-slate-300">
                                        <Maximize2 className="w-10 h-10" />
                                        <span className="text-[13px]">No images available</span>
                                    </div>
                                )}
                            </motion.div>

                            {/* Thumbnails */}
                            {hoarding.images && hoarding.images.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                                    {hoarding.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImageIndex(idx)}
                                            className={`flex-shrink-0 w-24 aspect-video rounded-xl overflow-hidden border-2 transition-all ${idx === selectedImageIndex ? 'border-emerald-500 scale-105 shadow-md' : 'border-transparent hover:border-slate-200'
                                                }`}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Text Content */}
                        <div className="space-y-10">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    {hoarding.isVerified && (
                                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[11px] font-bold rounded-md border border-emerald-100 flex items-center gap-1.5">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Verified Space
                                        </span>
                                    )}
                                    <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-md border border-blue-100 uppercase tracking-wider">
                                        Available
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-[1.1] mb-6">
                                    {hoarding.title}
                                </h1>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-start gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                                        <div className="w-10 h-10 bg-white border border-slate-150 rounded-xl flex items-center justify-center shrink-0">
                                            <MapPin className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-[12px] font-medium text-slate-400 uppercase tracking-widest mb-1">Primary Location</p>
                                            <p className="text-[15px] font-semibold text-slate-800 leading-tight mb-1">{hoarding.location.address}</p>
                                            <p className="text-[13px] text-slate-500">{hoarding.location.city}, {hoarding.location.state}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                                        <div className="w-10 h-10 bg-white border border-slate-150 rounded-xl flex items-center justify-center shrink-0">
                                            <Maximize2 className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-[12px] font-medium text-slate-400 uppercase tracking-widest mb-1">Total Dimensions</p>
                                            <p className="text-[15px] font-semibold text-slate-800 leading-tight mb-1">
                                                {hoarding.dimensions.width} &times; {hoarding.dimensions.height} {hoarding.dimensions.unit}
                                            </p>
                                            <p className="text-[13px] text-slate-500">Surface area: {hoarding.dimensions.width * hoarding.dimensions.height} sq ft</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-slate-900 border-l-4 border-emerald-500 pl-4 py-1">About this space</h3>
                                <p className="text-[15px] text-slate-500 leading-relaxed max-w-2xl whitespace-pre-wrap">
                                    {hoarding.description || 'No detailed description provided for this hoarding space.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Booking Column */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-[100px] space-y-6">
                            <div className="bg-white border border-slate-150 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50">
                                <div className="mb-8 p-4 bg-emerald-50 rounded-2xl flex items-center justify-between border border-emerald-100">
                                    <div className="space-y-0.5">
                                        <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">Rate per day</p>
                                        <p className="text-3xl font-black text-slate-900">₹{hoarding.pricePerDay.toLocaleString()}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                        <Calendar className="w-6 h-6 text-emerald-500" />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Select Dates</label>
                                        <BookingCalendar
                                            bookedDates={bookedDates}
                                            startDate={selectedStartDate}
                                            endDate={selectedEndDate}
                                            onSelectStart={setSelectedStartDate}
                                            onSelectEnd={setSelectedEndDate}
                                        />
                                    </div>

                                    <AnimatePresence>
                                        {selectedStartDate && selectedEndDate && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden space-y-4 pt-4 border-t border-slate-100"
                                            >
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="p-3 bg-slate-50 rounded-xl">
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Check-in</p>
                                                        <p className="text-[13px] font-semibold text-slate-700">{format(selectedStartDate, 'MMM dd, yyyy')}</p>
                                                    </div>
                                                    <div className="p-3 bg-slate-50 rounded-xl">
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Check-out</p>
                                                        <p className="text-[13px] font-semibold text-slate-700">{format(selectedEndDate, 'MMM dd, yyyy')}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 pt-2">
                                                    <div className="flex justify-between text-[14px]">
                                                        <span className="text-slate-500">Subtotal ({days} days)</span>
                                                        <span className="font-semibold text-slate-800">₹{(hoarding.pricePerDay * days).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center py-3 border-t border-slate-100">
                                                        <span className="text-slate-800 font-bold">Estimated Total</span>
                                                        <span className="text-2xl font-black text-emerald-600">₹{calculateTotal().toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <button
                                        onClick={handleBooking}
                                        disabled={!selectedStartDate || !selectedEndDate || bookingLoading}
                                        className={`
                                            w-full h-14 rounded-2xl text-[15px] font-bold flex items-center justify-center gap-3 transition-all
                                            ${!selectedStartDate || !selectedEndDate
                                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                : 'bg-[#0e1628] text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10 active:scale-[0.98]'
                                            }
                                        `}
                                    >
                                        {bookingLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>Confirm Booking <ArrowLeft className="w-5 h-5 rotate-180" /></>
                                        )}
                                    </button>

                                    <div className="flex items-center justify-center gap-2 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <p className="text-[11px] font-medium text-emerald-700">No payment required until owner approval</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gallery Backdrop */}
            <AnimatePresence>
                {showGallery && hoarding.images && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-[#0e1628] flex items-center justify-center"
                    >
                        <button
                            onClick={() => setShowGallery(false)}
                            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center text-white hover:bg-white/20 transition-all z-[110]"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="relative w-full max-w-5xl px-6">
                            <img
                                src={hoarding.images[selectedImageIndex]}
                                alt=""
                                className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
                            />
                            {hoarding.images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setSelectedImageIndex(prev => prev === 0 ? hoarding.images.length - 1 : prev - 1)}
                                        className="absolute left-10 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10"
                                    >
                                        <ChevronLeft className="w-8 h-8" />
                                    </button>
                                    <button
                                        onClick={() => setSelectedImageIndex(prev => prev === hoarding.images.length - 1 ? 0 : prev + 1)}
                                        className="absolute right-10 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10"
                                    >
                                        <ChevronRight className="w-8 h-8" />
                                    </button>
                                </>
                            )}
                            <div className="mt-6 flex justify-center gap-3 overflow-x-auto pb-4">
                                {hoarding.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImageIndex(idx)}
                                        className={`w-20 aspect-video rounded-lg overflow-hidden border-2 transition-all ${idx === selectedImageIndex ? 'border-emerald-500 scale-110 shadow-lg' : 'border-white/20 opacity-40 hover:opacity-80'
                                            }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
