'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, X, Upload, MapPin, IndianRupee, Maximize2, ImagePlus, Loader2, Link as LinkIcon, Database } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Input, Textarea, Select } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { createHoarding } from '@/lib/firebase/firestore';
import { convertToBase64 } from '@/lib/firebase/storage';
import { HoardingFormData } from '@/types';
import toast from 'react-hot-toast';

export default function NewHoardingPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [loading, setLoading] = useState(false);
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
        if (!userData) {
            toast.error('Please login first');
            return;
        }

        const file = files[0];

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Firestore Document Limit is 1MB. 
        // Base64 is ~33% larger than binary. 
        // To be safe, we limit images stored in DB to ~500KB.
        if (file.size > 500 * 1024) {
            toast.error('For database storage, images must be under 500KB. Please use a smaller image or a URL.');
            return;
        }

        setUploading(true);

        try {
            // Convert to Base64 to store directly in Firestore
            const base64String = await convertToBase64(file);

            setFormData((prev) => ({
                ...prev,
                images: [...prev.images, base64String],
            }));

            toast.success('Image attached to listing');
        } catch (error: any) {
            console.error('Conversion error:', error);
            toast.error('Failed to process image. Try using a URL instead.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const addImageByUrl = () => {
        if (!imageUrl.trim()) return;
        try {
            const url = new URL(imageUrl);
            if (!url.protocol.startsWith('http')) throw new Error();
        } catch {
            toast.error('Please enter a valid Image URL');
            return;
        }
        if (formData.images.includes(imageUrl)) {
            toast.error('Image already added');
            return;
        }
        setFormData((prev) => ({
            ...prev,
            images: [...prev.images, imageUrl],
        }));
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

        if (!userData) {
            toast.error('Please login first');
            return;
        }

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

        if (formData.images.length === 0) {
            toast.error('Please add at least one image');
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

            toast.success('Hoarding added successfully!');
            router.push('/owner/hoardings');
        } catch (error) {
            console.error('Error creating hoarding:', error);
            toast.error('Failed to add hoarding (Document might be too large)');
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
        <div className="min-h-screen bg-white">
            <Header
                title="Publish Inventory"
                subtitle="Monetize your physical advertising assets by listing them globally"
                actions={
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 h-11 px-5 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100 hover:bg-slate-50 rounded-xl transition"
                    >
                        <ArrowLeft className="w-4 h-4" /> Discard Changes
                    </button>
                }
            />

            <div className="p-8 lg:p-12 max-w-5xl mx-auto pb-32">
                <motion.form
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-16"
                >
                    <div className="space-y-16">
                        {/* Basic Info */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Core Definition</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-8">
                                <Input
                                    label="Listing Professional Title"
                                    name="title"
                                    placeholder="e.g., Premium Billboard - MG Road Terminal"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="!bg-slate-50/50 border-slate-100/50 focus:!bg-white focus:!shadow-xl focus:!shadow-emerald-500/5 h-14 !rounded-2xl"
                                    required
                                />
                                <Textarea
                                    label="Strategic Property Insights"
                                    name="description"
                                    placeholder="Describe visibility, daily footfall, nearby landmarks, and illumination features..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="!bg-slate-50/50 border-slate-100/50 focus:!bg-white focus:!shadow-xl focus:!shadow-emerald-500/5 !rounded-2xl h-40 p-5"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Spatial Coordinates</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-8">
                                <Input
                                    label="Precise Street Address"
                                    name="address"
                                    placeholder="Exact location descriptor or landmark"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="!bg-slate-50/50 border-slate-100/50 focus:!bg-white focus:!shadow-xl focus:!shadow-emerald-500/5 h-14 !rounded-2xl"
                                    required
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Input
                                        label="City"
                                        name="city"
                                        placeholder="Target City"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="!bg-slate-50/50 border-slate-100/50 focus:!bg-white focus:!shadow-xl focus:!shadow-emerald-500/5 h-14 !rounded-2xl"
                                        required
                                    />
                                    <Select
                                        label="State Jurisdiction"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        options={stateOptions}
                                        className="!bg-slate-50/50 border-slate-100/50 focus:!bg-white focus:!shadow-xl focus:!shadow-emerald-500/5 h-14 !rounded-2xl font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dimensions & Pricing */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Metrics & Settlement</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="grid grid-cols-3 gap-4">
                                    <Input
                                        label="Width"
                                        name="width"
                                        type="number"
                                        placeholder="0"
                                        value={formData.width || ''}
                                        onChange={handleChange}
                                        className="!bg-slate-50/50 border-slate-100/50 focus:!bg-white focus:!shadow-xl focus:!shadow-emerald-500/5 h-14 !rounded-2xl"
                                        required
                                    />
                                    <Input
                                        label="Height"
                                        name="height"
                                        type="number"
                                        placeholder="0"
                                        value={formData.height || ''}
                                        onChange={handleChange}
                                        className="!bg-slate-50/50 border-slate-100/50 focus:!bg-white focus:!shadow-xl focus:!shadow-emerald-500/5 h-14 !rounded-2xl"
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
                                        className="!bg-slate-50/50 border-slate-100/50 h-14 !rounded-2xl font-bold"
                                    />
                                </div>
                                <Input
                                    label="Target Daily Revenue (INR)"
                                    name="pricePerDay"
                                    type="number"
                                    placeholder="0"
                                    value={formData.pricePerDay || ''}
                                    onChange={handleChange}
                                    icon={<IndianRupee className="w-4 h-4" />}
                                    className="!bg-slate-50/50 border-slate-100/50 focus:!bg-white focus:!shadow-xl focus:!shadow-emerald-500/5 h-14 !rounded-2xl font-bold text-lg"
                                    required
                                />
                            </div>
                        </div>

                        {/* Images */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Cinematic Assets</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setUseUrlMode(!useUrlMode)}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 border border-slate-100/50 transition-all active:scale-95"
                                >
                                    {useUrlMode ? (
                                        <><ImagePlus className="w-3.5 h-3.5" /> Direct Upload</>
                                    ) : (
                                        <><LinkIcon className="w-3.5 h-3.5" /> Paste URL</>
                                    )}
                                </button>
                            </div>

                            <div className="p-10 bg-slate-50/50 rounded-[3rem] border border-slate-100/50 space-y-10 shadow-inner">
                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />

                                {useUrlMode ? (
                                    /* URL paste mode */
                                    <div className="flex gap-4 p-2 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/20">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                placeholder="Paste image URL (e.g., https://source.unsplash.com/...)"
                                                value={imageUrl}
                                                onChange={(e) => setImageUrl(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImageByUrl(); } }}
                                                className="w-full h-12 px-6 bg-transparent text-[13px] font-bold text-slate-700 placeholder:text-slate-300 outline-none transition-all"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addImageByUrl}
                                            className="h-12 px-8 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition shadow-xl shadow-slate-900/10 flex items-center gap-2 shrink-0 active:scale-95"
                                        >
                                            <Plus className="w-4 h-4" /> Add Asset
                                        </button>
                                    </div>
                                ) : (
                                    /* Database storage mode */
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="w-full py-12 flex flex-col items-center gap-4 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                                                <p className="text-[14px] font-black uppercase tracking-widest text-slate-400">Processing Media Source...</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shadow-inner">
                                                    <Upload className="w-7 h-7" />
                                                </div>
                                                <div className="text-center space-y-1">
                                                    <p className="text-[15px] font-black text-slate-900 tracking-tight uppercase">
                                                        Deploy Visual Media
                                                    </p>
                                                    <p className="text-[12px] text-slate-400 font-bold italic">
                                                        Optimization limit: 500KB per artifact
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </button>
                                )}

                                {/* Image Preview Grid */}
                                {formData.images.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-2">
                                        {formData.images.map((url, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-slate-100 group shadow-lg"
                                            >
                                                <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1s]" />
                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(url)}
                                                        className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-2xl hover:bg-red-600 hover:scale-110 transition-all"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                                <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur text-[9px] font-black rounded-lg uppercase tracking-widest text-slate-600 shadow-sm">
                                                    Asset #{index + 1}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {formData.images.length === 0 && !uploading && (
                                    <p className="text-center text-[11px] font-black uppercase tracking-widest text-slate-300">
                                        No visual intelligence mapped &bull; Deployment criteria unmet
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Submit Action */}
                        <div className="pt-12 border-t border-slate-50 flex flex-col md:flex-row gap-6">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="h-16 px-10 bg-white border border-slate-100 text-slate-400 text-[13px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 hover:text-slate-600 transition-all flex items-center justify-center active:scale-95"
                            >
                                Cancel Deployment
                            </button>
                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className="flex-1 h-16 bg-slate-900 text-white text-[13px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-emerald-600 border border-emerald-500 transition-all shadow-2xl shadow-slate-900/10 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Authorize & Publish Listing <Plus className="w-5 h-5" /></>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.form>
            </div>
        </div>
    );
}
