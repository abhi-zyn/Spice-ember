/* ============================================
   SPICE & EMBER - AUTHENTICATION
   ============================================ */

const Auth = {
  currentUser: null,
  authListener: null,

  async init() {
    // Try Supabase auth first
    if (window.supabase) {
      try {
        SupabaseService.init();
        const session = await SupabaseService.getSession();
        if (session?.user) {
          this.currentUser = session.user;
        }
        this.authListener = SupabaseService.onAuthChange((event, session) => {
          this.currentUser = session?.user || null;
          this.updateUI();
        });
      } catch (e) {
        console.warn('Supabase auth unavailable, using localStorage:', e.message);
      }
    }

    // Fallback: check localStorage
    if (!this.currentUser) {
      const saved = localStorage.getItem('spice-ember-user');
      if (saved) {
        try { this.currentUser = JSON.parse(saved); } catch { this.currentUser = null; }
      }
    }

    this.renderAuthModal();
    this.updateUI();
    this.bindEvents();
  },

  get isLoggedIn() {
    return !!this.currentUser;
  },

  get userEmail() {
    return this.currentUser?.email || this.currentUser?.user_metadata?.email || 'User';
  },

  get userName() {
    return this.currentUser?.user_metadata?.name || this.currentUser?.email?.split('@')[0] || 'User';
  },

  async signUp(email, password, name) {
    if (window.supabase) {
      try {
        SupabaseService.init();
        const data = await SupabaseService.signUp(email, password, { name });
        this.currentUser = data.user;
        localStorage.setItem('spice-ember-user', JSON.stringify(data.user));
        Utils.showToast('Account created! Check your email to confirm.', 'success');
        this.closeModal();
        this.updateUI();
        return data;
      } catch (e) {
        Utils.showToast(e.message || 'Sign up failed', 'error');
        throw e;
      }
    }

    // Fallback localStorage auth
    const users = JSON.parse(localStorage.getItem('spice-ember-users') || '[]');
    if (users.find(u => u.email === email)) {
      Utils.showToast('Email already registered', 'error');
      throw new Error('Email already registered');
    }
    const user = { id: 'user_' + Utils.generateId(), email, user_metadata: { name }, created_at: new Date().toISOString() };
    users.push({ email, password, name });
    localStorage.setItem('spice-ember-users', JSON.stringify(users));
    this.currentUser = user;
    localStorage.setItem('spice-ember-user', JSON.stringify(user));
    Utils.showToast('Account created! You can now sign in.', 'success');
    this.closeModal();
    this.updateUI();
    return user;
  },

  async signIn(email, password) {
    if (window.supabase) {
      try {
        SupabaseService.init();
        const data = await SupabaseService.signIn(email, password);
        this.currentUser = data.user;
        localStorage.setItem('spice-ember-user', JSON.stringify(data.user));
        Utils.showToast('Signed in successfully!', 'success');
        this.closeModal();
        this.updateUI();
        return data;
      } catch (e) {
        Utils.showToast(e.message || 'Sign in failed', 'error');
        throw e;
      }
    }

    // Fallback localStorage auth
    const users = JSON.parse(localStorage.getItem('spice-ember-users') || '[]');
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) {
      Utils.showToast('Invalid email or password', 'error');
      throw new Error('Invalid credentials');
    }
    const user = { id: 'user_' + Utils.generateId(), email, user_metadata: { name: found.name }, created_at: new Date().toISOString() };
    this.currentUser = user;
    localStorage.setItem('spice-ember-user', JSON.stringify(user));
    Utils.showToast('Signed in successfully!', 'success');
    this.closeModal();
    this.updateUI();
    return user;
  },

  async signOut() {
    if (window.supabase) {
      try {
        SupabaseService.init();
        await SupabaseService.signOut();
      } catch (e) {
        console.warn('Supabase sign out error:', e.message);
      }
    }
    this.currentUser = null;
    localStorage.removeItem('spice-ember-user');
    Utils.showToast('Signed out', 'info');
    this.updateUI();
  },

  openModal(tab = 'login') {
    const modal = document.getElementById('authModal');
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.switchTab(tab);
  },

  closeModal() {
    const modal = document.getElementById('authModal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  },

  switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginTab = document.getElementById('authLoginTab');
    const signupTab = document.getElementById('authSignupTab');
    if (!loginForm || !signupForm) return;

    if (tab === 'login') {
      loginForm.style.display = 'block';
      signupForm.style.display = 'none';
      loginTab?.classList.add('active');
      signupTab?.classList.remove('active');
    } else {
      loginForm.style.display = 'none';
      signupForm.style.display = 'block';
      loginTab?.classList.remove('active');
      signupTab?.classList.add('active');
    }
  },

  updateUI() {
    const loginBtn = document.getElementById('authLoginBtn');
    const userMenu = document.getElementById('authUserMenu');
    if (!loginBtn && !userMenu) return;

    if (this.isLoggedIn) {
      document.querySelectorAll('.auth-login-btn').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.auth-user-menu').forEach(el => {
        el.style.display = 'flex';
        const avatar = el.querySelector('.auth-avatar');
        if (avatar) avatar.textContent = this.userName.charAt(0).toUpperCase();
        const name = el.querySelector('.auth-user-name');
        if (name) name.textContent = this.userName;
      });
    } else {
      document.querySelectorAll('.auth-login-btn').forEach(el => el.style.display = 'flex');
      document.querySelectorAll('.auth-user-menu').forEach(el => el.style.display = 'none');
    }
  },

  renderAuthModal() {
    if (document.getElementById('authModal')) return;

    const modal = document.createElement('div');
    modal.id = 'authModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content auth-modal-content">
        <button class="modal-close" id="authModalClose">✕</button>
        <div class="auth-modal-header">
          <h2>Welcome to Spice & Ember</h2>
          <p>Sign in to place orders and manage reservations.</p>
        </div>
        <div class="auth-tabs">
          <button class="auth-tab active" id="authLoginTab">Sign In</button>
          <button class="auth-tab" id="authSignupTab">Create Account</button>
        </div>
        <form id="loginForm" class="auth-form">
          <div class="form-group">
            <label for="loginEmail">Email</label>
            <input type="email" id="loginEmail" required placeholder="your@email.com">
          </div>
          <div class="form-group">
            <label for="loginPassword">Password</label>
            <input type="password" id="loginPassword" required placeholder="••••••••" minlength="6">
          </div>
          <button type="submit" class="btn btn-primary btn-full">Sign In</button>
          <p class="auth-alt">Don't have an account? <a href="#" id="authGoSignup">Create one</a></p>
        </form>
        <form id="signupForm" class="auth-form" style="display:none">
          <div class="form-group">
            <label for="signupName">Full Name</label>
            <input type="text" id="signupName" required placeholder="Your name">
          </div>
          <div class="form-group">
            <label for="signupEmail">Email</label>
            <input type="email" id="signupEmail" required placeholder="your@email.com">
          </div>
          <div class="form-group">
            <label for="signupPassword">Password</label>
            <input type="password" id="signupPassword" required placeholder="••••••••" minlength="6">
          </div>
          <button type="submit" class="btn btn-primary btn-full">Create Account</button>
          <p class="auth-alt">Already have an account? <a href="#" id="authGoLogin">Sign in</a></p>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
  },

  bindEvents() {
    // Modal open/close
    document.addEventListener('click', (e) => {
      const loginBtn = e.target.closest('.auth-login-btn');
      if (loginBtn) {
        e.preventDefault();
        this.openModal('login');
      }
    });

    const modal = document.getElementById('authModal');
    if (!modal) return;

    modal.querySelector('#authModalClose')?.addEventListener('click', () => this.closeModal());
    modal.addEventListener('click', (e) => { if (e.target === modal) this.closeModal(); });

    // Tab switching
    modal.querySelector('#authLoginTab')?.addEventListener('click', () => this.switchTab('login'));
    modal.querySelector('#authSignupTab')?.addEventListener('click', () => this.switchTab('signup'));
    modal.querySelector('#authGoSignup')?.addEventListener('click', (e) => { e.preventDefault(); this.switchTab('signup'); });
    modal.querySelector('#authGoLogin')?.addEventListener('click', (e) => { e.preventDefault(); this.switchTab('login'); });

    // Login form
    modal.querySelector('#loginForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Signing in...';
      try {
        await this.signIn(email, password);
      } catch { /* handled in signIn */ }
      btn.disabled = false;
      btn.textContent = 'Sign In';
    });

    // Signup form
    modal.querySelector('#signupForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('signupName').value;
      const email = document.getElementById('signupEmail').value;
      const password = document.getElementById('signupPassword').value;
      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Creating account...';
      try {
        await this.signUp(email, password, name);
      } catch { /* handled in signUp */ }
      btn.disabled = false;
      btn.textContent = 'Create Account';
    });

    // Sign out
    document.addEventListener('click', (e) => {
      const logoutBtn = e.target.closest('.auth-logout-btn');
      if (logoutBtn) {
        e.preventDefault();
        this.signOut();
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => Auth.init());