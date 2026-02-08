'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Building2, ArrowRight, MapPin, Calendar, Shield, Zap, Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function HomePage() {
  const features = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Prime Locations',
      description: 'Access premium hoarding spaces across major cities and highways.',
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: 'Easy Booking',
      description: 'Book instantly with real-time availability and transparent pricing.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Verified Owners',
      description: 'All hoarding owners are verified for secure transactions.',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Quick Setup',
      description: 'Get your campaign live in minutes, not weeks.',
    },
  ];

  const stats = [
    { value: '500+', label: 'Active Hoardings' },
    { value: '1,200+', label: 'Advertisers' },
    { value: '50+', label: 'Cities' },
    { value: '98%', label: 'Satisfaction' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-light)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-[var(--text-primary)]">HoardBook</span>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-light)] mb-6">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-[var(--text-secondary)]">
                Trusted by 1,200+ advertisers nationwide
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-[var(--text-primary)] leading-tight mb-6">
              Book Premium{' '}
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Advertising Spaces
              </span>{' '}
              Online
            </h1>

            <p className="text-xl text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
              Connect with hoarding owners across the country. Browse, compare, and book
              the perfect billboard for your next campaign—all in one place.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link href="/register">
                <Button variant="gradient" size="lg" icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
                  Start Advertising
                </Button>
              </Link>
              <Link href="/register?role=owner">
                <Button variant="secondary" size="lg">
                  List Your Hoarding
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center p-6 rounded-[var(--radius-lg)] bg-[var(--bg-secondary)] border border-[var(--border-light)]"
              >
                <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-[var(--text-tertiary)]">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-[var(--bg-secondary)] border-y border-[var(--border-light)]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
              Why Choose HoardBook?
            </h2>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
              We make outdoor advertising simple, transparent, and effective.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-[var(--radius-lg)] bg-[var(--bg-primary)] border border-[var(--border-light)] hover:shadow-[var(--shadow-lg)] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-[var(--radius-md)] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-500 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-12 rounded-[var(--radius-xl)] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white text-center overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">
                Ready to amplify your brand?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Join thousands of advertisers who trust HoardBook for their outdoor advertising needs.
              </p>
              <Link href="/register">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-indigo-600 hover:bg-white/90 border-0"
                  icon={<ChevronRight className="w-5 h-5" />}
                  iconPosition="right"
                >
                  Get Started Free
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[var(--border-light)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-[var(--text-primary)]">HoardBook</span>
            </div>
            <p className="text-sm text-[var(--text-tertiary)]">
              © 2026 HoardBook. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
