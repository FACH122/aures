/* AURÈS CÉRAMIQUE — shared UI: placeholders, header/footer, cards, WhatsApp */

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* Self-contained SVG placeholder so the demo needs zero image files —
   a stylised amphora on a warm clay-toned background. */
function placeholder(name, hue = 25) {
  const label = encodeURIComponent((name || 'Aurès Céramique').slice(0, 26));
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='720'>` +
    `<rect width='600' height='720' fill='hsl(${hue},38%,88%)'/>` +
    `<circle cx='300' cy='330' r='170' fill='hsl(${hue},32%,80%)' opacity='.55'/>` +
    `<path d='M270 190h60v40c0 30 55 45 55 120 0 90-45 130-85 130s-85-40-85-130c0-75 55-90 55-120z' ` +
    `fill='hsl(${hue},34%,52%)'/>` +
    `<path d='M245 250c-25 10-40 35-38 62M355 250c25 10 40 35 38 62' stroke='hsl(${hue},34%,42%)' stroke-width='9' fill='none' stroke-linecap='round'/>` +
    `<path d='M232 480h136M252 505h96' stroke='hsl(${hue},30%,45%)' stroke-width='12' stroke-linecap='round'/>` +
    `<text x='300' y='620' font-family='Georgia,serif' font-size='30' fill='hsl(${hue},22%,38%)' text-anchor='middle'>${label}</text>` +
    `<text x='300' y='665' font-family='Arial,sans-serif' font-size='17' letter-spacing='7' ` +
    `fill='hsl(${hue},16%,55%)' text-anchor='middle'>AURÈS CERAMIQUE</text></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

function productPhoto(p) {
  return p.photo || placeholder(LANG === 'ar' ? p.name_ar : p.name_fr,
    typeof p._hue === 'number' ? p._hue : (p.id * 37) % 360);
}

function productName(p) {
  if (LANG === 'ar') return p.name_ar || p.name_fr || '';
  if (LANG === 'en') return p.name_en || p.name_fr || '';
  return p.name_fr || p.name_ar || '';
}
function productDesc(p) {
  if (LANG === 'ar') return p.description_ar || p.description_fr || '';
  if (LANG === 'en') return p.description_en || p.description_fr || '';
  return p.description_fr || p.description_en || '';
}
function catLabel(c) {
  if (LANG === 'ar') return c.name_ar || c.name_fr;
  if (LANG === 'en') return c.name_en || c.name_fr;
  return c.name_fr;
}

const COLOR_AR = {
  'Bleu': 'أزرق', 'Blanc': 'أبيض', 'Vert': 'أخضر', 'Sable': 'رملي',
  'Ocre': 'مغرة', 'Noir': 'أسود', 'Turquoise': 'فيروزي', 'Crème': 'كريمي',
  'Marron': 'بني', 'Terre cuite': 'طيني', 'Jaune': 'أصفر', 'Rouge': 'أحمر',
};
const COLOR_HEX = {
  'bleu': '#33628f', 'blue': '#33628f', 'azur': '#4a7fb5',
  'blanc': '#f6f1e5', 'white': '#f6f1e5', 'crème': '#efe4cb', 'cream': '#efe4cb',
  'vert': '#6b7042', 'green': '#6b7042', 'olive': '#6b7042',
  'sable': '#cdb488', 'sand': '#cdb488', 'beige': '#d9c7a7',
  'ocre': '#c07a3a', 'ochre': '#c07a3a',
  'noir': '#2e241d', 'black': '#2e241d',
  'turquoise': '#3fa3a0', 'teal': '#3fa3a0',
  'marron': '#6e4a2e', 'brown': '#6e4a2e', 'brun': '#6e4a2e',
  'terre cuite': '#b3572f', 'terracotta': '#b3572f',
  'jaune': '#d9b23a', 'yellow': '#d9b23a', 'or': '#c9a84c', 'gold': '#c9a84c',
  'rouge': '#a83a32', 'red': '#a83a32',
};

function _nameHue(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
}
function colorName(c) { return LANG === 'ar' ? (COLOR_AR[c] || c) : c; }
function colorHex(c) {
  const key = String(c || '').toLowerCase().trim();
  return COLOR_HEX[key] || `hsl(${_nameHue(key)}, 34%, 58%)`;
}
function colorDots(colors) {
  return (colors || []).map(c =>
    `<span class="dot-swatch" style="background:${colorHex(c)}" title="${esc(colorName(c))}" aria-label="${esc(colorName(c))}"></span>`
  ).join('');
}

/* catalog card — atelier story kept, shop price + add added (v2) */
function cardCat(p) {
  const c = (window.CATS_CACHE || []).find(c => c.id === p.category_id);
  return c ? catLabel(c) : '';
}

function priceHtml(p) {
  if (!(Number(p.price) > 0)) return '';
  const old = Number(p.compare_at_price) > Number(p.price)
    ? `<span class="card-old">${esc(DB.fmtPrice(p.compare_at_price))}</span>` : '';
  return `<div class="card-price">${esc(DB.fmtPrice(p.price))} ${old}</div>`;
}

function stockBadge(p) {
  const s = Number(p.stock ?? 0);
  if (s <= 0) return `<span class="stock out">${esc(t('sold_out'))}</span>`;
  if (s <= 3) return `<span class="stock low">${esc(t('last_pieces').replace('{n}', s))}</span>`;
  return '';
}

function cardHtml(p) {
  const soldOut = (Number(p.stock ?? 1) <= 0);
  return `
  <div class="card reveal" data-card="${p.id}">
    <a class="card-media" href="/piece?id=${p.id}" aria-label="${esc(productName(p))}">
      <img src="${esc(productPhoto(p))}" alt="${esc(productName(p))}" loading="lazy">
      ${stockBadge(p) ? `<span class="card-badge">${stockBadge(p)}</span>` : ''}
    </a>
    <div class="card-body">
      ${cardCat(p) ? `<span class="card-cat">${esc(cardCat(p))}</span>` : ''}
      <h3><a href="/piece?id=${p.id}">${esc(productName(p))}</a></h3>
      ${(p.colors && p.colors.length) ? `<div class="card-colors">${colorDots(p.colors)}</div>` : ''}
      ${p.dimensions ? `<span class="card-dims">${esc(p.dimensions)}</span>` : ''}
      ${priceHtml(p)}
      <div class="card-foot">
        <a class="card-more" href="/piece?id=${p.id}">${t('req_info')} →</a>
        ${soldOut ? '' : `<button class="card-add" data-add="${p.id}" type="button">+ ${esc(t('add_to_cart'))}</button>`}
      </div>
    </div>
  </div>`;
}

/* delegated add-to-cart: works for every grid rendered via cardHtml */
document.addEventListener('click', async e => {
  const btn = e.target.closest('[data-add]');
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();
  const id = Number(btn.dataset.add);
  let p = null;
  try {
    if (window.CATS_CACHE === undefined) window.CATS_CACHE = [];
    // find in current grids first via DB
    p = await DB.getProduct(id);
  } catch { p = null; }
  if (!p) return;
  try {
    // default décor = first color (ceramics variant); piece page lets you choose
    const color = (p.colors && p.colors[0]) || '';
    Cart.add(p, color, 1);
    toast(t('added_to_cart'));
    if (typeof renderCartCount === 'function') renderCartCount();
  } catch (err) {
    toast(String(err && err.message).includes('OUT_OF_STOCK') ? t('sold_out') : t('color_required'));
  }
});

/* ---------- scroll reveal ---------- */
const revealIO = ('IntersectionObserver' in window) && !matchMedia('(prefers-reduced-motion: reduce)').matches
  ? new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('revealed'); revealIO.unobserve(e.target); }
      });
    }, { threshold: .08 })
  : null;

function watchReveals(root = document) {
  if (!revealIO) { document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed')); return; }
  root.querySelectorAll(
    '.grid-products .card, .cat-grid .cat-tile, .section-head, .step-row, .gal-item, .split'
  ).forEach(el => {
    // cards already carry .reveal from cardHtml — observe everything not yet
    // revealed (observe() on an already-observed target is a harmless no-op,
    // and each entry is unobserved once it intersects)
    if (el.classList.contains('revealed')) return;
    el.classList.add('reveal');
    revealIO.observe(el);
  });
}
new MutationObserver(() => watchReveals())
  .observe(document.documentElement, { childList: true, subtree: true });

let _toastTimer;
function toast(msg) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

/* ---------- header / footer chrome ---------- */
function renderHeader(active) {
  const el = document.getElementById('site-header');
  if (!el) return;
  const links = [
    ['/', 'nav_home', 'home'],
    ['/collection', 'nav_collection', 'collection'],
    ['atelier.html', 'nav_atelier', 'atelier'],
    ['gallery.html', 'nav_gallery', 'gallery'],
    ['contact.html', 'nav_contact', 'contact'],
  ];
  el.innerHTML = `
  ${window.IS_DEMO ? `<div class="demo-bar" data-i18n="demo_banner">${t('demo_banner')}</div>` : ''}
  <div class="header-inner container">
    <button class="nav-burger" aria-label="menu">☰</button>
    <a class="logo" href="/">AURÈS<span>CÉRAMIQUE</span></a>
    <nav class="nav-links">
      ${links.map(([href, key, id]) =>
        `<a href="${href}" class="${active === id ? 'active' : ''}">${t(key)}</a>`).join('')}
    </nav>
    <div class="header-actions">
      <a class="track-mini" href="/track" title="${t('nav_track')}">📦</a>
      <a class="cart-mini" href="/checkout" aria-label="${t('nav_cart')}">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <span class="cart-count" id="cartCount">0</span>
      </a>
      <button class="lang-toggle" onclick="setLang(nextLang())">${langToggleLabel()}</button>
      <a class="wa-mini${waNumber() ? '' : ' hide'}" href="${waLink()}" target="_blank" rel="noopener"
         aria-label="WhatsApp">${WA_SVG}</a>
    </div>
  </div>`;
  const burger = el.querySelector('.nav-burger');
  if (burger) burger.addEventListener('click', () => {
    const nav = el.querySelector('.nav-links');
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
  if (typeof renderCartCount === 'function') renderCartCount();
}

function renderFooter() {
  const el = document.getElementById('site-footer');
  if (!el) return;
  const st = window.SETTINGS_CACHE || {};
  el.innerHTML = `
  <div class="container footer-grid">
    <div>
      <a class="logo" href="/">AURÈS<span>CÉRAMIQUE</span></a>
      <p>${t('footer_tag')}</p>
      <div class="social-links" id="social-links"></div>
    </div>
    <div>
      <h4>${t('footer_links')}</h4>
      <a href="/collection" data-i18n="nav_collection">${t('nav_collection')}</a>
      <a href="/atelier" data-i18n="nav_atelier">${t('nav_atelier')}</a>
      <a href="/gallery" data-i18n="nav_gallery">${t('nav_gallery')}</a>
      <a href="/contact" data-i18n="nav_contact">${t('nav_contact')}</a>
      <a href="/checkout">${t('nav_cart')}</a>
      <a href="/track">${t('nav_track')}</a>
    </div>
    <div>
      <h4>${t('footer_contact')}</h4>
      <a href="${telLink()}">${esc(st.store && st.store.phone || '')}</a>
      <a href="mailto:${esc(st.store && st.store.email || '')}">${esc(st.store && st.store.email || '')}</a>
      <span>${esc(st.address || '')}</span>
      <a href="/admin">${t('admin')}</a>
    </div>
  </div>
  <div class="footer-bottom"><div class="container" data-i18n="rights">${t('rights')}</div></div>`;
}

/* ---------- WhatsApp & phone helpers ---------- */
const WA_SVG = `<svg viewBox="0 0 32 32" width="20" height="20" fill="currentColor">
  <path d="M16 3C9.4 3 4 8.3 4 14.9c0 2.6.9 5 2.3 7L4.6 27l5.3-1.7c1.9 1.1 4 1.7 6.1 1.7 6.6 0 12-5.3 12-11.9S22.6 3 16 3zm0 21.6c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-3.1 1 1-3-.3-.4c-1.2-1.7-1.8-3.6-1.8-5.6C6 9.6 10.5 5.2 16 5.2s10 4.4 10 9.7-4.5 9.7-10 9.7zm5.5-7.3c-.3-.2-1.8-.9-2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.6.1-.2.1-.4 0-.6-.1-.2-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.7s1.2 3.1 1.3 3.3c.2.2 2.3 3.6 5.7 5 .8.3 1.4.5 1.9.7.8.2 1.5.2 2.1.1.6-.1 1.8-.8 2.1-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.2-.7-.4z"/></svg>`;

function waNumber() {
  return String((window.SETTINGS_CACHE && SETTINGS_CACHE.whatsapp) || window.WHATSAPP || '');
}
function storePhone() {
  return String(((window.SETTINGS_CACHE || {}).store || {}).phone || '');
}
function waLink(extraText) {
  const n = waNumber();
  if (!n) return 'https://wa.me/';
  return `https://wa.me/${n}${extraText ? '?text=' + encodeURIComponent(extraText) : ''}`;
}
function waProductUrl(p) {
  const txt = `${t('piece_request')} — ${productName(p)} (${location.origin}/piece?id=${p.id})`;
  return waLink(txt);
}
function telLink() {
  const ph = storePhone();
  return ph ? `tel:${ph.replace(/\s/g, '')}` : '#';
}

/* Floating WhatsApp button */
function renderWaFab() {
  const num = waNumber();
  if (!num || document.getElementById('wa-fab')) return;
  const a = document.createElement('a');
  a.id = 'wa-fab';
  a.href = waLink();
  a.target = '_blank';
  a.rel = 'noopener';
  a.setAttribute('aria-label', 'WhatsApp');
  a.innerHTML = `<svg viewBox="0 0 32 32" width="26" height="26" fill="#fff">
    <path d="M16 3C9.4 3 4 8.3 4 14.9c0 2.6.9 5 2.3 7L4.6 27l5.3-1.7c1.9 1.1 4 1.7 6.1 1.7 6.6 0 12-5.3 12-11.9S22.6 3 16 3zm0 21.6c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-3.1 1 1-3-.3-.4c-1.2-1.7-1.8-3.6-1.8-5.6C6 9.6 10.5 5.2 16 5.2s10 4.4 10 9.7-4.5 9.7-10 9.7zm5.5-7.3c-.3-.2-1.8-.9-2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.6.1-.2.1-.4 0-.6-.1-.2-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.7s1.2 3.1 1.3 3.3c.2.2 2.3 3.6 5.7 5 .8.3 1.4.5 1.9.7.8.2 1.5.2 2.1.1.6-.1 1.8-.8 2.1-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.2-.7-.4z"/></svg>`;
  document.body.appendChild(a);
}

/* Canonical + og:url from window.SITE_URL (Google renders JS; crawlers of
   shares read raw HTML, so also keep the static og tags in each page head) */
function renderSeo() {
  if (!window.SITE_URL) return;
  const base = window.SITE_URL.replace(/\/$/, '');
  const here = base + location.pathname;
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = here;
  const og = document.querySelector('meta[property="og:url"]');
  if (og) og.content = here;
}

function renderVerifications() {
  const v = (window.SETTINGS_CACHE || {}).verifications || {};
  Object.entries(v).forEach(([name, token]) => {
    if (!token || document.querySelector(`meta[name="${name}"]`)) return;
    const m = document.createElement('meta');
    m.name = name;
    m.content = token;
    document.head.appendChild(m);
  });
}

function renderAnnounce() {
  const hdr = document.getElementById('site-header');
  if (!hdr) return;
  let bar = hdr.querySelector('.announce-bar');
  const a = (window.SETTINGS_CACHE || {}).announce;
  const txt = a && a.active
    ? ((LANG === 'ar' && (a.text_ar || a.text_fr)) ||
       (LANG === 'en' && (a.text_en || a.text_fr)) ||
       (LANG === 'fr' && (a.text_fr || a.text_ar)) || '')
    : '';
  if (!txt) { if (bar) bar.remove(); return; }
  if (!bar) { bar = document.createElement('div'); bar.className = 'announce-bar'; hdr.prepend(bar); }
  bar.textContent = txt;
}

function renderSocials() {
  const el = document.getElementById('social-links');
  if (!el) return;
  const s = (window.SETTINGS_CACHE || {}).socials || {};
  const links = [['Instagram', s.instagram], ['Facebook', s.facebook], ['TikTok', s.tiktok]]
    .filter(x => x[1]);
  el.innerHTML = links.map(([n, u]) =>
    `<a href="${esc(u)}" target="_blank" rel="noopener">${n} ↗</a>`).join('');
}

async function loadStoreSettings() {
  try { window.SETTINGS_CACHE = await DB.getSettings(); } catch { return; }
  renderWaFab();
  renderAnnounce();
  renderSocials();
  applyI18n();
  renderFooter();          // re-render now that settings are known
  applyI18n();
}

function renderChrome(active) {
  renderHeader(active);
  renderFooter();
  applyI18n();
  renderSeo();
  loadStoreSettings();
}

/* JSON-LD structured data (urban-dz gap — filled here) */
function jsonLd(obj) {
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.textContent = JSON.stringify(obj);
  document.head.appendChild(s);
}
