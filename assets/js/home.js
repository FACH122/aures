/* AURÈS CÉRAMIQUE — homepage */

const CRAFT_STEPS = 7;

function stepsHtml() {
  let html = '';
  for (let i = 1; i <= CRAFT_STEPS; i++) {
    html += `
    <div class="step-row">
      <div class="step-num">${i}</div>
      <h3>${t(`step${i}_t`)}</h3>
      <p>${t(`step${i}_d`)}</p>
    </div>`;
  }
  return html;
}

/* demo gallery: local generated artwork; live shops replace with real photos
   via the products bucket — gallery items are just image URLs */
function demoGallery() {
  const items = [
    ['gal_workshop', 'Le four à bois', 'gal-four'],
    ['gal_artisans', 'Façonnage au tour', 'gal-tour'],
    ['gal_prod', 'Séchage à l’ombre', 'gal-sechage'],
    ['gal_details', 'Peinture des motifs', 'gal-peinture'],
    ['gal_workshop', 'Bain d’émail', 'gal-email'],
    ['gal_details', 'Détail bleu cobalt', 'gal-detail'],
  ];
  return items.map(([cat, label, img]) => ({
    cat, label, src: `assets/img/demo/${img}.jpg`,
  }));
}

async function loadHome() {
  renderChrome('home');
  document.getElementById('steps-home').innerHTML = stepsHtml();

  /* hero + section artwork (config override → bundled demo art → generated) */
  const heroImg = document.getElementById('hero-img');
  heroImg.src = window.HERO_IMAGE || 'assets/img/demo/hero.jpg';
  heroImg.alt = 'Céramique traditionnelle algérienne';
  document.getElementById('intro-img').src = 'assets/img/demo/intro.jpg';
  document.getElementById('intro-img').alt = 'Atelier de poterie';
  document.getElementById('heritage-img').src = 'assets/img/demo/heritage.jpg';
  document.getElementById('heritage-img').alt = 'Poterie traditionnelle';

  try {
    const [cats, featured] = await Promise.all([DB.listCategories(), DB.getFeatured()]);
    window.CATS_CACHE = cats;

    document.getElementById('cat-grid').innerHTML = cats.map(c => `
      <a class="cat-tile" href="collection.html?cat=${c.id}">
        <img src="${esc(c.image || placeholder(catLabel(c), (c.id * 35 + 18)))}" alt="${esc(catLabel(c))}" loading="lazy">
        <h3>${esc(catLabel(c))}</h3>
      </a>`).join('');

    const grid = document.getElementById('feat-grid');
    if (!featured.length) grid.closest('section').style.display = 'none';
    else {
      grid.innerHTML = '<div class="skeleton" style="grid-column:1/-1;height:340px"></div>';
      grid.innerHTML = featured.map(cardHtml).join('');
    }

    document.getElementById('gal-strip').innerHTML = demoGallery().map(g => `
      <figure class="gal-item" data-cat="${g.cat}">
        <img src="${g.src}" alt="${esc(g.label)}" loading="lazy">
        <figcaption>${esc(t(g.cat))} — ${esc(g.label)}</figcaption>
      </figure>`).join('');
  } catch {
    document.getElementById('feat-grid').innerHTML =
      `<p class="results-zero">${t('results_zero')}</p>`;
  }

  /* contact buttons pick up dashboard settings once loaded */
  setTimeout(() => {
    const waBtn = document.getElementById('home-wa-btn');
    if (waBtn) { waBtn.href = waLink(); waBtn.classList.toggle('hide', !waNumber()); }
    const telBtn = document.getElementById('home-tel-btn');
    if (telBtn) telBtn.href = telLink();
  }, 600);

  applyI18n();
  watchReveals();

  jsonLd({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Aurès Céramique',
    description: t('footer_tag'),
  });
}

loadHome();
