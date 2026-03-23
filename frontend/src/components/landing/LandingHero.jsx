import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  ChevronDown,
  LockKeyhole,
  BarChart3,
  Link2,
  FolderOpen,
} from 'lucide-react';

const floatTransition = (delay = 0) => ({
  duration: 6.5,
  delay,
  repeat: Infinity,
  ease: 'easeInOut',
});

function FloatingCard({ className, delay = 0, title, content, icon, children }) {
  const Icon = icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.12 + delay, ease: 'easeOut' }}
      whileHover={{ y: -6, scale: 1.01 }}
      className={
        'pointer-events-auto ' +
        'group rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl ' +
        'shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_18px_60px_-40px_rgba(0,0,0,0.85)] ' +
        'transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_45px_hsl(var(--primary)/0.22)] ' +
        className
      }
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={floatTransition(delay)}
        className="relative p-5"
      >
        <div className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-white">{title}</div>
            <div className="mt-1 text-xs text-white/65 leading-relaxed">{content}</div>
          </div>
          <div className="h-9 w-9 rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/50 to-sky-500/50 flex items-center justify-center">
            <Icon size={18} className="text-white" />
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function LandingHero() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center px-6 pb-40" id="top">
      {/* Background (clip ONLY the background, not the floating cards) */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-animated-gradient" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/35 to-slate-950" />

        <div className="absolute -top-40 -left-40 h-[560px] w-[560px] rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[560px] w-[560px] rounded-full bg-sky-500/25 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-purple-500/20 blur-3xl" />

        {/* Subtle animated rings */}
        <motion.div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
          animate={{ opacity: [0.18, 0.32, 0.18], scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5"
          animate={{ opacity: [0.08, 0.18, 0.08], scale: [1, 1.03, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative max-w-7xl w-full mx-auto text-center">
        <div className="relative py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)_320px] xl:grid-cols-[360px_minmax(0,1fr)_360px] items-start lg:items-center gap-10">
            {/* Left floating cards (desktop) */}
            <div className="hidden lg:flex flex-col gap-6 items-start">
              <FloatingCard
                delay={0}
                icon={LockKeyhole}
                title="Secure Storage"
                content="Store files safely with encrypted cloud storage."
                className="w-full"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/60">Storage</div>
                  <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">
                    Encrypted
                    <LockKeyhole size={14} className="text-emerald-300" />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <div className="text-sm text-white/85">Personal Storage</div>
                  <ChevronDown size={18} className="text-white/50" />
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>Used</span>
                    <span>12.4 GB</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full w-[62%] bg-gradient-to-r from-indigo-500 to-sky-500" />
                  </div>
                </div>
              </FloatingCard>

              <div className="hidden xl:block">
                <FloatingCard
                  delay={0.15}
                  icon={BarChart3}
                  title="Smart Analytics"
                  content="Track file activity, uploads, and storage usage in real-time."
                  className="w-full"
                >
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/60">Activity</div>
                  <div className="inline-flex items-center gap-2 text-xs text-white/70">
                    <BarChart3 size={16} className="text-sky-300" />
                    Live
                  </div>
                </div>
                <div className="mt-4 flex items-end gap-2 h-20">
                  {[18, 32, 26, 44, 36, 52, 40].map((h, i) => (
                    <div key={i} className="flex-1 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                      <div
                        className="w-full bg-gradient-to-t from-indigo-500 to-sky-500"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-xs text-white/60">Uploads</div>
                    <div className="mt-1 text-lg font-bold text-white">+128</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-xs text-white/60">Storage</div>
                    <div className="mt-1 text-lg font-bold text-white">72%</div>
                  </div>
                </div>
                </FloatingCard>
              </div>
            </div>

            {/* Centered hero */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="relative z-10 text-center max-w-3xl mx-auto"
            >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/80 text-sm">
              <Sparkles size={16} className="text-sky-300" />
              CloudShare — Cloud File Sharing Platform
            </div>

            <div className="relative mt-6">
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 h-56 w-[42rem] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-500/25 via-purple-500/25 to-sky-500/25 blur-3xl"
              />
              <h1 className="relative text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
              Secure File Sharing That Just Works
              </h1>
            </div>
            <p className="mt-4 text-lg text-white/75">
              Upload, manage, and share your files instantly with a fast, secure, and modern cloud platform.
            </p>
            <div className="mt-3 text-sm text-white/60">Built for speed. Designed for simplicity.</div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 transition-colors"
              >
                Get Started Free
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white/85 border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
              >
                View Pricing
              </Link>
            </div>
            </motion.div>

            {/* Right floating cards (desktop) */}
            <div className="hidden lg:flex flex-col gap-6 items-end">
              <FloatingCard
                delay={0.1}
                icon={Link2}
                title="Fast Sharing"
                content="Generate shareable links instantly with full control."
                className="w-full"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/60">Share</div>
                  <div className="inline-flex items-center gap-2 text-xs text-white/70">
                    <Link2 size={16} className="text-sky-300" />
                    Instant
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-5">
                    <div className="relative h-20 w-20 mx-auto">
                      <div className="absolute inset-0 rounded-full border border-white/10" />
                      <div className="absolute inset-2 rounded-full border-4 border-white/10" />
                      <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-sky-400 border-r-indigo-400 rotate-45" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-sm font-bold text-white">86%</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-7 space-y-2">
                    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
                      Link created • 2s ago
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
                      Access: private by default
                    </div>
                  </div>
                </div>
              </FloatingCard>

              <div className="hidden xl:block">
                <FloatingCard
                  delay={0.25}
                  icon={FolderOpen}
                  title="Better Management"
                  content="Organize files and folders with a clean dashboard."
                  className="w-full"
                >
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/60">Dashboard</div>
                  <div className="inline-flex items-center gap-2 text-xs text-white/70">
                    <FolderOpen size={16} className="text-sky-300" />
                    Organized
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {[{ name: 'Designs', meta: '8 files' }, { name: 'Invoices', meta: '3 files' }, { name: 'Shared', meta: '12 links' }].map((row) => (
                    <div
                      key={row.name}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                    >
                      <div className="text-sm text-white/85">{row.name}</div>
                      <div className="text-xs text-white/55">{row.meta}</div>
                    </div>
                  ))}
                </div>
                </FloatingCard>
              </div>
            </div>
          </div>

          {/* Mobile/tablet: cards become a neat grid below the hero */}
          <div className="mt-12 grid sm:grid-cols-2 gap-4 lg:hidden">
            {[
              {
                title: 'Secure Storage',
                content: 'Store files safely with encrypted cloud storage.',
                icon: LockKeyhole,
                body: (
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <div className="text-sm text-white/85">Personal Storage</div>
                    <div className="inline-flex items-center gap-2 text-xs text-white/70">
                      Encrypted <LockKeyhole size={14} className="text-emerald-300" />
                    </div>
                  </div>
                ),
              },
              {
                title: 'Smart Analytics',
                content: 'Track file activity, uploads, and storage usage in real-time.',
                icon: BarChart3,
                body: (
                  <div className="flex items-end gap-2 h-16">
                    {[22, 38, 30, 52, 40].map((h, i) => (
                      <div key={i} className="flex-1 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                        <div
                          className="w-full bg-gradient-to-t from-indigo-500 to-sky-500"
                          style={{ height: `${h}%` }}
                        />
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                title: 'Fast Sharing',
                content: 'Generate shareable links instantly with full control.',
                icon: Link2,
                body: (
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
                    Link created • Access controlled
                  </div>
                ),
              },
              {
                title: 'Better Management',
                content: 'Organize files and folders with a clean dashboard.',
                icon: FolderOpen,
                body: (
                  <div className="space-y-2">
                    {['Designs', 'Invoices', 'Shared'].map((n) => (
                      <div
                        key={n}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80"
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                ),
              },
            ].map((c, idx) => {
              const Icon = c.icon;
              return (
                <motion.div
                  key={c.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-2xl shadow-black/20"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-white">{c.title}</div>
                      <div className="mt-1 text-xs text-white/65 leading-relaxed">{c.content}</div>
                    </div>
                    <div className="h-9 w-9 rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/50 to-sky-500/50 flex items-center justify-center">
                      <Icon size={18} className="text-white" />
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    {c.body}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
