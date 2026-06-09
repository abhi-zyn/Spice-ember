/* ============================================
   SPICE & EMBER - MAIN APPLICATION LOGIC
   ============================================ */

const App = {
  currentCategory: 'all',
  currentSort: 'popular',
  searchQuery: '',

  init() {
    this.renderFeaturedItems();
    this.renderMenuGrid();
    this.renderCategoryPills();
    this.initSearch();
    this.initSort();
    this.initNewsletter();
    this.initBookingForm();
    this.initContactForm();
    this.initReviewForm();
    this.initTestimonials();
    this.initStatsCounter();
    this.initSmoothScroll();
    this.initLazyLoading();
    this.initScrollReveal();
    this.initCustomCursor();
  },

  /* ===== SCROLL REVEAL ANIMATIONS ===== */
  initScrollReveal() {
    const reveals = document.querySelectorAll('.section-header, .section-tag, .section-title, .section-desc, .section-footer, .experience-content, .experience-image, .testimonial-card, .value-card, .team-card, .stat-card, .exp-feature, .about-content, .about-image, .footer-brand, .footer-links, .newsletter-card, .booking-info-card, .booking-form, .menu-card, .featured-grid .menu-card');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Add staggered delay for grid items
          const delay = entry.target.closest('.testimonials-grid, .values-grid, .team-grid, .stats-grid, .featured-grid, .menu-grid') 
            ? (index % 4) * 80 
            : 0;
          
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
          
          observer.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  },

  /* ===== CUSTOM CURSOR (Desktop Only) ===== */
  initCustomCursor() {
    if (!('ontouchstart' in window)) {
      const cursor = document.createElement('div');
      cursor.className = 'custom-cursor';
      document.body.appendChild(cursor);

      let mouseX = 0, mouseY = 0;
      let cursorX = 0, cursorY = 0;

      document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });

      // Smooth cursor follow
      const animateCursor = () => {
        const dx = mouseX - cursorX;
        const dy = mouseY - cursorY;
        cursorX += dx * 0.15;
        cursorY += dy * 0.15;
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        requestAnimationFrame(animateCursor);
      };
      animateCursor();

      // Scale on hover
      const interactiveElements = 'a, button, .menu-card, .testimonial-card, .value-card, .team-card, .stat-card, input, .category-pill';
      document.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactiveElements)) {
          cursor.classList.add('hover');
        }
      });
      document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactiveElements)) {
          cursor.classList.remove('hover');
        }
      });
    }
  },

  /* ===== MENU RENDERING ===== */
  renderMenuGrid(items) {
    const container = document.querySelector('.menu-grid');
    if (!container) return;

    const menuItems = items || MenuData.filter({
      category: this.currentCategory,
      sortBy: this.currentSort,
      search: this.searchQuery
    });

    if (menuItems.length === 0) {
      container.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">🔍</div>
          <h3>No items found</h3>
          <p>Try adjusting your search or filters.</p>
          <button class="btn btn-primary" onclick="App.resetFilters()">Reset Filters</button>
        </div>
      `;
      return;
    }

    container.innerHTML = menuItems.map(item => `
      <div class="menu-card" data-id="${item.id}" onclick="App.openItemModal('${item.id}')">
        <div class="menu-card-image">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
          <span class="menu-card-badge ${item.type}">${item.type === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}</span>
        </div>
        <div class="menu-card-content">
          <h3 class="menu-card-name">${item.name}</h3>
          <p class="menu-card-desc">${Utils.truncateText(item.description, 80)}</p>
          <div class="menu-card-rating">
            ${Utils.getStarsHtml(item.rating)}
            <span class="rating-count">(${item.reviews})</span>
          </div>
          <div class="menu-card-footer">
            <span class="menu-card-price">${Utils.formatPrice(item.price)}</span>
          </div>
        </div>
        <button class="menu-card-add" onclick="event.stopPropagation(); Cart.add({id:'${item.id}', name:'${item.name.replace(/'/g, "\\'")}', price:${item.price}, image:'${item.image}', type:'${item.type}', quantity:1})">+</button>
      </div>
    `).join('');
  },

  renderFeaturedItems() {
    const container = document.querySelector('.featured-grid');
    if (!container) return;

    const featured = MenuData.getFeatured().slice(0, 4);
    container.innerHTML = featured.map(item => `
      <div class="menu-card" data-id="${item.id}" onclick="window.location.href='menu.html#${item.id}'">
        <div class="menu-card-image">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
          <span class="menu-card-badge ${item.type}">${item.type === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}</span>
        </div>
        <div class="menu-card-content">
          <h3 class="menu-card-name">${item.name}</h3>
          <p class="menu-card-desc">${Utils.truncateText(item.description, 80)}</p>
          <div class="menu-card-footer">
            <span class="menu-card-price">${Utils.formatPrice(item.price)}</span>
            <div class="menu-card-rating">
              ${Utils.getStarsHtml(item.rating)}
              <span class="rating-count">(${item.reviews})</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  },

  renderCategoryPills() {
    const container = document.querySelector('.category-pills');
    if (!container) return;

    const categories = [
      { id: 'all', label: 'All', icon: '🍽️' },
      { id: 'starters', label: 'Starters', icon: '🥗' },
      { id: 'mains', label: 'Mains', icon: '🥩' },
      { id: 'sides', label: 'Sides', icon: '🍟' },
      { id: 'desserts', label: 'Desserts', icon: '🍰' },
      { id: 'beverages', label: 'Beverages', icon: '🍹' }
    ];

    container.innerHTML = categories.map(cat => `
      <button class="category-pill ${cat.id === this.currentCategory ? 'active' : ''}" data-category="${cat.id}">
        <span class="pill-icon">${cat.icon}</span>
        ${cat.label}
      </button>
    `).join('');

    container.querySelectorAll('.category-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        container.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.currentCategory = pill.dataset.category;
        this.renderMenuGrid();
      });
    });
  },

  /* ===== SEARCH & SORT ===== */
  initSearch() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', Utils.debounce((e) => {
      this.searchQuery = e.target.value;
      this.renderMenuGrid();
    }, 300));
  },

  initSort() {
    const sortSelect = document.querySelector('.sort-select');
    if (!sortSelect) return;

    sortSelect.addEventListener('change', (e) => {
      this.currentSort = e.target.value;
      this.renderMenuGrid();
    });
  },

  resetFilters() {
    this.currentCategory = 'all';
    this.currentSort = 'popular';
    this.searchQuery = '';

    const searchInput = document.querySelector('.search-input');
    if (searchInput) searchInput.value = '';

    const sortSelect = document.querySelector('.sort-select');
    if (sortSelect) sortSelect.value = 'popular';

    const pills = document.querySelectorAll('.category-pill');
    pills.forEach(p => p.classList.remove('active'));
    const allPill = document.querySelector('.category-pill[data-category="all"]');
    if (allPill) allPill.classList.add('active');

    this.renderMenuGrid();
  },

  /* ===== ITEM MODAL ===== */
  openItemModal(itemId) {
    const item = MenuData.getById(itemId);
    if (!item) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close">✕</button>
        <div class="modal-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="modal-body">
          <span class="menu-card-badge ${item.type}">${item.type === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}</span>
          <h2 class="modal-title">${item.name}</h2>
          <p class="modal-desc">${item.description}</p>
          <div class="modal-rating">
            ${Utils.getStarsHtml(item.rating)}
            <span class="rating-count">${item.rating} (${item.reviews} reviews)</span>
          </div>
          <div class="modal-price">${Utils.formatPrice(item.price)}</div>
          <div class="modal-actions">
            <div class="qty-selector">
              <button class="qty-btn modal-qty-minus">−</button>
              <span class="qty-value modal-qty">1</span>
              <button class="qty-btn modal-qty-plus">+</button>
            </div>
            <button class="btn btn-primary modal-add-btn">Add to Cart</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => modal.classList.add('active'));

    let qty = 1;
    modal.querySelector('.modal-qty-minus').addEventListener('click', () => {
      if (qty > 1) {
        qty--;
        modal.querySelector('.modal-qty').textContent = qty;
      }
    });
    modal.querySelector('.modal-qty-plus').addEventListener('click', () => {
      qty++;
      modal.querySelector('.modal-qty').textContent = qty;
    });
    modal.querySelector('.modal-add-btn').addEventListener('click', () => {
      Cart.add({ id: item.id, name: item.name, price: item.price, image: item.image, type: item.type, quantity: qty });
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
      document.body.style.overflow = '';
    });
    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
      document.body.style.overflow = '';
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
        document.body.style.overflow = '';
      }
    });
  },

  /* ===== BOOKING FORM ===== */
  initBookingForm() {
    const form = document.querySelector('.booking-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const booking = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        date: formData.get('date'),
        time: formData.get('time'),
        guests: parseInt(formData.get('guests')),
        occasion: formData.get('occasion') || 'none',
        requests: formData.get('requests') || ''
      };

      try {
        await API.createBooking(booking);
        Utils.showToast('Booking request submitted! We\'ll confirm shortly.', 'success');
        form.reset();
      } catch (err) {
        Utils.showToast('Failed to submit booking. Please try again.', 'error');
      }
    });
  },

  /* ===== CONTACT FORM ===== */
  initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      try {
        await API.createContactMessage({
          name: formData.get('name'),
          email: formData.get('email'),
          subject: formData.get('subject') || '',
          message: formData.get('message')
        });
        Utils.showToast('Message sent! We\'ll get back to you soon.', 'success');
        form.reset();
      } catch (err) {
        Utils.showToast('Failed to send message. Please try again.', 'error');
      }
    });
  },

  /* ===== REVIEW FORM ===== */
  initReviewForm() {
    const form = document.querySelector('.review-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      try {
        await API.createReview({
          name: formData.get('name') || 'Anonymous',
          rating: parseInt(formData.get('rating')) || 5,
          comment: formData.get('comment')
        });
        Utils.showToast('Thank you for your review!', 'success');
        form.reset();
      } catch (err) {
        Utils.showToast('Failed to submit review. Please try again.', 'error');
      }
    });
  },

  /* ===== TESTIMONIALS ===== */
  initTestimonials() {
    const container = document.querySelector('.testimonials-grid');
    if (!container) return;

    const testimonials = [
      { name: 'Sarah M.', rating: 5, text: 'The smoked brisket is absolutely incredible. 12 hours of oak smoke — you can taste every minute of it.', role: 'Food Blogger' },
      { name: 'James K.', rating: 5, text: 'Best dining experience I\'ve had in years. The bone marrow starter is a must-try.', role: 'Regular Guest' },
      { name: 'Elena R.', rating: 5, text: 'The ambiance is unmatched. Fire-lit dining with food that sets your taste buds ablaze.', role: 'Wine Enthusiast' },
      { name: 'Marcus T.', rating: 4, text: 'Incredible flavors, generous portions, and a wine list that pairs perfectly with the menu.', role: 'Chef' }
    ];

    container.innerHTML = testimonials.map(t => `
      <div class="testimonial-card">
        <div class="testimonial-stars">${Utils.getStarsHtml(t.rating)}</div>
        <p class="testimonial-text">"${t.text}"</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar">${t.name.charAt(0)}</div>
          <div>
            <div class="testimonial-name">${t.name}</div>
            <div class="testimonial-role">${t.role}</div>
          </div>
        </div>
      </div>
    `).join('');
  },

  /* ===== STATS COUNTER ===== */
  initStatsCounter() {
    const counters = document.querySelectorAll('.stat-number');
    if (!counters.length) return;

    const animate = (counter) => {
      const target = parseInt(counter.dataset.target);
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;

      const update = () => {
        current += step;
        if (current < target) {
          counter.textContent = Math.floor(current) + (counter.dataset.suffix || '');
          requestAnimationFrame(update);
        } else {
          counter.textContent = target + (counter.dataset.suffix || '');
        }
      };
      update();
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
  },

  /* ===== NEWSLETTER ===== */
  initNewsletter() {
    const form = document.querySelector('.newsletter-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]')?.value;
      if (!email) return;
      try {
        await API.subscribeNewsletter(email);
        Utils.showToast('Subscribed! Welcome to the Spice & Ember family.', 'success');
        form.reset();
      } catch (err) {
        Utils.showToast('Already subscribed or error occurred.', 'info');
      }
    });
  },

  /* ===== SMOOTH SCROLL ===== */
  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  },

  /* ===== LAZY LOADING ===== */
  initLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) {
      document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        img.src = img.src;
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());