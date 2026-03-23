import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar  from './Navbar';
import Sidebar from './Sidebar';
import ParticleBackground from './ParticleBackground';
import FloatingUploadButton from './FloatingUploadButton';

/**
 * Main application shell shared by all protected pages.
 * Sidebar collapses to icon-only rail on toggle.
 */
export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-animated-gradient relative">
      {/* Animated Particle Background */}
      <ParticleBackground />

      {/* Floating Upload Action Button */}
      <FloatingUploadButton />

      {/* Collapsible Sidebar */}
      <Sidebar collapsed={collapsed} onCollapse={() => setCollapsed(c => !c)} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Navbar variant="app" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

