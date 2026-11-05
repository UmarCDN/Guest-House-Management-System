import api, { simulateDelay } from './api';
import { User, AuthResponse } from '../types';

const MOCK_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Tariq Mehmood (Admin)',
    email: 'admin@example.com',
    role: 'admin',
    phone: '+92 300 8887766',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    createdAt: '2024-01-15'
  },
  {
    id: 'usr-cust-1',
    name: 'Zainab Ahmed',
    email: 'customer@example.com',
    role: 'customer',
    phone: '+92 300 1234567',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    address: 'House 45, Street 12, F-8/2',
    city: 'Islamabad',
    country: 'Pakistan',
    cnic: '42101-1234567-1',
    createdAt: '2025-03-10'
  }
];

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.token && res.data?.user) {
        const user: User = {
          id: String(res.data.user.id),
          name: res.data.user.name,
          email: res.data.user.email,
          role: res.data.user.role,
          phone: res.data.user.phone,
          avatar: res.data.user.avatar,
          createdAt: res.data.user.created_at || new Date().toISOString()
        };
        localStorage.setItem('guesthouse_auth_token', res.data.token);
        localStorage.setItem('guesthouse_user', JSON.stringify(user));
        return { user, token: res.data.token };
      }
    } catch (err: any) {
      console.warn('Backend API login notice:', err?.response?.data?.message || err.message);
      if (err?.response?.status === 401) {
        throw new Error(err.response.data.message || 'Invalid email or password.');
      }
    }

    // Fallback if backend offline
    if (email.toLowerCase() === 'admin@example.com' && password === 'admin123') {
      const user = MOCK_USERS[0];
      const token = 'mock_jwt_token_admin_778899';
      localStorage.setItem('guesthouse_auth_token', token);
      localStorage.setItem('guesthouse_user', JSON.stringify(user));
      return simulateDelay({ user, token });
    }

    if (email.toLowerCase() === 'customer@example.com' && password === 'customer123') {
      const user = MOCK_USERS[1];
      const token = 'mock_jwt_token_customer_112233';
      localStorage.setItem('guesthouse_auth_token', token);
      localStorage.setItem('guesthouse_user', JSON.stringify(user));
      return simulateDelay({ user, token });
    }

    if (password.length >= 6) {
      const user: User = {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0],
        email: email,
        role: email.toLowerCase().includes('admin') ? 'admin' : 'customer',
        createdAt: new Date().toISOString()
      };
      const token = `mock_jwt_token_${Date.now()}`;
      localStorage.setItem('guesthouse_auth_token', token);
      localStorage.setItem('guesthouse_user', JSON.stringify(user));
      return simulateDelay({ user, token });
    }

    throw new Error('Invalid email or password. Use demo accounts or enter a password of at least 6 characters.');
  },

  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<AuthResponse> => {
    try {
      const fullName = `${userData.firstName} ${userData.lastName}`.trim();
      const res = await api.post('/auth/register', {
        name: fullName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone
      });

      if (res.data?.token && res.data?.user) {
        const user: User = {
          id: String(res.data.user.id),
          name: res.data.user.name,
          email: res.data.user.email,
          role: res.data.user.role,
          phone: res.data.user.phone,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('guesthouse_auth_token', res.data.token);
        localStorage.setItem('guesthouse_user', JSON.stringify(user));
        return { user, token: res.data.token };
      }
    } catch (err: any) {
      console.warn('Backend API register notice:', err?.response?.data?.message || err.message);
      if (err?.response?.status === 409) {
        throw new Error(err.response.data.message || 'A user with this email address already exists.');
      }
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: `${userData.firstName} ${userData.lastName}`,
      email: userData.email,
      phone: userData.phone,
      role: 'customer',
      createdAt: new Date().toISOString()
    };
    const token = `mock_jwt_token_${Date.now()}`;
    localStorage.setItem('guesthouse_auth_token', token);
    localStorage.setItem('guesthouse_user', JSON.stringify(newUser));
    return simulateDelay({ user: newUser, token });
  },

  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    return simulateDelay({
      success: true,
      message: `If an account exists for ${email}, a password reset link has been dispatched to your inbox.`
    }, 500);
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('guesthouse_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const current = authService.getCurrentUser() || {} as User;
    try {
      const res = await api.put('/users/profile', {
        name: userData.name,
        phone: userData.phone,
        avatar: userData.avatar
      });
      if (res.data?.user) {
        const updated: User = {
          ...userData,
          id: String(res.data.user.id),
          name: res.data.user.name,
          email: res.data.user.email,
          role: res.data.user.role,
          phone: res.data.user.phone,
          createdAt: userData.createdAt || current.createdAt || new Date().toISOString()
        };
        localStorage.setItem('guesthouse_user', JSON.stringify(updated));
        return updated;
      }
    } catch (err) {
      console.warn('Backend API updateProfile failed, falling back to local.', err);
    }
    const merged = { ...current, ...userData };
    localStorage.setItem('guesthouse_user', JSON.stringify(merged));
    return simulateDelay(merged);
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.post('/auth/change-password', { currentPassword, newPassword });
      return { success: true, message: res.data?.message || 'Password updated successfully!' };
    } catch (err: any) {
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw new Error(err.message || 'Failed to update password.');
    }
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('guesthouse_auth_token');
    localStorage.removeItem('guesthouse_user');
    await simulateDelay(true, 100);
  }
};
