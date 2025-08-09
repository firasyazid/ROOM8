const API_BASE_URL = 'http://192.168.100.251:8000/api/v1/admin';

// Interfaces
export interface AdminLoginData {
  email: string;
  password: string;
}

interface AdminLoginResponse {
  access_token: string;
  token_type: string;
  role: string;
  user_id: string;
}

export interface AdminUserCreate {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

export interface AdminUserResponse {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  auth_provider: string;
  google_id?: string | null;
  created_at: string;
  reset_code?: string | null;
  reset_code_expiry?: string | null;
}

export interface ResetPasswordData {
  email: string;
  reset_code: string;
  new_password: string;
}

export interface DashboardStats {
  total_users: number;
  admin_count: number;
  regular_user_count: number;
  google_users: number;
  email_users: number;
  recent_users_7_days: number;
  role_distribution: {
    admin: number;
    user: number;
  };
  auth_provider_distribution: {
    google: number;
    email: number;
  };
}

interface ApiError {
  detail: string;
  status?: number;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Admin Login
export const adminLogin = async (data: AdminLoginData): Promise<AdminLoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();


  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || 'Login failed');
  }

  // Store token in localStorage
  localStorage.setItem('admin_token', responseData.access_token);
   
  // Store token in cookie (24 hours)
  document.cookie = `admin_token=${responseData.access_token}; path=/; max-age=86400; SameSite=Strict`;
  
  return responseData as AdminLoginResponse;
};

// Static Login
export const staticLogin = async (username: string, password: string): Promise<{ token: string; username: string }> => {
  const res = await fetch(`/api/static-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = (data && data.error) || 'Login failed';
    throw new Error(msg);
  }
  localStorage.setItem('admin_token', data.token);
  localStorage.setItem('admin_user', data.username);
  // also cookie for parity
  document.cookie = `admin_token=${data.token}; path=/; max-age=86400; SameSite=Strict`;
  return data;
};

// Admin Logout
export const adminLogout = (): void => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  // expire cookie
  document.cookie = 'admin_token=; path=/; max-age=0; SameSite=Strict';
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return localStorage.getItem('admin_token') !== null;
};

// Create Admin User
export const createAdminUser = async (data: AdminUserCreate): Promise<AdminUserResponse> => {
  const response = await fetch(`${API_BASE_URL}/create-admin`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || 'Failed to create admin user');
  }

  return responseData as AdminUserResponse;
};

// Get All Users
export const getAllUsers = async (): Promise<AdminUserResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || 'Failed to fetch users');
  }

  return responseData as AdminUserResponse[];
};

// Get User by ID
export const getUserById = async (userId: string): Promise<AdminUserResponse> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || 'Failed to fetch user');
  }

  return responseData as AdminUserResponse;
};

// Update User Role
export const updateUserRole = async (userId: string, newRole: 'admin' | 'user'): Promise<AdminUserResponse> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(newRole),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || 'Failed to update user role');
  }

  return responseData as AdminUserResponse;
};

// Delete User
export const deleteUser = async (userId: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || 'Failed to delete user');
  }

  return responseData as { message: string };
};

// Get Dashboard Stats
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || 'Failed to fetch dashboard stats');
  }

  return responseData as DashboardStats;
};

// Request Password Reset
export const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/reset-password-request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || 'Password reset request failed');
  }

  return responseData as { message: string };
};

// Reset Password
export const resetPassword = async (data: ResetPasswordData): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || 'Password reset failed');
  }

  return responseData as { message: string };
};

