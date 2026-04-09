import SEO from '../components/SEO';

const About = () => {
  return (
    <div className="w-full pt-24 pb-24 relative">
      <SEO 
        title="About Shirley Miao"
        description="Founded by Shirley Miao, Ameristar School offers 20+ years of excellence in CA insurance and real estate education."
        keywords="Shirley Miao, Ameristar School founder, insurance education expert, real estate education expert"
      />
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Header */}
        <div className="mb-24 text-center md:text-left">
          <p className="text-champagne uppercase tracking-widest text-sm font-semibold mb-4 flex items-center gap-4 justify-center md:justify-start">
            <span className="w-8 h-px bg-champagne"></span>
            The Founder
          </p>
          <h1 className="font-serif text-5xl md:text-7xl text-obsidian">Shirley Miao</h1>
        </div>

        {/* Content Layout */}
        <div className="grid md:grid-cols-12 gap-12 md:gap-24">
          
          {/* Portrait Column */}
          <div className="md:col-span-5 relative">
            <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative shadow-xl">
               {/* Using a placeholder that looks professional and editorial */}
               <img 
                src="/shirley-miao.jpg" 
                alt="Shirley Miao" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
               />
               <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-oxford/90 to-transparent">
                 <p className="text-white font-serif italic text-xl">Founder & Educator</p>
               </div>
            </div>
            {/* Decorative element */}
            <div className="absolute -z-10 top-10 -left-10 w-full h-full border border-champagne/40"></div>
          </div>

          {/* Text Column */}
          <div className="md:col-span-7 flex flex-col justify-center space-y-8">
            <blockquote className="border-l-2 border-champagne pl-8 py-2">
              <h2 className="font-serif text-3xl md:text-4xl leading-snug text-oxford">
                "Education is not just about passing a test. It is about building the foundation for a legacy."
              </h2>
            </blockquote>
            
            <div className="space-y-6 text-gray-500 font-light text-lg leading-relaxed">
              <p>
                With over two decades of experience in the insurance sector, Shirley Miao established Ameristar School with a singular vision: to dismantle the barriers between ambition and licensure.
              </p>
              <p>
                Having navigated the complexities of the California Department of Real Estate and Department of Insurance exams herself, then later guiding countless professionals through the same rigorous process, Shirley identified a gap in the market. Existing resources were cluttered, archaic, and uninspiring.
              </p>
              <p>
                She believed that the educational journey should mirror the professionalism of the career itself: direct, transformational, and distinctive.
              </p>
              <p>
                Today, her courses serve as the gold standard for aspiring real estate agents and brokers, as well as Life, Accident, and Health insurance agents. Whether you are taking your first step toward a license or seeking Continuing Education hours to maintain your standing, Shirley's curriculum is designed to respect your time and elevate your understanding.
              </p>
            </div>

            <div className="pt-8 border-t border-gray-100 mt-8 grid grid-cols-2 gap-8">
              <div>
                <span className="block font-serif text-4xl text-champagne">20+</span>
                <span className="text-sm uppercase tracking-widest text-obsidian font-medium">Years Experience</span>
              </div>
              <div>
                <span className="block font-serif text-4xl text-champagne">10k+</span>
                <span className="text-sm uppercase tracking-widest text-obsidian font-medium">Students Licensed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;