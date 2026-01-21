// API utility for making authenticated requests
class API {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include' // Include cookies
    };

    try {
      console.log('API Request:', url, config);
      const response = await fetch(url, config);
      console.log('API Response status:', response.status);
      const data = await response.json();
      console.log('API Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async checkSetup() {
    return this.request('/setup/check');
  }

  async initializeSetup(data) {
    return this.request('/setup/initialize', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async signup(data) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST'
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async resetPassword(data) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Departments
  async getDepartments() {
    return this.request('/departments');
  }

  async createDepartment(data) {
    return this.request('/departments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateDepartment(id, data) {
    return this.request(`/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteDepartment(id) {
    return this.request(`/departments/${id}`, {
      method: 'DELETE'
    });
  }

  // Visitors
  async getVisitors(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/visitors${query ? '?' + query : ''}`);
  }

  async getVisitor(id) {
    return this.request(`/visitors/${id}`);
  }

  async logVisitor(data) {
    return this.request('/visitors', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async approveVisitor(id) {
    return this.request(`/visitors/${id}/approve`, {
      method: 'PUT'
    });
  }

  async rejectVisitor(id) {
    return this.request(`/visitors/${id}/reject`, {
      method: 'PUT'
    });
  }

  async checkoutVisitor(id) {
    return this.request(`/visitors/${id}/checkout`, {
      method: 'PUT'
    });
  }

  // Analytics
  async getDashboardStats() {
    return this.request('/analytics/dashboard');
  }

  async getWeeklyAnalytics() {
    return this.request('/analytics/weekly');
  }

  async getMonthlyAnalytics() {
    return this.request('/analytics/monthly');
  }

  async getDepartmentAnalytics() {
    return this.request('/analytics/departments');
  }

  async getMemberAnalytics() {
    return this.request('/analytics/members');
  }

  // Notifications
  async getNotifications(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/notifications${query ? '?' + query : ''}`);
  }

  async markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT'
    });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT'
    });
  }

  // Users
  async getPendingUsers() {
    return this.request('/users/pending');
  }

  async getAllUsers() {
    return this.request('/users');
  }

  async approveUser(id) {
    return this.request(`/users/${id}/approve`, {
      method: 'PUT'
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE'
    });
  }

  // Members
  async getMembers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/members${query ? '?' + query : ''}`);
  }

  async getMemberHistory(id) {
    return this.request(`/members/${id}/history`);
  }

  async updateMember(id, data) {
    return this.request(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Reports
  async generatePDFReport(filters) {
    const response = await fetch(`${this.baseURL}/reports/pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(filters)
    });

    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visitor-report-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  async generateCSVReport(filters) {
    const response = await fetch(`${this.baseURL}/reports/csv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(filters)
    });

    if (!response.ok) {
      throw new Error('Failed to generate CSV');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visitor-report-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

// Export instance
const api = new API();
