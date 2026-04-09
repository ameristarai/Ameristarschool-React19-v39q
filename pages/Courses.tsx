import { useEffect } from 'react';
import { Check, Info, ArrowLeft, Home, Shield, ChevronRight } from 'lucide-react';
import { CourseData, Page } from '../types';
import SEO from '../components/SEO';

// --- DATA: Insurance Courses (Existing) ---
const insuranceCourses: CourseData[] = [
  {
    id: 'life-health',
    title: 'Life & Health',
    price: '$300',
    description: 'The definitive pre-licensing package for aspiring agents.',
    features: [
      'California DOI Compliant',
      '12-Hour Ethics Course',
      'Pre-Licensing Course',
      'Practice Exam',
      'Digital Certificate included'
    ]
  },
  {
    id: 'property-casualty',
    title: 'Property & Casualty',
    price: '$300',
    description: 'Comprehensive preparation for P&C licensure.',
    features: [
      'Commercial & Personal Lines',
      'Interactive Case Studies',
      'Real-world Scenarios',
      'Digital Certificate included',
      'Textbooks Included'
    ],
    isPopular: true
  },
  {
    id: 'ce-renewal',
    title: 'CE Renewal',
    price: '$150',
    description: 'Continuing education to keep your license active.',
    features: [
      '3 Courses that meet 24 Credit Hours',
      'Ethics Requirement Included',
      'Self-Paced Learning',
      'Instant Reporting to DOI',
      'Textbooks Included'
    ]
  }
];

// --- DATA: Real Estate Courses ---
const realEstateCourses: CourseData[] = [
  {
    id: 'sales-agent-package',
    title: 'Sales Agent Package',
    price: '$399',
    description: 'Everything you need to pass the California Salesperson exam.',
    features: [
      'RE Principles and RE Practice Courses',
      '1 Elective Course',
      'Practice Exams Aligned with Actual Tests',
      'DRE Approved Curriculum',
    ]
  },
  {
    id: 'broker-package',
    title: 'Broker Package',
    price: '$649',
    description: 'Complete 8-course requirement for Broker license.',
    features: [
      'All 5 Required Courses',
      'Practice Exams Aligned with Actual Tests',
      'DRE Approved Curriculum',
      'Fast-Track Certification',
    ],
    isPopular: true
  }
];

// --- COMPONENT: Selection View ---
const SelectionView = ({ onSelect }: { onSelect: (type: 'insurance' | 'real-estate') => void }) => {
  return (
    <div className="w-full pt-24 pb-24 animate-fade-in">
      <SEO 
        title="Course Catalog"
        description="Select your professional pathway: CA Real Estate Salesperson & Broker licensing (DRE) or Insurance Life, Health & P&C (DOI)."
        keywords="real estate license, insurance license, CA DRE courses, CA DOI courses"
      />
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <h1 className="font-serif text-5xl md:text-6xl text-obsidian">Select Your Path</h1>
          <p className="text-gray-500 text-lg font-light">
            We offer premier educational pathways for two of the most dynamic industries. Choose your field to view available courses.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Real Estate Option */}
          <div 
            onClick={() => onSelect('real-estate')}
            className="group relative cursor-pointer rounded-3xl overflow-hidden shadow-lg transition-all duration-500 ease-out transform hover:-translate-y-4 hover:scale-[1.03] hover:shadow-[0_40px_80px_-20px_rgba(197,160,101,0.4)] border-2 border-transparent hover:border-champagne"
          >
            {/* Dark Overlay that lightens slightly on hover */}
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors z-10 duration-1000"></div>
            
            {/* Image with Grayscale -> Color transition */}
            <img 
              src="https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=1600" 
              alt="Luxury Craftsman Home with Mountains" 
              className="w-full h-96 object-cover transform grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-in-out"
            />
            
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-champagne transition-all duration-500 border border-white/20 group-hover:border-champagne">
                <Home className="text-champagne group-hover:text-white w-8 h-8 transition-colors duration-500" />
              </div>
              <h2 className="font-serif text-4xl text-champagne mb-2 tracking-wide drop-shadow-md group-hover:text-white transition-colors duration-500">Real Estate</h2>
              <p className="text-white/90 font-light mb-8 max-w-xs drop-shadow-xs">
                Licensing for Salespersons & Brokers
              </p>
              <span className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-champagne border border-champagne px-6 py-3 rounded-full group-hover:bg-champagne group-hover:text-white transition-all">
                View Courses <ChevronRight size={14} />
              </span>
            </div>
          </div>

          {/* Insurance Option */}
          <div 
            onClick={() => onSelect('insurance')}
            className="group relative cursor-pointer rounded-3xl overflow-hidden shadow-lg transition-all duration-500 ease-out transform hover:-translate-y-4 hover:scale-[1.03] hover:shadow-[0_40px_80px_-20px_rgba(197,160,101,0.4)] border-2 border-transparent hover:border-champagne"
          >
            {/* Dark Overlay that lightens slightly on hover */}
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors z-10 duration-1000"></div>
            
            {/* Image with Grayscale -> Color transition */}
            <img 
              src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1600" 
              alt="Insurance Professional" 
              className="w-full h-96 object-cover transform grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-in-out"
            />
            
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-champagne transition-all duration-500 border border-white/20 group-hover:border-champagne">
                <Shield className="text-champagne group-hover:text-white w-8 h-8 transition-colors duration-500" />
              </div>
              <h2 className="font-serif text-4xl text-champagne mb-2 tracking-wide drop-shadow-md group-hover:text-white transition-colors duration-500">Insurance</h2>
              <p className="text-white/90 font-light mb-8 max-w-xs drop-shadow-xs">
                Life, Health & Property Licensure
              </p>
              <span className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-champagne border border-champagne px-6 py-3 rounded-full group-hover:bg-champagne group-hover:text-white transition-all">
                View Courses <ChevronRight size={14} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: Course List View (Generic for both types) ---
interface CourseListViewProps {
  title: string;
  subtitle: string;
  description: string;
  courses: CourseData[];
  onBack: () => void;
  onNavigate: (page: Page) => void;
  showDRENotice?: boolean;
  // SEO Props
  seoTitle: string;
  seoDesc: string;
  seoKeywords: string;
}

const CourseListView = ({ title, subtitle, description, courses, onBack, onNavigate, showDRENotice, seoTitle, seoDesc, seoKeywords }: CourseListViewProps) => {
  return (
    <div className="w-full pt-16 pb-24 animate-fade-in">
      <SEO 
        title={seoTitle}
        description={seoDesc}
        keywords={seoKeywords}
      />
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-gray-400 hover:text-champagne mb-8 transition-colors text-sm uppercase tracking-widest"
        >
          <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
          Back to Selection
        </button>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-24 space-y-0">
          <h1 className="font-serif text-5xl md:text-6xl text-obsidian leading-tight mb-6">
            {title}
          </h1>
          {subtitle && (
            <p className="text-champagne uppercase tracking-widest text-sm font-semibold mb-8">
              {subtitle}
            </p>
          )}
          <p className="text-gray-500 text-lg font-light leading-relaxed mt-6">
            {description}
          </p>
        </div>

        {/* Cards Grid */}
        <div className={`grid gap-8 items-start ${courses.length === 2 ? 'lg:grid-cols-2 max-w-3xl mx-auto' : 'lg:grid-cols-3'}`}>
          {courses.map((course) => (
            <div 
              key={course.id}
              className={`relative p-8 md:p-10 rounded-3xl transition-all duration-500 group ease-out ${
                course.isPopular 
                  ? 'bg-paper border-2 border-champagne shadow-xl hover:shadow-[0_40px_80px_-20px_rgba(197,160,101,0.25)] hover:bg-[#FFFAEB]' 
                  : 'bg-paper border border-gray-200 shadow-xs hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] hover:bg-[#FFFAEB] hover:border-champagne/50'
              } ${course.isPopular ? 'transform md:-translate-y-4 hover:-translate-y-8 hover:scale-[1.03]' : 'hover:-translate-y-4 hover:scale-[1.03]'}`}
            >
              {course.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-champagne text-white text-xs font-bold tracking-widest uppercase py-1 px-4 rounded-full shadow-md z-10">
                  Most Selected
                </div>
              )}
              
              <div className="space-y-2 mb-8 text-center">
                <h3 className="font-serif text-3xl text-obsidian group-hover:text-black transition-colors">{course.title}</h3>
                <p className="text-gray-400 font-light text-sm group-hover:text-gray-600 transition-colors">{course.description}</p>
              </div>

              <div className="mb-8 text-center">
                 <span className="font-sans text-5xl font-semibold tracking-tight text-obsidian group-hover:text-champagne transition-colors duration-300">{course.price}</span>
                 <span className="text-gray-400 text-lg">/package</span>
              </div>

              <div className="w-full h-px bg-gray-100 mb-8 group-hover:bg-champagne/30 transition-colors"></div>

              <ul className="space-y-4 mb-10">
                {course.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-gray-600 font-light group-hover:text-gray-900 transition-colors">
                    <Check size={18} className="text-champagne mr-3 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-4 rounded-xl font-medium tracking-wide transition-all ${
                course.isPopular 
                  ? 'bg-champagne text-white hover:bg-[#b58f55] shadow-md hover:shadow-lg' 
                  : 'bg-gray-50 text-obsidian hover:bg-champagne hover:text-white shadow-none hover:shadow-lg'
              }`}
                onClick={() => onNavigate(Page.Enrollment)}
              >
                Select Course
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Teaser */}
        <div className="mt-24 text-center">
          <p className="flex items-center justify-center gap-2 text-gray-400 text-sm">
            <Info size={16} />
            Need help deciding? Contact our support team for a free consultation.
          </p>
        </div>

        {/* DRE Mandatory Disclaimer — shown only for Real Estate courses */}
        {showDRENotice && (
          <div className="mt-16 max-w-3xl mx-auto">
            <div className="p-5 rounded-2xl bg-oxford/5 border border-oxford/15">
              <p className="text-xs text-gray-600 leading-relaxed">
                <span className="font-semibold text-obsidian uppercase tracking-wider text-[10px]">DRE Approval Statement &nbsp;—&nbsp;</span>
                This course is approved for pre-license education credit by the California Department of Real Estate. However, this approval does not constitute an endorsement of the views or opinions which are expressed by the course sponsor, instructors, authors, or lecturers.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- MAIN COMPONENT: Courses Router ---
interface CoursesProps {
  category: 'insurance' | 'real-estate' | null;
  onCategoryChange: (cat: 'insurance' | 'real-estate' | null) => void;
  onNavigate: (page: Page) => void;
}

const Courses = ({ category, onCategoryChange, onNavigate }: CoursesProps) => {

  // Scroll to top whenever the visible view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [category]);

  if (category === 'insurance') {
    return (
      <CourseListView
        title="Insurance Collections"
        subtitle=""
        description="Choose the pathway that aligns with your professional ambition. Comprehensive licensing packages for California Insurance agents."
        courses={insuranceCourses}
        onBack={() => onCategoryChange(null)}
        onNavigate={onNavigate}
        seoTitle="CA Insurance Licensing Courses"
        seoDesc="Comprehensive CA Department of Insurance (DOI) pre-licensing for Life, Health, and Property & Casualty."
        seoKeywords="CA DOI, CA insurance exams, CA insurance certification, life health insurance license, property casualty license"
      />
    );
  }

  if (category === 'real-estate') {
    return (
      <CourseListView
        title="Real Estate Collections"
        subtitle=""
        description="Comprehensive licensing packages for California Real Estate Salespersons and Brokers."
        courses={realEstateCourses}
        onBack={() => onCategoryChange(null)}
        onNavigate={onNavigate}
        showDRENotice={true}
        seoTitle="CA Real Estate Licensing Courses"
        seoDesc="Approved California Department of Real Estate (DRE) courses for Salesperson and Broker licensing."
        seoKeywords="CA DRE, CA real estate agent, real estate broker license, real estate school CA"
      />
    );
  }

  return <SelectionView onSelect={onCategoryChange} />;
};

export default Courses;