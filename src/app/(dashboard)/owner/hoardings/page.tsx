'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Plus,
    Building2,
    MapPin,
    IndianRupee,
    Edit2,
    Trash2,
    MoreVertical,
    Eye,
    EyeOff
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, Button, Badge, HoardingCardSkeleton, Modal } from '@/components/ui';
import { StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { getOwnerHoardings, updateHoarding, deleteHoarding } from '@/lib/firebase/firestore';
import { Hoarding } from '@/types';
import toast from 'react-hot-toast';

export default function OwnerHoardingsPage() {
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
        <div className="min-h-screen">
            <Header
                title="My Hoardings"
                subtitle="Manage your hoarding listings"
                actions={
                    <Link href="/owner/hoardings/new">
                        <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
                            Add Hoarding
                        </Button>
                    </Link>
                }
            />

            <div className="p-8">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <HoardingCardSkeleton key={i} />
                        ))}
                    </div>
                ) : hoardings.length === 0 ? (
                    <Card variant="glass" className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-[var(--text-tertiary)]" />
                        </div>
                        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                            No hoardings yet
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] mb-4">
                            Start by adding your first hoarding listing
                        </p>
                        <Link href="/owner/hoardings/new">
                            <Button variant="primary">Add Your First Hoarding</Button>
                        </Link>
                    </Card>
                ) : (
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {hoardings.map((hoarding) => (
                            <StaggerItem key={hoarding.id}>
                                <Card variant="default" padding="none" className="overflow-hidden group">
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

                                        {/* Status Badges */}
                                        <div className="absolute top-3 left-3 flex gap-2">
                                            {hoarding.isVerified ? (
                                                <Badge variant="success">Verified</Badge>
                                            ) : (
                                                <Badge variant="warning">Pending Verification</Badge>
                                            )}
                                            {!hoarding.isActive && (
                                                <Badge variant="neutral">Inactive</Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <h3 className="font-semibold text-[var(--text-primary)] mb-1">
                                            {hoarding.title}
                                        </h3>
                                        <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1 mb-3">
                                            <MapPin className="w-4 h-4" />
                                            {hoarding.location.city}, {hoarding.location.state}
                                        </p>

                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <span className="text-lg font-bold text-[var(--text-primary)]">
                                                    ₹{hoarding.pricePerDay.toLocaleString()}
                                                </span>
                                                <span className="text-sm text-[var(--text-tertiary)]">/day</span>
                                            </div>
                                            <Badge variant="neutral">
                                                {hoarding.dimensions.width} x {hoarding.dimensions.height} {hoarding.dimensions.unit}
                                            </Badge>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-4 border-t border-[var(--border-light)]">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleActive(hoarding)}
                                                icon={hoarding.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            >
                                                {hoarding.isActive ? 'Deactivate' : 'Activate'}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                icon={<Edit2 className="w-4 h-4" />}
                                                className="text-[var(--accent-primary)]"
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedHoarding(hoarding);
                                                    setDeleteModalOpen(true);
                                                }}
                                                icon={<Trash2 className="w-4 h-4" />}
                                                className="text-[var(--error)]"
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Delete Hoarding"
                size="sm"
            >
                <p className="text-[var(--text-secondary)] mb-6">
                    Are you sure you want to delete &quot;{selectedHoarding?.title}&quot;?
                    This action cannot be undone.
                </p>
                <div className="flex gap-3">
                    <Button variant="secondary" fullWidth onClick={() => setDeleteModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" fullWidth loading={deleting} onClick={handleDelete}>
                        Delete
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
