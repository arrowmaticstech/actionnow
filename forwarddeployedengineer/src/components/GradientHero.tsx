export default function GradientHero() {
  return (
    <svg className="hero-grid-bg" viewBox="0 0 1440 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="g-blue" cx="20%" cy="20%" r="60%">
          <stop offset="0%" stopColor="#1A4DFF" stopOpacity=".55" />
          <stop offset="100%" stopColor="#1A4DFF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="g-purple" cx="75%" cy="15%" r="55%">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity=".5" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="g-orange" cx="65%" cy="85%" r="60%">
          <stop offset="0%" stopColor="#FF5C00" stopOpacity=".42" />
          <stop offset="100%" stopColor="#FF5C00" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="g-green" cx="90%" cy="60%" r="40%">
          <stop offset="0%" stopColor="#00E5A0" stopOpacity=".22" />
          <stop offset="100%" stopColor="#00E5A0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="grid-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="50%" stopColor="#fff" stopOpacity=".07" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="1440" height="700" fill="url(#g-blue)" />
      <rect width="1440" height="700" fill="url(#g-purple)" />
      <rect width="1440" height="700" fill="url(#g-orange)" />
      <rect width="1440" height="700" fill="url(#g-green)" />
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={`v${i}`} x1={i * 130} y1="0" x2={i * 130} y2="700" stroke="#fff" strokeOpacity=".05" />
      ))}
      {Array.from({ length: 7 }).map((_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 110} x2="1440" y2={i * 110} stroke="#fff" strokeOpacity=".05" />
      ))}
      <ellipse cx="720" cy="640" rx="620" ry="120" fill="none" stroke="url(#grid-line)" strokeWidth="1.5" />
      <ellipse cx="720" cy="640" rx="420" ry="80" fill="none" stroke="#fff" strokeOpacity=".09" />
    </svg>
  );
}
