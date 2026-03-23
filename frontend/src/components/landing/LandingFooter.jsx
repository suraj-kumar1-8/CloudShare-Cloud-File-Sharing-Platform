import { Link } from 'react-router-dom';
import { CloudLightning, Mail, HelpCircle } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CloudLightning size={22} className="text-sky-300" />
              <span className="font-semibold text-white">CloudShare</span>
            </div>
            <p className="text-sm text-white/70 max-w-sm">
              CloudShare is a modern SaaS-style platform to securely store, share, and manage your files with a clean dashboard experience.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-white/60" />
                <a href="mailto:support@cloudshare.com" className="hover:text-white transition-colors">
                  support@cloudshare.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <HelpCircle size={16} className="text-white/60" />
                <Link to="/help" className="hover:text-white transition-colors">
                  Help / FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/signup" className="hover:text-white transition-colors">Register</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-white/60">
          © {new Date().getFullYear()} CloudShare. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
