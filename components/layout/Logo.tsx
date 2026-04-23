import * as React from "react";

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 26 L18 10 L30 26 Z" />
        <path d="M10 26 L10 30 L26 30 L26 26" />
        <circle cx="18" cy="19" r="2.2" fill="currentColor" />
      </g>
    </svg>
  );
}
