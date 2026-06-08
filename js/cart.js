/* ============================================
   SPICE & EMBER - CART FUNCTIONALITY
   ============================================ */

const Cart = {
  get() {
    return Utils.getCart();
  },

  save(cart) {
    Utils.saveCart(cart);
    this.renderCart();
    this.renderCartSummary();
    this.updateCartCount();
  },

  add(item) {
    const cart = this.get();
    const existing = cart.find(i => i.id === item.id);

    if (existing) {
      existing.quantity += item.quantity || 1;
    } else {
      cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        type: item.type,
        quantity: item.quantity || 1
      });
    }

    this.save(cart);
    Utils.showToast(`${item.name} added to cart!`);
    this.animateBadge();
  },

  remove(itemId) {
    let cart = this.get();
    cart = cart.filter(i => i.id !== itemId);
    this.save(cart);
    Utils.showToast('Item removed from cart', 'info');
  },

  updateQuantity(itemId, quantity) {
    const cart = this.get();
    const item = cart.find(i => i.id === itemId);
    if (!item) return;

    if (quantity <= 0) {
      this.remove(itemId);
      return;
    }

    item.quantity = quantity;
    this.save(cart);
  },

  clear() {
    this.save([]);
    Utils.showToast('Cart cleared', 'info');
  },

  getTotal() {
    const cart = this.get();
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getItemCount() {
    const cart = this.get();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  },

  getTax() {
    return this.getTotal() * CONFIG.taxRate;
  },

  getDeliveryFee() {
    const total = this.getTotal();
    return total >= CONFIG.freeDeliveryMin ? 0 : CONFIG.deliveryFee;
  },

  getGrandTotal() {
    return this.getTotal() + this.getTax() + this.getDeliveryFee();
  },

  animateBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
      badge.classList.remove('shake');
      void badge.offsetWidth;
      badge.classList.add('shake');
      setTimeout(() => badge.classList.remove('shake'), 400);
    });
  },

  updateCartCount() {
    Utils.updateCartBadge();
  },

  renderCart() {
    const container = document.querySelector('.cart-items');
    if (!container) return;

    const cart = this.get();

    if (cart.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything yet.</p>
          <a href="menu.html" class="btn btn-primary">Browse Menu</a>
        </div>
      `;
      return;
    }

    container.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
          <span class="cart-item-type ${item.type}">${item.type === 'veg' ? '🟢' : '🔴'}</span>
        </div>
        <div class="cart-item-details">
          <h4 class="cart-item-name">${item.name}</h4>
          <div class="cart-item-price">${Utils.formatPrice(item.price)}</div>
        </div>
        <div class="cart-item-actions">
          <div class="qty-selector">
            <button class="qty-btn qty-minus" data-id="${item.id}">−</button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-btn qty-plus" data-id="${item.id}">+</button>
          </div>
          <div class="cart-item-total">${Utils.formatPrice(item.price * item.quantity)}</div>
          <button class="cart-item-remove" data-id="${item.id}" title="Remove">✕</button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.qty-minus').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const item = cart.find(i => i.id === id);
        if (item) this.updateQuantity(id, item.quantity - 1);
      });
    });

    container.querySelectorAll('.qty-plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const item = cart.find(i => i.id === id);
        if (item) this.updateQuantity(id, item.quantity + 1);
      });
    });

    container.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        this.remove(btn.dataset.id);
      });
    });
  },

  renderCartSummary() {
    const container = document.querySelector('.cart-summary');
    if (!container) return;

    const cart = this.get();
    const subtotal = this.getTotal();
    const tax = this.getTax();
    const delivery = this.getDeliveryFee();
    const total = this.getGrandTotal();

    if (cart.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <h3>Order Summary</h3>
      <div class="summary-row">
        <span>Subtotal (${this.getItemCount()} items)</span>
        <span>${Utils.formatPrice(subtotal)}</span>
      </div>
      <div class="summary-row">
        <span>Tax (${(CONFIG.taxRate * 100).toFixed(0)}%)</span>
        <span>${Utils.formatPrice(tax)}</span>
      </div>
      <div class="summary-row">
        <span>Delivery Fee</span>
        <span>${delivery === 0 ? '<span class="free-delivery">FREE</span>' : Utils.formatPrice(delivery)}</span>
      </div>
      ${subtotal < CONFIG.freeDeliveryMin ? `
        <div class="delivery-progress">
          <div class="delivery-progress-text">Add ${Utils.formatPrice(CONFIG.freeDeliveryMin - subtotal)} more for free delivery</div>
          <div class="delivery-progress-bar">
            <div class="delivery-progress-fill" style="width: ${Math.min((subtotal / CONFIG.freeDeliveryMin) * 100, 100)}%"></div>
          </div>
        </div>
      ` : ''}
      <div class="summary-divider"></div>
      <div class="summary-row summary-total">
        <span>Total</span>
        <span>${Utils.formatPrice(total)}</span>
      </div>
      <button class="btn btn-primary btn-full checkout-btn">Proceed to Checkout</button>
      <button class="btn btn-outline btn-full clear-cart-btn">Clear Cart</button>
    `;

    const checkoutBtn = container.querySelector('.checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        Utils.showToast('Order placed successfully!', 'success');
        const orders = Utils.getOrders();
        orders.push({
          id: Utils.generateId(),
          items: cart,
          subtotal,
          tax,
          delivery,
          total,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
        Utils.saveOrders(orders);
        this.clear();
      });
    }

    const clearBtn = container.querySelector('.clear-cart-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Clear your entire cart?')) {
          this.clear();
        }
      });
    }
  },

  renderMiniCart() {
    const container = document.querySelector('.mini-cart-items');
    if (!container) return;

    const cart = this.get();
    if (cart.length === 0) {
      container.innerHTML = '<p class="mini-cart-empty">Your cart is empty</p>';
      return;
    }

    container.innerHTML = cart.slice(0, 3).map(item => `
      <div class="mini-cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="mini-cart-info">
          <div class="mini-cart-name">${item.name}</div>
          <div class="mini-cart-qty">${item.quantity} × ${Utils.formatPrice(item.price)}</div>
        </div>
      </div>
    `).join('');

    if (cart.length > 3) {
      container.innerHTML += `<p class="mini-cart-more">+${cart.length - 3} more items</p>`;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Cart.renderCart();
  Cart.renderCartSummary();
});