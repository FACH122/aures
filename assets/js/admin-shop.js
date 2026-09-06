/* AURÈS CÉRAMIQUE — admin shop tabs (v2): Commandes, Livraison, Promos.
   Same engine as the second site, styled for the atelier dashboard. */

function orderItemsSummary(items) {
  return (items || []).map(it => {
    const nm = it.name_fr || it.name_ar || it.name_en || ('#' + it.product_id);
    return `${it.qty}× ${nm}${it.color ? ` (${it.color})` : ''}`;
  }).join(', ');
}

/* ---------- COMMANDES ---------- */
async function tabOrders(root) {
  const list = CACHE.orders || [];
  if (!list.length) {
    root.innerHTML = '<div class="admin-card results-zero">Aucune commande pour le moment.<br><small style="color:var(--ink-soft)">Les commandes passées sur checkout.html apparaîtront ici.</small></div>';
    return;
  }
  const STATUSES = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  const ST_FR = { new: 'Nouveau', confirmed: 'Confirmée', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée' };
  root.innerHTML = `
  <div class="admin-card" style="overflow-x:auto">
    <table class="adm">
      <thead><tr><th>N°</th><th>Date</th><th>Client</th><th>Contenu</th><th>Total</th><th>Statut</th><th></th></tr></thead>
      <tbody>
        ${list.map(o => `
        <tr>
          <td><b>#${o.id}</b><br><small style="color:var(--ink-soft)">${esc(o.zone || '')} · ${o.delivery_type === 'desk' ? 'Stop desk' : 'Domicile'}</small></td>
          <td>${new Date(o.created_at).toLocaleDateString('fr-DZ')}<br>
              <small style="color:var(--ink-soft)">${new Date(o.created_at).toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' })}</small></td>
          <td>${esc(o.customer_name)}<br><a href="tel:${esc(o.phone)}">${esc(o.phone)}</a><br>
              <small style="color:var(--ink-soft)">${esc(o.address || '')}</small></td>
          <td style="max-width:280px"><small>${esc(orderItemsSummary(o.items))}</small>
              ${o.promo_code ? `<br><small style="color:var(--olive)">Code ${esc(o.promo_code)} (−${esc(String(o.discount))})</small>` : ''}
              ${o.tracking_number ? `<br><small>📦 ${esc(o.carrier || '')} ${esc(o.tracking_number)}</small>` : ''}</td>
          <td><b>${esc(DB.fmtPrice(o.total))}</b><br><small style="color:var(--ink-soft)">liv. ${esc(DB.fmtPrice(o.delivery_fee))}</small></td>
          <td><span class="${o.status === 'new' ? 'badge-new' : 'badge-read'}">${ST_FR[o.status] || o.status}</span></td>
          <td><button class="mini-btn" data-view="${o.id}">Voir</button></td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>`;

  root.querySelectorAll('[data-view]').forEach(b => b.onclick = () => {
    const o = list.find(x => String(x.id) === String(b.dataset.view));
    if (o) orderModal(o);
  });
}

function orderModal(o) {
  const STATUSES = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  const ST_FR = { new: 'Nouveau', confirmed: 'Confirmée', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée' };
  const el = document.createElement('div');
  el.className = 'modal-bg';
  el.innerHTML = `
  <div class="modal" style="width:min(620px,100%)">
    <h3>Commande #${o.id}</h3>
    <p style="color:var(--ink-soft);font-size:.9rem;margin-bottom:14px">
      ${new Date(o.created_at).toLocaleString('fr-DZ')} · ${esc(o.customer_name)} · <a href="tel:${esc(o.phone)}">${esc(o.phone)}</a><br>
      ${esc(o.address || '')} · ${esc(o.zone)} (${o.delivery_type === 'desk' ? 'Stop desk' : 'À domicile'})
    </p>
    <div class="admin-card" style="padding:14px 18px;margin-bottom:14px">
      ${(o.items || []).map(it => `
        <div style="display:flex;justify-content:space-between;gap:10px;padding-block:6px;border-bottom:1px solid var(--line);font-size:.9rem">
          <span>${it.qty}× ${(esc(it.name_fr || ''))}${it.color ? ` <small style="color:var(--ink-soft)">(${esc(it.color)})</small>` : ''}</span>
          <b>${esc(DB.fmtPrice(Number(it.price) * Number(it.qty)))}</b>
        </div>`).join('')}
      <div style="display:flex;justify-content:space-between;margin-top:10px"><span>Sous-total</span><span>${esc(DB.fmtPrice(o.subtotal))}</span></div>
      ${Number(o.discount) > 0 ? `<div style="display:flex;justify-content:space-between"><span>Remise ${esc(o.promo_code || '')}</span><span>− ${esc(DB.fmtPrice(o.discount))}</span></div>` : ''}
      <div style="display:flex;justify-content:space-between"><span>Livraison</span><span>${esc(DB.fmtPrice(o.delivery_fee))}</span></div>
      <div style="display:flex;justify-content:space-between;font-size:1.15rem;margin-top:6px"><b>Total</b><b>${esc(DB.fmtPrice(o.total))}</b></div>
    </div>
    <div class="form-2col">
      <div class="field"><label>Statut</label>
        <select id="o-status">${STATUSES.map(s => `<option value="${s}" ${o.status === s ? 'selected' : ''}>${ST_FR[s]}</option>`).join('')}</select>
      </div>
      <div class="field"><label>Transporteur</label><input id="o-carrier" value="${esc(o.carrier || '')}" placeholder="Yalidine, ZR Express…"></div>
      <div class="field"><label>N° de colis</label><input id="o-tracking" value="${esc(o.tracking_number || '')}"></div>
    </div>
    <div class="row-actions-adm" style="margin-top:14px">
      <button class="btn accent" id="o-save">Enregistrer</button>
      <button class="mini-btn danger" id="o-del">Supprimer</button>
      <button class="mini-btn" id="o-close">Fermer</button>
    </div>
  </div>`;
  document.body.appendChild(el);
  el.addEventListener('click', e => { if (e.target === el) el.remove(); });
  el.querySelector('#o-close').onclick = () => el.remove();
  el.querySelector('#o-save').onclick = async () => {
    try {
      await DB.Admin.updateOrderStatus(o.id, el.querySelector('#o-status').value);
      await DB.Admin.saveOrderShipping(o.id, el.querySelector('#o-carrier').value, el.querySelector('#o-tracking').value);
      o.status = el.querySelector('#o-status').value;
      o.carrier = el.querySelector('#o-carrier').value.trim();
      o.tracking_number = el.querySelector('#o-tracking').value.trim();
      toast('Enregistré ✓');
      el.remove();
      renderTabs();
    } catch (err) { toast('Erreur : ' + err.message); }
  };
  el.querySelector('#o-del').onclick = async () => {
    if (!confirm('Supprimer cette commande ? Le stock n’est pas rendu.')) return;
    try {
      await DB.Admin.deleteOrder(o.id);
      CACHE.orders = CACHE.orders.filter(x => x.id !== o.id);
      toast('Supprimée ✓');
      el.remove();
      renderTabs();
    } catch (err) { toast('Erreur : ' + err.message); }
  };
}

/* ---------- ZONES (58 wilayas, 2 prix) ---------- */
function tabZones(root) {
  const zones = CACHE.zones || [];
  root.innerHTML = `
  <div class="admin-card">
    <p style="color:var(--ink-soft);font-size:.9rem;margin-bottom:16px">
      Même modèle que le second site : <b>Stop desk</b> (retrait au bureau, moins cher) et <b>À domicile</b>.
      Les prix sont en DA. Videz un champ pour garder l’ancien tarif.
    </p>
    <div style="overflow-x:auto">
    <table class="adm">
      <thead><tr><th>Code</th><th>Wilaya</th><th>Stop desk (DA)</th><th>Domicile (DA)</th></tr></thead>
      <tbody>
        ${zones.map((z, i) => `
        <tr>
          <td>${z.code || ''}</td>
          <td><b>${esc(z.name)}</b></td>
          <td><input type="number" min="0" data-zdesk="${i}" value="${Number(z.desk) || 0}" style="width:110px"></td>
          <td><input type="number" min="0" data-zhome="${i}" value="${Number(z.home ?? z.fee) || 0}" style="width:110px"></td>
        </tr>`).join('')}
      </tbody>
    </table>
    </div>
    <div class="row-actions-adm" style="margin-top:16px">
      <button class="btn accent" id="z-save">Enregistrer les tarifs</button>
    </div>
  </div>`;
  root.querySelector('#z-save').onclick = async () => {
    const updated = zones.map((z, i) => ({
      code: z.code, name: z.name,
      desk: Number(root.querySelector(`[data-zdesk="${i}"]`).value) || 0,
      home: Number(root.querySelector(`[data-zhome="${i}"]`).value) || 0,
    }));
    try {
      await DB.Admin.saveZones(updated);
      CACHE.zones = updated;
      CACHE.settings.zones = updated;
      toast('Tarifs enregistrés ✓');
    } catch (err) { toast('Erreur : ' + err.message); }
  };
}

/* ---------- PROMOS (vente globale + codes + livraison offerte) ---------- */
function tabPromos(root) {
  const promo = CACHE.promo || {};
  const codes = CACHE.promoCodes || [];
  const freeFrom = CACHE.freeFrom;
  root.innerHTML = `
  <div class="admin-card" style="margin-bottom:18px">
    <h3 style="margin-bottom:14px">Vente globale & livraison offerte</h3>
    <div class="form-2col">
      <div class="field" style="display:flex;align-items:center;gap:10px">
        <input type="checkbox" id="pr-on" ${promo.active ? 'checked' : ''} style="width:auto">
        <label for="pr-on" style="margin:0;text-transform:none;letter-spacing:0">Soldes actives</label>
      </div>
      <div class="field"><label>Remise globale (%)</label><input id="pr-pct" type="number" min="0" max="90" value="${Number(promo.percent) || 0}"></div>
      <div class="field"><label>Livraison offerte dès (DA, vide = jamais)</label><input id="pr-free" type="number" min="0" value="${freeFrom ?? ''}" placeholder="ex. 15000"></div>
    </div>
    <button class="btn accent" id="pr-save">Enregistrer</button>
  </div>
  <div class="admin-card">
    <div class="admin-toolbar"><b>Codes promo (${codes.length})</b><button class="btn accent" id="new-code">+ Nouveau code</button></div>
    <div style="overflow-x:auto">
    <table class="adm">
      <thead><tr><th>Code</th><th>%</th><th>Min.</th><th>Actif</th><th></th></tr></thead>
      <tbody>
        ${codes.map(c => `
        <tr>
          <td><b>${esc(c.code)}</b></td><td>−${c.percent}%</td>
          <td>${esc(DB.fmtPrice(c.min_order || 0))}</td>
          <td>${c.active ? '✓' : '—'}</td>
          <td><div class="row-actions-adm">
            <button class="mini-btn" data-cedit="${c.id}">Modifier</button>
            <button class="mini-btn danger" data-cdel="${c.id}">Suppr.</button>
          </div></td>
        </tr>`).join('') || '<tr><td colspan="5" style="text-align:center;color:var(--ink-soft)">Ex. BIENVENUE10 — créez votre premier code.</td></tr>'}
      </tbody>
    </table>
    </div>
  </div>`;

  root.querySelector('#pr-save').onclick = async () => {
    const pct = Math.min(Math.max(Number(root.querySelector('#pr-pct').value) || 0, 0), 90);
    const freeRaw = root.querySelector('#pr-free').value.trim();
    const free = freeRaw === '' ? null : Math.max(0, Number(freeRaw) || 0);
    try {
      await DB.Admin.savePromo({ active: root.querySelector('#pr-on').checked, percent: pct });
      await DB.Admin.saveFreeDelivery(free);
      CACHE.promo = { active: root.querySelector('#pr-on').checked, percent: pct };
      CACHE.freeFrom = free;
      toast('Enregistré ✓');
    } catch (err) { toast('Erreur : ' + err.message); }
  };
  root.querySelector('#new-code').onclick = () => promoModal(null);
  root.querySelectorAll('[data-cedit]').forEach(b => b.onclick = () => {
    const c = codes.find(x => String(x.id) === String(b.dataset.cedit));
    promoModal(c);
  });
  root.querySelectorAll('[data-cdel]').forEach(b => b.onclick = async () => {
    if (!confirm('Supprimer ce code ?')) return;
    try {
      await DB.Admin.deletePromoCode(Number(b.dataset.cdel) || b.dataset.cdel);
      CACHE.promoCodes = CACHE.promoCodes.filter(x => String(x.id) !== String(b.dataset.cdel));
      toast('Supprimé ✓');
      renderTab();
    } catch (err) { toast('Erreur : ' + err.message); }
  });
}

function promoModal(c) {
  const isNew = !c;
  const el = document.createElement('div');
  el.className = 'modal-bg';
  el.innerHTML = `
  <div class="modal">
    <h3>${isNew ? 'Nouveau code' : 'Modifier ' + esc(c.code)}</h3>
    <form id="pc-form">
      <div class="field"><label>Code *</label><input id="pc-code" required value="${esc(c?.code || '')}" placeholder="BIENVENUE10" style="text-transform:uppercase"></div>
      <div class="form-2col">
        <div class="field"><label>Remise (%)</label><input id="pc-pct" type="number" min="1" max="90" value="${c?.percent ?? 10}"></div>
        <div class="field"><label>Minimum (DA)</label><input id="pc-min" type="number" min="0" value="${c?.min_order ?? 0}"></div>
      </div>
      <label style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
        <input type="checkbox" id="pc-on" ${(isNew || c?.active) ? 'checked' : ''} style="width:auto"> Actif
      </label>
      <div class="row-actions-adm">
        <button type="submit" class="btn accent">Enregistrer</button>
        <button type="button" class="mini-btn" id="pc-cancel">Annuler</button>
      </div>
    </form>
  </div>`;
  document.body.appendChild(el);
  el.addEventListener('click', e => { if (e.target === el) el.remove(); });
  el.querySelector('#pc-cancel').onclick = () => el.remove();
  el.querySelector('#pc-form').addEventListener('submit', async ev => {
    ev.preventDefault();
    const row = {
      code: el.querySelector('#pc-code').value.trim().toUpperCase(),
      percent: Math.min(Math.max(Number(el.querySelector('#pc-pct').value) || 0, 1), 90),
      min_order: Math.max(0, Number(el.querySelector('#pc-min').value) || 0),
      active: el.querySelector('#pc-on').checked,
    };
    if (!isNew) row.id = c.id;
    try {
      await DB.Admin.savePromoCode(row);
      await loadAll();
      toast('Enregistré ✓');
      el.remove();
      renderTabs();
    } catch (err) { toast('Erreur : ' + err.message); }
  });
}
