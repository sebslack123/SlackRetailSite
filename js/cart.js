// ============================================================
// NordformSport – Cart Logic
// ============================================================

const CART_KEY = 'nordform_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function getCartTotal() {
  return getCart().reduce((sum, item) => {
    const p = getProductById(item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
}

function addToCart(id) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === id);
  if (idx > -1) cart[idx].qty++;
  else cart.push({ id, qty: 1 });
  saveCart(cart);
  updateCartUI();
}

function addToCartById(id, btn) {
  addToCart(id);
  const product = getProductById(id);
  showToast(`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> "${product.name}" lades i korgen`);
  if (btn) {
    const orig = btn.textContent;
    btn.textContent = 'Tillagd!';
    btn.classList.add('added');
    setTimeout(() => { btn.textContent = orig; btn.classList.remove('added'); }, 1500);
  }
}

function removeFromCart(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  updateCartUI();
}

function changeQty(id, delta) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === id);
  if (idx === -1) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart(cart);
  updateCartUI();
  if (document.getElementById('cart-layout')) renderCartPage();
}

function updateCartUI() {
  const count = getCartCount();
  document.querySelectorAll('#cart-count').forEach(el => {
    el.textContent = count > 0 ? count : '';
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 2800);
}

// ── Cart Page ──────────────────────────────────────────────

function renderCartPage() {
  const cart = getCart();
  const layout = document.getElementById('cart-layout');
  const emptyCart = document.getElementById('empty-cart');
  if (!layout) return;

  if (!cart.length) {
    layout.style.display = 'none';
    emptyCart.style.display = 'block';
    return;
  }

  emptyCart.style.display = 'none';
  layout.style.display = 'grid';

  const subtotal = getCartTotal();
  const shipping = subtotal >= 499 ? 0 : 49;
  const total = subtotal + shipping;

  layout.innerHTML = `
    <div class="cart-items-col">
      <h2 style="margin-bottom:8px;font-size:1.1rem;font-weight:700;">Produkter (${getCartCount()} st)</h2>
      ${cart.map(item => {
        const p = getProductById(item.id);
        if (!p) return '';
        return `
          <div class="cart-item">
            <div class="cart-item-img">
              <img src="${p.img}" alt="${p.name}" />
            </div>
            <div>
              <div class="cart-item-brand">${p.brand}</div>
              <div class="cart-item-name">${p.name}</div>
              <div class="cart-item-price">${formatPrice(p.price * item.qty)}</div>
              <div class="cart-item-actions">
                <button class="qty-btn" onclick="changeQty('${p.id}', -1)">−</button>
                <span class="qty-display">${item.qty}</span>
                <button class="qty-btn" onclick="changeQty('${p.id}', 1)">+</button>
                <button class="remove-btn" onclick="removeFromCart('${p.id}')">Ta bort</button>
              </div>
            </div>
            <div></div>
          </div>
        `;
      }).join('')}
    </div>

    <div>
      <div class="cart-summary-box">
        <h3>Ordersammanfattning</h3>
        <div class="summary-line"><span>Delsumma</span><span>${formatPrice(subtotal)}</span></div>
        <div class="summary-line"><span>Frakt</span><span>${shipping === 0 ? '<span style="color:var(--green);font-weight:600">Gratis</span>' : formatPrice(shipping)}</span></div>
        ${shipping > 0 ? `<div style="font-size:.78rem;color:var(--gray-500);margin-top:-8px;margin-bottom:12px;">Handla för ${formatPrice(499 - subtotal)} till för fri frakt</div>` : ''}
        <div class="summary-line total"><span>Totalt (inkl. moms)</span><span>${formatPrice(total)}</span></div>
        <div class="cart-actions">
          <a href="checkout.html" class="btn btn-primary btn-full">Gå till kassan</a>
          <a href="index.html" class="btn btn-outline btn-full">Fortsätt handla</a>
        </div>
        <p style="font-size:.75rem;color:var(--gray-500);text-align:center;margin-top:14px;">
          Säker betalning · Swish · Kort · Klarna
        </p>
      </div>
    </div>
  `;
}

// ── Checkout Summary ──────────────────────────────────────

function renderCheckoutSummary() {
  const cart = getCart();
  const itemsEl = document.getElementById('checkout-items');
  const totalsEl = document.getElementById('summary-totals');
  if (!itemsEl || !totalsEl) return;

  if (!cart.length) {
    itemsEl.innerHTML = '<p style="color:var(--gray-500);font-size:.875rem;">Korgen är tom.</p>';
    return;
  }

  const subtotal = getCartTotal();
  const shipping = subtotal >= 499 ? 0 : 49;
  const total = subtotal + shipping;

  itemsEl.innerHTML = cart.map(item => {
    const p = getProductById(item.id);
    if (!p) return '';
    return `
      <div class="checkout-item">
        <div class="checkout-item-img"><img src="${p.img}" alt="${p.name}" /></div>
        <div class="checkout-item-info">
          <div class="name">${p.name}</div>
          <div class="qty">× ${item.qty}</div>
        </div>
        <div class="checkout-item-price">${formatPrice(p.price * item.qty)}</div>
      </div>
    `;
  }).join('');

  totalsEl.innerHTML = `
    <div class="summary-line"><span>Delsumma</span><span>${formatPrice(subtotal)}</span></div>
    <div class="summary-line"><span>Frakt</span><span>${shipping === 0 ? '<span style="color:var(--green);">Gratis</span>' : formatPrice(shipping)}</span></div>
    <div class="summary-line total"><span>Att betala</span><span>${formatPrice(total)}</span></div>
  `;
}

// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => updateCartUI());
