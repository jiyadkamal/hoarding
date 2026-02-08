'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Search,
    MapPin,
    Filter,
    ChevronRight,
    IndianRupee,
    Maximize2,
    X,
    SlidersHorizontal
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, Button, Input, Select, Badge, HoardingCardSkeleton } from '@/components/ui';
import { StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';
import { getAllHoardings } from '@/lib/firebase/firestore';
import { Hoarding, HoardingFilters } from '@/types';

export default function BrowseHoardingsPage() {
    const [hoardings, setHoardings] = useState<Hoarding[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<HoardingFilters>({});

    useEffect(() => {
        loadHoardings();
    }, []);

    const loadHoardings = async () => {
        try {
            setLoading(true);
            const data = await getAllHoardings(); // Show all hoardings
            setHoardings(data);
        } catch (error) {
            console.error('Error loading hoardings:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredHoardings = hoardings.filter((hoarding) => {
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                hoarding.title.toLowerCase().includes(query) ||
                hoarding.location.city.toLowerCase().includes(query) ||
                hoarding.location.state.toLowerCase().includes(query) ||
                hoarding.location.address.toLowerCase().includes(query);
            if (!matchesSearch) return false;
        }

        // Price filters
        if (filters.minPrice && hoarding.pricePerDay < filters.minPrice) return false;
        if (filters.maxPrice && hoarding.pricePerDay > filters.maxPrice) return false;

        // City filter
        if (filters.city && !hoarding.location.city.toLowerCase().includes(filters.city.toLowerCase())) {
            return false;
        }

        return true;
    });

    const clearFilters = () => {
        setFilters({});
        setSearchQuery('');
    };

    const activeFilterCount = Object.values(filters).filter(Boolean).length + (searchQuery ? 1 : 0);

    return (
        <div className="min-h-screen">
            <Header
                title="Browse Hoardings"
                subtitle="Find the perfect advertising space for your campaign"
            />

            <div className="p-8">
                {/* Search and Filter Bar */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                        <input
                            type="text"
                            placeholder="Search by location, city, or keyword..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-[var(--radius-lg)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[rgba(99,102,241,0.15)] outline-none transition-all"
                        />
                    </div>

                    <Button
                        variant={showFilters ? 'primary' : 'secondary'}
                        onClick={() => setShowFilters(!showFilters)}
                        icon={<SlidersHorizontal className="w-4 h-4" />}
                    >
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="ml-1 w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </Button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6"
                    >
                        <Card variant="glass" className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium text-[var(--text-primary)]">Filter Options</h3>
                                {activeFilterCount > 0 && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-[var(--accent-primary)] hover:underline flex items-center gap-1"
                                    >
                                        <X className="w-4 h-4" />
                                        Clear all
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Input
                                    label="City"
                                    placeholder="Enter city"
                                    value={filters.city || ''}
                                    onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
                                    icon={<MapPin className="w-4 h-4" />}
                                />
                                <Input
                                    label="Min Price (₹/day)"
                                    type="number"
                                    placeholder="0"
                                    value={filters.minPrice || ''}
                                    onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: Number(e.target.value) || undefined }))}
                                    icon={<IndianRupee className="w-4 h-4" />}
                                />
                                <Input
                                    label="Max Price (₹/day)"
                                    type="number"
                                    placeholder="Any"
                                    value={filters.maxPrice || ''}
                                    onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) || undefined }))}
                                    icon={<IndianRupee className="w-4 h-4" />}
                                />
                                <div className="flex items-end">
                                    <Button variant="primary" fullWidth onClick={loadHoardings}>
                                        Apply Filters
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* Results Count */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-[var(--text-secondary)]">
                        Showing <span className="font-medium text-[var(--text-primary)]">{filteredHoardings.length}</span> hoardings
                    </p>
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
                            <Search className="w-8 h-8 text-[var(--text-tertiary)]" />
                        </div>
                        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                            No hoardings found
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] mb-4">
                            Try adjusting your search or filter criteria
                        </p>
                        <Button variant="secondary" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    </Card>
                ) : (
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredHoardings.map((hoarding) => (
                            <StaggerItem key={hoarding.id}>
                                <Link href={`/advertiser/hoarding/${hoarding.id}`}>
                                    <Card variant="interactive" padding="none" className="overflow-hidden group">
                                        {/* Image */}
                                        <div className="relative h-48 bg-[var(--bg-tertiary)] overflow-hidden">
                                            {hoarding.images && hoarding.images[0] ? (
                                                <img
                                                    src={hoarding.images[0]}
                                                    alt={hoarding.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Maximize2 className="w-12 h-12 text-[var(--text-tertiary)]" />
                                                </div>
                                            )}
                                            {hoarding.isVerified && (
                                                <Badge variant="success" className="absolute top-3 left-3">
                                                    Verified
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-5">
                                            <h3 className="font-semibold text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent-primary)] transition-colors">
                                                {hoarding.title}
                                            </h3>
                                            <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1 mb-3">
                                                <MapPin className="w-4 h-4" />
                                                {hoarding.location.city}, {hoarding.location.state}
                                            </p>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <Badge variant="neutral">
                                                    {hoarding.dimensions.width} x {hoarding.dimensions.height} {hoarding.dimensions.unit}
                                                </Badge>
                                            </div>

                                            {/* Price and Action */}
                                            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-light)]">
                                                <div>
                                                    <span className="text-lg font-bold text-[var(--text-primary)]">
                                                        ₹{hoarding.pricePerDay.toLocaleString()}
                                                    </span>
                                                    <span className="text-sm text-[var(--text-tertiary)]">/day</span>
                                                </div>
                                                <Button variant="primary" size="sm" icon={<ChevronRight className="w-4 h-4" />} iconPosition="right">
                                                    View
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                )}
            </div>
        </div>
    );
}
