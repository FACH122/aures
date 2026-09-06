/* AURÈS CÉRAMIQUE — checkout (panier + commande COD).
   Same engine as the second site (zones home/desk, promo, free delivery,
   place_order server-side pricing) but rendered in the atelier theme. */

let CO_ZONES = [];
let CO_PROMO = { active: false, percent: 0 };
let CO_FREE_FROM = null;
let CO_APPLIED = null;
let CO_BASE = 0;
let CO_NOTES = [];

function coEffUnit(price) {
  const pct = CO_PROMO && CO_PROMO.active ? Math.min(Math.max(Number(CO_PROMO.percent) || 0, 0), 90) : 0;
  return Math.round(Number(price) * (100 - pct)) / 100;
}
function coDeliveryType() {
  const r = document.querySelector('input[name="deliv"]:checked');
  return r && r.value === 'desk' ? 'desk' : 'home';
}
function coZoneFee(z, type) {
  const ty = type || coDeliveryType();
  const v = ty === 'desk' ? z?.desk : z?.home;
  return Number(v ?? z?.home ?? z?.fee) || 0;
}

async function coRevalidate() {
  CO_NOTES = [];
  let live;
  try { live = await DB.listProducts({}); } catch { return; }
  const byId = new Map(live.map(p => [String(p.id), p]));
  const items = Cart.get();
  let changed = false, removed = false;
  const kept = [];
  for (const it of items) {
    const p = byId.get(String(it.product_id));
    const gone = !p || !p.active ||
      ((p.colors || []).length && !p.colors.includes(it.color)) ||
      ((Number(p.stock) || 0) <= 0);
    if (gone) { removed = true; continue; }
    const photo = (p.photos && p.photos[0]) || '';
    if (Number(p.price) !== Number(it.price) || it.photo !== photo) {
      it.price = Number(p.price) || 0;
      it.name_fr = p.name_fr; it.name_ar = p.name_ar; it.name_en = p.name_en;
      it.photo = photo;
      changed = true;
    }
    kept.push(it);
  }
  if (changed || removed) {
    Cart.save(kept);
    if (changed) CO_NOTES.push('cart_updated');
    if (removed) CO_NOTES.push('cart_removed');
  }
}

function coNotice() {
  const el = document.getElementById('cartNotice');
  if (!el) return;
  if (!CO_NOTES.length) { el.hidden = true; el.textContent = ''; return; }
  el.hidden = false;
  el.textContent = CO_NOTES.map(k => t(k)).join(' ');
}

async function initCheckout() {
  renderChrome('cart');
  try {
    const s = await DB.getSettings();
    window.SETTINGS_CACHE = s;
    CO_ZONES = Array.isArray(s.zones) ? s.zones : await DB.getZones();
    CO_PROMO = s.promo || await DB.getPromo();
    CO_FREE_FROM = (typeof s.free_delivery_from === 'number') ? s.free_delivery_from : await DB.getFreeDeliveryFrom();
  } catch (e) {
    try {
      CO_ZONES = await DB.getZones();
      CO_PROMO = await DB.getPromo();
      CO_FREE_FROM = await DB.getFreeDeliveryFrom();
    } catch (e2) {
      document.getElementById('cartLines').innerHTML =
        `<p class="results-zero">${t('err_load')}</p>`;
      return;
    }
  }
  await coRevalidate();
  coNotice();

  document.getElementById('promoBtn').addEventListener('click', coApplyCode);
  document.getElementById('promoInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); coApplyCode(); }
  });

  coRenderFaq();
  coRender();
  renderCartCount();
}

function coRender() {
  const items = Cart.get();
  const linesEl = document.getElementById('cartLines');
  if (!items.length) {
    CO_APPLIED = null;
    linesEl.innerHTML = `
      <p class="results-zero" style="padding:30px 0">${t('cart_empty')}</p>
      <div class="text-center"><a class="btn line" href="collection.html">${t('continue_shopping')}</a></div>`;
    ['subtotalVal', 'deliveryVal', 'totalVal'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '—';
    });
    const pr = document.getElementById('promoRow');
    if (pr) pr.hidden = true;
    const fd = document.getElementById('freeDeliveryBar');
    if (fd) fd.hidden = true;
    const form = document.getElementById('orderForm');
    if (form) form.style.display = 'none';
    return;
  }

  linesEl.innerHTML = '';
  items.forEach(it => {
    const unit = coEffUnit(it.price);
    const nm = (typeof productName === 'function')
      ? productName({ name_fr: it.name_fr, name_ar: it.name_ar, name_en: it.name_en })
      : (it.name_fr || '');
    const row = document.createElement('div');
    row.className = 'co-line';
    row.innerHTML = `
      <img src="${esc(it.photo || '')}" alt="">
      <div class="co-line-info">
        <div class="co-line-name">${esc(nm)}</div>
        <div class="co-line-meta">${it.color ? esc(it.color) + ' · ' : ''}${DB.fmtPrice(unit)}</div>
        <div class="co-qty">
          <button type="button" data-act="minus">−</button>
          <span>${it.qty}</span>
          <button type="button" data-act="plus">+</button>
          <button type="button" class="co-rm" data-act="rm">${esc(t('remove'))}</button>
        </div>
      </div>
      <div class="co-line-price">${DB.fmtPrice(unit * it.qty)}</div>`;
    row.querySelector('[data-act="minus"]').onclick = () => { Cart.setQty(it.key, it.qty - 1); coRevalidateCode().then(coRender); };
    row.querySelector('[data-act="plus"]').onclick = () => { Cart.setQty(it.key, it.qty + 1); coRevalidateCode().then(coRender); };
    row.querySelector('[data-act="rm"]').onclick = () => { Cart.remove(it.key); coRevalidateCode().then(coRender); };
    linesEl.appendChild(row);
  });

  CO_BASE = items.reduce((s, i) => s + coEffUnit(i.price) * i.qty, 0);
  coBuildForm();
}

async function coRevalidateCode() {
  if (!CO_APPLIED) return;
  try { await DB.checkPromo(CO_APPLIED.code, CO_BASE); }
  catch { CO_APPLIED = null; }
}

async function coApplyCode() {
  const input = document.getElementById('promoInput');
  const errEl = document.getElementById('promoError');
  errEl.classList.remove('show');
  errEl.textContent = '';
  const code = input.value.trim();
  if (!code) { CO_APPLIED = null; coTotals(); return; }
  try {
    CO_APPLIED = await DB.checkPromo(code, CO_BASE);
    coTotals();
  } catch {
    CO_APPLIED = null;
    coTotals();
    errEl.textContent = t('promo_invalid');
    errEl.classList.add('show');
  }
}

function coBuildForm() {
  let form = document.getElementById('orderForm');
  const wrap = document.getElementById('orderFormWrap');
  if (!form) {
    form = document.createElement('div');
    form.id = 'orderForm';
    form.innerHTML = `
      <h2 style="font-size:1.3rem;margin-bottom:14px">${t('deliv_info')}</h2>
      <div class="field"><label>${t('name')}</label><input id="fName" autocomplete="name"></div>
      <div class="field"><label>${t('phone')}</label><input id="fPhone" inputmode="tel" autocomplete="tel" placeholder="0555 12 34 56"></div>
      <div class="field"><label>${t('deliv_type')}</label>
        <div class="deliv-choice">
          <label class="deliv-opt"><input type="radio" name="deliv" value="home" checked>
            <span><b>${t('deliv_home')}</b><small>${t('deliv_home_hint')}</small></span></label>
          <label class="deliv-opt"><input type="radio" name="deliv" value="desk">
            <span><b>${t('deliv_desk')}</b><small>${t('deliv_desk_hint')}</small></span></label>
        </div>
      </div>
      <div class="field"><label id="fAddressLabel">${t('address')}</label><textarea id="fAddress" rows="2" style="min-height:64px"></textarea></div>
      <div class="field"><label>${t('zone')}</label><select id="fZone"></select></div>
      <p class="co-hint">📞 ${t('confirm_call')}</p>
      <p class="co-hint">💵 ${t('cod_only')}</p>
      <div class="co-error" id="formError"></div>
      <button class="btn accent" id="placeOrderBtn" style="width:100%">${t('place_order')}</button>`;
    wrap.appendChild(form);
    form.querySelector('#placeOrderBtn').addEventListener('click', coPlaceOrder);
    form.querySelector('#fZone').addEventListener('change', coTotals);
    form.querySelectorAll('input[name="deliv"]').forEach(r =>
      r.addEventListener('change', () => { coZoneOptions(); coTotals(); }));
  }
  form.style.display = '';
  coZoneOptions();
  coTotals();
}

function coZoneOptions() {
  const sel = document.getElementById('fZone');
  if (!sel) return;
  const prev = sel.value;
  sel.innerHTML = '';
  CO_ZONES.forEach(z => {
    const o = document.createElement('option');
    o.value = z.name;
    o.textContent = `${z.code ? z.code + ' · ' : ''}${z.name} — ${DB.fmtPrice(coZoneFee(z))}`;
    sel.appendChild(o);
  });
  if (prev) sel.value = prev;
}

function coTotals() {
  const form = document.getElementById('orderForm');
  if (!form) return;
  const sel = form.querySelector('#fZone');
  const zone = CO_ZONES.find(z => z.name === sel.value) || CO_ZONES[0];
  const sub = CO_BASE;
  const desk = coDeliveryType() === 'desk';
  const addrLabel = document.getElementById('fAddressLabel');
  if (addrLabel) addrLabel.textContent = t(desk ? 'address_desk_optional' : 'address');

  const discount = CO_APPLIED ? Math.round(sub * CO_APPLIED.percent) / 100 : 0;
  const promoRow = document.getElementById('promoRow');
  if (CO_APPLIED) {
    promoRow.hidden = false;
    document.getElementById('promoLabel').textContent =
      t('promo_applied').replace('{code}', CO_APPLIED.code).replace('{p}', CO_APPLIED.percent);
    document.getElementById('promoVal').textContent = `− ${DB.fmtPrice(discount)}`;
  } else if (promoRow) promoRow.hidden = true;

  const qualifies = CO_FREE_FROM > 0 && (sub - discount) >= CO_FREE_FROM;
  const fee = qualifies ? 0 : coZoneFee(zone);
  document.getElementById('deliveryVal').textContent = qualifies ? t('delivery_free') : DB.fmtPrice(fee);

  const bar = document.getElementById('freeDeliveryBar');
  if (CO_FREE_FROM > 0 && bar) {
    bar.hidden = false;
    const after = sub - discount;
    const pct = Math.max(0, Math.min(100, Math.round((after / CO_FREE_FROM) * 100)));
    bar.innerHTML = qualifies
      ? `<div class="fd-msg">${esc(t('free_delivery_qualifies'))}</div><div class="fd-track"><i style="width:100%"></i></div>`
      : `<div class="fd-msg">${esc(t('free_delivery_progress').replace('{x}', DB.fmtPrice(CO_FREE_FROM - after)))}</div><div class="fd-track"><i style="width:${pct}%"></i></div>`;
  } else if (bar) bar.hidden = true;

  document.getElementById('subtotalVal').textContent = DB.fmtPrice(sub);
  document.getElementById('totalVal').textContent = DB.fmtPrice(sub - discount + fee);
  form.dataset.zone = zone?.name || '';
  const sticky = document.getElementById('coStickyTotal');
  if (sticky) sticky.textContent = DB.fmtPrice(sub - discount + fee);
}

function coRenderFaq() {
  const box = document.getElementById('faqList');
  if (!box) return;
  box.innerHTML = '';
  [1, 2, 3].forEach(n => {
    const d = document.createElement('details');
    d.className = 'co-faq-item';
    d.innerHTML = `<summary>${esc(t('faq_q' + n))}</summary><p>${esc(t('faq_a' + n))}</p>`;
    box.appendChild(d);
  });
}

async function coPlaceOrder() {
  const err = document.getElementById('formError');
  err.classList.remove('show');
  err.textContent = '';
  const name = document.getElementById('fName').value.trim();
  const phone = document.getElementById('fPhone').value.trim();
  const address = document.getElementById('fAddress').value.trim();
  const form = document.getElementById('orderForm');
  const zone = form.dataset.zone;
  const deliv = coDeliveryType();

  if (!name || !phone || !zone || (deliv === 'home' && !address)) {
    err.textContent = t('required'); err.classList.add('show'); return;
  }
  if (!DB.validDzPhone(phone)) {
    err.textContent = t('invalid_phone_dz'); err.classList.add('show'); return;
  }

  const btn = document.getElementById('placeOrderBtn');
  btn.disabled = true; btn.style.opacity = 0.6;
  try {
    const ordered = Cart.get();
    const res = await DB.placeOrder({
      customer_name: name, phone, address, zone, items: ordered,
      promo_code: CO_APPLIED?.code || '', delivery_type: deliv,
    });
    Cart.clear();
    document.getElementById('cartView').style.display = 'none';
    const faq = document.getElementById('faq');
    if (faq) faq.style.display = 'none';
    document.getElementById('successView').style.display = '';
    document.getElementById('orderRef').textContent = `#${res.id}`;
    document.getElementById('finalTotal').textContent = DB.fmtPrice(res.total);
    const track = document.getElementById('trackLink');
    if (track) { track.href = `track.html?id=${encodeURIComponent(res.id)}`; track.hidden = false; }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) {
    const code = String(e?.message || '');
    err.textContent =
      code.includes('OUT_OF_STOCK') ? t('err_stock') :
      code.includes('PRODUCT_UNAVAILABLE') ? t('err_unavailable') :
      code.includes('TOO_MANY_ORDERS_TODAY') ? t('err_too_many_today') :
      code.includes('TOO_MANY_ORDERS') ? t('err_too_many') :
      code.includes('DUPLICATE_ORDER') ? t('err_duplicate') :
      code.includes('INVALID_VARIANT') ? t('color_required') :
      code.includes('INVALID_PHONE') ? t('invalid_phone_dz') :
      code.includes('PROMO') ? t('promo_invalid') :
      code.includes('MISSING_FIELDS') || code.includes('UNKNOWN_ZONE') ? t('required') :
      t('err_generic');
    err.classList.add('show');
    btn.disabled = false; btn.style.opacity = 1;
  }
}

document.addEventListener('DOMContentLoaded', initCheckout);
