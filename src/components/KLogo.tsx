// Inline K SVG using the brand yellow color
export default function KLogo({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 3000 3000"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      {/* Vertical bar */}
      <rect x="949" y="661" width="365" height="1479" fill="#dee054" />
      {/* Top-right arm */}
      <path
        d="M1797 800 L2051 1063 C1916 1193 1830 1377 1830 1583 C1830 1780 1909 1957 2033 2086 L1771 2339 C1580 2142 1465 1875 1465 1583 C1465 1278 1591 999 1797 800 Z"
        fill="#efefef"
      />
    </svg>
  )
}
