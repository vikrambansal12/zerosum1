// Zerosum backend API: sends contact-form emails (SendGrid) and serves the
// admin-managed product catalog (Postgres via ./db.js) that the static
// frontend in ../frontend/ fetches over HTTP.
//
// Crash-resilience policy: a production deploy should never go fully down
// because one request hit an edge case. Every route either can't throw
// (plain sync code Express itself catches) or is wrapped below; the two
// process-level handlers at the bottom of this file are the last resort so
// that even a truly unexpected error is logged and survived rather than
// killing the whole process (and therefore the static site + admin panel
// + API all at once, since they're all served from this one process).
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dns = require('dns');
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const products = require('./db');

// Force IPv4 DNS resolution (fixes ENETUNREACH on some networks)
dns.setDefaultResultOrder('ipv4first');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust one hop of X-Forwarded-For (e.g. the localtunnel/ngrok proxy in front
// of this server when exposed publicly) so rate limiting and req.ip see the
// real visitor's address instead of every request looking like it's from the
// tunnel itself. Safe locally too -- with no proxy in front there's no
// X-Forwarded-For header to trust, so this is a no-op.
app.set('trust proxy', 1);

// ============================================================
// 1. SECURITY MIDDLEWARE
// ============================================================

// Helmet — sets secure HTTP headers (XSS protection, HSTS, no-sniff, etc.).
// CSP is disabled because this server also serves the static mirrored site
// below, which loads third-party scripts (Google Tag Manager, ads) that
// helmet's default 'self'-only script-src would otherwise block.
app.use(helmet({ contentSecurityPolicy: false }));

// Disable X-Powered-By header (hides Express fingerprint)
app.disable('x-powered-by');

// CORS — only allow specified origins
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS: Origin not allowed'), false);
  },
  methods: ['POST', 'GET', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Bypass-Tunnel-Reminder'],
  maxAge: 86400 // Cache preflight for 24 hours
}));

// Body parser with size limit (prevents payload overflow attacks)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// A malformed JSON body (or one over the size limit) makes body-parser throw
// a SyntaxError/PayloadTooLargeError here, before any route runs -- without
// this, it would fall through to the generic 500 handler and look like a
// server bug instead of a bad request.
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Malformed request body.' });
  }
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request body too large.' });
  }
  next(err);
});

// ============================================================
// 1b. STATIC FRONTEND (served from the same origin/tunnel as the API)
// ============================================================
// Serving the static site from this same Express app means the frontend and
// the API are same-origin when both are reached through one tunnel URL --
// so browsers never need a CORS preflight for admin requests at all. (A
// cross-origin preflight from a real browser gets intercepted by localtunnel's
// free-tier anti-abuse interstitial page instead of reaching this server,
// which silently breaks any Authorization-header request -- this sidesteps
// that entirely rather than trying to work around it.) Only this folder is
// exposed, not the whole repo (backend/.env, the SQLite DB, and source files
// must stay unreachable). The GTM script folder now lives *inside*
// frontend/ (moved there so the site is a fully self-contained
// deployable unit for static hosts like Vercel), so it's served by this same
// route automatically -- no separate static mount needed for it anymore.
// (URL path kept as /zerosumtechnologies.com for backward compatibility --
// nothing in the frontend actually references this URL prefix internally.)
app.use('/zerosumtechnologies.com', express.static(path.join(__dirname, '..', 'frontend')));

// Global rate limiter — max 60 requests/minute per IP
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' }
});
app.use(globalLimiter);

// Strict rate limiter for contact form — max 3 submissions/minute per IP
const contactLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many inquiries. Please try again in a minute.' }
});

// ============================================================
// 2. EMAIL CONFIG (SendGrid API, from environment variables)
// ============================================================
// Raw SMTP (tried against both Gmail and, before that, was going to try
// Zoho) reliably times out connecting from inside Railway's network --
// confirmed twice with Gmail specifically. SendGrid's HTTPS API (port 443)
// sidesteps that entirely. FROM_EMAIL must exactly match a address verified
// in SendGrid under Settings -> Sender Authentication -> Single Sender
// Verification (no domain/DNS access needed, just a confirmation click on
// that inbox) -- otherwise SendGrid rejects the send.
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'nishitpra333@gmail.com';
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL;

// Validate required env vars on startup
if (!SENDGRID_API_KEY || !NOTIFICATION_EMAIL) {
  console.error('❌ Missing required environment variables. Check your .env file.');
  console.error('   Required: SENDGRID_API_KEY, NOTIFICATION_EMAIL');
  process.exit(1);
}

async function sendEmail({ to, replyTo, subject, text, html }) {
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: FROM_EMAIL, name: 'Zerosum Technologies' },
      reply_to: { email: replyTo },
      subject,
      content: [
        { type: 'text/plain', value: text },
        { type: 'text/html', value: html }
      ]
    })
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`SendGrid API error (${res.status}): ${body}`);
  }
}

// ============================================================
// 3. INPUT VALIDATION & SANITIZATION
// ============================================================

// Sanitize input to prevent XSS injection
function sanitize(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Strip any HTML tags completely
function stripTags(str) {
  if (!str) return '';
  return String(str).replace(/<[^>]*>/g, '');
}

// Validate all form inputs
function validateInput(data) {
  const errors = [];

  if (!data.name || stripTags(data.name).trim().length < 2 || data.name.length > 100) {
    errors.push('Full name is required (2-100 characters)');
  }
  if (!data.company || stripTags(data.company).trim().length < 2 || data.company.length > 150) {
    errors.push('Company name is required (2-150 characters)');
  }
  if (!data.email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data.email)) {
    errors.push('Valid email address is required');
  }
  if (data.email && data.email.length > 254) {
    errors.push('Email address too long');
  }
  if (!data.phone || !/^[+\d\s\-().]{6,20}$/.test(data.phone)) {
    errors.push('Valid phone number is required (6-20 chars, digits/spaces/+/-)');
  }
  if (!data.message || stripTags(data.message).trim().length < 10 || data.message.length > 2000) {
    errors.push('Message is required (10-2000 characters)');
  }

  const inquiryTypes = ['purchase', 'collaboration'];
  if (!data.inquiryType || !inquiryTypes.includes(data.inquiryType)) {
    data.inquiryType = 'purchase';
  }

  return errors;
}

// ============================================================
// 4. ADMIN AUTH (registered accounts, hashed passwords, short-lived bearer tokens)
// ============================================================
if (!process.env.ADMIN_JWT_SECRET) {
  console.error('❌ Missing required environment variable: ADMIN_JWT_SECRET');
  process.exit(1);
}
const TOKEN_TTL_SECONDS = 24 * 60 * 60; // 24 hours

// Session tokens are signed JWTs rather than random strings kept in an
// in-memory Map -- this runs on Vercel's serverless functions, which don't
// share memory across invocations (or even guarantee the same instance
// handles the next request from the same logged-in admin), so an in-memory
// token store would make logins randomly stop working mid-session. A JWT's
// signature alone would normally make it un-revocable before its own expiry
// though, so every issued token is also recorded in Postgres by its jti (see
// db.js) -- getTokenAdminId below checks both the signature and that record.
async function issueToken(adminId) {
  const jti = crypto.randomBytes(16).toString('hex');
  const token = jwt.sign({ adminId, jti }, process.env.ADMIN_JWT_SECRET, { expiresIn: TOKEN_TTL_SECONDS });
  await products.recordSession(jti, adminId, new Date(Date.now() + TOKEN_TTL_SECONDS * 1000));
  return token;
}

// One-way hash of a password + per-account salt (scrypt), stored in the DB.
function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

// Re-hashes the given password and compares it to the stored hash using a
// constant-time comparison, so response timing can't reveal a partial match.
function verifyPassword(password, salt, expectedHash) {
  const candidate = Buffer.from(hashPassword(password, salt), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  if (candidate.length !== expected.length) return false;
  return crypto.timingSafeEqual(candidate, expected);
}

// Pulls the token out of "Authorization: Bearer <token>", or null if absent.
function getBearerToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

// Returns the adminId for a valid token in the request, or null. A valid
// signature alone isn't enough -- it only proves this server issued the
// token at some point, not that the session is still active -- so this also
// confirms the token's jti hasn't been logged-out or access-revoked in
// Postgres (see db.js's admin_sessions table).
async function getTokenAdminId(req) {
  const token = getBearerToken(req);
  if (!token) return null;
  let payload;
  try {
    payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
  } catch {
    return null; // bad signature, malformed, or naturally expired
  }
  const valid = await products.isSessionValid(payload.jti);
  return valid ? payload.adminId : null;
}

async function requireAdmin(req, res, next) {
  try {
    const adminId = await getTokenAdminId(req);
    if (!adminId) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please log in again.' });
    }
    req.adminId = adminId;
    req.tokenJti = jwt.decode(getBearerToken(req)).jti;
    next();
  } catch (err) {
    next(err);
  }
}

// Express 4 doesn't forward a rejected promise from an async route handler
// to the error-handling middleware on its own -- without this, a failed
// Postgres query (a network blip, pool exhaustion, etc.) would leave the
// request hanging until the client times out instead of getting a clean
// error response. Wrap every async route below in this.
function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Try again later.' }
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many registration attempts. Try again later.' }
});

// ============================================================
// 4b. PRODUCT IMAGE UPLOAD (multer -> Supabase Storage)
// ============================================================
// Vercel's serverless functions have no writable persistent disk (unlike
// Railway's volume) -- anything written to the filesystem in one invocation
// is gone by the next, possibly on a different instance entirely. Uploaded
// images go to Supabase Storage instead; existing images already committed
// to the repo under frontend/images/... are untouched, since those are real
// site assets served by the static site route, not admin uploads.
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.SUPABASE_STORAGE_BUCKET) {
  console.error('❌ Missing required environment variable(s): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_STORAGE_BUCKET');
  process.exit(1);
}
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const SUPABASE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET;
const SUPABASE_PUBLIC_PREFIX = `${process.env.SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/`;

// Uploads one multer in-memory file to Supabase Storage and returns its
// full public URL, which is what gets stored in the images column now
// (rather than the "uploads/..." relative path used when uploads lived on
// local disk).
async function uploadToSupabase(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
  const { error } = await supabase.storage.from(SUPABASE_BUCKET).upload(filename, file.buffer, {
    contentType: file.mimetype,
    cacheControl: '31536000'
  });
  if (error) throw error;
  return supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(filename).data.publicUrl;
}

// Deletes a previously-uploaded image given its stored value. Only acts on
// Supabase Storage URLs (admin uploads); "images/..." paths committed to the
// frontend's own git repo are left alone, since those are site assets, not
// admin uploads, and were never meant to be deletable this way. This value
// can come from admin-supplied product data via the bulk-import endpoint,
// not just server-generated upload URLs, so it's untrusted input -- hence
// the strict prefix check rather than trusting it to already be a safe key.
async function deleteStoredImage(p) {
  if (typeof p !== 'string' || !p.startsWith(SUPABASE_PUBLIC_PREFIX)) return;
  const key = p.slice(SUPABASE_PUBLIC_PREFIX.length);
  if (!key || key.includes('/')) return; // keys are always a bare filename, no nesting
  await supabase.storage.from(SUPABASE_BUCKET).remove([key]);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    // .svg intentionally excluded: SVGs can embed <script>, and browsers will
    // execute it if the file URL is opened/navigated to directly (stored XSS).
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    if (!allowed.includes(path.extname(file.originalname).toLowerCase())) {
      return cb(new Error('INVALID_FILE_TYPE'));
    }
    cb(null, true);
  }
});

// Wraps upload.array('images') so invalid files/sizes return a clean 400
// instead of an unhandled multer error falling through to a generic 500.
// Accepts up to 10 images per product in one request.
function uploadProductImages(req, res, next) {
  upload.array('images', 10)(req, res, (err) => {
    if (!err) return next();
    if (err.message === 'INVALID_FILE_TYPE') {
      return res.status(400).json({ success: false, message: 'Only JPG, PNG, WEBP, and GIF images are allowed.' });
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'Each image must be smaller than 5MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ success: false, message: 'A product can have at most 10 images.' });
    }
    return res.status(400).json({ success: false, message: 'Image upload failed.' });
  });
}

// ============================================================
// 5. ROUTES
// ============================================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    // Presence-only booleans (never the actual values) so a deploy's active
    // config can be confirmed remotely without needing platform log access.
    email: { hasSendgridKey: Boolean(SENDGRID_API_KEY), fromEmail: FROM_EMAIL }
  });
});

// Admin registration (rate-limited). Bootstrap-only: works to create the very
// first admin account when none exist yet, then closes itself permanently --
// every admin created after that must go through POST /api/admin/admins,
// which requires an already-authenticated admin.
app.post('/api/admin/register', registerLimiter, asyncHandler(async (req, res) => {
  if (await products.countAdmins() > 0) {
    return res.status(403).json({ success: false, message: 'Registration is closed. Ask an existing admin to add your account.' });
  }

  const { name, email, password } = req.body;
  if (!name || !name.trim() || name.trim().length > 100) {
    return res.status(400).json({ success: false, message: 'A valid name is required.' });
  }
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return res.status(400).json({ success: false, message: 'A valid email address is required.' });
  }
  if (!password || password.length < 8 || password.length > 200) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
  }
  if (await products.getAdminByEmail(email.trim())) {
    return res.status(409).json({ success: false, message: 'An account with that email already exists.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const admin = await products.createAdmin({
    name: name.trim(),
    email: email.trim(),
    passwordHash: hashPassword(password, salt),
    passwordSalt: salt,
    isActive: true
  });

  res.status(201).json({
    success: true,
    token: await issueToken(admin.id),
    admin: { id: admin.id, name: admin.name, email: admin.email }
  });
}));

// Admin login (rate-limited)
app.post('/api/admin/login', loginLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const genericError = { success: false, message: 'Invalid email or password.' };
  if (!email || !password) return res.status(401).json(genericError);

  const admin = await products.getAdminByEmail(email.trim());
  if (!admin || !verifyPassword(password, admin.password_salt, admin.password_hash)) {
    return res.status(401).json(genericError);
  }
  if (!admin.is_active) {
    return res.status(403).json({ success: false, message: 'Your account has been disabled by an administrator.' });
  }

  res.json({
    success: true,
    token: await issueToken(admin.id),
    admin: { id: admin.id, name: admin.name, email: admin.email }
  });
}));

// Current admin identity (used by the dashboard to confirm the token is still valid)
app.get('/api/admin/me', requireAdmin, asyncHandler(async (req, res) => {
  const admin = await products.getAdminById(req.adminId);
  if (!admin) return res.status(401).json({ success: false, message: 'Unauthorized.' });
  res.json({ success: true, admin: { id: admin.id, name: admin.name, email: admin.email } });
}));

// Admin logout — revokes the bearer token server-side
app.post('/api/admin/logout', requireAdmin, asyncHandler(async (req, res) => {
  await products.revokeSession(req.tokenJti);
  res.json({ success: true });
}));

// Admin management (requires an already-authenticated admin) -- this is the
// only way to create new admins now that public registration is closed.
app.get('/api/admin/admins', requireAdmin, asyncHandler(async (req, res) => {
  res.json({ success: true, admins: await products.listAdmins() });
}));

app.post('/api/admin/admins', requireAdmin, asyncHandler(async (req, res) => {
  const { name, email, password, isActive } = req.body;
  if (!name || !name.trim() || name.trim().length > 100) {
    return res.status(400).json({ success: false, message: 'A valid name is required.' });
  }
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return res.status(400).json({ success: false, message: 'A valid email address is required.' });
  }
  if (!password || password.length < 8 || password.length > 200) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
  }
  if (await products.getAdminByEmail(email.trim())) {
    return res.status(409).json({ success: false, message: 'An account with that email already exists.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const admin = await products.createAdmin({
    name: name.trim(),
    email: email.trim(),
    passwordHash: hashPassword(password, salt),
    passwordSalt: salt,
    isActive: isActive !== false
  });

  res.status(201).json({
    success: true,
    admin: { id: admin.id, name: admin.name, email: admin.email, is_active: admin.is_active, created_at: admin.created_at }
  });
}));

// Grant/revoke an existing admin's access without deleting the account.
app.patch('/api/admin/admins/:id/access', requireAdmin, asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.adminId && req.body.isActive === false) {
    return res.status(400).json({ success: false, message: "You can't revoke your own access." });
  }
  const admin = await products.setAdminActive(id, Boolean(req.body.isActive));
  if (!admin) return res.status(404).json({ success: false, message: 'Admin not found.' });
  if (!admin.is_active) {
    await products.revokeAllSessionsForAdmin(id);
  }
  res.json({ success: true, admin });
}));

const VALID_SECTIONS = [
  'homepage', 'skypower', 'schubeler', 'eureka-dynamics', 'dss',
  'dynotis', 'triad-rf', 'uav-navigation', 'drone-rescue', 'maxamps'
];

// Public: list products (rendered on the main site), optionally filtered by ?section=
app.get('/api/products', asyncHandler(async (req, res) => {
  const section = VALID_SECTIONS.includes(req.query.section) ? req.query.section : undefined;
  // Admin edits this catalog live; an intermediate cache (a mobile carrier's
  // data-saving proxy, for instance) serving a stale copy would silently
  // show visitors an outdated or empty product list with no way to bust it
  // from the browser side, since it isn't the browser's own cache.
  res.set('Cache-Control', 'no-store');
  res.json({ success: true, products: await products.listProducts(section) });
}));

// Public: single product detail
app.get('/api/products/:id', asyncHandler(async (req, res) => {
  const product = await products.getProduct(Number(req.params.id));
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
  res.set('Cache-Control', 'no-store');
  res.json({ success: true, product });
}));

// The admin form sends "features"/"specifications" as one item per line in
// a textarea; turn that into a clean array of non-empty strings.
function parseList(val) {
  if (!val) return [];
  return String(val).split('\n').map(s => s.trim()).filter(Boolean);
}

// Admin: bulk-import products carrying their own (already-existing) image
// paths as-is -- unlike the create route below, which only ever accepts
// images via uploaded files. Kept around (rather than one-off and deleted)
// since it's been needed more than once to restore products after the
// Railway volume unexpectedly came up empty.
// Only these two path shapes are ever legitimate: a server-generated upload
// filename, or one of the images already committed under frontend/images/.
// Anything else (an absolute path, a `..` segment, or characters that could
// break out of an HTML attribute when rendered on the public site) is
// rejected outright, since this endpoint is the one place image paths and
// slugs are accepted as raw strings instead of being server-generated.
const SAFE_IMAGE_PATH_RE = /^(uploads|images)\/[a-zA-Z0-9_\-./]+$/;
const SAFE_SLUG_RE = /^[a-z0-9-]*$/;
function isSafeImagePath(p) {
  return typeof p === 'string' && SAFE_IMAGE_PATH_RE.test(p) && !p.split('/').includes('..');
}

app.post('/api/admin/products/import', requireAdmin, asyncHandler(async (req, res) => {
  const list = Array.isArray(req.body.products) ? req.body.products : [];

  for (let i = 0; i < list.length; i++) {
    const p = list[i];
    const images = Array.isArray(p.images) ? p.images : [];
    if (!images.every(isSafeImagePath)) {
      return res.status(400).json({ success: false, message: `products[${i}].images contains an invalid path.` });
    }
    if (p.page_slug && !SAFE_SLUG_RE.test(p.page_slug)) {
      return res.status(400).json({ success: false, message: `products[${i}].page_slug is invalid.` });
    }
  }

  // Sequential, not Promise.all: each createProduct() computes its section's
  // next sort_order from the current max, so concurrent inserts into the
  // same section could race and produce duplicate/out-of-order values.
  let count = 0;
  for (const p of list) {
    await products.createProduct({
      name: (p.name || '').trim(),
      category: (p.category || '').trim(),
      description: (p.description || '').trim(),
      price: (p.price || '').trim(),
      images: Array.isArray(p.images) ? p.images : [],
      features: Array.isArray(p.features) ? p.features : [],
      specifications: Array.isArray(p.specifications) ? p.specifications : [],
      section: VALID_SECTIONS.includes(p.section) ? p.section : 'homepage',
      page_slug: p.page_slug || ''
    });
    count++;
  }
  res.status(201).json({ success: true, count });
}));

// Admin: create product
app.post('/api/admin/products', requireAdmin, uploadProductImages, asyncHandler(async (req, res) => {
  const { name, category, description, price } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Product name is required.' });
  }
  const section = VALID_SECTIONS.includes(req.body.section) ? req.body.section : 'homepage';
  const uploadedImages = await Promise.all((req.files || []).map(uploadToSupabase));
  const product = await products.createProduct({
    name: name.trim(),
    category: (category || '').trim(),
    description: (description || '').trim(),
    price: (price || '').trim(),
    images: uploadedImages,
    features: parseList(req.body.features),
    specifications: parseList(req.body.specifications),
    section
  });
  res.status(201).json({ success: true, product });
}));

// Admin: update product
app.put('/api/admin/products/:id', requireAdmin, uploadProductImages, asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const existing = await products.getProduct(id);
  if (!existing) return res.status(404).json({ success: false, message: 'Product not found.' });

  const { name, category, description, price } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Product name is required.' });
  }
  const section = VALID_SECTIONS.includes(req.body.section) ? req.body.section : existing.section;

  // The edit form sends which of the product's existing images to keep (as a
  // JSON array in `existingImages`); anything already on the product but
  // missing from that list was removed by the admin and its file is deleted.
  // Newly uploaded files are appended after the kept ones.
  let keptImages = existing.images;
  if (req.body.existingImages !== undefined) {
    try {
      const parsed = JSON.parse(req.body.existingImages);
      keptImages = Array.isArray(parsed) ? parsed.filter(p => existing.images.includes(p)) : existing.images;
    } catch {
      keptImages = existing.images;
    }
  }
  const removedImages = existing.images.filter(p => !keptImages.includes(p));
  await Promise.all(removedImages.map(deleteStoredImage));

  const uploadedImages = await Promise.all((req.files || []).map(uploadToSupabase));
  const images = [...keptImages, ...uploadedImages];

  const product = await products.updateProduct(id, {
    name: name.trim(),
    category: (category || '').trim(),
    description: (description || '').trim(),
    price: (price || '').trim(),
    images,
    features: parseList(req.body.features),
    specifications: parseList(req.body.specifications),
    section,
    page_slug: existing.page_slug
  });
  res.json({ success: true, product });
}));

// Admin: move a product up/down one place within its own section
app.post('/api/admin/products/:id/move', requireAdmin, asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!(await products.getProduct(id))) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }
  const { direction } = req.body;
  if (direction !== 'up' && direction !== 'down') {
    return res.status(400).json({ success: false, message: "direction must be 'up' or 'down'." });
  }
  const product = await products.moveProduct(id, direction);
  res.json({ success: true, product });
}));

// Admin: delete product
app.delete('/api/admin/products/:id', requireAdmin, asyncHandler(async (req, res) => {
  const deleted = await products.deleteProduct(Number(req.params.id));
  if (!deleted) return res.status(404).json({ success: false, message: 'Product not found.' });
  await Promise.all((deleted.images || []).map(deleteStoredImage)); // best-effort cleanup
  res.json({ success: true });
}));

// Contact form submission (rate-limited)
app.post('/api/contact', contactLimiter, async (req, res) => {
  try {
    const { name, company, email, phone, message, inquiryType } = req.body;

    // Validate
    const errors = validateInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }

    // Sanitize all inputs
    const safe = {
      name: sanitize(stripTags(name).trim()),
      company: sanitize(stripTags(company).trim()),
      email: sanitize(stripTags(email).trim()),
      phone: sanitize(stripTags(phone).trim()),
      message: sanitize(stripTags(message).trim()),
      type: inquiryType === 'collaboration' ? 'Collaboration' : 'Sales Inquiry',
      emoji: inquiryType === 'collaboration' ? '🤝' : '🛒'
    };

    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // Build HTML email
    const htmlEmail = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:linear-gradient(135deg,#0891b2,#2563eb);border-radius:12px 12px 0 0;padding:30px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;">⚡ Zerosum Technologies</h1>
      <p style="color:#cffafe;margin:8px 0 0;font-size:14px;">New ${safe.type} Inquiry ${safe.emoji}</p>
    </div>
    <div style="background:#fff;padding:30px;border-radius:0 0 12px 12px;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
      <div style="background:${inquiryType === 'collaboration' ? '#f0fdf4' : '#eff6ff'};border:1px solid ${inquiryType === 'collaboration' ? '#bbf7d0' : '#bfdbfe'};border-radius:8px;padding:12px 16px;margin-bottom:24px;text-align:center;">
        <span style="font-size:16px;font-weight:600;color:${inquiryType === 'collaboration' ? '#166534' : '#1e40af'};">${safe.emoji} ${safe.type}</span>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;width:140px;color:#64748b;font-size:14px;font-weight:600;vertical-align:top;">👤 Full Name</td><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#1e293b;font-size:14px;">${safe.name}</td></tr>
        <tr><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:14px;font-weight:600;vertical-align:top;">🏢 Company</td><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#1e293b;font-size:14px;">${safe.company}</td></tr>
        <tr><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:14px;font-weight:600;vertical-align:top;">📧 Email</td><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#1e293b;font-size:14px;"><a href="mailto:${safe.email}" style="color:#0891b2;text-decoration:none;">${safe.email}</a></td></tr>
        <tr><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:14px;font-weight:600;vertical-align:top;">📱 Phone</td><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#1e293b;font-size:14px;"><a href="tel:${safe.phone}" style="color:#0891b2;text-decoration:none;">${safe.phone}</a></td></tr>
      </table>
      <div style="margin-top:24px;">
        <h3 style="color:#1e293b;font-size:14px;margin:0 0 8px;font-weight:600;">💬 Message / Requirements</h3>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;color:#334155;font-size:14px;line-height:1.6;white-space:pre-wrap;">${safe.message}</div>
      </div>
      <div style="margin-top:24px;padding-top:16px;border-top:1px solid #f1f5f9;text-align:center;">
        <p style="color:#94a3b8;font-size:12px;margin:0;">📅 Received on ${timestamp} (IST)</p>
      </div>
    </div>
    <div style="text-align:center;padding:20px;color:#94a3b8;font-size:12px;">
      <p style="margin:0;">This email was sent from the Zerosum Technologies website contact form.</p>
    </div>
  </div>
</body>
</html>`;

    const textEmail = `New ${safe.type} Inquiry - Zerosum Technologies
${'='.repeat(50)}
Inquiry Type: ${safe.type}
Full Name: ${stripTags(name)}
Company: ${stripTags(company)}
Email: ${stripTags(email)}
Phone: ${stripTags(phone)}

Message / Requirements:
${stripTags(message)}

Received: ${timestamp} (IST)`.trim();

    // Send email
    await sendEmail({
      to: NOTIFICATION_EMAIL,
      replyTo: stripTags(email).trim(),
      subject: `${safe.emoji} New ${safe.type}: ${safe.name} from ${safe.company}`,
      text: textEmail,
      html: htmlEmail
    });

    console.log(`✅ [${timestamp}] Inquiry sent: ${safe.type} from ${stripTags(name)} (${stripTags(email)})`);

    res.status(200).json({
      success: true,
      message: 'Your inquiry has been sent successfully! We\'ll get back to you soon.'
    });

  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send inquiry. Please try again or contact us directly.'
    });
  }
});

// ============================================================
// 6. ERROR HANDLING
// ============================================================

// CORS error handler
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ success: false, message: 'Origin not allowed.' });
  }
  next(err);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found.' });
});

// Global error handler — never leak stack traces
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.message);
  // TEMPORARY DIAGNOSTIC -- remove before any real traffic: this deployment
  // is still being brought up and its logs aren't otherwise reachable
  // mid-debugging, so surface the real error message instead of hiding it.
  res.status(500).json({ success: false, message: 'Internal server error.', debug: err.message, code: err.code });
});

// ============================================================
// 7. START SERVER (skipped on Vercel -- see module.exports at the bottom)
// ============================================================
// Vercel's Node runtime imports this file as a serverless function handler
// rather than running it as a long-lived process, so calling app.listen()
// there would be pointless (nothing ever connects to that port) and the
// crash-resilience process handlers below don't apply either, since Vercel
// manages each invocation's lifecycle itself. process.env.VERCEL is set
// automatically by Vercel's build/runtime environment.
if (!process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    console.log(`
  ⚡ Zerosum Backend Server (SECURED)
  ────────────────────────────────────
  🌐 API:       http://localhost:${PORT}
  📬 Contact:   POST http://localhost:${PORT}/api/contact
  💊 Health:    GET  http://localhost:${PORT}/api/health
  🔒 Helmet:    Enabled (secure headers)
  🛡️  CORS:      ${allowedOrigins.join(', ')}
  ⏱️  Rate Limit: 3 submissions/min, 60 req/min global
  🔐 Env:       Credentials loaded from .env
  `);
  });

  // ============================================================
  // 8. CRASH RESILIENCE (process stays up no matter what happens)
  // ============================================================
  // Every Express route above either can't throw asynchronously or is already
  // wrapped in try/catch, but these two handlers are the last line of defense:
  // if something truly unexpected slips through (a bad third-party module, a
  // timing issue, anything), Node's default behavior is to print a stack trace
  // and kill the entire process -- taking the static site, admin panel, and
  // API all down at once. Logging and continuing instead means one bad
  // request degrades gracefully instead of causing an outage.
  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught exception (server continues running):', err);
  });
  process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled promise rejection (server continues running):', reason);
  });

  // Graceful shutdown on deploy/restart signals: stop accepting new
  // connections and let in-flight requests finish instead of dropping them.
  const shutdown = (signal) => {
    console.log(`\n${signal} received, shutting down gracefully...`);
    server.close(() => {
      console.log('Server closed. Goodbye.');
      process.exit(0);
    });
    // Don't hang forever if some connection never closes.
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Vercel's @vercel/node builder imports this export and calls it directly as
// a (req, res) handler for every request -- an Express app already matches
// that signature, so no separate adapter/wrapper is needed.
module.exports = app;
