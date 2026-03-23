import { motion } from 'framer-motion';
import { LogIn, UploadCloud, Share2 } from 'lucide-react';

const STEPS = [
  {
    icon: LogIn,
    title: 'Login / Sign up',
    description: 'Create your CloudShare account and sign in securely.',
  },
  {
    icon: UploadCloud,
    title: 'Upload your files',
    description: 'Upload files instantly with a clean, modern flow.',
  },
  {
    icon: Share2,
    title: 'Share in seconds',
    description: 'Generate secure share links and access your files anywhere.',
  },
];

export default function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">How it works</h2>
          <p className="mt-3 text-white/70">3 simple steps to get started with CloudShare.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              whileHover={{ y: -6, scale: 1.01 }}
              className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-7 shadow-xl shadow-black/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500">
                  <s.icon size={22} className="text-white" />
                </div>
                <div className="text-sm font-semibold text-white/60">Step {i + 1}</div>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-sm text-white/70">{s.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
