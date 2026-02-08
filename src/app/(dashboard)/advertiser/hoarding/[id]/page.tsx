'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    Maximize2,
    IndianRupee,
    Calendar,
    ChevronLeft,
    ChevronRight,
    X,
    User,
    Check,
    ArrowLeft
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, Button, Badge, Skeleton } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { getHoarding, createBooking, checkDateAvailability, getHoardingBookedDates } from '@/lib/firebase/firestore';
import { Hoarding } from '@/types';
import { Timestamp } from 'firebase/firestore';
import { differenceInDays, format, addDays } from 'date-fns';
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
            // Load booked dates
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
            // Check availability
            const isAvailable = await checkDateAvailability(hoarding.id, selectedStartDate, selectedEndDate);
            if (!isAvailable) {
                toast.error('These dates are already booked');
                setBookingLoading(false);
                return;
            }

            // Create booking (status: pending - awaiting owner approval)
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
            <div className="min-h-screen">
                <Header title="Loading..." />
                <div className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Skeleton variant="rect" height={400} className="rounded-[var(--radius-lg)]" />
                            <Skeleton variant="heading" className="w-2/3" />
                            <Skeleton variant="text" count={3} />
                        </div>
                        <div>
                            <Skeleton variant="card" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!hoarding) {
        return (
            <div className="min-h-screen">
                <Header title="Not Found" />
                <div className="p-8">
                    <Card variant="glass" className="p-12 text-center">
                        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                            Hoarding not found
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] mb-4">
                            This hoarding may have been removed or is unavailable.
                        </p>
                        <Button variant="primary" onClick={() => router.push('/advertiser/browse')}>
                            Browse Hoardings
                        </Button>
                    </Card>
                </div>
            </div>
        );
    }

    const days = selectedStartDate && selectedEndDate ? differenceInDays(selectedEndDate, selectedStartDate) + 1 : 0;

    return (
        <div className="min-h-screen">
            <Header
                title={hoarding.title}
                actions={
                    <Button
                        variant="ghost"
                        size="sm"
                        icon={<ArrowLeft className="w-4 h-4" />}
                        onClick={() => router.back()}
                    >
                        Back
                    </Button>
                }
            />

            <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Images and Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Main Image */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative rounded-[var(--radius-lg)] overflow-hidden bg-[var(--bg-tertiary)] aspect-video"
                        >
                            {hoarding.images && hoarding.images.length > 0 ? (
                                <>
                                    <img
                                        src={hoarding.images[selectedImageIndex]}
                                        alt={hoarding.title}
                                        className="w-full h-full object-cover cursor-pointer"
                                        onClick={() => setShowGallery(true)}
                                    />
                                    {hoarding.images.length > 1 && (
                                        <>
                                            <button
                                                onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? hoarding.images.length - 1 : prev - 1))}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => setSelectedImageIndex((prev) => (prev === hoarding.images.length - 1 ? 0 : prev + 1))}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Maximize2 className="w-16 h-16 text-[var(--text-tertiary)]" />
                                </div>
                            )}

                            {/* Image Counter */}
                            {hoarding.images && hoarding.images.length > 1 && (
                                <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur text-white text-sm">
                                    {selectedImageIndex + 1} / {hoarding.images.length}
                                </div>
                            )}
                        </motion.div>

                        {/* Thumbnails */}
                        {hoarding.images && hoarding.images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {hoarding.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`
                      flex-shrink-0 w-20 h-20 rounded-[var(--radius-md)] overflow-hidden border-2 transition-all
                      ${index === selectedImageIndex
                                                ? 'border-[var(--accent-primary)] ring-2 ring-[rgba(99,102,241,0.3)]'
                                                : 'border-transparent hover:border-[var(--border-medium)]'
                                            }
                    `}
                                    >
                                        <img src={image} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Details */}
                        <Card variant="default" className="p-6">
                            <div className="space-y-6">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            {hoarding.isVerified && (
                                                <Badge variant="success" dot>Verified</Badge>
                                            )}
                                            {hoarding.isActive && (
                                                <Badge variant="primary">Available</Badge>
                                            )}
                                        </div>
                                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                                            {hoarding.title}
                                        </h1>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-[var(--accent-primary)]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-[var(--text-tertiary)]">Location</p>
                                        <p className="text-[var(--text-primary)]">
                                            {hoarding.location.address}
                                        </p>
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            {hoarding.location.city}, {hoarding.location.state}
                                        </p>
                                    </div>
                                </div>

                                {/* Dimensions */}
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
                                        <Maximize2 className="w-5 h-5 text-[var(--accent-primary)]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-[var(--text-tertiary)]">Dimensions</p>
                                        <p className="text-[var(--text-primary)]">
                                            {hoarding.dimensions.width} x {hoarding.dimensions.height} {hoarding.dimensions.unit}
                                        </p>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <h3 className="font-medium text-[var(--text-primary)] mb-2">Description</h3>
                                    <p className="text-[var(--text-secondary)] leading-relaxed">
                                        {hoarding.description || 'No description available.'}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column - Booking */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <Card variant="elevated" className="p-6">
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-[var(--text-primary)]">
                                            ₹{hoarding.pricePerDay.toLocaleString()}
                                        </span>
                                        <span className="text-[var(--text-tertiary)]">/ day</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Calendar */}
                                    <BookingCalendar
                                        bookedDates={bookedDates}
                                        startDate={selectedStartDate}
                                        endDate={selectedEndDate}
                                        onSelectStart={setSelectedStartDate}
                                        onSelectEnd={setSelectedEndDate}
                                    />

                                    {/* Selected Dates Summary */}
                                    {selectedStartDate && selectedEndDate && (
                                        <div className="p-3 rounded-[var(--radius-md)] bg-[var(--bg-tertiary)] text-sm">
                                            <div className="flex justify-between text-[var(--text-secondary)]">
                                                <span>From:</span>
                                                <span className="text-[var(--text-primary)] font-medium">
                                                    {format(selectedStartDate, 'MMM dd, yyyy')}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-[var(--text-secondary)] mt-1">
                                                <span>To:</span>
                                                <span className="text-[var(--text-primary)] font-medium">
                                                    {format(selectedEndDate, 'MMM dd, yyyy')}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {days > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 rounded-[var(--radius-md)] bg-[var(--bg-tertiary)]"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[var(--text-secondary)]">
                                                    ₹{hoarding.pricePerDay.toLocaleString()} x {days} days
                                                </span>
                                                <span className="text-[var(--text-primary)]">
                                                    ₹{(hoarding.pricePerDay * days).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-light)]">
                                                <span className="font-medium text-[var(--text-primary)]">Total</span>
                                                <span className="text-xl font-bold text-[var(--accent-primary)]">
                                                    ₹{calculateTotal().toLocaleString()}
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}

                                    <Button
                                        variant="gradient"
                                        size="lg"
                                        fullWidth
                                        loading={bookingLoading}
                                        onClick={handleBooking}
                                        disabled={!selectedStartDate || !selectedEndDate}
                                        icon={<Calendar className="w-5 h-5" />}
                                    >
                                        Book Now
                                    </Button>

                                    <p className="text-xs text-center text-[var(--text-tertiary)]">
                                        Booking requires owner approval
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fullscreen Gallery */}
            <AnimatePresence>
                {showGallery && hoarding.images && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black flex items-center justify-center"
                    >
                        <button
                            onClick={() => setShowGallery(false)}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <img
                            src={hoarding.images[selectedImageIndex]}
                            alt=""
                            className="max-w-[90vw] max-h-[90vh] object-contain"
                        />
                        {hoarding.images.length > 1 && (
                            <>
                                <button
                                    onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? hoarding.images.length - 1 : prev - 1))}
                                    className="absolute left-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={() => setSelectedImageIndex((prev) => (prev === hoarding.images.length - 1 ? 0 : prev + 1))}
                                    className="absolute right-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>


        </div>
    );
}
