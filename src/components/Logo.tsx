interface LogoProps { size?: number; className?: string }

export function Logo({ size = 44, className = '' }: LogoProps) {
  return <svg aria-label="Pocket Ledger" role="img" width={size} height={size} viewBox="0 0 64 64" className={className}>
    <rect width="64" height="64" rx="18" fill="#2563eb" />
    <path d="M18 15h24a7 7 0 0 1 7 7v26a7 7 0 0 1-7 7H18a7 7 0 0 1-7-7V22a7 7 0 0 1 7-7Z" fill="#fff" />
    <path d="M20 27h20M20 35h13M20 43h17" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />
    <circle cx="43" cy="43" r="6" fill="#16a34a" stroke="#fff" strokeWidth="2" />
  </svg>
}
