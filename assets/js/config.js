/* ============================================================
   AURÈS CÉRAMIQUE — CONFIGURATION
   The only file you edit to connect your database.

   1. Create a free project at https://supabase.com
   2. Settings > API > copy Project URL + anon public key
   3. Run supabase/schema.sql in the SQL Editor
   4. Paste both values below. Done.

   While the values are empty, the site runs in DEMO mode
   with sample pieces so you can preview the design.
   ============================================================ */
const SUPABASE_CONFIG = {
  url: 'https://ptkzwftjtylaldkxppxx.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0a3p3ZnRqdHlsYWxka3hwcHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2ODMxMzgsImV4cCI6MjEwNDI1OTEzOH0.Am4VlYyCJZEgNXapPJtgMjuKBMcHfCytGYFZngTELQs',
};

// Public site URL for share previews / canonical links.
// Leave '' to auto-detect from the address bar.
window.SITE_URL = 'https://aures1.netlify.app';

// Your WhatsApp number in international format WITHOUT '+' — digits only.
// e.g. Algerian number 0555 12 34 56 → '213555123456'.
// NOTE: the dashboard (admin → Boutique → WhatsApp) overrides this once set.
// This value is only a fallback so the buttons work before Supabase is connected.
window.WHATSAPP = '';

// Hero image on the homepage:
//   1. A file inside the project:  '/assets/img/hero.jpg'
//   2. Any public URL:             'https://...'
// Leave '' to use the generated artwork (fine for demo, replace before launch).
// Best ratio: landscape ~16:9; the headline sits on the lower-left.
window.HERO_IMAGE = '';

// Google Maps embed query (address shown on the contact page).
window.MAP_QUERY = 'Alger, Algérie';

window.IS_DEMO =
  !SUPABASE_CONFIG.url.startsWith('https://') ||
  SUPABASE_CONFIG.anonKey.startsWith('PASTE_');
