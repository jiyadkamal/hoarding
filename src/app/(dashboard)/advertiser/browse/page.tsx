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
                title="Marketplace"
                subtitle="Discover prime advertising spaces across the country."
            />

            <div className="p-8 lg:p-12 max-w-[1400px] mx-auto space-y-12">

                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-50 p-2 rounded-[2.5rem] border border-slate-100/50 shadow-inner">
                    <div className="flex-1 relative w-full group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find physical spaces, cities, or landmarks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-16 pr-6 h-14 bg-white border border-slate-100 rounded-[2rem] text-[14px] font-medium text-slate-700 placeholder:text-slate-300 focus:border-emerald-500/30 focus:shadow-xl focus:shadow-emerald-500/5 outline-none transition-all"
                        />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`h-14 px-8 rounded-[2rem] text-[13px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] ${showFilters
                            ? 'bg-slate-900 text-white shadow-2xl'
                            : 'bg-white border border-slate-100 text-slate-600 hover:border-emerald-200 hover:text-emerald-600 shadow-sm'
                            }`}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Refine
                        {activeFilterCount > 0 && (
                            <span className="w-6 h-6 rounded-lg bg-emerald-500 text-white text-[11px] font-black flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-in zoom-in-50">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Filter Panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: -20 }}
                            className="relative z-10"
                        >
                            <div className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/50">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Advanced Discovery</h3>
                                        <p className="text-[13px] text-slate-400 font-medium">Narrow down your search results</p>
                                    </div>
                                    {activeFilterCount > 0 && (
                                        <button
                                            onClick={clearFilters}
                                            className="text-[11px] font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-2 transition uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full"
                                        >
                                            <X className="w-3.5 h-3.5" /> Reset all filters
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Target City</label>
                                        <input
                                            placeholder="e.g. Mumbai"
                                            className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-emerald-500/30 transition shadow-sm"
                                            value={filters.city || ''}
                                            onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Price Floor (₹)</label>
                                        <input
                                            type="number"
                                            placeholder="From"
                                            className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-emerald-500/30 transition shadow-sm"
                                            value={filters.minPrice || ''}
                                            onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) || undefined }))}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Price Ceiling (₹)</label>
                                        <input
                                            type="number"
                                            placeholder="To"
                                            className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-emerald-500/30 transition shadow-sm"
                                            value={filters.maxPrice || ''}
                                            onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) || undefined }))}
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            onClick={() => setShowFilters(false)}
                                            className="w-full h-14 bg-emerald-500 text-white text-[13px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-400 transition shadow-xl shadow-emerald-500/20 active:scale-[0.98]"
                                        >
                                            Apply Changes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results Header */}
                <div className="flex items-center justify-between px-2">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Found <span className="text-slate-900 mx-1">{filteredHoardings.length}</span> global results
                    </p>
                </div>

                {/* Results Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[...Array(6)].map((_, i) => <HoardingCardSkeleton key={i} />)}
                    </div>
                ) : filteredHoardings.length === 0 ? (
                    <div className="py-40 text-center space-y-8">
                        <div className="w-24 h-24 mx-auto bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-center shadow-inner">
                            <Globe className="w-10 h-10 text-slate-200" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">No spaces matched your search</h3>
                            <p className="text-[15px] text-slate-400 font-medium max-w-sm mx-auto italic">Try adjusting your refine parameters or location query to see more results.</p>
                        </div>
                        <button
                            onClick={clearFilters}
                            className="h-12 px-8 bg-white border border-emerald-500 text-emerald-600 text-[13px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-50 transition-all active:scale-[0.98]"
                        >
                            Reset Search System
                        </button>
                    </div>
                ) : (
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredHoardings.map((hoarding) => (
                            <StaggerItem key={hoarding.id}>
                                <Link href={`/advertiser/hoarding/${hoarding.id}`}>
                                    <div className="group bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] hover:border-emerald-500/10 transition-all duration-700 flex flex-col h-full relative">
                                        {/* Image */}
                                        <div className="relative h-64 bg-slate-50 overflow-hidden">
                                            {hoarding.images?.[0] ? (
                                                <img
                                                    src={hoarding.images[0]}
                                                    alt={hoarding.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center opacity-30">
                                                    <Maximize2 className="w-10 h-10 text-slate-200" />
                                                </div>
                                            )}

                                            {/* Labels Overlay */}
                                            <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                                                {hoarding.isVerified && (
                                                    <div className="px-3 py-1.5 bg-white/90 backdrop-blur-md text-emerald-600 text-[10px] font-black rounded-lg shadow-xl uppercase tracking-widest border border-emerald-100/50">
                                                        Premium Spot
                                                    </div>
                                                )}
                                                <div className="px-3 py-1.5 bg-slate-900/40 backdrop-blur-md text-white text-[10px] font-black rounded-lg shadow-xl uppercase tracking-widest border border-white/10">
                                                    {hoarding.type || 'Standard'}
                                                </div>
                                            </div>

                                            {/* Hover Interaction Overlay */}
                                            <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors duration-700 flex items-center justify-center">
                                                <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-2xl">
                                                    <ChevronRight className="w-5 h-5 text-emerald-600" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-8 space-y-6 flex-1 bg-white relative">
                                            <div className="space-y-1.5">
                                                <h3 className="text-[20px] font-bold text-slate-900 group-hover:text-emerald-600 transition-colors leading-tight tracking-tight">
                                                    {hoarding.title}
                                                </h3>
                                                <p className="text-[12px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                                                    <MapPin className="w-4 h-4 text-emerald-500/50" />
                                                    {hoarding.location.city} &bull; {hoarding.location.state}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Scale</p>
                                                    <p className="text-[14px] font-bold text-slate-700">{hoarding.dimensions.width} &times; {hoarding.dimensions.height} {hoarding.dimensions.unit || 'ft'}</p>
                                                </div>
                                                <div className="text-right space-y-1">
                                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Starting at</p>
                                                    <p className="text-[20px] font-black text-emerald-600 tracking-tighter leading-none">₹{hoarding.pricePerDay.toLocaleString()}<span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">/day</span></p>
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <div className="w-full h-12 rounded-2xl bg-slate-50 text-[12px] font-black uppercase tracking-widest text-slate-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-xl group-hover:shadow-emerald-500/20 transition-all duration-500 flex items-center justify-center gap-2">
                                                    View Property <ChevronRight className="w-4 h-4" />
                                                </div>
                                            </div>
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
