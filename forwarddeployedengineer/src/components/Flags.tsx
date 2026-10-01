export function FlagMY({ w = 26 }: { w?: number }) {
  const h = (w * 28) / 44;
  const stripes = Array.from({ length: 14 });
  return (
    <svg width={w} height={h} viewBox="0 0 44 28" aria-label="Malaysia" role="img" style={{ borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,.25)', verticalAlign: '-3px' }}>
      {stripes.map((_, i) => (
        <rect key={i} x="0" y={i * 2} width="44" height="2" fill={i % 2 === 0 ? '#CC0001' : '#FFFFFF'} />
      ))}
      <rect x="0" y="0" width="24" height="16" fill="#010066" />
      <circle cx="10" cy="8" r="5.5" fill="#FFCC00" />
      <circle cx="11.8" cy="8" r="4.6" fill="#010066" />
      <polygon points="17.5,4.5 18.2,6.6 20.4,6.6 18.6,7.9 19.3,10 17.5,8.7 15.7,10 16.4,7.9 14.6,6.6 16.8,6.6" fill="#FFCC00" />
    </svg>
  );
}

export function FlagSG({ w = 26 }: { w?: number }) {
  const h = (w * 28) / 44;
  return (
    <svg width={w} height={h} viewBox="0 0 44 28" aria-label="Singapore" role="img" style={{ borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,.25)', verticalAlign: '-3px' }}>
      <rect x="0" y="0" width="44" height="14" fill="#EF3340" />
      <rect x="0" y="14" width="44" height="14" fill="#FFFFFF" />
      <circle cx="9" cy="7" r="4.4" fill="#FFFFFF" />
      <circle cx="10.6" cy="7" r="3.7" fill="#EF3340" />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={15 + (i % 2) * 2.4} cy={4 + Math.floor(i / 2) * 2.2 - (i % 2)} r="1" fill="#FFFFFF" />
      ))}
    </svg>
  );
}
