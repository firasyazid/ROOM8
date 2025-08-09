// categoriesService.ts

const CATEGORIES_API_BASE_URL = 'http://192.168.100.251:8000/api/v1/categories/';

// Category Interfaces
export interface CategoryCreate {
  name: string;
  description?: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  description?: string;
  news_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface CategoryUpdate {
  name?: string;
  description?: string;
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

// Get All Categories
export const getAllCategories = async (): Promise<CategoryResponse[]> => {
  const response = await fetch(`${CATEGORIES_API_BASE_URL}getAll`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || 'Failed to fetch categories');
  }

  return responseData as CategoryResponse[];
};

// Create New Category
export const createCategory = async (category: CategoryCreate): Promise<CategoryResponse> => {
  const response = await fetch(`${CATEGORIES_API_BASE_URL}create`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(category),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || 'Failed to create category');
  }

  return responseData as CategoryResponse;
};

// Utility function to format date
export const formatCategoryDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};



// Update Category
export const updateCategory = async (
  categoryId: string, 
  categoryUpdate: CategoryUpdate
): Promise<CategoryResponse> => {
  const response = await fetch(`${CATEGORIES_API_BASE_URL}update/${categoryId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(categoryUpdate),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || 'Failed to update category');
  }

  return responseData as CategoryResponse;
};

// Delete Category by ID
export const deleteCategoryById = async (categoryId: string): Promise<CategoryResponse> => {
  const response = await fetch(`${CATEGORIES_API_BASE_URL}${categoryId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || 'Failed to delete category');
  }

  return responseData as CategoryResponse;
};

