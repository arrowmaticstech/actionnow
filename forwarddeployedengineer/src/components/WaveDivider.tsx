export default function WaveDivider({ flip = false, fill = '#EEF2FF' }: { flip?: boolean; fill?: string }) {
  return (
    <svg className={flip ? 'wave-divider flip' : 'wave-divider'} viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={flip ? 'wave-g-b' : 'wave-g-a'} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1A4DFF" stopOpacity=".35" />
          <stop offset="35%" stopColor="#8B5CF6" stopOpacity=".3" />
          <stop offset="70%" stopColor="#FF5C00" stopOpacity=".28" />
          <stop offset="100%" stopColor="#00E5A0" stopOpacity=".22" />
        </linearGradient>
      </defs>
      <path d="M0,55 C240,90 420,10 720,35 C1020,60 1200,90 1440,45 L1440,90 L0,90 Z" fill={fill} />
      <path d="M0,55 C240,90 420,10 720,35 C1020,60 1200,90 1440,45" fill="none" stroke={flip ? 'url(#wave-g-b)' : 'url(#wave-g-a)'} strokeWidth="3" />
    </svg>
  );
}
