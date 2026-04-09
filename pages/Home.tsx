import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Shield, Award, BookOpen, Play, X } from 'lucide-react';
import { Page } from '../types';
import SEO from '../components/SEO';

interface HomeProps {
  onNavigate: (page: Page) => void;
}

const heroImages = [
  "/hero1-highrise.jpg",  // Modern Architecture / Stability
  "/hero2-suitup.jpg",    // Professional / Suit Detail
  "/hero3-calculation.jpg", // Education / Strategy
];

const Home = ({ onNavigate }: HomeProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVideoOpen, setIsVideoOpen]             = useState(false);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // ── Video modal handlers ──────────────────────────────────────────────────
  const openVideo = () => setIsVideoOpen(true);

  const closeVideo = () => {
    setIsVideoOpen(false);
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
      modalVideoRef.current.currentTime = 0;
    }
  };

  return (
    <div className="w-full">
      <SEO 
        title="Premier CA Licensing Education"
        description="Ameristar School: The top-rated CA Real Estate (DRE) and Insurance (DOI) licensing school. Pre-licensing exams and continuing education in California."
        keywords="CA real estate, CA insurance, CA DRE, CA DOI, CA licensing, real estate school, insurance school"
      />

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 pt-20 relative">
        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 space-y-8 animate-fade-in-up z-10">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight text-obsidian">
              Open Doors.<br />
              <span className="italic text-champagne">Secure Futures.</span>
            </h1>
            <p className="font-sans text-gray-500 text-lg md:text-xl max-w-md leading-relaxed">
              Pass your California Real Estate or Insurance exam with confidence. Expert-designed courses, built for first-time passers.
            </p>
            <div className="pt-8">
              <button
                onClick={() => onNavigate(Page.Courses)}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-champagne text-white overflow-hidden transition-all hover:bg-[#b8962e] shadow-md hover:shadow-lg"
              >
                <span className="font-sans tracking-widest text-sm uppercase">Begin Your Journey</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
          
          <div className="order-1 md:order-2 relative h-[50vh] md:h-[80vh] w-full overflow-hidden rounded-tl-[4rem] rounded-br-[4rem] shadow-2xl">
            {/* Slideshow */}
            {heroImages.map((src, index) => (
              <img 
                key={src}
                src={src} 
                alt="Professional Excellence"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ease-in-out ${
                  index === currentImageIndex ? 'opacity-90 grayscale hover:scale-105 transform duration-[10000ms]' : 'opacity-0'
                }`}
              />
            ))}
            {/* Overlay Gradient for text readability if needed, though side-by-side doesn't need it as much */}
            <div className="absolute inset-0 bg-oxford/10 mix-blend-multiply pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* ── Cinematic Video Strip ─────────────────────────────────────────────
           Full-width, 45vh tall. Sits between the white hero and the oxford
           Philosophy section. The bottom gradient pre-blends into bg-oxford so
           the strip feels stitched to the section below rather than floating.
           Performance: preload="metadata" fetches only the first frame on load;
           the browser fetches the full video in the background after DOMContentLoaded.
           autoPlay + muted + loop + playsInline are all required for cross-browser
           autoplay (including iOS Safari). No React state or JS involved.
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="relative w-full h-[60vh] overflow-hidden">

        {/* Video — covers the container; anchor at 15% from top to frame instructor + students */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover object-[15%_15%] md:object-[center_15%] video-pan-mobile"
        >
          <source src="/shirley-miao-hg1.mp4" type="video/mp4" />
        </video>

        {/* Navy overlay — darkens video to match site's moody palette */}
        <div className="absolute inset-0 bg-brand-navy/55 pointer-events-none" />

        {/* Top fade — starts from paper (matching the white hero above) and
             completes within 22% (~13vh) of the container, which sits just
             above the instructor's head at the object-[center_15%] anchor.
             Three stops create a perceptual ease-out so it reads as a smooth
             dissolve rather than a visible band. */}
        <div className="absolute inset-x-0 top-0 h-[22%] bg-gradient-to-b from-paper via-paper/50 to-transparent pointer-events-none" />

        {/* Bottom fade — pre-blends into the oxford section directly below */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-oxford to-transparent pointer-events-none" />

      </section>

      {/* Philosophy / Value Prop - High Contrast Blue Section */}
      <section className="py-32 bg-oxford text-white relative overflow-hidden">
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="grid md:grid-cols-3 gap-16">
            <div className="space-y-6 group">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-champagne/20 transition-colors duration-500">
                <Shield className="w-8 h-8 text-champagne" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-2xl tracking-wide">Licensure Excellence</h3>
              <p className="text-gray-300 font-light leading-relaxed">
                Study materials rigorously designed to pass California Department of Insurance exams on the first attempt.
              </p>
            </div>
            <div className="space-y-6 group">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-champagne/20 transition-colors duration-500">
                <BookOpen className="w-8 h-8 text-champagne" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-2xl tracking-wide">Continuing Education</h3>
              <p className="text-gray-300 font-light leading-relaxed">
                Curated content for renewal requirements. Keep your knowledge sharp and your license active with effortless compliance.
              </p>
            </div>
            <div className="space-y-6 group">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-champagne/20 transition-colors duration-500">
                <Award className="w-8 h-8 text-champagne" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-2xl tracking-wide">Expert Mentorship</h3>
              <p className="text-gray-300 font-light leading-relaxed">
                Founded by Shirley Miao, bridging decades of industry wisdom with modern educational strategies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Split */}
      <section className="min-h-[80vh] flex items-center bg-transparent">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full py-24">
          <div className="grid md:grid-cols-2 gap-24 items-center">
            <div className="relative group overflow-hidden cursor-pointer" onClick={openVideo}>
              {/* Image: Mixed Asian-Caucasian woman, business setting, high rise view */}
              <img
                src="/Asian-Model-v2.jpg"
                alt="Professional Business Woman in High Rise"
                className="w-full aspect-[3/4] object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 ease-in-out shadow-2xl"
              />

              {/* Play button — bottom-left, always visible, brightens on hover */}
              <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3 pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center group-hover:bg-champagne/80 transition-all duration-500 shadow-lg">
                  <Play size={18} className="text-white fill-white ml-0.5" />
                </div>
                <span className="text-white/80 text-xs uppercase tracking-widest font-semibold drop-shadow group-hover:text-champagne transition-colors duration-500">
                  Watch
                </span>
              </div>

              {/* Subtle dark vignette at bottom so play button stays legible over light image areas */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-champagne/20 backdrop-blur-xs -z-10"></div>
              <div className="absolute -top-8 -left-8 w-48 h-48 border border-champagne/30 -z-10"></div>
            </div>
            <div className="space-y-10">
              <h2 className="font-serif text-4xl md:text-6xl leading-tight">
                Simplicity is the<br />ultimate sophistication.
              </h2>
              <p className="text-gray-500 text-lg font-light leading-loose">
                We believe learning shouldn't be cluttered. Our curriculum is stripped of the non-essential, leaving only the potent knowledge you need to succeed. The result is clarity, speed, and confidence.
              </p>
              <button 
                onClick={() => onNavigate(Page.About)}
                className="text-obsidian border-b border-black pb-1 hover:text-champagne hover:border-champagne transition-colors uppercase tracking-widest text-sm"
              >
                Read the Founder's Story
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* ── Video Lightbox Modal ────────────────────────────────────────────────
           Opens when user clicks the photo / play button.
           preload="none" — browser fetches zero bytes until modal is opened.
           Clicking the backdrop or the X button closes and resets the video.
      ────────────────────────────────────────────────────────────────────── */}
      {isVideoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in"
          onClick={closeVideo}
        >
          {/* Modal card — click inside does NOT close (stopPropagation) */}
          <div
            className="relative w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeVideo}
              className="absolute -top-10 right-0 w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-champagne hover:border-champagne transition-all duration-300 z-10"
              aria-label="Close video"
            >
              <X size={16} />
            </button>

            {/* Video */}
            <video
              ref={modalVideoRef}
              src="/Ameristar_School_-_Sophia_-_HeyGen_-_v1_-_En.mp4"
              className="w-full rounded-2xl shadow-2xl"
              controls
              autoPlay
              playsInline
              preload="none"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;