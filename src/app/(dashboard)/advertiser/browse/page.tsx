'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    MapPin,
    X,
    SlidersHorizontal,
    ChevronRight,
    Globe,
    Maximize2,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { HoardingCardSkeleton } from '@/components/ui';
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
            const data = await getAllHoardings();
            setHoardings(data);
        } catch (error) {
            console.error('Error loading hoardings:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredHoardings = hoardings.filter((hoarding) => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                hoarding.title.toLowerCase().includes(query) ||
                hoarding.location.city.toLowerCase().includes(query) ||
                hoarding.location.state.toLowerCase().includes(query);
            if (!matchesSearch) return false;
        }
        if (filters.minPrice && hoarding.pricePerDay < filters.minPrice) return false;
        if (filters.maxPrice && hoarding.pricePerDay > filters.maxPrice) return false;
        if (filters.city && !hoarding.location.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
        return true;
    });

    const clearFilters = () => {
        setFilters({});
        setSearchQuery('');
    };

    const activeFilterCount = Object.values(filters).filter(Boolean).length + (searchQuery ? 1 : 0);

    return (
        <div className="min-h-screen bg-white">
            <Header
                title="Browse listings"
                subtitle="Find and book your perfect advertising space."
            />

            <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">

                {/* Search & Filter Bar */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                            type="text"
                            placeholder="Search by location or name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                        />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`h-11 px-4 rounded-lg text-[13px] font-medium flex items-center gap-2 transition-all ${showFilters
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-50 border border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="ml-1 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-semibold flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Filter Panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[13px] font-semibold text-slate-700">Filter results</h3>
                                    {activeFilterCount > 0 && (
                                        <button
                                            onClick={clearFilters}
                                            className="text-[12px] font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition"
                                        >
                                            <X className="w-3 h-3" /> Clear all
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-medium text-slate-400">City</label>
                                        <input
                                            placeholder="Enter city..."
                                            className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 placeholder:text-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition"
                                            value={filters.city || ''}
                                            onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-medium text-slate-400">Min Price (₹/day)</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 placeholder:text-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition"
                                            value={filters.minPrice || ''}
                                            onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) || undefined }))}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-medium text-slate-400">Max Price (₹/day)</label>
                                        <input
                                            type="number"
                                            placeholder="No limit"
                                            className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 placeholder:text-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition"
                                            value={filters.maxPrice || ''}
                                            onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) || undefined }))}
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            onClick={() => setShowFilters(false)}
                                            className="w-full h-10 bg-emerald-500 text-white text-[13px] font-semibold rounded-lg hover:bg-emerald-600 transition"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results Count */}
                <div className="flex items-center justify-between">
                    <p className="text-[13px] text-slate-400">
                        <span className="font-semibold text-slate-700">{filteredHoardings.length}</span> listings found
                    </p>
                </div>

                {/* Results Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[...Array(6)].map((_, i) => <HoardingCardSkeleton key={i} />)}
                    </div>
                ) : filteredHoardings.length === 0 ? (
                    <div className="py-32 text-center space-y-4">
                        <Globe className="w-12 h-12 mx-auto text-slate-200" />
                        <h3 className="text-lg font-semibold text-slate-400">No listings found</h3>
                        <p className="text-[13px] text-slate-300">Try adjusting your search or filters.</p>
                        <button
                            onClick={clearFilters}
                            className="mt-2 px-4 py-2 text-[13px] font-medium text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition"
                        >
                            Clear search
                        </button>
                    </div>
                ) : (
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredHoardings.map((hoarding) => (
                            <StaggerItem key={hoarding.id}>
                                <Link href={`/advertiser/hoarding/${hoarding.id}`}>
                                    <div className="group bg-white border border-slate-150 rounded-xl overflow-hidden hover:shadow-lg hover:border-slate-200 transition-all duration-300">
                                        {/* Image */}
                                        <div className="relative h-52 bg-slate-100 overflow-hidden">
                                            {hoarding.images?.[0] ? (
                                                <img
                                                    src={hoarding.images[0]}
                                                    alt={hoarding.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Maximize2 className="w-6 h-6 text-slate-300" />
                                                </div>
                                            )}
                                            {hoarding.isVerified && (
                                                <div className="absolute top-3 left-3 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-semibold rounded-md">
                                                    Verified
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 space-y-4">
                                            <div>
                                                <h3 className="text-[15px] font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors leading-snug">
                                                    {hoarding.title}
                                                </h3>
                                                <p className="text-[12px] text-slate-400 flex items-center gap-1 mt-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {hoarding.location.city}, {hoarding.location.state}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                                <div>
                                                    <p className="text-[11px] text-slate-300">Size</p>
                                                    <p className="text-[13px] font-medium text-slate-600">{hoarding.dimensions.width} × {hoarding.dimensions.height} ft</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[11px] text-slate-300">Price</p>
                                                    <p className="text-[15px] font-semibold text-emerald-600">₹{hoarding.pricePerDay}<span className="text-[11px] font-normal text-slate-400">/day</span></p>
                                                </div>
                                            </div>

                                            <button className="w-full h-9 bg-slate-50 border border-slate-150 text-[12px] font-medium text-slate-600 rounded-lg group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all flex items-center justify-center gap-1">
                                                View details <ChevronRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                )}
            </div>
        </div>
    );
}
