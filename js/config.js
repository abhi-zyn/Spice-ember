/* ============================================
   SPICE & EMBER - CONFIGURATION
   ============================================ */

const CONFIG = {
  appName: 'Spice & Ember',
  tagline: 'Where Fire Meets Flavor',
  phone: '+1 (555) 123-4567',
  email: 'hello@spiceandember.com',
  address: '42 Flame Street, Culinary District, NY 10001',
  hours: {
    'Mon-Thu': '11:00 AM - 10:00 PM',
    'Fri-Sat': '11:00 AM - 11:00 PM',
    'Sun': '12:00 PM - 9:00 PM'
  },
  social: {
    instagram: 'https://instagram.com',
    facebook: '#',
    twitter: '#'
  },
  currency: '₹',
  taxRate: 0.08,
  deliveryFee: 3.99,
  freeDeliveryMin: 30,
  supabaseUrl: 'https://rbwrvrwuxndzcstzurdk.supabase.co',
  supabaseAnonKey: 'sb_publishable_g5FYsXUwt1GTzSIq2_ZnZw_DgAEbkKt',
  razorpayKeyId: 'rzp_live_YOUR_RAZORPAY_KEY_ID',
  supabaseFunctionUrl: 'https://rbwrvrwuxndzcstzurdk.supabase.co/functions/v1',
  storageKey: 'spice-ember-cart',
  bookingsKey: 'spice-ember-bookings',
  ordersKey: 'spice-ember-orders',
  reviewsKey: 'spice-ember-reviews'
};

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

const Utils = {
  formatPrice(amount) {
    return CONFIG.currency + amount.toFixed(2);
  },

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  },

  getFromStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  },

  getCart() {
    return this.getFromStorage(CONFIG.storageKey) || [];
  },

  saveCart(cart) {
    this.saveToStorage(CONFIG.storageKey, cart);
    this.updateCartBadge();
  },

  getCartCount() {
    const cart = this.getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  },

  updateCartBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const count = this.getCartCount();
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  getBookings() {
    return this.getFromStorage(CONFIG.bookingsKey) || [];
  },

  saveBookings(bookings) {
    this.saveToStorage(CONFIG.bookingsKey, bookings);
  },

  getOrders() {
    return this.getFromStorage(CONFIG.ordersKey) || [];
  },

  saveOrders(orders) {
    this.saveToStorage(CONFIG.ordersKey, orders);
  },

  getReviews() {
    return this.getFromStorage(CONFIG.reviewsKey) || [];
  },

  saveReviews(reviews) {
    this.saveToStorage(CONFIG.reviewsKey, reviews);
  },

  getTheme() {
    return localStorage.getItem('spice-ember-theme') || 'dark';
  },

  setTheme(theme) {
    localStorage.setItem('spice-ember-theme', theme);
    document.body.classList.toggle('light-mode', theme === 'light');
  },

  toggleTheme() {
    const current = this.getTheme();
    this.setTheme(current === 'dark' ? 'light' : 'dark');
  },

  showToast(message, type = 'success', duration = 3000) {
    const existing = document.querySelector('.toast-container');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.className = 'toast-container';
    container.innerHTML = `
      <div class="toast toast-${type}">
        <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
        <span class="toast-message">${message}</span>
      </div>
    `;
    document.body.appendChild(container);

    requestAnimationFrame(() => container.classList.add('show'));
    setTimeout(() => {
      container.classList.remove('show');
      setTimeout(() => container.remove(), 300);
    }, duration);
  },

  showLoading(container) {
    const loader = document.createElement('div');
    loader.className = 'loading-spinner';
    loader.innerHTML = '<div class="spinner"></div>';
    container.appendChild(loader);
    return loader;
  },

  hideLoading(loader) {
    if (loader && loader.parentNode) {
      loader.remove();
    }
  },

  debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  getStarsHtml(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    let html = '';
    for (let i = 0; i < 5; i++) {
      if (i < full) html += '<span class="star filled">★</span>';
      else if (i === full && half) html += '<span class="star filled">★</span>';
      else html += '<span class="star">★</span>';
    }
    return html;
  },

  truncateText(text, maxLen = 80) {
    return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
  },

  formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  },

  formatTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    });
  },

  getStatusColor(status) {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      preparing: '#8b5cf6',
      ready: '#10b981',
      delivered: '#10b981',
      completed: '#10b981',
      cancelled: '#ef4444',
      'in-progress': '#8b5cf6'
    };
    return colors[status] || '#666';
  },

  initTheme() {
    const theme = this.getTheme();
    document.body.classList.toggle('light-mode', theme === 'light');
  },

  initNavbar() {
    const nav = document.querySelector('.navbar');
    if (!nav) return;

    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    });
  },

  initMobileMenu() {
    const menuBtn = document.querySelector('.nav-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');
    const closeBtn = document.querySelector('.mobile-menu-close');
    if (!menuBtn || !mobileMenu || !overlay) return;

    const toggle = () => {
      mobileMenu.classList.toggle('open');
      overlay.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    };

    menuBtn.addEventListener('click', toggle);
    overlay.addEventListener('click', toggle);
    if (closeBtn) closeBtn.addEventListener('click', toggle);

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', toggle);
    });
  },

  initThemeToggle() {
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
      this.toggleTheme();
      const isLight = this.getTheme() === 'light';
      toggle.querySelector('.sun-icon').style.display = isLight ? 'none' : 'inline';
      toggle.querySelector('.moon-icon').style.display = isLight ? 'inline' : 'none';
    });
  },

  initCartBadge() {
    this.updateCartBadge();
  },

  initAll() {
    this.initTheme();
    this.initNavbar();
    this.initMobileMenu();
    this.initThemeToggle();
    this.initCartBadge();
  }
};

document.addEventListener('DOMContentLoaded', () => Utils.initAll());