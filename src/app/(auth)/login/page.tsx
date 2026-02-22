'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Building2, ShieldCheck, Database, CheckCircle2 } from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
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
            const trimmedEmail = email.trim();
            const trimmedPassword = password.trim();

            const user = await loginWithEmail(trimmedEmail, trimmedPassword);
            const userData = await getUserData(user.uid);

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
            setError(err.code === 'auth/invalid-credential' ? 'Incorrect email or password' : 'We could not sign you in. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex page-wrapper overflow-hidden">
            {/* Left Side - Welcome Section */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-white border-r border-slate-200">
                <div className="absolute inset-0 bg-grid-subtle opacity-40" />

                <div className="relative z-10 flex flex-col justify-center p-20 space-y-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-900">HoardBook</span>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                                Hello again!<br />
                                <span className="text-emerald-500">Sign in to your account.</span>
                            </h1>
                            <p className="text-base text-slate-500 font-medium max-w-sm">
                                Access your dashboard to manage your billboards or book new advertising spaces.
                            </p>
                        </div>

                        {/* Simple Info Cards */}
                        <div className="grid grid-cols-2 gap-4 pt-8">
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                <p className="text-xs font-bold text-slate-900">Easy Management</p>
                                <p className="text-[10px] text-slate-400">Control everything from one place.</p>
                            </div>
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                                <ShieldCheck className="w-5 h-5 text-blue-500" />
                                <p className="text-xs font-bold text-slate-900">Secure Payments</p>
                                <p className="text-[10px] text-slate-400">Your data is always protected.</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-20 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="text-center space-y-2">
                        <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Welcome Back</h2>
                        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Sign In</h3>
                    </div>

                    <Card variant="default" className="p-10 shadow-xl shadow-slate-200/50">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-semibold text-center">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <Input
                                    id="email"
                                    name="email"
                                    label="Email Address"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="john@example.com"
                                    icon={<Mail className="w-4 h-4" />}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />

                                <div className="space-y-1">
                                    <div className="flex justify-between items-center ml-1">
                                        <label htmlFor="password" title="passwordLabel" className="text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer">Password</label>
                                        <Link href="#" className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700">Forgot it?</Link>
                                    </div>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        placeholder="Your password"
                                        icon={<Lock className="w-4 h-4" />}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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
                                className="h-14 shadow-lg shadow-emerald-500/20"
                            >
                                Sign In
                            </Button>
                        </form>
                    </Card>

                    <p className="text-center text-sm font-semibold text-slate-500">
                        Don&apos;t have an account?{' '}
                        <Link
                            href="/register"
                            className="text-emerald-600 hover:text-emerald-700 font-bold"
                        >
                            Sign up here
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
