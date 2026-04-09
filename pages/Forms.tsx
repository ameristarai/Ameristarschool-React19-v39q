import { Download, FileText, Shield, Home, ExternalLink } from 'lucide-react';
import SEO from '../components/SEO';
import { Page } from '../types';

interface FormsProps {
  onNavigate: (page: Page) => void;
}

interface FormCard {
  id: string;
  agency: 'CA DRE' | 'CA DOI';
  title: string;
  subtitle: string;
  description: string;
  fileUrl: string;
  fileName: string;
  isExternal?: boolean;
  icon: 'home' | 'shield';
  tags: string[];
}

const forms: FormCard[] = [
  {
    id: 'doi-ce-exam',
    agency: 'CA DOI',
    title: 'CE Final Exam Form',
    subtitle: 'School Policy & Answer Sheet',
    description:
      'Required for all DOI continuing education course final examinations. Includes the student answer sheet (100 questions, A\u2013D format) and school policy acknowledgment. To be completed under proctor supervision.',
    fileUrl: '/doi-ce-exam-form.pdf',
    fileName: 'DOI_CE_Exam_Form.pdf',
    icon: 'shield',
    tags: ['Continuing Education', 'Insurance', 'CE Renewal'],
  },
  {
    id: 'dre-exam-app',
    agency: 'CA DRE',
    title: 'CE Final Exam Application',
    subtitle: 'Exam Request & Answer Sheet',
    description:
      'Used for DRE real estate final examinations. Students complete the top section before the exam; the proctor completes the administrator section below the dividing line. Includes the official DRE answer sheet (RE Form 420).',
    fileUrl: '/dre-exam-application.pdf',
    fileName: 'DRE_Exam_Application.pdf',
    icon: 'home',
    tags: ['Pre-License', 'Continuing Education', 'Salesperson', 'Broker'],
  },
  {
    id: 'dre-prelicense-exam',
    agency: 'CA DRE',
    title: 'Pre-License Final Exam Form',
    subtitle: 'School Policy & Answer Sheet',
    description:
      'Required for all DRE pre-license course final examinations. Includes the exam request form for students, proctor certification, and student answer sheet. Must be submitted by the proctor to the school upon exam completion.',
    fileUrl: '/dre-prelicense-exam-form.pdf',
    fileName: 'DRE_PreLicense_Exam_Form.pdf',
    icon: 'home',
    tags: ['Pre-License', 'Real Estate Principles', 'Real Estate Practice', 'Elective Courses'],
  },
  {
    id: 're-318a',
    agency: 'CA DRE',
    title: 'Course & Instructor Evaluation',
    subtitle: 'Form RE 318A',
    description:
      'Students enrolled in DRE-approved courses are encouraged to evaluate their courses and instructors using this official DRE form. Submissions go directly to the California Department of Real Estate and help maintain course quality standards.',
    fileUrl: 'https://www.dre.ca.gov/files/pdf/forms/re318a.pdf',
    fileName: 're318a.pdf',
    isExternal: true,
    icon: 'home',
    tags: ['Course Evaluation', 'Instructor Evaluation', 'Real Estate'],
  },
];

const AgencyBadge = ({ agency }: { agency: FormCard['agency'] }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
    agency === 'CA DRE'
      ? 'bg-oxford/10 text-oxford'
      : 'bg-champagne/15 text-champagne'
  }`}>
    {agency}
  </span>
);

const Forms = ({ onNavigate }: FormsProps) => {
  return (
    <div className="w-full min-h-screen">
      <SEO
        title="Exam Forms"
        description="Download CA DRE and CA DOI exam answer sheets and school policy forms for final examinations."
        keywords="CA DRE exam form, CA DOI exam form, real estate exam answer sheet, insurance CE exam, Ameristar School forms"
      />

      {/* Hero — matches site-wide title style */}
      <div className="w-full pt-24 pb-12 px-6 md:px-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <p className="text-champagne uppercase tracking-widest text-sm font-semibold">
            Examination Resources
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-obsidian">
            Exam Forms
          </h1>
          <p className="text-gray-400 font-light max-w-lg mx-auto leading-relaxed">
            Official answer sheets and school policy forms required for all Ameristar School final examinations. Download and bring the appropriate form to your scheduled exam.
          </p>
        </div>
      </div>

      {/* Proctor Notice */}
      <div className="px-6 md:px-12 pb-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4 py-5 px-6 bg-champagne/5 border border-champagne/15 rounded-2xl">
            <div className="w-8 h-8 rounded-full bg-champagne/15 flex items-center justify-center shrink-0 mt-0.5">
              <FileText size={14} className="text-champagne" />
            </div>
            <div>
              <p className="text-sm font-semibold text-obsidian mb-1">Proctor Instructions</p>
              <p className="text-sm text-gray-500 font-light leading-relaxed">
                All final examinations are open-book and must be administered under the supervision of a school-appointed proctor. The proctor receives exam materials directly from Ameristar School, verifies the student's government-issued photo ID, and returns completed materials to the school. Students do not handle exam materials directly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Cards */}
      <section className="py-12 px-6 md:px-12">
        <div className="max-w-4xl mx-auto space-y-6">

          {forms.map((form) => (
            <div
              key={form.id}
              className="group bg-white border border-gray-100 rounded-3xl p-8 md:p-10 shadow-xs hover:shadow-lg hover:border-champagne transition-all duration-300"
            >
              {/* Top row */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-oxford/8 flex items-center justify-center shrink-0 group-hover:bg-champagne/10 transition-colors">
                    {form.icon === 'home'
                      ? <Home size={20} className="text-oxford group-hover:text-champagne transition-colors" />
                      : <Shield size={20} className="text-oxford group-hover:text-champagne transition-colors" />
                    }
                  </div>
                  <div>
                    <div className="mb-1">
                      <AgencyBadge agency={form.agency} />
                    </div>
                    <h2 className="font-serif text-2xl text-obsidian leading-tight">{form.title}</h2>
                    <p className="text-sm text-champagne font-medium mt-0.5">{form.subtitle}</p>
                  </div>
                </div>

                {form.isExternal ? (
                  <a
                    href={form.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 bg-obsidian text-white px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-champagne transition-all shadow-md hover:shadow-lg whitespace-nowrap shrink-0 self-start sm:self-center"
                  >
                    <ExternalLink size={15} />
                    Open Form
                  </a>
                ) : (
                  <a
                    href={form.fileUrl}
                    download={form.fileName}
                    className="flex items-center gap-2.5 bg-obsidian text-white px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-champagne transition-all shadow-md hover:shadow-lg whitespace-nowrap shrink-0 self-start sm:self-center"
                  >
                    <Download size={15} />
                    Download PDF
                  </a>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-500 font-light leading-relaxed text-sm mb-5">
                {form.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {form.tags.map(tag => (
                  <span key={tag} className="text-[10px] uppercase tracking-wide text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Bottom row */}
              <div className="pt-5 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400 font-light">
                  {form.isExternal ? 'Opens on the CA DRE website.' : 'PDF opens in your browser or downloads directly.'}
                </p>
                {form.isExternal ? (
                  <a
                    href={form.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-champagne transition-colors"
                  >
                    <ExternalLink size={11} />
                    dre.ca.gov
                  </a>
                ) : (
                  <a
                    href={form.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-champagne transition-colors"
                  >
                    <ExternalLink size={11} />
                    Open in browser
                  </a>
                )}
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-12 px-6 md:px-12 border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-sm font-semibold text-obsidian mb-1">Ready to enroll?</p>
            <p className="text-sm text-gray-500 font-light">
              Complete your course enrollment to receive your exam materials and proctor assignment.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigate(Page.Enrollment)}
              className="flex items-center gap-2 bg-obsidian text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-champagne transition-all"
            >
              Enroll Now
            </button>
            <button
              onClick={() => onNavigate(Page.Contact)}
              className="flex items-center gap-2 border border-gray-200 text-obsidian px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:border-champagne hover:text-champagne transition-all"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Forms;
