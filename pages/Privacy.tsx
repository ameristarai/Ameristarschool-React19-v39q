import { useEffect, useState } from 'react';
import { ArrowUp, ChevronRight, Lock } from 'lucide-react';
import SEO from '../components/SEO';

// Define sections outside component to maintain stable reference
const sections = [
  { id: 's1', label: 'About This Policy' },
  { id: 's2', label: 'Information We Collect' },
  { id: 's3', label: 'How We Use Information' },
  { id: 's4', label: 'Payment Transactions' },
  { id: 's5', label: 'Cookies & Tracking' },
  { id: 's6', label: 'Information Sharing' },
  { id: 's7', label: 'Data Retention' },
  { id: 's8', label: 'Data Security' },
  { id: 's9', label: 'Third-Party Links' },
  { id: 's10', label: 'CCPA / CPRA Rights' },
  { id: 's11', label: 'Children\'s Privacy' },
  { id: 's12', label: 'Limitation of Liability' },
  { id: 's13', label: 'Governing Law' },
  { id: 's14', label: 'Policy Changes' },
  { id: 's15', label: 'Contact Us' },
];

const Privacy = () => {
  const [activeSection, setActiveSection] = useState<string>('s1');
  const [showBackTop, setShowBackTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show/Hide Back to top
      setShowBackTop(window.scrollY > 500);

      // Determine active section
      const sectionElements = sections.map(s => document.getElementById(s.id));
      
      // Find the first section that is actively in view (top 40% of screen)
      const current = sectionElements.find(section => {
        if (!section) return false;
        const rect = section.getBoundingClientRect();
        return rect.top >= 0 && rect.top <= window.innerHeight * 0.4;
      });

      if (current) {
        setActiveSection(current.id);
      } else {
        // Fallback: Check if we are past a section
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
  }, []); // Stable dependency

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      // Offset for fixed header
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
        title="Privacy Policy"
        description="Ameristar School Privacy Policy. Information on data collection, usage, CCPA rights, and compliance for CA Real Estate and Insurance students."
      />

      {/* Header */}
      <section className="bg-oxford text-white pt-20 pb-24 px-6 md:px-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
        <div className="relative z-10 max-w-4xl mx-auto space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 text-champagne uppercase tracking-widest text-xs font-semibold mb-2">
            <Lock size={14} /> Legal & Compliance
          </div>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl">Privacy Policy</h1>
          <div className="w-12 h-px bg-champagne mx-auto"></div>
          <p className="text-gray-400 font-light text-sm tracking-wide">
            Effective Date: {currentDate} &nbsp;·&nbsp; Last Revised: {currentDate}
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
                Questions about your data?
              </p>
              <a href="mailto:ameristarschool@yahoo.com" className="text-sm font-serif text-obsidian hover:text-champagne transition-colors border-b border-gray-200 hover:border-champagne pb-0.5">
                ameristarschool@yahoo.com
              </a>
            </div>
          </div>
        </aside>

        {/* Legal Text Content */}
        <main className="md:col-span-9 lg:col-span-8 lg:col-start-5 space-y-16 animate-fade-in">
          
          <div className="bg-champagne/10 border-l-4 border-champagne p-6 md:p-8 rounded-r-lg">
            <p className="text-obsidian text-sm md:text-base leading-relaxed">
              <strong>Important Notice:</strong> This Privacy Policy applies to all visitors, users, registrants, and purchasers of Ameristar School's online educational programs. By accessing or using our website, you acknowledge that you have read, understood, and agree to be bound by this Policy. <strong>California residents have additional rights under the CCPA/CPRA — please see Section 10.</strong>
            </p>
          </div>

          {/* Section 1 */}
          <section id="s1" className="scroll-mt-32">
            <span className="block font-serif text-champagne text-lg mb-2">01</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-6">About This Policy</h2>
            <div className="prose prose-lg text-gray-500 font-light leading-relaxed">
              <p className="mb-4">
                Ameristar School ("Ameristar School," "we," "our," or "us") operates an online educational platform offering pre-licensing courses, continuing education (CE) programs, and study materials to individuals preparing for California Department of Real Estate (DRE) and California Department of Insurance (DOI) licensing examinations.
              </p>
              <p className="mb-4">
                This Privacy Policy describes the types of information we may collect from you, how we collect it, how we use it, under what circumstances we may share it, and what rights you have with respect to your personal information.
              </p>
              <div className="bg-oxford text-white p-6 rounded-lg mt-8 relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="text-champagne text-xs uppercase tracking-widest font-bold mb-3">Our Core Commitment</h4>
                  <p className="text-sm text-gray-300">
                    Ameristar School is committed to handling your personal information responsibly, transparently, and only to the extent necessary to provide you with a seamless educational experience. We do not sell, rent, or trade your personal information.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 2 */}
          <section id="s2" className="scroll-mt-32">
            <span className="block font-serif text-champagne text-lg mb-2">02</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-6">Information We Collect</h2>
            <div className="space-y-8 text-gray-500 font-light">
              <div>
                <h3 className="text-obsidian font-medium uppercase text-xs tracking-widest mb-4">A. Information You Provide Directly</h3>
                <ul className="space-y-3 pl-4 border-l border-gray-200">
                  <li className="pl-4"><strong className="text-gray-700 font-normal">Identity & Contact Data:</strong> Name, mailing address, email, and phone number provided during enrollment.</li>
                  <li className="pl-4"><strong className="text-gray-700 font-normal">Enrollment Data:</strong> Course selections, exam type (DRE or DOI), and completion records.</li>
                  <li className="pl-4"><strong className="text-gray-700 font-normal">Communications:</strong> Messages sent via contact forms or email support.</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-obsidian font-medium uppercase text-xs tracking-widest mb-4">B. Information Collected Automatically</h3>
                <ul className="space-y-3 pl-4 border-l border-gray-200">
                  <li className="pl-4"><strong className="text-gray-700 font-normal">Device Data:</strong> IP address, browser type, OS, and referring URLs.</li>
                  <li className="pl-4"><strong className="text-gray-700 font-normal">Usage Data:</strong> Time spent on modules, login timestamps, and progress tracking.</li>
                </ul>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 3 */}
          <section id="s3" className="scroll-mt-32">
            <span className="block font-serif text-champagne text-lg mb-2">03</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-6">How We Use Your Information</h2>
            <p className="text-gray-500 font-light mb-6">
              We use personal information only for purposes necessary, lawful, and directly related to your education:
            </p>
            <ul className="grid gap-3 text-gray-500 font-light">
              {[
                "To process enrollments and provide access to course materials.",
                "To track course completion for DRE/DOI regulatory compliance.",
                "To communicate regarding account security or policy changes.",
                "To transmit required completion certificates to state agencies.",
                "To improve our curriculum through aggregated analytics."
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <ChevronRight size={16} className="text-champagne mt-1 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <hr className="border-gray-100" />

          {/* Section 4 */}
          <section id="s4" className="scroll-mt-32">
            <span className="block font-serif text-champagne text-lg mb-2">04</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-6">Payment Transactions</h2>
            <div className="text-gray-500 font-light space-y-6">
              <p>
                Ameristar School uses qualified third-party payment processors (e.g., Stripe, PayPal, or similar PCI DSS-compliant platforms). We do not directly collect, store, or process your full credit card number or bank account credentials on our servers.
              </p>
              <div className="bg-gray-50 p-6 border border-gray-100 rounded-xl">
                <h4 className="text-obsidian font-serif text-lg mb-2">Zelle & Direct Transfers</h4>
                <p className="text-sm leading-relaxed">
                  When using Zelle, the transaction is conducted entirely through your banking institution. We do not receive your banking credentials. Any data shared is governed by the terms of Zelle and your financial institution.
                </p>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 5 */}
          <section id="s5" className="scroll-mt-32">
            <span className="block font-serif text-champagne text-lg mb-2">05</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-6">Cookies & Tracking</h2>
            <p className="text-gray-500 font-light mb-4">
              We use strictly necessary cookies to maintain your login session and functional cookies to remember your course progress. You may disable cookies in your browser, but this may impair your ability to track course completion.
            </p>
            <p className="text-gray-500 font-light">
              <strong>Global Privacy Control (GPC):</strong> In compliance with the CPRA, our site honors valid GPC signals as a request to opt-out of cross-context behavioral tracking, where applicable.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Section 6 */}
          <section id="s6" className="scroll-mt-32">
            <span className="block font-serif text-champagne text-lg mb-2">06</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-6">Information Sharing</h2>
            <p className="text-gray-500 font-light mb-6">
              <strong>We do not sell your personal information.</strong> We share data only in these limited circumstances:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 border border-gray-100 shadow-xs rounded-xl">
                <h4 className="font-serif text-xl mb-2 text-obsidian">Regulatory Bodies</h4>
                <p className="text-sm text-gray-500">
                  We are required by law to transmit course completion data to the CA Dept. of Real Estate (DRE) or CA Dept. of Insurance (DOI).
                </p>
              </div>
              <div className="bg-white p-6 border border-gray-100 shadow-xs rounded-xl">
                <h4 className="font-serif text-xl mb-2 text-obsidian">Service Providers</h4>
                <p className="text-sm text-gray-500">
                  Trusted vendors who assist with hosting, email delivery, or LMS management, bound by strict confidentiality agreements.
                </p>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 7 - Data Retention */}
          <section id="s7" className="scroll-mt-32">
            <span className="block font-serif text-champagne text-lg mb-2">07</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-6">Data Retention</h2>
            <ul className="space-y-4 text-gray-500 font-light">
              <li className="flex gap-4">
                <span className="font-mono text-champagne text-sm min-w-[4rem]">3 Years</span>
                <span>Account & Enrollment Data (or as required by DRE/DOI regulations).</span>
              </li>
              <li className="flex gap-4">
                <span className="font-mono text-champagne text-sm min-w-[4rem]">4 Years</span>
                <span>Course Completion & CE Records (for audit compliance).</span>
              </li>
              <li className="flex gap-4">
                <span className="font-mono text-champagne text-sm min-w-[4rem]">7 Years</span>
                <span>Transaction confirmation records for tax/accounting purposes.</span>
              </li>
            </ul>
          </section>

          <hr className="border-gray-100" />

          {/* Section 8 - Security */}
          <section id="s8" className="scroll-mt-32">
            <span className="block font-serif text-champagne text-lg mb-2">08</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-6">Data Security</h2>
            <p className="text-gray-500 font-light mb-4">
              We implement TLS/SSL encryption for data in transit and use secure password hashing (bcrypt or equivalent). Access to personal data is restricted to authorized personnel only.
            </p>
            <p className="text-xs text-gray-400">
              Disclaimer: No method of electronic transmission is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Section 9 - Third Party */}
          <section id="s9" className="scroll-mt-32">
            <span className="block font-serif text-champagne text-lg mb-2">09</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-6">Third-Party Links</h2>
            <p className="text-gray-500 font-light">
              Our site may link to external sites (e.g., DRE, DOI, exam schedulers). We are not responsible for the privacy practices of these third parties. Please review their policies before submitting personal data.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Section 10 - CCPA */}
          <section id="s10" className="scroll-mt-32">
            <span className="block font-serif text-champagne text-lg mb-2">10</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-6">CCPA & CPRA Rights (CA)</h2>
            <p className="text-gray-500 font-light mb-8">
              California residents have specific rights under the CCPA and CPRA.
            </p>
            
            <div className="overflow-hidden rounded-xl border border-gray-200 mb-8">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-oxford text-white uppercase tracking-wider text-xs">
                  <tr>
                    <th className="p-4 font-medium">Right</th>
                    <th className="p-4 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="bg-white">
                    <td className="p-4 font-semibold text-obsidian whitespace-nowrap">Right to Know</td>
                    <td className="p-4">Request disclosure of data categories, sources, and purposes.</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-4 font-semibold text-obsidian whitespace-nowrap">Right to Delete</td>
                    <td className="p-4">Request deletion of your data (subject to legal exceptions).</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-4 font-semibold text-obsidian whitespace-nowrap">Right to Correct</td>
                    <td className="p-4">Request correction of inaccurate personal information.</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-4 font-semibold text-obsidian whitespace-nowrap">Non-Discrimination</td>
                    <td className="p-4">We will not deny services or charge different rates for exercising rights.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-champagne/10 p-6 rounded-xl">
              <h4 className="font-serif text-lg text-obsidian mb-2">Exercising Your Rights</h4>
              <p className="text-gray-600 text-sm mb-4">
                To submit a verifiable consumer request, please email us with the subject line "California Privacy Rights Request".
              </p>
              <a href="mailto:ameristarschool@yahoo.com" className="text-obsidian font-medium border-b border-black pb-0.5 hover:text-champagne hover:border-champagne transition-colors">
                ameristarschool@yahoo.com
              </a>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 11 - Children */}
          <section id="s11" className="scroll-mt-32">
            <span className="block font-serif text-champagne text-lg mb-2">11</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-6">Children's Privacy</h2>
            <p className="text-gray-500 font-light">
              Our services are intended for adults (18+) preparing for professional licensure. We do not knowingly collect data from minors. If you believe we have inadvertently collected data from a minor, please contact us immediately for deletion.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Section 12 - Liability - Updated to remove Educational Disclaimer which belongs in Terms */}
          <section id="s12" className="scroll-mt-32">
            <span className="block font-serif text-champagne text-lg mb-2">12</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-6">Limitation of Liability</h2>
            <div className="text-gray-500 font-light space-y-4">
              <p>
                <strong>Privacy Liability:</strong> To the fullest extent permitted by law, our liability related to a privacy breach shall be limited to the amount paid for the service in the preceding 12 months.
              </p>
              <p className="text-sm italic">
                Note: Disclaimers regarding educational outcomes, exam passage, and product performance are governed by our Terms of Use.
              </p>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 13 & 14 - Updated to defer to Terms arbitration */}
          <section id="s13" className="scroll-mt-32">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <span className="block font-serif text-champagne text-lg mb-2">13</span>
                <h3 className="font-serif text-2xl text-obsidian mb-4">Governing Law</h3>
                <p className="text-gray-500 font-light text-sm">
                  This Policy is governed by the laws of the <strong>State of California</strong>. Any disputes arising under or related to this Policy shall be resolved in accordance with the Dispute Resolution and Binding Arbitration procedures set forth in our Terms of Use.
                </p>
              </div>
              <div id="s14">
                <span className="block font-serif text-champagne text-lg mb-2">14</span>
                <h3 className="font-serif text-2xl text-obsidian mb-4">Policy Changes</h3>
                <p className="text-gray-500 font-light text-sm">
                  We reserve the right to modify this Policy at any time. Material changes will be notified via our website or email. Continued use constitutes acceptance.
                </p>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 15 - Contact */}
          <section id="s15" className="scroll-mt-32 pb-12">
            <span className="block font-serif text-champagne text-lg mb-2">15</span>
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-8">Contact Us</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 border border-gray-200 rounded-xl hover:border-champagne transition-colors group">
                <h4 className="uppercase text-xs font-bold tracking-widest text-champagne mb-4">Privacy Inquiries</h4>
                <a href="mailto:ameristarschool@yahoo.com" className="text-sm text-gray-600 group-hover:text-obsidian break-all">
                  ameristarschool@yahoo.com
                </a>
              </div>
              <div className="p-6 border border-gray-200 rounded-xl hover:border-champagne transition-colors group">
                <h4 className="uppercase text-xs font-bold tracking-widest text-champagne mb-4">General Support</h4>
                <a href="mailto:ameristarschool@yahoo.com" className="text-sm text-gray-600 group-hover:text-obsidian break-all">
                  ameristarschool@yahoo.com
                </a>
              </div>
              <div className="p-6 border border-gray-200 rounded-xl hover:border-champagne transition-colors">
                <h4 className="uppercase text-xs font-bold tracking-widest text-champagne mb-4">Mailing Address</h4>
                <p className="text-sm text-gray-600">
                  Ameristar School<br />
                  Los Angeles, California
                </p>
              </div>
            </div>
            
            <p className="mt-12 text-xs text-gray-400">
              You also have the right to file a complaint with the California Privacy Protection Agency (CPPA) at cppa.ca.gov if you believe your rights have been violated.
            </p>
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

export default Privacy;