import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'https://strapi-186773-0.cloudclusters.net/api';

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  jwt: string;
  user: {
    id: number;
    username: string;
    email: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    createdAt: string;
    updatedAt: string;
    hf: {
      id: number;
      name: string;
      khmerName: string;
      createdAt: string;
      updatedAt: string;
      sign: boolean;
      p2: boolean;
      p3: boolean;
      nss: boolean;
      exchange: number;
    };
  };
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordData {
  code: string;
  password: string;
  passwordConfirmation: string;
}

const handleApiError = (error: any): never => {
  // Convert error to a plain object that can be safely cloned
  const errorDetails = {
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    message: error.message
  };

  // Log error details for debugging
  console.error('API Error:', JSON.stringify(errorDetails, null, 2));

  // Handle specific error cases
  if (error.response?.status === 400) {
    throw new Error(error.response.data?.error?.message || 'Invalid request');
  }
  if (error.response?.status === 401) {
    throw new Error('Authentication required');
  }
  if (error.response?.status === 403) {
    throw new Error('Access denied');
  }
  if (error.message === 'Network Error') {
    throw new Error('Network error. Please check your connection and try again.');
  }

  // Use error message from response if available, otherwise use generic message
  throw new Error(error.response?.data?.error?.message || error.message || 'An unexpected error occurred');
};

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await axios.post(`${API_URL}/auth/local`, credentials, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const { jwt, user } = response.data;
      
      if (!jwt || !user) {
        throw new Error('Invalid response from server');
      }

      // Store token in cookie with httpOnly flag
      Cookies.set('auth_token', jwt, { 
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      return response.data;
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await axios.post(`${API_URL}/auth/local/register`, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  changePassword: async (data: ChangePasswordData): Promise<void> => {
    try {
      const token = authApi.getToken();
      if (!token) {
        throw new Error('You must be logged in to change your password');
      }

      const response = await axios.post(
        `${API_URL}/auth/change-password`,
        {
          currentPassword: data.currentPassword,
          password: data.newPassword,
          passwordConfirmation: data.newPassword,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response?.data) {
        throw new Error('Invalid response from server');
      }

      if (response.data.error) {
        throw new Error(response.data.error.message || 'Failed to change password');
      }
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  forgotPassword: async (email: string): Promise<void> => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/forgot-password`,
        { email },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response?.data) {
        throw new Error('Invalid response from server');
      }

      if (response.data.error) {
        throw new Error(response.data.error.message || 'Failed to send reset password email');
      }
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  resetPassword: async (data: ResetPasswordData): Promise<void> => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/reset-password`,
        {
          code: data.code,
          password: data.password,
          passwordConfirmation: data.passwordConfirmation,
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response?.data) {
        throw new Error('Invalid response from server');
      }

      if (response.data.error) {
        throw new Error(response.data.error.message || 'Failed to reset password');
      }
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  logout: () => {
    Cookies.remove('auth_token');
    localStorage.removeItem('auth-storage');
  },

  getCurrentUser: () => {
    const token = Cookies.get('auth_token');
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      return decoded;
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    const token = Cookies.get('auth_token');
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      // Check if token is expired
      if ((decoded as any).exp < currentTime) {
        authApi.logout();
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  },

  getToken: () => {
    return Cookies.get('auth_token');
  }
};