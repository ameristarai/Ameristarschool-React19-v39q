/**
 * pages/Sitemap.tsx
 * ─────────────────────────────────────────────────────────────────
 * Human-readable HTML Sitemap page.
 *
 * DATA SOURCE: routes.config.ts
 *   This component never hardcodes routes. It reads directly from
 *   sitemapSections — the same array that feeds the XML sitemap.
 *   Add a route to routes.config.ts and it appears here automatically
 *   on the next build (or hot-reload in dev).
 *
 * AUTO-UPDATE BEHAVIOR:
 *   Because both this component and vite.config.ts import from
 *   routes.config.ts, any route change triggers:
 *     • Immediate hot-reload update in dev
 *     • Regenerated sitemap.xml on the next Netlify deploy
 *     • Updated HTML Sitemap at /sitemap on the live site
 * ─────────────────────────────────────────────────────────────────
 */

import { useEffect } from 'react';
import { Layout, BookOpen, Shield, ChevronRight, MapPin } from 'lucide-react';
import { sitemapSections, SitemapSection } from '../routes.config';
import { Page } from '../types';

interface SitemapProps {
  onNavigate: (page: Page) => void;
}

// ── Icon resolver — maps icon name strings from routes.config.ts ──
const SectionIcon = ({ name }: { name: SitemapSection['icon'] }) => {
  const cls = 'w-5 h-5 text-champagne';
  switch (name) {
    case 'book-open': return <BookOpen className={cls} />;
    case 'shield':    return <Shield className={cls} />;
    default:          return <Layout className={cls} />;
  }
};

// ── Maps queryParam → Page enum for the navigate handler ──────────
const queryParamToPage = (queryParam: string): Page | null => {
  switch (queryParam) {
    case '/':        return Page.Home;
    case 'about':    return Page.About;
    case 'courses':  return Page.Courses;
    case 'contact':  return Page.Contact;
    case 'privacy':  return Page.Privacy;
    case 'terms':    return Page.Terms;
    case 'sitemap':    return Page.Sitemap;
    case 'enrollment': return Page.Enrollment;
    case 'roadmap':    return Page.Roadmap;
    case 'forms':      return Page.Forms;
    default:         return null;
  }
};

const Sitemap = ({ onNavigate }: SitemapProps) => {

  useEffect(() => {
    document.title = 'Sitemap | Ameristar School';
  }, []);

  const handleClick = (queryParam: string) => {
    const page = queryParamToPage(queryParam);
    if (page !== null) {
      onNavigate(page);
    }
  };

  // Build date stamp — shown in the page header so visitors know
  // the sitemap reflects the current deployment.
  const buildDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen">

      {/* ── Page Hero ─────────────────────────────────────────── */}
      <section className="pt-40 pb-16 px-6 md:px-12 bg-oxford text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-5 h-5 text-champagne" />
            <span className="text-champagne text-sm tracking-widest uppercase font-medium">
              Site Navigation
            </span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-light tracking-tight mb-6">
            Sitemap
          </h1>
          <p className="text-gray-400 text-lg font-light max-w-xl leading-relaxed">
            A complete directory of every page on this website.
            All links are kept current with each deployment.
          </p>
          <p className="text-gray-600 text-xs tracking-widest uppercase mt-6">
            Last updated: {buildDate}
          </p>
        </div>
      </section>

      {/* ── Divider ───────────────────────────────────────────── */}
      <div className="h-1 bg-gradient-to-r from-transparent via-champagne/40 to-transparent" />

      {/* ── Sections ──────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto space-y-16">

          {sitemapSections.map((section) => (
            <div key={section.heading}>

              {/* Section Header */}
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-full bg-oxford flex items-center justify-center">
                  <SectionIcon name={section.icon} />
                </div>
                <h2 className="font-serif text-2xl text-obsidian tracking-tight">
                  {section.heading}
                </h2>
                <span className="ml-auto text-xs text-gray-400 tracking-widest uppercase">
                  {section.routes.length} {section.routes.length === 1 ? 'page' : 'pages'}
                </span>
              </div>

              {/* Route Cards */}
              <div className="grid gap-3">
                {section.routes.map((route, idx) => {
                  const page = queryParamToPage(route.queryParam);
                  const isNavigable = page !== null;

                  return (
                    <div
                      key={`${route.queryParam}-${idx}`}
                      role={isNavigable ? 'button' : undefined}
                      tabIndex={isNavigable ? 0 : undefined}
                      onClick={() => isNavigable && handleClick(route.queryParam)}
                      onKeyDown={(e) => {
                        if (isNavigable && (e.key === 'Enter' || e.key === ' ')) {
                          handleClick(route.queryParam);
                        }
                      }}
                      className={`
                        group flex items-start gap-4 p-5 rounded-lg border transition-all duration-200
                        ${isNavigable
                          ? 'border-gray-100 hover:border-champagne/40 hover:bg-champagne/5 cursor-pointer'
                          : 'border-gray-100 bg-gray-50/50 opacity-60 cursor-default'
                        }
                      `}
                    >
                      {/* Chevron */}
                      <ChevronRight className={`
                        w-4 h-4 mt-1 shrink-0 transition-transform duration-200
                        ${isNavigable
                          ? 'text-champagne group-hover:translate-x-1'
                          : 'text-gray-300'
                        }
                      `} />

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-3 flex-wrap">
                          <span className={`
                            font-medium text-base transition-colors duration-200
                            ${isNavigable
                              ? 'text-obsidian group-hover:text-champagne'
                              : 'text-gray-400'
                            }
                          `}>
                            {route.label}
                          </span>
                          {/* URL badge */}
                          <span className="text-xs text-gray-400 font-mono">
                            {route.queryParam === '/'
                              ? '/'
                              : `/?page=${route.queryParam}`
                            }
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm mt-1 font-light leading-relaxed">
                          {route.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* ── Developer Note (visible in UI for transparency) ───── */}
      <section className="py-10 px-6 md:px-12 border-t border-gray-100">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs text-gray-400 font-light">
            This sitemap is generated automatically from{' '}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 text-xs">
              routes.config.ts
            </code>{' '}
            and refreshes with every deployment.
          </p>
          <button
            onClick={() => onNavigate(Page.Home)}
            className="text-xs text-champagne tracking-widest uppercase hover:underline transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </section>

    </div>
  );
};

export default Sitemap;
