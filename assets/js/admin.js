/* AURÈS CÉRAMIQUE — admin: login, shell, stats, inquiries, settings.
   French-only (like urban-dz admin). Product/category CRUD in admin-extra.js */

const CACHE = { products: [], categories: [], inquiries: [], settings: {}, orders: [], zones: [], promo: {}, freeFrom: null, promoCodes: [] };

const esc2 = esc;

/* ---------- login gate ---------- */
function renderLogin() {
  const root = document.getElementById('admin-root');
  if (!DB.live()) {
    root.innerHTML = `
    <div class="admin-shell">
      <div class="admin-card text-center" style="max-width:520px;margin:60px auto">
        <h2 style="margin-bottom:14px">Mode démo</h2>
        <p style="color:var(--ink-soft)">L'administration nécessite Supabase.<br>
        Renseignez <code>assets/js/config.js</code> puis exécutez <code>supabase/schema.sql</code>.</p>
        <a class="btn line mt-2" href="/">← Retour au site</a>
      </div>
    </div>`;
    return;
  }
  root.innerHTML = `
  <div class="login-box admin-card">
    <h2 style="margin-bottom:6px">Aurès Céramique</h2>
    <p style="color:var(--ink-soft);margin-bottom:20px">Connexion administration</p>
    <form id="login-form">
      <div class="field"><label>E-mail</label><input id="lg-email" type="email" required autocomplete="username"></div>
      <div class="field"><label>Mot de passe</label><input id="lg-pass" type="password" required autocomplete="current-password"></div>
      <button class="btn accent" style="width:100%">Se connecter</button>
      <p id="lg-err" style="color:#b3402e;margin-top:10px;font-size:.88rem"></p>
    </form>
    <a href="/" style="display:block;margin-top:16px;font-size:.88rem;color:var(--ink-soft)">← Retour au site</a>
  </div>`;
  document.getElementById('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    try {
      await DB.Admin.signIn(
        document.getElementById('lg-email').value.trim(),
        document.getElementById('lg-pass').value);
    } catch {
      document.getElementById('lg-err').textContent = 'E-mail ou mot de passe incorrect.';
    }
  });
}

/* ---------- shell + routing ---------- */
let ACTIVE_TAB = 'pieces';

function renderShell() {
  const root = document.getElementById('admin-root');
  root.innerHTML = `
  <div class="admin-shell">
    <div class="admin-head">
      <div>
        <span class="kicker">Administration</span>
        <h2 style="font-size:1.7rem">Aurès Céramique</h2>
      </div>
      <div class="row-actions-adm">
        <a class="mini-btn" href="/" target="_blank">Voir le site ↗</a>
        <button class="mini-btn danger" id="logout-btn">Déconnexion</button>
      </div>
    </div>
    <div class="admin-tabs" id="adm-tabs"></div>
    <div id="adm-body"></div>
  </div>`;
  document.getElementById('logout-btn').onclick = () => DB.Admin.signOut();
  renderTabs();
}

function renderTabs() {
  const newOrders = (CACHE.orders || []).filter(o => o.status === 'new').length;
  const tabs = [
    ['pieces', 'Pièces'],
    ['categories', 'Catégories'],
    ['commandes', `Commandes${newOrders ? ` (${newOrders})` : ''}`],
    ['zones', 'Livraison'],
    ['promos', 'Promos'],
    ['demandes', `Demandes${CACHE.inquiries.filter(i => i.status === 'new').length ? ` (${CACHE.inquiries.filter(i => i.status === 'new').length})` : ''}`],
    ['boutique', 'Boutique'],
  ];
  document.getElementById('adm-tabs').innerHTML =
    tabs.map(([id, label]) =>
      `<button class="admin-tab${ACTIVE_TAB === id ? ' on' : ''}" data-tab="${id}">${label}</button>`).join('');
  document.getElementById('adm-tabs').onclick = e => {
    const b = e.target.closest('[data-tab]');
    if (!b) return;
    ACTIVE_TAB = b.dataset.tab;
    renderTabs();
    renderTab();
  };
  renderTab();
}

function renderTab() {
  const body = document.getElementById('adm-body');
  switch (ACTIVE_TAB) {
    case 'pieces': return tabProducts(body);
    case 'categories': return tabCategories(body);
    case 'commandes': return tabOrders(body);
    case 'zones': return tabZones(body);
    case 'promos': return tabPromos(body);
    case 'demandes': return tabInquiries(body);
    case 'boutique': return tabSettings(body);
  }
}

/* ---------- inquiries ---------- */
async function tabInquiries(root) {
  const list = CACHE.inquiries;
  if (!list.length) {
    root.innerHTML = '<div class="admin-card results-zero">Aucune demande reçue pour le moment.</div>';
    return;
  }
  root.innerHTML = `
  <div class="admin-card" style="overflow-x:auto">
    <table class="adm">
      <thead><tr><th>Date</th><th>Nom</th><th>Téléphone</th><th>Pièce</th><th>Message</th><th>Statut</th><th></th></tr></thead>
      <tbody>
        ${list.map(q => `
        <tr>
          <td>${new Date(q.created_at).toLocaleDateString('fr-DZ')}<br>
              <small style="color:var(--ink-soft)">${new Date(q.created_at).toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' })}</small></td>
          <td>${esc2(q.name)}${q.email ? `<br><small style="color:var(--ink-soft)">${esc2(q.email)}</small>` : ''}</td>
          <td><a href="tel:${esc2(q.phone)}">${esc2(q.phone)}</a><br>
              ${waNumber() || q.phone ? `<small><a href="https://wa.me/${esc2(String(q.phone).replace(/^0/, '213'))}" target="_blank" rel="noopener" style="color:#3f9c57">WhatsApp ↗</a></small>` : ''}</td>
          <td>${q.product_id
            ? (() => { const p = CACHE.products.find(p => p.id === q.product_id);
                       return p ? esc2(p.name_fr) : '#' + q.product_id; })()
            : '—'}</td>
          <td style="max-width:260px">${esc2(q.message || '—')}</td>
          <td><span class="${q.status === 'new' ? 'badge-new' : 'badge-read'}">${q.status === 'new' ? 'Nouveau' : 'Lu'}</span></td>
          <td><button class="mini-btn" data-toggle="${q.id}">${q.status === 'new' ? 'Marquer lu' : 'Rouvrir'}</button></td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>`;

  root.querySelectorAll('[data-toggle]').forEach(b => b.onclick = async () => {
    const q = list.find(x => x.id === Number(b.dataset.toggle));
    if (!q) return;
    q.status = q.status === 'new' ? 'read' : 'new';
    if (DB.live()) {
      const { error } = await DB.Admin.table('inquiries').update({ status: q.status }).eq('id', q.id);
      if (error) { toast('Erreur : ' + error.message); return; }
    } else saveDemoInquiries(CACHE.inquiries);
    renderTabs();
  });
}

/* ---------- settings ---------- */
async function tabSettings(root) {
  const s = CACHE.settings;
  const st = s.store || {};
  const an = s.announce || {};
  const so = s.socials || {};
  root.innerHTML = `
  <div class="admin-card">
    <form id="set-form">
      <h3 style="margin-bottom:16px">Coordonnées</h3>
      <div class="form-2col">
        <div class="field"><label>Nom de l'atelier</label><input id="s-name" value="${esc2(st.name || '')}"></div>
        <div class="field"><label>Téléphone</label><input id="s-phone" value="${esc2(st.phone || '')}" placeholder="0555 12 34 56"></div>
        <div class="field"><label>E-mail</label><input id="s-email" type="email" value="${esc2(st.email || '')}"></div>
        <div class="field"><label>WhatsApp (format international, sans +)</label><input id="s-wa" value="${esc2(s.whatsapp || '')}" placeholder="213555123456"></div>
        <div class="field"><label>Adresse</label><input id="s-address" value="${esc2(s.address || '')}"></div>
      </div>

      <h3 style="margin:22px 0 16px">Bandeau d'annonce</h3>
      <div class="field" style="display:flex;align-items:center;gap:10px">
        <input type="checkbox" id="s-an-on" ${an.active ? 'checked' : ''} style="width:auto">
        <label for="s-an-on" style="margin:0;text-transform:none;letter-spacing:0">Afficher le bandeau</label>
      </div>
      <div class="form-2col">
        <div class="field"><label>Texte (FR)</label><input id="s-an-fr" value="${esc2(an.text_fr || '')}"></div>
        <div class="field"><label>Texte (AR)</label><input id="s-an-ar" dir="rtl" value="${esc2(an.text_ar || '')}"></div>
        <div class="field"><label>Texte (EN)</label><input id="s-an-en" value="${esc2(an.text_en || '')}"></div>
      </div>

      <h3 style="margin:22px 0 16px">Réseaux sociaux</h3>
      <div class="form-2col">
        <div class="field"><label>Instagram</label><input id="s-ig" value="${esc2(so.instagram || '')}"></div>
        <div class="field"><label>Facebook</label><input id="s-fb" value="${esc2(so.facebook || '')}"></div>
        <div class="field"><label>TikTok</label><input id="s-tt" value="${esc2(so.tiktok || '')}"></div>
      </div>

      <button class="btn accent" type="submit">Enregistrer</button>
    </form>
  </div>`;

  root.querySelector('#set-form').addEventListener('submit', async e => {
    e.preventDefault();
    const g = id => root.querySelector(id).value.trim();
    const updates = {
      store: { name: g('#s-name'), phone: g('#s-phone'), email: g('#s-email') },
      whatsapp: g('#s-wa'),
      address: g('#s-address'),
      announce: {
        active: root.querySelector('#s-an-on').checked,
        text_fr: g('#s-an-fr'), text_ar: g('#s-an-ar'), text_en: g('#s-an-en'),
      },
      socials: { instagram: g('#s-ig'), facebook: g('#s-fb'), tiktok: g('#s-tt') },
    };
    if (DB.live()) {
      for (const [key, value] of Object.entries(updates)) {
        const { error } = await DB.Admin.table('settings')
          .update({ value, updated_at: new Date().toISOString() }).eq('key', key);
        if (error) { toast('Erreur : ' + error.message); return; }
      }
    }
    Object.assign(CACHE.settings, updates);
    window.SETTINGS_CACHE = CACHE.settings;
    toast('Enregistré ✓');
  });
}

/* ---------- boot ---------- */
async function loadAll() {
  try {
    const [products, categories, settings] = await Promise.all([
      DB.listProducts({}), DB.listCategories(), DB.getSettings(),
    ]);
    CACHE.products = products;
    CACHE.categories = categories;
    CACHE.settings = settings;
    CACHE.zones = Array.isArray(settings.zones) ? settings.zones : [];
    CACHE.promo = settings.promo || { active: false, percent: 0 };
    CACHE.freeFrom = (typeof settings.free_delivery_from === 'number') ? settings.free_delivery_from : null;

    try { CACHE.orders = await DB.Admin.getOrders(); } catch { CACHE.orders = []; }
    try { CACHE.promoCodes = await DB.Admin.getPromoCodes(); } catch { CACHE.promoCodes = []; }

    if (DB.live()) {
      const { data, error } = await DB.Admin.table('inquiries')
        .select('*').order('created_at', { ascending: false });
      CACHE.inquiries = error ? [] : (data || []);
    } else {
      CACHE.inquiries = demoInquiries();
    }

    /* include inactive products for the admin lists */
    if (DB.live()) {
      const { data } = await DB.Admin.table('products').select('*').order('id', { ascending: false });
      if (data) CACHE.products = data;
    }
  } catch (e) { toast('Chargement : ' + e.message); }
}

async function boot() {
  if (!DB.live()) { renderLogin(); return; }
  DB.Admin.onAuth(async logged => {
    if (!logged) { renderLogin(); return; }
    const owner = await DB.Admin.isOwner();
    if (!owner) {
      document.getElementById('admin-root').innerHTML =
        `<div class="admin-card text-center" style="max-width:480px;margin:60px auto">
           <h2 style="margin-bottom:12px">Accès refusé</h2>
           <p style="color:var(--ink-soft)">Ce compte n'est pas propriétaire de la boutique.</p>
         </div>`;
      await DB.Admin.signOut();
      return;
    }
    await loadAll();
    renderShell();
  });
}

boot();
