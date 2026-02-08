'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Building2, Check } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
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

        // Validation
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
                formData.email,
                formData.password,
                formData.displayName,
                formData.role as UserRole
            );

            // Redirect based on role
            if (formData.role === 'owner') {
                router.push('/owner/dashboard');
            } else {
                router.push('/advertiser/browse');
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            if (err.code === 'auth/email-already-in-use') {
                setError('An account with this email already exists');
            } else if (err.code === 'auth/weak-password') {
                setError('Password is too weak');
            } else {
                setError('Failed to create account. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const roleOptions = [
        {
            value: 'advertiser',
            title: 'Advertiser',
            description: 'Book hoardings for your advertising campaigns',
            icon: '📣',
        },
        {
            value: 'owner',
            title: 'Hoarding Owner',
            description: 'List and manage your hoarding spaces',
            icon: '🏢',
        },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex">
            {/* Left Side - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500">
                {/* Animated Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-32 right-32 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-32 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse delay-500" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center p-12 text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                                <Building2 className="w-7 h-7" />
                            </div>
                            <span className="text-2xl font-bold">HoardBook</span>
                        </div>

                        <h1 className="text-4xl font-bold mb-4 leading-tight">
                            Join the Future of<br />
                            Outdoor Advertising
                        </h1>
                        <p className="text-lg text-white/80 max-w-md mb-8">
                            Whether you&apos;re looking to advertise or monetize your spaces,
                            HoardBook connects you with the right opportunities.
                        </p>

                        {/* Features */}
                        <div className="space-y-4">
                            {[
                                'Real-time availability tracking',
                                'Secure booking and payments',
                                'Direct owner-advertiser connection',
                                'Analytics and reporting',
                            ].map((feature, idx) => (
                                <motion.div
                                    key={feature}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + idx * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                        <Check className="w-4 h-4" />
                                    </div>
                                    <span className="text-white/90">{feature}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />
            </div>

            {/* Right Side - Register Form */}
            <div className="flex-1 flex flex-col">
                {/* Top Bar */}
                <div className="h-16 px-8 flex items-center justify-between border-b border-[var(--border-light)]">
                    <div className="lg:hidden flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-lg text-[var(--text-primary)]">HoardBook</span>
                    </div>
                    <div className="flex-1" />
                    <ThemeToggle />
                </div>

                {/* Form Container */}
                <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full max-w-md"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Create an account</h2>
                            <p className="text-[var(--text-secondary)] mt-2">
                                Get started with HoardBook today
                            </p>
                        </div>

                        <Card variant="glass" className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3 rounded-[var(--radius-md)] bg-red-500/10 border border-red-500/20 text-red-500 text-sm"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                {/* Role Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
                                        I want to
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {roleOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setFormData((prev) => ({ ...prev, role: option.value as 'advertiser' | 'owner' }))}
                                                className={`
                          p-4 rounded-[var(--radius-md)] border-2 text-left transition-all duration-200
                          ${formData.role === option.value
                                                        ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5'
                                                        : 'border-[var(--border-light)] hover:border-[var(--border-medium)]'
                                                    }
                        `}
                                            >
                                                <div className="text-2xl mb-2">{option.icon}</div>
                                                <div className="font-medium text-sm text-[var(--text-primary)]">
                                                    {option.title}
                                                </div>
                                                <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                                                    {option.description}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Input
                                    label="Full Name"
                                    name="displayName"
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    icon={<User className="w-4 h-4" />}
                                    required
                                />

                                <Input
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    icon={<Mail className="w-4 h-4" />}
                                    required
                                />

                                <Input
                                    label="Password"
                                    name="password"
                                    type="password"
                                    placeholder="Min. 6 characters"
                                    value={formData.password}
                                    onChange={handleChange}
                                    icon={<Lock className="w-4 h-4" />}
                                    required
                                />

                                <Input
                                    label="Confirm Password"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    icon={<Lock className="w-4 h-4" />}
                                    required
                                />

                                <div className="text-xs text-[var(--text-tertiary)]">
                                    By creating an account, you agree to our{' '}
                                    <Link href="/terms" className="text-[var(--accent-primary)] hover:underline">
                                        Terms of Service
                                    </Link>{' '}
                                    and{' '}
                                    <Link href="/privacy" className="text-[var(--accent-primary)] hover:underline">
                                        Privacy Policy
                                    </Link>
                                </div>

                                <Button
                                    type="submit"
                                    variant="gradient"
                                    size="lg"
                                    fullWidth
                                    loading={loading}
                                    icon={<ArrowRight className="w-4 h-4" />}
                                    iconPosition="right"
                                >
                                    Create Account
                                </Button>
                            </form>
                        </Card>

                        <p className="text-center mt-6 text-sm text-[var(--text-secondary)]">
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                className="text-[var(--accent-primary)] font-medium hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
