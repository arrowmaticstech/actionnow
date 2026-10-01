'use client';
import { useState } from 'react';

export default function EmailCapture({ source = 'hero' }: { source?: string }) {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  return (
    <div id="signup" className="email-box">
      {done ? (
        <strong>✓ You&apos;re in. Check inbox for FDE Salary Report 2026.</strong>
      ) : (
        <>
          <input
            type="email"
            required
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={() => {
              if (email.includes('@')) {
                try { (window as any).localStorage?.setItem(`fde-${source}`, email); } catch {}
                setDone(true);
              }
            }}
          >
            Get weekly FDE jobs + salary data
          </button>
          <span className="meta">Free Salary Report PDF. No spam.</span>
        </>
      )}
    </div>
  );
}
