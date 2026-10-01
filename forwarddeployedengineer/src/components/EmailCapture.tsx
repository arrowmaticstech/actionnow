'use client';
import { useState } from 'react';

const WEBHOOK = 'https://srv1745537.hstgr.cloud/webhook-test/fde-request';

export default function EmailCapture({ source = 'hero' }: { source?: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@')) return;
    setStatus('sending');
    try {
      const res = await fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source, type: 'subscribe', page: typeof window !== 'undefined' ? window.location.href : '' }),
      });
      if (!res.ok) throw new Error('bad');
      try { (window as any).localStorage?.setItem(`fde-${source}`, email); } catch {}
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div id="signup" className="email-box">
      {status === 'done' ? (
        <strong>✓ You&apos;re in. Check inbox for FDE Salary Report 2026.</strong>
      ) : (
        <form onSubmit={submit} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
          <input
            type="email"
            required
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn btn-primary" disabled={status === 'sending'}>
            {status === 'sending' ? 'Joining…' : 'Get weekly FDE jobs + salary data'}
          </button>
          <span className="meta">Free Salary Report PDF. No spam.</span>
          {status === 'error' && <span className="meta" style={{ color: '#DC2626' }}>Failed - try again.</span>}
        </form>
      )}
    </div>
  );
}
