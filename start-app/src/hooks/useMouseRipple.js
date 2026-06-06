import { useEffect } from 'react';
import { RIPPLE_DURATION_MS, RIPPLE_INTERVAL_MS } from '../lib/main';

/**
 * Port of assets/js/main.js — mouse trailing ripple effect.
 */
export default function useMouseRipple() {
  useEffect(() => {
    let lastRippleTime = 0;

    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastRippleTime < RIPPLE_INTERVAL_MS) return;
      lastRippleTime = now;

      const ripple = document.createElement('div');
      ripple.className = 'mouse-ripple';
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;
      document.body.appendChild(ripple);

      setTimeout(() => ripple.remove(), RIPPLE_DURATION_MS);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);
}
