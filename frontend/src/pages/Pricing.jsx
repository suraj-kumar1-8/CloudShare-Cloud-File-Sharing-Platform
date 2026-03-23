import { Link } from 'react-router-dom';
import { CloudLightning, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <CloudLightning size={28} className="text-blue-400" />
            <span className="text-xl font-bold">CloudShare</span>
          </Link>
          <nav className="flex gap-6">
            <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
            <Link to="/help" className="text-gray-300 hover:text-white">Help</Link>
            <Link to="/login" className="text-blue-400 hover:text-blue-300">Sign In</Link>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Pricing</h1>
          <p className="text-xl text-gray-300">
            Simple plans for secure file sharing.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Free */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-1">Free</h2>
            <p className="text-gray-300 mb-6">For getting started</p>
            <div className="text-4xl font-bold mb-6">$0<span className="text-base text-gray-400 font-medium">/mo</span></div>
            <ul className="space-y-3 text-gray-300 mb-8">
              <li className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-400" /> 5GB storage</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-400" /> Secure share links</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-400" /> Folder organization</li>
            </ul>
            <Link to="/signup" className="inline-flex w-full items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-6 py-3 rounded-lg font-semibold transition-all">
              Get Started
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-blue-500/40 rounded-2xl p-8">
            <div className="inline-block mb-3 px-3 py-1 bg-blue-500/20 border border-blue-500/40 rounded-full text-xs font-semibold text-blue-200">
              Popular
            </div>
            <h2 className="text-2xl font-bold mb-1">Pro</h2>
            <p className="text-gray-300 mb-6">For teams</p>
            <div className="text-4xl font-bold mb-6">Coming soon</div>
            <ul className="space-y-3 text-gray-300 mb-8">
              <li className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-400" /> Larger storage</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-400" /> Advanced sharing controls</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-400" /> Priority support</li>
            </ul>
            <Link to="/contact" className="inline-flex w-full items-center justify-center gap-2 border border-gray-600 hover:border-gray-400 px-6 py-3 rounded-lg font-semibold transition-colors">
              Contact Sales
            </Link>
          </div>

          {/* Enterprise */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-1">Enterprise</h2>
            <p className="text-gray-300 mb-6">For organizations</p>
            <div className="text-4xl font-bold mb-6">Let’s talk</div>
            <ul className="space-y-3 text-gray-300 mb-8">
              <li className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-400" /> Custom storage & policies</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-400" /> Dedicated support</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-400" /> Deployment options</li>
            </ul>
            <Link to="/contact" className="inline-flex w-full items-center justify-center gap-2 border border-gray-600 hover:border-gray-400 px-6 py-3 rounded-lg font-semibold transition-colors">
              Talk to us
            </Link>
          </div>
        </div>

        <div className="mt-10 text-center text-sm text-gray-400">
          <p>Need help choosing? Visit the <Link to="/help" className="text-blue-300 hover:text-blue-200">Help Center</Link> or <Link to="/contact" className="text-blue-300 hover:text-blue-200">contact us</Link>.</p>
        </div>
      </div>
    </div>
  );
}
