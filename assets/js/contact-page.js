/* AURÈS CÉRAMIQUE — contact page */

function renderContactCards() {
  const st = window.SETTINGS_CACHE || {};
  const phone = (st.store || {}).phone || '';
  const email = (st.store || {}).email || '';
  const wa = waNumber();
  const cards = [
    ['ct_phone', phone ? `<a class="big" href="tel:${esc(phone.replace(/\s/g, ''))}">${esc(phone)}</a>` : `<span class="big">—</span>`],
    ['ct_whatsapp', wa
      ? `<a class="big" href="${waLink()}" target="_blank" rel="noopener" style="color:#3f9c57">WhatsApp →</a>`
      : `<span class="big">—</span>`],
    ['ct_email', email ? `<a class="big" href="mailto:${esc(email)}">${esc(email)}</a>` : `<span class="big">—</span>`],
    ['ct_address', `<span class="big">${esc(st.address || '—')}</span>`],
    ['ct_hours', `<span class="big">${t('ct_hours_val')}</span>`],
  ];
  document.getElementById('contact-cards').innerHTML = cards.map(([k, v]) => `
    <div class="contact-card">
      <h3>${t(k)}</h3>
      ${v}
    </div>`).join('');
}

function renderMap() {
  const q = encodeURIComponent(window.MAP_QUERY || 'Algérie');
  document.getElementById('map-frame').src =
    `https://www.google.com/maps?q=${q}&output=embed`;
}

document.getElementById('ct-form').addEventListener('submit', async ev => {
  ev.preventDefault();
  const name = document.getElementById('c-name').value.trim();
  const phone = document.getElementById('c-phone').value;
  if (!name || !phone) { toast(t('ct_err_fields')); return; }

  const btn = ev.target.querySelector('button[type=submit]');
  btn.disabled = true;
  try {
    await DB.submitInquiry({
      name,
      phone,
      email: document.getElementById('c-email').value.trim(),
      message: document.getElementById('c-msg').value.trim(),
      productId: null,
    });
    toast(t('ct_sent'));
    ev.target.reset();
  } catch (err) {
    const m = String(err && err.message);
    toast(m.includes('TOO_MANY') ? t('ct_err_limit')
      : m.includes('PHONE') ? t('ct_err_phone')
      : t('ct_err_generic'));
  }
  btn.disabled = false;
});

/* settings arrive async — paint cards + map after they load */
(async () => {
  renderChrome('contact');
  try { window.SETTINGS_CACHE = await DB.getSettings(); } catch { /* demo defaults */ }
  renderContactCards();
  renderMap();

  jsonLd({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: (window.SETTINGS_CACHE.store || {}).name || 'Aurès Céramique',
    description: t('ct_sub'),
    telephone: (window.SETTINGS_CACHE.store || {}).phone || undefined,
    email: (window.SETTINGS_CACHE.store || {}).email || undefined,
    address: window.SETTINGS_CACHE.address || undefined,
  });
})();
