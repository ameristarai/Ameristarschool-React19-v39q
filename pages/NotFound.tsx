/**
 * NotFound.tsx  (404 page)
 * ─────────────────────────────────────────────────────────────────────────────
 * Displayed when the app's routing falls through to the default case.
 *
 * Layout
 *   - Full-viewport canvas (position: fixed, z-0) renders the red-panda game
 *     behind the site Navigation (z-50) and this page's content card (z-10).
 *   - A semi-opaque, frosted-glass card is centred in the remaining viewport
 *     space below the nav bar (padding-top: 64 px matches Navigation height).
 *   - The Navigation and Footer from App.tsx are rendered as normal above/below
 *     this component — no duplicate nav is added here.
 *
 * Mobile
 *   - Touch events in PandaGame.tsx drive panda interaction on mobile/tablet.
 *   - Hint text switches between "Move your mouse" (pointer device) and
 *     "Tap and drag" (touch device) via a CSS media-query class pattern.
 *   - All interactive buttons meet the 44 × 44 px minimum touch-target spec.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Home, BookOpen, ArrowRight } from 'lucide-react';
import { Page } from '../types';
import { PandaGame } from '../components/PandaGame';
import SEO from '../components/SEO';

interface NotFoundProps {
  onNavigate: (page: Page) => void;
}

const NotFound = ({ onNavigate }: NotFoundProps) => {
  return (
    <>
      <SEO
        title="Page Not Found"
        description="The page you're looking for doesn't exist. Head back to Ameristar School."
      />

      {/* ── Full-viewport game canvas — sits behind nav (z-50) ── */}
      {/*
        position: fixed ensures the canvas covers the entire viewport regardless
        of the flex layout used by App.tsx. z-index 0 places it below all page
        content but above the body background. The Navigation uses z-50, so it
        remains fully interactive and visible above the game.
      */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      >
        {/* Subtle brand-tinted background so pandas are visible on white */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-champagne/10" />
        {/* The game canvas — pointer-events re-enabled so touch/mouse works */}
        <div className="absolute inset-0 pointer-events-auto">
          <PandaGame />
        </div>
      </div>

      {/* ── Page content — centred below the 64 px nav bar ──────── */}
      <div className="relative z-10 min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-16 pointer-events-none">

        {/* Card */}
        <div
          className="
            pointer-events-auto
            w-full max-w-lg
            bg-white/90 backdrop-blur-md
            border border-champagne/30
            rounded-2xl shadow-2xl
            px-8 py-10 md:px-12 md:py-14
            text-center
            space-y-6
            animate-fade-in-up
          "
        >
          {/* Gold rule + label */}
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-10 bg-champagne" />
            <span className="text-champagne text-xs uppercase tracking-widest font-semibold">
              Page Not Found
            </span>
            <div className="h-px w-10 bg-champagne" />
          </div>

          {/* 404 number */}
          <p
            className="font-serif text-7xl md:text-9xl font-bold text-brand-gold leading-none"
            aria-label="Error 404"
          >
            404
          </p>

          {/* Headline */}
          <h1 className="font-serif text-2xl md:text-3xl text-oxford leading-snug">
            This door doesn't{' '}
            <span className="italic text-champagne">open here.</span>
          </h1>

          {/* Body copy */}
          <p className="font-sans text-gray-500 font-light text-base md:text-lg leading-relaxed">
            The page you're looking for may have moved, been renamed, or no
            longer exists. But look — you found some friends.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {/* Primary — matches nav Enroll Now button style */}
            <button
              onClick={() => onNavigate(Page.Home)}
              className="group inline-flex items-center gap-3 bg-brand-gold text-brand-navy px-7 py-3 rounded-full text-sm font-bold uppercase tracking-widest shadow-xl hover:bg-oxford hover:text-white transition-all duration-300 hover:scale-105 active:scale-95 min-w-[160px] justify-center"
            >
              <Home size={15} />
              Go Home
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Secondary */}
            <button
              onClick={() => onNavigate(Page.Courses)}
              className="group inline-flex items-center gap-3 border border-gray-300 text-oxford px-7 py-3 rounded-full text-sm font-medium uppercase tracking-widest hover:border-champagne hover:text-champagne transition-all duration-300 min-w-[160px] justify-center"
            >
              <BookOpen size={15} />
              Browse Courses
            </button>
          </div>

          {/* Contact micro-link */}
          <p className="text-gray-400 text-xs pt-1">
            Followed a broken link?{' '}
            <button
              onClick={() => onNavigate(Page.Contact)}
              className="text-champagne hover:underline underline-offset-2 transition-colors"
            >
              let us know
            </button>
            {' '}so we can fix it.
          </p>
        </div>

        {/* Interaction hint — below the card */}
        <div className="pointer-events-none mt-8 text-center">
          <p className="hidden md:block text-gray-400/80 text-xs uppercase tracking-widest drop-shadow-xs">
            Move your mouse to play with them
          </p>
          <p className="block md:hidden text-gray-400/80 text-xs uppercase tracking-widest drop-shadow-xs">
            Tap &amp; drag to play with them
          </p>
        </div>

      </div>
    </>
  );
};

export default NotFound;
