import { Link } from 'react-router-dom';
import { CloudLightning, UploadCloud, Share2, Lock, ArrowRight, Star, CheckCircle2 } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl animate-blob" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Header / Navigation */}
      <header className="relative z-10 border-b border-gray-700/30 backdrop-blur-xl bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
              <CloudLightning size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold">CloudShare</span>
          </div>
          
          <nav className="hidden md:flex gap-8 items-center">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How it Works</a>
            <Link to="/help" className="text-gray-300 hover:text-white transition-colors">Help</Link>
          </nav>

          <div className="flex gap-3 items-center">
            <Link to="/login" className="text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-colors">
              Sign In
            </Link>
            <Link to="/signup" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-6 py-2 rounded-lg font-semibold transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Text */}
          <div className="space-y-8">
            <div>
              <div className="inline-block mb-4 px-4 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full">
                <span className="text-sm font-semibold text-blue-300">✨ Secure Cloud Storage</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4">
                Secure Cloud File Sharing for Teams
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Store, organize, and share files securely with your team, clients, and partners. End-to-end encryption and advanced access controls included.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105">
                Get Started Free
                <ArrowRight size={20} />
              </Link>
              <a href="#features" className="inline-flex items-center justify-center gap-2 border border-gray-600 hover:border-gray-400 px-8 py-4 rounded-lg font-semibold transition-colors">
                View Features
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <CheckCircle2 size={18} className="text-green-400" />
                End-to-end encrypted
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <CheckCircle2 size={18} className="text-green-400" />
                No credit card required
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <CheckCircle2 size={18} className="text-green-400" />
                GDPR compliant
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <CheckCircle2 size={18} className="text-green-400" />
                5GB free storage
              </div>
            </div>
          </div>

          {/* Hero Image Placeholder */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-3xl" />
            <div className="relative bg-gray-800/50 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-xl">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                  <UploadCloud size={24} className="text-blue-400" />
                  <div className="flex-1">
                    <div className="h-2 w-20 bg-gray-600 rounded" />
                    <div className="h-2 w-16 bg-gray-700 rounded mt-1" />
                  </div>
                  <span className="text-sm text-gray-400">99%</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                  <Share2 size={24} className="text-cyan-400" />
                  <div className="flex-1">
                    <div className="h-2 w-24 bg-gray-600 rounded" />
                    <div className="h-2 w-20 bg-gray-700 rounded mt-1" />
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                  <Lock size={24} className="text-green-400" />
                  <div className="flex-1">
                    <div className="h-2 w-28 bg-gray-600 rounded" />
                    <div className="h-2 w-24 bg-gray-700 rounded mt-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Everything you need to manage and share files securely
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: UploadCloud,
              title: 'Secure File Storage',
              description: 'Upload and store files with military-grade encryption'
            },
            {
              icon: Share2,
              title: 'Easy Sharing',
              description: 'Share files via secure links with password protection'
            },
            {
              icon: Lock,
              title: 'Advanced Security',
              description: 'End-to-end encryption and access control management'
            },
            {
              icon: CloudLightning,
              title: 'Fast & Reliable',
              description: '99.9% uptime with automatic backups and redundancy'
            },
          ].map((feature, i) => (
            <div key={i} className="group bg-gray-800/50 border border-gray-700/50 hover:border-blue-500/50 rounded-xl p-6 transition-all hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-shadow">
                <feature.icon size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-gray-300">Three simple steps to get started</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: 1,
              title: 'Create Account',
              description: 'Sign up in seconds with just your email. No credit card required.'
            },
            {
              step: 2,
              title: 'Upload Files',
              description: 'Drag and drop files or upload from your computer. Supports all file types.'
            },
            {
              step: 3,
              title: 'Share Securely',
              description: 'Generate secure links and share with anyone. Control access and expiration.'
            },
          ].map((item, i) => (
            <div key={i} className="relative">
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </div>
              {i < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/50 rounded-2xl p-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to secure your files?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of users trusting CloudShare with their important files
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105">
              Start Free Today
              <ArrowRight size={20} />
            </Link>
            <Link to="/help" className="inline-flex items-center justify-center gap-2 border border-gray-600 hover:border-gray-400 px-8 py-4 rounded-lg font-semibold transition-colors">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-700/30 backdrop-blur-xl bg-slate-900/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CloudLightning size={24} className="text-blue-400" />
                <span className="font-bold">CloudShare</span>
              </div>
              <p className="text-gray-400 text-sm">Secure file sharing for everyone</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/help" className="hover:text-white">Help</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white">GitHub</a>
                <a href="#" className="text-gray-400 hover:text-white">LinkedIn</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700/30 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 CloudShare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
