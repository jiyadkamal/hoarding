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
                        <button className="h-11 px-6 bg-emerald-500 text-white text-[13px] font-bold rounded-xl hover:bg-emerald-400 transition flex items-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-[0.98]">
                            <Plus className="w-4 h-4" /> Add Space
                        </button>
                    </Link>
                }
            />

            <div className="p-8 lg:p-12 max-w-[1400px] mx-auto">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <HoardingCardSkeleton key={i} />
                        ))}
                    </div>
                ) : hoardings.length === 0 ? (
                    <div className="py-32 text-center space-y-6">
                        <div className="w-24 h-24 mx-auto rounded-[2.5rem] bg-slate-50 flex items-center justify-center border border-slate-100 mb-2 shadow-inner">
                            <Building2 className="w-10 h-10 text-slate-200" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">No listings yet</h3>
                            <p className="text-[14px] text-slate-400 max-w-xs mx-auto font-medium">Start monetizing your physical spaces by adding them to our marketplace.</p>
                        </div>
                        <Link href="/owner/hoardings/new" className="inline-block pt-4">
                            <Button variant="primary" className="h-12 px-8 rounded-2xl shadow-xl shadow-emerald-500/20 font-bold">Add Your First Listing</Button>
                        </Link>
                    </div>
                ) : (
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {hoardings.map((hoarding) => (
                            <StaggerItem key={hoarding.id}>
                                <div className="group bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden hover:shadow-2xl shadow-slate-200/40 hover:border-emerald-500/10 transition-all duration-500 flex flex-col h-full">
                                    {/* Image Container */}
                                    <div className="relative h-64 bg-slate-50 overflow-hidden">
                                        {hoarding.images && hoarding.images[0] ? (
                                            <img
                                                src={hoarding.images[0]}
                                                alt={hoarding.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center flex-col gap-3 opacity-30">
                                                <Building2 className="w-12 h-12 text-slate-300" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Inventory Preview</span>
                                            </div>
                                        )}

                                        {/* Overlay Tags */}
                                        <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                                            {hoarding.isVerified ? (
                                                <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md text-emerald-600 text-[10px] font-black rounded-lg shadow-xl uppercase tracking-widest border border-emerald-100/50">Verified</span>
                                            ) : (
                                                <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md text-amber-600 text-[10px] font-black rounded-lg shadow-xl uppercase tracking-widest border border-amber-100/50">Pending</span>
                                            )}
                                        </div>

                                        {!hoarding.isActive && (
                                            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center">
                                                <span className="px-4 py-2 bg-white text-slate-900 text-[11px] font-black rounded-full uppercase tracking-[0.2em] shadow-2xl">Currently Hidden</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info Content */}
                                    <div className="p-8 space-y-6 flex-1 relative bg-white">
                                        <div className="space-y-1.5">
                                            <h3 className="text-[20px] font-bold text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors">
                                                {hoarding.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400 uppercase tracking-widest">
                                                <MapPin className="w-4 h-4 text-emerald-500/50" />
                                                <span>{hoarding.location.city}, {hoarding.location.state}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 py-6 border-y border-slate-50">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1.5">Daily rate</p>
                                                <p className="text-[22px] font-black text-slate-900 tracking-tighter">₹{hoarding.pricePerDay.toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1.5">Dimensions</p>
                                                <p className="text-[15px] font-bold text-slate-700">{hoarding.dimensions.width} &times; {hoarding.dimensions.height} {hoarding.dimensions.unit}</p>
                                            </div>
                                        </div>

                                        {/* Action Bar */}
                                        <div className="grid grid-cols-4 gap-3 pt-2">
                                            <button
                                                onClick={() => toggleActive(hoarding)}
                                                className={`col-span-2 h-12 rounded-2xl text-[12px] font-bold transition-all flex items-center justify-center gap-2 border shadow-sm ${hoarding.isActive
                                                    ? 'border-slate-100 text-slate-500 hover:bg-slate-50'
                                                    : 'border-emerald-500/20 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                    }`}
                                            >
                                                {hoarding.isActive ? <><EyeOff className="w-4 h-4" /> Hide</> : <><Eye className="w-4 h-4" /> Show</>}
                                            </button>
                                            <button
                                                onClick={() => router.push(`/owner/hoardings/${hoarding.id}/edit`)}
                                                className="h-12 rounded-2xl bg-white text-slate-400 hover:bg-slate-50 hover:text-emerald-500 border border-slate-100 flex items-center justify-center transition-all group/edit shadow-sm"
                                                title="Edit listing"
                                            >
                                                <Edit2 className="w-4 h-4 group-hover/edit:scale-110 transition-transform" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedHoarding(hoarding);
                                                    setDeleteModalOpen(true);
                                                }}
                                                className="h-12 rounded-2xl bg-white text-slate-400 hover:bg-red-50 hover:text-red-500 border border-slate-100 flex items-center justify-center transition-all group/del shadow-sm hover:border-red-100"
                                                title="Delete listing"
                                            >
                                                <Trash2 className="w-4 h-4 group-hover/del:scale-110 transition-transform" />
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
                title="Remove listing"
                size="sm"
            >
                <div className="space-y-8 p-1">
                    <div className="p-6 bg-red-50/50 rounded-[2rem] border border-red-100/50 text-center">
                        <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-4" />
                        <p className="text-[15px] text-slate-600 leading-relaxed font-medium">
                            Are you sure you want to permanently delete <br />
                            <span className="font-black text-slate-900 underline decoration-red-500/30 decoration-4 underline-offset-4 tracking-tight">&quot;{selectedHoarding?.title}&quot;</span>?
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            className="flex-1 h-14 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition active:scale-[0.98]"
                            onClick={() => setDeleteModalOpen(false)}
                        >
                            Nevermind
                        </button>
                        <button
                            className="flex-1 h-14 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition shadow-xl shadow-red-500/25 flex items-center justify-center active:scale-[0.98]"
                            disabled={deleting}
                            onClick={handleDelete}
                        >
                            {deleting ? 'Removing...' : 'Yes, Delete It'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
