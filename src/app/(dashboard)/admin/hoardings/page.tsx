'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Building2,
    MapPin,
    Check,
    X,
    Eye,
    Filter,
    User
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, Button, Badge, Modal, Skeleton, HoardingCardSkeleton } from '@/components/ui';
import { StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { updateHoarding } from '@/lib/firebase/firestore';
import { Hoarding } from '@/types';
import toast from 'react-hot-toast';

export default function AdminHoardingsPage() {
    const [hoardings, setHoardings] = useState<Hoarding[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedHoarding, setSelectedHoarding] = useState<Hoarding | null>(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadHoardings();
    }, []);

    const loadHoardings = async () => {
        try {
            setLoading(true);
            const q = query(collection(db, 'hoardings'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Hoarding));
            setHoardings(data);
        } catch (error) {
            console.error('Error loading hoardings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (hoarding: Hoarding, verified: boolean) => {
        setProcessing(true);
        try {
            await updateHoarding(hoarding.id, { isVerified: verified });
            setHoardings((prev) =>
                prev.map((h) => (h.id === hoarding.id ? { ...h, isVerified: verified } : h))
            );
            toast.success(verified ? 'Hoarding verified!' : 'Verification removed');
            setSelectedHoarding(null);
        } catch (error) {
            toast.error('Failed to update hoarding');
        } finally {
            setProcessing(false);
        }
    };

    const filteredHoardings = hoardings
        .filter((hoarding) => {
            if (filter === 'pending') return !hoarding.isVerified;
            if (filter === 'verified') return hoarding.isVerified;
            return true;
        })
        .filter((hoarding) => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return (
                hoarding.title.toLowerCase().includes(query) ||
                hoarding.location.city.toLowerCase().includes(query) ||
                hoarding.ownerName?.toLowerCase().includes(query)
            );
        });

    const pendingCount = hoardings.filter((h) => !h.isVerified).length;

    return (
        <div className="min-h-screen">
            <Header
                title="Manage Hoardings"
                subtitle={`${pendingCount} pending verification${pendingCount !== 1 ? 's' : ''}`}
            />

            <div className="p-8">
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                        <input
                            type="text"
                            placeholder="Search by title, city, or owner..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-[var(--radius-lg)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[rgba(99,102,241,0.15)] outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'pending', 'verified'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`
                  px-4 py-2 rounded-[var(--radius-full)] text-sm font-medium capitalize transition-all
                  ${filter === f
                                        ? 'bg-[var(--accent-primary)] text-white'
                                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                                    }
                `}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Hoardings Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <HoardingCardSkeleton key={i} />
                        ))}
                    </div>
                ) : filteredHoardings.length === 0 ? (
                    <Card variant="glass" className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-[var(--text-tertiary)]" />
                        </div>
                        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                            No hoardings found
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)]">
                            {searchQuery ? 'Try a different search term' : 'No hoardings match the current filter'}
                        </p>
                    </Card>
                ) : (
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredHoardings.map((hoarding) => (
                            <StaggerItem key={hoarding.id}>
                                <Card variant="default" padding="none" className="overflow-hidden">
                                    {/* Image */}
                                    <div className="relative h-48 bg-[var(--bg-tertiary)]">
                                        {hoarding.images && hoarding.images[0] ? (
                                            <img
                                                src={hoarding.images[0]}
                                                alt={hoarding.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Building2 className="w-12 h-12 text-[var(--text-tertiary)]" />
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3">
                                            {hoarding.isVerified ? (
                                                <Badge variant="success">Verified</Badge>
                                            ) : (
                                                <Badge variant="warning">Pending</Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <h3 className="font-semibold text-[var(--text-primary)] mb-1">
                                            {hoarding.title}
                                        </h3>
                                        <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1 mb-2">
                                            <MapPin className="w-4 h-4" />
                                            {hoarding.location.city}, {hoarding.location.state}
                                        </p>
                                        <p className="text-sm text-[var(--text-tertiary)] flex items-center gap-1 mb-4">
                                            <User className="w-4 h-4" />
                                            {hoarding.ownerName || 'Unknown Owner'}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-light)]">
                                            <span className="font-bold text-[var(--text-primary)]">
                                                ₹{hoarding.pricePerDay.toLocaleString()}/day
                                            </span>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    icon={<Eye className="w-4 h-4" />}
                                                    onClick={() => setSelectedHoarding(hoarding)}
                                                >
                                                    View
                                                </Button>
                                                {!hoarding.isVerified ? (
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        icon={<Check className="w-4 h-4" />}
                                                        onClick={() => handleVerify(hoarding, true)}
                                                    >
                                                        Verify
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        icon={<X className="w-4 h-4" />}
                                                        onClick={() => handleVerify(hoarding, false)}
                                                    >
                                                        Unverify
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                )}
            </div>

            {/* View Modal */}
            <Modal
                isOpen={!!selectedHoarding}
                onClose={() => setSelectedHoarding(null)}
                title={selectedHoarding?.title || 'Hoarding Details'}
                size="lg"
            >
                {selectedHoarding && (
                    <div className="space-y-6">
                        {/* Images */}
                        {selectedHoarding.images && selectedHoarding.images.length > 0 && (
                            <div className="grid grid-cols-2 gap-2">
                                {selectedHoarding.images.map((image, i) => (
                                    <img
                                        key={i}
                                        src={image}
                                        alt=""
                                        className="w-full h-40 object-cover rounded-[var(--radius-md)]"
                                    />
                                ))}
                            </div>
                        )}

                        {/* Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-[var(--text-tertiary)]">Owner</p>
                                <p className="font-medium text-[var(--text-primary)]">
                                    {selectedHoarding.ownerName || 'Unknown'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-[var(--text-tertiary)]">Price</p>
                                <p className="font-medium text-[var(--text-primary)]">
                                    ₹{selectedHoarding.pricePerDay.toLocaleString()}/day
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-[var(--text-tertiary)]">Location</p>
                                <p className="font-medium text-[var(--text-primary)]">
                                    {selectedHoarding.location.address}
                                    <br />
                                    {selectedHoarding.location.city}, {selectedHoarding.location.state}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-[var(--text-tertiary)]">Dimensions</p>
                                <p className="font-medium text-[var(--text-primary)]">
                                    {selectedHoarding.dimensions.width} x {selectedHoarding.dimensions.height} {selectedHoarding.dimensions.unit}
                                </p>
                            </div>
                        </div>

                        {selectedHoarding.description && (
                            <div>
                                <p className="text-sm text-[var(--text-tertiary)] mb-1">Description</p>
                                <p className="text-[var(--text-secondary)]">{selectedHoarding.description}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-[var(--border-light)]">
                            <Button variant="secondary" fullWidth onClick={() => setSelectedHoarding(null)}>
                                Close
                            </Button>
                            {!selectedHoarding.isVerified ? (
                                <Button
                                    variant="success"
                                    fullWidth
                                    loading={processing}
                                    onClick={() => handleVerify(selectedHoarding, true)}
                                >
                                    Verify Hoarding
                                </Button>
                            ) : (
                                <Button
                                    variant="danger"
                                    fullWidth
                                    loading={processing}
                                    onClick={() => handleVerify(selectedHoarding, false)}
                                >
                                    Remove Verification
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
