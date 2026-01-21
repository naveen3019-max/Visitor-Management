// Main application logic
class App {
  constructor() {
    this.currentView = null;
    this.notificationInterval = null;
    this.init();
  }

  async init() {
    try {
      // Check if setup is needed
      const setupStatus = await api.checkSetup();
      
      if (setupStatus.needsSetup) {
        this.renderSetup();
      } else if (!auth.isAuthenticated()) {
        this.renderLogin();
      } else {
        // Verify session is still valid
        try {
          const userData = await api.getCurrentUser();
          auth.setUser(userData.user);
          this.renderDashboard();
          this.startNotificationPolling();
        } catch (error) {
          console.error('Session validation error:', error);
          auth.clear();
          this.renderLogin();
        }
      }
    } catch (error) {
      console.error('Init error:', error);
      this.hideLoading();
      this.showToast('Failed to initialize application', 'error');
      this.renderLogin();
    }
  }

  hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'none';
    }
  }

  showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'flex';
    }
  }

  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  renderSetup() {
    this.hideLoading();
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light to-primary p-4">
        <div class="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
          <h1 class="text-3xl font-bold text-center mb-2">Welcome!</h1>
          <p class="text-neutral-600 text-center mb-8">Let's set up your admin account</p>
          
          <form id="setup-form" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-2">Full Name</label>
              <input type="text" name="fullName" required class="input-field" placeholder="Enter your full name">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-2">Username</label>
              <input type="text" name="username" required class="input-field" placeholder="Choose a username">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-2">Password</label>
              <input type="password" name="password" required class="input-field" placeholder="Choose a strong password">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-2">Recovery PIN (4-6 digits)</label>
              <input type="text" name="pin" required pattern="[0-9]{4,6}" class="input-field" placeholder="Enter a PIN for password recovery">
              <p class="text-xs text-neutral-500 mt-1">You'll need this to reset your password</p>
            </div>
            
            <button type="submit" class="btn-primary w-full mt-6">
              Create Principal Account
            </button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('setup-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);

      try {
        await api.initializeSetup(data);
        this.showToast('Principal account created successfully!');
        setTimeout(() => this.renderLogin(), 1500);
      } catch (error) {
        this.showToast(error.message, 'error');
      }
    });
  }

  renderLogin() {
    this.hideLoading();
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 sm:p-6 md:p-8">
        <!-- Background Pattern -->
        <div class="absolute inset-0 bg-black opacity-10"></div>
        <div class="absolute inset-0" style="background-image: radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.1) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.1) 2%, transparent 0%); background-size: 100px 100px;"></div>
        
        <div class="relative bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 sm:p-10 max-w-md w-full animate-slide-up border border-white/20">
          <!-- Logo/Icon -->
          <div class="flex justify-center mb-6">
            <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
          </div>
          
          <h1 class="text-3xl sm:text-4xl font-bold text-center mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Welcome Back</h1>
          <p class="text-gray-600 text-center mb-8 text-sm sm:text-base">Sign in to access your dashboard</p>
          
          <form id="login-form" class="space-y-5">
            <div class="relative">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <input type="text" name="username" required class="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none" placeholder="Enter your username">
              </div>
            </div>
            
            <div class="relative">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <input type="password" name="password" required class="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none" placeholder="Enter your password">
              </div>
            </div>
            
            <button type="submit" class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl mt-6">
              <span class="flex items-center justify-center">
                <span>Sign In</span>
                <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </span>
            </button>
          </form>
          
          <div class="mt-8 pt-6 border-t border-gray-200 text-center space-y-2">
            <button id="forgot-password-btn" class="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline transition-colors">Forgot Password?</button>
            <div class="text-gray-600 text-sm">
              Don't have an account?
              <button id="signup-btn" class="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline ml-1 transition-colors">Create Account</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const credentials = Object.fromEntries(formData);

      try {
        this.showLoading();
        const response = await api.login(credentials);
        auth.setUser(response.user);
        this.showToast('Login successful!');
        this.renderDashboard();
        this.startNotificationPolling();
      } catch (error) {
        this.hideLoading();
        this.showToast(error.message, 'error');
      }
    });

    document.getElementById('signup-btn').addEventListener('click', () => this.renderSignup());
    document.getElementById('forgot-password-btn').addEventListener('click', () => this.renderForgotPassword());
  }

  renderSignup() {
    console.log('🚀 NEW FUTURISTIC SIGNUP DESIGN V2.0 LOADED!');
    this.hideLoading();
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-6 relative overflow-hidden">
        <!-- Animated Background Elements -->
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute w-96 h-96 bg-purple-500/30 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
          <div class="absolute w-96 h-96 bg-blue-500/30 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style="animation-delay: 1s"></div>
          <div class="absolute w-72 h-72 bg-pink-500/20 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style="animation-delay: 2s"></div>
        </div>
        
        <!-- Grid Pattern -->
        <div class="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" style="background-image: linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px); background-size: 50px 50px;"></div>
        
        <div class="relative w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center animate-fade-in">
          <!-- Left Side - Info Section -->
          <div class="hidden md:block text-white space-y-8 p-8">
            <div class="space-y-4">
              <div class="inline-block px-4 py-2 bg-purple-500/20 backdrop-blur-sm rounded-full border border-purple-400/30">
                <span class="text-purple-300 text-sm font-semibold">✨ Welcome to the Future</span>
              </div>
              <h2 class="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight">
                Join Our Advanced Platform
              </h2>
              <p class="text-gray-300 text-lg leading-relaxed">
                Experience the next generation of visitor management with cutting-edge technology and seamless integration.
              </p>
            </div>
            
            <!-- Feature Cards -->
            <div class="space-y-4">
              <div class="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-white font-semibold mb-1">Lightning Fast</h3>
                  <p class="text-gray-400 text-sm">Instant access and real-time updates</p>
                </div>
              </div>
              
              <div class="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-white font-semibold mb-1">Secure & Private</h3>
                  <p class="text-gray-400 text-sm">Enterprise-grade security protocols</p>
                </div>
              </div>
              
              <div class="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-white font-semibold mb-1">Always Reliable</h3>
                  <p class="text-gray-400 text-sm">99.9% uptime guarantee</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Right Side - Signup Form -->
          <div class="relative">
            <!-- Glow Effect -->
            <div class="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
            
            <div class="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-purple-500/20">
              <!-- Header -->
              <div class="text-center mb-8">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-2xl shadow-lg mb-4 relative">
                  <div class="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                  <svg class="w-8 h-8 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                  </svg>
                </div>
                <h1 class="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-2">
                  Create Account
                </h1>
                <p class="text-gray-400 text-sm">Fill in your details to get started</p>
              </div>
              
              <form id="signup-form" class="space-y-5">
                <!-- Full Name -->
                <div class="relative group">
                  <label class="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                    <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Full Name
                  </label>
                  <div class="relative">
                    <input type="text" name="fullName" required 
                      class="w-full px-4 py-3.5 bg-slate-800/50 border-2 border-slate-700/50 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:bg-slate-800 transition-all duration-300 outline-none group-hover:border-slate-600"
                      placeholder="John Doe">
                    <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-xl"></div>
                  </div>
                </div>
                
                <!-- Username -->
                <div class="relative group">
                  <label class="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                    <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Username
                  </label>
                  <input type="text" name="username" required 
                    class="w-full px-4 py-3.5 bg-slate-800/50 border-2 border-slate-700/50 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:bg-slate-800 transition-all duration-300 outline-none group-hover:border-slate-600"
                    placeholder="johndoe123">
                </div>
                
                <!-- Password -->
                <div class="relative group">
                  <label class="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                    <span class="w-2 h-2 bg-pink-500 rounded-full"></span>
                    Password
                  </label>
                  <input type="password" name="password" required 
                    class="w-full px-4 py-3.5 bg-slate-800/50 border-2 border-slate-700/50 rounded-xl text-white placeholder-gray-500 focus:border-pink-500 focus:bg-slate-800 transition-all duration-300 outline-none group-hover:border-slate-600"
                    placeholder="••••••••">
                </div>
                
                <!-- PIN and Role Grid -->
                <div class="grid sm:grid-cols-2 gap-4">
                  <div class="relative group">
                    <label class="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                      <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                      Recovery PIN
                    </label>
                    <input type="text" name="pin" required pattern="[0-9]{4,6}"
                      class="w-full px-4 py-3.5 bg-slate-800/50 border-2 border-slate-700/50 rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:bg-slate-800 transition-all duration-300 outline-none group-hover:border-slate-600"
                      placeholder="1234">
                  </div>
                  
                  <div class="relative group">
                    <label class="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                      <span class="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      Role
                    </label>
                    <select name="role" required 
                      class="w-full px-4 py-3.5 bg-slate-800/50 border-2 border-slate-700/50 rounded-xl text-white focus:border-yellow-500 focus:bg-slate-800 transition-all duration-300 outline-none group-hover:border-slate-600">
                      <option value="" class="bg-slate-800">Select role...</option>
                      <option value="guard" class="bg-slate-800">Security Guard</option>
                      <option value="principal" class="bg-slate-800">Principal</option>
                    </select>
                  </div>
                </div>
                
                <!-- Submit Button -->
                <button type="submit" 
                  class="relative w-full mt-8 group overflow-hidden rounded-xl">
                  <div class="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 transition-all duration-300 group-hover:scale-105"></div>
                  <div class="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <span class="relative flex items-center justify-center gap-2 py-4 text-white font-bold text-lg tracking-wide">
                    Create Account
                    <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                  </span>
                </button>
              </form>
              
              <!-- Footer -->
              <div class="mt-8 pt-6 border-t border-slate-700/50 text-center">
                <button id="back-to-login-btn" 
                  class="text-gray-400 hover:text-white text-sm font-medium transition-colors inline-flex items-center gap-2 group">
                  <svg class="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('signup-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);

      try {
        await api.signup(data);
        this.showToast('Account created! Awaiting principal approval.');
        setTimeout(() => this.renderLogin(), 2000);
      } catch (error) {
        this.showToast(error.message, 'error');
      }
    });

    document.getElementById('back-to-login-btn').addEventListener('click', () => this.renderLogin());
  }

  renderForgotPassword() {
    this.hideLoading();
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 sm:p-6">
        <div class="absolute inset-0 bg-black opacity-10"></div>
        <div class="absolute inset-0" style="background-image: radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.1) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.1) 2%, transparent 0%); background-size: 100px 100px;"></div>
        
        <div class="relative bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 sm:p-10 max-w-md w-full animate-slide-up border border-white/20">
          <div class="flex justify-center mb-6">
            <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
              </svg>
            </div>
          </div>
          <h1 class="text-3xl sm:text-4xl font-bold text-center mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Reset Password</h1>
          <p class="text-gray-600 text-center mb-8 text-sm">Use your recovery PIN to reset</p>
          
          <form id="reset-form" class="space-y-5">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <input type="text" name="username" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none" placeholder="Enter your username">
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Recovery PIN</label>
              <input type="text" name="pin" required pattern="[0-9]{4,6}" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none" placeholder="Enter your 4-6 digit PIN">
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
              <input type="password" name="newPassword" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none" placeholder="Enter new password">
            </div>
            
            <button type="submit" class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl mt-6">
              Reset Password
            </button>
          </form>
          
          <div class="mt-6 pt-6 border-t border-gray-200 text-center">
            <button id="back-to-login-btn" class="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline transition-colors">← Back to Login</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('reset-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);

      try {
        await api.resetPassword(data);
        this.showToast('Password reset successful!');
        setTimeout(() => this.renderLogin(), 2000);
      } catch (error) {
        this.showToast(error.message, 'error');
      }
    });

    document.getElementById('back-to-login-btn').addEventListener('click', () => this.renderLogin());
  }

  async renderDashboard() {
    this.hideLoading();
    const role = auth.getRole();
    
    console.log('Rendering dashboard for role:', role);
    
    if (role === 'guard') {
      await this.renderGuardDashboard();
    } else if (role === 'principal') {
      await this.renderPrincipalDashboard();
    } else {
      console.error('Unknown role:', role);
      this.showToast('Invalid user role', 'error');
      auth.clear();
      this.renderLogin();
    }
  }

  async renderGuardDashboard() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <!-- Simple Header -->
        <header class="bg-white shadow-sm border-b border-gray-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex items-center justify-between">
              <!-- Left: Logo & Title -->
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="white" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 16h2v2h-2v-2zm0-10h2v8h-2V7z"/>
                  </svg>
                </div>
                <div>
                  <h1 class="text-xl font-bold text-gray-900">Security Guard Portal</h1>
                  <p class="text-sm text-gray-600">Visitor Management</p>
                </div>
              </div>
              
              <!-- Right: User & Logout -->
              <div class="flex items-center gap-3">
                <div class="hidden sm:block text-right">
                  <p class="text-sm font-semibold text-gray-900">${auth.getUser().fullName}</p>
                  <p class="text-xs text-gray-500">Security Guard</p>
                </div>
                <button id="logout-btn" class="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all shadow-sm">
                  <i class="bi bi-box-arrow-right text-white text-lg"></i>
                  <span class="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="grid lg:grid-cols-2 gap-6">
            <!-- Left: Visitor Entry Form -->
            <div class="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
              <!-- Form Header -->
              <div class="mb-6">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <i class="bi bi-person-plus-fill text-emerald-600 text-xl"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900">Log New Visitor</h2>
                </div>
                <p class="text-sm text-gray-600 ml-13">Enter visitor details at the gate</p>
              </div>

              <!-- Form -->
              <form id="visitor-form" class="space-y-6">
                <!-- Visitor Name -->
                <div>
                  <label class="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <i class="bi bi-person-fill text-gray-600 text-lg"></i>
                    Visitor Name <span class="text-red-500">*</span>
                  </label>
                  <input type="text" name="name" required 
                    class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    placeholder="Enter visitor's full name">
                </div>

                <!-- Phone Number -->
                <div>
                  <label class="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <i class="bi bi-telephone-fill text-gray-600 text-lg"></i>
                    Phone Number <span class="text-red-500">*</span>
                  </label>
                  <input type="tel" name="phone" required 
                    class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    placeholder="Enter contact number">
                </div>

                <!-- Reason for Visit -->
                <div>
                  <label class="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <i class="bi bi-file-text-fill text-gray-600 text-lg"></i>
                    Reason for Visit <span class="text-red-500">*</span>
                  </label>
                  <textarea name="purpose" required rows="3"
                    class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none resize-none"
                    placeholder="Enter the purpose of visit (e.g., Meeting, Interview, Delivery...)"></textarea>
                </div>

                <!-- Person to Meet -->
                <div>
                  <label class="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <i class="bi bi-people-fill text-gray-600 text-lg"></i>
                    Person to Meet <span class="text-xs text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <input type="text" name="personToMeet"
                    class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    placeholder="Name of person to meet">
                </div>

                <!-- Submit Button -->
                <div class="mt-6">
                  <button type="submit" 
                    style="display: block !important; visibility: visible !important;"
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200">
                    <i class="bi bi-check-circle-fill text-xl"></i>
                    <span class="ml-2">Log Entry</span>
                  </button>
                </div>
              </form>
            </div>

            <!-- Right: Visitors List -->
            <div class="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
              <!-- List Header -->
              <div class="mb-6">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <i class="bi bi-clock-history text-purple-600 text-xl"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-900">Today's Visitors</h2>
                  </div>
                  <button id="refresh-list" class="p-2 hover:bg-gray-100 rounded-lg transition-all">
                    <i class="bi bi-arrow-clockwise text-gray-600 text-xl"></i>
                  </button>
                </div>
                <p class="text-sm text-gray-600 ml-13">Recent entries logged by you</p>
              </div>

              <!-- List Body -->
              <div id="visitors-list" class="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                <div class="flex items-center justify-center py-16">
                  <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    `;

    document.getElementById('logout-btn').addEventListener('click', async () => {
      await api.logout();
      auth.clear();
      this.stopNotificationPolling();
      this.renderLogin();
    });

    // Refresh list button
    const refreshBtn = document.getElementById('refresh-list');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.loadGuardVisitors();
        this.showToast('List refreshed', 'success');
      });
    }

    // Visitor form submission
    document.getElementById('visitor-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      
      // Get values and trim whitespace
      const name = (formData.get('name') || '').trim();
      const phone = (formData.get('phone') || '').trim();
      const purpose = (formData.get('purpose') || '').trim();
      const personToMeet = (formData.get('personToMeet') || '').trim();
      
      // Client-side validation
      if (!name || !phone || !purpose) {
        this.showToast('Please fill in all required fields', 'error');
        return;
      }
      
      const data = {
        name: name,
        contact: phone,
        purpose: purpose,
        personToMeet: personToMeet || 'N/A'
      };
      
      console.log('Submitting visitor data:', data);

      try {
        await api.logVisitor(data);
        this.showToast('Visitor logged successfully!', 'success');
        e.target.reset();
        // Reload visitors list
        this.loadGuardVisitors();
      } catch (error) {
        console.error('Error logging visitor:', error);
        this.showToast(error.message || 'Failed to log visitor', 'error');
      }
    });

    // Load visitors list
    this.loadGuardVisitors();
  }

  async loadGuardVisitors() {
    try {
      const response = await api.getVisitors();
      const listEl = document.getElementById('visitors-list');
      
      if (!listEl) return;

      const todayVisitors = response.visitors || [];
      
      // Update stats counters
      const todayCount = todayVisitors.length;
      const insideCount = todayVisitors.filter(v => v.timeIn && !v.timeOut).length;
      const checkedOutCount = todayVisitors.filter(v => v.timeOut).length;
      
      if (todayVisitors.length === 0) {
        listEl.innerHTML = `
          <div class="text-center py-16">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="bi bi-people text-gray-400 text-3xl"></i>
            </div>
            <h3 class="text-gray-800 font-bold text-lg mb-2">No visitors yet</h3>
            <p class="text-gray-500 text-sm">Visitors you log will appear here</p>
          </div>
        `;
      } else {
        listEl.innerHTML = todayVisitors.map((visitor, index) => {
          const timeIn = new Date(visitor.timeIn);
          const isInside = visitor.timeIn && !visitor.timeOut;
          const visitorName = visitor.name || 'Unknown';
          const visitorInitial = visitorName.charAt(0).toUpperCase();
          
          return `
            <div class="bg-white border-2 ${isInside ? 'border-green-200' : 'border-gray-200'} rounded-xl p-5 hover:shadow-md transition-all duration-200">
              <div class="flex items-start gap-4">
                <!-- Avatar -->
                <div class="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0">
                  ${visitorInitial}
                </div>
                
                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-3 mb-3">
                    <div class="flex-1">
                      <h3 class="font-bold text-gray-900 text-lg mb-1">${visitorName}</h3>
                      <p class="text-sm text-gray-600 flex items-center gap-2">
                        <i class="bi bi-telephone-fill text-blue-600"></i>
                        ${visitor.contact || 'N/A'}
                      </p>
                    </div>
                    <span class="${isInside ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'} px-3 py-1.5 rounded-lg text-xs font-bold border-2 flex items-center gap-1.5 whitespace-nowrap">
                      <i class="bi ${isInside ? 'bi-door-open-fill' : 'bi-door-closed-fill'}"></i>
                      ${isInside ? 'Inside' : 'Checked Out'}
                    </span>
                  </div>
                  
                  <div class="space-y-2 text-sm">
                    <div class="flex items-start gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                      <i class="bi bi-chat-left-text-fill text-purple-600 text-base mt-0.5 flex-shrink-0"></i>
                      <p class="text-gray-700 break-words"><span class="font-semibold">Purpose:</span> ${visitor.purpose || 'N/A'}</p>
                    </div>
                    ${visitor.personToMeet && visitor.personToMeet !== 'N/A' ? `
                      <div class="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                        <i class="bi bi-person-fill text-amber-600 text-base"></i>
                        <p class="text-gray-700"><span class="font-semibold">Meeting:</span> ${visitor.personToMeet}</p>
                      </div>
                    ` : ''}
                    <div class="flex items-center gap-2 text-xs text-gray-500 pt-1">
                      <i class="bi bi-clock-fill text-blue-600"></i>
                      ${timeIn.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      <span class="mx-1">•</span>
                      ${timeIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    ${visitor.timeOut ? `
                      <div class="flex items-center gap-2 text-xs text-gray-500">
                        <i class="bi bi-box-arrow-right text-red-600"></i>
                        Checked out: ${new Date(visitor.timeOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    } catch (error) {
      console.error('Failed to load visitors:', error);
      const listEl = document.getElementById('visitors-list');
      if (listEl) {
        listEl.innerHTML = `
          <div class="text-center py-12 text-red-600">
            <i class="bi bi-exclamation-triangle text-4xl mb-3"></i>
            <p class="font-semibold">Failed to load visitors</p>
            <p class="text-sm">${error.message}</p>
          </div>
        `;
      }
    }
  }

  async renderPrincipalDashboard() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <!-- Modern Sidebar + Header Layout -->
        <div class="flex h-screen overflow-hidden">
          <!-- Sidebar -->
          <aside class="hidden lg:flex lg:flex-col w-72 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl">
            <!-- Logo/Brand -->
            <div class="flex items-center gap-3 px-6 py-6 border-b border-slate-700">
              <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-white font-bold text-lg">Visitor Hub</h2>
                <p class="text-slate-400 text-xs">Principal Portal</p>
              </div>
            </div>
            
            <!-- Navigation -->
            <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              <a href="#" id="nav-dashboard" class="flex items-center gap-3 px-4 py-3 text-white bg-indigo-600 rounded-xl font-medium shadow-lg transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                Dashboard
              </a>
              
              <a href="#" id="nav-visitors" class="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl font-medium transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                Login Requests
                <span class="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold" id="pending-badge">0</span>
              </a>
              
              <a href="#" id="nav-analytics" class="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl font-medium transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                Analytics
              </a>
              
              <a href="#" id="nav-reports" class="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl font-medium transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Reports
              </a>
            </nav>
            
            <!-- User Profile at Bottom -->
            <div class="px-4 py-4 border-t border-slate-700">
              <div class="flex items-center gap-3 px-4 py-3 bg-slate-700/50 rounded-xl">
                <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  ${auth.getUser().fullName.charAt(0)}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-white text-sm font-medium truncate">${auth.getUser().fullName}</p>
                  <p class="text-slate-400 text-xs">Principal</p>
                </div>
              </div>
            </div>
          </aside>
          
          <!-- Main Content Area -->
          <div class="flex-1 flex flex-col overflow-hidden">
            <!-- Top Header -->
            <header class="bg-white border-b border-slate-200 shadow-sm">
              <div class="flex items-center justify-between px-6 py-4">
                <!-- Mobile Menu + Search -->
                <div class="flex items-center gap-4 flex-1">
                  <button class="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                  </button>
                  
                  <div class="hidden sm:flex items-center gap-2 flex-1 max-w-md">
                    <div class="relative w-full">
                      <input type="text" placeholder="Search..." class="w-full pl-10 pr-4 py-2 bg-slate-100 border-0 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all">
                      <svg class="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <!-- Right Side Actions -->
                <div class="flex items-center gap-3">
                  <!-- Notifications -->
                  <div class="relative" id="notification-badge">
                    <button class="p-2 text-slate-600 hover:bg-slate-100 rounded-xl relative transition-colors">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                      </svg>
                      <span id="unread-count" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 hidden items-center justify-center font-bold">0</span>
                    </button>
                  </div>
                  
                  <!-- Logout -->
                  <button id="logout-btn" class="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    <span class="hidden sm:inline">Logout</span>
                  </button>
                </div>
              </div>
            </header>
            
            <!-- Dashboard Content -->
            <main class="flex-1 overflow-y-auto p-6">
              <!-- Welcome Banner -->
              <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 sm:p-8 mb-6 text-white shadow-xl relative overflow-hidden">
                <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div class="relative z-10">
                  <h1 class="text-2xl sm:text-3xl font-bold mb-2">Welcome back, ${auth.getUser().fullName}! 👋</h1>
                  <p class="text-indigo-100 text-sm sm:text-base">Here's what's happening with your visitor management today</p>
                </div>
              </div>
              
              <!-- Stats Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6" id="stats-cards">
                <!-- Loading placeholder -->
                <div class="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
                  <div class="h-4 bg-slate-200 rounded w-2/3 mb-4"></div>
                  <div class="h-8 bg-slate-200 rounded w-1/3"></div>
                </div>
                <div class="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
                  <div class="h-4 bg-slate-200 rounded w-2/3 mb-4"></div>
                  <div class="h-8 bg-slate-200 rounded w-1/3"></div>
                </div>
                <div class="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
                  <div class="h-4 bg-slate-200 rounded w-2/3 mb-4"></div>
                  <div class="h-8 bg-slate-200 rounded w-1/3"></div>
                </div>
              </div>
              
              <!-- Quick Actions Grid -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Quick Actions Card -->
                <div class="bg-white rounded-2xl p-6 shadow-lg">
                  <h2 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    Quick Actions
                  </h2>
                  <div class="grid grid-cols-2 gap-3">
                    <button id="visitor-requests-btn" class="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 rounded-xl transition-all group relative">
                      <div class="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                      </div>
                      <span class="text-sm font-semibold text-slate-700">Login Requests</span>
                      <span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold" id="quick-pending-badge">0</span>
                    </button>
                    
                    <button id="analytics-btn" class="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all group">
                      <div class="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                      </div>
                      <span class="text-sm font-semibold text-slate-700">Analytics</span>
                    </button>
                    
                    <button id="reports-btn" class="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all group">
                      <div class="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                      </div>
                      <span class="text-sm font-semibold text-slate-700">Reports</span>
                    </button>
                    
                    <button onclick="app.renderVisitorList()" class="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all group">
                      <div class="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                        </svg>
                      </div>
                      <span class="text-sm font-semibold text-slate-700">Visitor List</span>
                    </button>
                  </div>
                </div>
                
                <!-- Recent Visitors Card -->
                <div class="bg-white rounded-2xl p-6 shadow-lg">
                  <h2 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    Recent Visitors
                  </h2>
                  <div class="space-y-4" id="recent-visitors-list">
                    <div class="flex items-center justify-center py-8">
                      <div class="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-600"></div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    `;

    document.getElementById('logout-btn').addEventListener('click', async () => {
      await api.logout();
      auth.clear();
      this.stopNotificationPolling();
      this.renderLogin();
    });

    document.getElementById('visitor-requests-btn').addEventListener('click', () => this.renderVisitorRequests());
    document.getElementById('analytics-btn').addEventListener('click', () => this.renderAnalytics());
    document.getElementById('reports-btn').addEventListener('click', () => this.renderReports());
    
    // Notification button
    document.querySelector('#notification-badge button').addEventListener('click', () => this.renderNotifications());
    
    // Sidebar navigation
    document.getElementById('nav-visitors').addEventListener('click', (e) => {
      e.preventDefault();
      this.renderVisitorRequests();
    });
    document.getElementById('nav-analytics').addEventListener('click', (e) => {
      e.preventDefault();
      this.renderAnalytics();
    });
    document.getElementById('nav-reports').addEventListener('click', (e) => {
      e.preventDefault();
      this.renderReports();
    });

    // Load dashboard stats
    try {
      const stats = await api.getDashboardStats();
      const visitorResponse = await api.getVisitors();
      
      const statsEl = document.getElementById('stats-cards');
      const pendingBadge = document.getElementById('pending-badge');
      const quickPendingBadge = document.getElementById('quick-pending-badge');
      
      if (pendingBadge) {
        pendingBadge.textContent = stats.stats.pendingRequests || 0;
      }
      
      if (quickPendingBadge) {
        quickPendingBadge.textContent = stats.stats.pendingRequests || 0;
      }
      
      statsEl.innerHTML = `
        <div class="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
            <span class="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">Today</span>
          </div>
          <h3 class="text-sm font-medium text-slate-600 mb-1">Visitors Today</h3>
          <p class="text-3xl font-bold text-slate-800">${stats.stats.visitorsToday || 0}</p>
          <p class="text-xs text-slate-500 mt-2">Total check-ins</p>
        </div>
        
        <div class="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <span class="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">Month</span>
          </div>
          <h3 class="text-sm font-medium text-slate-600 mb-1">This Month</h3>
          <p class="text-3xl font-bold text-slate-800">${stats.stats.monthlyVisitors || 0}</p>
          <p class="text-xs text-slate-500 mt-2">Last 30 days</p>
        </div>
        
        <div class="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <span class="text-xs font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">Total</span>
          </div>
          <h3 class="text-sm font-medium text-slate-600 mb-1">Total Visitors</h3>
          <p class="text-3xl font-bold text-slate-800">${stats.stats.totalVisitors || 0}</p>
          <p class="text-xs text-slate-500 mt-2">All time</p>
        </div>
      `;

      // Populate recent visitors list
      const recentVisitorsList = document.getElementById('recent-visitors-list');
      if (recentVisitorsList && visitorResponse.success && visitorResponse.visitors) {
        const recentVisitors = visitorResponse.visitors.slice(0, 5);
        
        if (recentVisitors.length === 0) {
          recentVisitorsList.innerHTML = `
            <div class="text-center py-8">
              <svg class="w-16 h-16 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <p class="text-sm text-slate-500">No visitors yet</p>
            </div>
          `;
        } else {
          recentVisitorsList.innerHTML = recentVisitors.map(visitor => {
            const timeIn = new Date(visitor.timeIn);
            const timeString = timeIn.toLocaleString('en-US', { 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit', 
              minute: '2-digit' 
            });
            
            const guardName = visitor.guardId?.name || 'Unknown Guard';
            const initials = visitor.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            
            const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
            const colorClass = colors[Math.floor(Math.random() * colors.length)];
            
            return `
              <div class="flex items-start gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div class="${colorClass} w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  ${initials}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold text-slate-800 truncate">${visitor.name}</p>
                      <p class="text-xs text-slate-600 truncate">${visitor.purpose}</p>
                    </div>
                    ${visitor.timeOut ? 
                      '<span class="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex-shrink-0">Checked Out</span>' : 
                      '<span class="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full flex-shrink-0">Inside</span>'
                    }
                  </div>
                  <div class="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span class="flex items-center gap-1">
                      <i class="bi bi-clock"></i>
                      ${timeString}
                    </span>
                    <span class="flex items-center gap-1">
                      <i class="bi bi-shield-check"></i>
                      ${guardName}
                    </span>
                  </div>
                </div>
              </div>
            `;
          }).join('');
        }
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }

    // Update pending user badge
    this.updatePendingBadge();
  }

  renderVisitorForm() {
    this.showToast('Visitor form coming soon!');
  }

  async renderAnalytics() {
    const mainContent = document.querySelector('main');
    if (!mainContent) return;

    mainContent.innerHTML = `
      <div class="space-y-6">
        <!-- Back Button -->
        <button onclick="app.renderPrincipalDashboard()" class="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
          <i class="bi bi-arrow-left text-xl"></i>
          <span class="font-semibold">Back to Dashboard</span>
        </button>
        
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-800">Visitor Analytics</h2>
            <p class="text-gray-600 mt-1">View visitor statistics and trends</p>
          </div>
        </div>

        <!-- Tabs -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-2 inline-flex gap-2">
          <button id="tab-daily" class="analytics-tab px-6 py-2 rounded-lg font-semibold transition-all bg-blue-600 text-white">
            Daily
          </button>
          <button id="tab-weekly" class="analytics-tab px-6 py-2 rounded-lg font-semibold transition-all text-gray-600 hover:bg-gray-100">
            Weekly
          </button>
          <button id="tab-monthly" class="analytics-tab px-6 py-2 rounded-lg font-semibold transition-all text-gray-600 hover:bg-gray-100">
            Monthly
          </button>
        </div>

        <!-- Analytics Content -->
        <div id="analytics-content" class="space-y-6">
          <!-- Loading -->
          <div class="flex items-center justify-center py-16">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
          </div>
        </div>
      </div>
    `;

    // Tab switching
    const tabs = document.querySelectorAll('.analytics-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        tabs.forEach(t => {
          t.classList.remove('bg-blue-600', 'text-white');
          t.classList.add('text-gray-600', 'hover:bg-gray-100');
        });
        e.target.classList.add('bg-blue-600', 'text-white');
        e.target.classList.remove('text-gray-600', 'hover:bg-gray-100');
        
        const period = e.target.id.replace('tab-', '');
        this.loadAnalytics(period);
      });
    });

    // Load default (daily)
    this.loadAnalytics('daily');
  }

  async loadAnalytics(period) {
    try {
      const response = await api.getVisitors();
      const visitors = response.visitors || [];
      
      const contentEl = document.getElementById('analytics-content');
      if (!contentEl) return;

      // Calculate date ranges
      const now = new Date();
      let startDate, periodLabel;
      
      if (period === 'daily') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        periodLabel = 'Today';
      } else if (period === 'weekly') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        periodLabel = 'Last 7 Days';
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        periodLabel = 'This Month';
      }

      // Filter visitors by period
      const periodVisitors = visitors.filter(v => new Date(v.timeIn || v.createdAt) >= startDate);
      
      // Calculate stats
      const total = periodVisitors.length;

      // Prepare bar graph data
      let chartData = [];
      let chartLabels = [];
      
      if (period === 'daily') {
        // Hourly breakdown for today
        const hours = Array(24).fill(0);
        periodVisitors.forEach(v => {
          const hour = new Date(v.timeIn || v.createdAt).getHours();
          hours[hour]++;
        });
        chartLabels = hours.map((_, i) => `${i}:00`);
        chartData = hours;
      } else if (period === 'weekly') {
        // Daily breakdown for last 7 days
        const days = Array(7).fill(0);
        const dayLabels = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          dayLabels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        periodVisitors.forEach(v => {
          const visitDate = new Date(v.timeIn || v.createdAt);
          const diffDays = Math.floor((now.getTime() - visitDate.getTime()) / (24 * 60 * 60 * 1000));
          if (diffDays >= 0 && diffDays < 7) {
            days[6 - diffDays]++;
          }
        });
        chartLabels = dayLabels;
        chartData = days;
      } else {
        // Weekly breakdown for this month
        const weeks = Array(5).fill(0);
        periodVisitors.forEach(v => {
          const visitDate = new Date(v.timeIn || v.createdAt);
          const weekNum = Math.floor((visitDate.getDate() - 1) / 7);
          if (weekNum < 5) weeks[weekNum]++;
        });
        chartLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
        chartData = weeks;
      }

      const maxValue = Math.max(...chartData, 1);

      contentEl.innerHTML = `
        <!-- Stats Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div class="flex items-center gap-6">
            <div class="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center">
              <i class="bi bi-people-fill text-blue-600 text-4xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-600 mb-2">${periodLabel} - Total Visitors</h3>
              <p class="text-5xl font-bold text-gray-900">${total}</p>
            </div>
          </div>
        </div>

        <!-- Bar Graph -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-6">Visitor Trends</h3>
          <div class="space-y-3">
            ${chartData.map((value, index) => {
              const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
              return `
                <div class="flex items-center gap-3">
                  <div class="w-20 text-sm font-medium text-gray-600 text-right">${chartLabels[index]}</div>
                  <div class="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                    <div class="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3" style="width: ${percentage}%">
                      ${value > 0 ? `<span class="text-white text-sm font-semibold">${value}</span>` : ''}
                    </div>
                  </div>
                  ${value === 0 ? '<span class="w-8 text-sm text-gray-400">0</span>' : '<div class="w-8"></div>'}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Visitor List -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">${periodLabel} Visitors</h3>
          ${periodVisitors.length === 0 ? `
            <div class="text-center py-12">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="bi bi-inbox text-gray-400 text-3xl"></i>
              </div>
              <p class="text-gray-500">No visitors in this period</p>
            </div>
          ` : `
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-200">
                    <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                    <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact</th>
                    <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Purpose</th>
                    <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Time In</th>
                    <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Time Out</th>
                    <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Logged By</th>
                  </tr>
                </thead>
                <tbody>
                  ${periodVisitors.map(visitor => `
                    <tr class="border-b border-gray-100 hover:bg-gray-50">
                      <td class="py-3 px-4 text-sm text-gray-900">${visitor.name || 'N/A'}</td>
                      <td class="py-3 px-4 text-sm text-gray-600">${visitor.contact || 'N/A'}</td>
                      <td class="py-3 px-4 text-sm text-gray-600">${visitor.purpose || 'N/A'}</td>
                      <td class="py-3 px-4 text-sm text-gray-600">${new Date(visitor.timeIn || visitor.createdAt).toLocaleString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</td>
                      <td class="py-3 px-4 text-sm">
                        ${visitor.timeOut ? 
                          `<span class="text-gray-600">${new Date(visitor.timeOut).toLocaleString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>` :
                          '<span class="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Inside</span>'
                        }
                      </td>
                      <td class="py-3 px-4 text-sm text-gray-600">${visitor.guardId?.name || 'N/A'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      `;
    } catch (error) {
      console.error('Error loading analytics:', error);
      document.getElementById('analytics-content').innerHTML = `
        <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <i class="bi bi-exclamation-triangle text-red-600 text-3xl mb-2"></i>
          <p class="text-red-700">Failed to load analytics</p>
        </div>
      `;
    }
  }

  async renderReports() {
    const mainContent = document.querySelector('main');
    if (!mainContent) return;

    mainContent.innerHTML = `
      <div class="space-y-6">
        <!-- Back Button -->
        <button onclick="app.renderPrincipalDashboard()" class="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
          <i class="bi bi-arrow-left text-xl"></i>
          <span class="font-semibold">Back to Dashboard</span>
        </button>
        
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-800">Generate Reports</h2>
            <p class="text-gray-600 mt-1">Download visitor reports in PDF or CSV format</p>
          </div>
        </div>

        <!-- Report Form -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form id="report-form" class="space-y-6">
            <!-- Date Range -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  <i class="bi bi-calendar-event text-blue-600 mr-2"></i>
                  Start Date
                </label>
                <input type="date" id="startDate" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all">
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  <i class="bi bi-calendar-event text-blue-600 mr-2"></i>
                  End Date
                </label>
                <input type="date" id="endDate" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all">
              </div>
            </div>

            <!-- Status Filter -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <i class="bi bi-funnel text-blue-600 mr-2"></i>
                Filter by Status
              </label>
              <select id="statusFilter" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all">
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <!-- Quick Filters -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-3">Quick Filters</label>
              <div class="flex flex-wrap gap-3">
                <button type="button" class="quick-filter px-4 py-2 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-700 rounded-lg font-medium transition-all" data-filter="today">
                  <i class="bi bi-calendar-day mr-2"></i>Today
                </button>
                <button type="button" class="quick-filter px-4 py-2 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-700 rounded-lg font-medium transition-all" data-filter="week">
                  <i class="bi bi-calendar-week mr-2"></i>This Week
                </button>
                <button type="button" class="quick-filter px-4 py-2 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-700 rounded-lg font-medium transition-all" data-filter="month">
                  <i class="bi bi-calendar-month mr-2"></i>This Month
                </button>
                <button type="button" class="quick-filter px-4 py-2 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-700 rounded-lg font-medium transition-all" data-filter="all">
                  <i class="bi bi-calendar-range mr-2"></i>All Time
                </button>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-4 pt-4 border-t border-gray-200">
              <button type="button" id="generate-pdf-btn" class="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                <i class="bi bi-file-pdf text-xl"></i>
                <span>Download PDF Report</span>
              </button>
              <button type="button" id="generate-csv-btn" class="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                <i class="bi bi-file-earmark-spreadsheet text-xl"></i>
                <span>Download CSV Report</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Info Card -->
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div class="flex items-start gap-3">
            <i class="bi bi-info-circle text-blue-600 text-xl mt-1"></i>
            <div>
              <h3 class="font-semibold text-blue-900 mb-1">Report Information</h3>
              <ul class="text-sm text-blue-800 space-y-1">
                <li>• PDF reports include visitor details, timestamps, and status information</li>
                <li>• CSV reports can be opened in Excel or other spreadsheet applications</li>
                <li>• Use date filters to generate reports for specific time periods</li>
                <li>• Filter by status to analyze approved, pending, or rejected visitors</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;

    // Quick filter buttons
    document.querySelectorAll('.quick-filter').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = e.currentTarget.dataset.filter;
        const today = new Date();
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (filter === 'today') {
          startDateInput.value = today.toISOString().split('T')[0];
          endDateInput.value = today.toISOString().split('T')[0];
        } else if (filter === 'week') {
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          startDateInput.value = weekAgo.toISOString().split('T')[0];
          endDateInput.value = today.toISOString().split('T')[0];
        } else if (filter === 'month') {
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          startDateInput.value = monthStart.toISOString().split('T')[0];
          endDateInput.value = today.toISOString().split('T')[0];
        } else if (filter === 'all') {
          startDateInput.value = '';
          endDateInput.value = '';
        }
      });
    });

    // PDF download
    document.getElementById('generate-pdf-btn').addEventListener('click', async () => {
      await this.generateReport('pdf');
    });

    // CSV download
    document.getElementById('generate-csv-btn').addEventListener('click', async () => {
      await this.generateReport('csv');
    });
  }

  async generateReport(format) {
    try {
      const startDate = document.getElementById('startDate').value;
      const endDate = document.getElementById('endDate').value;
      const status = document.getElementById('statusFilter').value;

      const filters = {};
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (status) filters.status = status;

      this.showToast(`Generating ${format.toUpperCase()} report...`, 'info');

      if (format === 'pdf') {
        await api.generatePDFReport(filters);
        this.showToast('PDF report downloaded successfully!', 'success');
      } else {
        await api.generateCSVReport(filters);
        this.showToast('CSV report downloaded successfully!', 'success');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      const errorMsg = error.message || 'Failed to generate report. Please try again.';
      this.showToast(errorMsg, 'error');
    }
  }

  async renderNotifications() {
    const mainContent = document.querySelector('main');
    if (!mainContent) return;

    mainContent.innerHTML = `
      <div class="space-y-6">
        <!-- Back Button -->
        <button onclick="app.renderPrincipalDashboard()" class="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
          <i class="bi bi-arrow-left text-xl"></i>
          <span class="font-semibold">Back to Dashboard</span>
        </button>
        
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-800">Notifications</h2>
            <p class="text-gray-600 mt-1">Stay updated with visitor requests and system alerts</p>
          </div>
          <button id="mark-all-read-btn" class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all">
            <i class="bi bi-check-all"></i>
            <span>Mark All as Read</span>
          </button>
        </div>

        <!-- Notifications Loading -->
        <div id="notifications-container" class="space-y-3">
          <div class="flex items-center justify-center py-16">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
          </div>
        </div>
      </div>
    `;

    // Mark all as read button
    document.getElementById('mark-all-read-btn').addEventListener('click', async () => {
      try {
        await api.markAllNotificationsRead();
        this.showToast('All notifications marked as read', 'success');
        this.renderNotifications(); // Reload notifications
      } catch (error) {
        console.error('Error marking notifications as read:', error);
        this.showToast('Failed to mark notifications as read', 'error');
      }
    });

    // Load notifications
    await this.loadNotifications();
  }

  async loadNotifications() {
    try {
      const response = await api.getNotifications();
      const notifications = response.notifications || [];
      
      const container = document.getElementById('notifications-container');
      if (!container) return;

      if (notifications.length === 0) {
        container.innerHTML = `
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="bi bi-bell-slash text-gray-400 text-3xl"></i>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">No Notifications</h3>
            <p class="text-gray-600">You're all caught up! No new notifications at this time.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = notifications.map(notification => {
        const isUnread = !notification.read;
        const timeAgo = this.getTimeAgo(new Date(notification.createdAt));
        
        let icon = 'bi-bell';
        let iconColor = 'text-blue-600';
        let bgColor = 'bg-blue-100';
        
        if (notification.type === 'visitor_pending') {
          icon = 'bi-person-plus';
          iconColor = 'text-orange-600';
          bgColor = 'bg-orange-100';
        } else if (notification.type === 'user_pending') {
          icon = 'bi-person-check';
          iconColor = 'text-purple-600';
          bgColor = 'bg-purple-100';
        }

        return `
          <div class="bg-white rounded-xl shadow-sm border ${isUnread ? 'border-blue-300 bg-blue-50' : 'border-gray-200'} p-5 hover:shadow-md transition-all cursor-pointer notification-item" data-id="${notification._id}" data-read="${notification.read}">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center flex-shrink-0">
                <i class="bi ${icon} ${iconColor} text-xl"></i>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2 mb-1">
                  <h3 class="font-semibold text-gray-900 text-sm">${notification.title || 'Notification'}</h3>
                  ${isUnread ? '<span class="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></span>' : ''}
                </div>
                <p class="text-gray-600 text-sm mb-2">${notification.message || ''}</p>
                <div class="flex items-center gap-3 text-xs text-gray-500">
                  <span class="flex items-center gap-1">
                    <i class="bi bi-clock"></i>
                    ${timeAgo}
                  </span>
                  ${isUnread ? '<span class="text-blue-600 font-medium">• Unread</span>' : '<span class="text-gray-400">• Read</span>'}
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Add click handlers to mark notifications as read
      document.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', async () => {
          const id = item.dataset.id;
          const isRead = item.dataset.read === 'true';
          
          if (!isRead) {
            try {
              await api.markNotificationRead(id);
              item.classList.remove('border-blue-300', 'bg-blue-50');
              item.classList.add('border-gray-200');
              item.dataset.read = 'true';
              
              // Update unread count in badge
              const unreadCountEl = document.getElementById('unread-count');
              if (unreadCountEl) {
                const currentCount = parseInt(unreadCountEl.textContent) || 0;
                const newCount = Math.max(0, currentCount - 1);
                if (newCount > 0) {
                  unreadCountEl.textContent = newCount;
                  unreadCountEl.classList.remove('hidden');
                  unreadCountEl.classList.add('flex');
                } else {
                  unreadCountEl.classList.add('hidden');
                  unreadCountEl.classList.remove('flex');
                }
              }
            } catch (error) {
              console.error('Error marking notification as read:', error);
            }
          }
        });
      });
    } catch (error) {
      console.error('Error loading notifications:', error);
      document.getElementById('notifications-container').innerHTML = `
        <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <i class="bi bi-exclamation-triangle text-red-600 text-3xl mb-2"></i>
          <p class="text-red-700">Failed to load notifications</p>
        </div>
      `;
    }
  }

  getTimeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  }

  async renderVisitorList() {
    const mainContent = document.querySelector('main');
    if (!mainContent) return;

    mainContent.innerHTML = `
      <div class="space-y-6">
        <!-- Back Button -->
        <button onclick="app.renderPrincipalDashboard()" class="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
          <i class="bi bi-arrow-left text-xl"></i>
          <span class="font-semibold">Back to Dashboard</span>
        </button>
        
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-800">Visitor List</h2>
            <p class="text-gray-600 mt-1">View all logged visitors and their details</p>
          </div>
        </div>

        <!-- Visitors Loading -->
        <div id="visitors-container" class="space-y-3">
          <div class="flex items-center justify-center py-16">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
          </div>
        </div>
      </div>
    `;

    // Load visitors
    await this.loadVisitorList();
  }

  async loadVisitorList() {
    try {
      const response = await api.getVisitors();
      const visitors = response.visitors || [];
      
      const container = document.getElementById('visitors-container');
      if (!container) return;

      if (visitors.length === 0) {
        container.innerHTML = `
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="bi bi-inbox text-gray-400 text-3xl"></i>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">No Visitors Yet</h3>
            <p class="text-gray-600">No visitors have been logged in the system.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Purpose</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Person to Meet</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Time In</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Time Out</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Logged By</th>
                </tr>
              </thead>
              <tbody>
                ${visitors.map((visitor, index) => `
                  <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}">
                    <td class="py-3 px-4">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span class="text-indigo-600 font-bold text-sm">${visitor.name?.charAt(0) || '?'}</span>
                        </div>
                        <span class="text-sm font-medium text-gray-900">${visitor.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td class="py-3 px-4 text-sm text-gray-600">${visitor.contact || 'N/A'}</td>
                    <td class="py-3 px-4 text-sm text-gray-600">${visitor.purpose || 'N/A'}</td>
                    <td class="py-3 px-4 text-sm text-gray-600">${visitor.personToMeet || 'N/A'}</td>
                    <td class="py-3 px-4 text-sm text-gray-600">
                      ${new Date(visitor.timeIn || visitor.createdAt).toLocaleString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td class="py-3 px-4 text-sm text-gray-600">
                      ${visitor.timeOut 
                        ? new Date(visitor.timeOut).toLocaleString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '<span class="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Inside</span>'
                      }
                    </td>
                    <td class="py-3 px-4 text-sm text-gray-600">${visitor.guardId?.fullName || visitor.guardId?.username || 'Unknown'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Error loading visitors:', error);
      document.getElementById('visitors-container').innerHTML = `
        <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <i class="bi bi-exclamation-triangle text-red-600 text-3xl mb-2"></i>
          <p class="text-red-700">Failed to load visitors</p>
        </div>
      `;
    }
  }

  async renderVisitorRequests() {
    try {
      console.log('Fetching pending users...');
      const result = await api.getPendingUsers();
      console.log('Pending users result:', result);
      const pendingUsers = result.users || [];
      console.log('Pending users array:', pendingUsers);

      const mainContent = document.querySelector('main');
      if (!mainContent) {
        console.error('Main content area not found');
        this.showToast('Main content area not found', 'error');
        return;
      }

      mainContent.innerHTML = `
        <div class="space-y-6">
          <!-- Back Button -->
          <button onclick="app.renderPrincipalDashboard()" class="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <i class="bi bi-arrow-left text-xl"></i>
            <span class="font-semibold">Back to Dashboard</span>
          </button>
          
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-gray-800">Security Guard Login Requests</h2>
              <p class="text-gray-600 mt-1">Review and approve security guard registrations. Guards can only login after approval.</p>
            </div>
            <div class="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg font-semibold">
              ${pendingUsers.length} Pending
            </div>
          </div>

          ${pendingUsers.length === 0 ? `
            <!-- Empty State -->
            <div class="bg-white rounded-lg shadow-sm p-12 text-center">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">All Caught Up!</h3>
              <p class="text-gray-600">No pending security guard login requests at this time.</p>
            </div>
          ` : `
            <!-- Pending Users List -->
            <div class="space-y-4">
              ${pendingUsers.map(user => `
                <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
                  <div class="p-6">
                    <div class="flex items-start justify-between">
                      <!-- User Info -->
                      <div class="flex-1">
                        <div class="flex items-center space-x-3 mb-3">
                          <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            ${user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 class="text-lg font-semibold text-gray-800">${user.fullName}</h3>
                            <p class="text-sm text-gray-500">@${user.username}</p>
                          </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Role</p>
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              user.role === 'principal' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }">
                              ${user.role === 'principal' ? '👑 Principal' : '🛡️ Security Guard'}
                            </span>
                          </div>
                          <div>
                            <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Registered</p>
                            <p class="text-sm text-gray-800 font-medium">
                              ${new Date(user.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>

                        ${user.email ? `
                          <div class="mb-2">
                            <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                            <p class="text-sm text-gray-700">${user.email}</p>
                          </div>
                        ` : ''}
                      </div>

                      <!-- Action Buttons -->
                      <div class="flex flex-col space-y-2 ml-4">
                        <button 
                          onclick="app.approveUser('${user._id}')"
                          class="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-2"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>Approve</span>
                        </button>
                        <button 
                          onclick="app.rejectUser('${user._id}')"
                          class="px-6 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-rose-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-2"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      `;
    } catch (error) {
      console.error('Error loading pending users:', error);
      this.showToast('Failed to load pending users', 'error');
    }
  }

  async renderPendingVisitorRequests() {
    try {
      console.log('Loading pending visitor requests...');
      const result = await api.getVisitors();
      console.log('Visitors result:', result);
      const pendingVisitors = (result.visitors || []).filter(v => v.status === 'pending');
      console.log('Pending visitors array:', pendingVisitors);

      const mainContent = document.querySelector('main');
      if (!mainContent) {
        console.error('Main content area not found');
        this.showToast('Main content area not found', 'error');
        return;
      }

      mainContent.innerHTML = `
        <div class="space-y-6">
          <!-- Back Button -->
          <button onclick="app.renderPrincipalDashboard()" class="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <i class="bi bi-arrow-left text-xl"></i>
            <span class="font-semibold">Back to Dashboard</span>
          </button>
          
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-gray-800">Visitor Entry Requests</h2>
              <p class="text-gray-600 mt-1">Review and approve visitor entries logged by security guards.</p>
            </div>
            <div class="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg font-semibold">
              ${pendingVisitors.length} Pending
            </div>
          </div>

          ${pendingVisitors.length === 0 ? `
            <!-- Empty State -->
            <div class="bg-white rounded-lg shadow-sm p-12 text-center">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">All Caught Up!</h3>
              <p class="text-gray-600">No pending visitor requests at this time.</p>
            </div>
          ` : `
            <!-- Pending Visitors List -->
            <div class="space-y-4">
              ${pendingVisitors.map(visitor => `
                <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
                  <div class="p-6">
                    <div class="flex items-start justify-between">
                      <!-- Visitor Info -->
                      <div class="flex-1">
                        <div class="flex items-center space-x-3 mb-3">
                          <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            ${visitor.name ? visitor.name.charAt(0).toUpperCase() : 'V'}
                          </div>
                          <div>
                            <h3 class="text-lg font-semibold text-gray-800">${visitor.name || 'Unknown'}</h3>
                            <p class="text-sm text-gray-500"><i class="bi bi-telephone-fill"></i> ${visitor.contact || 'N/A'}</p>
                          </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Purpose</p>
                            <p class="text-sm text-gray-800 font-medium">${visitor.purpose || 'N/A'}</p>
                          </div>
                          <div>
                            <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Person to Meet</p>
                            <p class="text-sm text-gray-800 font-medium">${visitor.personToMeet || 'N/A'}</p>
                          </div>
                          <div>
                            <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Entry Time</p>
                            <p class="text-sm text-gray-800 font-medium">
                              ${new Date(visitor.timeIn || visitor.createdAt).toLocaleString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div>
                            <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Logged By</p>
                            <p class="text-sm text-gray-800 font-medium">
                              ${visitor.guardId?.fullName || 'Security Guard'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Action Buttons -->
                      <div class="flex flex-col space-y-2 ml-4">
                        <button 
                          onclick="app.approveVisitor('${visitor._id}')"
                          class="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-2"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>Approve</span>
                        </button>
                        <button 
                          onclick="app.rejectVisitor('${visitor._id}')"
                          class="px-6 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-rose-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-2"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      `;
    } catch (error) {
      console.error('Error loading pending visitors:', error);
      this.showToast('Failed to load pending visitors', 'error');
    }
  }

  async approveUser(userId) {
    if (!confirm('Are you sure you want to approve this user?')) {
      return;
    }

    try {
      await api.approveUser(userId);
      this.showToast('User approved successfully', 'success');
      // Reload the view to update the list
      await this.renderVisitorRequests();
      // Update pending badge if it exists
      this.updatePendingBadge();
    } catch (error) {
      console.error('Error approving user:', error);
      this.showToast('Failed to approve user', 'error');
    }
  }

  async rejectUser(userId) {
    if (!confirm('Are you sure you want to reject and delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await api.deleteUser(userId);
      this.showToast('User rejected and removed', 'success');
      // Reload the view to update the list
      await this.renderVisitorRequests();
      // Update pending badge if it exists
      this.updatePendingBadge();
    } catch (error) {
      console.error('Error rejecting user:', error);
      this.showToast('Failed to reject user', 'error');
    }
  }

  async approveVisitor(visitorId) {
    if (!confirm('Are you sure you want to approve this visitor entry?')) {
      return;
    }

    try {
      await api.approveVisitor(visitorId);
      this.showToast('Visitor approved successfully', 'success');
      // Reload the view to update the list
      await this.renderPendingVisitorRequests();
      // Update visitor requests badge
      this.updateVisitorRequestsBadge();
    } catch (error) {
      console.error('Error approving visitor:', error);
      this.showToast('Failed to approve visitor', 'error');
    }
  }

  async rejectVisitor(visitorId) {
    if (!confirm('Are you sure you want to reject this visitor entry?')) {
      return;
    }

    try {
      await api.rejectVisitor(visitorId);
      this.showToast('Visitor rejected', 'success');
      // Reload the view to update the list
      await this.renderPendingVisitorRequests();
      // Update visitor requests badge
      this.updateVisitorRequestsBadge();
    } catch (error) {
      console.error('Error rejecting visitor:', error);
      this.showToast('Failed to reject visitor', 'error');
    }
  }

  async updatePendingBadge() {
    try {
      const result = await api.getPendingUsers();
      const count = result.users?.length || 0;
      
      // Update sidebar badge
      const badge = document.getElementById('pending-badge');
      if (badge) {
        if (count > 0) {
          badge.textContent = count;
          badge.classList.remove('hidden');
          badge.classList.add('flex');
        } else {
          badge.classList.add('hidden');
          badge.classList.remove('flex');
        }
      }
      
      // Update quick action badge
      const quickBadge = document.getElementById('quick-pending-badge');
      if (quickBadge) {
        if (count > 0) {
          quickBadge.textContent = count;
          quickBadge.style.display = 'block';
        } else {
          quickBadge.style.display = 'none';
        }
      }
    } catch (error) {
      console.error('Failed to update pending badge:', error);
    }
  }

  async updateVisitorRequestsBadge() {
    try {
      const result = await api.getVisitors();
      const pendingVisitors = (result.visitors || []).filter(v => v.status === 'pending');
      const count = pendingVisitors.length;
      
      // Update sidebar badge
      const badge = document.getElementById('visitor-requests-badge');
      if (badge) {
        if (count > 0) {
          badge.textContent = count;
          badge.classList.remove('hidden');
          badge.classList.add('flex');
        } else {
          badge.classList.add('hidden');
          badge.classList.remove('flex');
        }
      }
    } catch (error) {
      console.error('Failed to update visitor requests badge:', error);
    }
  }

  renderDepartments() {
    this.showToast('Departments view coming soon!');
  }

  startNotificationPolling() {
    // Fetch notifications immediately on start
    const fetchNotifications = async () => {
      try {
        const response = await api.getNotifications({ unreadOnly: 'true' });
        const badge = document.getElementById('unread-count');
        if (badge && response.unreadCount > 0) {
          badge.textContent = response.unreadCount;
          badge.classList.remove('hidden');
          badge.classList.add('flex');
        } else if (badge) {
          badge.classList.add('hidden');
          badge.classList.remove('flex');
        }
        
        // Also update visitor requests badge for principals
        if (this.user && this.user.role === 'principal') {
          await this.updatePendingBadge();
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    // Fetch immediately
    fetchNotifications();

    // Then poll every 30 seconds
    this.notificationInterval = setInterval(fetchNotifications, 30000);
  }

  stopNotificationPolling() {
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
      this.notificationInterval = null;
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
