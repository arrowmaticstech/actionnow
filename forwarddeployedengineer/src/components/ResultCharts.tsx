'use client';
import Reveal from './Reveal';

export function StatCards({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <div className="grid-3">
      {stats.map((s, i) => (
        <Reveal key={s.label} delay={Math.min(i * 0.06, 0.3)}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-.03em', background: 'linear-gradient(92deg,#1A4DFF,#8B5CF6,#FF5C00)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
              {s.value}
            </div>
            <div className="meta" style={{ marginTop: 8 }}>{s.label}</div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export function HBarChart({
  data,
  unit = '',
  max,
}: {
  data: { label: string; value: number }[];
  unit?: string;
  max?: number;
}) {
  const top = max ?? Math.max(...data.map((d) => d.value));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {data.map((d, i) => (
        <Reveal key={d.label} delay={Math.min(i * 0.05, 0.25)}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
              <span>{d.label}</span>
              <span className="mono">{d.value}{unit}</span>
            </div>
            <svg viewBox="0 0 400 14" style={{ width: '100%', height: 14, display: 'block' }} aria-hidden="true">
              <defs>
                <linearGradient id={`hb-${i}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#1A4DFF" />
                  <stop offset="55%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#FF5C00" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="400" height="14" fill="#EEF1F6" />
              <rect x="0" y="0" width={Math.max(8, (d.value / top) * 400)} height="14" fill={`url(#hb-${i})`} />
            </svg>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
