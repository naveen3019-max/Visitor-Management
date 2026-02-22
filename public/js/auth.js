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

  setUser(user, token) {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
    if (token) {
      localStorage.setItem('authToken', token);
      console.log('Auth token stored in localStorage');
    }
  }

  getUser() {
    return this.user;
  }
  
  getToken() {
    return localStorage.getItem('authToken');
  }

  getRole() {
    return this.user?.role || null;
  }

  isAuthenticated() {
    return this.user !== null && this.getToken() !== null;
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
    localStorage.removeItem('authToken');
    localStorage.removeItem('sessionSaved');
    console.log('Auth cleared from localStorage');
  }
}

const auth = new Auth();
