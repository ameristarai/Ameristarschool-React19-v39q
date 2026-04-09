/**
 * routes.config.ts — SINGLE SOURCE OF TRUTH
 * ─────────────────────────────────────────────────────────────────
 * This file drives TWO things simultaneously:
 *   1. The XML sitemap generated at build time (via vite.config.ts)
 *   2. The HTML /sitemap page rendered in React (pages/Sitemap.tsx)
 *
 * HOW TO ADD A NEW PAGE:
 *   Simply add a new object to the appropriate section array below.
 *   On the next Netlify build, both sitemaps update automatically.
 *
 * HOW TO ADD A NEW COURSE (when ready):
 *   Add a new object to the `courses` section array, e.g.:
 *   { queryParam: 'courses', label: 'Surety Bonds', priority: 0.7 }
 *   — or, if courses get their own detail pages later:
 *   { queryParam: 'courses/surety-bonds', label: 'Surety Bonds', priority: 0.7 }
 * ─────────────────────────────────────────────────────────────────
 */

export interface RouteEntry {
  /** Query param used in the app's ?page= routing, or '/' for home */
  queryParam: string;
  /** Human-readable label shown on the HTML Sitemap page */
  label: string;
  /** Brief description shown on the HTML Sitemap page */
  description: string;
  /** XML sitemap priority: 1.0 = highest, 0.1 = lowest */
  priority: number;
  /** How often search engines should re-crawl this page */
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}

export interface SitemapSection {
  /** Section heading displayed on the HTML Sitemap page */
  heading: string;
  /** Icon name (used in the Sitemap page component) */
  icon: 'layout' | 'book-open' | 'shield';
  routes: RouteEntry[];
}

// ─────────────────────────────────────────────────────────────────
// ROUTE DEFINITIONS — Edit here to update both sitemaps at once
// ─────────────────────────────────────────────────────────────────

export const sitemapSections: SitemapSection[] = [
  {
    heading: 'Main Pages',
    icon: 'layout',
    routes: [
      {
        queryParam: '/',
        label: 'Home',
        description: 'Welcome to Ameristar School — CA licensing for Real Estate & Insurance.',
        priority: 1.0,
        changefreq: 'weekly',
      },
      {
        queryParam: 'about',
        label: 'Founder',
        description: 'Meet the founder and learn about our mission and values.',
        priority: 0.8,
        changefreq: 'monthly',
      },
      {
        queryParam: 'contact',
        label: 'Contact',
        description: 'Reach out to our team for enrollment questions or support.',
        priority: 0.7,
        changefreq: 'monthly',
      },
      {
        queryParam: 'sitemap',
        label: 'Sitemap',
        description: 'A complete directory of all pages on this website.',
        priority: 0.3,
        changefreq: 'weekly',
      },
      {
        queryParam: 'enrollment',
        label: 'Enrollment',
        description: 'Enroll in CA Real Estate or Insurance licensing courses.',
        priority: 0.9,
        changefreq: 'monthly',
      },
      {
        queryParam: 'roadmap',
        label: 'Roadmap',
        description: 'Interactive guide to CA Real Estate and Insurance licensing requirements.',
        priority: 0.8,
        changefreq: 'monthly',
      },
      {
        queryParam: 'forms',
        label: 'Forms',
        description: 'Download CA DRE and DOI exam forms and answer sheets.',
        priority: 0.8,
        changefreq: 'monthly',
      },
    ],
  },
  {
    heading: 'Courses',
    icon: 'book-open',
    routes: [
      {
        queryParam: 'courses',
        label: 'All Courses',
        description: 'Browse all available pre-licensing and continuing education courses.',
        priority: 0.9,
        changefreq: 'weekly',
      },
      // ── INSURANCE COURSES ──────────────────────────────────────
      // To add a new course, copy the block below and update the values.
      {
        queryParam: 'courses',
        label: 'Life & Health Insurance',
        description: 'California DOI-compliant 52-hour pre-licensing course for Life & Health.',
        priority: 0.7,
        changefreq: 'monthly',
      },
      {
        queryParam: 'courses',
        label: 'Property & Casualty Insurance',
        description: 'Comprehensive P&C licensure prep with exam guarantee.',
        priority: 0.7,
        changefreq: 'monthly',
      },
      {
        queryParam: 'courses',
        label: 'CE Renewal',
        description: '24-credit continuing education with instant DOI reporting.',
        priority: 0.7,
        changefreq: 'monthly',
      },
      // ── REAL ESTATE COURSES ────────────────────────────────────
      {
        queryParam: 'courses',
        label: 'Sales Agent Package',
        description: 'DRE-approved bundle: 2 required courses (RE Principles & Practice), 1 elective, and practice exams. $399.',
        priority: 0.8,
        changefreq: 'monthly',
      },
      {
        queryParam: 'courses',
        label: 'Broker Package',
        description: 'Complete 8-course requirement for CA Broker license. Includes all statutory courses. $649.',
        priority: 0.7,
        changefreq: 'monthly',
      },
    ],
  },
  {
    heading: 'Legal',
    icon: 'shield',
    routes: [
      {
        queryParam: 'privacy',
        label: 'Privacy Policy',
        description: 'How we collect, use, and protect your personal information.',
        priority: 0.2,
        changefreq: 'yearly',
      },
      {
        queryParam: 'terms',
        label: 'Terms of Service',
        description: 'Terms and conditions governing use of Ameristar School.',
        priority: 0.2,
        changefreq: 'yearly',
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// DERIVED EXPORTS — Used by vite.config.ts for XML sitemap generation
// Do not edit these directly; they are computed from sitemapSections.
// ─────────────────────────────────────────────────────────────────

/**
 * Flat array of unique URL query strings for the XML sitemap plugin.
 * Deduplicates entries that share the same queryParam (e.g., course detail pages
 * that all resolve to ?page=courses until individual course pages are built).
 */
export const xmlSitemapRoutes: Array<{
  url: string;
  priority: number;
  changefreq: string;
}> = (() => {
  const seen = new Set<string>();
  const result: Array<{ url: string; priority: number; changefreq: string }> = [];

  for (const section of sitemapSections) {
    for (const route of section.routes) {
      const url = route.queryParam === '/' ? '/' : `/?page=${route.queryParam}`;
      if (!seen.has(url)) {
        seen.add(url);
        result.push({ url, priority: route.priority, changefreq: route.changefreq });
      }
    }
  }

  return result;
})();
