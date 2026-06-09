/* ============================================
   SPICE & EMBER - ADMIN FUNCTIONALITY
   ============================================ */

const Admin = {
  init() {
    this.checkAuth();
    this.initDashboard();
    this.initBookings();
    this.initOrders();
    this.initMenuManage();
  },

  checkAuth() {
    const isAdmin = localStorage.getItem('spice-ember-admin');
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'index.html' && !isAdmin) {
      window.location.href = 'index.html';
    }
  },

  /* ===== DASHBOARD ===== */
  async initDashboard() {
    if (!document.getElementById('dashboardCards')) return;

    try {
      const stats = await API.getDashboardStats();

      document.getElementById('totalRevenue').textContent = Utils.formatPrice(stats.revenue);
      document.getElementById('totalOrders').textContent = stats.ordersCount;
      document.getElementById('activeBookings').textContent = stats.activeBookings;
      document.getElementById('totalGuests').textContent = stats.totalGuests;

      this.renderRecentOrders(stats.recentOrders);
    } catch (e) {
      console.error('Dashboard error:', e);
    }
  },

  renderRecentOrders(orders) {
    const tbody = document.getElementById('recentOrdersTable');
    if (!tbody) return;

    if (!orders || orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:32px">No orders yet</td></tr>';
      return;
    }

    tbody.innerHTML = orders.map(o => {
      const id = o.id ? '#' + o.id.toString().slice(-8) : '#N/A';
      return `
      <tr>
        <td style="font-family:monospace;font-size:12px">${id}</td>
        <td>${o.items ? (Array.isArray(o.items) ? o.items.length + ' items' : '1 item') : 'N/A'}</td>
        <td>${Utils.formatPrice(parseFloat(o.total) || 0)}</td>
        <td><span class="status-badge ${o.status || 'pending'}">${o.status || 'pending'}</span></td>
        <td>${o.created_at ? Utils.formatDate(o.created_at) : (o.createdAt ? Utils.formatDate(o.createdAt) : '—')}</td>
      </tr>
    `}).join('');
  },

  /* ===== BOOKINGS ===== */
  initBookings() {
    const tbody = document.getElementById('bookingsTable');
    if (!tbody) return;

    this.renderBookings();

    const filter = document.getElementById('bookingFilter');
    if (filter) {
      filter.addEventListener('change', () => this.renderBookings(filter.value));
    }
  },

  async renderBookings(statusFilter = 'all') {
    const tbody = document.getElementById('bookingsTable');
    if (!tbody) return;

    try {
      const bookings = await API.getBookings(statusFilter);

      if (!bookings || bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:32px">No bookings found</td></tr>';
        return;
      }

      tbody.innerHTML = bookings.map(b => `
      <tr>
        <td>
          <div style="font-weight:600">${b.name}</div>
          <div style="font-size:12px;color:var(--text-muted)">${b.email}</div>
        </td>
        <td>${Utils.formatDate(b.date)}</td>
        <td>${b.time}</td>
        <td>${b.guests}</td>
        <td>${b.occasion || '—'}</td>
        <td><span class="status-badge ${b.status}">${b.status}</span></td>
        <td>
          <div class="admin-actions">
            <button class="admin-btn admin-btn-primary booking-action" data-id="${b.id}" data-action="confirmed">Confirm</button>
            <button class="admin-btn booking-action" data-id="${b.id}" data-action="completed">Complete</button>
            <button class="admin-btn admin-btn-danger booking-action" data-id="${b.id}" data-action="cancelled">Cancel</button>
          </div>
        </td>
      </tr>
    `).join('');

      tbody.querySelectorAll('.booking-action').forEach(btn => {
        btn.addEventListener('click', () => {
          this.updateBookingStatus(btn.dataset.id, btn.dataset.action);
        });
      });
    } catch (e) {
      console.error('Render bookings error:', e);
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:32px">Error loading bookings</td></tr>';
    }
  },

  async updateBookingStatus(id, status) {
    try {
      await API.updateBookingStatus(id, status);
      Utils.showToast(`Booking ${status}`, 'success');
      const filter = document.getElementById('bookingFilter');
      this.renderBookings(filter?.value || 'all');
    } catch (e) {
      Utils.showToast('Failed to update booking', 'error');
    }
  },

  /* ===== ORDERS ===== */
  initOrders() {
    const tbody = document.getElementById('ordersTable');
    if (!tbody) return;

    this.renderOrders();

    const filter = document.getElementById('orderFilter');
    if (filter) {
      filter.addEventListener('change', () => this.renderOrders(filter.value));
    }
  },

  async renderOrders(statusFilter = 'all') {
    const tbody = document.getElementById('ordersTable');
    if (!tbody) return;

    try {
      const orders = await API.getOrders(statusFilter);

      if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:32px">No orders found</td></tr>';
        return;
      }

      tbody.innerHTML = orders.map(o => {
        const id = o.id ? '#' + o.id.toString().slice(-8) : '#N/A';
        const itemsHtml = o.items ? (Array.isArray(o.items)
          ? o.items.map(i => `<div style="font-size:13px">${i.quantity}× ${i.name}</div>`).join('')
          : '<div style="font-size:13px">Items</div>') : 'N/A';
        const createdDate = o.created_at || o.createdAt || null;
        return `
        <tr>
          <td style="font-family:monospace;font-size:12px">${id}</td>
          <td>${itemsHtml}</td>
          <td>${Utils.formatPrice(parseFloat(o.total) || 0)}</td>
          <td><span class="status-badge ${o.status}">${o.status}</span></td>
          <td>${createdDate ? Utils.formatDate(createdDate) + ' ' + Utils.formatTime(createdDate) : '—'}</td>
          <td>
            <div class="admin-actions">
              <button class="admin-btn admin-btn-primary order-action" data-id="${o.id}" data-action="preparing">Prepare</button>
              <button class="admin-btn order-action" data-id="${o.id}" data-action="ready">Ready</button>
              <button class="admin-btn order-action" data-id="${o.id}" data-action="delivered">Deliver</button>
              <button class="admin-btn admin-btn-danger order-action" data-id="${o.id}" data-action="cancelled">Cancel</button>
            </div>
          </td>
        </tr>
      `}).join('');

      tbody.querySelectorAll('.order-action').forEach(btn => {
        btn.addEventListener('click', () => {
          this.updateOrderStatus(btn.dataset.id, btn.dataset.action);
        });
      });
    } catch (e) {
      console.error('Render orders error:', e);
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:32px">Error loading orders</td></tr>';
    }
  },

  async updateOrderStatus(id, status) {
    try {
      await API.updateOrderStatus(id, status);
      Utils.showToast(`Order ${status}`, 'success');
      const filter = document.getElementById('orderFilter');
      this.renderOrders(filter?.value || 'all');
    } catch (e) {
      Utils.showToast('Failed to update order', 'error');
    }
  },

  /* ===== MENU MANAGEMENT ===== */
  initMenuManage() {
    const form = document.getElementById('addMenuItemForm');
    if (!form) return;

    this.renderMenuItems();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const newItem = {
        id: 'cust-' + Utils.generateId(),
        name: formData.get('name'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        category: formData.get('category'),
        type: formData.get('type'),
        image: formData.get('image') || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
        spicy: parseInt(formData.get('spicy')) || 0,
        rating: 0,
        reviews: 0,
        featured: false,
        popular: false
      };

      const customItems = Utils.getFromStorage('spice-ember-custom-menu') || [];
      customItems.push(newItem);
      Utils.saveToStorage('spice-ember-custom-menu', customItems);

      Utils.showToast(`${newItem.name} added to menu!`, 'success');
      form.reset();
      this.renderMenuItems();
    });
  },

  renderMenuItems() {
    const container = document.getElementById('menuItemsList');
    if (!container) return;

    const customItems = Utils.getFromStorage('spice-ember-custom-menu') || [];
    const allItems = [...MenuData.getAll(), ...customItems];

    container.innerHTML = allItems.map(item => `
      <div style="display:flex;align-items:center;gap:12px;padding:12px;border-bottom:1px solid var(--border)">
        <img src="${item.image}" alt="${item.name}" style="width:48px;height:48px;border-radius:8px;object-fit:cover">
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:14px">${item.name}</div>
          <div style="font-size:12px;color:var(--text-muted)">${item.category} · ${Utils.formatPrice(item.price)}</div>
        </div>
        <span style="font-size:11px;padding:2px 8px;border-radius:4px;background:${item.type === 'veg' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'};color:${item.type === 'veg' ? '#10b981' : '#ef4444'}">${item.type}</span>
      </div>
    `).join('');
  }
};

document.addEventListener('DOMContentLoaded', () => Admin.init());