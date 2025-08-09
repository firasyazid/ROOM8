const NEWS_API_BASE_URL = 'http://192.168.100.251:8000/api/v1/news/';

// News Interfaces
export interface Source {
  name: string;
  url: string;
}

export interface NewsResponse {
  id: string;
  title: string;
  description?: string;
  content?: string;
  url: string;
  image?: string;
  publishedAt: string;
  category_ids: string[];
  category_names: string[];  
  source_name?: string;
  source?: Source[];
  audio_url?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationMetadata {
  current_page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
  next_page?: number;
  prev_page?: number;
}

export interface PaginatedNewsResponse {
  news: NewsResponse[];
  pagination: PaginationMetadata;
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

// Get All News with Pagination
export const getAllNews = async (
  page: number = 1,
  limit: number = 20
): Promise<PaginatedNewsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`${NEWS_API_BASE_URL}newsAll?${params}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || 'Failed to fetch news');
  }

  return responseData as PaginatedNewsResponse;
};

// Get News by ID
export const getNewsById = async (newsId: string): Promise<NewsResponse> => {
  const response = await fetch(`${NEWS_API_BASE_URL}byid/${newsId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || 'Failed to fetch news article');
  }

  return responseData as NewsResponse;
};

// Utility function to format date
export const formatNewsDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};



export interface DeleteNewsResponse {
  message: string;
  deleted_id: string;
}

export const deleteNewsById = async (newsId: string): Promise<DeleteNewsResponse> => {
  const response = await fetch(`${NEWS_API_BASE_URL}${newsId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || 'Failed to delete news article');
  }

  return responseData as DeleteNewsResponse;
};




// Utility function to extract domain from URL
export const extractDomain = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return 'Unknown Source';
  }
};