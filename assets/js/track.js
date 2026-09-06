/* AURÈS CÉRAMIQUE — order tracking (same engine as the second site). */

const TRACK_STEPS = ['new', 'confirmed', 'shipped', 'delivered'];
let TRACK_LAST = null;

async function initTrack() {
  renderChrome('track');
  document.getElementById('tBtn').addEventListener('click', trackLookup);
  document.getElementById('tPhone').addEventListener('keydown', e => { if (e.key === 'Enter') trackLookup(); });
  document.getElementById('tId').addEventListener('keydown', e => { if (e.key === 'Enter') trackLookup(); });
  const id = new URLSearchParams(location.search).get('id');
  if (id) document.getElementById('tId').value = id.replace(/\D/g, '');
  renderCartCount();
}

async function trackLookup() {
  const err = document.getElementById('tError');
  const box = document.getElementById('tResult');
  const btn = document.getElementById('tBtn');
  err.classList.remove('show');
  err.textContent = '';
  const id = document.getElementById('tId').value.replace(/\D/g, '');
  const phone = document.getElementById('tPhone').value.trim();
  if (!id || !phone) {
    err.textContent = t('required'); err.classList.add('show'); return;
  }
  btn.disabled = true; btn.style.opacity = 0.6;
  try {
    TRACK_LAST = await DB.trackOrder(id, phone);
    trackRender(TRACK_LAST);
  } catch {
    box.hidden = true;
    TRACK_LAST = null;
    err.textContent = t('track_not_found');
    err.classList.add('show');
  } finally {
    btn.disabled = false; btn.style.opacity = 1;
  }
}

function trackRender(o) {
  const box = document.getElementById('tResult');
  box.hidden = false;
  box.innerHTML = '';

  const head = document.createElement('div');
  head.className = 'track-head';
  let dateStr = '';
  try {
    dateStr = new Date(o.created_at).toLocaleDateString(LANG === 'ar' ? 'ar-DZ' : LANG === 'fr' ? 'fr-DZ' : 'en-US');
  } catch { dateStr = ''; }
  head.innerHTML = `<b>#${esc(o.id)}</b><span>${esc(t('track_placed'))} ${esc(dateStr)}</span>`;
  box.appendChild(head);

  if (o.status === 'cancelled') {
    const div = document.createElement('div');
    div.className = 'track-cancelled';
    div.textContent = t('st_cancelled');
    box.appendChild(div);
  } else {
    const at = TRACK_STEPS.indexOf(o.status);
    const ol = document.createElement('ol');
    ol.className = 'track-trail';
    TRACK_STEPS.forEach((step, i) => {
      const li = document.createElement('li');
      li.className = i < at ? 'done' : i === at ? 'current' : '';
      li.innerHTML = `<span class="dot"></span><span>${esc(t('st_' + step))}</span>`;
      ol.appendChild(li);
    });
    box.appendChild(ol);
  }

  const ul = document.createElement('ul');
  ul.className = 'track-items';
  (o.items || []).forEach(it => {
    const qty = Number(it.qty) || 0;
    const nm = LANG === 'ar' ? (it.name_ar || it.name_fr) : LANG === 'en' ? (it.name_en || it.name_fr) : it.name_fr;
    const li = document.createElement('li');
    li.innerHTML = `
      ${it.photo ? `<img src="${esc(it.photo)}" alt="${esc(nm)}" loading="lazy">` : ''}
      <div><b>${esc(nm || '')}</b><span>${esc(it.color || it.size || '')}${(it.color || it.size) ? ' · ' : ''}× ${qty}</span></div>
      <span class="track-price">${esc(DB.fmtPrice(Number(it.price) * qty))}</span>`;
    ul.appendChild(li);
  });
  box.appendChild(ul);

  const totals = document.createElement('div');
  totals.className = 'track-totals';
  const method = t(o.delivery_type === 'desk' ? 'deliv_desk' : 'deliv_home');
  totals.innerHTML = `
    <div><span>${esc(t('subtotal'))}</span><span>${esc(DB.fmtPrice(o.subtotal))}</span></div>
    <div><span>${esc(t('delivery'))} — ${esc(o.zone)} · ${esc(method)}</span><span>${esc(DB.fmtPrice(o.delivery_fee))}</span></div>
    <div class="grand"><span>${esc(t('total'))}</span><span>${esc(DB.fmtPrice(o.total))}</span></div>`;
  box.appendChild(totals);

  if (o.tracking_number) {
    const parcel = document.createElement('div');
    parcel.className = 'parcel-box';
    parcel.innerHTML = `
      <div><span>${esc(t('carrier'))}</span><b>${esc(o.carrier || '—')}</b></div>
      <div><span>${esc(t('tracking_number'))}</span><b>${esc(o.tracking_number)}</b></div>
      <small>${esc(t('tracking_hint'))}</small>`;
    box.appendChild(parcel);
  }

  const cod = document.createElement('div');
  cod.className = 'co-hint';
  cod.style.marginTop = '12px';
  cod.textContent = '💵 ' + t('cod_only');
  box.appendChild(cod);
}

document.addEventListener('DOMContentLoaded', initTrack);
