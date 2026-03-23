import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Cloud,
  Link2,
  Zap,
  Smartphone,
  ShieldCheck,
  LayoutDashboard,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Cloud,
    title: 'Secure File Storage',
    description: 'Store files safely with reliable cloud storage.',
  },
  {
    icon: Link2,
    title: 'Easy File Sharing',
    description: 'Share files with secure links in seconds.',
  },
  {
    icon: Zap,
    title: 'Fast Upload & Download',
    description: 'Smooth transfers designed for speed.',
  },
  {
    icon: Smartphone,
    title: 'Access Anywhere',
    description: 'Use CloudShare on desktop and mobile.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy & Security',
    description: 'JWT-protected access with modern security.',
  },
  {
    icon: LayoutDashboard,
    title: 'User Dashboard',
    description: 'Manage files, folders, and shares easily.',
  },
];

function FeatureCard({ feature, index }) {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});

  const onMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const rotateY = (x - 0.5) * 10;
    const rotateX = (0.5 - y) * 10;

    setTiltStyle({
      transform: `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`,
    });
  };

  const onLeave = () => {
    setTiltStyle({
      transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)',
    });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35, delay: index * 0.03 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={tiltStyle}
      className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl shadow-black/20 transition-transform duration-200 will-change-transform"
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-indigo-500/30 via-sky-500/20 to-purple-500/30" />
        <div className="absolute inset-0 rounded-2xl bg-slate-950/70" />
      </div>

      <div className="relative">
        <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 mb-4">
          <feature.icon size={22} className="text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
        <p className="text-sm text-white/70">{feature.description}</p>
        <div className="mt-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <p className="mt-3 text-xs text-white/55">Premium depth, glow border, and subtle tilt.</p>
      </div>
    </motion.div>
  );
}

export default function LandingFeatures() {
  return (
    <section id="features" className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Features built for modern teams</h2>
          <p className="mt-3 text-white/70 max-w-2xl mx-auto">
            Clean UI, secure sharing, and a dashboard that keeps everything organized.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
