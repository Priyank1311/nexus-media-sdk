export function Logo() {
  return (
    <div className="brand-logo-wrapper">
      <svg
        className="brand-icon"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logo-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
          <linearGradient id="logo-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
        {/* Outer Pulsing Lens Rings */}
        <rect x="5" y="5" width="90" height="90" rx="24" fill="#1e293b" stroke="url(#logo-grad-1)" strokeWidth="3" />
        <circle cx="50" cy="50" r="32" stroke="url(#logo-grad-2)" strokeWidth="4" strokeDasharray="6 4" opacity="0.8" />
        {/* Play Triangle + Shutter Lines */}
        <path d="M42 34L66 50L42 66V34Z" fill="url(#logo-grad-1)" />
        <circle cx="66" cy="50" r="4" fill="#38bdf8" />
      </svg>
      <div className="brand-text">
        <span className="brand-title">NexusMedia</span>
        <span className="brand-badge">SDK Engine</span>
      </div>
    </div>
  );
}
