import { useEffect, useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import logo from '@assets/logo.png';
import { NAVBAR_SCROLL_THRESHOLD } from '../lib/main';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > NAVBAR_SCROLL_THRESHOLD);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 transition-all duration-300 ${
        scrolled ? 'shadow-sm' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div
            onClick={() => (window.location.href = '/')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-wa-green/30 flex-shrink-0">
              <img className="logo-image w-full h-full object-cover" src={logo} alt="ActionNow logo" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">
              Action<span className="text-wa-green">Now</span>
            </span>
          </div>
          <div id="header-middle-menu" className="hiddenx md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-wa-dark transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-wa-dark transition-colors">
              How It Works
            </a>
            <a href="#demo" className="text-sm font-medium text-gray-600 hover:text-wa-dark transition-colors">
              Live Demo
            </a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-wa-dark transition-colors">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-wa-dark transition-colors">
              Sign In
            </button>
            <button
              onClick={() =>
                window.location.hostname === 'localhost'
                  ? window.open('start/index.html', '_self')
                  : window.open('start/', '_self')
              }
              className="small-start-button inline-flex items-center gap-2 px-5 py-2.5 bg-wa-dark text-white text-sm font-semibold rounded-xl hover:bg-wa-dark/90 transition-all shadow-lg shadow-wa-dark/20 hover:shadow-xl hover:shadow-wa-dark/25 active:scale-95"
            > 
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="mobileMenuBtn"
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
      <div id="mobileMenu" className={`hiddenx md:hidden ${menuOpen ? 'block' : 'hidden'} bg-white border-t border-gray-100`}>
        <div className="px-4 py-3 space-y-2">
          <a href="#features" className="block px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-wa-gray transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="block px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-wa-gray transition-colors">
            How It Works
          </a>
          <a href="#demo" className="block px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-wa-gray transition-colors">
            Live Demo
          </a>
          <a href="#pricing" className="block px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-wa-gray transition-colors">
            Pricing
          </a>
        </div>
      </div>
    </nav>
  );
}
