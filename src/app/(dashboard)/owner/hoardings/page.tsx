'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Plus,
    Building2,
    MapPin,
    IndianRupee,
    Edit2,
    Trash2,
    Eye,
    EyeOff,
    MoreVertical
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { StatusBadge, Button, HoardingCardSkeleton, Modal } from '@/components/ui';
import { StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { getOwnerHoardings, updateHoarding, deleteHoarding } from '@/lib/firebase/firestore';
import { Hoarding } from '@/types';
import toast from 'react-hot-toast';

export default function OwnerHoardingsPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [hoardings, setHoardings] = useState<Hoarding[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedHoarding, setSelectedHoarding] = useState<Hoarding | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (userData) {
            loadHoardings();
        }
    }, [userData]);

    const loadHoardings = async () => {
        if (!userData) return;
        try {
            setLoading(true);
            const data = await getOwnerHoardings(userData.uid);
            setHoardings(data);
        } catch (error) {
            console.error('Error loading hoardings:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleActive = async (hoarding: Hoarding) => {
        try {
            await updateHoarding(hoarding.id, { isActive: !hoarding.isActive });
            setHoardings((prev) =>
                prev.map((h) => (h.id === hoarding.id ? { ...h, isActive: !h.isActive } : h))
            );
            toast.success(hoarding.isActive ? 'Hoarding deactivated' : 'Hoarding activated');
        } catch (error) {
            toast.error('Failed to update hoarding');
        }
    };

    const handleDelete = async () => {
        if (!selectedHoarding) return;
        setDeleting(true);
        try {
            await deleteHoarding(selectedHoarding.id);
            setHoardings((prev) => prev.filter((h) => h.id !== selectedHoarding.id));
            toast.success('Hoarding deleted');
            setDeleteModalOpen(false);
        } catch (error) {
            toast.error('Failed to delete hoarding');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Header
                title="My Listings"
                subtitle="Manage your advertisement inventory"
                actions={
                    <Link href="/owner/hoardings/new">
                        <button className="h-10 px-6 bg-emerald-500 text-white text-[13px] font-semibold rounded-lg hover:bg-emerald-600 transition flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                            <Plus className="w-4 h-4" /> Add Space
                        </button>
                    </Link>
                }
            />

            <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <HoardingCardSkeleton key={i} />
                        ))}
                    </div>
                ) : hoardings.length === 0 ? (
                    <div className="py-24 text-center space-y-5">
                        <div className="w-20 h-20 mx-auto rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 mb-2">
                            <Building2 className="w-10 h-10 text-slate-200" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-slate-800">No listings yet</h3>
                            <p className="text-[14px] text-slate-400 max-w-xs mx-auto">Start monetizing your physical spaces by adding them to our marketplace.</p>
                        </div>
                        <Link href="/owner/hoardings/new" className="inline-block mt-4">
                            <Button variant="primary">Add Your First Listing</Button>
                        </Link>
                    </div>
                ) : (
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {hoardings.map((hoarding) => (
                            <StaggerItem key={hoarding.id}>
                                <div className="group bg-white border border-slate-150 rounded-2xl overflow-hidden hover:shadow-xl hover:border-emerald-500/20 transition-all duration-300 flex flex-col h-full shadow-sm">
                                    {/* Image Container */}
                                    <div className="relative h-56 bg-slate-50 overflow-hidden">
                                        {hoarding.images && hoarding.images[0] ? (
                                            <img
                                                src={hoarding.images[0]}
                                                alt={hoarding.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center flex-col gap-2 opacity-50">
                                                <Building2 className="w-10 h-10 text-slate-300" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No Preview</span>
                                            </div>
                                        )}

                                        {/* Overlay Tags */}
                                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                            {hoarding.isVerified ? (
                                                <span className="px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-lg shadow-lg shadow-emerald-500/20 uppercase tracking-widest">Verified</span>
                                            ) : (
                                                <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-lg shadow-lg shadow-amber-500/20 uppercase tracking-widest">Pending</span>
                                            )}
                                            {!hoarding.isActive && (
                                                <span className="px-2.5 py-1 bg-slate-800 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest">Inactive</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Info Content */}
                                    <div className="p-6 space-y-4 flex-1">
                                        <div className="space-y-1">
                                            <h3 className="text-[18px] font-bold text-slate-800 leading-tight group-hover:text-emerald-500 transition-colors">
                                                {hoarding.title}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-[13px] text-slate-400">
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span>{hoarding.location.city}, {hoarding.location.state}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Price Per Day</p>
                                                <p className="text-[18px] font-bold text-slate-800">₹{hoarding.pricePerDay.toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dimensions</p>
                                                <p className="text-[15px] font-semibold text-slate-700">{hoarding.dimensions.width} &times; {hoarding.dimensions.height} {hoarding.dimensions.unit}</p>
                                            </div>
                                        </div>

                                        {/* Action Bar */}
                                        <div className="flex gap-2 pt-2">
                                            <button
                                                onClick={() => toggleActive(hoarding)}
                                                className={`flex-1 h-10 rounded-xl text-[12px] font-bold transition-all flex items-center justify-center gap-2 border ${hoarding.isActive
                                                    ? 'border-slate-150 text-slate-600 hover:bg-slate-50'
                                                    : 'border-emerald-500/20 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                    }`}
                                            >
                                                {hoarding.isActive ? <><EyeOff className="w-4 h-4" /> Deactivate</> : <><Eye className="w-4 h-4" /> Activate</>}
                                            </button>
                                            <button
                                                onClick={() => router.push(`/owner/hoardings/${hoarding.id}/edit`)}
                                                className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500 border border-slate-100 flex items-center justify-center transition-all"
                                                title="Edit listing"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedHoarding(hoarding);
                                                    setDeleteModalOpen(true);
                                                }}
                                                className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-100 flex items-center justify-center transition-all shadow-sm shadow-red-500/10"
                                                title="Delete listing"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                )}
            </div>

            {/* Delete Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Confirm Removal"
                size="sm"
            >
                <div className="space-y-6">
                    <p className="text-[15px] text-slate-500 leading-relaxed">
                        Are you sure you want to permanently delete <span className="font-bold text-slate-800 italic">&quot;{selectedHoarding?.title}&quot;</span>? This action cannot be undone and will remove all associated data.
                    </p>
                    <div className="flex gap-3">
                        <button
                            className="flex-1 h-12 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition"
                            onClick={() => setDeleteModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="flex-1 h-12 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-500/20 flex items-center justify-center"
                            disabled={deleting}
                            onClick={handleDelete}
                        >
                            {deleting ? 'Deleting...' : 'Delete Permanently'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
