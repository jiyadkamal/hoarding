'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Building2 } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { loginWithEmail, getUserData } from '@/lib/firebase/auth';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await loginWithEmail(email, password);
            const userData = await getUserData(user.uid);

            // Redirect based on role
            switch (userData?.role) {
                case 'admin':
                    router.push('/admin/dashboard');
                    break;
                case 'owner':
                    router.push('/owner/dashboard');
                    break;
                case 'advertiser':
                    router.push('/advertiser/browse');
                    break;
                default:
                    router.push('/');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            if (err.code === 'auth/invalid-credential') {
                setError('Invalid email or password');
            } else if (err.code === 'auth/user-not-found') {
                setError('No account found with this email');
            } else {
                setError('Failed to sign in. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex">
            {/* Left Side - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
                {/* Animated Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-700" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
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
                            Book Premium<br />
                            Advertising Spaces
                        </h1>
                        <p className="text-lg text-white/80 max-w-md">
                            Connect with top hoarding locations across the country.
                            Manage your advertising campaigns with ease.
                        </p>

                        {/* Stats */}
                        <div className="mt-12 flex gap-8">
                            <div>
                                <div className="text-3xl font-bold">500+</div>
                                <div className="text-sm text-white/70">Active Hoardings</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold">1,200+</div>
                                <div className="text-sm text-white/70">Happy Advertisers</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold">50+</div>
                                <div className="text-sm text-white/70">Cities</div>
                            </div>
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

            {/* Right Side - Login Form */}
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
                <div className="flex-1 flex items-center justify-center p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full max-w-md"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Welcome back</h2>
                            <p className="text-[var(--text-secondary)] mt-2">
                                Sign in to your account to continue
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

                                <Input
                                    label="Email Address"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    icon={<Mail className="w-4 h-4" />}
                                    required
                                />

                                <Input
                                    label="Password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    icon={<Lock className="w-4 h-4" />}
                                    required
                                />

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-[var(--border-medium)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                                        />
                                        Remember me
                                    </label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-[var(--accent-primary)] hover:underline"
                                    >
                                        Forgot password?
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
                                    Sign In
                                </Button>
                            </form>
                        </Card>

                        <p className="text-center mt-6 text-sm text-[var(--text-secondary)]">
                            Don&apos;t have an account?{' '}
                            <Link
                                href="/register"
                                className="text-[var(--accent-primary)] font-medium hover:underline"
                            >
                                Create one now
                            </Link>
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
