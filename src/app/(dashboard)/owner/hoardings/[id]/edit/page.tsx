'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, X, IndianRupee, ImagePlus, Loader2, Link as LinkIcon, Database, Save } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Input, Textarea, Select } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { getHoarding, updateHoarding } from '@/lib/firebase/firestore';
import { convertToBase64 } from '@/lib/firebase/storage';
import { HoardingFormData } from '@/types';
import toast from 'react-hot-toast';

export default function EditHoardingPage() {
    const router = useRouter();
    const params = useParams();
    const hoardingId = params.id as string;
    const { userData } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [useUrlMode, setUseUrlMode] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
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

    useEffect(() => {
        if (hoardingId) {
            loadHoarding();
        }
    }, [hoardingId]);

    const loadHoarding = async () => {
        try {
            setLoading(true);
            const hoarding = await getHoarding(hoardingId);
            if (!hoarding) {
                toast.error('Hoarding not found');
                router.push('/owner/hoardings');
                return;
            }
            // Check ownership
            if (userData && hoarding.ownerId !== userData.uid) {
                toast.error('You do not own this listing');
                router.push('/owner/hoardings');
                return;
            }
            setFormData({
                title: hoarding.title,
                description: hoarding.description,
                address: hoarding.location.address,
                city: hoarding.location.city,
                state: hoarding.location.state,
                width: hoarding.dimensions.width,
                height: hoarding.dimensions.height,
                unit: hoarding.dimensions.unit,
                pricePerDay: hoarding.pricePerDay,
                images: hoarding.images || [],
            });
        } catch (error) {
            console.error('Error loading hoarding:', error);
            toast.error('Failed to load hoarding');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: ['width', 'height', 'pricePerDay'].includes(name) ? Number(value) : value,
        }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 500 * 1024) {
            toast.error('Image must be under 500KB for database storage');
            return;
        }

        setUploading(true);
        try {
            const base64String = await convertToBase64(file);
            setFormData((prev) => ({
                ...prev,
                images: [...prev.images, base64String],
            }));
            toast.success('Image added');
        } catch (error) {
            toast.error('Failed to process image');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const addImageByUrl = () => {
        if (!imageUrl.trim()) return;
        try {
            const url = new URL(imageUrl);
            if (!url.protocol.startsWith('http')) throw new Error();
        } catch {
            toast.error('Please enter a valid URL');
            return;
        }
        if (formData.images.includes(imageUrl)) {
            toast.error('Image already added');
            return;
        }
        setFormData((prev) => ({ ...prev, images: [...prev.images, imageUrl] }));
        setImageUrl('');
        toast.success('URL added');
    };

    const removeImage = (url: string) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((img) => img !== url),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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

        setSaving(true);
        try {
            await updateHoarding(hoardingId, {
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
            });

            toast.success('Listing updated successfully!');
            router.push('/owner/hoardings');
        } catch (error) {
            console.error('Error updating hoarding:', error);
            toast.error('Failed to update listing');
        } finally {
            setSaving(false);
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

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                    <p className="text-sm text-slate-400">Loading listing details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Header
                title="Edit Listing"
                subtitle="Update your advertisement space details"
                actions={
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition"
                    >
                        <ArrowLeft className="w-4 h-4" /> Cancel and return
                    </button>
                }
            />

            <div className="p-6 lg:p-8 max-w-4xl mx-auto pb-20">
                <motion.form
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-10"
                >
                    <div className="space-y-10">
                        {/* Basic Info */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-4 py-1">
                                <h3 className="text-xl font-bold text-slate-900">Basic Information</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-6 p-1">
                                <Input
                                    label="Listing Title"
                                    name="title"
                                    placeholder="e.g., Premium Billboard - MG Road Terminal"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="!bg-slate-50 border-slate-100"
                                    required
                                />
                                <Textarea
                                    label="Property Description"
                                    name="description"
                                    placeholder="Describe the visibility, daily footfall, nearby landmarks..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="!bg-slate-50 border-slate-100 h-32"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-4 py-1">
                                <h3 className="text-xl font-bold text-slate-900">Location & Visibility</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-6 p-1">
                                <Input
                                    label="Street Address"
                                    name="address"
                                    placeholder="Precise location or landmark"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="!bg-slate-50 border-slate-100"
                                    required
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="City"
                                        name="city"
                                        placeholder="City"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="!bg-slate-50 border-slate-100"
                                        required
                                    />
                                    <Select
                                        label="State / Region"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        options={stateOptions}
                                        className="!bg-slate-50 border-slate-100"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dimensions & Pricing */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-4 py-1">
                                <h3 className="text-xl font-bold text-slate-900">Specifications & Pricing</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-1">
                                <div className="grid grid-cols-3 gap-3">
                                    <Input
                                        label="Width"
                                        name="width"
                                        type="number"
                                        placeholder="0"
                                        value={formData.width || ''}
                                        onChange={handleChange}
                                        className="!bg-slate-50 border-slate-100"
                                        required
                                    />
                                    <Input
                                        label="Height"
                                        name="height"
                                        type="number"
                                        placeholder="0"
                                        value={formData.height || ''}
                                        onChange={handleChange}
                                        className="!bg-slate-50 border-slate-100"
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
                                        className="!bg-slate-50 border-slate-100"
                                    />
                                </div>
                                <Input
                                    label="Desired Price per Day"
                                    name="pricePerDay"
                                    type="number"
                                    placeholder="0"
                                    value={formData.pricePerDay || ''}
                                    onChange={handleChange}
                                    icon={<IndianRupee className="w-4 h-4" />}
                                    className="!bg-slate-50 border-slate-100"
                                    required
                                />
                            </div>
                        </div>

                        {/* Images */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-4 py-1">
                                    <h3 className="text-xl font-bold text-slate-900">Visual Assets</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setUseUrlMode(!useUrlMode)}
                                    className="flex items-center gap-1.5 text-[12px] font-medium text-slate-400 hover:text-emerald-600 transition"
                                >
                                    {useUrlMode ? (
                                        <><ImagePlus className="w-3.5 h-3.5" /> Switch to file selection</>
                                    ) : (
                                        <><LinkIcon className="w-3.5 h-3.5" /> Use external URL instead</>
                                    )}
                                </button>
                            </div>

                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-6">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />

                                {useUrlMode ? (
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                placeholder="Paste image URL (e.g., https://i.imgur.com/example.jpg)"
                                                value={imageUrl}
                                                onChange={(e) => setImageUrl(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImageByUrl(); } }}
                                                className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-700 placeholder:text-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addImageByUrl}
                                            className="h-11 px-6 bg-slate-800 text-white text-[13px] font-semibold rounded-xl hover:bg-slate-900 transition flex items-center gap-2 shrink-0"
                                        >
                                            <Plus className="w-4 h-4" /> Add
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="w-full py-8 flex flex-col items-center gap-3 border-2 border-dashed border-slate-200 rounded-xl bg-white hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                                                <p className="text-[13px] font-medium text-slate-500">Processing image...</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                                    <Database className="w-6 h-6" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[14px] font-semibold text-slate-700">Add more images</p>
                                                    <p className="text-[12px] text-slate-400 mt-0.5">Max 500KB per image</p>
                                                </div>
                                            </>
                                        )}
                                    </button>
                                )}

                                {formData.images.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {formData.images.map((url, index) => (
                                            <div
                                                key={index}
                                                className="relative aspect-video rounded-xl overflow-hidden bg-white border border-slate-200 group shadow-sm"
                                            >
                                                <img src={url} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(url)}
                                                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {formData.images.length === 0 && (
                                    <p className="text-center text-[12px] text-slate-400">
                                        No images. Add at least one photo of your space.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Submit Action */}
                        <div className="pt-6 border-t border-slate-100 flex gap-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="h-14 px-8 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition flex items-center justify-center"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving || uploading}
                                className="flex-1 h-14 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Save Changes <Save className="w-5 h-5" /></>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.form>
            </div>
        </div>
    );
}
