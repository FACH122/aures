/* AURÈS CÉRAMIQUE — collection page (filterable catalog) */

const params = new URLSearchParams(location.search);
let currentCat = params.get('cat') || '';
let currentQ = params.get('q') || '';
let currentSort = 'new';

function chipHtml(id, label, on) {
  return `<button class="chip${on ? ' on' : ''}" data-cat="${id}">${esc(label)}</button>`;
}

async function renderChips(cats) {
  const el = document.getElementById('cat-chips');
  el.innerHTML =
    chipHtml('', t('all_cats'), !currentCat) +
    cats.map(c => chipHtml(c.id, catLabel(c), String(c.id) === String(currentCat))).join('');
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    currentCat = b.dataset.cat;
    el.querySelectorAll('.chip').forEach(x =>
      x.classList.toggle('on', x.dataset.cat === currentCat));
    loadGrid();
  });
}

async function loadGrid() {
  const grid = document.getElementById('grid');
  const zero = document.getElementById('zero');
  grid.innerHTML = Array(4).fill('<div class="skeleton" style="height:340px"></div>').join('');
  try {
    let items = await DB.listProducts({ category: currentCat, search: currentQ, sort: currentSort });
    grid.innerHTML = items.map(cardHtml).join('');
    zero.hidden = !!items.length;
    if (!items.length) zero.textContent = t('results_zero');
  } catch {
    grid.innerHTML = '';
    zero.hidden = false;
    zero.textContent = t('results_zero');
  }
  applyI18n();
  watchReveals();
  renderCartCount();
}

async function init() {
  renderChrome('collection');
  try {
    const cats = await DB.listCategories();
    window.CATS_CACHE = cats;
    await renderChips(cats);
  } catch { /* chips optional */ }

  document.getElementById('q').addEventListener('input', e => {
    currentQ = e.target.value.trim();
    clearTimeout(window._qTimer);
    window._qTimer = setTimeout(loadGrid, 250);
  });

  const sortSel = document.getElementById('sort');
  if (sortSel) sortSel.addEventListener('change', () => {
    currentSort = sortSel.value;
    loadGrid();
  });

  setTimeout(() => {
    const wa = document.getElementById('col-wa-btn');
    if (wa) { wa.href = waLink(); wa.style.display = waNumber() ? '' : 'none'; }
    const tel = document.getElementById('col-tel-btn');
    if (tel) tel.href = telLink();
  }, 600);

  jsonLd({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: t('col_title'),
    description: t('col_sub'),
  });
}

init();
loadGrid();

/* re-run when language changes (page reloads, so this is for safety) */
window.addEventListener('lang:changed', () => location.reload());
