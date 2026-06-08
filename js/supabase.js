/* ============================================
   SPICE & EMBER - SUPABASE CLIENT & API
   ============================================ */

let supabaseClient = null;

const SupabaseService = {
  init() {
    if (supabaseClient) return supabaseClient;
    const { createClient } = window.supabase;
    supabaseClient = createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    return supabaseClient;
  },

  getClient() {
    if (!supabaseClient) this.init();
    return supabaseClient;
  },

  /* ===== AUTH ===== */
  async signUp(email, password, metadata = {}) {
    const supabase = this.getClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    });
    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    const supabase = this.getClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const supabase = this.getClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const supabase = this.getClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  onAuthChange(callback) {
    const supabase = this.getClient();
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },

  /* ===== BOOKINGS ===== */
  async createBooking(booking) {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        date: booking.date,
        time: booking.time,
        guests: booking.guests,
        occasion: booking.occasion || null,
        requests: booking.requests || null,
        status: 'pending'
      }])
      .select();
    if (error) throw error;
    return data;
  },

  async getBookings(statusFilter = null) {
    const supabase = this.getClient();
    let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async updateBookingStatus(id, status) {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data;
  },

  /* ===== ORDERS ===== */
  async createOrder(order) {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        items: order.items,
        subtotal: order.subtotal,
        tax: order.tax,
        delivery_fee: order.delivery_fee,
        total: order.total,
        status: 'pending',
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
        delivery_address: order.delivery_address,
        notes: order.notes || null,
        payment_id: order.payment_id || null,
        payment_method: order.payment_method || 'razorpay'
      }])
      .select();
    if (error) throw error;
    return data;
  },

  async getOrders(statusFilter = null) {
    const supabase = this.getClient();
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async updateOrderStatus(id, status) {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data;
  },

  /* ===== REVIEWS ===== */
  async createReview(review) {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        name: review.name || 'Anonymous',
        rating: review.rating,
        comment: review.comment,
        approved: false
      }])
      .select();
    if (error) throw error;
    return data;
  },

  async getApprovedReviews() {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  /* ===== NEWSLETTER ===== */
  async subscribeNewsletter(email) {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email }])
      .select();
    if (error) throw error;
    return data;
  },

  /* ===== CONTACT MESSAGES ===== */
  async createContactMessage(message) {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([{
        name: message.name,
        email: message.email,
        subject: message.subject || null,
        message: message.message
      }])
      .select();
    if (error) throw error;
    return data;
  },

  /* ===== MENU ITEMS ===== */
  async getMenuItems(category = null) {
    const supabase = this.getClient();
    let query = supabase.from('menu_items').select('*').eq('available', true);
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getFeaturedItems() {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('featured', true)
      .eq('available', true)
      .limit(4);
    if (error) throw error;
    return data;
  },

  /* ===== DASHBOARD STATS ===== */
  async getDashboardStats() {
    const supabase = this.getClient();
    const today = new Date().toISOString().split('T')[0];

    const [ordersRes, bookingsRes, todayOrdersRes, todayBookingsRes] = await Promise.all([
      supabase.from('orders').select('*'),
      supabase.from('bookings').select('*'),
      supabase.from('orders').select('*').gte('created_at', today),
      supabase.from('bookings').select('*').gte('created_at', today)
    ]);

    const todayOrders = todayOrdersRes.data || [];
    const todayBookings = todayBookingsRes.data || [];
    const activeBookings = (bookingsRes.data || []).filter(b => b.status === 'pending' || b.status === 'confirmed');
    const revenue = todayOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const totalGuests = todayBookings.reduce((sum, b) => sum + (b.guests || 0), 0);

    return {
      revenue,
      ordersCount: todayOrders.length,
      activeBookings: activeBookings.length,
      totalGuests,
      recentOrders: (ordersRes.data || []).slice(-5).reverse()
    };
  }
};

/* ===== FALLBACK: localStorage when Supabase is unavailable ===== */
const StorageFallback = {
  async createBooking(booking) {
    const bookings = Utils.getBookings();
    booking.id = Utils.generateId();
    booking.createdAt = new Date().toISOString();
    bookings.push(booking);
    Utils.saveBookings(bookings);
    return [booking];
  },

  async createOrder(order) {
    const orders = Utils.getOrders();
    order.id = Utils.generateId();
    order.createdAt = new Date().toISOString();
    orders.push(order);
    Utils.saveOrders(orders);
    return [order];
  },

  async createReview(review) {
    const reviews = Utils.getReviews();
    review.id = Utils.generateId();
    review.createdAt = new Date().toISOString();
    reviews.push(review);
    Utils.saveReviews(reviews);
    return [review];
  },

  async subscribeNewsletter(email) {
    const subs = Utils.getFromStorage('spice-ember-newsletter') || [];
    subs.push({ email, subscribed: true, created_at: new Date().toISOString() });
    Utils.saveToStorage('spice-ember-newsletter', subs);
    return [{ email }];
  },

  async createContactMessage(msg) {
    const msgs = Utils.getFromStorage('spice-ember-contacts') || [];
    msgs.push({ ...msg, id: Utils.generateId(), created_at: new Date().toISOString() });
    Utils.saveToStorage('spice-ember-contacts', msgs);
    return [msg];
  },

  async getBookings(filter) {
    let bookings = Utils.getBookings();
    if (filter && filter !== 'all') bookings = bookings.filter(b => b.status === filter);
    return bookings.reverse();
  },

  async getOrders(filter) {
    let orders = Utils.getOrders();
    if (filter && filter !== 'all') orders = orders.filter(o => o.status === filter);
    return orders.reverse();
  },

  async updateBookingStatus(id, status) {
    const bookings = Utils.getBookings();
    const b = bookings.find(x => x.id === id);
    if (b) { b.status = status; Utils.saveBookings(bookings); }
    return [b];
  },

  async updateOrderStatus(id, status) {
    const orders = Utils.getOrders();
    const o = orders.find(x => x.id === id);
    if (o) { o.status = status; Utils.saveOrders(orders); }
    return [o];
  },

  async getDashboardStats() {
    const orders = Utils.getOrders();
    const bookings = Utils.getBookings();
    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
    const todayBookings = bookings.filter(b => new Date(b.createdAt).toDateString() === today);
    const activeBookings = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed');
    const revenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalGuests = todayBookings.reduce((sum, b) => sum + (b.guests || 0), 0);
    return { revenue, ordersCount: todayOrders.length, activeBookings: activeBookings.length, totalGuests, recentOrders: orders.slice(-5).reverse() };
  }
};

/* ===== SMART API: tries Supabase first, falls back to localStorage ===== */
const API = {
  async _call(fn, fallbackFn, ...args) {
    try {
      if (window.supabase) {
        SupabaseService.init();
        return await fn(...args);
      }
    } catch (e) {
      console.warn('Supabase call failed, using localStorage fallback:', e.message);
    }
    return await fallbackFn(...args);
  },

  createBooking(b) { return this._call(SupabaseService.createBooking.bind(SupabaseService), StorageFallback.createBooking.bind(StorageFallback), b); },
  getBookings(f) { return this._call(SupabaseService.getBookings.bind(SupabaseService), StorageFallback.getBookings.bind(StorageFallback), f); },
  updateBookingStatus(id, s) { return this._call(SupabaseService.updateBookingStatus.bind(SupabaseService), StorageFallback.updateBookingStatus.bind(StorageFallback), id, s); },
  createOrder(o) { return this._call(SupabaseService.createOrder.bind(SupabaseService), StorageFallback.createOrder.bind(StorageFallback), o); },
  getOrders(f) { return this._call(SupabaseService.getOrders.bind(SupabaseService), StorageFallback.getOrders.bind(StorageFallback), f); },
  updateOrderStatus(id, s) { return this._call(SupabaseService.updateOrderStatus.bind(SupabaseService), StorageFallback.updateOrderStatus.bind(StorageFallback), id, s); },
  createReview(r) { return this._call(SupabaseService.createReview.bind(SupabaseService), StorageFallback.createReview.bind(StorageFallback), r); },
  subscribeNewsletter(e) { return this._call(SupabaseService.subscribeNewsletter.bind(SupabaseService), StorageFallback.subscribeNewsletter.bind(StorageFallback), e); },
  createContactMessage(m) { return this._call(SupabaseService.createContactMessage.bind(SupabaseService), StorageFallback.createContactMessage.bind(StorageFallback), m); },
  getDashboardStats() { return this._call(SupabaseService.getDashboardStats.bind(SupabaseService), StorageFallback.getDashboardStats.bind(StorageFallback)); }
};