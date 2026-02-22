'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Building2, CheckCircle2, ShieldCheck, Globe } from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
import { registerWithEmail } from '@/lib/firebase/auth';
import { UserRole } from '@/types';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'advertiser' as 'advertiser' | 'owner',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await registerWithEmail(
                formData.email.trim(),
                formData.password.trim(),
                formData.displayName.trim(),
                formData.role as UserRole
            );

            if (formData.role === 'owner') {
                router.push('/owner/dashboard');
            } else {
                router.push('/advertiser/browse');
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            setError('Account creation failed. Please check your details and try again.');
        } finally {
            setLoading(false);
        }
    };

    const roleOptions = [
        {
            value: 'advertiser',
            title: 'Advertiser',
            description: 'Find and book billboard spaces',
            icon: <Globe className="w-5 h-5" />,
        },
        {
            value: 'owner',
            title: 'Hoarding Owner',
            description: 'List and manage your spaces',
            icon: <Building2 className="w-5 h-5" />,
        },
    ];

    return (
        <div className="min-h-screen bg-white flex overflow-hidden">
            {/* Left Side - Cinematic Section */}
            <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-[#0e1628]">
                {/* Visual Elements */}
                <div className="absolute inset-0 bg-grid-subtle opacity-20" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -mr-12 -mt-24 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -ml-12 -mb-24 pointer-events-none" />

                <div className="relative z-10 flex flex-col justify-between p-16 w-full">
                    {/* Logo Area */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">
                            Hoard<span className="text-emerald-400">Book</span>
                        </span>
                    </Link>

                    {/* Content Area */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-5"
                        >
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-3 py-1">
                                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                                Start your journey
                            </span>
                            <h1 className="text-5xl font-bold tracking-tight text-white leading-[1.1]">
                                Join the future of <br />
                                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent italic">outdoor ads.</span>
                            </h1>
                            <p className="text-[15px] text-blue-100/40 leading-relaxed max-w-sm">
                                Create your account and get instant access to our worldwide network of premium billboard locations.
                            </p>
                        </motion.div>

                        {/* Features List */}
                        <div className="grid gap-6 pt-4">
                            {[
                                { title: 'Easy Management', desc: 'Listing spaces takes minutes.', icon: Globe, color: 'text-blue-400' },
                                { title: 'Secure Settlements', desc: 'Integrated escrow for peace of mind.', icon: ShieldCheck, color: 'text-emerald-400' },
                            ].map((f, i) => (
                                <motion.div
                                    key={f.title}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                    className="flex items-center gap-4 group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                        <f.icon className={`w-5 h-5 ${f.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-white/90">{f.title}</p>
                                        <p className="text-[11px] text-white/30">{f.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Area */}
                    <p className="text-[11px] font-medium text-white/20">
                        &copy; 2026 HoardBook Platform. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Right Side - Form Section */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-20 bg-[#f8fafc] overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md py-10"
                >
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-[28px] font-bold text-slate-900 tracking-tight mb-2">Create account</h2>
                        <p className="text-slate-500 text-[14px]">
                            Join the platform to browse or list billboards.
                        </p>
                    </div>

                    <div className="bg-white p-8 lg:p-10 rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16" />

                        <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-bold text-center"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* Role Selection */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Account Type</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {roleOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setFormData((prev) => ({ ...prev, role: option.value as 'advertiser' | 'owner' }))}
                                            className={`
                                                p-4 rounded-2xl border transition-all text-left group
                                                ${formData.role === option.value
                                                    ? 'border-emerald-500 bg-emerald-500/5 ring-4 ring-emerald-500/5 shadow-lg shadow-emerald-500/10'
                                                    : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                                                }
                                            `}
                                        >
                                            <div className={`mb-3 p-2 w-fit rounded-lg ${formData.role === option.value ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-slate-400'}`}>
                                                {option.icon}
                                            </div>
                                            <div className="font-bold text-[12px] text-slate-800 tracking-tight mb-1">{option.title}</div>
                                            <div className="text-[9px] text-slate-400 font-medium leading-tight">{option.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-5">
                                <Input
                                    id="displayName"
                                    name="displayName"
                                    label="Full Name"
                                    placeholder="Jane Doe"
                                    icon={<User className="w-4 h-4" />}
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    required
                                />

                                <Input
                                    id="email"
                                    name="email"
                                    label="Email Address"
                                    type="email"
                                    placeholder="name@company.com"
                                    icon={<Mail className="w-4 h-4" />}
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        label="Password"
                                        placeholder="••••••••"
                                        icon={<Lock className="w-4 h-4" />}
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        label="Confirm"
                                        placeholder="••••••••"
                                        icon={<CheckCircle2 className="w-4 h-4" />}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                fullWidth
                                loading={loading}
                                className="h-14 rounded-2xl bg-[#0f172a] hover:bg-slate-800 text-white font-bold tracking-tight shadow-xl shadow-slate-200"
                            >
                                <span className="flex items-center gap-2">
                                    Create account <ArrowRight className="w-4 h-4" />
                                </span>
                            </Button>
                        </form>
                    </div>

                    <p className="mt-8 text-center text-[14px] font-medium text-slate-400 pb-10">
                        Already have an account?{' '}
                        <Link
                            href="/login"
                            className="text-emerald-600 hover:text-emerald-500 font-bold transition-colors"
                        >
                            Log in here
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
