const USER_API_BASE_URL = 'http://192.168.100.251:8000/api/v1/';  

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  is_activated: boolean;
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

// Get All Users
export const getAllUsers = async (): Promise<UserResponse[]> => {
  const response = await fetch(`${USER_API_BASE_URL}auth/users`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || 'Failed to fetch users');
  }

  return responseData as UserResponse[];
};


 
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

// Create Admin User
export const createAdminUser = async (data: AdminUserCreate): Promise<AdminUserResponse> => {
  const response = await fetch(`${USER_API_BASE_URL}admin/create-admin`, {
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



export const deleteUser = async (userId: string): Promise<{ message: string }> => {
  const response = await fetch(`${USER_API_BASE_URL}admin/users/${userId}`, {
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

// Get Current Admin User
export const getCurrentAdminUser = async (): Promise<AdminUserResponse> => {
  const response = await fetch(`${USER_API_BASE_URL}auth/users/me`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || 'Failed to fetch current admin user');
  }

  return responseData as AdminUserResponse;
};





// Update User Fields Interface
export interface UserUpdate {
  username?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'user';
}
// Update User Fields
export const updateUserFields = async (userId: string, updateData: UserUpdate): Promise<AdminUserResponse> => {
  const response = await fetch(`${USER_API_BASE_URL}admin/users/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || 'Failed to update user');
  }
  return responseData as AdminUserResponse;
};




// Add this interface to your existing interfaces
export interface UserActivationToggle {
  is_activated: boolean;
}

// Update your AdminUserResponse interface to include is_activated
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
  is_activated: boolean; // Add this field
}

// Add this function to toggle user activation
export const toggleUserActivation = async (userId: string, isActivated: boolean): Promise<AdminUserResponse> => {
  const response = await fetch(`${USER_API_BASE_URL}admin/users/${userId}/activation`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ is_activated: isActivated }),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || 'Failed to toggle user activation');
  }

  return responseData as AdminUserResponse;
};