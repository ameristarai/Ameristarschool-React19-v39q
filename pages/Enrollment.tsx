import { useState, useEffect, useRef } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Send, CheckCircle, Loader2, AlertCircle, Info, BookOpen, Clock } from 'lucide-react';
import SEO from '../components/SEO';
import { Page } from '../types';
import { generateEnrollmentPDF } from '../utils/enrollmentPDF';

interface EnrollmentProps {
  onNavigate: (page: Page) => void;
}

interface FormData {
  fullName:        string;   // required
  email:           string;   // required
  phone:           string;   // required — 10 digits, formatted (xxx) xxx-xxxx
  address:         string;   // required — min 3 alphanumeric chars, no PO Box
  caReLicense:     string;
  caInsLicense:    string;
  nmlsId:          string;
  selectedCourses: string[];
  paymentMethod:   'credit' | 'zelle' | '';
  signature:       string;
  date:            string;
  agreedToTerms:   boolean;
}

// ── Styled checkbox card ───────────────────────────────────────────────────────
const Checkbox = ({
  label, subLabel, subLabelClassName, checked, onChange,
}: {
  label: string; subLabel?: string; subLabelClassName?: string; checked: boolean; onChange: () => void;
}) => (
  <div
    onClick={onChange}
    className={`group cursor-pointer flex items-start gap-4 p-4 rounded-xl border transition-all ${
      checked ? 'border-champagne bg-[#FFFAEB]' : 'border-gray-200 hover:border-champagne/50'
    }`}
  >
    <div className={`w-6 h-6 rounded border flex items-center justify-center shrink-0 transition-colors ${
      checked ? 'bg-champagne border-champagne' : 'border-gray-300 bg-white'
    }`}>
      {checked && <CheckCircle size={16} className="text-white" />}
    </div>
    <div>
      <p className={`text-sm font-medium ${checked ? 'text-obsidian' : 'text-gray-600'}`}>{label}</p>
      {subLabel && <p className={subLabelClassName ?? 'text-xs text-gray-400 mt-1'}>{subLabel}</p>}
    </div>
  </div>
);

const Enrollment = ({ onNavigate }: EnrollmentProps) => {

  const [formData, setFormData] = useState<FormData>({
    fullName: '', email: '', phone: '', address: '',
    caReLicense: '', caInsLicense: '', nmlsId: '',
    selectedCourses: [],
    paymentMethod: 'zelle', signature: '',
    date: new Date().toISOString().split('T')[0],
    agreedToTerms: false,
  });

  const [phoneError, setPhoneError]     = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted]       = useState(false);
  const [submitError, setSubmitError]   = useState<string | null>(null);
  // Tracks email delivery failure separately from PDF success
  const [emailWarning, setEmailWarning] = useState<boolean>(false);

  // ── Cloudflare Turnstile ──────────────────────────────────────────────────
  // turnstileRef holds the container div. widgetId lets us call reset() on
  // failed submissions so the student can retry without refreshing the page.
  // The widget is invisible to real users (Managed mode — no puzzle shown).
  // ⚠️  IMPORTANT: Replace PLACEHOLDER_SITE_KEY below with your actual
  //     Cloudflare Turnstile Site Key before deploying.
  //     Site Key is obtained from: Cloudflare Dashboard → Turnstile → your site.
  //     Secret Key goes in Netlify env vars as TURNSTILE_SECRET_KEY (not here).
  const TURNSTILE_SITE_KEY = '0x4AAAAAAC2ljG632X4yRg2V';  // ⚠️ REPLACE THIS
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef  = useRef<string | null>(null);

  useEffect(() => {
    // Render the Turnstile widget once the component mounts and the
    // Cloudflare script has loaded. The widget is invisible to real users.
    const renderWidget = () => {
      if (
        turnstileRef.current &&
        widgetIdRef.current === null &&
        typeof window !== 'undefined' &&
        (window as any).turnstile
      ) {
        widgetIdRef.current = (window as any).turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          appearance: 'interaction-only',
	  execution: 'render',
        });
      }
    };

    // Script may already be loaded, or may still be loading
    if ((window as any).turnstile && turnstileRef.current) {
    renderWidget();
    } else {
      // Poll every 50ms until BOTH the script AND the ref div are ready
      const interval = setInterval(() => {
        if ((window as any).turnstile && turnstileRef.current) {
          renderWidget();
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, []);

  // Pricing
  const COURSE_PRICE        = 100;  // Default fallback: NMLS courses
  const INS_CE_PRICE        = 50;   // Insurance Continuing Education courses
  const INS_PRELICENSE_PRICE = 150; // Insurance Pre-License courses
  const RE_PRELICENSE_PRICE = 99;   // Real Estate Pre-License courses
  const RE_CE_PRICE         = 285;  // Real Estate Continuing Education
  const REGISTRATION_FEE    = 35;

  // Course key sets — used by the reduce below to apply per-category pricing
  const INS_CE_KEYS = new Set([
    'ins-ce-principles', 'ins-ce-medicare',   'ins-ce-annuity-10', 'ins-ce-health',
    'ins-ce-annuity-8',  'ins-ce-ltc',        'ins-ce-ethics-1',   'ins-ce-ethics-2',
    'ins-ce-annuity-4',  'ins-ce-aml',        'ins-ce-life-4',     'ins-ce-variable-2',
  ]);
  const INS_PRELICENSE_KEYS = new Set(['ins-life-health', 'ins-pc', 'ins-practice-exams']);
  const RE_PRELICENSE_KEYS  = new Set(['re-principles', 're-practice', 're-finance', 're-appraisal', 're-legal', 're-property-mgmt', 're-economics']);
  const RE_CE_KEYS          = new Set(['re-ce']);
  const RE_PRACTICE_EXAMS_KEYS  = new Set(['re-practice-exams']);
  // ⚠️  RE Practice Exams price is UNCONFIRMED — update RE_PRACTICE_EXAMS_PRICE when confirmed
  const RE_PRACTICE_EXAMS_PRICE = 150;

  const courseCount    = formData.selectedCourses.length;
  const courseSubtotal = formData.selectedCourses.reduce((sum, key) => {
    if (INS_CE_KEYS.has(key))              return sum + INS_CE_PRICE;
    if (INS_PRELICENSE_KEYS.has(key))      return sum + INS_PRELICENSE_PRICE;
    if (RE_PRELICENSE_KEYS.has(key))       return sum + RE_PRELICENSE_PRICE;
    if (RE_CE_KEYS.has(key))              return sum + RE_CE_PRICE;
    if (RE_PRACTICE_EXAMS_KEYS.has(key))  return sum + RE_PRACTICE_EXAMS_PRICE;
    return sum + COURSE_PRICE;  // NMLS courses
  }, 0);
  const grandTotal = courseSubtotal + REGISTRATION_FEE;

  const toggleCourse = (courseName: string) => {
    setFormData(prev => {
      const exists = prev.selectedCourses.includes(courseName);
      return {
        ...prev,
        selectedCourses: exists
          ? prev.selectedCourses.filter(c => c !== courseName)
          : [...prev.selectedCourses, courseName],
      };
    });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Phone: 10-digit enforcement + auto-format to (xxx) xxx-xxxx
  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/[a-zA-Z]/.test(val)) {
      setPhoneError('Please enter numbers only');
      setFormData(prev => ({ ...prev, phone: val }));
      return;
    }
    const digits = val.replace(/\D/g, '');
    if (digits.length > 10) {
      setPhoneError('Please enter exactly 10 digits');
      setFormData(prev => ({ ...prev, phone: val }));
      return;
    }
    setPhoneError(null);
    if (digits.length === 10) {
      const formatted = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
      setFormData(prev => ({ ...prev, phone: formatted }));
    } else {
      setFormData(prev => ({ ...prev, phone: val }));
    }
  };

  const handlePhoneBlur = () => {
    const digits = formData.phone.replace(/\D/g, '');
    if (digits.length > 0 && digits.length !== 10) {
      setPhoneError('Please enter exactly 10 digits');
    }
  };

  const handlePhoneClick = () => {
    if (phoneError) {
      setFormData(prev => ({ ...prev, phone: '' }));
      setPhoneError(null);
    }
  };

  // Address: min 3 alphanumeric chars, no PO Box
  const PO_BOX_PATTERN = /^\s*p\.?\s*o\.?\s*(box|b\.?\s*o\.?\s*x\.?)\b/i;

  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, address: val }));
    if (val.trim().length === 0) {
      setAddressError(null); // Show hint via isSubmitEnabled instead
    } else if (PO_BOX_PATTERN.test(val)) {
      setAddressError('Please enter a valid home address. No PO Box or forwards.');
    } else if (val.replace(/[^a-zA-Z0-9]/g, '').length < 3) {
      setAddressError('Please enter a valid home address. No PO Box or forwards.');
    } else {
      setAddressError(null);
    }
  };

  const handleAddressBlur = () => {
    const val = formData.address;
    if (val.trim().length === 0) {
      setAddressError('Please enter a valid home address. No PO Box or forwards.');
    } else if (PO_BOX_PATTERN.test(val)) {
      setAddressError('Please enter a valid home address. No PO Box or forwards.');
    } else if (val.replace(/[^a-zA-Z0-9]/g, '').length < 3) {
      setAddressError('Please enter a valid home address. No PO Box or forwards.');
    }
  };

  const phoneDigits  = formData.phone.replace(/\D/g, '');
  const phoneIsValid = phoneDigits.length === 10 && !phoneError;

  const emailIsValid = formData.email.trim() !== '' && formData.email.includes('@');

  const addressIsValid =
    formData.address.trim().length > 0 &&
    formData.address.replace(/[^a-zA-Z0-9]/g, '').length >= 3 &&
    !PO_BOX_PATTERN.test(formData.address) &&
    !addressError;

  const isSubmitEnabled =
    formData.fullName.trim()        !== '' &&
    emailIsValid                           &&
    phoneIsValid                           &&
    addressIsValid                         &&
    formData.selectedCourses.length  > 0  &&
    formData.paymentMethod          !== '' &&
    formData.agreedToTerms                 &&
    formData.signature.trim()       !== '';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isSubmitEnabled) return;
    setIsSubmitting(true);
    setSubmitError(null);
    setEmailWarning(false);

    // ── Step 1: Generate PDF ──────────────────────────────────────────────────
    // PDF generation is synchronous and happens entirely in the browser.
    // It cannot be affected by Gmail or network issues. We run it first so
    // the student always gets their copy regardless of what happens next.
    let doc;
    let fileName: string;
    let pdfBase64: string;

    try {
      const ccFeeForPDF = formData.paymentMethod === 'credit'
        ? parseFloat(((courseSubtotal + REGISTRATION_FEE) * 0.035).toFixed(2))
        : 0;
      const grandTotalForPDF = courseSubtotal + REGISTRATION_FEE + ccFeeForPDF;

      doc = generateEnrollmentPDF(
        {
          fullName: formData.fullName, email: formData.email, phone: formData.phone,
          address: formData.address, caReLicense: formData.caReLicense,
          caInsLicense: formData.caInsLicense, nmlsId: formData.nmlsId,
          selectedCourses: formData.selectedCourses, wantsMaterials: false,
          wantsShipping: false, paymentMethod: formData.paymentMethod,
          signature: formData.signature, date: formData.date,
        },
        { courseSubtotal, registrationFee: REGISTRATION_FEE, materialsSubtotal: 0, shippingSubtotal: 0, grandTotal: grandTotalForPDF, ccFee: ccFeeForPDF }
      );

      // Task 3: filename format → Ameristar-<mm-dd-yyyy>-<first-name>.pdf
      const [yyyy, mm, dd] = formData.date.split('-');
      const dateStr  = `${mm}-${dd}-${yyyy}`;
      const firstName = formData.fullName.trim().split(/\s+/)[0];
      fileName = `Ameristar-${dateStr}-${firstName}.pdf`;
      doc.save(fileName);  // ← student download — always succeeds

      // jsPDF returns a Data URI like: "data:application/pdf;base64,JVBERi0..."
      const pdfDataUri = doc.output('datauristring');
      pdfBase64 = pdfDataUri.split(',')[1] || '';

    } catch (pdfErr) {
      // PDF generation itself failed — very rare (memory/browser issue).
      // Reset Turnstile so the student can retry without refreshing the page.
      if (widgetIdRef.current !== null && (window as any).turnstile) {
        (window as any).turnstile.reset(widgetIdRef.current);
      }
      setSubmitError('Could not generate your PDF. Please try again or contact us directly.');
      setIsSubmitting(false);
      return;
    }

    // ── Step 2: Email the PDF to the school ───────────────────────────────────
    // This step is intentionally decoupled from Step 1.
    // If email fails, the student still sees the success screen (PDF downloaded)
    // but with a prominent warning telling them to contact the school directly.
    let emailDelivered = false;
    try {
      const response = await fetch('/.netlify/functions/send-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfBase64,
          fileName,
          studentName: formData.fullName,
          studentEmail: formData.email || '',
          // Turnstile token — the backend verifies this server-side.
          // Empty string when TURNSTILE_SITE_KEY is still a placeholder
          // (backend skips verification if TURNSTILE_SECRET_KEY is not set).
          turnstileToken: (widgetIdRef.current !== null && (window as any).turnstile)
            ? (window as any).turnstile.getResponse(widgetIdRef.current)
            : '',
        }),
      });

      if (response.ok) {
        emailDelivered = true;
      } else {
        // Log for debugging but don't surface raw server errors to the student
        let errMsg = 'Email delivery failed';
        try {
          const errData = await response.json();
          errMsg = errData?.error || errData?.message || errMsg;
        } catch { /* non-JSON body — ignore */ }
        console.warn('send-application non-OK response:', response.status, errMsg);
      }
    } catch (networkErr) {
      // Fetch itself failed — network down, function crashed, timeout
      console.warn('send-application fetch error:', networkErr);
    }

    // ── Step 3: Navigate to success screen ────────────────────────────────────
    // Always show success (PDF was downloaded). If email failed, show warning.
    if (!emailDelivered) {
      setEmailWarning(true);
    }
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsSubmitting(false);
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 flex items-center justify-center">
        <SEO title="Enrollment Complete" description="Thank you for enrolling with Ameristar School." />
        <div className="max-w-2xl w-full bg-white p-12 rounded-3xl shadow-2xl border border-champagne/20 text-center space-y-8 animate-fade-in-up">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="font-serif text-4xl text-obsidian">Application Received</h1>

          {/* Email warning — shown when PDF downloaded but school email failed */}
          {emailWarning ? (
            <div className="w-full p-5 bg-amber-50 border border-amber-200 rounded-2xl text-left space-y-2 animate-fade-in">
              <p className="text-amber-900 font-semibold text-sm flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                Action Required — Please Send Your PDF Directly
              </p>
              <p className="text-amber-800 text-sm font-light leading-relaxed">
                Your enrollment form has been saved and <strong>downloaded to your device</strong> as a PDF.
                However, we were unable to automatically deliver it to our admissions team due to a temporary
                server issue. <strong>Please email your downloaded PDF directly to us</strong> so we can
                process your application without delay.
              </p>
              <div className="pt-1 flex flex-col sm:flex-row gap-2">
                <a
                  href="mailto:ameristarschool@yahoo.com"
                  className="inline-flex items-center gap-2 bg-amber-700 text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-amber-800 transition-colors"
                >
                  Email Us Now
                </a>
                <a
                  href="tel:6263080150"
                  className="inline-flex items-center gap-2 border border-amber-400 text-amber-800 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-amber-100 transition-colors"
                >
                  Call (626) 308-0150
                </a>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 font-light text-lg leading-relaxed">
              Thank you, <strong>{formData.fullName}</strong>. Your enrollment application has been submitted
              and a PDF copy has downloaded to your device.
              <br /><br />
              Our admissions team will contact you within 24 hours to finalize your registration and payment.
            </p>
          )}

          <button
            onClick={() => onNavigate(Page.Home)}
            className="inline-block bg-obsidian text-white px-8 py-3 rounded-full uppercase tracking-widest text-xs font-bold hover:bg-champagne transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="w-full pt-24 pb-24">
      <SEO
        title="Student Enrollment"
        description="Enroll in Ameristar School's CA Real Estate and Insurance licensing courses."
        keywords="enroll, CA real estate license, CA insurance license, Ameristar School enrollment"
      />
      <div className="max-w-4xl mx-auto px-6 md:px-12">

        <div className="text-center mb-16 space-y-4">
          <p className="text-champagne uppercase tracking-widest text-sm font-semibold">Begin Your Journey</p>
          <h1 className="font-serif text-4xl md:text-5xl text-obsidian">Course Enrollment</h1>
          <p className="text-gray-400 font-light max-w-lg mx-auto">
            Please complete the form below to begin your licensure journey. All fields are secure and confidential.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-16 animate-fade-in">

          {/* Section 01 — Personal Information */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xs border border-gray-100">
            <h2 className="font-serif text-2xl text-obsidian mb-2 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-champagne/10 text-champagne text-sm font-bold flex items-center justify-center font-sans">01</span>
              Personal Information
            </h2>
	    <p className="text-xs text-gray-400 mb-8 ml-11">
              All contact information fields are required.
            </p>
           
            <div className="grid md:grid-cols-2 gap-8">
              {/* Full Legal Name — REQUIRED */}
              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                  Full Legal Name <span className="text-champagne">*</span>
                </label>
                <input
                  type="text" name="fullName" required
                  value={formData.fullName} onChange={handleInputChange}
                  className="w-full bg-gray-50 border-b border-gray-200 p-3 focus:outline-hidden focus:border-champagne transition-colors"
                  placeholder="As it appears on ID"
                />
              </div>

              {/* Email — REQUIRED */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                  Email Address <span className="text-champagne">*</span>
                </label>
                <input
                  type="email" name="email" required
                  value={formData.email} onChange={handleInputChange}
                  className="w-full bg-gray-50 border-b border-gray-200 p-3 focus:outline-hidden focus:border-champagne transition-colors"
                  placeholder="email@example.com"
                />
              </div>

              {/* Phone — REQUIRED, 10-digit enforced */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                  Phone Number <span className="text-champagne">*</span>
                </label>
                <input
                  type="tel" name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  onBlur={handlePhoneBlur}
                  onClick={handlePhoneClick}
                  className={`w-full bg-gray-50 border-b p-3 focus:outline-hidden transition-colors ${
                    phoneError
                      ? 'border-red-400 text-red-600 focus:border-red-400'
                      : 'border-gray-200 focus:border-champagne'
                  }`}
                  placeholder="(888) 888-8888"
                />
                {phoneError && (
                  <p className="text-red-500 text-xs mt-2 animate-fade-in font-medium">{phoneError}</p>
                )}
              </div>

              {/* Mailing Address — REQUIRED, min 3 alphanumeric, no PO Box */}
              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                  Mailing Address <span className="text-champagne">*</span>
                </label>
                <input
                  type="text" name="address" required
                  value={formData.address}
                  onChange={handleAddressChange}
                  onBlur={handleAddressBlur}
                  className={`w-full bg-gray-50 border-b p-3 focus:outline-hidden transition-colors ${
                    addressError
                      ? 'border-red-400 text-red-600 focus:border-red-400'
                      : 'border-gray-200 focus:border-champagne'
                  }`}
                  placeholder="Street, City, State, Zip"
                />
                {addressError && (
                  <p className="text-red-500 text-xs mt-2 animate-fade-in font-medium">{addressError}</p>
                )}
              </div>

              {/* Optional license numbers */}
              <div className="md:col-span-2 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-4 italic">Optional: Provide only if applicable for CE credits.</p>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">CA RE License #</label>
                    <input type="text" name="caReLicense" value={formData.caReLicense} onChange={handleInputChange}
                      className="w-full bg-transparent border-b border-gray-200 py-2 text-sm focus:outline-hidden focus:border-champagne" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">CA Insurance License #</label>
                    <input type="text" name="caInsLicense" value={formData.caInsLicense} onChange={handleInputChange}
                      className="w-full bg-transparent border-b border-gray-200 py-2 text-sm focus:outline-hidden focus:border-champagne" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">NMLS / Bio ID</label>
                    <input type="text" name="nmlsId" value={formData.nmlsId} onChange={handleInputChange}
                      className="w-full bg-transparent border-b border-gray-200 py-2 text-sm focus:outline-hidden focus:border-champagne" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 02 — Course Selection */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xs border border-gray-100">
            <h2 className="font-serif text-2xl text-obsidian mb-2 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-champagne/10 text-champagne text-sm font-bold flex items-center justify-center font-sans">02</span>
              Course Selection
            </h2>
            <p className="text-xs text-gray-400 mb-6 ml-11">Select at least one course to continue.</p>

            {/* Delivery method notice — applies to all courses */}
            <div className="flex items-start gap-3 ml-11 mb-8 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100">
              <BookOpen size={15} className="text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 leading-relaxed">
                <span className="font-semibold">Correspondence Program:</span> All pre-licensing and continuing education courses are non-contact, home self-study programs.
              </p>
            </div>

            <div className="space-y-12">

              {/* ── Insurance Certification ───────────────────────────── */}
              <div>
                <h3 className="text-sm font-bold text-oxford uppercase tracking-widest border-b border-gray-100 pb-2 mb-6">Insurance Certification</h3>
                <div className="space-y-6">

                  {/* Pre-License */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-1 h-4 bg-champagne rounded-full shrink-0"></span>
                      <p className="text-xs font-semibold text-champagne uppercase tracking-widest">Pre-License</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 pl-4">
                      <Checkbox label="12-Hr Ethics for Life & Health Insurance" subLabel="52h ($150)"
                        checked={formData.selectedCourses.includes('ins-life-health')} onChange={() => toggleCourse('ins-life-health')} />
                      <Checkbox label="12-Hr Ethics for Property & Casualty Insurance" subLabel="52h ($150)"
                        checked={formData.selectedCourses.includes('ins-pc')} onChange={() => toggleCourse('ins-pc')} />
                      <Checkbox label="Practice Exams" subLabel="($150)"
                        checked={formData.selectedCourses.includes('ins-practice-exams')} onChange={() => toggleCourse('ins-practice-exams')} />
                    </div>
                  </div>

                  {/* Continuing Education */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-1 h-4 bg-champagne rounded-full shrink-0"></span>
                      <p className="text-xs font-semibold text-champagne uppercase tracking-widest">Continuing Education</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 pl-4">
                      <Checkbox label="Insurance Principles" subLabel="15h ($50)"
                        checked={formData.selectedCourses.includes('ins-ce-principles')} onChange={() => toggleCourse('ins-ce-principles')} />
                      <Checkbox label="Medicare, COBRA, Disability Plans" subLabel="15h ($50)"
                        checked={formData.selectedCourses.includes('ins-ce-medicare')} onChange={() => toggleCourse('ins-ce-medicare')} />
                      <Checkbox label="Understanding Annuity Plans" subLabel="10h ($50)"
                        checked={formData.selectedCourses.includes('ins-ce-annuity-10')} onChange={() => toggleCourse('ins-ce-annuity-10')} />
                      <Checkbox label="Health Insurance Principles" subLabel="10h ($50)"
                        checked={formData.selectedCourses.includes('ins-ce-health')} onChange={() => toggleCourse('ins-ce-health')} />
                      <Checkbox label="2025 – 8-Hr Annuity Training" subLabel="8h ($50)"
                        checked={formData.selectedCourses.includes('ins-ce-annuity-8')} onChange={() => toggleCourse('ins-ce-annuity-8')} />
                      <Checkbox label="California Long-Term Care" subLabel="8h ($50)"
                        checked={formData.selectedCourses.includes('ins-ce-ltc')} onChange={() => toggleCourse('ins-ce-ltc')} />
                      <Checkbox label="Ethical Responsibilities" subLabel="5h ($50)"
                        checked={formData.selectedCourses.includes('ins-ce-ethics-1')} onChange={() => toggleCourse('ins-ce-ethics-1')} />
                      <Checkbox label="Ethics: The Guide to Success" subLabel="5h ($50)"
                        checked={formData.selectedCourses.includes('ins-ce-ethics-2')} onChange={() => toggleCourse('ins-ce-ethics-2')} />
                      <Checkbox label="2025 – 4-Hr Annuity Training" subLabel="4h ($50)"
                        checked={formData.selectedCourses.includes('ins-ce-annuity-4')} onChange={() => toggleCourse('ins-ce-annuity-4')} />
                      <Checkbox label="Anti-Money Laundering" subLabel="4h ($50)"
                        checked={formData.selectedCourses.includes('ins-ce-aml')} onChange={() => toggleCourse('ins-ce-aml')} />
                      <Checkbox label="4-Hr Life Insurance" subLabel="4h ($50)"
                        checked={formData.selectedCourses.includes('ins-ce-life-4')} onChange={() => toggleCourse('ins-ce-life-4')} />
                      <Checkbox label="2-Hr Variable Life Insurance" subLabel="2h ($50)"
                        checked={formData.selectedCourses.includes('ins-ce-variable-2')} onChange={() => toggleCourse('ins-ce-variable-2')} />
                    </div>
                  </div>

                </div>
              </div>

              {/* ── Real Estate Certification ─────────────────────────── */}
              <div>
                <h3 className="text-sm font-bold text-oxford uppercase tracking-widest border-b border-gray-100 pb-2 mb-6">Real Estate Certification</h3>
                <div className="space-y-6">

                  {/* Pre-License */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-1 h-4 bg-champagne rounded-full shrink-0"></span>
                      <p className="text-xs font-semibold text-champagne uppercase tracking-widest">Pre-License</p>
                    </div>

                    {/* CA DRE study-period notice */}
                    <div className="flex items-start gap-3 mb-4 pl-4 pr-2 py-3 rounded-xl bg-champagne/8 border border-champagne/25">
                      <Clock size={15} className="text-champagne shrink-0 mt-0.5" />
                      <p className="text-xs text-obsidian/70 leading-relaxed">
                        <span className="font-semibold text-obsidian">CA DRE Requirement:</span> Each course requires a minimum study period of <span className="font-semibold">18 calendar days</span> before you are eligible to sit for that course's final examination. No more than <span className="font-semibold">two courses</span> may be completed within any five-week period.
                      </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 pl-4">
                      <Checkbox label="Real Estate Principles (Required)" subLabel="45h ($99)"
                        checked={formData.selectedCourses.includes('re-principles')} onChange={() => toggleCourse('re-principles')} />
                      <Checkbox label="Real Estate Practice (Required)" subLabel="45h ($99)"
                        checked={formData.selectedCourses.includes('re-practice')} onChange={() => toggleCourse('re-practice')} />
                      <Checkbox label="Real Estate Finance" subLabel="45h ($99)"
                        checked={formData.selectedCourses.includes('re-finance')} onChange={() => toggleCourse('re-finance')} />
                      <Checkbox label="Real Estate Appraisal" subLabel="45h ($99)"
                        checked={formData.selectedCourses.includes('re-appraisal')} onChange={() => toggleCourse('re-appraisal')} />
                      <Checkbox label="Legal Aspects of Real Estate" subLabel="45h ($99)"
                        checked={formData.selectedCourses.includes('re-legal')} onChange={() => toggleCourse('re-legal')} />
                      <Checkbox label="Property Management" subLabel="45h ($99)"
                        checked={formData.selectedCourses.includes('re-property-mgmt')} onChange={() => toggleCourse('re-property-mgmt')} />
                      <Checkbox label="Real Estate Economics" subLabel="45h ($99)"
                        checked={formData.selectedCourses.includes('re-economics')} onChange={() => toggleCourse('re-economics')} />
                      <Checkbox label="Practice Exams" subLabel="($150)"
                        subLabelClassName="text-xs text-gray-400 mt-1"
                        checked={formData.selectedCourses.includes('re-practice-exams')} onChange={() => toggleCourse('re-practice-exams')} />
                    </div>
                  </div>

                  {/* Continuing Education */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-1 h-4 bg-champagne rounded-full shrink-0"></span>
                      <p className="text-xs font-semibold text-champagne uppercase tracking-widest">Continuing Education</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 pl-4">
                      <Checkbox label="45-Hour CE Package" subLabel="License Renewal ($285)"
                        checked={formData.selectedCourses.includes('re-ce')} onChange={() => toggleCourse('re-ce')} />
                    </div>
                    {/* Change 17: Alert when 45-Hour CE Package is selected */}
                    {formData.selectedCourses.includes('re-ce') && (
                      <div className="mt-4 flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 animate-fade-in">
                        <Info size={15} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-amber-800 mb-1">Action Required — Separate Exam Form Needed</p>
                          <p className="text-xs text-amber-700 leading-relaxed">
                            Completing this enrollment form is <strong>not sufficient</strong> for the DRE 45-Hour CE Package. You must also complete and submit the{' '}
                            <strong>DRE Final Exam Application</strong> (wet signature required) available on our{' '}
                            <a
                              href="/dre-exam-application.pdf"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline font-semibold hover:text-amber-900 transition-colors"
                            >
                              DRE Final Exam Application
                            </a>.
                            Fill in your name, address, phone number, then sign and date. Your proctor will handle submission.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* ── NMLS Certification ────────────────────────────────── */}
              <div>
                <h3 className="text-sm font-bold text-oxford uppercase tracking-widest border-b border-gray-100 pb-2 mb-6">NMLS Certification</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Checkbox label="20-Hr Pre-Licensing" subLabel="Required · 20h ($100)"
                    checked={formData.selectedCourses.includes('nmls-20')} onChange={() => toggleCourse('nmls-20')} />
                  <Checkbox label="8-Hr Annual CE" subLabel="Renewal · 8h ($100)"
                    checked={formData.selectedCourses.includes('nmls-8')} onChange={() => toggleCourse('nmls-8')} />
                </div>
              </div>

            </div>
          </div>

          {/* Section 03 — Payment */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xs border border-gray-100">
            <h2 className="font-serif text-2xl text-obsidian mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-champagne/10 text-champagne text-sm font-bold flex items-center justify-center font-sans">03</span>
              Payment Method
            </h2>
            {/* Change 11: CC fee computed inline — only applies when credit is selected */}
            {(() => {
              const CC_FEE_RATE = 0.035;
              const ccFee = formData.paymentMethod === 'credit'
                ? parseFloat(((courseSubtotal + REGISTRATION_FEE) * CC_FEE_RATE).toFixed(2))
                : 0;
              const finalTotal = courseSubtotal + REGISTRATION_FEE + ccFee;
              return (
                <div className="bg-gray-50 p-6 rounded-xl mb-8 border border-gray-200 space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <div>
                      <p className="font-bold text-obsidian">Courses</p>
                      <p className="text-xs text-gray-500">{courseCount} selected · prices vary per course</p>
                    </div>
                    <p className="font-serif text-lg text-obsidian">${courseSubtotal.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <div>
                      <p className="font-bold text-obsidian">Registration Fee</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Non-Refundable</p>
                    </div>
                    <p className="font-serif text-lg text-obsidian">${REGISTRATION_FEE.toFixed(2)}</p>
                  </div>
                  {/* Change 11: Credit card fee line — only shows when credit is selected */}
                  {formData.paymentMethod === 'credit' && (
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200 animate-fade-in">
                      <div>
                        <p className="font-bold text-obsidian">Credit Card Processing Fee</p>
                        <p className="text-xs text-gray-500">3.5% of subtotal</p>
                      </div>
                      <p className="font-serif text-lg text-obsidian">${ccFee.toFixed(2)}</p>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <p className="font-bold text-xl text-obsidian">Total Due</p>
                    <p className="font-serif text-3xl text-champagne font-bold">${finalTotal.toFixed(2)}</p>
                  </div>
                </div>
              );
            })()}
            <p className="text-sm text-gray-500 mb-6">Select your preferred payment method. A detailed invoice will be sent upon submission.</p>
            {/* Change 8: Zelle left, Credit Card right */}
            <div className="grid grid-cols-2 gap-4">
              {(['Zelle', 'Credit Card'] as const).map((method) => {
                const key = method.toLowerCase().split(' ')[0] as FormData['paymentMethod'];
                return (
                  <div key={method}
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: key }))}
                    className={`cursor-pointer p-4 rounded-xl border text-center transition-all ${
                      formData.paymentMethod === key
                        ? 'border-champagne bg-champagne/10 text-obsidian font-bold shadow-md'
                        : 'border-gray-200 text-gray-400 hover:border-gray-300'
                    }`}>
                    {method}
                  </div>
                );
              })}
            </div>
            {formData.paymentMethod === 'zelle' && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-900 text-sm animate-fade-in">
                <strong>Zelle Payee:</strong> (626) 308-0150 &nbsp;—&nbsp; Please include your full name and date of application submission in the memo line.
              </div>
            )}
            {/* Change 10: Credit card disclaimer */}
            {formData.paymentMethod === 'credit' && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-sm animate-fade-in space-y-1">
                <p><strong>Credit Card Payment:</strong> Please contact Ameristar School at <strong>(626) 308-0150</strong> to complete your credit card payment after submitting this application.</p>
                <p className="text-xs text-amber-700">A 3.5% credit card processing fee has been added to your total above.</p>
              </div>
            )}
          </div>

          {/* Section 04 — Agreement */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xs border border-gray-100">
            <h2 className="font-serif text-2xl text-obsidian mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-champagne/10 text-champagne text-sm font-bold flex items-center justify-center font-sans">04</span>
              Agreement &amp; Policies
            </h2>
            <div className="h-80 overflow-y-auto bg-gray-50 p-6 rounded-xl border border-gray-200 text-xs text-gray-600 space-y-6 mb-8">

              {/* DRE Disclaimer — mandatory exact language */}
              <div className="p-3 bg-white border border-gray-200 rounded-lg">
                <h4 className="font-bold uppercase text-obsidian text-sm border-b border-gray-200 pb-2 mb-2">DRE Course Approval Statement</h4>
                <p className="italic">This course is approved for pre-license education credit by the California Department of Real Estate. However, this approval does not constitute an endorsement of the views or opinions which are expressed by the course sponsor, instructors, authors, or lecturers.</p>
                <p className="mt-2 text-gray-400">DRE Sponsor #: <span className="font-semibold text-obsidian">S0684</span></p>
              </div>

              <h4 className="font-bold uppercase text-obsidian text-sm border-b border-gray-200 pb-2">Student's Right to Cancel</h4>
              <p>The student has the right to cancel this enrollment agreement and obtain a refund by providing written notice to: Shirley Miao, Director, Ameristar School, 120 S. Del Mar Ave, Unit 1143, San Gabriel, CA 91778.</p>

              <h4 className="font-bold uppercase text-obsidian text-sm border-b border-gray-200 pb-2">Refund Policy</h4>
              <p>The total cost of the courses, including textbooks and course materials, is based on the selection above. The student will be allowed one year from the date of this Agreement to complete these courses.</p>
              <p>In the event the student wishes to cancel their enrollment, the student must notify the school by certified mail within seven (7) business days of the enrollment date. Upon return of all course materials to the school, the student will be entitled to a refund of all tuition moneys paid, less a $35.00 registration and processing fee. Once the seven-day refund period has passed, no refund will be allowed. No refunds are available after the student has passed any final examination for a course.</p>
              <p><strong>Rejection of Applicant:</strong> If an applicant is rejected for enrollment by the institution, a full refund of all tuition monies paid will be made.</p>
              <p><strong>Program Cancellation:</strong> If the institution cancels or discontinues a course or educational program, the institution will make a full refund of all charges.</p>

              <h4 className="font-bold uppercase text-obsidian text-sm border-b border-gray-200 pb-2">Student Identity Verification</h4>
              <p>Before sitting for any final examination, students must present one of the following forms of valid government-issued photo identification to the school-appointed proctor: (a) a valid California Driver's License or ID card, (b) any valid government-issued photo ID, or (c) current identification from a recognized real estate trade organization (issued within the past five years) bearing a photograph, signature, and ID number. The proctor is responsible for verifying identity and administering the exam. Students are not to handle exam materials — the school sends exam materials directly to the proctor, and the proctor returns the completed exam to the school.</p>

              <h4 className="font-bold uppercase text-obsidian text-sm border-b border-gray-200 pb-2">Course Completion &amp; Examinations</h4>
              <p>Successful completion requires reading all text materials and passing an open‑book final examination for each course. The minimum passing score for each final exam is 70%.</p>
              <p>All final exams must be taken under the supervision of a proctor appointed by the school. Students will be allowed adequate time to complete each exam. If a student does not pass a final exam on the first attempt, the student may review the course materials and retake the exam one additional time within one year from the date of enrollment.</p>
              <p>If a student does not pass the final exam after two attempts, the student may be required to repeat the course, and an additional fee may be charged. If the student does not successfully complete the course within one year of enrollment, the school's obligation is fulfilled and a new enrollment (with applicable fees) will be required to continue. A Certificate of Completion will be issued within 7 business days after the student passes the final exam. The date on which the student passes the final exam is the official course completion date.</p>

              <h4 className="font-bold uppercase text-obsidian text-sm border-b border-gray-200 pb-2">Course &amp; Instructor Evaluation</h4>
              <p>Students are encouraged to evaluate their courses and instructors using the DRE Course and Instructor Evaluation form (RE 318A), available at <a href="https://www.dre.ca.gov/files/pdf/forms/re318a.pdf" target="_blank" rel="noopener noreferrer" className="underline text-obsidian hover:text-champagne">www.dre.ca.gov</a>.</p>

              <h4 className="font-bold uppercase text-obsidian text-sm border-b border-gray-200 pb-2">Course Provider Complaints</h4>
              <p>If a student has a complaint that the school has not resolved satisfactorily, the student may submit a Course Provider Complaint using DRE Form RE 340, available at <a href="https://www.dre.ca.gov/files/pdf/forms/re340.pdf" target="_blank" rel="noopener noreferrer" className="underline text-obsidian hover:text-champagne">www.dre.ca.gov</a>.</p>

              <h4 className="font-bold uppercase text-obsidian text-sm border-b border-gray-200 pb-2">Governing Regulations (Form RE 307)</h4>
              <p>The regulations governing this private vocational school's pre-license courses are set forth in the DRE Regulation Excerpts (Form RE 307), available at <a href="https://www.dre.ca.gov/files/pdf/forms/re307.pdf" target="_blank" rel="noopener noreferrer" className="underline text-obsidian hover:text-champagne">www.dre.ca.gov</a>. By enrolling, the student acknowledges having been given the opportunity to review these regulations.</p>

              <h4 className="font-bold uppercase text-obsidian text-sm border-b border-gray-200 pb-2">Transferability of Credits</h4>
              <p>The transferability of credits you earn at Ameristar School is at the complete discretion of the institution to which you may seek to transfer.</p>

              <h4 className="font-bold uppercase text-obsidian text-sm border-b border-gray-200 pb-2">Student Tuition Recovery Fund (STRF)</h4>
              <p>The State of California established the Student Tuition Recovery Fund (STRF) to relieve or mitigate economic loss suffered by a student enrolled in a qualifying institution who is a California resident and suffered an economic loss as a result of the failure of the educational institution to perform its obligations under the enrollment agreement.</p>

              <h4 className="font-bold uppercase text-obsidian text-sm border-b border-gray-200 pb-2">Questions &amp; Grievances</h4>
              <p>Any questions or problems not satisfactorily resolved by the school should be directed to the Bureau for Private Postsecondary Education, P.O. Box 980818, West Sacramento, CA 95798-0818 · www.bppe.ca.gov · (916) 574-8900.</p>
            </div>
            <div className="flex items-start gap-4 p-4 border border-champagne/30 bg-champagne/5 rounded-xl mb-8">
              <input type="checkbox" id="agreement" className="mt-1 w-5 h-5 accent-champagne"
                checked={formData.agreedToTerms}
                onChange={(e) => setFormData(prev => ({ ...prev, agreedToTerms: e.target.checked }))} />
              <label htmlFor="agreement" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
                <strong>I acknowledge that I have read and agree to the school's refund policy, completion requirements, and terms of service.</strong> I understand I may cancel this enrollment within 7 business days of signing for a full refund minus the $35 registration fee. By typing my name in the 'Student Signature' field, I acknowledge that this digital signature is the legal equivalent of my manual, handwritten signature, and I intend for it to be legally binding upon me.
              </label>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Student Signature (Type Full Name)</label>
                <input type="text" name="signature"
                  value={formData.signature} onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-300 py-2 font-serif italic text-xl focus:outline-hidden focus:border-champagne"
                  placeholder="Sign here..." />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Date</label>
                <input type="date" name="date" value={formData.date} disabled
                  className="w-full bg-transparent border-b border-gray-300 py-2 text-gray-500" />
              </div>
            </div>
          </div>

          {/* ── Bot protection elements ────────────────────────────────────────
               Honeypot: hidden input invisible to humans. Bots fill it in;
               the backend silently discards those submissions.
               Turnstile: invisible widget div — Cloudflare handles verification
               without showing a puzzle to real users.
          ────────────────────────────────────────────────────────────────── */}
          <input
            type="text"
            name="company"
            autoComplete="off"
            tabIndex={-1}
            aria-hidden="true"
            style={{ display: 'none' }}
          />
          <div ref={turnstileRef} />

          {/* Submit bar */}
          <div className="flex flex-col items-center gap-4 pt-4">

            {/* Submission error banner */}
            {submitError && (
              <div className="w-full p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800 animate-fade-in">
                <strong>Submission failed:</strong> {submitError}
                <br />
                <span className="text-xs mt-1 block">
                  Please try again or contact us at{' '}
                  <a href="mailto:ameristarschool@yahoo.com" className="underline">ameristarschool@yahoo.com</a>
                  {' '}or <a href="tel:6263080150" className="underline">(626) 308-0150</a>.
                </span>
              </div>
            )}

            {/* Validation hints — disappear one by one as each condition is met */}
            {!isSubmitEnabled && (
              <div className="text-sm text-gray-400 space-y-1 text-center">
                {formData.fullName.trim() === '' && (
                  <p className="flex items-center gap-1 justify-center">
                    <AlertCircle size={14} /> Enter your name
                  </p>
                )}
                {!emailIsValid && (
                  <p className="flex items-center gap-1 justify-center">
                    <AlertCircle size={14} /> Enter a valid email address
                  </p>
                )}
                {!phoneIsValid && (
                  <p className="flex items-center gap-1 justify-center">
                    <AlertCircle size={14} /> Enter your direct phone number
                  </p>
                )}
                {!addressIsValid && (
                  <p className="flex items-center gap-1 justify-center">
                    <AlertCircle size={14} /> Enter a valid mailing address
                  </p>
                )}
                {formData.selectedCourses.length === 0 && (
                  <p className="flex items-center gap-1 justify-center">
                    <AlertCircle size={14} /> Select at least one course
                  </p>
                )}
                {!formData.paymentMethod && (
                  <p className="flex items-center gap-1 justify-center">
                    <AlertCircle size={14} /> Choose a payment method
                  </p>
                )}
                {!formData.agreedToTerms && (
                  <p className="flex items-center gap-1 justify-center">
                    <AlertCircle size={14} /> Acknowledge the agreement
                  </p>
                )}
                {!formData.signature.trim() && (
                  <p className="flex items-center gap-1 justify-center">
                    <AlertCircle size={14} /> Provide your signature
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !isSubmitEnabled}
              className="bg-obsidian text-white px-12 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-champagne transition-all shadow-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3"
            >
              {isSubmitting
                ? <><Loader2 className="animate-spin" size={18} /> Processing...</>
                : <><Send size={18} /> Submit Application</>
              }
            </button>

            <p className="text-xs text-gray-400 text-center">
              By submitting, you agree to receive administrative communications from Ameristar School.
              <br />A PDF copy of your application will download automatically to your device.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Enrollment;
