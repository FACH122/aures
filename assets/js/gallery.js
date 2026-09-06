/* AURÈS CÉRAMIQUE — gallery page: filters + lightbox.
   Demo mode shows generated placeholders; live shops can point GALLERY_ITEMS
   at real photo URLs (Supabase Storage or local assets). */

const GALLERY_ITEMS = [
  { cat: 'gal_workshop', label_fr: 'Le four à bois', label_ar: 'فرن الحطب', label_en: 'The wood-fired kiln', src: 'assets/img/demo/gal-four.jpg' },
  { cat: 'gal_artisans', label_fr: 'Façonnage au tour', label_ar: 'التشكيل على العجلة', label_en: 'Shaping on the wheel', src: 'assets/img/demo/gal-tour.jpg' },
  { cat: 'gal_prod',     label_fr: 'Séchage à l’ombre', label_ar: 'التجفيف في الظل', label_en: 'Drying in the shade', src: 'assets/img/demo/gal-sechage.jpg' },
  { cat: 'gal_details',  label_fr: 'Peinture des motifs', label_ar: 'رسم الزخارف', label_en: 'Painting the patterns', src: 'assets/img/demo/gal-peinture.jpg' },
  { cat: 'gal_workshop', label_fr: 'Bain d’émail', label_ar: 'غمسة التزجيج', label_en: 'Glaze bath', src: 'assets/img/demo/gal-email.jpg' },
  { cat: 'gal_details',  label_fr: 'Détail bleu cobalt', label_ar: 'تفاصيل بالأزرق الكوبالتي', label_en: 'Cobalt blue detail', src: 'assets/img/demo/gal-detail.jpg' },
  { cat: 'gal_prod',     label_fr: 'Contrôle qualité', label_ar: 'مراقبة الجودة', label_en: 'Quality control', src: 'assets/img/demo/gal-controle.jpg' },
  { cat: 'gal_artisans', label_fr: 'Préparation de l’argile', label_ar: 'تحضير الطين', label_en: 'Preparing the clay', src: 'assets/img/demo/gal-argile.jpg' },
];

function galLabel(g) {
  if (LANG === 'ar') return g.label_ar || g.label_fr;
  if (LANG === 'en') return g.label_en || g.label_fr;
  return g.label_fr;
}

let currentFilter = '';

function itemSrc(g) {
  return g.src || placeholder(galLabel(g), 25);
}

function renderChips() {
  const cats = ['gal_all', 'gal_workshop', 'gal_artisans', 'gal_prod', 'gal_details'];
  document.getElementById('gal-chips').innerHTML = cats.map(c => `
    <button class="chip${(c === 'gal_all' && !currentFilter) || c === currentFilter ? ' on' : ''}" data-f="${c}">
      ${t(c)}
    </button>`).join('');
}

function renderGrid() {
  const items = currentFilter
    ? GALLERY_ITEMS.filter(g => g.cat === currentFilter)
    : GALLERY_ITEMS;
  document.getElementById('gal-grid').innerHTML = items.map((g, i) => `
    <figure class="gal-item" data-i="${i}">
      <img src="${esc(itemSrc(g))}" alt="${esc(galLabel(g))}" loading="lazy">
      <figcaption>${esc(t(g.cat))} — ${esc(galLabel(g))}</figcaption>
    </figure>`).join('');
}

function lightbox(src, alt) {
  const el = document.createElement('div');
  el.className = 'lightbox';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-label', alt);
  el.innerHTML = `<img src="${esc(src)}" alt="${esc(alt)}"><button aria-label="close">×</button>`;
  document.body.appendChild(el);
  const close = () => el.remove();
  el.addEventListener('click', e => { if (e.target !== el.querySelector('img')) close(); });
  document.addEventListener('keydown', function esc2(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc2); }
  });
}

document.getElementById('gal-chips').addEventListener('click', e => {
  const b = e.target.closest('[data-f]');
  if (!b) return;
  currentFilter = b.dataset.f === 'gal_all' ? '' : b.dataset.f;
  renderChips();
  renderGrid();
  applyI18n();
});

document.getElementById('gal-grid').addEventListener('click', e => {
  const f = e.target.closest('.gal-item');
  if (!f) return;
  const img = f.querySelector('img');
  lightbox(img.src, img.alt);
});

renderChrome('gallery');
renderChips();
renderGrid();
applyI18n();
watchReveals();

setTimeout(() => {
  const wa = document.getElementById('g-wa-btn');
  if (wa) { wa.href = waLink(); wa.style.display = waNumber() ? '' : 'none'; }
}, 600);
