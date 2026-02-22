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
                            <div className="aspect-video bg-slate-50 animate-pulse rounded-[2.5rem] border border-slate-100" />
                            <div className="h-10 w-1/3 bg-slate-50 animate-pulse rounded-lg" />
                            <div className="h-32 w-full bg-slate-50 animate-pulse rounded-xl" />
                        </div>
                        <div className="bg-slate-50 animate-pulse rounded-[2.5rem] h-[500px]" />
                    </div>
                </div>
            </div>
        );
    }

    if (!hoarding) {
        return (
            <div className="min-h-screen bg-white">
                <Header title="Not Found" />
                <div className="p-8 flex flex-col items-center justify-center py-40 gap-8 text-center">
                    <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                        <X className="w-10 h-10 text-slate-200" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Inventory not found</h3>
                        <p className="text-slate-400 font-medium max-w-xs mx-auto italic">This advertising space may have been removed or the ID is incorrect.</p>
                    </div>
                    <button
                        onClick={() => router.push('/advertiser/browse')}
                        className="h-14 px-8 bg-emerald-500 text-white text-[13px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-400 transition shadow-xl shadow-emerald-500/20 active:scale-[0.98]"
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
                        className="flex items-center gap-2 h-11 px-5 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100 hover:bg-slate-50 rounded-xl transition"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to listings
                    </button>
                }
            />

            <div className="p-8 lg:p-12 max-w-[1400px] mx-auto pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

                    {/* Content Column */}
                    <div className="lg:col-span-8 space-y-12">

                        {/* Image Showcase */}
                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="group relative aspect-video rounded-[3rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-2xl shadow-slate-200/50"
                            >
                                {hoarding.images && hoarding.images.length > 0 ? (
                                    <>
                                        <img
                                            src={hoarding.images[selectedImageIndex]}
                                            alt={hoarding.title}
                                            className="w-full h-full object-cover cursor-zoom-in group-hover:scale-[1.05] transition-transform duration-[2s]"
                                            onClick={() => setShowGallery(true)}
                                        />
                                        {hoarding.images.length > 1 && (
                                            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedImageIndex(prev => prev === 0 ? hoarding.images.length - 1 : prev - 1);
                                                    }}
                                                    className="pointer-events-auto w-14 h-14 rounded-full bg-white/90 backdrop-blur shadow-2xl flex items-center justify-center text-slate-800 hover:bg-emerald-500 hover:text-white transition-all scale-90 hover:scale-100"
                                                >
                                                    <ChevronLeft className="w-6 h-6" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedImageIndex(prev => prev === hoarding.images.length - 1 ? 0 : prev + 1);
                                                    }}
                                                    className="pointer-events-auto w-14 h-14 rounded-full bg-white/90 backdrop-blur shadow-2xl flex items-center justify-center text-slate-800 hover:bg-emerald-500 hover:text-white transition-all scale-90 hover:scale-100"
                                                >
                                                    <ChevronRight className="w-6 h-6" />
                                                </button>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => setShowGallery(true)}
                                            className="absolute bottom-8 right-8 px-5 py-3 bg-slate-900/90 backdrop-blur rounded-2xl text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition-all border border-white/10"
                                        >
                                            <Maximize2 className="w-4 h-4" />
                                            Cinema View ({selectedImageIndex + 1}/{hoarding.images.length})
                                        </button>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center flex-col gap-4 text-slate-200">
                                        <Maximize2 className="w-12 h-12" />
                                        <span className="text-[13px] font-bold uppercase tracking-widest">Digital Preview Unavailable</span>
                                    </div>
                                )}
                            </motion.div>

                            {/* Thumbnails */}
                            {hoarding.images && hoarding.images.length > 1 && (
                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none px-2">
                                    {hoarding.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImageIndex(idx)}
                                            className={`flex-shrink-0 w-32 aspect-video rounded-2xl overflow-hidden border-4 transition-all duration-300 ${idx === selectedImageIndex ? 'border-emerald-500 scale-110 shadow-xl' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                                                }`}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Text Content */}
                        <div className="space-y-12">
                            <div className="space-y-8">
                                <div className="flex items-center gap-3">
                                    {hoarding.isVerified && (
                                        <span className="px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg border border-emerald-100 flex items-center gap-2 uppercase tracking-widest">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Gold Standard Verified
                                        </span>
                                    )}
                                    <span className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black rounded-lg uppercase tracking-[0.2em]">
                                        {hoarding.type || 'Prime Spot'}
                                    </span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight">
                                    {hoarding.title}
                                </h1>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="group flex items-start gap-6 p-6 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                                        <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:text-emerald-500 transition-colors">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Primary Coordinates</p>
                                            <p className="text-[16px] font-bold text-slate-800 leading-tight">{hoarding.location.address}</p>
                                            <p className="text-[14px] font-medium text-slate-500 italic">{hoarding.location.city}, {hoarding.location.state}</p>
                                        </div>
                                    </div>
                                    <div className="group flex items-start gap-6 p-6 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                                        <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:text-emerald-500 transition-colors">
                                            <Maximize2 className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Surface Scope</p>
                                            <p className="text-[16px] font-bold text-slate-800 leading-tight">
                                                {hoarding.dimensions.width} &times; {hoarding.dimensions.height} {hoarding.dimensions.unit}
                                            </p>
                                            <p className="text-[14px] font-medium text-slate-500 italic">Total area: {hoarding.dimensions.width * hoarding.dimensions.height} sq ft</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
                                    Campaign Intelligence
                                    <div className="flex-1 h-px bg-slate-100" />
                                </h3>
                                <p className="text-[16px] text-slate-500 leading-relaxed max-w-2xl whitespace-pre-wrap font-medium indent-8">
                                    {hoarding.description || 'Elevate your brand with this premium physical inventory. Strategically located to maximize visibility and impact.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Booking Column */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-[100px] space-y-8">
                            <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-500/10 transition-colors" />

                                <div className="relative space-y-10">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Daily Settlement</p>
                                            <p className="text-4xl font-black text-slate-900 tracking-tighter">₹{hoarding.pricePerDay.toLocaleString()}</p>
                                        </div>
                                        <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                                            <Calendar className="w-7 h-7 text-emerald-500" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Engagement Timeline</label>
                                        <div className="rounded-[2rem] overflow-hidden border border-slate-50 shadow-inner p-1">
                                            <BookingCalendar
                                                bookedDates={bookedDates}
                                                startDate={selectedStartDate}
                                                endDate={selectedEndDate}
                                                onSelectStart={setSelectedStartDate}
                                                onSelectEnd={setSelectedEndDate}
                                            />
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {selectedStartDate && selectedEndDate && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="space-y-6 pt-6 border-t border-slate-50"
                                            >
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Inception</p>
                                                        <p className="text-[14px] font-bold text-slate-800">{format(selectedStartDate, 'MMM dd, yy')}</p>
                                                    </div>
                                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Expiration</p>
                                                        <p className="text-[14px] font-bold text-slate-800">{format(selectedEndDate, 'MMM dd, yy')}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-3 pt-4">
                                                    <div className="flex justify-between text-[15px] font-medium text-slate-400 italic">
                                                        <span>Campaign span ({days} days)</span>
                                                        <span className="font-bold text-slate-900">₹{(hoarding.pricePerDay * days).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between items-end pt-4 border-t border-slate-50">
                                                        <span className="text-slate-900 font-black uppercase text-[12px] tracking-widest">Total Valuation</span>
                                                        <span className="text-3xl font-black text-emerald-600 tracking-tighter leading-none">₹{calculateTotal().toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <button
                                        onClick={handleBooking}
                                        disabled={!selectedStartDate || !selectedEndDate || bookingLoading}
                                        className={`
                                            w-full h-16 rounded-[1.5rem] text-[13px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300
                                            ${!selectedStartDate || !selectedEndDate
                                                ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100'
                                                : 'bg-slate-900 text-white hover:bg-emerald-600 shadow-2xl shadow-emerald-500/20 active:scale-[0.98]'
                                            }
                                        `}
                                    >
                                        {bookingLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>Initialize Request <ArrowLeft className="w-5 h-5 rotate-180" /></>
                                        )}
                                    </button>

                                    <div className="flex items-center justify-center gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/30">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        <p className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">No capital required during review</p>
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
                        className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center p-8 md:p-12"
                    >
                        <button
                            onClick={() => setShowGallery(false)}
                            className="absolute top-10 right-10 w-16 h-16 rounded-full bg-white/5 backdrop-blur-3xl flex items-center justify-center text-white hover:bg-white/10 transition-all z-[110] border border-white/10"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        <div className="relative w-full max-w-7xl h-full flex flex-col items-center justify-center gap-12">
                            <div className="relative w-full flex-1 flex items-center justify-center">
                                <motion.img
                                    key={selectedImageIndex}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    src={hoarding.images[selectedImageIndex]}
                                    alt=""
                                    className="max-w-full max-h-full object-contain rounded-[3rem] shadow-2xl"
                                />
                                {hoarding.images.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setSelectedImageIndex(prev => prev === 0 ? hoarding.images.length - 1 : prev - 1)}
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/5 backdrop-blur-3xl flex items-center justify-center text-white hover:bg-emerald-500 transition-all border border-white/10"
                                        >
                                            <ChevronLeft className="w-10 h-10" />
                                        </button>
                                        <button
                                            onClick={() => setSelectedImageIndex(prev => prev === hoarding.images.length - 1 ? 0 : prev + 1)}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/5 backdrop-blur-3xl flex items-center justify-center text-white hover:bg-emerald-500 transition-all border border-white/10"
                                        >
                                            <ChevronRight className="w-10 h-10" />
                                        </button>
                                    </>
                                )}
                            </div>
                            <div className="flex justify-center gap-4 overflow-x-auto pb-8 w-full max-w-4xl scrollbar-none px-4">
                                {hoarding.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImageIndex(idx)}
                                        className={`shrink-0 w-28 aspect-video rounded-2xl overflow-hidden border-4 transition-all duration-300 ${idx === selectedImageIndex ? 'border-emerald-500 scale-110 shadow-2xl shadow-emerald-500/20' : 'border-white/5 opacity-30 hover:opacity-100 hover:scale-105'
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
