import { motion } from 'framer-motion';
import { UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FloatingUploadButton() {
  const navigate = useNavigate();
  return (
    <motion.button
      onClick={() => navigate('/upload')}
      className="fixed bottom-8 right-8 z-50 rounded-full bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 p-4 shadow-xl shadow-cyan-500/20 border-4 border-white/20 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      animate={{ boxShadow: [
        '0 0 24px #a855f7',
        '0 0 40px #06b6d4',
        '0 0 24px #a855f7'
      ] }}
      transition={{ repeat: Infinity, duration: 2 }}
      aria-label="Upload file"
    >
      <UploadCloud size={32} className="text-white drop-shadow-lg animate-bounce" />
    </motion.button>
  );
}
