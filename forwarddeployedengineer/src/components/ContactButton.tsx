'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const WEBHOOK = 'https://srv1745537.hstgr.cloud/webhook/fde-request';

export default function ContactButton({ label = 'Find FDE', source = 'header' }: { label?: string; source?: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [needs, setNeeds] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open ]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, needs, source, page: typeof window !== 'undefined' ? window.location.href : '' }),
      });
      if (!res.ok) throw new Error('bad');
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  const modal = open ? (
    <div className="modal-overlay" onClick={() => setOpen(false)}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="modal-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
        {status === 'done' ? (
          <div>
            <h3 style={{ marginTop: 0 }}>Request received ✓</h3>
            <p>Thanks {name || 'there'} - we&apos;ll reply within 2 days with quotations and matches.</p>
            <button className="btn btn-primary" onClick={() => setOpen(false)}>Done</button>
          </div>
        ) : (
              <form onSubmit={submit}>
                <h3 style={{ marginTop: 0 }}>Find your FDE</h3>
            <label className="field"><span>Your name</span><input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" /></label>
            <label className="field"><span>Your phone</span><input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+60 ..." /></label>
            <label className="field"><span>Your email</span><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" /></label>
            <label className="field"><span>Your requests or needs</span><textarea required value={needs} onChange={(e) => setNeeds(e.target.value)} rows={4} placeholder="Hire 2 FDEs for bank RAG pilot in KL..." /></label>
            {status === 'error' && <p className="meta" style={{ color: '#DC2626' }}>Send failed - try again or email us directly.</p>}
            <button className="btn btn-employer" disabled={status === 'sending'} style={{ width: '100%' }}>
              {status === 'sending' ? 'Sending…' : 'Send request'}
            </button>
            <p className="meta" style={{ textAlign: 'center', marginTop: 12 }}>Get instant quotations and match in 2 days</p>
          </form>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <button className="btn btn-employer" onClick={() => { setOpen(true); setStatus('idle'); }}>
        {label}
      </button>
      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
