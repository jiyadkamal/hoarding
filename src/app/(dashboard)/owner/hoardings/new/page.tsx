'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, X, Upload, MapPin, IndianRupee, Maximize2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, Button, Input, Textarea, Select } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { createHoarding } from '@/lib/firebase/firestore';
import { HoardingFormData } from '@/types';
import toast from 'react-hot-toast';

export default function NewHoardingPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [formData, setFormData] = useState<HoardingFormData>({
        title: '',
        description: '',
        address: '',
        city: '',
        state: '',
        width: 0,
        height: 0,
        unit: 'ft',
        pricePerDay: 0,
        images: [],
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: ['width', 'height', 'pricePerDay'].includes(name) ? Number(value) : value,
        }));
    };

    const addImage = () => {
        if (imageUrl && !formData.images.includes(imageUrl)) {
            setFormData((prev) => ({
                ...prev,
                images: [...prev.images, imageUrl],
            }));
            setImageUrl('');
        }
    };

    const removeImage = (url: string) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((img) => img !== url),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userData) {
            toast.error('Please login first');
            return;
        }

        // Validation
        if (!formData.title || !formData.address || !formData.city || !formData.state) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (formData.pricePerDay <= 0) {
            toast.error('Please enter a valid price');
            return;
        }

        if (formData.width <= 0 || formData.height <= 0) {
            toast.error('Please enter valid dimensions');
            return;
        }

        setLoading(true);

        try {
            await createHoarding({
                ownerId: userData.uid,
                ownerName: userData.displayName,
                title: formData.title,
                description: formData.description,
                location: {
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                },
                dimensions: {
                    width: formData.width,
                    height: formData.height,
                    unit: formData.unit,
                },
                pricePerDay: formData.pricePerDay,
                images: formData.images,
                isActive: true,
            });

            toast.success('Hoarding added successfully! Pending verification.');
            router.push('/owner/hoardings');
        } catch (error) {
            console.error('Error creating hoarding:', error);
            toast.error('Failed to add hoarding');
        } finally {
            setLoading(false);
        }
    };

    const stateOptions = [
        { value: '', label: 'Select State' },
        { value: 'Maharashtra', label: 'Maharashtra' },
        { value: 'Karnataka', label: 'Karnataka' },
        { value: 'Tamil Nadu', label: 'Tamil Nadu' },
        { value: 'Delhi', label: 'Delhi' },
        { value: 'Gujarat', label: 'Gujarat' },
        { value: 'Rajasthan', label: 'Rajasthan' },
        { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
        { value: 'West Bengal', label: 'West Bengal' },
        { value: 'Telangana', label: 'Telangana' },
        { value: 'Kerala', label: 'Kerala' },
    ];

    return (
        <div className="min-h-screen">
            <Header
                title="Add New Hoarding"
                subtitle="Create a new hoarding listing"
                actions={
                    <Button
                        variant="ghost"
                        icon={<ArrowLeft className="w-4 h-4" />}
                        onClick={() => router.back()}
                    >
                        Back
                    </Button>
                }
            />

            <div className="p-8 max-w-4xl mx-auto">
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                >
                    <div className="space-y-8">
                        {/* Basic Info */}
                        <Card variant="default" className="p-6">
                            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">
                                Basic Information
                            </h3>
                            <div className="space-y-4">
                                <Input
                                    label="Hoarding Title"
                                    name="title"
                                    placeholder="e.g., Premium Billboard - MG Road"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
                                <Textarea
                                    label="Description"
                                    name="description"
                                    placeholder="Describe the hoarding, visibility, traffic, nearby landmarks..."
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>
                        </Card>

                        {/* Location */}
                        <Card variant="default" className="p-6">
                            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Location Details
                            </h3>
                            <div className="space-y-4">
                                <Input
                                    label="Street Address"
                                    name="address"
                                    placeholder="Full address of the hoarding location"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="City"
                                        name="city"
                                        placeholder="City"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Select
                                        label="State"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        options={stateOptions}
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Dimensions & Pricing */}
                        <Card variant="default" className="p-6">
                            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                                <Maximize2 className="w-5 h-5" />
                                Dimensions & Pricing
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid grid-cols-3 gap-3">
                                    <Input
                                        label="Width"
                                        name="width"
                                        type="number"
                                        placeholder="0"
                                        value={formData.width || ''}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Input
                                        label="Height"
                                        name="height"
                                        type="number"
                                        placeholder="0"
                                        value={formData.height || ''}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Select
                                        label="Unit"
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleChange}
                                        options={[
                                            { value: 'ft', label: 'Feet' },
                                            { value: 'm', label: 'Meters' },
                                        ]}
                                    />
                                </div>
                                <Input
                                    label="Price per Day (₹)"
                                    name="pricePerDay"
                                    type="number"
                                    placeholder="0"
                                    value={formData.pricePerDay || ''}
                                    onChange={handleChange}
                                    icon={<IndianRupee className="w-4 h-4" />}
                                    required
                                />
                            </div>
                        </Card>

                        {/* Images */}
                        <Card variant="default" className="p-6">
                            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                                <Upload className="w-5 h-5" />
                                Images
                            </h3>

                            {/* Add Image URL */}
                            <div className="flex gap-3 mb-4">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Paste image URL here..."
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={addImage}
                                    icon={<Plus className="w-4 h-4" />}
                                >
                                    Add
                                </Button>
                            </div>

                            {/* Image Grid */}
                            {formData.images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {formData.images.map((url, index) => (
                                        <div
                                            key={index}
                                            className="relative aspect-video rounded-[var(--radius-md)] overflow-hidden bg-[var(--bg-tertiary)] group"
                                        >
                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(url)}
                                                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <p className="text-xs text-[var(--text-tertiary)] mt-3">
                                Add images by pasting URLs. Recommended: Use Imgur, Cloudinary, or other image hosting services.
                            </p>
                        </Card>

                        {/* Submit */}
                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="secondary"
                                size="lg"
                                onClick={() => router.back()}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="gradient"
                                size="lg"
                                loading={loading}
                                className="flex-1"
                            >
                                Add Hoarding
                            </Button>
                        </div>
                    </div>
                </motion.form>
            </div>
        </div>
    );
}
