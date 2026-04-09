import { useEffect, useState } from 'react';
import { ArrowUp, Scale, AlertTriangle, FileText, ChevronRight } from 'lucide-react';
import { Page } from '../types';
import SEO from '../components/SEO';

interface TermsProps {
  onNavigate: (page: Page) => void;
}

// Define sections outside component to maintain stable reference for useEffect
const sections = [
  { id: 's01', label: 'Agreement & Acceptance' },
  { id: 's02', label: 'Eligibility' },
  { id: 's03', label: 'Services & Enrollment' },
  { id: 's04', label: 'No Guarantee of Exam Passage' },
  { id: 's05', label: 'State Agency Disclaimer' },
  { id: 's06', label: 'Intellectual Property' },
  { id: 's07', label: 'AI Use Prohibition' },
  { id: 's08', label: 'Prohibited Conduct' },
  { id: 's09', label: 'Payments, Refunds & Access' },
  { id: 's10', label: 'Account Termination' },
  { id: 's11', label: 'Disclaimers & Warranties' },
  { id: 's12', label: 'Limitation of Liability' },
  { id: 's13', label: 'Indemnification' },
  { id: 's14', label: 'Dispute Resolution' },
  { id: 's15', label: 'Class Action Waiver' },
  { id: 's16', label: 'Governing Law' },
  { id: 's17', label: 'Privacy Policy (CCPA)' },
  { id: 's18', label: 'Modifications' },
  { id: 's19', label: 'Miscellaneous' },
  { id: 's20', label: 'Contact & Legal Notices' },
];

const Terms = ({ onNavigate }: TermsProps) => {
  const [activeSection, setActiveSection] = useState<string>('s01');
  const [showBackTop, setShowBackTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show/Hide Back to top
      setShowBackTop(window.scrollY > 500);

      // Determine active section
      const sectionElements = sections.map(s => document.getElementById(s.id));
      
      const current = sectionElements.find(section => {
        if (!section) return false;
        const rect = section.getBoundingClientRect();
        // Check if section is in the top 40% of the viewport
        return rect.top >= 0 && rect.top <= window.innerHeight * 0.4;
      });

      if (current) {
        setActiveSection(current.id);
      } else {
        // Fallback: Check if we are past a section (scrolled below it)
        for (let i = sectionElements.length - 1; i >= 0; i--) {
          const section = sectionElements[i];
          if (section) {
            const rect = section.getBoundingClientRect();
            if (rect.top < 0) {
              setActiveSection(section.id);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // Empty dependency array now safe because sections is static

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 100;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="w-full relative">
      <SEO 
        title="Terms of Use"
        description="Terms of Use for Ameristar School. Includes enrollment agreements, refund policies, exam passage disclaimers, and arbitration clauses."
      />

      {/* Header */}
      <section className="bg-oxford text-white pt-20 pb-24 px-6 md:px-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
        <div className="relative z-10 max-w-4xl mx-auto space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 text-champagne uppercase tracking-widest text-xs font-semibold mb-2">
            <Scale size={14} /> Legal Documentation
          </div>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl">Terms of Use</h1>
          <div className="w-12 h-px bg-champagne mx-auto"></div>
          <p className="text-gray-400 font-light text-sm tracking-wide">
            Effective Date: Upon Enrollment &nbsp;·&nbsp; Last Revised: {currentDate}
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 grid md:grid-cols-12 gap-12 relative">
        
        {/* Sidebar TOC - Desktop Only */}
        <aside className="hidden md:block md:col-span-3 lg:col-span-3">
          <div className="sticky top-32 space-y-8">
            <div>
              <h3 className="text-champagne text-xs font-bold uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">
                Contents
              </h3>
              <nav className="flex flex-col space-y-1">
                {sections.map((section, idx) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`text-left text-sm py-2 px-3 rounded-r transition-all duration-300 border-l-2 ${
                      activeSection === section.id 
                        ? 'border-champagne text-obsidian font-medium bg-champagne/5' 
                        : 'border-transparent text-gray-400 hover:text-champagne hover:border-champagne/30'
                    }`}
                  >
                    <span className="text-xs text-champagne/60 mr-2 font-mono">{(idx + 1).toString().padStart(2, '0')}</span>
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 leading-relaxed mb-2">
                Need clarification?
              </p>
              <a href="mailto:ameristarschool@yahoo.com" className="text-sm font-serif text-obsidian hover:text-champagne transition-colors border-b border-gray-200 hover:border-champagne pb-0.5">
                ameristarschool@yahoo.com
              </a>
            </div>
          </div>
        </aside>

        {/* Legal Text Content */}
        <main className="md:col-span-9 lg:col-span-8 lg:col-start-5 space-y-16 animate-fade-in">
          
          <div className="bg-champagne/10 border-l-4 border-champagne p-6 md:p-8 rounded-r-lg flex items-start gap-4">
            <AlertTriangle className="text-champagne shrink-0 mt-1" size={24} />
            <div className="space-y-2">
               <h4 className="text-obsidian font-bold text-sm uppercase tracking-wide">Please Read Carefully Before Enrolling</h4>
               <p className="text-obsidian text-sm leading-relaxed">
                These Terms of Use constitute a legally binding agreement between you and Ameristar School. By accessing this website, creating an account, or purchasing any course, you acknowledge that you have read, understood, and agree to be bound by all provisions below. If you do not agree, do not use this website.
               </p>
            </div>
          </div>

          {/* Section 1 */}
          <section id="s01" className="scroll-mt-32">
            <span className="block font-serif text-champagne text-lg mb-2">01</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-6">Agreement & Acceptance</h2>
            <div className="prose prose-lg text-gray-500 font-light leading-relaxed">
              <p className="mb-4">
                These Terms of Use ("Terms") govern your access to and use of the website located at ameristarschool.com (the "Site"), and all associated services, course content, study materials, and digital resources (collectively, the "Services") provided by <strong>Ameristar School</strong> ("Ameristar," "we," "us," or "our"), a California-based professional licensing education provider.
              </p>
              <p className="mb-4">
                By accessing this Site or using any Service, you ("User," "Student," or "you") represent that you have read, understood, and agree to be bound by these Terms, as well as Ameristar School's Privacy Policy, which is incorporated herein by reference.
              </p>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 2 */}
          <section id="s02" className="scroll-mt-32">
            <span className="block font-serif text-champagne text-lg mb-2">02</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-6">Eligibility</h2>
            <p className="text-gray-500 font-light mb-4">To enroll in or purchase any course, you must:</p>
            <ul className="grid gap-3 text-gray-500 font-light">
                <li className="flex items-start gap-3">
                  <ChevronRight size={16} className="text-champagne mt-1 shrink-0" />
                  <span>Be at least 18 years of age.</span>
                </li>
                <li className="flex items-start gap-3">
                  <ChevronRight size={16} className="text-champagne mt-1 shrink-0" />
                  <span>Be enrolled or seeking licensure in the State of California (DRE/DOI).</span>
                </li>
                <li className="flex items-start gap-3">
                  <ChevronRight size={16} className="text-champagne mt-1 shrink-0" />
                  <span>Provide accurate, current, and complete registration information.</span>
                </li>
            </ul>
          </section>

          <hr className="border-gray-100" />

          {/* Section 3 */}
          <section id="s03" className="scroll-mt-32">
            <span className="block font-serif text-champagne text-lg mb-2">03</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-6">Services & Enrollment</h2>
            <p className="text-gray-500 font-light mb-4">
               Ameristar School provides online and digitally delivered study materials, pre-licensing courses, and continuing education (CE) courses approved for use in connection with California real estate and insurance licensing.
            </p>
            <p className="text-gray-500 font-light">
               Enrollment is confirmed upon receipt of full payment. Access to purchased content is granted for a defined period indicated at the time of purchase. It is your sole responsibility to complete coursework within the access period.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Section 4 - CRITICAL */}
          <section id="s04" className="scroll-mt-32">
            <span className="block font-serif text-champagne text-lg mb-2">04</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-6">No Guarantee of Exam Passage</h2>
            
            <div className="bg-obsidian text-white p-6 rounded-lg mb-8 shadow-lg">
               <strong className="block text-champagne mb-2 uppercase tracking-widest text-xs">Important Notice</strong>
               <p className="font-light text-sm leading-relaxed">
                 Ameristar School does not guarantee that any student will pass any California licensing examination, receive any license, or achieve any particular professional outcome. Individual results vary based on student preparation and examination performance.
               </p>
            </div>

            <ul className="space-y-3 pl-4 border-l border-gray-200 text-gray-500 font-light">
               <li className="pl-4">Completion of a course does not guarantee passage of state exams.</li>
               <li className="pl-4">Exam content and passing thresholds are controlled exclusively by state agencies.</li>
               <li className="pl-4">Marketing phrases such as "exam-prep" describe the intent of materials only and do not constitute a warranty of results.</li>
               <li className="pl-4"><strong>No Refunds based on exam failure.</strong> We do not offer pass guarantees or money-back offers tied to exam outcomes.</li>
            </ul>
          </section>

          <hr className="border-gray-100" />

          {/* Section 5 */}
          <section id="s05" className="scroll-mt-32">
            <span className="block font-serif text-champagne text-lg mb-2">05</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-6">State Agency Disclaimer</h2>
            <p className="text-gray-500 font-light mb-4">
              Ameristar School is an approved provider under the CA DRE and CA DOI. However:
            </p>
            <ul className="text-gray-500 font-light list-disc list-inside space-y-2">
               <li>All licensing decisions rest exclusively with the relevant regulatory agency.</li>
               <li>We are not responsible for agency processing delays or errors.</li>
               <li>It is the student's responsibility to confirm that courses satisfy their specific licensing requirements prior to purchase.</li>
            </ul>
          </section>

          <hr className="border-gray-100" />

          {/* Section 6 */}
          <section id="s06" className="scroll-mt-32">
            <span className="block font-serif text-champagne text-lg mb-2">06</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-6">Intellectual Property</h2>
            <p className="text-gray-500 font-light mb-6">
              All content is the exclusive property of Ameristar School. You are granted a limited, non-exclusive, revocable license for personal, non-commercial use only.
            </p>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
               <h4 className="font-serif text-lg mb-2 text-obsidian">Prohibited Uses</h4>
               <ul className="text-sm text-gray-600 space-y-2">
                 <li>• Sharing login credentials or course content.</li>
                 <li>• Reproducing or reselling materials.</li>
                 <li>• Creating derivative works.</li>
                 <li>• Framing or mirroring the Site.</li>
               </ul>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 7 - AI PROHIBITION */}
          <section id="s07" className="scroll-mt-32">
            <span className="block font-serif text-champagne text-lg mb-2">07</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-6">AI Use Prohibition</h2>
            
            <div className="bg-champagne/10 border-l-4 border-champagne p-6 rounded-r-lg mb-6">
               <p className="text-obsidian text-sm font-medium">
                  You are expressly prohibited from inputting, uploading, or transmitting any Ameristar School content into any Artificial Intelligence (AI) platform.
               </p>
            </div>

            <p className="text-gray-500 font-light mb-4">This includes, but is not limited to:</p>
            <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-500 font-mono bg-gray-50 p-4 rounded-lg">
               <li>ChatGPT / OpenAI</li>
               <li>Google Gemini / Bard</li>
               <li>Anthropic Claude</li>
               <li>Microsoft Copilot</li>
               <li>Meta AI</li>
               <li>Any other LLM or Generative AI</li>
            </ul>
            <p className="text-gray-500 font-light mt-4 text-sm">
               Violation of this provision constitutes a material breach of Terms, resulting in immediate account termination without refund and potential legal action for IP infringement.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Section 8 */}
          <section id="s08" className="scroll-mt-32">
            <span className="block font-serif text-champagne text-lg mb-2">08</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-6">Prohibited Conduct</h2>
            <p className="text-gray-500 font-light">
              You agree not to use the Site for illegal purposes, impersonate others, falsify completion records, or disrupt site integrity. Fraudulent activity (including course completion fraud) will be reported to the DRE/DOI.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Section 9 - Refunds */}
          <section id="s09" className="scroll-mt-32">
            <span className="block font-serif text-champagne text-lg mb-2">09</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-6">Payments & Refunds</h2>
            <div className="space-y-6 text-gray-500 font-light">
               <div className="bg-champagne/10 border-l-4 border-champagne p-5 rounded-r-lg">
                  <p className="text-obsidian text-sm font-medium mb-1">Governing Policy</p>
                  <p className="text-sm leading-relaxed">Your enrollment agreement is the operative refund document and supersedes any general terms listed here. The refund policy below reflects the terms of your signed enrollment agreement, which complies with California DRE regulations.</p>
               </div>
               <div>
                  <h3 className="text-obsidian font-serif text-xl mb-2">Refund Policy</h3>
                  <ul className="list-disc list-inside space-y-2">
                     <li><strong>Pre-License &amp; CE Courses:</strong> A full refund of tuition paid (less the non-refundable $35.00 registration fee) is available if the student provides written cancellation notice by certified mail within <span className="text-obsidian font-medium">seven (7) business days</span> of the enrollment date, and returns all course materials.</li>
                     <li><strong>After Seven Days:</strong> No refund will be issued once the seven-day period has passed.</li>
                     <li><strong>After Examination:</strong> No refund is available after the student has passed any final examination for a course, regardless of when the request is made.</li>
                     <li><strong>Rejected Applicants:</strong> A full refund of all tuition paid is made if the school rejects an enrollment application.</li>
                     <li><strong>Program Cancellation:</strong> A full refund is made if the school cancels or discontinues a course.</li>
                  </ul>
               </div>
               <p className="text-sm">
                  Course access is valid for one year from the date of enrollment. A new enrollment (with applicable fees) is required to continue after one year.
               </p>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 10 */}
          <section id="s10" className="scroll-mt-32">
            <span className="block font-serif text-champagne text-lg mb-2">10</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-6">Account Termination</h2>
            <p className="text-gray-500 font-light">
               We reserve the right to terminate your account without notice for violation of these Terms, suspected fraud, or non-payment. Upon termination, your license to access content ceases immediately. No refunds will be provided for termination for cause.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Section 11 */}
          <section id="s11" className="scroll-mt-32">
            <span className="block font-serif text-champagne text-lg mb-2">11</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-6">Disclaimers & Warranties</h2>
            <p className="text-gray-500 font-light uppercase tracking-widest text-xs mb-4">All Services Provided "As Is"</p>
            <p className="text-gray-500 font-light">
               Ameristar School expressly disclaims all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that course content will meet specific student requirements or that the service will be uninterrupted or error-free.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Section 12 - Liability */}
          <section id="s12" className="scroll-mt-32">
            <span className="block font-serif text-champagne text-lg mb-2">12</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-6">Limitation of Liability</h2>
            <div className="bg-gray-100 p-6 rounded-lg text-sm text-gray-700 leading-relaxed mb-6">
               <strong>TO THE FULLEST EXTENT PERMITTED BY CA LAW:</strong> In no event shall Ameristar School be liable for indirect, incidental, special, consequential, or punitive damages (including lost profits or lost licensure opportunities).
            </div>
            <p className="text-gray-500 font-light">
               Ameristar School's total aggregate liability shall not exceed <strong>the total amount you paid to Ameristar School in the twelve (12) months preceding the claim.</strong> Any claim must be filed within one (1) year.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Section 13 */}
          <section id="s13" className="scroll-mt-32">
            <span className="block font-serif text-champagne text-lg mb-2">13</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-6">Indemnification</h2>
            <p className="text-gray-500 font-light">
               You agree to indemnify and hold harmless Ameristar School from any claims, damages, or expenses arising from your use of the Site, violation of these Terms, or violation of third-party rights.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Section 14 - Arbitration */}
          <section id="s14" className="scroll-mt-32">
            <span className="block font-serif text-champagne text-lg mb-2">14</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-6">Dispute Resolution</h2>
            
            <div className="bg-obsidian text-white p-8 rounded-xl shadow-xl mb-6">
               <h3 className="text-champagne font-serif text-xl mb-4">Binding Arbitration</h3>
               <p className="font-light text-sm mb-4 leading-relaxed">
                  Any dispute arising out of or relating to these Terms or the Services shall be resolved by binding individual arbitration administered by the American Arbitration Association (AAA). 
               </p>
               <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
                  <li>Arbitration shall be conducted in <strong>Los Angeles County, California</strong>.</li>
                  <li>The arbitrator shall apply California law.</li>
                  <li>The decision shall be final and binding.</li>
               </ul>
            </div>
            <p className="text-gray-500 font-light text-sm">
               <strong>Small Claims Exception:</strong> Either party may bring an individual claim in CA small claims court if within jurisdictional limits.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Section 15 - Class Action Waiver */}
          <section id="s15" className="scroll-mt-32">
            <span className="block font-serif text-champagne text-lg mb-2">15</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-6">Class Action Waiver</h2>
            <div className="bg-red-50 border-l-4 border-red-900 p-6">
               <p className="text-red-900 text-sm font-medium uppercase tracking-wide leading-relaxed">
                  YOU WAIVE ANY RIGHT TO BRING OR PARTICIPATE IN A CLASS ACTION, CLASS ARBITRATION, PRIVATE ATTORNEY GENERAL ACTION, OR ANY OTHER REPRESENTATIVE PROCEEDING AGAINST AMERISTAR SCHOOL.
               </p>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 16 */}
          <section id="s16" className="scroll-mt-32">
            <span className="block font-serif text-champagne text-lg mb-2">16</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-6">Governing Law</h2>
            <p className="text-gray-500 font-light">
               These Terms shall be governed by the laws of the <strong>State of California</strong>. You consent to exclusive jurisdiction in the state and federal courts located in Los Angeles County, California for any matters not subject to arbitration.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Section 17 - Privacy Link */}
          <section id="s17" className="scroll-mt-32">
            <span className="block font-serif text-champagne text-lg mb-2">17</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-6">Privacy Policy & CCPA</h2>
            <div className="bg-paper border border-champagne/30 p-8 rounded-xl hover:shadow-lg transition-shadow">
               <FileText className="text-champagne mb-4" size={32} />
               <p className="text-gray-500 font-light mb-6">
                  Your rights regarding personal information, including specific rights for California residents under the CCPA/CPRA, are fully detailed in our Privacy Policy.
               </p>
               <button 
                  onClick={() => onNavigate(Page.Privacy)}
                  className="text-obsidian font-medium border-b border-black pb-1 hover:text-champagne hover:border-champagne transition-colors uppercase text-sm tracking-widest"
               >
                  Read Privacy Policy
               </button>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 18, 19 */}
          <section id="s18" className="scroll-mt-32">
            <div className="grid md:grid-cols-2 gap-12">
               <div>
                  <span className="block font-serif text-champagne text-lg mb-2">18</span>
                  <h3 className="font-serif text-2xl text-obsidian mb-4">Modifications</h3>
                  <p className="text-gray-500 font-light text-sm">
                     We reserve the right to modify these Terms at any time. Continued use of the Site constitutes acceptance of revised Terms.
                  </p>
               </div>
               <div id="s19">
                  <span className="block font-serif text-champagne text-lg mb-2">19</span>
                  <h3 className="font-serif text-2xl text-obsidian mb-4">Miscellaneous</h3>
                  <p className="text-gray-500 font-light text-sm">
                     These Terms constitute the entire agreement. If any provision is unenforceable, it shall be severed, and remaining provisions remain in effect.
                  </p>
               </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 20 - Contact */}
          <section id="s20" className="scroll-mt-32 pb-12">
            <span className="block font-serif text-champagne text-lg mb-2">20</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-8">Contact & Legal Notices</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-8 rounded-xl">
                 <h4 className="font-serif text-lg mb-4">Legal Notices</h4>
                 <p className="text-sm text-gray-500 font-light mb-2">All legal notices must be in writing.</p>
                 <ul className="text-sm text-gray-600 space-y-1">
                    <li><strong>Email:</strong> ameristarschool@yahoo.com</li>
                    <li><strong>Address:</strong> Ameristar School, P.O. Box 1143, San Gabriel, CA 91778</li>
                 </ul>
              </div>
              <div className="bg-gray-50 p-8 rounded-xl">
                 <h4 className="font-serif text-lg mb-4">General Support</h4>
                 <p className="text-sm text-gray-500 font-light mb-2">For course questions or account issues:</p>
                 <p className="text-sm text-gray-600"><strong>Phone:</strong> (626) 308-0150</p>
                 <button 
                  onClick={() => onNavigate(Page.Contact)}
                  className="mt-4 text-xs uppercase tracking-widest text-champagne font-bold"
                 >
                    Go to Contact Page
                 </button>
              </div>
            </div>
          </section>

        </main>
      </div>

      {/* Back To Top Button */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 right-8 w-12 h-12 bg-obsidian text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-500 z-50 hover:bg-champagne ${
          showBackTop ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'
        }`}
        aria-label="Back to top"
      >
        <ArrowUp size={20} />
      </button>

    </div>
  );
};

export default Terms;