/* ============================================
   SPICE & EMBER — PREMIUM AUTH SYSTEM
   Glassmorphism modal · Google OAuth · Magic Link
   Smart triggers · Pending actions · Focus trap
   ============================================ */

const Auth = {
  currentUser: null,
  authListener: null,
  pendingAction: null,

  async init() {
    if (window.supabase) {
      try {
        SupabaseService.init();
        const session = await SupabaseService.getSession();
        if (session && session.user) this.currentUser = session.user;
        this.authListener = SupabaseService.onAuthChange((event, session) => {
          this.currentUser = (session && session.user) ? session.user : null;
          this.updateUI();
          if (session && this.pendingAction) {
            var fn = this.pendingAction;
            this.pendingAction = null;
            setTimeout(function() { fn(); }, 300);
          }
        });
      } catch (e) {
        console.warn('Supabase auth unavailable:', e.message);
      }
    }
    if (!this.currentUser) {
      var saved = localStorage.getItem('spice-ember-user');
      if (saved) { try { this.currentUser = JSON.parse(saved); } catch(e) { this.currentUser = null; } }
    }
    this.renderModal();
    this.updateUI();
    this.bindEvents();
    this.initSmartTriggers();
  },

  get isLoggedIn() { return !!this.currentUser; },
  get userName() {
    if (!this.currentUser) return 'User';
    return this.currentUser.user_metadata?.name || this.currentUser.email?.split('@')[0] || 'User';
  },

  requireAuth(callback) {
    if (this.isLoggedIn) { callback(); }
    else { this.pendingAction = callback; this.openModal('login'); Utils.showToast('Please sign in to continue', 'info'); }
  },

  initSmartTriggers() {
    var self = this;
    document.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-require-auth]');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        self.requireAuth(function() {
          var href = btn.getAttribute('href');
          if (href) window.location.href = href;
        });
      }
    });
  },

  /* ===== MODAL RENDER ===== */
  renderModal() {
    if (document.getElementById('authOverlay')) return;
    var overlay = document.createElement('div');
    overlay.id = 'authOverlay';
    overlay.className = 'auth-overlay';
    overlay.innerHTML = '<div class="auth-modal" role="dialog" aria-modal="true" aria-label="Authentication">'
      + '<button class="auth-close" id="authClose" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M18.3 5.71a1 1 0 0 0-1.42 0L12 10.59 7.12 5.71a1 1 0 0 0-1.42 1.42L10.59 12l-4.89 4.88a1 1 0 1 0 1.42 1.42L12 13.41l4.88 4.89a1 1 0 0 0 1.42-1.42L13.41 12l4.89-4.88a1 1 0 0 0 0-1.42z"/></svg></button>'
      + '<div class="auth-brand"><span class="auth-brand-icon">S&amp;E</span>'
      + '<h2>Spice <span>&amp;</span> Ember</h2>'
      + '<p>Sign in to order, book, and save favorites</p></div>'
      + '<div class="auth-tab-wrapper">'
      + '<div class="auth-tab-slider login" id="tabSlider"></div>'
      + '<button class="auth-tab-btn active" data-tab="login">Sign In</button>'
      + '<button class="auth-tab-btn" data-tab="signup">Create Account</button></div>'
      /* LOGIN */
      + '<div class="auth-panel active" id="loginPanel">'
      + '<form id="loginForm" autocomplete="on">'
      + '<div class="auth-field" id="loginEmailField">'
      + '<input type="email" id="loginEmail" placeholder="you@email.com" required autocomplete="email">'
      + '<label for="loginEmail">Email</label>'
      + '<span class="auth-error-msg"></span></div>'
      + '<div class="auth-field" id="loginPassField">'
      + '<input type="password" id="loginPassword" placeholder="........" required minlength="6" autocomplete="current-password">'
      + '<label for="loginPassword">Password</label>'
      + '<span class="auth-error-msg"></span></div>'
      + '<button type="submit" class="auth-submit" id="loginSubmit">'
      + '<span class="btn-text">Sign In</span><span class="btn-spinner"></span></button></form>'
      + '<div class="auth-divider">or continue with</div>'
      + '<button class="auth-google" id="googleLoginBtn">'
      + '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>'
      + 'Continue with Google</button>'
      + '<p class="auth-footer-text">Don\'t have an account? <button type="button" id="gotoSignup">Create one</button></p></div>'
      /* SIGNUP */
      + '<div class="auth-panel" id="signupPanel">'
      + '<form id="signupForm" autocomplete="on">'
      + '<div class="auth-field" id="signupNameField">'
      + '<input type="text" id="signupName" placeholder="Your Name" required autocomplete="name">'
      + '<label for="signupName">Full Name</label>'
      + '<span class="auth-error-msg"></span></div>'
      + '<div class="auth-field" id="signupEmailField">'
      + '<input type="email" id="signupEmail" placeholder="you@email.com" required autocomplete="email">'
      + '<label for="signupEmail">Email</label>'
      + '<span class="auth-error-msg"></span></div>'
      + '<div class="auth-field" id="signupPassField">'
      + '<input type="password" id="signupPassword" placeholder="........" required minlength="6" autocomplete="new-password">'
      + '<label for="signupPassword">Password</label>'
      + '<span class="auth-error-msg"></span></div>'
      + '<button type="submit" class="auth-submit" id="signupSubmit">'
      + '<span class="btn-text">Create Account</span><span class="btn-spinner"></span></button></form>'
      + '<div class="auth-divider">or continue with</div>'
      + '<button class="auth-google" id="googleSignupBtn">'
      + '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>'
      + 'Continue with Google</button>'
      + '<p class="auth-footer-text">Already have an account? <button type="button" id="gotoLogin">Sign in</button></p></div>'
      /* MAGIC LINK SENT */
      + '<div class="auth-magic-sent" id="magicSent">'
      + '<span class="auth-magic-icon"><svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg></span>'
      + '<h3>Check your inbox</h3>'
      + '<p>We sent a magic link to <strong id="magicEmailDisplay"></strong>. Click it to sign in instantly.</p>'
      + '<button class="auth-back-btn" id="magicBackBtn">← Back to sign in</button></div>'
      + '</div>';
    document.body.appendChild(overlay);
  },

  /* ===== OPEN / CLOSE ===== */
  openModal: function(tab) {
    tab = tab || 'login';
    var overlay = document.getElementById('authOverlay');
    if (!overlay) return;
    overlay.classList.add('active');
    this.switchTab(tab);
    this.focusTrap(overlay);
  },

  closeModal: function() {
    var overlay = document.getElementById('authOverlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    this.clearErrors();
  },

  /* ===== TAB SWITCHING ===== */
  switchTab: function(tab) {
    var slider = document.getElementById('tabSlider');
    var loginPanel = document.getElementById('loginPanel');
    var signupPanel = document.getElementById('signupPanel');
    var tabs = document.querySelectorAll('.auth-tab-btn');
    if (!slider || !loginPanel || !signupPanel) return;
    tabs.forEach(function(t) { t.classList.remove('active'); });
    if (tab === 'login') {
      slider.className = 'auth-tab-slider login';
      tabs[0].classList.add('active');
      loginPanel.classList.add('active');
      signupPanel.classList.remove('active');
    } else {
      slider.className = 'auth-tab-slider signup';
      tabs[1].classList.add('active');
      signupPanel.classList.add('active');
      loginPanel.classList.remove('active');
    }
    var magicSent = document.getElementById('magicSent');
    if (magicSent) magicSent.classList.remove('active');
    this.clearErrors();
  },

  /* ===== UI UPDATE ===== */
  updateUI: function() {
    var self = this;
    document.querySelectorAll('.auth-login-btn').forEach(function(el) {
      el.style.display = self.isLoggedIn ? 'none' : 'flex';
    });
    document.querySelectorAll('.auth-user-menu').forEach(function(el) {
      el.style.display = self.isLoggedIn ? 'flex' : 'none';
      var avatar = el.querySelector('.auth-avatar');
      if (avatar) avatar.textContent = self.userName.charAt(0).toUpperCase();
      var nameEl = el.querySelector('.auth-user-name');
      if (nameEl) nameEl.textContent = self.userName;
    });
  },

  /* ===== AUTH ACTIONS ===== */
  signIn: async function(email, password) {
    var self = this;
    if (window.supabase) {
      try {
        SupabaseService.init();
        var data = await SupabaseService.signIn(email, password);
        self.currentUser = data.user;
        localStorage.setItem('spice-ember-user', JSON.stringify(data.user));
        Utils.showToast('Welcome back!', 'success');
        self.closeModal();
        self.updateUI();
        return data;
      } catch (e) {
        self.showFieldError('loginEmailField', e.message || 'Invalid email or password');
        throw e;
      }
    }
    var users = JSON.parse(localStorage.getItem('spice-ember-users') || '[]');
    var found = users.find(function(u) { return u.email === email && u.password === password; });
    if (!found) { self.showFieldError('loginEmailField', 'Invalid email or password'); throw new Error('Invalid credentials'); }
    var user = { id: 'user_' + Utils.generateId(), email: email, user_metadata: { name: found.name } };
    self.currentUser = user;
    localStorage.setItem('spice-ember-user', JSON.stringify(user));
    Utils.showToast('Welcome back!', 'success');
    self.closeModal();
    self.updateUI();
    return user;
  },

  signUp: async function(email, password, name) {
    var self = this;
    if (window.supabase) {
      try {
        SupabaseService.init();
        var data = await SupabaseService.signUp(email, password, { name: name });
        self.currentUser = data.user;
        localStorage.setItem('spice-ember-user', JSON.stringify(data.user));
        Utils.showToast('Account created! Check your email to confirm.', 'success');
        self.closeModal();
        self.updateUI();
        return data;
      } catch (e) {
        self.showFieldError('signupEmailField', e.message || 'Sign up failed');
        throw e;
      }
    }
    var users = JSON.parse(localStorage.getItem('spice-ember-users') || '[]');
    if (users.find(function(u) { return u.email === email; })) {
      self.showFieldError('signupEmailField', 'Email already registered');
      throw new Error('Email already registered');
    }
    var user = { id: 'user_' + Utils.generateId(), email: email, user_metadata: { name: name } };
    users.push({ email: email, password: password, name: name });
    localStorage.setItem('spice-ember-users', JSON.stringify(users));
    self.currentUser = user;
    localStorage.setItem('spice-ember-user', JSON.stringify(user));
    Utils.showToast('Account created!', 'success');
    self.closeModal();
    self.updateUI();
    return user;
  },

  signInWithGoogle: async function() {
    if (window.supabase) {
      try {
        SupabaseService.init();
        var result = await supabaseClient.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
        if (result.error) throw result.error;
      } catch (e) { Utils.showToast(e.message || 'Google sign in failed', 'error'); }
    } else { Utils.showToast('Google sign in requires Supabase', 'info'); }
  },

  sendMagicLink: async function(email) {
    var self = this;
    if (window.supabase) {
      try {
        SupabaseService.init();
        var result = await supabaseClient.auth.signInWithOtp({ email: email, options: { shouldCreateUser: true } });
        if (result.error) throw result.error;
        document.getElementById('magicEmailDisplay').textContent = email;
        document.getElementById('loginPanel').classList.remove('active');
        var sp = document.getElementById('signupPanel');
        if (sp) sp.classList.remove('active');
        document.getElementById('magicSent').classList.add('active');
      } catch (e) { self.showFieldError('loginEmailField', e.message || 'Failed to send magic link'); }
    } else { Utils.showToast('Magic link requires Supabase', 'info'); }
  },

  signOut: async function() {
    if (window.supabase) {
      try { SupabaseService.init(); await SupabaseService.signOut(); } catch (e) { console.warn('Sign out error:', e.message); }
    }
    this.currentUser = null;
    localStorage.removeItem('spice-ember-user');
    Utils.showToast('Signed out', 'info');
    this.updateUI();
  },

  /* ===== ERROR HANDLING ===== */
  showFieldError: function(fieldId, message) {
    var field = document.getElementById(fieldId);
    if (!field) return;
    field.classList.add('error');
    var msg = field.querySelector('.auth-error-msg');
    if (msg) msg.textContent = message;
  },

  clearErrors: function() {
    document.querySelectorAll('.auth-field.error').forEach(function(f) {
      f.classList.remove('error');
      var msg = f.querySelector('.auth-error-msg');
      if (msg) msg.textContent = '';
    });
  },

  /* ===== BUTTON STATES ===== */
  setButtonLoading: function(btnId, loading) {
    var btn = document.getElementById(btnId);
    if (!btn) return;
    if (loading) { btn.classList.add('loading'); btn.disabled = true; }
    else { btn.classList.remove('loading'); btn.disabled = false; }
  },

  setButtonSuccess: function(btnId) {
    var btn = document.getElementById(btnId);
    if (!btn) return;
    btn.classList.remove('loading');
    btn.classList.add('success');
    setTimeout(function() { btn.classList.remove('success'); }, 2000);
  },

  /* ===== FOCUS TRAP ===== */
  focusTrap: function(modal) {
    var focusable = modal.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    var trapHandler = function(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    modal.addEventListener('keydown', trapHandler);
    first.focus();
    modal._trapHandler = trapHandler;
  },

  /* ===== EVENT BINDINGS ===== */
  bindEvents: function() {
    var self = this;

    // Close button
    document.addEventListener('click', function(e) {
      if (e.target.closest('#authClose')) self.closeModal();
      if (e.target.id === 'authOverlay') self.closeModal();
    });

    // Tab switching
    document.addEventListener('click', function(e) {
      if (e.target.closest('.auth-tab-btn')) {
        var tab = e.target.closest('.auth-tab-btn').dataset.tab;
        self.switchTab(tab);
      }
      if (e.target.id === 'gotoSignup') self.switchTab('signup');
      if (e.target.id === 'gotoLogin') self.switchTab('login');
      if (e.target.id === 'magicBackBtn') self.switchTab('login');
    });

    // Login form
    document.addEventListener('submit', function(e) {
      if (e.target.id === 'loginForm') {
        e.preventDefault();
        var email = document.getElementById('loginEmail').value;
        var password = document.getElementById('loginPassword').value;
        self.setButtonLoading('loginSubmit', true);
        self.signIn(email, password).then(function() {
          self.setButtonSuccess('loginSubmit');
        }).catch(function() {
          self.setButtonLoading('loginSubmit', false);
        });
      }
      if (e.target.id === 'signupForm') {
        e.preventDefault();
        var name = document.getElementById('signupName').value;
        var email = document.getElementById('signupEmail').value;
        var password = document.getElementById('signupPassword').value;
        self.setButtonLoading('signupSubmit', true);
        self.signUp(email, password, name).then(function() {
          self.setButtonSuccess('signupSubmit');
        }).catch(function() {
          self.setButtonLoading('signupSubmit', false);
        });
      }
    });

    // Google OAuth
    document.addEventListener('click', function(e) {
      if (e.target.closest('#googleLoginBtn') || e.target.closest('#googleSignupBtn')) {
        self.signInWithGoogle();
      }
    });

    // Navbar auth buttons
    document.addEventListener('click', function(e) {
      if (e.target.closest('.auth-login-btn') || e.target.closest('.auth-login-btn-mobile')) {
        self.openModal('login');
      }
      if (e.target.closest('.auth-logout-btn')) {
        self.signOut();
      }
    });

    // ESC key to close
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        var overlay = document.getElementById('authOverlay');
        if (overlay && overlay.classList.contains('active')) {
          self.closeModal();
        }
      }
    });
  }
};

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() { Auth.init(); });
} else {
  Auth.init();
}