/* AURÈS CÉRAMIQUE — database layer.
   Live mode talks to Supabase; DEMO mode serves sample pieces from memory
   and keeps demo inquiries/orders in localStorage, so the whole site works offline.
   v2 adds the shop engine (prices, stock, COD orders, zones, promos) while
   keeping the atelier story (inquiries, WhatsApp, heritage). */

/* ---------- demo catalogue ---------- */
const DEMO_CATEGORIES = [
  { id: 1, name_fr: 'Assiettes',   name_ar: 'أطباق',    name_en: 'Plates', image: 'assets/img/demo/cat-assiettes.jpg' },
  { id: 2, name_fr: 'Tasses & bols', name_ar: 'أكواب وأواني', name_en: 'Cups & bowls', image: 'assets/img/demo/cat-tasses.jpg' },
  { id: 3, name_fr: 'Vases',       name_ar: 'مزهريات',  name_en: 'Vases', image: 'assets/img/demo/cat-vases.jpg' },
  { id: 4, name_fr: 'Tajines',     name_ar: 'طواجن',    name_en: 'Tajines', image: 'assets/img/demo/cat-tajines.jpg' },
  { id: 5, name_fr: 'Couscoussiers', name_ar: 'كسكاس',  name_en: 'Couscous dishes', image: 'assets/img/demo/cat-couscoussiers.jpg' },
  { id: 6, name_fr: 'Pièces déco', name_ar: 'قطع زخرفية', name_en: 'Decorative', image: 'assets/img/demo/cat-deco.jpg' },
  { id: 7, name_fr: 'Jarres & qullas', name_ar: 'قلال وجرار', name_en: 'Jars & qullas', image: 'assets/img/demo/cat-qullas.jpg' },
];

let _demoId = 100;

function dp(name_fr, name_ar, name_en, category_id, hue, colors, dims, featured, photo, price, stock, compare) {
  return {
    id: ++_demoId,
    name_fr, name_ar, name_en,
    description_fr: 'Façonnée et peinte à la main dans notre atelier. Chaque pièce est unique : les tons et les motifs peuvent varier légèrement d’une série à l’autre.',
    description_ar: 'مشكَّلة ومزيَّنة يدويًا في ورشتنا. كل قطعة فريدة: قد تختلف الدرجات والزخارف قليلًا من سلسلة إلى أخرى.',
    description_en: 'Shaped and hand-painted in our workshop. Each piece is unique: tones and patterns may vary slightly from one series to another.',
    photos: [photo || ''], colors: colors || [],
    dimensions: dims, material: '',
    category_id, featured: !!featured, active: true,
    price: price || 0, compare_at_price: compare || null,
    stock: (stock == null ? 8 : stock),
    _hue: hue,
  };
}

const DEMO_PRODUCTS = [
  dp('Assiette Bleu Chaoui', 'طبق شاوي أزرق', 'Chaoui Blue Plate', 1, 210, ['Bleu', 'Blanc'], 'Ø 27 cm', true, 'assets/img/demo/piece-01.jpg', 2400, 12, 2900),
  dp('Assiette Murale des Aurès', 'طبق جداري من الأوراس', 'Aurès Wall Plate', 1, 25, ['Bleu', 'Ocre'], 'Ø 32 cm', false, 'assets/img/demo/piece-02.jpg', 3200, 6, null),
  dp('Service Chaoui 6 Assiettes', 'طقم شاوي 6 أطباق', 'Chaoui 6-Plate Set', 1, 200, ['Bleu', 'Vert', 'Terre cuite'], 'Ø 24 cm', true, 'assets/img/demo/piece-03.jpg', 12500, 4, 14900),
  dp('Tasse Chaouie Peinte Main', 'كوب شاوي مرسوم يدويًا', 'Hand-Painted Chaoui Cup', 2, 35, ['Blanc', 'Crème'], 'H 9 cm – 220 ml', false, 'assets/img/demo/piece-04.jpg', 950, 30, null),
  dp('Bol à Harira Terre de l’Aurès', 'وعاء حريرة من طين الأوراس', 'Aurès Clay Harira Bowl', 2, 40, ['Sable', 'Ocre'], 'Ø 14 cm', true, 'assets/img/demo/piece-05.jpg', 1400, 20, null),
  dp('Grand Bol Chaoui Ocre', 'وعاء شاوي كبير بلون المغرة', 'Large Chaoui Ochre Bowl', 2, 30, ['Ocre', 'Sable'], 'Ø 16 cm', false, 'assets/img/demo/piece-06.jpg', 1800, 15, 2200),
  dp('Vase Chaoui Bleu Nuit', 'مزهرية شاوية زرقاء داكنة', 'Chaoui Night-Blue Vase', 3, 175, ['Bleu', 'Noir'], 'H 38 cm', true, 'assets/img/demo/piece-07.jpg', 6800, 5, null),
  dp('Vase Blanc des Cimes', 'مزهرية بيضاء من القمم', 'White Highlands Vase', 3, 160, ['Blanc', 'Crème'], 'H 28 cm', false, 'assets/img/demo/piece-08.jpg', 5400, 7, null),
  dp('Tajine Chaoui Terre Rouge', 'طاجين شاوي بالطين الأحمر', 'Chaoui Red-Clay Tajine', 4, 20, ['Terre cuite', 'Rouge'], 'Ø 30 cm', true, 'assets/img/demo/piece-09.jpg', 3900, 10, 4500),
  dp('Tajine de Service Aurès', 'طاجين تقديم أوراسي', 'Aurès Serving Tajine', 4, 15, ['Terre cuite', 'Noir'], 'Ø 26 cm', false, 'assets/img/demo/piece-10.jpg', 3400, 9, null),
  dp('Couscoussier des Aurès', 'كسكاس الأوراس التقليدي', 'Aurès Couscoussier', 5, 45, ['Terre cuite', 'Ocre'], 'H 34 cm', true, 'assets/img/demo/piece-11.jpg', 8900, 3, null),
  dp('Oiseau Chaoui en Terre', 'طائر شاوي من الطين', 'Chaoui Clay Bird', 6, 18, ['Terre cuite', 'Rouge'], 'H 22 cm', false, 'assets/img/demo/piece-12.jpg', 2800, 5, null),
  dp('Qulla Noire des Aurès', 'قلة سوداء من الأوراس', 'Black Aurès Qulla', 7, 10, ['Noir'], 'H 32 cm', true, 'assets/img/demo/piece-13.jpg', 5400, 6, null),
  dp('Pichet Chaoui à Motifs', 'إبريق شاوي مزخرف', 'Patterned Chaoui Pitcher', 2, 35, ['Sable', 'Marron'], 'H 18 cm', false, 'assets/img/demo/piece-14.jpg', 3200, 8, null),
];

const DEMO_ZONES = [
  { code: 16, name: 'Alger', desk: 400, home: 500 },
  { code: 31, name: 'Oran', desk: 450, home: 650 },
  { code: 25, name: 'Constantine', desk: 450, home: 650 },
  { code: 9, name: 'Blida', desk: 400, home: 500 },
  { code: 19, name: 'Sétif', desk: 450, home: 700 },
  { code: 23, name: 'Annaba', desk: 450, home: 700 },
  { code: 15, name: 'Tizi Ouzou', desk: 450, home: 650 },
  { code: 30, name: 'Ouargla', desk: 700, home: 1100 },
];

const DEMO_SETTINGS = {
  store: { name: 'Aurès Céramique', phone: '', email: '' },
  hero: '',
  whatsapp: '',
  announce: { active: false, text_fr: '', text_ar: '', text_en: '' },
  socials: { instagram: '', facebook: '', tiktok: '' },
  address: '',
  verifications: {
    'facebook-domain-verification': '',
    'tiktok-developers-site-verification': '',
    'google-site-verification': '',
  },
  zones: DEMO_ZONES,
  promo: { active: false, percent: 0, label_fr: '', label_ar: '', label_en: '' },
  free_delivery_from: null,
};

let _demoPromoCodes = [{ id: 1, code: 'BIENVENUE10', percent: 10, min_order: 0, active: true }];

function demoInquiries() {
  try { return JSON.parse(localStorage.getItem('tc_demo_inquiries')) || []; }
  catch { return []; }
}
function saveDemoInquiries(o) { localStorage.setItem('tc_demo_inquiries', JSON.stringify(o)); }
function demoOrders() {
  try { return JSON.parse(localStorage.getItem('tc_demo_orders')) || []; }
  catch { return []; }
}
function saveDemoOrders(o) { localStorage.setItem('tc_demo_orders', JSON.stringify(o)); }
function demoJSON(key, fb) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fb; } catch { return fb; }
}

/* ---------- the DB facade ---------- */
const DB = (() => {
  let client = null;
  if (!window.IS_DEMO && window.supabase) {
    client = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
  }
  const live = () => !!client;

  function must(res) {
    if (res && res.error) throw res.error;
    return res ? res.data : null;
  }

  function catName(c) {
    if (LANG === 'ar') return c.name_ar || c.name_fr;
    if (LANG === 'en') return c.name_en || c.name_fr;
    return c.name_fr;
  }

  function fmtPrice(n) {
    const v = Number(n) || 0;
    try {
      const loc = LANG === 'ar' ? 'ar-DZ' : LANG === 'en' ? 'en-US' : 'fr-FR';
      const cur = LANG === 'ar' ? 'دج' : 'DA';
      return `${v.toLocaleString(loc)} ${cur}`;
    } catch { return `${v} DA`; }
  }

  function photoOf(p, i = 0) {
    if (p && p.photos && p.photos[i]) return p.photos[i];
    if (p && p.photo) return p.photo;
    return '';
  }

  async function listCategories() {
    if (!live()) return DEMO_CATEGORIES.map((c) => ({
      ...c,
      label: catName(c),
      image: c.image || (typeof placeholder === 'function' ? placeholder(catName(c), 25) : ''),
    }));
    const { data, error } = await client.from('categories').select('*').order('sort');
    if (error) throw error;
    return (data || []).map(c => ({ ...c, label: catName(c) }));
  }

  function decorate(p) {
    return { ...p, photo: p.photos && p.photos[0] ? p.photos[0] : '' };
  }

  async function listProducts({ category, search = '', sort = 'new' } = {}) {
    let items;
    if (!live()) items = DEMO_PRODUCTS.filter(p => p.active);
    else {
      const { data, error } = await client.from('products').select('*').eq('active', true);
      if (error) throw error;
      items = data || [];
    }
    if (category) items = items.filter(p => p.category_id === Number(category));
    if (search) {
      const s = search.toLowerCase();
      items = items.filter(p =>
        [p.name_fr, p.name_ar, p.name_en].some(n => (n || '').toLowerCase().includes(s)));
    }
    if (sort === 'az') {
      items.sort((a, b) => String(productName(a)).localeCompare(String(productName(b))));
    } else if (sort === 'price_asc') {
      items.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sort === 'price_desc') {
      items.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else {
      items.sort((a, b) => b.id - a.id);
    }
    return items.map(decorate);
  }

  async function getFeatured() {
    if (!live()) return DEMO_PRODUCTS.filter(p => p.active && p.featured).map(decorate);
    const { data, error } = await client.from('products').select('*').eq('active', true).eq('featured', true);
    if (error) throw error;
    return (data || []).map(decorate);
  }

  async function getProduct(id) {
    if (!live()) {
      const found = DEMO_PRODUCTS.find(p => p.id === Number(id));
      return found ? decorate(found) : null;
    }
    const { data, error } = await client.from('products').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? decorate(data) : null;
  }

  async function getSettings() {
    if (!live()) return JSON.parse(JSON.stringify(DEMO_SETTINGS));
    const rows = await Promise.all(['store', 'hero', 'whatsapp', 'announce',
      'socials', 'address', 'verifications', 'zones', 'promo', 'free_delivery_from']
      .map(k => client.from('settings').select('key,value').eq('key', k).maybeSingle()));
    const out = {};
    rows.forEach(r => { if (r.data) out[r.data.key] = r.data.value; });
    out.store = out.store || { name: 'Aurès Céramique', phone: '', email: '' };
    out.hero = typeof out.hero === 'string' ? out.hero : '';
    out.whatsapp = typeof out.whatsapp === 'string' ? out.whatsapp : '';
    out.address = typeof out.address === 'string' ? out.address : '';
    out.announce = out.announce && typeof out.announce === 'object'
      ? out.announce : { active: false, text_fr: '', text_ar: '', text_en: '' };
    out.socials = out.socials && typeof out.socials === 'object'
      ? out.socials : { instagram: '', facebook: '', tiktok: '' };
    out.verifications = out.verifications && typeof out.verifications === 'object'
      ? out.verifications
      : { 'facebook-domain-verification': '', 'tiktok-developers-site-verification': '', 'google-site-verification': '' };
    if (!Array.isArray(out.zones)) out.zones = [];
    if (!out.promo || typeof out.promo !== 'object') out.promo = { active: false, percent: 0 };
    if (typeof out.free_delivery_from !== 'number') out.free_delivery_from = null;
    return out;
  }

  async function getZones() {
    if (!live()) return demoJSON('tc_demo_zones', DEMO_ZONES);
    const { data, error } = await client.from('settings').select('value').eq('key', 'zones').maybeSingle();
    if (error) throw error;
    return Array.isArray(data?.value) ? data.value : [];
  }

  async function getPromo() {
    if (!live()) return demoJSON('tc_demo_promo', { active: false, percent: 0 });
    const { data, error } = await client.from('settings').select('value').eq('key', 'promo').maybeSingle();
    if (error) throw error;
    return data?.value || { active: false, percent: 0 };
  }

  async function getFreeDeliveryFrom() {
    if (!live()) return demoJSON('tc_demo_free', null);
    const { data, error } = await client.from('settings').select('value').eq('key', 'free_delivery_from').maybeSingle();
    if (error) throw error;
    return typeof data?.value === 'number' ? data.value : null;
  }

  async function checkPromo(code, subtotal) {
    if (!live()) {
      const c = _demoPromoCodes.find(x => x.active && x.code.toUpperCase() === String(code || '').trim().toUpperCase());
      if (!c) throw new Error('INVALID_PROMO');
      if (Number(subtotal) < Number(c.min_order || 0)) throw new Error('PROMO_MIN_ORDER');
      return { code: c.code, percent: c.percent, min_order: c.min_order };
    }
    const { data, error } = await client.rpc('check_promo', { p_code: code, p_sub: subtotal });
    if (error) throw error;
    return data;
  }

  function effUnitDemo(price) {
    const promo = demoJSON('tc_demo_promo', { active: false, percent: 0 });
    const pct = promo && promo.active ? Math.min(Math.max(Number(promo.percent) || 0, 0), 90) : 0;
    return Math.round(Number(price) * (100 - pct)) / 100;
  }

  async function placeOrder({ customer_name, phone, address, zone, items, promo_code, delivery_type }) {
    const deliv = delivery_type === 'desk' ? 'desk' : 'home';
    if (!live()) {
      const freeFrom = demoJSON('tc_demo_free', null);
      const priced = items.map(l => {
        const p = DEMO_PRODUCTS.find(x => String(x.id) === String(l.product_id));
        if (!p || !p.active) throw new Error('PRODUCT_UNAVAILABLE');
        const qty = Number(l.qty) || 0;
        if (qty < 1 || qty > 20) throw new Error('INVALID_CART');
        if ((p.stock || 0) < qty) throw new Error('OUT_OF_STOCK');
        const color = l.color || l.size || '';
        if ((p.colors || []).length && !(p.colors.includes(color))) throw new Error('INVALID_VARIANT');
        const unit = effUnitDemo(p.price);
        return { ...l, color, price: unit, base_price: Number(p.price) || 0,
                 name_fr: p.name_fr, name_ar: p.name_ar, name_en: p.name_en,
                 photo: (p.photos || [])[0] || '' };
      });
      let subtotal = priced.reduce((s, l) => s + l.price * l.qty, 0);
      let discount = 0, appliedCode = '';
      const code = String(promo_code || '').trim().toUpperCase();
      if (code) {
        const c = _demoPromoCodes.find(x => x.active && x.code.toUpperCase() === code);
        if (!c) throw new Error('INVALID_PROMO');
        if (subtotal < Number(c.min_order || 0)) throw new Error('PROMO_MIN_ORDER');
        discount = Math.round(subtotal * c.percent) / 100;
        appliedCode = c.code;
      }
      const zones = demoJSON('tc_demo_zones', DEMO_ZONES);
      const z = zones.find(zz => zz.name === zone) || {};
      let fee = Number(deliv === 'desk' ? z.desk : z.home) || 0;
      if (!z.name) throw new Error('UNKNOWN_ZONE');
      if (freeFrom > 0 && (subtotal - discount) >= freeFrom) fee = 0;
      const cleanPhone = validDzPhone(phone);
      if (!cleanPhone) throw new Error('INVALID_PHONE');
      const orders = demoOrders();
      const order = {
        id: (orders.length ? orders[orders.length - 1].id : 1000) + 1,
        created_at: new Date().toISOString(),
        customer_name, phone: cleanPhone, address, zone,
        delivery_fee: fee, items: priced, subtotal, discount,
        promo_code: appliedCode, total: subtotal - discount + fee, status: 'new',
        delivery_type: deliv, carrier: '', tracking_number: '',
      };
      orders.push(order);
      saveDemoOrders(orders);
      return { id: order.id, subtotal, discount, promo_code: appliedCode,
               delivery_fee: fee, delivery_type: deliv, total: order.total };
    }
    const lines = items.map(i => ({ product_id: i.product_id, qty: Number(i.qty) || 0, color: i.color || i.size || '' }));
    try {
      const { data, error } = await client.rpc('place_order', {
        p_name: customer_name, p_phone: phone, p_address: address,
        p_zone: zone, p_items: lines, p_promo_code: promo_code || '',
        p_delivery_type: deliv,
      });
      if (error) throw error;
      return data;
    } catch (e) {
      if (e?.code === 'PGRST202' || /does not exist/i.test(e?.message || '')) {
        const { data, error } = await client.rpc('place_order', {
          p_name: customer_name, p_phone: phone, p_address: address,
          p_zone: zone, p_items: lines, p_promo_code: promo_code || '',
        });
        if (error) throw error;
        return data;
      }
      throw e;
    }
  }

  async function trackOrder(id, phone) {
    if (!live()) {
      const last8 = s => String(s || '').replace(/\D/g, '').slice(-8);
      const o = demoOrders().find(
        o => String(o.id) === String(id) && last8(o.phone) === last8(phone));
      if (!o) throw new Error('NOT_FOUND');
      return o;
    }
    const { data, error } = await client.rpc('track_order', { p_id: Number(id), p_phone: phone });
    if (error) throw error;
    return data;
  }

  function validDzPhone(phone) {
    const d = String(phone || '').replace(/\D/g, '').replace(/^00/, '').replace(/^213/, '').replace(/^0/, '');
    return /^[567]\d{8}$/.test(d) ? '0' + d : null;
  }

  /* Public contact form → inquiries RPC (rate-limited server-side). */
  async function submitInquiry({ name, phone, email, message, productId }) {
    const cleanPhone = validDzPhone(phone);
    if (!cleanPhone) throw new Error('INVALID_PHONE');

    if (!live()) {
      const list = demoInquiries();
      const recent = list.filter(q =>
        q.phone === cleanPhone &&
        new Date(q.created_at) > new Date(Date.now() - 3600000)).length;
      if (recent >= 5) throw new Error('TOO_MANY');
      list.unshift({
        id: Date.now(), name: String(name).slice(0, 120), phone: cleanPhone,
        email: String(email || '').slice(0, 160), message: String(message || '').slice(0, 1000),
        product_id: productId || null, status: 'new',
        created_at: new Date().toISOString(),
      });
      saveDemoInquiries(list);
      return { ok: true };
    }

    const { data, error } = await client.rpc('submit_inquiry', {
      p_name: name, p_phone: phone, p_email: email || '',
      p_message: message || '', p_product_id: productId || null,
    });
    if (error) {
      const msg = error.message || '';
      if (msg.includes('INVALID_PHONE')) throw new Error('INVALID_PHONE');
      if (msg.includes('TOO_MANY')) throw new Error('TOO_MANY');
      throw new Error('FAILED');
    }
    return data;
  }

  /* ----- admin-only operations (live mode only for writes, demo reads ok) ----- */
  const Admin = {
    active() { return live(); },
    async signIn(email, password) {
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    async signOut() { await client.auth.signOut(); },
    onAuth(cb) {
      client.auth.onAuthStateChange((_e, session) => cb(!!session));
    },
    async getSession() {
      const { data } = await client.auth.getSession();
      return !!(data && data.session);
    },
    async isOwner() {
      const { count } = await client.from('owners').select('*', { count: 'exact', head: true });
      return count === 1;
    },
    table(name) { return client.from(name); },

    async getOrders() {
      if (!live()) return [...demoOrders()].reverse();
      const { data, error } = await client.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    async updateOrderStatus(id, status) {
      if (!live()) {
        const orders = demoOrders();
        const o = orders.find(x => String(x.id) === String(id));
        if (o) o.status = status;
        saveDemoOrders(orders);
        return;
      }
      const { error } = await client.from('orders').update({ status }).eq('id', id);
      if (error) throw error;
    },
    async saveOrderShipping(id, carrier, tracking_number) {
      const patch = {
        carrier: String(carrier || '').trim().slice(0, 40),
        tracking_number: String(tracking_number || '').trim().slice(0, 60),
      };
      if (!live()) {
        const orders = demoOrders();
        const o = orders.find(x => String(x.id) === String(id));
        if (o) Object.assign(o, patch);
        saveDemoOrders(orders);
        return;
      }
      const { error } = await client.from('orders').update(patch).eq('id', id);
      if (error) throw error;
    },
    async deleteOrder(id) {
      if (!live()) { saveDemoOrders(demoOrders().filter(x => String(x.id) !== String(id))); return; }
      const { error } = await client.from('orders').delete().eq('id', id);
      if (error) throw error;
    },
    async getPromoCodes() {
      if (!live()) return _demoPromoCodes;
      const { data, error } = await client.from('promo_codes').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    async savePromoCode(c) {
      if (!live()) {
        if (c.id) { const i = _demoPromoCodes.findIndex(x => x.id === c.id); if (i >= 0) _demoPromoCodes[i] = c; }
        else _demoPromoCodes.push({ ...c, id: Date.now() });
        return;
      }
      const { error } = await client.from('promo_codes').upsert(c);
      if (error) throw error;
    },
    async deletePromoCode(id) {
      if (!live()) { _demoPromoCodes = _demoPromoCodes.filter(x => x.id !== id); return; }
      const { error } = await client.from('promo_codes').delete().eq('id', id);
      if (error) throw error;
    },
    async saveZones(zones) {
      if (!live()) { localStorage.setItem('tc_demo_zones', JSON.stringify(zones)); return; }
      const { error } = await client.from('settings').upsert({ key: 'zones', value: zones });
      if (error) throw error;
    },
    async savePromo(promo) {
      if (!live()) { localStorage.setItem('tc_demo_promo', JSON.stringify(promo)); return; }
      const { error } = await client.from('settings').upsert({ key: 'promo', value: promo });
      if (error) throw error;
    },
    async saveFreeDelivery(n) {
      if (!live()) { localStorage.setItem('tc_demo_free', JSON.stringify(n ?? null)); return; }
      const { error } = await client.from('settings').upsert({ key: 'free_delivery_from', value: n ?? null });
      if (error) throw error;
    },

    /* Shrink a photo in the browser before uploading: long edge ≤ maxDim,
       re-encoded JPEG. Big difference on mobile data — and Storage bills
       egress. Falls back to the original file when smaller/better as-is. */
    async compressImage(file, maxDim = 1400, quality = 0.82) {
      try {
        if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;
        const img = await new Promise((res, rej) => {
          const url = URL.createObjectURL(file);
          const i = new Image();
          i.onload = () => { URL.revokeObjectURL(url); res(i); };
          i.onerror = () => { URL.revokeObjectURL(url); rej(new Error('bad image')); };
          i.src = url;
        });
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', quality));
        if (!blob || blob.size >= file.size) return file;
        return new File([blob], String(file.name).replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
      } catch { return file; }
    },

    async uploadPhoto(file) {
      const compressed = await this.compressImage(file);
      const path = `p-${Date.now()}-${String(compressed.name).replace(/[^\w.-]/g, '_')}`;
      const { error } = await client.storage.from('products').upload(path, compressed);
      if (error) throw error;
      return client.storage.from('products').getPublicUrl(path).data.publicUrl;
    },
  };

  return { live, validDzPhone, fmtPrice, photoOf,
           listCategories, listProducts, getFeatured, getProduct,
           getSettings, getZones, getPromo, getFreeDeliveryFrom,
           checkPromo, placeOrder, trackOrder,
           submitInquiry, Admin };
})();
