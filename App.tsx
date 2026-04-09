import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import About from './pages/About';
import Courses from './pages/Courses';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Sitemap from './pages/Sitemap';
import Enrollment from './pages/Enrollment';
import Roadmap from './pages/Roadmap';
import NotFound from './pages/NotFound';
import Forms from './pages/Forms';
import Footer from './components/Footer';
import { Page } from './types';

// Reads the current URL and maps it to a page.
// This site routes via ?page= on the root path only, so any other pathname
// (for example /bogus-url) should render the custom 404 page instead of Home.
const getPageFromUrl = (): Page => {
  const normalizedPath = window.location.pathname
    .replace(/\/index\.html$/, '/')
    .replace(/\/+$/, '') || '/';

  if (normalizedPath !== '/') {
    return Page.NotFound;
  }

  const params = new URLSearchParams(window.location.search);
  const pageParam = params.get('page');
  switch (pageParam) {
    case null:         return Page.Home;       // no ?page= on / → Home
    case 'contact':    return Page.Contact;
    case 'courses':    return Page.Courses;
    case 'about':      return Page.About;
    case 'privacy':    return Page.Privacy;
    case 'terms':      return Page.Terms;
    case 'sitemap':    return Page.Sitemap;
    case 'enrollment': return Page.Enrollment;
    case 'roadmap':    return Page.Roadmap;
    case 'forms':      return Page.Forms;
    default:           return Page.NotFound;   // unknown ?page= value → 404
  }
};

// Reads ?category= from the current URL
const getCategoryFromUrl = (): 'insurance' | 'real-estate' | null => {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('category');
  if (cat === 'insurance' || cat === 'real-estate') return cat;
  return null;
};

// ── GA4 SPA page tracking ─────────────────────────────────────────────────────
// gtag() is defined by the inline script in index.html.
// We declare it here so TypeScript does not complain about an unknown global.
declare function gtag(...args: unknown[]): void;

const App = () => {
  // currentPage and currentCategory are both owned exclusively here.
  // Courses.tsx never calls pushState — it calls callbacks instead.
  // This is the only way to guarantee popstate always triggers a re-render.
  const [currentPage, setCurrentPage] = useState<Page>(getPageFromUrl());
  const [currentCategory, setCurrentCategory] = useState<'insurance' | 'real-estate' | null>(getCategoryFromUrl());

  // Roadmap expanded-node state lives here so it survives SPA navigation
  // (navigating away and back preserves what the user expanded), but resets
  // on a full page reload since App.tsx re-initialises from scratch.
  // Default: only the root node open, revealing layer 2 (DRE + DOI) but
  // nothing deeper.
  const [roadmapExpanded, setRoadmapExpanded] = useState<Record<string, boolean>>({ root: true });

  // ── GA4 SPA page_view tracking ───────────────────────────────────────────
  // GA4's initial config() call (in index.html) fires once on first load.
  // For every subsequent SPA navigation we manually send a page_view event
  // so Google Analytics records each page the user visits — not just the entry.
  useEffect(() => {
    if (typeof gtag === 'function') {
      gtag('event', 'page_view', {
        page_title:    document.title,
        page_location: window.location.href,
        page_path:     window.location.pathname + window.location.search,
      });
    }
  }, [currentPage]);

  // Single popstate handler — reads both params and updates both states.
  // Because both are real React state, any URL change (even within the same
  // page) is guaranteed to trigger a re-render.
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(getPageFromUrl());
      setCurrentCategory(getCategoryFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (page: Page) => {
    let newUrl = '/';
    switch (page) {
      case Page.Home:       newUrl = '/'; break;
      case Page.About:      newUrl = '/?page=about'; break;
      case Page.Courses:    newUrl = '/?page=courses'; break;
      case Page.Contact:    newUrl = '/?page=contact'; break;
      case Page.Privacy:    newUrl = '/?page=privacy'; break;
      case Page.Terms:      newUrl = '/?page=terms'; break;
      case Page.Sitemap:    newUrl = '/?page=sitemap'; break;
      case Page.Enrollment: newUrl = '/?page=enrollment'; break;
      case Page.Roadmap:    newUrl = '/?page=roadmap'; break;
      case Page.Forms:      newUrl = '/?page=forms'; break;
    }
    window.history.pushState({ page }, '', newUrl);
    setCurrentPage(page);
    setCurrentCategory(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Called by Courses when a category card is clicked.
  // Pushes the URL here so App.tsx always knows the current state.
  const handleCategoryChange = (cat: 'insurance' | 'real-estate' | null) => {
    const newUrl = cat ? `/?page=courses&category=${cat}` : '/?page=courses';
    window.history.pushState({}, '', newUrl);
    setCurrentCategory(cat);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.Home:
        return <Home onNavigate={handleNavigate} />;
      case Page.About:
        return <About />;
      case Page.Courses:
        return (
          <Courses
            category={currentCategory}
            onCategoryChange={handleCategoryChange}
            onNavigate={handleNavigate}
          />
        );
      case Page.Contact:
        return <Contact />;
      case Page.Privacy:
        return <Privacy />;
      case Page.Terms:
        return <Terms onNavigate={handleNavigate} />;
      case Page.Sitemap:
        return <Sitemap onNavigate={handleNavigate} />;
      case Page.Enrollment:
        return <Enrollment onNavigate={handleNavigate} />;
      case Page.Roadmap:
        return (
          <Roadmap
            onNavigate={handleNavigate}
            expandedNodes={roadmapExpanded}
            onExpandedChange={setRoadmapExpanded}
          />
        );
      case Page.Forms:
        return <Forms onNavigate={handleNavigate} />;
      case Page.NotFound:
        return <NotFound onNavigate={handleNavigate} />;
      default:
        return <NotFound onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-obsidian selection:bg-champagne/30 relative overflow-hidden bg-paper">
      {/* Ambient Background Glows */}
      <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-champagne/20 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-multiply" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-50/80 rounded-full blur-[100px] pointer-events-none z-0 mix-blend-multiply" />

      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />

      <main className="flex-grow pt-16 animate-fade-in z-10 relative">
        {renderPage()}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default App;