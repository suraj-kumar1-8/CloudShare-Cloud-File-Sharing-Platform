import { Link } from 'react-router-dom';
import { CloudLightning } from 'lucide-react';

export default function Privacy() {
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-gray-300 mb-8">
          This is a lightweight placeholder policy so the landing page links work in development.
          Replace this with your production privacy policy.
        </p>

        <div className="space-y-6 text-gray-300 leading-relaxed">
          <section className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
            <h2 className="text-xl font-semibold mb-3 text-white">What we collect</h2>
            <p>
              CloudShare may collect account details (name, email) and metadata needed to operate the service.
              Uploaded file contents are stored to provide file sharing features.
            </p>
          </section>

          <section className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
            <h2 className="text-xl font-semibold mb-3 text-white">How we use data</h2>
            <p>
              Data is used to authenticate users, store files, generate share links, and improve the product.
            </p>
          </section>

          <section className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
            <h2 className="text-xl font-semibold mb-3 text-white">Questions</h2>
            <p>
              Contact support via the <Link to="/contact" className="text-blue-300 hover:text-blue-200">Contact</Link> page.
            </p>
          </section>
        </div>

        <div className="mt-10">
          <Link to="/" className="text-gray-300 hover:text-white">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
