import { useState, useEffect } from 'react';
import { Page } from '../types';

// ── SERVER STATUS INDICATOR ────────────────────────────────────────────────────
// Pings the Netlify health function on page load and displays a live status dot.
// Green = operational (200 OK from /.netlify/functions/health)
// Red   = issue (non-200 or network failure)
// Grey  = checking (initial load state)
//
// animate-ping is a Tailwind core utility — no tailwind.config.js changes needed.
// ──────────────────────────────────────────────────────────────────────────────
const ServerStatus = () => {
  const [status, setStatus] = useState<'loading' | 'online' | 'offline'>('loading');

  useEffect(() => {
    fetch('/.netlify/functions/health')
      .then((res) => (res.ok ? setStatus('online') : setStatus('offline')))
      .catch(() => setStatus('offline'));
  }, []);

  const dotColor =
    status === 'online'  ? 'bg-green-500' :
    status === 'offline' ? 'bg-red-500'   :
                           'bg-slate-500';

  const label =
    status === 'online'  ? 'Operational' :
    status === 'offline' ? 'Issues'      :
                           'Checking';

  return (
    <div className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] font-sans text-white/40">
      <span className="relative flex h-1.5 w-1.5">
        {/* Ping ring only renders when online */}
        {status === 'online' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColor}`} />
      </span>
      <span>System {label}</span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

interface FooterProps {
  onNavigate: (page: Page) => void;
}

const Footer = ({ onNavigate }: FooterProps) => {
  return (
    <footer className="bg-oxford border-t border-gray-800 py-20 text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Top row: brand + nav links */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-12 md:space-y-0">
          <div className="text-center md:text-left space-y-4">
            <h4 className="font-display text-3xl tracking-luxury uppercase text-white">
              AMERISTAR <span className="font-light italic capitalize text-brand-gold">School</span>
            </h4>
            <p className="text-gray-400 text-sm font-light">
              © {new Date().getFullYear()} Ameristar School. All rights reserved.
            </p>
          </div>

          <div className="flex space-x-12">
            <button
              onClick={() => onNavigate(Page.Privacy)}
              className="text-gray-400 hover:text-champagne text-sm tracking-widest uppercase transition-colors duration-300"
            >
              Privacy
            </button>
            <button
              onClick={() => onNavigate(Page.Terms)}
              className="text-gray-400 hover:text-champagne text-sm tracking-widest uppercase transition-colors duration-300"
            >
              Terms
            </button>
            <button
              onClick={() => onNavigate(Page.Sitemap)}
              className="text-gray-400 hover:text-champagne text-sm tracking-widest uppercase transition-colors duration-300"
            >
              Sitemap
            </button>
          </div>
        </div>

        {/* Bottom row: regulatory notices + server status */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-[10px] uppercase tracking-[0.15em] text-white/35 font-sans text-center sm:text-left">
            <span>BPPE Approved · Bureau for Private Postsecondary Education</span>
            <span className="hidden sm:inline text-white/20">·</span>
            <span>CA DRE &amp; CA DOI Approved Course Provider</span>
          </div>
          <ServerStatus />
        </div>

      </div>
    </footer>
  );
};

export default Footer;