// Base interfaces
interface ApiError {
  detail?: string;  
  message?: string;
}

// AI Configuration Interfaces
export interface AIConfig {
  id: string;
  prompt_name: string;
  service: 'news' | 'podcast' | 'headlines' | 'summaries' | 'categories';
  prompt_content: string;
  openrouter_model: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface AIConfigCreate {
  prompt_name: string;
  service: 'news' | 'podcast' | 'headlines' | 'summaries' | 'categories';
  prompt_content: string;
  openrouter_model: string;
  description?: string;
}

export interface AIConfigUpdate {
  service?: 'news' | 'podcast' | 'headlines' | 'summaries' | 'categories';
  prompt_content?: string;
  openrouter_model?: string;
  description?: string;
}

export interface AIConfigList {
  configs: AIConfig[];
  total: number;
}

export interface ServiceSummary {
  [service: string]: number;
}

export interface GroupedConfigs {
  [service: string]: AIConfig[];
}

// API Base Configuration
const AI_CONFIG_API_BASE_URL = 'http://192.168.100.251:8000/api/v1/ai_prompts';

const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

 
// Create new AI configuration
export const createAIConfig = async (config: AIConfigCreate): Promise<AIConfig> => {
  const response = await fetch(`${AI_CONFIG_API_BASE_URL}/configs`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(config),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || errorData.message || 'Failed to create AI configuration');
  }
  return responseData as AIConfig;
};

// Get all AI configurations
export const getAllAIConfigs = async (): Promise<AIConfigList> => {
  const response = await fetch(`${AI_CONFIG_API_BASE_URL}/configs`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const responseData = await response.json();
  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || errorData.message || 'Failed to fetch AI configurations');
  }
  return responseData as AIConfigList;
};

// Get specific AI configuration by prompt name
export const getAIConfigByName = async (promptName: string): Promise<AIConfig> => {
  const response = await fetch(`${AI_CONFIG_API_BASE_URL}/configs/${promptName}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || errorData.message || 'Failed to fetch AI configuration');
  }

  return responseData as AIConfig;
};

// Update AI configuration
export const updateAIConfig = async (promptName: string, updates: AIConfigUpdate): Promise<AIConfig> => {
  const response = await fetch(`${AI_CONFIG_API_BASE_URL}/configs/${promptName}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || errorData.message || 'Failed to update AI configuration');
  }

  return responseData as AIConfig;
};

// Delete AI configuration
export const deleteAIConfig = async (promptName: string): Promise<{ message: string }> => {
  const response = await fetch(`${AI_CONFIG_API_BASE_URL}/configs/${promptName}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || errorData.message || 'Failed to delete AI configuration');
  }

  return responseData as { message: string };
};

// Get configurations by service
export const getAIConfigsByService = async (service: string): Promise<AIConfig[]> => {
  const response = await fetch(`${AI_CONFIG_API_BASE_URL}/configs/service/${service}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || errorData.message || 'Failed to fetch configurations by service');
  }

  return responseData as AIConfig[];
};

// Get services summary (service names with config counts)
export const getServicesSummary = async (): Promise<ServiceSummary> => {
  const response = await fetch(`${AI_CONFIG_API_BASE_URL}/services`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || errorData.message || 'Failed to fetch services summary');
  }

  return responseData as ServiceSummary;
};

// Get configurations grouped by service (perfect for dashboard)
export const getGroupedAIConfigs = async (): Promise<GroupedConfigs> => {
  const response = await fetch(`${AI_CONFIG_API_BASE_URL}/configs/grouped`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || errorData.message || 'Failed to fetch grouped configurations');
  }

  return responseData as GroupedConfigs;
};

// UTILITY FUNCTIONS FOR AI CONFIG DATA

// Format AI config data for dashboard display
export const formatAIConfigForDisplay = (config: AIConfig) => {
  return {
    id: config.id,
    name: config.prompt_name,
    service: config.service,
    serviceDisplayName: getServiceDisplayName(config.service),
    model: config.openrouter_model,
    modelDisplayName: getModelDisplayName(config.openrouter_model),
    description: config.description || 'No description',
    promptPreview: config.prompt_content.substring(0, 100) + (config.prompt_content.length > 100 ? '...' : ''),
    promptLength: config.prompt_content.length,
    createdAt: new Date(config.created_at).toLocaleDateString(),
    updatedAt: new Date(config.updated_at).toLocaleDateString(),
    lastModified: new Date(config.updated_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
  };
};

// Format grouped configs for dashboard tabs
export const formatGroupedConfigs = (groupedConfigs: GroupedConfigs) => {
  return Object.entries(groupedConfigs).map(([service, configs]) => ({
    service,
    serviceDisplayName: getServiceDisplayName(service as AIConfig['service']),
    configCount: configs.length,
    configs: configs.map(formatAIConfigForDisplay),
    lastUpdated: configs.length > 0 ? 
      new Date(Math.max(...configs.map(c => new Date(c.updated_at).getTime()))).toLocaleDateString() : 
      'Never',
  }));
};

// Format services summary for dashboard overview
export const formatServicesSummary = (summary: ServiceSummary) => {
  const totalConfigs = Object.values(summary).reduce((sum, count) => sum + count, 0);
  
  return {
    totalConfigs,
    totalServices: Object.keys(summary).length,
    serviceBreakdown: Object.entries(summary).map(([service, count]) => ({
      service,
      serviceDisplayName: getServiceDisplayName(service as AIConfig['service']),
      count,
      percentage: totalConfigs > 0 ? ((count / totalConfigs) * 100).toFixed(1) : '0',
    })),
    mostUsedService: Object.entries(summary).reduce((max, [service, count]) => 
      count > max.count ? { service, count } : max, { service: '', count: 0 }),
  };
};

// Helper function to get service display names
export const getServiceDisplayName = (service: AIConfig['service']): string => {
  const displayNames = {
    news: 'News Articles',
    podcast: 'Podcast Scripts',
    headlines: 'Headlines',
    summaries: 'Daily Summaries',
    categories: 'Categories',
  };
  return displayNames[service] || service;
};

// Helper function to get model display names
export const getModelDisplayName = (model: string): string => {
  const modelNames: Record<string, string> = {
    'openai/gpt-4o': 'GPT-4o',
    'openai/gpt-4o-mini': 'GPT-4o Mini',
    'anthropic/claude-3-sonnet': 'Claude 3 Sonnet',
    'anthropic/claude-3-haiku': 'Claude 3 Haiku',
    'anthropic/claude-3-opus': 'Claude 3 Opus',
    'google/gemini-pro': 'Gemini Pro',
    'meta-llama/llama-3.1-8b-instruct': 'Llama 3.1 8B',
    'meta-llama/llama-3.1-70b-instruct': 'Llama 3.1 70B',
  };
  return modelNames[model] || model;
};

// Get available OpenRouter models
export const getAvailableModels = () => {
  return [
    { value: 'openai/gpt-4o', label: 'GPT-4o', provider: 'OpenAI' },
    { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini', provider: 'OpenAI' },
    { value: 'anthropic/claude-3-sonnet', label: 'Claude 3 Sonnet', provider: 'Anthropic' },
    { value: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku', provider: 'Anthropic' },
    { value: 'anthropic/claude-3-opus', label: 'Claude 3 Opus', provider: 'Anthropic' },
    { value: 'google/gemini-pro', label: 'Gemini Pro', provider: 'Google' },
    { value: 'meta-llama/llama-3.1-8b-instruct', label: 'Llama 3.1 8B', provider: 'Meta' },
    { value: 'meta-llama/llama-3.1-70b-instruct', label: 'Llama 3.1 70B', provider: 'Meta' },
  ];
};

// Get available services
export const getAvailableServices = () => {
  return [
    { value: 'news', label: 'News Articles' },
    { value: 'podcast', label: 'Podcast Scripts' },
    { value: 'headlines', label: 'Headlines' },
    { value: 'summaries', label: 'Daily Summaries' },
    { value: 'categories', label: 'Categories' },
  ];
};

// Validation helpers
export const validateAIConfig = (config: AIConfigCreate): string[] => {
  const errors: string[] = [];
  
  if (!config.prompt_name.trim()) {
    errors.push('Prompt name is required');
  }
  
  if (!config.prompt_content.trim()) {
    errors.push('Prompt content is required');
  }
  
  if (!config.openrouter_model.trim()) {
    errors.push('Model selection is required');
  }
  
  if (config.prompt_content.length > 4000) {
    errors.push('Prompt content must be less than 4000 characters');
  }
  
  return errors;
};

// Search and filter utilities
export const searchConfigs = (configs: AIConfig[], searchTerm: string): AIConfig[] => {
  const term = searchTerm.toLowerCase();
  return configs.filter(config => 
    config.prompt_name.toLowerCase().includes(term) ||
    config.service.toLowerCase().includes(term) ||
    config.description?.toLowerCase().includes(term) ||
    config.prompt_content.toLowerCase().includes(term)
  );
};

export const filterConfigsByService = (configs: AIConfig[], service: string): AIConfig[] => {
  if (!service || service === 'all') return configs;
  return configs.filter(config => config.service === service);
};