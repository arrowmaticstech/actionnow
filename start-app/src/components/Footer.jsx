import React from 'react';
import logo from '@assets/logo.png';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div
              onClick={() => (window.location.href = '/')}
              className="flex items-center gap-2.5 mb-4 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0">
                <img className="logo-image w-full h-full object-cover" src={logo} alt="ActionNow logo" />
              </div>
              <span className="font-bold text-xl text-white">
                Action<span className="text-wa-green">Now</span>
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Smart WhatsApp manager agent that keeps you informed without the noise.
            </p>
          </div>
          <div>
            <p className="font-semibold text-white mb-4">Product</p>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-wa-green transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-wa-green transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-wa-green transition-colors">API</a></li>
              <li><a href="#" className="hover:text-wa-green transition-colors">Changelog</a></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-4">Company</p>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-wa-green transition-colors">About</a></li>
              <li><a href="#" className="hover:text-wa-green transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-wa-green transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-wa-green transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-4">Legal</p>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-wa-green transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-wa-green transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-wa-green transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© 2026 ActionNow. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-wa-green/20 hover:text-wa-green transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </a>
            <a
              href="#"
              className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-wa-green/20 hover:text-wa-green transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
            <a
              href="#"
              className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-wa-green/20 hover:text-wa-green transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
