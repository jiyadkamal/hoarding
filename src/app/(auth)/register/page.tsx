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
            setError('PIN codes do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Access code must be 6+ characters');
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
        <div className="min-h-screen bg-[var(--bg-base)] flex page-wrapper overflow-hidden">
            {/* Left Side - Welcome Section */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[var(--bg-surface)] border-r border-[var(--border-standard)]">
                <div className="absolute inset-0 bg-grid-subtle opacity-20" />

                <div className="relative z-10 flex flex-col justify-center p-20 text-[var(--text-main)] space-y-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-10"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)] flex items-center justify-center shadow-lg shadow-[var(--brand-primary)]/20">
                                <Building2 className="w-6 h-6 text-black" />
                            </div>
                            <span className="text-xl font-black uppercase tracking-tighter">HOARDBOOK</span>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-5xl font-black uppercase tracking-tighter leading-none italic">
                                JOIN THE <br />
                                <span className="text-[var(--brand-primary)]">PLATFORM.</span>
                            </h1>
                            <p className="text-sm text-[var(--text-dim)] font-black uppercase tracking-widest max-w-sm">
                                Create your account to start browsing and listing billboard spaces.
                            </p>
                        </div>

                        <ul className="space-y-4 pt-4">
                            {[
                                "Live Hoarding Map",
                                "Easy Booking System",
                                "Verified Listings",
                                "Campaign Analytics"
                            ].map(text => (
                                <li key={text} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                    <CheckCircle2 className="w-4 h-4 text-[var(--brand-primary)]" />
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-20 relative overflow-y-auto">
                <div className="absolute top-10 right-10">
                    <ShieldCheck className="w-6 h-6 text-[var(--text-dim)]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md space-y-10 py-10"
                >
                    <div className="text-center space-y-2">
                        <h2 className="text-sm font-black text-[var(--brand-primary)] uppercase tracking-[0.4em]">Get Started</h2>
                        <h3 className="text-3xl font-black text-[var(--text-main)] uppercase tracking-tighter italic">Create Account.</h3>
                    </div>

                    <Card className="p-10 !bg-[var(--bg-surface)] !border-[var(--border-standard)]">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {error && (
                                <div className="p-4 rounded-md bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-[10px] font-black uppercase tracking-widest text-center">
                                    {error}
                                </div>
                            )}

                            {/* Role Selection */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.3em]">Select Account Type</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {roleOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setFormData((prev) => ({ ...prev, role: option.value as 'advertiser' | 'owner' }))}
                                            className={`
                                                p-4 rounded-xl border-2 text-left transition-all
                                                ${formData.role === option.value
                                                    ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5'
                                                    : 'border-[var(--border-standard)] hover:border(--text-dim)]'
                                                }
                                            `}
                                        >
                                            <div className={`mb-3 ${formData.role === option.value ? 'text-[var(--brand-primary)]' : 'text-[var(--text-dim)]'}`}>
                                                {option.icon}
                                            </div>
                                            <div className="font-black text-[10px] uppercase text-[var(--text-main)] tracking-widest">{option.title}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <Input
                                    id="displayName"
                                    name="displayName"
                                    label="Full Name"
                                    autoComplete="name"
                                    placeholder="Enter your name"
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    required
                                />

                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    label="Email Address"
                                    autoComplete="email"
                                    placeholder="user@example.com"
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
                                        autoComplete="new-password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        label="Confirm Password"
                                        autoComplete="new-password"
                                        placeholder="••••••••"
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
                                icon={<ArrowRight className="w-4 h-4" />}
                                iconPosition="right"
                                className="h-14 !text-[10px]"
                            >
                                Create My Account
                            </Button>
                        </form>
                    </Card>

                    <p className="text-center text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)]">
                        Already have an account?{' '}
                        <Link
                            href="/login"
                            className="text-[var(--brand-primary)] hover:underline"
                        >
                            Sign In
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
