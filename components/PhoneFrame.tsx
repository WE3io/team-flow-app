import type { ReactNode } from 'react';

/**
 * Presentation shell. On phones the app fills the viewport (it's a real
 * mobile web app); on larger screens it's centred in a lightweight iOS-style
 * bezel so it reads like the exported design. Pure CSS via globals classes.
 */
export default function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="phone-frame">
      <div className="phone-island" aria-hidden />
      <div className="phone-statusbar" aria-hidden>
        <span className="phone-time">9:41</span>
        <span className="phone-status-icons">
          <svg width="18" height="11" viewBox="0 0 18 11" fill="none">
            <rect x="0" y="7" width="3" height="4" rx="0.6" fill="#16150F" />
            <rect x="4.5" y="4.8" width="3" height="6.2" rx="0.6" fill="#16150F" />
            <rect x="9" y="2.6" width="3" height="8.4" rx="0.6" fill="#16150F" />
            <rect x="13.5" y="0.4" width="3" height="10.6" rx="0.6" fill="#16150F" />
          </svg>
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
            <rect x="0.6" y="0.6" width="20" height="10.8" rx="3" stroke="#16150F" strokeOpacity="0.4" fill="none" />
            <rect x="2" y="2" width="16" height="8" rx="1.6" fill="#16150F" />
            <path d="M22 4v4c.7-.3 1.2-1 1.2-2S22.7 4.3 22 4Z" fill="#16150F" fillOpacity="0.4" />
          </svg>
        </span>
      </div>
      <div className="phone-screen">{children}</div>
      <div className="phone-home" aria-hidden />
    </div>
  );
}
