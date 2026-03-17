import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Tilt from 'react-parallax-tilt';
import {
  CloudLightning,
  ShieldCheck,
  Share2,
  UploadCloud,
  FolderOpen,
  ArrowRight,
  Twitter,
  Github,
  Linkedin,
  Lock,
} from 'lucide-react';
import Hero3D from '../components/Hero3D';

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#1e293b] text-white">
      {/* Background glow shapes */}
      <div className="pointer-events-none absolute -top-40 -left-24 h-80 w-80 rounded-full bg-sky-500/12 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-indigo-500/12 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-6rem] left-1/4 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Top nav */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 lg:px-10 py-4 border-b border-sky-900/70 backdrop-blur-xl bg-slate-950/60">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/90 border border-sky-300/80 shadow-sm shadow-sky-500/40">
            <CloudLightning size={18} className="text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">CloudShare</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-200">
          <button
            type="button"
            onClick={() => document.getElementById('product')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="text-slate-100 hover:text-white transition-colors"
          >
            Product
          </button>
          <button
            type="button"
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="text-slate-100 hover:text-white transition-colors"
          >
            Features
          </button>
          <button
            type="button"
            onClick={() => document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="text-slate-100 hover:text-white transition-colors"
          >
            Stats
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Link
            to="/login"
            className="px-3 py-1.5 rounded-lg text-white hover:bg-slate-800/70 transition-all duration-200 border border-slate-600/70 bg-slate-900/40"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="px-3.5 py-1.5 rounded-lg bg-sky-500 text-white hover:bg-sky-400 font-medium shadow-sm shadow-sky-500/40 transition-all duration-200"
          >
            Sign up
          </Link>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero section */}
        <section className="px-4 sm:px-6 lg:px-10 pt-24 pb-24 md:pt-32 md:pb-32">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)] items-center max-w-6xl mx-auto">
            {/* Left copy */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="space-y-6"
            >
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-sky-300">
                Enterprise-ready cloud file sharing
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-white">
                One secure place for every file.
              </h1>
              <p className="text-sm sm:text-base text-slate-200 max-w-xl">
                CloudShare gives your team a central workspace to upload, organize,
                and share files securely with clients, partners, and teammates.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-3">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-sky-500 text-white hover:bg-sky-400 px-5 py-2.5 text-sm font-medium shadow-sm shadow-sky-500/40 transition-all duration-200 hover:-translate-y-[1px] hover:scale-[1.03] hover:shadow-md active:scale-[0.97]"
                >
                  Get started
                  <ArrowRight size={16} />
                </Link>
                <button
                  type="button"
                  onClick={() => document.getElementById('product-screenshot')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-600 bg-slate-900/40 text-white hover:bg-slate-900/70 hover:border-sky-500/70 px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                >
                  Live demo
                </button>
              </div>

              <div className="mt-6 grid gap-3 text-xs text-slate-200 sm:grid-cols-2 max-w-lg">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-500" />
                  Zero-config JWT auth &amp; HTTPS
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-500" />
                  Expiring share links &amp; email invites
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-500" />
                  Multi-file drag-and-drop uploads
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-500" />
                  Analytics, activity timeline &amp; rooms
                </div>
              </div>
            </motion.div>

            {/* Right – 3D hero and preview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
              className="relative"
            >
              <div className="pointer-events-none absolute -inset-10 rounded-[2.5rem] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),transparent_65%),_radial-gradient(circle_at_bottom,_rgba(15,23,42,0.8),transparent_55%)]" />
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                className="relative rounded-[2rem] border border-neutral-800/80 bg-neutral-950/90 shadow-xl shadow-black/70 overflow-hidden"
              >
                <Hero3D />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
                className="absolute -bottom-8 left-6 right-6 rounded-2xl border border-neutral-800 bg-neutral-950/95 backdrop-blur-xl p-3 shadow-md shadow-black/60 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100">
                    <UploadCloud size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-50">Drag &amp; drop uploads</p>
                    <p className="text-[11px] text-neutral-400">Queue multiple files, track progress, and share instantly.</p>
                  </div>
                </div>
                <span className="rounded-full bg-neutral-900 px-3 py-1 text-[10px] font-medium text-neutral-300 border border-neutral-700">
                  Product preview
                </span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Product showcase section */}
        <section id="product" className="relative px-4 sm:px-6 lg:px-10 py-28 md:py-32">
          <div className="pointer-events-none absolute inset-x-0 -top-10 mx-auto h-72 max-w-xl rounded-full bg-sky-500/10 blur-3xl" />
          <div className="relative max-w-6xl mx-auto grid gap-12 lg:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="space-y-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">
                Product overview
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
                A single, clear workspace for all your files.
              </h2>
              <p className="text-sm sm:text-base text-slate-200 max-w-xl">
                Give every team the same simple place to work with files: upload once,
                organize with folders and search, then share secure links or rooms in
                seconds.
              </p>
              <div className="grid gap-3 text-sm text-slate-200">
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400" />
                  <div>
                    <p className="font-medium text-white">Centralized file hub</p>
                    <p className="text-xs text-slate-300">
                      One dashboard for uploads, shared links, rooms, and storage
                      usage.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400" />
                  <div>
                    <p className="font-medium text-white">Enterprise-friendly sharing</p>
                    <p className="text-xs text-slate-300">
                      Expiring links, access roles, and activity history on every
                      file.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400" />
                  <div>
                    <p className="font-medium text-white">Fast adoption</p>
                    <p className="text-xs text-slate-300">
                      A familiar, clean interface so teams can get started in
                      minutes.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative"
            >
              <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),transparent_60%),_radial-gradient(circle_at_bottom,_rgba(15,23,42,0.9),transparent_50%)]" />
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                className="relative rounded-[1.75rem] border border-sky-900/70 bg-slate-950/80 backdrop-blur-xl shadow-xl shadow-black/60 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-2 border-b border-sky-900/70 bg-slate-950/90 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                    <span className="h-2 w-2 rounded-full bg-amber-300" />
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  </div>
                  <span className="font-medium text-white">CloudShare · Workspace</span>
                  <span className="rounded-full bg-sky-500/20 text-sky-200 px-2 py-0.5 text-[10px]">
                    Live
                  </span>
                </div>
                <div className="grid gap-3 p-4 sm:p-5 text-[11px] sm:text-xs text-slate-100">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-sky-500 text-white px-2 py-1 text-[10px] font-medium">
                        Overview
                      </span>
                      <span className="text-slate-300/80">My files</span>
                      <span className="text-slate-300/80">Rooms</span>
                      <span className="text-slate-300/80">Shared</span>
                    </div>
                    <span className="rounded-full bg-slate-900/80 text-slate-100 px-2 py-1 text-[10px]">
                      Storage · 72% used
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-900/70 border border-sky-900/70 p-3">
                      <p className="text-[11px] text-slate-300">Files</p>
                      <p className="mt-1 text-lg font-semibold">1,248</p>
                      <p className="mt-1 text-[10px] text-sky-200/90">+142 this week</p>
                    </div>
                    <div className="rounded-2xl bg-slate-900/70 border border-sky-900/70 p-3">
                      <p className="text-[11px] text-slate-300">Downloads</p>
                      <p className="mt-1 text-lg font-semibold">18,392</p>
                      <p className="mt-1 text-[10px] text-cyan-200/90">+2,304 this month</p>
                    </div>
                    <div className="rounded-2xl bg-slate-900/70 border border-sky-900/70 p-3">
                      <p className="text-[11px] text-slate-300">Rooms</p>
                      <p className="mt-1 text-lg font-semibold">32</p>
                      <p className="mt-1 text-[10px] text-emerald-200/90">Live this week</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Feature explanation section 1 */}
        <section id="features" className="relative px-4 sm:px-6 lg:px-10 py-28 md:py-32">
          <div className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl" />
          <div className="relative max-w-6xl mx-auto grid gap-12 lg:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="space-y-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">
                Features
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
                Everything teams need to share files.
              </h2>
              <p className="text-sm sm:text-base text-slate-200 max-w-xl">
                CloudShare replaces ad-hoc file sharing with a consistent, auditable
                flow for getting content to the right people.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  className="rounded-xl bg-[#0f172a] border border-slate-800/80 px-4 py-4 shadow-[0_0_24px_rgba(56,189,248,0.15)] hover:border-sky-500/70 hover:shadow-[0_0_36px_rgba(56,189,248,0.35)] transition-all duration-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck size={18} className="text-sky-300" />
                    <p className="font-medium text-white text-sm">Secure cloud storage</p>
                  </div>
                  <p className="text-xs text-slate-300">
                    Keep every file in encrypted storage with access you control.
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  className="rounded-xl bg-[#0f172a] border border-slate-800/80 px-4 py-4 shadow-[0_0_24px_rgba(56,189,248,0.15)] hover:border-sky-500/70 hover:shadow-[0_0_36px_rgba(56,189,248,0.35)] transition-all duration-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <UploadCloud size={18} className="text-sky-300" />
                    <p className="font-medium text-white text-sm">Fast file uploads</p>
                  </div>
                  <p className="text-xs text-slate-300">
                    Drag, drop, and track large uploads with real-time progress.
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  className="rounded-xl bg-[#0f172a] border border-slate-800/80 px-4 py-4 shadow-[0_0_24px_rgba(56,189,248,0.15)] hover:border-sky-500/70 hover:shadow-[0_0_36px_rgba(56,189,248,0.35)] transition-all duration-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FolderOpen size={18} className="text-sky-300" />
                    <p className="font-medium text-white text-sm">Temporary sharing rooms</p>
                  </div>
                  <p className="text-xs text-slate-300">
                    Spin up rooms for projects, then archive when the work is done.
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  className="rounded-xl bg-[#0f172a] border border-slate-800/80 px-4 py-4 shadow-[0_0_24px_rgba(56,189,248,0.15)] hover:border-sky-500/70 hover:shadow-[0_0_36px_rgba(56,189,248,0.35)] transition-all duration-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Share2 size={18} className="text-sky-300" />
                    <p className="font-medium text-white text-sm">Secure sharing links</p>
                  </div>
                  <p className="text-xs text-slate-300">
                    Send expiring, access-controlled links instead of bulky email attachments.
                  </p>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.05, ease: 'easeOut' }}
            >
              <Tilt
                glareEnable
                glareMaxOpacity={0.2}
                glareColor="#38bdf8"
                glarePosition="all"
                scale={1.02}
                tiltMaxAngleX={8}
                tiltMaxAngleY={8}
                transitionSpeed={280}
                className="group"
              >
                <div className="relative overflow-hidden rounded-3xl border border-sky-900/70 bg-slate-950/80 backdrop-blur-xl p-4 sm:p-5 shadow-xl shadow-black/60">
                  <div className="mb-3 flex items-center justify-between text-[11px] text-slate-300">
                    <span className="font-medium text-white">Recent upload room</span>
                    <span className="rounded-full bg-sky-500/20 text-sky-200 px-2 py-0.5">
                      Client handoff
                    </span>
                  </div>
                  <div className="space-y-2 text-[11px] text-slate-100">
                    <div className="flex items-center justify-between rounded-2xl bg-slate-900/80 border border-sky-900/60 px-3 py-2">
                      <span className="truncate max-w-[60%]">brand-refresh-assets.zip</span>
                      <span className="text-slate-300/80">1.2 GB</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-slate-900/80 border border-sky-900/60 px-3 py-2">
                      <span className="truncate max-w-[60%]">launch-video-final.mp4</span>
                      <span className="text-slate-300/80">840 MB</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-slate-900/80 border border-sky-900/60 px-3 py-2">
                      <span className="truncate max-w-[60%]">press-kit-q3.pdf</span>
                      <span className="text-slate-300/80">24 MB</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-300">
                    <span>3 people have access</span>
                    <span className="rounded-full bg-slate-900 px-2 py-0.5 text-sky-200">
                      View activity
                    </span>
                  </div>
                </div>
              </Tilt>
            </motion.div>
          </div>
        </section>

        {/* Product screenshot section */}
        <section id="product-screenshot" className="relative px-4 sm:px-6 lg:px-10 py-28 md:py-32">
          <div className="pointer-events-none absolute inset-x-0 -bottom-10 mx-auto h-72 max-w-xl rounded-full bg-cyan-500/10 blur-3xl" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-5xl mx-auto text-center mb-10"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">
              Product screenshot
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-white">
              A clean dashboard your team will actually use.
            </h2>
            <p className="mt-3 text-sm text-slate-200 max-w-2xl mx-auto">
              From upload queues to storage usage, CloudShare surfaces everything you
              care about in one glanceable view.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 26, scale: 0.99 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative max-w-6xl mx-auto rounded-3xl border border-sky-900/70 bg-slate-950/80 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/70"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-sky-900/70 bg-slate-950/90 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                <span className="h-2 w-2 rounded-full bg-amber-300" />
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>
              <span className="font-medium text-white">CloudShare · Dashboard</span>
              <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-200">
                Demo workspace
              </span>
            </div>
            <div className="grid gap-4 p-4 sm:p-5 text-[11px] sm:text-xs text-slate-100 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)]">
              <div className="space-y-3">
                <div className="rounded-2xl bg-slate-900/80 border border-sky-900/70 p-3">
                  <p className="text-[11px] text-slate-300">Today&apos;s activity</p>
                  <p className="mt-1 text-lg font-semibold">42 uploads</p>
                  <p className="mt-1 text-[10px] text-sky-200/90">8 rooms updated · 19 links created</p>
                </div>
                <div className="rounded-2xl bg-slate-900/80 border border-sky-900/70 p-3">
                  <p className="text-[11px] text-slate-300">Storage overview</p>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400" style={{ width: '72%' }} />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-300">3.6 TB of 5 TB used</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl bg-slate-900/80 border border-sky-900/70 p-3">
                  <p className="mb-2 text-[11px] text-slate-300">Recent uploads</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between rounded-xl bg-slate-950/80 px-3 py-1.5">
                      <span className="truncate max-w-[60%]">quarterly-report-q3.pdf</span>
                      <span className="text-slate-400">View</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-slate-950/80 px-3 py-1.5">
                      <span className="truncate max-w-[60%]">product-launch-assets.zip</span>
                      <span className="text-slate-400">View</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-slate-950/80 px-3 py-1.5">
                      <span className="truncate max-w-[60%]">legal-agreement-v2.docx</span>
                      <span className="text-slate-400">View</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-900/80 border border-sky-900/70 p-3">
                  <p className="mb-2 text-[11px] text-slate-300">Upload queue</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span>design-system-v4.sketch</span>
                      <span className="text-emerald-300/90">Completed</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span>team-offsite-photos.zip</span>
                      <span className="text-sky-300/90">72%</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span>brand-guidelines.pdf</span>
                      <span className="text-slate-400/90">Queued</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Feature explanation section 2 (security-focused) */}
        <section className="relative px-4 sm:px-6 lg:px-10 py-28 md:py-32">
          <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="relative max-w-6xl mx-auto grid gap-12 lg:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div className="relative overflow-hidden rounded-3xl border border-emerald-900/70 bg-slate-950/80 backdrop-blur-xl p-4 sm:p-5 shadow-xl shadow-black/60">
                <div className="mb-3 flex items-center justify-between text-[11px] text-slate-300">
                  <span className="font-medium text-white">Access overview</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-200">
                    <ShieldCheck size={12} />
                    Enforced
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-100">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-900/80 border border-emerald-900/70 px-3 py-2">
                    <div>
                      <p>Board reports</p>
                      <p className="text-[10px] text-slate-300/90">8 members · Internal</p>
                    </div>
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-200">
                      Encrypted
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-900/80 border border-emerald-900/70 px-3 py-2">
                    <div>
                      <p>Client handoff</p>
                      <p className="text-[10px] text-slate-300/90">6 guests · Link expires in 5 days</p>
                    </div>
                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-200">
                      Expiring
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-900/80 border border-emerald-900/70 px-3 py-2">
                    <div>
                      <p>Legal archive</p>
                      <p className="text-[10px] text-slate-300/90">Read-only · 2 admins</p>
                    </div>
                    <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-slate-200">
                      Locked
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-300">
                  <span>Every action is logged.</span>
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-slate-200">
                    Export audit trail
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.05, ease: 'easeOut' }}
              className="space-y-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
                Security &amp; visibility
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
                Security that doesn&apos;t slow people down.
              </h2>
              <p className="text-sm sm:text-base text-slate-200 max-w-xl">
                CloudShare is built with security by default: encrypted storage,
                fine-grained access controls, and clear audit trails so you can
                share files confidently.
              </p>
              <div className="space-y-3 text-sm text-slate-200">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/90 text-white">
                    <Lock size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-white">Encrypted by default</p>
                    <p className="text-xs text-slate-300">
                      All files are encrypted in transit and at rest on secure
                      infrastructure.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/90 text-white">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-white">Granular access</p>
                    <p className="text-xs text-slate-300">
                      Roles, rooms, and per-link settings keep sensitive files
                      separated by default.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/90 text-white">
                    <CloudLightning size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-white">Audit-friendly logs</p>
                    <p className="text-xs text-slate-300">
                      Every upload, view, and download is tracked for compliance and
                      reviews.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Statistics section */}
        <section id="stats" className="px-4 sm:px-6 lg:px-10 py-20 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-5xl mx-auto rounded-3xl border border-sky-900/70 bg-slate-950/80 backdrop-blur-xl px-6 py-8 sm:px-8 sm:py-10 shadow-lg shadow-black/60"
          >
            <div className="mb-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">
                By the numbers
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-white">
                Built to handle serious workloads.
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-4 text-center">
              <div className="space-y-1">
                <p className="text-3xl sm:text-4xl font-semibold text-white">2.5M+</p>
                <p className="text-xs text-slate-300">Files uploaded</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl sm:text-4xl font-semibold text-white">18k+</p>
                <p className="text-xs text-slate-300">Active users</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl sm:text-4xl font-semibold text-white">9.3M</p>
                <p className="text-xs text-slate-300">Downloads</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl sm:text-4xl font-semibold text-white">99.9%</p>
                <p className="text-xs text-slate-300">Uptime</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Final CTA section */}
        <section className="px-4 sm:px-6 lg:px-10 py-24 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-4xl mx-auto rounded-3xl border border-sky-900/70 bg-slate-950/90 p-6 sm:p-8 shadow-xl shadow-black/60 text-center flex flex-col items-center gap-4"
          >
            <h2 className="text-3xl sm:text-4xl font-semibold text-white">
              Ready to start uploading your files?
            </h2>
            <p className="text-sm text-slate-200 max-w-xl">
              Create a free account, upload your first files, and share a secure
              link with your team or clients in just a few clicks.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-sky-500/60 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md hover:bg-sky-400"
              >
                Start uploading files
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full border border-slate-600 bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-200 hover:bg-slate-800 hover:border-sky-500/70 transition-all duration-200"
              >
                Already have an account?
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/70 bg-slate-950/70 backdrop-blur-xl px-4 sm:px-6 lg:px-10 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] sm:text-xs text-slate-300/80">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500 text-white border border-sky-400/90">
              <CloudLightning size={14} className="text-white" />
            </div>
            <div>
              <p className="font-medium text-white">CloudShare</p>
              <p className="text-[10px] text-slate-300/80">Fast, secure, and quietly premium file sharing.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <nav className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => document.getElementById('product')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="hover:text-white transition-colors"
              >
                Product
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="hover:text-white transition-colors"
              >
                Features
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="hover:text-white transition-colors"
              >
                Stats
              </button>
            </nav>
            <div className="flex items-center gap-2 text-slate-300/80">
              <a href="#" className="p-1.5 rounded-full hover:bg-slate-800/80 hover:text-white transition-colors">
                <Twitter size={14} />
              </a>
              <a href="#" className="p-1.5 rounded-full hover:bg-slate-800/80 hover:text-white transition-colors">
                <Github size={14} />
              </a>
              <a href="#" className="p-1.5 rounded-full hover:bg-slate-800/80 hover:text-white transition-colors">
                <Linkedin size={14} />
              </a>
            </div>
          </div>
          <p className="text-[10px] text-slate-400/80">© {new Date().getFullYear()} CloudShare. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
