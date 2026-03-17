import { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadFull } from 'tsparticles';

export default function ParticleBackground() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    }).then(() => {
      if (mounted) setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) {
    return (
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
        <div className="absolute -top-40 -left-32 h-[420px] w-[420px] rounded-full bg-purple-500/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-32 h-[420px] w-[420px] rounded-full bg-cyan-400/25 blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/3 h-[360px] w-[360px] -translate-y-1/2 rounded-full bg-pink-500/15 blur-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <Particles
        id="tsparticles-bg"
        className="h-full w-full"
        options={{
          fullScreen: { enable: false },
          background: { color: 'transparent' },
          fpsLimit: 60,
          detectRetina: true,
          particles: {
            number: { value: 80, density: { enable: true, area: 900 } },
            color: { value: ['#38bdf8', '#a855f7', '#e11d48'] },
            shape: { type: 'circle' },
            opacity: {
              value: 0.35,
              random: true,
              animation: { enable: true, speed: 0.6, minimumValue: 0.1, sync: false },
            },
            size: {
              value: { min: 1, max: 3 },
              animation: { enable: true, speed: 2, minimumValue: 0.5, sync: false },
            },
            links: {
              enable: true,
              distance: 140,
              color: '#38bdf8',
              opacity: 0.25,
              width: 1,
            },
            move: {
              enable: true,
              speed: 0.8,
              direction: 'none',
              random: false,
              straight: false,
              outModes: { default: 'bounce' },
              attract: { enable: false },
            },
          },
          interactivity: {
            events: {
              onHover: { enable: true, mode: ['repulse', 'bubble'] },
              onClick: { enable: false, mode: 'push' },
              resize: true,
            },
            modes: {
              repulse: { distance: 80, duration: 0.4 },
              bubble: { distance: 120, size: 4, duration: 0.3, opacity: 0.6 },
            },
          },
        }}
      />
      <div className="pointer-events-none absolute -top-40 -left-32 h-[420px] w-[420px] rounded-full bg-purple-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-[420px] w-[420px] rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/3 h-[360px] w-[360px] -translate-y-1/2 rounded-full bg-pink-500/15 blur-3xl" />
    </div>
  );
}

