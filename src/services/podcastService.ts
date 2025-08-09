// podcastService.ts

const PODCAST_API_BASE_URL = 'http://192.168.100.251:8000/api/v1/podcast/';
const BACKEND_BASE_URL = 'http://192.168.100.251:8000';

// Helper function to construct full audio URL
const constructAudioUrl = (relativeUrl?: string): string | undefined => {
  if (!relativeUrl) return undefined;
  
   if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  
   const cleanUrl = relativeUrl.startsWith('/') ? relativeUrl.substring(1) : relativeUrl;
  
  return `${BACKEND_BASE_URL}/${cleanUrl}`;
};

// Podcast Interfaces
export interface PodcastResponse {
  id: string;
  date: string;
  summary_text: string;
  audio_url?: string;
  total_articles: number;
  generated_at: string;
  audio_duration_seconds?: number;
  audio_duration_formatted?: string;
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

export interface PaginatedPodcastResponse {
  podcasts: PodcastResponse[];
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

// Get All Podcast Summaries with Pagination
export const getAllPodcastSummaries = async (
  page: number = 1,
  limit: number = 20
): Promise<PaginatedPodcastResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`${PODCAST_API_BASE_URL}summaries?${params}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || 'Failed to fetch podcast summaries');
  }

  const data = responseData as PaginatedPodcastResponse;
  
  // Fix audio URLs to point to the correct backend location
  const fixedPodcasts = data.podcasts.map(podcast => ({
    ...podcast,
    audio_url: constructAudioUrl(podcast.audio_url)
  }));

  return {
    ...data,
    podcasts: fixedPodcasts
  };
};

// Utility function to format date
export const formatPodcastDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Utility function to format audio duration
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};


export interface DeletePodcastResponse {
  message: string;
  deleted_id: string;
}

// Delete Podcast Summary by ID
export const deletePodcastById = async (podcastId: string): Promise<DeletePodcastResponse> => {
  const response = await fetch(`${PODCAST_API_BASE_URL}summary/${podcastId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || 'Failed to delete podcast summary');
  }

  return responseData as DeletePodcastResponse;
};