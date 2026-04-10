/**
 * utils/enrollmentPDF.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates a professional enrollment application PDF using jsPDF.
 * Design matches the Ameristar School website:
 *   • Navy  #001A35 — headers, section bars, footer strip
 *   • Gold  #D4AF37 — accents, labels, dividers
 *   • White #FFFFFF — body background
 *   • Dark  #1e293b — body text (oxford)
 *
 * Usage:
 *   import { generateEnrollmentPDF } from '../utils/enrollmentPDF';
 *   const doc = generateEnrollmentPDF(formData, totals);
 *   doc.save('Ameristar-Enrollment.pdf');          // auto-download
 *   const blob = doc.output('blob');               // for FormData upload
 * ─────────────────────────────────────────────────────────────────────────────
 */

import jsPDF from 'jspdf';

// ── Brand colour constants (RGB tuples for jsPDF) ─────────────────────────────
const NAVY:  [number,number,number] = [0,   26,  53 ];
const GOLD:  [number,number,number] = [212, 175, 55 ];
const WHITE: [number,number,number] = [255, 255, 255];
const DARK:  [number,number,number] = [30,  41,  59 ];
const LIGHT: [number,number,number] = [248, 248, 248];
const MID:   [number,number,number] = [180, 180, 180];

// ── Human-readable course labels ──────────────────────────────────────────────
export const COURSE_LABELS: Record<string, string> = {
  // Insurance Pre-License
  'ins-life-health':    '12-Hr Ethics for Life & Health Insurance (52 Hrs)',
  'ins-pc':             '12-Hr Ethics for Property & Casualty Insurance (52 Hrs)',
  'ins-practice-exams': 'Practice Exams',
  // Insurance Continuing Education
  'ins-ce-principles':  'Insurance Principles (15 Hrs)',
  'ins-ce-medicare':    'Medicare, COBRA, Disability Plans (15 Hrs)',
  'ins-ce-annuity-10':  'Understanding Annuity Plans (10 Hrs)',
  'ins-ce-health':      'Health Insurance Principles (10 Hrs)',
  'ins-ce-annuity-8':   '2025 – 8-Hr Annuity Training (8 Hrs)',
  'ins-ce-ltc':         'California Long-Term Care (8 Hrs)',
  'ins-ce-ethics-1':    'Ethical Responsibilities (5 Hrs)',
  'ins-ce-ethics-2':    'Ethics: The Guide to Success (5 Hrs)',
  'ins-ce-annuity-4':   '2025 – 4-Hr Annuity Training (4 Hrs)',
  'ins-ce-aml':         'Anti-Money Laundering (4 Hrs)',
  'ins-ce-life-4':      '4-Hr Life Insurance (4 Hrs)',
  'ins-ce-variable-2':  '2-Hr Variable Life Insurance (2 Hrs)',
  // Real Estate Pre-License
  're-principles':      'Real Estate Principles (45 Hrs, Required)',
  're-practice':        'Real Estate Practice (45 Hrs, Required)',
  're-finance':         'Real Estate Finance (45 Hrs)',
  're-appraisal':       'Real Estate Appraisal (45 Hrs)',
  're-legal':           'Legal Aspects of Real Estate (45 Hrs)',
  're-property-mgmt':   'Property Management (45 Hrs)',
  're-economics':       'Real Estate Economics (45 Hrs)',
  're-practice-exams':  'Practice Exams',  // ⚠️ price unconfirmed
  // Real Estate Continuing Education
  're-ce':              '45-Hour CE Package (License Renewal)',
  // NMLS
  'nmls-20':            'NMLS 20-Hr Pre-Licensing (Required)',
  'nmls-8':             'NMLS 8-Hr Annual CE (Renewal)',
};

// ── Per-course prices — mirrors pricing constants in Enrollment.tsx ───────────
export const COURSE_PRICES: Record<string, number> = {
  // Insurance Pre-License — $150
  'ins-life-health':    150,
  'ins-pc':             150,
  'ins-practice-exams': 150,
  // Insurance CE — $50
  'ins-ce-principles':  50,
  'ins-ce-medicare':    50,
  'ins-ce-annuity-10':  50,
  'ins-ce-health':      50,
  'ins-ce-annuity-8':   50,
  'ins-ce-ltc':         50,
  'ins-ce-ethics-1':    50,
  'ins-ce-ethics-2':    50,
  'ins-ce-annuity-4':   50,
  'ins-ce-aml':         50,
  'ins-ce-life-4':      50,
  'ins-ce-variable-2':  50,
  // Real Estate Pre-License — $99
  're-principles':      99,
  're-practice':        99,
  're-finance':         99,
  're-appraisal':       99,
  're-legal':           99,
  're-property-mgmt':   99,
  're-economics':       99,
  // Real Estate Practice Exams — $150 (⚠️ unconfirmed)
  're-practice-exams':  150,
  // Real Estate CE — $285
  're-ce':              285,
  // NMLS — $100
  'nmls-20':            100,
  'nmls-8':             100,
};

// ── Human-readable payment labels ────────────────────────────────────────────
export const PAYMENT_LABELS: Record<string, string> = {
  credit: 'Credit Card',
  zelle:  'Zelle — (626) 308-0150',
};

// ── Input types ───────────────────────────────────────────────────────────────
export interface PDFFormData {
  fullName:        string;
  email:           string;
  phone:           string;
  address:         string;
  caReLicense:     string;
  caInsLicense:    string;
  nmlsId:          string;
  selectedCourses: string[];
  wantsMaterials:  boolean;
  wantsShipping:   boolean;
  paymentMethod:   string;
  signature:       string;
  date:            string;
}

export interface PDFTotals {
  courseSubtotal:    number;
  registrationFee:   number;
  materialsSubtotal: number;
  shippingSubtotal:  number;
  grandTotal:        number;
  ccFee?:            number;   // 3.5% credit card processing fee, 0 or absent if Zelle
}

// ── Main generator ────────────────────────────────────────────────────────────
export function generateEnrollmentPDF(data: PDFFormData, totals: PDFTotals): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });

  const PW  = 215.9;  // page width  (letter)
  const PH  = 279.4;  // page height (letter)
  const ML  = 18;     // margin left
  const MR  = 18;     // margin right
  const CW  = PW - ML - MR;  // content width
  let   y   = 0;      // current y cursor

  // ── Helpers ────────────────────────────────────────────────────────────────

  /** Draw the branded page header (repeated on every new page). */
  const drawPageHeader = () => {
    // Navy bar
    doc.setFillColor(...NAVY);
    doc.rect(0, 0, PW, 22, 'F');

    // School name — left
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...WHITE);
    doc.text('AMERISTAR', ML, 13);

    // "School" in gold italic — positioned flush after AMERISTAR using measured width
    const ameristarWidth = doc.getTextWidth('AMERISTAR');
    doc.setFont('helvetica', 'bolditalic');
    doc.setFontSize(13);
    doc.setTextColor(...GOLD);
    doc.text('School', ML + ameristarWidth + 1.5, 13);

    // Task 2: School address — subtle small line below school name inside header bar
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(180, 160, 100);  // muted gold — readable but not prominent
    doc.text('120 S. Del Mar Ave, Unit 1143, San Gabriel, CA 91778', ML, 19);

    // Gold divider line below bar
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.6);
    doc.line(0, 22, PW, 22);

    // Document title — right
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...WHITE);
    doc.text('ENROLLMENT APPLICATION', PW - MR, 13, { align: 'right' });

    y = 30;
  };

  // Task 4: Convert ISO date yyyy-mm-dd → mm-dd-yyyy for PDF display
  const fmtDate = (iso: string): string => {
    const parts = iso.split('-');
    if (parts.length !== 3) return iso;
    return `${parts[1]}-${parts[2]}-${parts[0]}`;
  };

  /** Draw the branded page footer. */
  const drawPageFooter = (pageNum: number, totalPages: number) => {
    // Thin gold line
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.4);
    doc.line(ML, PH - 14, PW - MR, PH - 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...MID);

    doc.text('Ameristar School  ·  Los Angeles, CA  ·  (310) 377-0337  ·  (626) 308-0150  ·  ameristarschool@yahoo.com', ML, PH - 9);
    doc.text(`Page ${pageNum} of ${totalPages}`, PW - MR, PH - 9, { align: 'right' });
    doc.text('Bureau for Private Postsecondary Education (BPPE) Approved Provider', ML, PH - 5);
  };

  /** Check if we need a new page; if so, add page and reset y. */
  const checkPage = (neededHeight: number, pageNum: { n: number }) => {
    if (y + neededHeight > PH - 20) {
      doc.addPage();
      pageNum.n++;
      drawPageHeader();
    }
  };

  /** Draw a bold navy section header bar. */
  const sectionHeader = (title: string, pageNum: { n: number }) => {
    checkPage(12, pageNum);
    doc.setFillColor(...NAVY);
    doc.rect(ML, y, CW, 9, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...WHITE);
    doc.text(title.toUpperCase(), ML + 4, y + 6);
    y += 13;
  };

  /** Draw a single label + value field with underline. */
  const field = (label: string, value: string, pageNum: { n: number }) => {
    checkPage(14, pageNum);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...GOLD);
    doc.text(label.toUpperCase(), ML, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...DARK);
    const display = value.trim() !== '' ? value : '—';
    doc.text(display, ML, y);

    doc.setDrawColor(...MID);
    doc.setLineWidth(0.3);
    doc.line(ML, y + 1.5, ML + CW, y + 1.5);
    y += 9;
  };

  /** Draw two fields side by side. */
  const fieldRow2 = (
    l1: string, v1: string,
    l2: string, v2: string,
    pageNum: { n: number }
  ) => {
    checkPage(14, pageNum);
    const half = (CW - 8) / 2;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...GOLD);
    doc.text(l1.toUpperCase(), ML, y);
    doc.text(l2.toUpperCase(), ML + half + 8, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...DARK);
    doc.text(v1.trim() !== '' ? v1 : '—', ML, y);
    doc.text(v2.trim() !== '' ? v2 : '—', ML + half + 8, y);

    doc.setDrawColor(...MID);
    doc.setLineWidth(0.3);
    doc.line(ML, y + 1.5, ML + half, y + 1.5);
    doc.line(ML + half + 8, y + 1.5, PW - MR, y + 1.5);
    y += 9;
  };

  /** Draw three fields side by side. */
  const fieldRow3 = (
    l1: string, v1: string,
    l2: string, v2: string,
    l3: string, v3: string,
    pageNum: { n: number }
  ) => {
    checkPage(14, pageNum);
    const third = (CW - 12) / 3;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...GOLD);
    doc.text(l1.toUpperCase(), ML, y);
    doc.text(l2.toUpperCase(), ML + third + 6, y);
    doc.text(l3.toUpperCase(), ML + (third + 6) * 2, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...DARK);
    doc.text(v1.trim() !== '' ? v1 : '—', ML, y);
    doc.text(v2.trim() !== '' ? v2 : '—', ML + third + 6, y);
    doc.text(v3.trim() !== '' ? v3 : '—', ML + (third + 6) * 2, y);

    doc.setDrawColor(...MID);
    doc.setLineWidth(0.3);
    doc.line(ML, y + 1.5, ML + third, y + 1.5);
    doc.line(ML + third + 6, y + 1.5, ML + (third + 6) + third, y + 1.5);
    doc.line(ML + (third + 6) * 2, y + 1.5, PW - MR, y + 1.5);
    y += 9;
  };

  /** Draw an order-summary line (label + amount, optional bold). */
  const summaryRow = (
    label: string,
    amount: number | null,
    bold: boolean,
    pageNum: { n: number }
  ) => {
    checkPage(8, pageNum);
    const displayAmt = amount !== null ? `$${amount.toFixed(2)}` : '—';

    if (bold) {
      doc.setFillColor(...NAVY);
      doc.rect(ML, y - 4, CW, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...WHITE);
      doc.text(label, ML + 4, y + 1);
      doc.text(displayAmt, PW - MR - 4, y + 1, { align: 'right' });
      y += 9;
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...DARK);
      doc.text(label, ML + 4, y + 1);
      doc.setFont('helvetica', 'bold');
      doc.text(displayAmt, PW - MR - 4, y + 1, { align: 'right' });
      doc.setDrawColor(...LIGHT);
      doc.setLineWidth(0.3);
      doc.line(ML, y + 3, PW - MR, y + 3);
      y += 7.5;
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 1
  // ═══════════════════════════════════════════════════════════════════════════
  const pageNum = { n: 1 };
  drawPageHeader();

  // ── Title block ────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...NAVY);
  doc.text('Course Enrollment Application', PW / 2, y, { align: 'center' });
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...MID);
  doc.text(`Date of Application: ${fmtDate(data.date)}`, PW / 2, y, { align: 'center' });
  y += 5;
  doc.setFontSize(7.5);
  doc.text('DRE Pre-License Sponsor #: [SPONSOR NUMBER]  ·  CE Sponsor #: [CE SPONSOR NUMBER]', PW / 2, y, { align: 'center' });
  y += 8;

  // Gold accent rule
  doc.setFillColor(...GOLD);
  doc.rect(ML, y, CW, 0.8, 'F');
  y += 8;

  // ── Section 1: Personal Information ───────────────────────────────────────
  sectionHeader('01 · Personal Information', pageNum);

  field('Full Legal Name', data.fullName, pageNum);
  fieldRow2('Email Address', data.email, 'Phone Number', data.phone, pageNum);
  field('Mailing Address', data.address, pageNum);
  y += 2;

  fieldRow3(
    'CA RE License #',  data.caReLicense  || 'N/A',
    'CA Ins License #', data.caInsLicense || 'N/A',
    'NMLS / Bio ID',    data.nmlsId       || 'N/A',
    pageNum
  );
  y += 4;

  // ── Section 2: Course Selection ────────────────────────────────────────────
  sectionHeader('02 · Course Selection', pageNum);

  // Delivery method notice — applies to all courses
  checkPage(14, pageNum);
  doc.setFillColor(235, 245, 255);  // light blue tint
  doc.rect(ML, y, CW, 11, 'F');
  doc.setDrawColor(180, 210, 240);
  doc.setLineWidth(0.3);
  doc.rect(ML, y, CW, 11, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 80, 140);
  doc.text('DELIVERY METHOD:', ML + 4, y + 4.5);
  const deliveryLabelW = doc.getTextWidth('DELIVERY METHOD:');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...DARK);
  doc.text('All pre-licensing and CE courses are non-contact, home self-study (correspondence) programs.', ML + 4 + deliveryLabelW + 2, y + 4.5);
  y += 15;

  if (data.selectedCourses.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...MID);
    doc.text('No courses selected.', ML + 4, y);
    y += 10;
  } else {
    // Groups with optional sub-headings for Pre-License / CE sections
    const groups: Array<{ heading: string; subheading?: string; ids: string[] }> = [
      {
        heading: 'Insurance Certification',
        subheading: 'Pre-License',
        ids: ['ins-life-health', 'ins-pc', 'ins-practice-exams'],
      },
      {
        heading: 'Insurance Certification',
        subheading: 'Continuing Education',
        ids: [
          'ins-ce-principles', 'ins-ce-medicare',  'ins-ce-annuity-10', 'ins-ce-health',
          'ins-ce-annuity-8',  'ins-ce-ltc',       'ins-ce-ethics-1',   'ins-ce-ethics-2',
          'ins-ce-annuity-4',  'ins-ce-aml',       'ins-ce-life-4',     'ins-ce-variable-2',
        ],
      },
      {
        heading: 'Real Estate Certification',
        subheading: 'Pre-License',
        ids: ['re-principles', 're-practice', 're-finance', 're-appraisal', 're-legal', 're-property-mgmt', 're-economics', 're-practice-exams'],
      },
      {
        heading: 'Real Estate Certification',
        subheading: 'Continuing Education',
        ids: ['re-ce'],
      },
      {
        heading: 'NMLS Certification',
        ids: ['nmls-20', 'nmls-8'],
      },
    ];

    let lastHeading = '';
    groups.forEach(group => {
      const selected = data.selectedCourses.filter(c => group.ids.includes(c));
      if (selected.length === 0) return;

      // Print main heading only when it changes
      if (group.heading !== lastHeading) {
        checkPage(10, pageNum);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(...GOLD);
        doc.text(group.heading.toUpperCase(), ML + 2, y);
        y += 5;
        lastHeading = group.heading;
      }

      // Print sub-heading if present
      if (group.subheading) {
        checkPage(7, pageNum);
        doc.setFont('helvetica', 'bolditalic');
        doc.setFontSize(7);
        doc.setTextColor(...MID);
        doc.text(group.subheading, ML + 4, y);
        y += 4.5;
      }

      // CA DRE notice — printed only for the Real Estate Pre-License group
      if (group.heading === 'Real Estate Certification' && group.subheading === 'Pre-License') {
        checkPage(18, pageNum);
        doc.setFillColor(255, 251, 235);  // warm gold tint
        doc.rect(ML + 4, y, CW - 4, 14, 'F');
        doc.setDrawColor(...GOLD);
        doc.setLineWidth(0.4);
        doc.line(ML + 4, y, ML + 4, y + 14);  // left gold accent
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...NAVY);
        doc.text('CA DRE REQUIREMENT:', ML + 7, y + 5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...DARK);
        doc.text('Each course requires a minimum study period of 18 calendar days before the final exam may be taken.', ML + 7, y + 9.5);
        doc.text('No more than two courses may be completed within any five-week period.', ML + 7, y + 13.5);
        y += 18;
      }

      selected.forEach(courseId => {
        checkPage(7, pageNum);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...DARK);
        // Bullet
        doc.setFillColor(...GOLD);
        doc.circle(ML + 6, y - 1.2, 1, 'F');
        // Course label — left
        doc.text(COURSE_LABELS[courseId] || courseId, ML + 10, y);
        // Price — right-justified
        const price = COURSE_PRICES[courseId];
        if (price !== undefined) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.text(`$${price.toFixed(2)}`, PW - MR - 2, y, { align: 'right' });
          doc.setFont('helvetica', 'normal');
        }
        // Light separator line
        doc.setDrawColor(...LIGHT);
        doc.setLineWidth(0.2);
        doc.line(ML + 10, y + 2, PW - MR, y + 2);
        y += 6.5;
      });
      y += 2;
    });
  }

  // ── Section 3: Payment Summary ─────────────────────────────────────────────
  // Force a new page if the entire section (header + summary box) won't fit.
  // Section header = ~13mm, box = 62–76mm (dynamic), bottom padding = ~6mm → 81–95mm.
  if (y + 105 > PH - 20) {
    doc.addPage();
    pageNum.n++;
    drawPageHeader();
  }
  sectionHeader('03 · Payment Summary', pageNum);

  // Light background box — height is dynamic:
  //   Base 62mm covers: top pad(4) + Courses(7.5) + Reg Fee(7.5) + gap(2) +
  //   Total(9) + divider+gap(10) + Payment label(6) + Payment value(6) + bottom(6)
  //   CC fee adds 14mm (summary row 7.5 + disclosure line 6 + rounding 0.5)
  const hasCcFee = !!(totals.ccFee && totals.ccFee > 0);
  const boxH = hasCcFee ? 76 : 62;
  checkPage(boxH + 4, pageNum);
  doc.setFillColor(...LIGHT);
  doc.rect(ML, y, CW, boxH, 'F');
  doc.setDrawColor(...MID);
  doc.setLineWidth(0.3);
  doc.rect(ML, y, CW, boxH, 'S');
  y += 4;

  summaryRow(
    `Courses (${data.selectedCourses.length})`,
    totals.courseSubtotal,
    false,
    pageNum
  );
  summaryRow('Registration Fee (Non-Refundable)', totals.registrationFee, false, pageNum);
  // Change 11: CC fee line — only renders when ccFee > 0
  if (totals.ccFee && totals.ccFee > 0) {
    summaryRow('Credit Card Processing Fee (3.5%)', totals.ccFee, false, pageNum);
  }
  y += 2;
  summaryRow('TOTAL DUE', totals.grandTotal, true, pageNum);

  // Payment Method — drawn inside the box, separated by a light rule
  y += 4;
  doc.setDrawColor(...MID);
  doc.setLineWidth(0.2);
  doc.line(ML + 4, y, PW - MR - 4, y);
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...GOLD);
  doc.text('PAYMENT METHOD', ML + 4, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...DARK);
  doc.text(PAYMENT_LABELS[data.paymentMethod] || data.paymentMethod, ML + 4, y);
  y += 6;
  // Change 10: CC fee disclosure line in PDF
  if (totals.ccFee && totals.ccFee > 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(...MID);
    doc.text('A 3.5% credit card processing fee of $' + totals.ccFee.toFixed(2) + ' has been applied to the total above.', ML + 4, y);
    y += 6;
  }
  y += 6;

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 4: Agreement & Signature
  // Flows immediately after Section 3 if space allows; breaks naturally otherwise.
  // Policy clauses are rendered one-by-one with intelligent page-break detection,
  // so the left gold accent bar and light background are drawn per-segment rather
  // than as one giant pre-sized rectangle.
  // ═══════════════════════════════════════════════════════════════════════════

  // Minimum space needed before starting §04 on the current page:
  // sectionHeader(13) + first clause heading(5) + 2 body lines(9) + gap(4) = ~31mm
  // If that doesn't fit, start a new page.
  if (y + 31 > PH - 20) {
    doc.addPage();
    pageNum.n++;
    drawPageHeader();
  }
  // Small visual gap after §03 when continuing on same page
  y += 4;

  sectionHeader('04 · Student Agreement & Signature', pageNum);

  // ── Policy clauses ──────────────────────────────────────────────────────────
  // Each clause = { heading, lines[] }
  // Rendered with:
  //   • Per-line checkPage so content wraps naturally across pages
  //   • Light LIGHT background strip drawn per-line (no pre-sized box)
  //   • Gold left accent bar drawn per-line segment
  //   • Heading in NAVY bold 7pt, body in DARK normal 7.8pt

  type PolicyClause = { heading: string; lines: string[] };

  const policyClauses: PolicyClause[] = [
    {
      heading: 'DRE COURSE APPROVAL STATEMENT',
      lines: [
        'This course is approved for pre-license education credit by the California Department',
        'of Real Estate. However, this approval does not constitute an endorsement of the views',
        'or opinions expressed by the course sponsor, instructors, authors, or lecturers.',
      ],
    },
    {
      heading: "STUDENT'S RIGHT TO CANCEL",
      lines: [
        'The student has the right to cancel this enrollment agreement and obtain a refund',
        'by providing written notice to Ameristar School, 120 S. Del Mar Ave, Unit 1143, San Gabriel, CA 91778.',
      ],
    },
    {
      heading: 'REFUND POLICY',
      lines: [
        'Cancellation must be made within seven (7) business days of the enrollment date by',
        'certified mail. All course materials must be returned. A $35.00 registration fee is',
        'non-refundable. Once the seven-day period has passed, no refund will be issued.',
        'No refunds are available after the student has passed any final examination for a course.',
      ],
    },
    {
      heading: 'STUDENT IDENTITY VERIFICATION',
      lines: [
        'Before each final examination, students must present valid government-issued photo ID',
        'to the school-appointed proctor. The school sends exam materials directly to the proctor.',
        'Students are never to handle exam materials directly.',
      ],
    },
    {
      heading: 'DELIVERY METHOD',
      lines: [
        'All pre-licensing and continuing education courses are non-contact, home self-study',
        '(correspondence) programs. No classroom attendance is required.',
      ],
    },
    {
      heading: 'CA DRE STUDY PERIOD REQUIREMENT',
      lines: [
        'Per California DRE regulations, each course requires a minimum study period of 18',
        "calendar days before the student is eligible to take that course's final examination.",
        'No more than two courses may be completed within any five-week period.',
      ],
    },
    {
      heading: 'COURSE & INSTRUCTOR EVALUATION (RE 318A)',
      lines: [
        'Students may evaluate their courses and instructors using DRE Form RE 318A,',
        'available at www.dre.ca.gov.',
      ],
    },
    {
      heading: 'COURSE PROVIDER COMPLAINTS (RE 340)',
      lines: [
        'Unresolved complaints may be submitted to the DRE using Form RE 340,',
        'available at www.dre.ca.gov.',
      ],
    },
    {
      heading: 'GOVERNING REGULATIONS (RE 307)',
      lines: [
        'Pre-license course regulations are set forth in DRE Regulation Excerpts (Form RE 307),',
        'available at www.dre.ca.gov. By enrolling, the student acknowledges review opportunity.',
      ],
    },
    {
      heading: 'TRANSFERABILITY OF CREDITS',
      lines: [
        'Transfer of credits is at the complete discretion of the receiving institution.',
      ],
    },
    {
      heading: 'STUDENT TUITION RECOVERY FUND (STRF)',
      lines: [
        "California's STRF fund protects students from economic loss due to institutional failure.",
      ],
    },
    {
      heading: 'COURSE COMPLETION & EXAMINATIONS',
      lines: [
        'Completion requires reading all text materials and passing an open-book final exam for',
        'each course. The minimum passing score is 70%. All exams must be taken under the',
        'supervision of a school-appointed proctor. If a student does not pass on the first',
        'attempt, they may retake the exam once within one year of enrollment. After two failed',
        'attempts, the student may be required to repeat the course (additional fee may apply).',
        'If the course is not completed within one year, a new enrollment will be required.',
        'A Certificate of Completion will be issued within 7 business days of passing the exam.',
        'The pass date is the official course completion date.',
      ],
    },
    {
      heading: 'QUESTIONS & GRIEVANCES',
      lines: [
        'Bureau for Private Postsecondary Education (BPPE) · www.bppe.ca.gov · (916) 574-8900',
      ],
    },
  ];

  // Heights per element (mm)
  const LINE_H    = 4.5;   // body line height
  const HEAD_H    = 5.5;   // heading row height (bold, slightly taller)
  const GAP_H     = 3;     // gap between clauses
  const PAD_L     = 5;     // text left pad inside stripe
  const STRIPE_X  = ML;    // stripe starts at left margin
  const STRIPE_W  = CW;    // stripe is full content width

  /** Draw a single horizontal stripe (background + gold left bar) at current y for rowH mm. */
  const drawStripe = (rowH: number) => {
    doc.setFillColor(...LIGHT);
    doc.rect(STRIPE_X, y - 1, STRIPE_W, rowH + 1, 'F');
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.5);
    doc.line(STRIPE_X, y - 1, STRIPE_X, y + rowH);
  };

  policyClauses.forEach((clause, clauseIdx) => {
    // ── Heading row ──
    // Check if heading + at least 1 body line fits; if not, break page first.
    const minNeeded = HEAD_H + LINE_H + 2;
    if (y + minNeeded > PH - 20) {
      doc.addPage();
      pageNum.n++;
      drawPageHeader();
    }

    drawStripe(HEAD_H);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...NAVY);
    doc.text(clause.heading, STRIPE_X + PAD_L, y + HEAD_H - 1.5);
    y += HEAD_H;

    // ── Body lines ──
    clause.lines.forEach(line => {
      if (y + LINE_H > PH - 20) {
        doc.addPage();
        pageNum.n++;
        drawPageHeader();
      }
      drawStripe(LINE_H);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      doc.setTextColor(...DARK);
      doc.text(line, STRIPE_X + PAD_L, y + LINE_H - 1.2);
      y += LINE_H;
    });

    // ── Gap between clauses (except after last) ──
    if (clauseIdx < policyClauses.length - 1) {
      y += GAP_H;
    }
  });

  y += 8;

  // Acknowledgement checkbox — gold fill + manually drawn black checkmark
  checkPage(10, pageNum);
  doc.setFillColor(...GOLD);
  doc.rect(ML, y - 3, 4, 4, 'F');
  // Draw checkmark with two line segments (unicode ✓ doesn't render in helvetica)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.7);
  doc.line(ML + 0.8, y - 0.8, ML + 1.8, y + 0.3);   // short left downstroke
  doc.line(ML + 1.8, y + 0.3, ML + 3.4, y - 2.0);   // long right upstroke
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...NAVY);
  doc.text('I have read and agree to all terms, conditions, and refund policies above.', ML + 7, y);
  y += 10;

  // Signature + Date row
  checkPage(22, pageNum);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...GOLD);
  doc.text('STUDENT SIGNATURE', ML, y);
  doc.text('DATE', ML + CW * 0.65, y);
  y += 4;

  // Signature value in serif-style italic
  doc.setFont('times', 'italic');
  doc.setFontSize(14);
  doc.setTextColor(...NAVY);
  doc.text(data.signature || '—', ML, y + 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  doc.text(fmtDate(data.date), ML + CW * 0.65, y + 3);

  // Underlines
  doc.setDrawColor(...DARK);
  doc.setLineWidth(0.4);
  doc.line(ML, y + 7, ML + CW * 0.58, y + 7);
  doc.line(ML + CW * 0.65, y + 7, PW - MR, y + 7);
  y += 16;

  // School acceptance block
  checkPage(20, pageNum);
  doc.setFillColor(...LIGHT);
  doc.rect(ML, y, CW, 16, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...GOLD);
  doc.text('SCHOOL AUTHORIZED REPRESENTATIVE', ML + 4, y + 5);
  doc.text('DATE ACCEPTED', ML + CW * 0.65, y + 5);
  doc.setDrawColor(...MID);
  doc.setLineWidth(0.3);
  doc.line(ML + 4, y + 13, ML + CW * 0.58, y + 13);
  doc.line(ML + CW * 0.65, y + 13, PW - MR - 4, y + 13);
  y += 20;

  // ── Final page footer(s) ──────────────────────────────────────────────────
  const totalPages = pageNum.n;
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawPageFooter(p, totalPages);
  }

  return doc;
}
