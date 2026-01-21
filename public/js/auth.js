// Authentication state management
class Auth {
  constructor() {
    this.user = null;
    this.init();
  }

  init() {
    const stored = localStorage.getItem('user');
    if (stored) {
      this.user = JSON.parse(stored);
    }
  }

  setUser(user) {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser() {
    return this.user;
  }

  getRole() {
    return this.user?.role || null;
  }

  isAuthenticated() {
    return this.user !== null;
  }

  isPrincipal() {
    return this.user?.role === 'principal';
  }

  isGuard() {
    return this.user?.role === 'guard';
  }

  clear() {
    this.user = null;
    localStorage.removeItem('user');
  }
}

const auth = new Auth();
