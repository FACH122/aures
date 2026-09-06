/* AURÈS CÉRAMIQUE — product (piece) page (v2: shop + story) */

const id = Number(new URLSearchParams(location.search).get('id'));
let CURRENT_PIECE = null;
let PDP_COLOR = '';
let PDP_QTY = 1;

function galleryHtml(photos, name) {
  const list = photos.filter(Boolean);
  const src0 = list[0] || productPhoto(CURRENT_PIECE);
  return `
    <img class="main-img" id="main-img" src="${esc(src0)}" alt="${esc(name)}">
    ${list.length > 1 ? `<div class="thumbs">
      ${list.map((s, i) => `<img src="${esc(s)}" alt="${esc(name)}" data-i="${i}" loading="lazy" class="${i === 0 ? 'on' : ''}">`).join('')}
    </div>` : ''}`;
}

function specsHtml(p) {
  const cat = (window.CATS_CACHE || []).find(c => c.id === p.category_id);
  const rows = [];
  if (p.dimensions) rows.push(['spec_dims', p.dimensions]);
  rows.push(['spec_material', p.material || t('material_default')]);
  if (p.colors && p.colors.length) {
    rows.push(null); // placeholder — colors row rendered with dots
  }
  if (cat) rows.push(['spec_cat', catLabel(cat)]);

  let html = '';
  for (const r of rows) {
    if (!r) {
      html += `
      <tr>
        <th scope="row">${esc(t('spec_colors'))}</th>
        <td><span class="card-colors">${colorDots(p.colors)}
          <span style="font-size:.88rem;color:var(--ink-soft)">${p.colors.map(colorName).map(esc).join(' · ')}</span>
        </span></td>
      </tr>`;
    } else {
      html += `
      <tr>
        <th scope="row">${esc(t(r[0]))}</th>
        <td>${esc(r[1])}</td>
      </tr>`;
    }
  }
  return `<table class="spec-table"><tbody>${html}</tbody></table>`;
}

function pdpPriceHtml(p) {
  if (!(Number(p.price) > 0)) return '';
  const old = Number(p.compare_at_price) > Number(p.price)
    ? `<span class="pdp-old">${esc(DB.fmtPrice(p.compare_at_price))}</span>` : '';
  return `<div class="pdp-price">${esc(DB.fmtPrice(p.price))} ${old}</div>`;
}

function pdpStockHtml(p) {
  const s = Number(p.stock ?? 0);
  if (s <= 0) return `<span class="stock out">${esc(t('sold_out'))}</span>`;
  if (s <= 3) return `<span class="stock low">${esc(t('last_pieces').replace('{n}', s))}</span>`;
  return `<span class="stock ok">${esc(t('in_stock'))}</span>`;
}

async function renderPdp() {
  const root = document.getElementById('pdp-root');
  renderChrome('');
  let p;
  try { p = await DB.getProduct(id); } catch { p = null; }

  if (!p) {
    root.innerHTML = `
      <div class="text-center">
        <h1>${t('piece_not_found')}</h1>
        <a class="btn line mt-2" href="/collection" data-i18n="piece_back"></a>
      </div>`;
    applyI18n();
    return;
  }
  CURRENT_PIECE = p;
  PDP_COLOR = (p.colors && p.colors[0]) || '';
  PDP_QTY = 1;

  /* preload categories so cardCat/spec work */
  if (!(window.CATS_CACHE || []).length) {
    try { window.CATS_CACHE = await DB.listCategories(); } catch { window.CATS_CACHE = []; }
  }

  const name = productName(p);
  document.title = `${name} — Aurès Céramique`;
  const photos = (p.photos || []).filter(Boolean);
  const soldOut = (Number(p.stock ?? 1) <= 0);

  root.innerHTML = `
    <a class="back-link" href="/collection" data-i18n="piece_back">${t('piece_back')}</a>
    <div class="pdp">
      <div class="pdp-gallery">
        ${galleryHtml(photos, name)}
      </div>
      <div class="pdp-info">
        <span class="kicker">${esc(cardCat(p) || t('feat_kicker'))}</span>
        <h1>${esc(name)}</h1>
        ${pdpPriceHtml(p)}
        <div style="margin:8px 0 4px">${pdpStockHtml(p)}</div>
        <p class="pdp-desc">${esc(productDesc(p))}</p>
        ${specsHtml(p)}
        ${(p.colors && p.colors.length) ? `
        <div class="pdp-variant">
          <span class="pdp-variant-label">${esc(t('choose_color'))}</span>
          <div class="pdp-colors" id="pdp-colors">
            ${p.colors.map((c, i) => `
              <button type="button" class="pdp-chip${i === 0 ? ' on' : ''}" data-color="${esc(c)}"
                title="${esc(colorName(c))}">
                <span class="dot-swatch" style="background:${colorHex(c)}"></span>${esc(colorName(c))}
              </button>`).join('')}
          </div>
        </div>` : ''}
        ${soldOut ? '' : `
        <div class="pdp-variant">
          <span class="pdp-variant-label">${esc(t('qty'))}</span>
          <div class="pdp-qty">
            <button type="button" id="q-minus">−</button>
            <span id="q-val">1</span>
            <button type="button" id="q-plus">+</button>
          </div>
        </div>`}
        <p class="pdp-note">${t('piece_note')}</p>
        <p class="co-hint">💵 ${t('order_cod_note')}</p>
        <p class="co-hint">🚚 ${t('ship_247')}</p>
        <div class="pdp-actions">
          ${soldOut ? `<button class="btn line" disabled>${t('sold_out')}</button>` : `
          <button class="btn accent" id="add-btn">🛒 ${t('piece_add')}</button>
          <button class="btn line" id="buy-btn">${t('piece_buy_now')}</button>`}
          <a class="btn wa" href="${waProductUrl(p)}" target="_blank" rel="noopener">
            ${WA_SVG}<span>${t('piece_whatsapp')}</span>
          </a>
          <button class="btn ghost" id="ask-btn" style="color:var(--ink-soft);border-color:var(--line)">${t('piece_request')}</button>
        </div>
      </div>
    </div>

    <section style="margin-top:80px">
      <div class="section-head">
        <div>
          <span class="kicker" data-i18n="feat_kicker"></span>
          <h2 data-i18n="piece_related"></h2>
        </div>
        <a class="link-more" href="/collection${p.category_id ? `?cat=${p.category_id}` : ''}" data-i18n="feat_all"></a>
      </div>
      <div class="grid-products" id="rel-grid"></div>
    </section>`;

  /* thumbnail switching */
  root.querySelectorAll('.thumbs img').forEach(img => {
    img.addEventListener('click', () => {
      document.getElementById('main-img').src = img.src;
      root.querySelectorAll('.thumbs img').forEach(x => x.classList.remove('on'));
      img.classList.add('on');
    });
  });

  /* variant + qty */
  root.querySelectorAll('#pdp-colors .pdp-chip').forEach(ch => {
    ch.addEventListener('click', () => {
      root.querySelectorAll('#pdp-colors .pdp-chip').forEach(x => x.classList.remove('on'));
      ch.classList.add('on');
      PDP_COLOR = ch.dataset.color || '';
    });
  });
  const qm = root.querySelector('#q-minus');
  const qp = root.querySelector('#q-plus');
  if (qm && qp) {
    qm.addEventListener('click', () => {
      PDP_QTY = Math.max(1, PDP_QTY - 1);
      root.querySelector('#q-val').textContent = PDP_QTY;
    });
    qp.addEventListener('click', () => {
      PDP_QTY = Math.min(Number(p.stock) || 99, PDP_QTY + 1);
      root.querySelector('#q-val').textContent = PDP_QTY;
    });
  }

  function currentSelection() {
    if ((p.colors || []).length && !PDP_COLOR) {
      toast(t('color_required'));
      return null;
    }
    return { color: PDP_COLOR, qty: PDP_QTY };
  }

  const addBtn = root.querySelector('#add-btn');
  if (addBtn) addBtn.addEventListener('click', () => {
    const sel = currentSelection();
    if (!sel) return;
    try {
      Cart.add(p, sel.color, sel.qty);
      toast(t('added_to_cart'));
      renderCartCount();
    } catch {
      toast(t('out_of_stock'));
    }
  });
  const buyBtn = root.querySelector('#buy-btn');
  if (buyBtn) buyBtn.addEventListener('click', () => {
    const sel = currentSelection();
    if (!sel) return;
    try {
      Cart.add(p, sel.color, sel.qty);
    } catch { toast(t('out_of_stock')); return; }
    location.href = 'checkout.html';
  });

  /* inquiry modal (story kept: question / visite atelier) */
  document.getElementById('ask-btn').addEventListener('click', () =>
    openInquiryModal(p));

  /* related pieces (same category, exclude self) */
  const rel = document.getElementById('rel-grid');
  try {
    const items = (await DB.listProducts({ category: p.category_id }))
      .filter(x => x.id !== p.id).slice(0, 4);
    rel.innerHTML = items.map(cardHtml).join('');
    watchReveals(rel);
  } catch { rel.closest('section').style.display = 'none'; }

  jsonLd({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: productDesc(p),
    image: photos.length ? photos : undefined,
    category: cardCat(p) || undefined,
    material: p.material || t('material_default'),
    brand: { '@type': 'Brand', name: 'Aurès Céramique' },
    offers: (Number(p.price) > 0) ? {
      '@type': 'Offer',
      priceCurrency: 'DZD',
      price: String(p.price),
      availability: (Number(p.stock) > 0)
        ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    } : undefined,
  });

  /* sticky mobile add-to-cart (mobile only via CSS) */
  let stickyBar = document.getElementById('pdp-sticky');
  if (!stickyBar) {
    stickyBar = document.createElement('div');
    stickyBar.id = 'pdp-sticky';
    stickyBar.className = 'pdp-sticky';
    stickyBar.innerHTML = `
      <img id="sticky-img" alt="">
      <div class="sticky-info"><span class="sticky-name" id="sticky-name"></span><span class="sticky-price" id="sticky-price"></span></div>
      <button class="btn accent" id="sticky-add">${t('piece_add')}</button>`;
    document.body.appendChild(stickyBar);
    stickyBar.querySelector('#sticky-add').addEventListener('click', () => {
      const main = root.querySelector('#add-btn');
      if (main) main.click();
    });
  }
  stickyBar.querySelector('#sticky-img').src = productPhoto(p);
  stickyBar.querySelector('#sticky-img').alt = name;
  stickyBar.querySelector('#sticky-name').textContent = name;
  stickyBar.querySelector('#sticky-price').textContent = Number(p.price) > 0 ? DB.fmtPrice(p.price) : '';
  const stickyToggle = () => {
    const anchor = root.querySelector('.pdp-actions');
    const past = anchor ? anchor.getBoundingClientRect().top < 0 : window.scrollY > 600;
    stickyBar.classList.toggle('show', past && !soldOut);
  };
  window.addEventListener('scroll', stickyToggle, { passive: true });
  stickyToggle();
  applyI18n();
  watchReveals(root);
  renderCartCount();
  setTimeout(() => {
    const wa = document.getElementById('pdp-wa-btn');
    if (wa) { wa.href = waProductUrl(p); }
  }, 600);
}

/* ----- inquiry modal: form → DB.submitInquiry ----- */
function openInquiryModal(p) {
  const el = document.createElement('div');
  el.className = 'modal-bg';
  el.innerHTML = `
  <div class="modal">
    <h3>${t('req_title')}<span style="display:block;font-size:.95rem;color:var(--ink-soft);font-family:var(--sans);margin-top:6px;font-weight:300">${esc(productName(p))}</span></h3>
    <form id="inq-form">
      <div class="field">
        <label for="iq-name">${t('ct_name')}</label>
        <input id="iq-name" required autocomplete="name">
      </div>
      <div class="field">
        <label for="iq-phone">${t('ct_phone_l')}</label>
        <input id="iq-phone" required inputmode="tel" autocomplete="tel"
               placeholder="0555 12 34 56">
      </div>
      <div class="field">
        <label for="iq-email">${t('ct_email_l')}</label>
        <input id="iq-email" type="email" autocomplete="email">
      </div>
      <div class="field">
        <label for="iq-msg">${t('ct_message')}</label>
        <textarea id="iq-msg"></textarea>
      </div>
      <button type="submit" class="btn accent" style="width:100%">${t('ct_send')}</button>
    </form>
  </div>`;
  document.body.appendChild(el);
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-label', t('req_title'));
  const prevFocus = document.activeElement;
  const closeModal = () => {
    el.remove();
    document.removeEventListener('keydown', escClose);
    if (prevFocus && prevFocus.focus) prevFocus.focus();
  };
  const escClose = (e) => { if (e.key === 'Escape') closeModal(); };
  document.addEventListener('keydown', escClose);
  el.addEventListener('click', e => { if (e.target === el) closeModal(); });
  setTimeout(() => { const f = el.querySelector('#iq-name'); if (f) f.focus(); }, 60);

  el.querySelector('#inq-form').addEventListener('submit', async ev => {
    ev.preventDefault();
    const btn = el.querySelector('button[type=submit]');
    btn.disabled = true;
    try {
      await DB.submitInquiry({
        name: el.querySelector('#iq-name').value.trim(),
        phone: el.querySelector('#iq-phone').value,
        email: el.querySelector('#iq-email').value.trim(),
        message: el.querySelector('#iq-msg').value.trim(),
        productId: p.id,
      });
      closeModal();
      toast(t('ct_sent'));
    } catch (err) {
      btn.disabled = false;
      const m = String(err && err.message);
      toast(m.includes('TOO_MANY') ? t('ct_err_limit')
        : m.includes('PHONE') ? t('ct_err_phone')
        : t('ct_err_generic'));
    }
  });
}

renderPdp();
