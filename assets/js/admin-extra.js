/* AURÈS CÉRAMIQUE — admin: products & categories CRUD (loaded after admin.js) */

/* ---------- PRODUCTS ---------- */
function tabProducts(root) {
  root.innerHTML = `
  <div class="admin-toolbar">
    <b>${CACHE.products.length} pièce(s)</b>
    <button class="btn accent" id="new-product">+ Nouvelle pièce</button>
  </div>
  <div class="admin-card" style="overflow-x:auto">
    <table class="adm">
      <thead><tr><th>Photo</th><th>Nom (FR)</th><th>Prix</th><th>Stock</th><th>Catégorie</th><th>Dimensions</th><th>Vedette</th><th>Active</th><th></th></tr></thead>
      <tbody>
        ${CACHE.products.map(p => `
        <tr>
          <td><img class="thumb" src="${esc2(p.photos && p.photos[0] || placeholder(p.name_fr, 25))}" alt=""></td>
          <td><b>${esc2(p.name_fr)}</b><br><small style="color:var(--ink-soft)" dir="rtl">${esc2(p.name_ar)}</small></td>
          <td><b>${Number(p.price) > 0 ? esc2(DB.fmtPrice(p.price)) : '—'}</b>${Number(p.compare_at_price) > Number(p.price) ? `<br><small style="text-decoration:line-through;color:var(--ink-soft)">${esc2(DB.fmtPrice(p.compare_at_price))}</small>` : ''}</td>
          <td>${Number(p.stock ?? 0) <= 0 ? '<b style="color:#b3402e">0</b>' : esc2(String(p.stock))}</td>
          <td>${(() => { const c = CACHE.categories.find(c => c.id === p.category_id); return c ? esc2(c.name_fr) : '—'; })()}</td>
          <td>${esc2(p.dimensions || '—')}</td>
          <td>${p.featured ? '★' : ''}</td>
          <td>${p.active ? '✓' : '—'}</td>
          <td>
            <div class="row-actions-adm">
              <button class="mini-btn" data-edit="${p.id}">Modifier</button>
              <button class="mini-btn danger" data-del="${p.id}">Suppr.</button>
            </div>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>`;

  root.querySelector('#new-product').onclick = () => productModal(null);
  root.querySelectorAll('[data-edit]').forEach(b =>
    b.onclick = () => productModal(CACHE.products.find(p => p.id === Number(b.dataset.edit))));
  root.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
    if (!confirm('Supprimer cette pièce ?')) return;
    const id = Number(b.dataset.del);
    if (DB.live()) {
      const { error } = await DB.Admin.table('products').delete().eq('id', id);
      if (error) { toast('Erreur : ' + error.message); return; }
    }
    CACHE.products = CACHE.products.filter(p => p.id !== id);
    toast('Supprimée ✓');
    renderTab();
  });
}

async function productModal(p) {
  const isNew = !p;
  const el = document.createElement('div');
  el.className = 'modal-bg';
  const localPhotos = [];
  let photos = [...(p && p.photos || [])];

  el.innerHTML = `
  <div class="modal" style="width:min(640px,100%)">
    <h3>${isNew ? 'Nouvelle pièce' : 'Modifier la pièce'}</h3>
    <form id="p-form">
      <div class="form-2col">
        <div class="field"><label>Nom (FR) *</label><input id="p-fr" required value="${esc2(p && p.name_fr || '')}"></div>
        <div class="field"><label>Nom (AR) *</label><input id="p-ar" dir="rtl" required value="${esc2(p && p.name_ar || '')}"></div>
        <div class="field"><label>Name (EN)</label><input id="p-en" value="${esc2(p && p.name_en || '')}"></div>
        <div class="field"><label>Catégorie</label>
          <select id="p-cat">
            <option value="">—</option>
            ${CACHE.categories.map(c =>
              `<option value="${c.id}" ${p && p.category_id === c.id ? 'selected' : ''}>${esc2(c.name_fr)}</option>`).join('')}
          </select>
        </div>
        <div class="field"><label>Dimensions</label><input id="p-dims" placeholder="Ø 27 cm" value="${esc2(p && p.dimensions || '')}"></div>
        <div class="field"><label>Matière</label><input id="p-mat" placeholder="Argile émaillée…" value="${esc2(p && p.material || '')}"></div>
        <div class="field"><label>Prix (DA) *</label><input id="p-price" type="number" min="0" step="1" required value="${esc2(p && p.price != null ? String(p.price) : '0')}"></div>
        <div class="field"><label>Prix barré (DA, optionnel)</label><input id="p-compare" type="number" min="0" step="1" value="${esc2(p && p.compare_at_price != null ? String(p.compare_at_price) : '')}" placeholder="ex. 5900"></div>
        <div class="field"><label>Stock *</label><input id="p-stock" type="number" min="0" step="1" required value="${esc2(p && p.stock != null ? String(p.stock) : '5')}"></div>
      </div>
      <div class="form-2col">
        <div class="field"><label>Couleurs / décors (séparés par des virgules)</label>
          <input id="p-colors" value="${esc2(((p && p.colors) || []).join(', '))}" placeholder="Bleu, Blanc, Terre cuite"></div>
        <div class="field" style="display:flex;gap:22px;align-items:center;padding-top:26px">
          <label style="display:flex;align-items:center;gap:8px;margin:0;text-transform:none;letter-spacing:0">
            <input type="checkbox" id="p-feat" ${p && p.featured ? 'checked' : ''} style="width:auto"> Vedette
          </label>
          <label style="display:flex;align-items:center;gap:8px;margin:0;text-transform:none;letter-spacing:0">
            <input type="checkbox" id="p-active" ${(isNew || (p && p.active)) ? 'checked' : ''} style="width:auto"> Active
          </label>
        </div>
      </div>

      <div class="field"><label>Description (FR)</label><textarea id="p-dfr">${esc2(p && p.description_fr || '')}</textarea></div>
      <div class="form-2col">
        <div class="field"><label>الوصف (AR)</label><textarea id="p-dar" dir="rtl">${esc2(p && p.description_ar || '')}</textarea></div>
        <div class="field"><label>Description (EN)</label><textarea id="p-den">${esc2(p && p.description_en || '')}</textarea></div>
      </div>

      <div class="field">
        <label>Photos</label>
        <input type="file" id="p-photos" accept="image/*" multiple>
        <div class="photo-previews" id="ph-prev">
          ${photos.map((u, i) => `
            <span class="ph"><img src="${esc2(u)}" alt="">
            <button type="button" data-rm-photo="${i}" title="Retirer">×</button></span>`).join('')}
        </div>
      </div>

      <div class="row-actions-adm" style="margin-top:18px">
        <button type="submit" class="btn accent">Enregistrer</button>
        <button type="button" class="mini-btn" id="p-cancel">Annuler</button>
      </div>
    </form>
  </div>`;
  document.body.appendChild(el);
  el.addEventListener('click', e => { if (e.target === el) el.remove(); });
  el.querySelector('#p-cancel').onclick = () => el.remove();

  /* remove existing photo */
  el.addEventListener('click', e => {
    const rm = e.target.closest('[data-rm-photo]');
    if (!rm) return;
    photos.splice(Number(rm.dataset.rmPhoto), 1);
    rm.closest('.ph').remove();
  });

  /* preview newly picked local files */
  el.querySelector('#p-photos').addEventListener('change', ev => {
    for (const f of ev.target.files) {
      const url = URL.createObjectURL(f);
      localPhotos.push(f);
      el.querySelector('#ph-prev').insertAdjacentHTML('beforeend',
        `<span class="ph"><img src="${url}" alt=""><small style="font-size:.65rem;display:block;text-align:center">(à téléverser)</small></span>`);
    }
  });

  el.querySelector('#p-form').addEventListener('submit', async ev => {
    ev.preventDefault();
    const btn = el.querySelector('button[type=submit]');
    btn.disabled = true;
    try {
      /* upload new photos first */
      for (const f of localPhotos) {
        const url = await DB.Admin.uploadPhoto(f);
        photos.push(url);
      }
      const row = {
        name_fr: el.querySelector('#p-fr').value.trim(),
        name_ar: el.querySelector('#p-ar').value.trim(),
        name_en: el.querySelector('#p-en').value.trim(),
        description_fr: el.querySelector('#p-dfr').value.trim(),
        description_ar: el.querySelector('#p-dar').value.trim(),
        description_en: el.querySelector('#p-den').value.trim(),
        colors: el.querySelector('#p-colors').value.split(',').map(s => s.trim()).filter(Boolean),
        dimensions: el.querySelector('#p-dims').value.trim(),
        material: el.querySelector('#p-mat').value.trim(),
        price: Math.max(0, Number(el.querySelector('#p-price').value) || 0),
        compare_at_price: el.querySelector('#p-compare').value.trim() === '' ? null : Math.max(0, Number(el.querySelector('#p-compare').value) || 0),
        stock: Math.max(0, Math.floor(Number(el.querySelector('#p-stock').value) || 0)),
        category_id: el.querySelector('#p-cat').value || null,
        featured: el.querySelector('#p-feat').checked,
        active: el.querySelector('#p-active').checked,
        photos,
      };
      if (DB.live()) {
        const q = DB.Admin.table('products');
        const { error, data } = isNew
          ? await q.insert(row).select().single()
          : await q.update(row).eq('id', p.id).select().single();
        if (error) throw error;
        if (data) {
          const i = CACHE.products.findIndex(x => x.id === data.id);
          if (i >= 0) CACHE.products[i] = data; else CACHE.products.unshift(data);
        }
      } else {
        toast('Mode démo : non enregistré');
      }
      toast('Enregistré ✓');
      el.remove();
      renderTab();
    } catch (err) {
      toast('Erreur : ' + err.message);
      btn.disabled = false;
    }
  });
}

/* ---------- CATEGORIES ---------- */
function tabCategories(root) {
  root.innerHTML = `
  <div class="admin-toolbar">
    <b>${CACHE.categories.length} catégorie(s)</b>
    <button class="btn accent" id="new-cat">+ Nouvelle catégorie</button>
  </div>
  <div class="admin-card" style="overflow-x:auto">
    <table class="adm">
      <thead><tr><th>Image</th><th>Nom (FR)</th><th>Nom (AR)</th><th>Name (EN)</th><th>Ordre</th><th>Pièces</th><th></th></tr></thead>
      <tbody>
        ${CACHE.categories.map(c => `
        <tr>
          <td><img class="thumb" src="${esc2(c.image || placeholder(c.name_fr, 25))}" alt=""></td>
          <td><b>${esc2(c.name_fr)}</b></td>
          <td dir="rtl">${esc2(c.name_ar)}</td>
          <td>${esc2(c.name_en || '—')}</td>
          <td>${c.sort ?? 0}</td>
          <td>${CACHE.products.filter(p => p.category_id === c.id).length}</td>
          <td>
            <div class="row-actions-adm">
              <button class="mini-btn" data-cedit="${c.id}">Modifier</button>
              <button class="mini-btn danger" data-cdel="${c.id}">Suppr.</button>
            </div>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>`;

  root.querySelector('#new-cat').onclick = () => categoryModal(null);
  root.querySelectorAll('[data-cedit]').forEach(b =>
    b.onclick = () => categoryModal(CACHE.categories.find(c => c.id === Number(b.dataset.cedit))));
  root.querySelectorAll('[data-cdel]').forEach(b => b.onclick = async () => {
    const n = CACHE.products.filter(p => p.category_id === Number(b.dataset.cdel)).length;
    if (!confirm(n ? `Cette catégorie contient ${n} pièce(s). Supprimer quand même ?`
                   : 'Supprimer cette catégorie ?')) return;
    if (DB.live()) {
      const { error } = await DB.Admin.table('categories').delete().eq('id', Number(b.dataset.cdel));
      if (error) { toast('Erreur : ' + error.message); return; }
    }
    await loadAll();
    toast('Supprimée ✓');
    renderTabs();
  });
}

function categoryModal(c) {
  const isNew = !c;
  const el = document.createElement('div');
  el.className = 'modal-bg';
  let image = (c && c.image) || '';
  el.innerHTML = `
  <div class="modal">
    <h3>${isNew ? 'Nouvelle catégorie' : 'Modifier la catégorie'}</h3>
    <form id="c-form">
      <div class="field"><label>Nom (FR) *</label><input id="c-fr" required value="${esc2(c && c.name_fr || '')}"></div>
      <div class="field"><label>الاسم (AR) *</label><input id="c-ar" dir="rtl" required value="${esc2(c && c.name_ar || '')}"></div>
      <div class="field"><label>Name (EN)</label><input id="c-en" value="${esc2(c && c.name_en || '')}"></div>
      <div class="field"><label>Ordre d'affichage</label><input id="c-sort" type="number" value="${(c && c.sort) ?? 0}"></div>
      <div class="field">
        <label>Image</label>
        <input type="file" id="c-img" accept="image/*">
        ${image ? `<img src="${esc2(image)}" alt="" style="width:70px;height:70px;object-fit:cover;border-radius:10px;margin-top:8px">` : ''}
      </div>
      <div class="row-actions-adm" style="margin-top:14px">
        <button type="submit" class="btn accent">Enregistrer</button>
        <button type="button" class="mini-btn" id="c-cancel">Annuler</button>
      </div>
    </form>
  </div>`;
  document.body.appendChild(el);
  el.addEventListener('click', e => { if (e.target === el) el.remove(); });
  el.querySelector('#c-cancel').onclick = () => el.remove();

  el.querySelector('#c-form').addEventListener('submit', async ev => {
    ev.preventDefault();
    const btn = el.querySelector('button[type=submit]');
    btn.disabled = true;
    try {
      const file = el.querySelector('#c-img').files[0];
      if (file) image = await DB.Admin.uploadPhoto(file);
      const row = {
        name_fr: el.querySelector('#c-fr').value.trim(),
        name_ar: el.querySelector('#c-ar').value.trim(),
        name_en: el.querySelector('#c-en').value.trim(),
        sort: Number(el.querySelector('#c-sort').value) || 0,
        image,
      };
      if (DB.live()) {
        const q = DB.Admin.table('categories');
        const { error, data } = isNew
          ? await q.insert(row).select().single()
          : await q.update(row).eq('id', c.id).select().single();
        if (error) throw error;
        if (data) {
          const i = CACHE.categories.findIndex(x => x.id === data.id);
          if (i >= 0) CACHE.categories[i] = data; else CACHE.categories.push(data);
        }
      } else {
        toast('Mode démo : non enregistré');
      }
      toast('Enregistré ✓');
      el.remove();
      renderTabs();
    } catch (err) {
      toast('Erreur : ' + err.message);
      btn.disabled = false;
    }
  });
}
