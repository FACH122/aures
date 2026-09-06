/* AURÈS CÉRAMIQUE — cart (localStorage), same role as the second site's cart.js
   but with ceramics variants: key = product_id + color (décor). */

const Cart = {
  KEY: 'tc_cart',
  get() { try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch { return []; } },
  save(items) { localStorage.setItem(this.KEY, JSON.stringify(items)); renderCartCount(); },
  count() { return this.get().reduce((s, i) => s + (Number(i.qty) || 0), 0); },

  add(product, color = '', qty = 1) {
    const c = String(color || '');
    if ((product.colors || []).length && !product.colors.includes(c)) {
      throw new Error('INVALID_VARIANT');
    }
    if ((Number(product.stock) || 0) <= 0) throw new Error('OUT_OF_STOCK');
    const items = this.get();
    const key = `${product.id}__${c}`;
    const found = items.find(i => i.key === key);
    const curQty = found ? found.qty : 0;
    if (curQty + qty > (Number(product.stock) || 99)) throw new Error('OUT_OF_STOCK');
    if (found) found.qty += qty;
    else items.push({
      key, product_id: product.id, color: c,
      name_fr: product.name_fr, name_ar: product.name_ar, name_en: product.name_en,
      price: Number(product.price) || 0, qty,
      photo: (product.photos && product.photos[0]) || product.photo || '',
    });
    this.save(items);
  },

  setQty(key, qty) {
    let items = this.get();
    const it = items.find(i => i.key === key);
    if (!it) return;
    it.qty = Number(qty) || 0;
    if (it.qty <= 0) items = items.filter(i => i.key !== key);
    this.save(items);
  },
  remove(key) { this.save(this.get().filter(i => i.key !== key)); },
  clear() { this.save([]); },
};

function renderCartCount() {
  const n = Cart.count();
  document.querySelectorAll('#cartCount, .cart-count').forEach(el => {
    el.textContent = n;
    el.hidden = n <= 0;
  });
}
document.addEventListener('DOMContentLoaded', renderCartCount);
