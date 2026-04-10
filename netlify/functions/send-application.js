import nodemailer from 'nodemailer';

// ── Existing: CORS allowed origins for local dev ──────────────────────────────
const LOCAL_ALLOWED_ORIGINS = new Set([
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8888', // netlify dev default
]);

// ── Existing: CORS header builder ─────────────────────────────────────────────
function buildCorsHeaders(origin) {
  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
    'Content-Type': 'application/json; charset=utf-8',
  };
  // If Origin is missing (server-to-server/curl), don't block.
  if (!origin) return headers;

  headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

// ── Existing: dynamic origin validator ───────────────────────────────────────
function isOriginAllowed(origin, host) {
  // If a browser calls this, Origin will be present. If it's missing, it's not a browser CORS context.
  if (!origin) return true;

  // Same-origin requests from the current deployed host (covers custom domains + *.netlify.app + deploy previews)
  if (host && (origin === `https://${host}` || origin === `http://${host}`)) return true;

  // Local dev origins
  if (LOCAL_ALLOWED_ORIGINS.has(origin)) return true;

  // Optional allowlist via env var (comma-separated)
  const envAllow = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  if (envAllow.includes(origin)) return true;

  return false;
}

// ── Existing: base64 → PDF buffer with signature validation ──────────────────
function toPdfBuffer(pdfBase64) {
  if (!pdfBase64 || typeof pdfBase64 !== 'string') return null;

  // Accept either raw base64 or a full data URI
  const raw = pdfBase64.includes(',') ? pdfBase64.split(',').pop() : pdfBase64;
  const buf = Buffer.from(raw || '', 'base64');

  // Basic PDF signature check: "%PDF-"
  if (buf.length < 5) return null;
  const sig = buf.slice(0, 5).toString('utf8');
  if (sig !== '%PDF-') return null;

  return buf;
}

// ── NEW: Input sanitizer — strips < > to block HTML/script injection ──────────
// Applied only to freeform text fields (studentName).
// NOT applied to studentEmail — we validate format separately.
// NOT applied to pdfBase64/fileName — they have their own dedicated validators.
function sanitize(str = '') {
  return String(str).replace(/[<>]/g, '').trim();
}

// ── NEW: Email format validator ───────────────────────────────────────────────
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── NEW: In-memory rate limiter — 5 submissions per IP per minute ─────────────
// Note: resets on Netlify cold starts (serverless limitation).
// Provides meaningful protection against casual/scripted abuse.
const rateLimitMap = new Map();
const RATE_LIMIT  = 5;          // max requests
const RATE_WINDOW = 60 * 1000;  // 1 minute in ms

function isRateLimited(ip) {
  const now   = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, time: now };

  // Reset window if expired
  if (now - entry.time > RATE_WINDOW) {
    rateLimitMap.set(ip, { count: 1, time: now });
    return false;
  }

  if (entry.count >= RATE_LIMIT) return true;

  entry.count++;
  rateLimitMap.set(ip, entry);
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HANDLER
// All existing functionality preserved exactly. Security additions are
// additive only — they run before the existing logic and return early on
// abuse. The PDF attachment flow, env vars, and email sending are untouched.
// ─────────────────────────────────────────────────────────────────────────────
export const handler = async (event) => {
  const origin     = event.headers?.origin || event.headers?.Origin || '';
  const host       = event.headers?.host || '';
  const corsHeaders = buildCorsHeaders(origin);

  // ── Existing: origin check ──────────────────────────────────────────────
  if (!isOriginAllowed(origin, host)) {
    return {
      statusCode: 403,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Forbidden: Invalid Origin' }),
    };
  }

  // ── Existing: OPTIONS preflight ─────────────────────────────────────────
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  // ── Existing: method check ──────────────────────────────────────────────
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // ── NEW: Rate limiting — checked before body parsing to block early ──────
  const ip = event.headers?.['x-forwarded-for']?.split(',')[0].trim()
          || event.headers?.['client-ip']
          || 'unknown';

  if (isRateLimited(ip)) {
    return {
      statusCode: 429,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Too many requests. Please wait a moment and try again.' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');

    // ── NEW: Honeypot — bots fill hidden fields; real users never see them ─
    // A hidden `company` field in the form (name="company", tab-index -1,
    // aria-hidden) is invisible to humans. If it's populated, it's a bot.
    // Return 200 silently so bots don't know they were blocked.
    if (body.company) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Application sent successfully.' }),
      };
    }

    // ── Existing: extract expected fields from body ──────────────────────
    const { pdfBase64, studentEmail, studentName, fileName } = body;

    // ── NEW: Sanitize studentName — strips < > to prevent HTML injection ──
    // This is a display-only field used in the email subject line.
    const safeStudentName = sanitize(studentName || '');

    // ── NEW: Validate studentEmail format if provided ─────────────────────
    // studentEmail is optional (used as Reply-To only), so we only validate
    // if it's present. We don't reject the submission if it's missing —
    // the PDF itself contains the student's email.
    if (studentEmail && !isValidEmail(studentEmail)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid email format.' }),
      };
    }

    // ── Existing: PDF validation ─────────────────────────────────────────
    const pdfBuffer = toPdfBuffer(pdfBase64);
    if (!pdfBuffer) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid or missing PDF data.' }),
      };
    }

    // ── NEW: Turnstile bot verification — opt-in via env var ─────────────
    // Only active if TURNSTILE_SECRET_KEY is set in Netlify environment.
    // If the env var is absent, this block is skipped entirely.
    //
    // Token is OPTIONAL: if absent or expired (tokens expire after 300 seconds,
    // a real risk on a long enrollment form), we log and fall through. The
    // honeypot + rate limiter already cover bot abuse. Only a present token
    // that actively fails Cloudflare verification is hard-rejected.
    if (process.env.TURNSTILE_SECRET_KEY) {
      const token = body.turnstileToken;
      if (!token) {
        // Token missing or expired — warn in logs but do not block the student
        console.warn('Turnstile token absent or expired — skipping verification.');
      } else {
        const verify = await fetch(
          'https://challenges.cloudflare.com/turnstile/v0/siteverify',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${encodeURIComponent(token)}`,
          }
        );
        const result = await verify.json();
        if (!result.success) {
          return {
            statusCode: 403,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Bot verification failed. Please try again.' }),
          };
        }
      }
    }

    // ── Existing: env var validation ─────────────────────────────────────
    const GMAIL_USER        = process.env.GMAIL_USER;
    const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
    const DESTINATION_EMAIL  = process.env.DESTINATION_EMAIL;

    if (!GMAIL_USER || !GMAIL_APP_PASSWORD || !DESTINATION_EMAIL) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Server email settings are missing. Check Netlify environment variables.',
        }),
      };
    }

    // ── Existing: nodemailer transporter ─────────────────────────────────
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    });

    // ── Existing: safe filename for PDF attachment ────────────────────────
    const safeFilename = (typeof fileName === 'string' && fileName.trim())
      ? fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
      : 'Ameristar_Application.pdf';

    // ── Existing: reply-to from studentEmail ─────────────────────────────
    const replyTo = (typeof studentEmail === 'string' && studentEmail.includes('@'))
      ? studentEmail
      : undefined;

    // ── Existing: send email with PDF attachment ──────────────────────────
    // safeStudentName replaces raw studentName in the subject line only.
    // Everything else — PDF buffer, attachment, destination — is unchanged.
    await transporter.sendMail({
      from:    GMAIL_USER,
      to:      DESTINATION_EMAIL,
      replyTo,
      subject: `New Course Enrollment Application${safeStudentName ? ` — ${safeStudentName}` : ''}`,
      text:
        'A new enrollment application has been submitted from the website. The attached PDF contains the completed enrollment form.',
      attachments: [
        {
          filename:    safeFilename,
          content:     pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    // ── Existing: success response ────────────────────────────────────────
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Application sent successfully.' }),
    };

  } catch (err) {
    // ── Existing: safe error response ─────────────────────────────────────
    console.error('send-application error:', err);
    const debug = (process.env.DEBUG_ERRORS || '').toLowerCase() === 'true';
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: debug ? String(err?.message || err) : 'Internal Server Error',
      }),
    };
  }
};
