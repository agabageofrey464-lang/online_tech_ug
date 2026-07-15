// Inline Uganda flag (renders reliably everywhere, unlike flag emoji on Windows).
export function UgandaFlag({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 40" className={className} role="img" aria-label="Uganda">
      <rect width="60" height="40" fill="#000" />
      <rect y="6.667" width="60" height="6.667" fill="#FCDC04" />
      <rect y="13.333" width="60" height="6.667" fill="#D90000" />
      <rect y="20" width="60" height="6.667" fill="#000" />
      <rect y="26.667" width="60" height="6.667" fill="#FCDC04" />
      <rect y="33.333" width="60" height="6.667" fill="#D90000" />
      <circle cx="30" cy="20" r="6.5" fill="#fff" />
      {/* simplified crested-crane hint */}
      <circle cx="30" cy="20" r="3" fill="none" stroke="#D90000" strokeWidth="1.4" />
      <line x1="30" y1="16.8" x2="30" y2="14.6" stroke="#000" strokeWidth="1.2" />
    </svg>
  );
}
