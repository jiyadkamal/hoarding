'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building2,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Search,
  Users,
  ArrowRight,
  Globe,
  Zap,
  ArrowUpRight,
  BarChart3,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: 'easeOut' as const },
  }),
};

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden">

      {/* ─────────── NAV ─────────── */}
      <nav className="fixed top-0 z-50 w-full backdrop-blur-2xl bg-[#0e1628]/80 border-b border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Building2 className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="text-[17px] font-semibold tracking-[-0.02em] text-white">
              Hoard<span className="text-emerald-400">Book</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-7 text-[13px] text-white/50 font-medium">
            <Link href="#features" className="hover:text-white transition">Features</Link>
            <Link href="/advertiser/browse" className="hover:text-white transition">Marketplace</Link>
            <Link href="#" className="hover:text-white transition">Pricing</Link>
            <Link href="#" className="hover:text-white transition">About</Link>
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/login" className="px-4 py-[7px] text-[13px] font-medium text-white/60 hover:text-white transition">Sign in</Link>
            <Link href="/register" className="px-4 py-[7px] text-[13px] font-semibold bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/25">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─────────── HERO ─────────── */}
      <section className="relative pt-[130px] pb-[80px] lg:pt-[150px] lg:pb-[100px] bg-[#0e1628]">

        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-center">

            {/* Text */}
            <motion.div initial="hidden" animate="show" className="space-y-7">
              <motion.div custom={0} variants={fadeIn}>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 bg-emerald-400/[0.1] border border-emerald-400/[0.2] rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live in 120+ cities
                </span>
              </motion.div>

              <motion.h1 custom={1} variants={fadeIn} className="text-[42px] md:text-[52px] lg:text-[56px] font-semibold leading-[1.08] tracking-[-0.035em] text-white">
                Book billboards<br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">in minutes,</span>{' '}
                not months
              </motion.h1>

              <motion.p custom={2} variants={fadeIn} className="text-[16px] leading-[1.7] text-blue-100/50 max-w-[420px]">
                The marketplace for outdoor advertising. Discover prime locations, compare pricing, and book billboard spaces — all from one platform.
              </motion.p>

              <motion.div custom={3} variants={fadeIn} className="flex flex-wrap gap-3 pt-1">
                <Link href="/advertiser/browse" className="inline-flex items-center gap-2 h-[44px] px-5 rounded-[10px] bg-emerald-500 text-white text-[13px] font-semibold hover:bg-emerald-400 transition shadow-[0_0_24px_rgba(16,185,129,0.35)] active:scale-[0.98]">
                  <Search className="w-[15px] h-[15px]" />
                  Browse billboards
                </Link>
                <Link href="/register" className="inline-flex items-center gap-2 h-[44px] px-5 rounded-[10px] border border-white/[0.12] text-white/70 text-[13px] font-medium hover:bg-white/[0.05] hover:text-white transition active:scale-[0.98]">
                  List your space
                  <ArrowRight className="w-[14px] h-[14px]" />
                </Link>
              </motion.div>

              <motion.div custom={4} variants={fadeIn} className="flex items-center gap-5 pt-3 text-blue-100/30 text-[12px]">
                {['No setup fees', 'Cancel anytime', 'Free to browse'].map((t) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-[13px] h-[13px] text-emerald-400/50" />
                    <span>{t}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden ring-1 ring-white/[0.1] shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
                <img src="/images/hero-3d.jpg" alt="HoardBook 3D billboard management" className="w-full aspect-[4/3] object-cover" suppressHydrationWarning />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e1628]/40 via-transparent to-transparent" />
              </div>

              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-4 bottom-8 bg-[#151d30]/95 backdrop-blur-xl rounded-xl p-3 border border-white/[0.1] shadow-xl hidden md:flex items-center gap-2.5"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] text-white/30">Campaign ROI</p>
                  <p className="text-[13px] font-semibold text-white">+340%</p>
                </div>
              </motion.div>
              <div className="absolute -inset-6 bg-emerald-500/[0.05] rounded-3xl blur-2xl -z-10 pointer-events-none" />
            </motion.div>
          </div>
        </div>

      </section>

      {/* ─────────── STATS ─────────── */}
      <section className="bg-[#f8fafb] py-16 border-y border-slate-100">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { n: '50K+', l: 'Active billboards', c: 'text-emerald-600', bg: 'bg-emerald-50' },
            { n: '120+', l: 'Cities covered', c: 'text-blue-600', bg: 'bg-blue-50' },
            { n: '400+', l: 'Agency partners', c: 'text-violet-600', bg: 'bg-violet-50' },
            { n: '98%', l: 'Client satisfaction', c: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((s, i) => (
            <motion.div
              key={s.l}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${s.bg} mb-3`}>
                <p className={`text-[22px] font-bold ${s.c}`}>{s.n}</p>
              </div>
              <p className="text-[13px] text-slate-500 font-medium">{s.l}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─────────── FEATURES — COLORFUL CARDS ─────────── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-emerald-600 text-[12px] font-semibold uppercase tracking-[0.12em] mb-3">Features</p>
            <h2 className="text-[32px] md:text-[38px] font-semibold tracking-[-0.03em] text-slate-900">Smarter outdoor advertising</h2>
            <p className="text-slate-400 text-[15px] mt-3 max-w-md mx-auto">Everything you need to discover, book, and manage billboard campaigns.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                title: 'Precision targeting',
                desc: 'Filter by location, footfall, demographics, and budget to find your perfect billboard.',
                icon: MapPin,
                img: '/images/icon-targeting.jpg',
                gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
                iconBg: 'bg-emerald-100 text-emerald-600',
                border: 'hover:border-emerald-200',
              },
              {
                title: 'Secure settlements',
                desc: 'Verified contracts with integrated escrow. Full payment transparency and protection.',
                icon: ShieldCheck,
                img: '/images/icon-security.jpg',
                gradient: 'from-blue-500/20 via-blue-500/5 to-transparent',
                iconBg: 'bg-blue-100 text-blue-600',
                border: 'hover:border-blue-200',
              },
              {
                title: 'Live analytics',
                desc: 'Real-time campaign dashboards with visual proof and performance tracking.',
                icon: BarChart3,
                img: '/images/icon-insights.jpg',
                gradient: 'from-violet-500/20 via-violet-500/5 to-transparent',
                iconBg: 'bg-violet-100 text-violet-600',
                border: 'hover:border-violet-200',
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`group rounded-2xl bg-white border border-slate-100 ${f.border} shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden`}
              >
                <div className="h-[200px] relative flex items-center justify-center p-6 pb-2">
                  <img src={f.img} alt={f.title} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" suppressHydrationWarning />
                  <div className={`absolute inset-0 bg-gradient-to-t ${f.gradient} pointer-events-none`} />
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${f.iconBg} flex items-center justify-center`}>
                      <f.icon className="w-[18px] h-[18px]" />
                    </div>
                    <h3 className="text-[15px] font-semibold text-slate-900">{f.title}</h3>
                  </div>
                  <p className="text-[13px] text-slate-400 leading-[1.65]">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── HOW IT WORKS ─────────── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-emerald-600 text-[12px] font-semibold uppercase tracking-[0.12em] mb-3">How it works</p>
            <h2 className="text-[32px] md:text-[38px] font-semibold tracking-[-0.03em] text-slate-900">Three steps to launch</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: '01', title: 'Search', desc: 'Browse 50,000+ billboards filtered by city, size, and budget.', icon: Search, color: 'bg-emerald-500', shadow: 'shadow-emerald-500/30' },
              { n: '02', title: 'Book', desc: 'Compare pricing, check availability, and book with secure checkout.', icon: Zap, color: 'bg-blue-500', shadow: 'shadow-blue-500/30' },
              { n: '03', title: 'Track', desc: 'Monitor live dashboards with visual proof of your campaigns.', icon: BarChart3, color: 'bg-violet-500', shadow: 'shadow-violet-500/30' },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 border border-slate-100 text-center space-y-4 hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl ${s.color} ${s.shadow} shadow-lg flex items-center justify-center mx-auto`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Step {s.n}</p>
                <h3 className="text-[18px] font-semibold text-slate-900">{s.title}</h3>
                <p className="text-[13px] text-slate-400 leading-[1.6]">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── VALUE PROP — SPLIT ─────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
              <p className="text-emerald-600 text-[12px] font-semibold uppercase tracking-[0.12em]">Built for scale</p>
              <h2 className="text-[32px] md:text-[38px] font-semibold tracking-[-0.03em] leading-[1.15] text-slate-900">
                Your entire outdoor portfolio. One platform.
              </h2>
              <p className="text-slate-400 text-[15px] leading-[1.7] max-w-md">
                Whether you&apos;re booking highway billboards or managing digital screens, HoardBook handles it all seamlessly.
              </p>
              <div className="space-y-3 pt-2">
                {[
                  'Real-time inventory across 120+ cities',
                  'Automated pricing & availability',
                  'Performance analytics dashboard',
                  'Dedicated account management',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-[13px] text-slate-500">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/register" className="inline-flex items-center gap-2 text-[13px] font-semibold text-emerald-600 hover:text-emerald-500 transition group pt-2">
                Start for free <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <div className="rounded-2xl overflow-hidden ring-1 ring-slate-200 shadow-2xl shadow-slate-900/10">
                <img src="/images/hero-3d.jpg" alt="Platform overview" className="w-full aspect-[4/3] object-cover" suppressHydrationWarning />
              </div>
              <div className="absolute -bottom-3 -right-3 w-20 h-20 bg-emerald-100 rounded-2xl -z-10" />
              <div className="absolute -top-3 -left-3 w-14 h-14 bg-cyan-100 rounded-xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─────────── CTA ─────────── */}
      <section className="py-24 px-6 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-[780px] mx-auto rounded-3xl bg-[#0e1628] p-10 md:p-16 text-center relative overflow-hidden"
        >

          <div className="relative space-y-6">
            <h2 className="text-[28px] md:text-[36px] font-semibold tracking-[-0.03em] text-white leading-tight">
              Ready to launch your<br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">next campaign?</span>
            </h2>
            <p className="text-blue-100/35 text-[14px] max-w-sm mx-auto">
              Join 400+ agencies already using HoardBook to run smarter outdoor campaigns.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/register" className="inline-flex items-center justify-center h-[44px] px-6 rounded-[10px] bg-emerald-500 text-white text-[13px] font-semibold hover:bg-emerald-400 transition shadow-[0_0_24px_rgba(16,185,129,0.35)] active:scale-[0.98]">
                Get started free
              </Link>
              <button className="inline-flex items-center gap-1.5 text-[13px] text-white/40 font-medium hover:text-white/70 transition">
                Contact sales <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─────────── FOOTER ─────────── */}
      <footer className="bg-[#0e1628] border-t border-white/[0.04]">
        <div className="max-w-[1200px] mx-auto px-6 py-14">
          <div className="grid md:grid-cols-12 gap-10 md:gap-8">
            <div className="md:col-span-4 space-y-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <Building2 className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[15px] font-semibold text-white">Hoard<span className="text-emerald-400">Book</span></span>
              </Link>
              <p className="text-[12px] text-white/25 leading-[1.7] max-w-[280px]">
                The modern marketplace for outdoor advertising across 120+ cities.
              </p>
            </div>

            {[
              { title: 'Marketplace', links: ['Digital Billboards', 'Transit Ads', 'Mall Displays'] },
              { title: 'Platform', links: ['Analytics', 'API Docs', 'Integrations'] },
              { title: 'Company', links: ['About', 'Careers', 'Privacy'] },
            ].map((col) => (
              <div key={col.title} className="md:col-span-2 space-y-3">
                <h5 className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">{col.title}</h5>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}><Link href="#" className="text-[12px] text-white/20 hover:text-white/50 transition">{link}</Link></li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="md:col-span-2 space-y-3">
              <h5 className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Contact</h5>
              <p className="text-[12px] text-white/20">hello@hoardbook.com</p>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-white/15">&copy; 2026 HoardBook. All rights reserved.</p>
            <div className="flex gap-5 text-[11px] text-white/15">
              <Link href="#" className="hover:text-white/30 transition">Terms</Link>
              <Link href="#" className="hover:text-white/30 transition">Privacy</Link>
              <Link href="#" className="hover:text-white/30 transition">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
