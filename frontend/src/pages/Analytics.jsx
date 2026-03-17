import { useEffect, useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { BarChart2, PieChart as PieIcon, TrendingUp, HardDrive } from 'lucide-react';
import toast from 'react-hot-toast';
import * as filesAPI from '../api/files';
import { formatBytes } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';

const TYPE_COLORS = {
  image:       '#8b5cf6',
  video:       '#ec4899',
  audio:       '#f59e0b',
  document:    '#3b82f6',
  pdf:         '#ef4444',
  other:       '#6b7280',
};

function mimeCategory(mime = '') {
  if (mime.startsWith('image'))   return 'image';
  if (mime.startsWith('video'))   return 'video';
  if (mime.startsWith('audio'))   return 'audio';
  if (mime.includes('pdf'))       return 'pdf';
  if (mime.includes('word') || mime.includes('sheet') || mime.includes('presentation')) return 'document';
  return 'other';
}

function buildTypeData(files) {
  const counts = {};
  files.forEach((f) => {
    const cat = mimeCategory(f.mimeType);
    const size = f.fileSize || 0;
    counts[cat] = (counts[cat] || 0) + size;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

function buildUploadTimeline(files) {
  const map = {};
  files.forEach((f) => {
    const d = new Date(f.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([month, uploads]) => ({ month, uploads }));
}

function buildDownloadData(files) {
  return [...files]
    .sort((a, b) => (b.downloadCount ?? 0) - (a.downloadCount ?? 0))
    .slice(0, 8)
    .map((f) => ({
      name:      (f.originalName || f.fileName).slice(0, 16),
      downloads: f.downloadCount ?? 0,
    }));
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-sm shadow-lg">
      <p className="font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color ?? p.fill }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [files,   setFiles]   = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const axisColor = theme === 'dark' ? '#94a3b8' : '#64748b';

  useEffect(() => {
    filesAPI.getFiles()
      .then(({ data }) => setFiles(data.files))
      .catch((err) => toast.error(err.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="skeleton h-10 w-48 rounded-xl" />
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const typeData     = buildTypeData(files);
  const timeline     = buildUploadTimeline(files);
  const downloadData = buildDownloadData(files);
  const totalStorage = files.reduce((s, f) => s + f.fileSize, 0);
  const totalDl      = files.reduce((s, f) => s + (f.downloadCount ?? 0), 0);

  const summaryCards = [
    { label: 'Total Files',     value: files.length,              icon: PieIcon,    grad: 'from-violet-500 to-indigo-500' },
    { label: 'Total Downloads', value: totalDl,                   icon: TrendingUp, grad: 'from-emerald-500 to-teal-500' },
    { label: 'Storage Used',    value: formatBytes(totalStorage), icon: HardDrive,  grad: 'from-amber-500 to-orange-500' },
    { label: 'File Types',      value: typeData.length,           icon: BarChart2,  grad: 'from-pink-500 to-rose-500' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Analytics</h2>
        <p className="mt-1 text-sm text-muted-foreground">Insights about your cloud storage activity</p>
      </div>

      {/* Summary cards */}
      <motion.div className="grid grid-cols-2 gap-4 xl:grid-cols-4" initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
        {summaryCards.map(({ label, value, icon: Icon, grad }) => (
          <motion.div key={label} className="glass rounded-2xl p-4" variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} whileHover={{ y: -5, scale: 1.02 }}>
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${grad}`}>
              <Icon size={16} className="text-white" />
            </div>
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pie — storage by file type */}
        <motion.div className="glass rounded-2xl p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} whileHover={{ scale: 1.01 }}>
          <h3 className="mb-4 font-semibold flex items-center gap-2"><PieIcon size={16} className="text-violet-500" /> Storage by File Type</h3>
          {typeData.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No files yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                  {typeData.map((entry) => (
                    <Cell key={entry.name} fill={TYPE_COLORS[entry.name] ?? '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Bar — top downloads */}
        <motion.div className="glass rounded-2xl p-5 border border-white/20 dark:border-white/10 shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} whileHover={{ scale: 1.01 }}>
          <h3 className="mb-4 font-semibold flex items-center gap-2"><BarChart2 size={16} className="text-emerald-500" /> Top Downloads</h3>
          {downloadData.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No downloads yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={downloadData} margin={{ left: -20 }}>
                <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 11 }} />
                <YAxis tick={{ fill: axisColor, fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="downloads" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Line — upload timeline */}
        <motion.div className="glass rounded-2xl p-5 md:col-span-2 border border-white/20 dark:border-white/10 shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} whileHover={{ scale: 1.01 }}>
          <h3 className="mb-4 font-semibold flex items-center gap-2"><TrendingUp size={16} className="text-blue-500" /> Upload Activity</h3>
          {timeline.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No upload history yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={timeline} margin={{ left: -20 }}>
                <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 11 }} />
                <YAxis tick={{ fill: axisColor, fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="uploads"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#6366f1' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>
    </div>
  );
}
