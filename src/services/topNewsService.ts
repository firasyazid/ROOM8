// headlineNewsService.ts

const HEADLINES_API_BASE_URL = 'http://192.168.100.251:8000/api/v1/headlines/';

// Headline News Interfaces
export interface Source {
  name: string;
  url: string;
}

export interface HeadlineNewsResponse {
  id: string;
  title: string;
  description?: string;
  content?: string;
  url: string;
  image?: string;
  publishedAt: string;
  source: Source[];
  audio_url?: string;
  language?: string;
  country?: string;
  category?: string;
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

export interface PaginatedHeadlineNewsResponse {
  headlines: HeadlineNewsResponse[];
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

// Get All Top News with Pagination
export const getAllTopNews = async (
  page: number = 1,
  limit: number = 20
): Promise<PaginatedHeadlineNewsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`${HEADLINES_API_BASE_URL}getAllTopNews?${params}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || 'Failed to fetch top headlines');
  }

  return responseData as PaginatedHeadlineNewsResponse;
};

// Utility function to format date
export const formatHeadlineDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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




export interface DeleteHeadlineResponse {
  message: string;
  deleted_id: string;
}

// Delete Headline News by ID
export const deleteHeadlineById = async (newsId: string): Promise<DeleteHeadlineResponse> => {
  const response = await fetch(`${HEADLINES_API_BASE_URL}${newsId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || 'Failed to delete headline news article');
  }

  return responseData as DeleteHeadlineResponse;
};