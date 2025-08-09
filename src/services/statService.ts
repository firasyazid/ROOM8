 interface ApiError {
  detail?: string;  
  message?: string;
 }
// Statistics Dashboard Interfaces
export interface UserStats {
  total_users: number;
  active_users_today: number;
  new_logins_today: number;
  new_registrations_today: number;
}

export interface TopNews {
  news_id: string;
  news_title: string;
  view_count: number;
  unique_viewers: number;
}

export interface PodcastStats {
  podcast_id: string;
  podcast_date: string;
  start_count: number;
  complete_count: number;
  completion_rate: number;
}

export interface StatsDashboard {
  user_stats: UserStats;
  top_news: TopNews[];
  podcast_stats: PodcastStats[];
  total_events_today: number;
}

 const STATS_API_BASE_URL = 'http://192.168.100.251:8000/api/v1/stats';

 const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// MAIN STATISTICS DASHBOARD FUNCTION
export const getStatsDashboard = async (): Promise<StatsDashboard> => {
  const response = await fetch(`${STATS_API_BASE_URL}/dashboard`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || 'Failed to fetch statistics dashboard');
  }

  return responseData as StatsDashboard;
};

//UTILITY FUNCTION TO FORMAT DASHBOARD DATA  
export const formatStatsDashboard = (stats: StatsDashboard) => {
  return {
    // User metrics
    totalUsers: stats.user_stats.total_users,
    activeToday: stats.user_stats.active_users_today,
    newLogins: stats.user_stats.new_logins_today,
    newRegistrations: stats.user_stats.new_registrations_today,
    
    // Top articles with better formatting
    topArticles: stats.top_news.map(article => ({
      id: article.news_id,
      title: article.news_title,
      views: article.view_count,
      uniqueViewers: article.unique_viewers,
    })),
    
    // Podcast statistics
    podcastStats: stats.podcast_stats.map(podcast => ({
      id: podcast.podcast_id,
      date: new Date(podcast.podcast_date).toLocaleDateString(),
      starts: podcast.start_count,
      completions: podcast.complete_count,
      completionRate: Math.min(podcast.completion_rate, 100),  
    })),
    
    // Total events today
    totalEventsToday: stats.total_events_today,
  };
};




// Add these new interfaces for daily registrations
export interface DailyRegistrationData {
  date: string;
  registrations: number;
  day_of_week: string;
}

export interface DailyRegistrationsResponse {
  date_range: {
    start_date: string;
    end_date: string;
    total_days: number;
  };
  summary: {
    total_registrations: number;
    average_per_day: number;
    peak_day: DailyRegistrationData | null;
    lowest_day: DailyRegistrationData | null;
  };
  daily_data: DailyRegistrationData[];
}

// Add the daily registrations function
export const getDailyRegistrations = async (): Promise<DailyRegistrationsResponse> => {
  const response = await fetch(`${STATS_API_BASE_URL}/registrations/daily`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || errorData.message || 'Failed to fetch daily registrations');
  }

  return responseData as DailyRegistrationsResponse;
};

// Utility function to format daily registrations data
export const formatDailyRegistrations = (data: DailyRegistrationsResponse) => {
  return {
    // Summary metrics
    totalRegistrations: data.summary.total_registrations,
    averagePerDay: data.summary.average_per_day,
    totalDays: data.date_range.total_days,
    dateRange: {
      startDate: new Date(data.date_range.start_date).toLocaleDateString(),
      endDate: new Date(data.date_range.end_date).toLocaleDateString(),
    },
    
    // Peak and lowest days
    peakDay: data.summary.peak_day ? {
      date: new Date(data.summary.peak_day.date).toLocaleDateString(),
      registrations: data.summary.peak_day.registrations,
      dayOfWeek: data.summary.peak_day.day_of_week,
    } : null,
    
    lowestDay: data.summary.lowest_day ? {
      date: new Date(data.summary.lowest_day.date).toLocaleDateString(),
      registrations: data.summary.lowest_day.registrations,
      dayOfWeek: data.summary.lowest_day.day_of_week,
    } : null,
    
    // Daily data for charts/graphs
    chartData: data.daily_data.map(day => ({
      date: new Date(day.date).toLocaleDateString(),
      registrations: day.registrations,
      dayOfWeek: day.day_of_week,
      shortDate: new Date(day.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
    })),
    
    // Weekly patterns
    weeklyPattern: data.daily_data.reduce((acc, day) => {
      const dayOfWeek = day.day_of_week;
      if (!acc[dayOfWeek]) {
        acc[dayOfWeek] = { total: 0, count: 0 };
      }
      acc[dayOfWeek].total += day.registrations;
      acc[dayOfWeek].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>),
  };
};

// Additional utility function to get weekly averages
export const getWeeklyAverages = (formattedData: ReturnType<typeof formatDailyRegistrations>) => {
  const weeklyPattern = formattedData.weeklyPattern;
  
  return Object.entries(weeklyPattern).map(([day, data]) => ({
    dayOfWeek: day,
    averageRegistrations: Math.round((data.total / data.count) * 100) / 100,
    totalDays: data.count,
    totalRegistrations: data.total,
  })).sort((a, b) => {
    // Sort by day of week (Monday first)
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek);
  });
};

// API Usage Statistics Interfaces
export interface ApiUsageStats {
  date_range: {
    start_date: string;
    end_date: string;
    days_analyzed: number;
  };
  total_calls: number;
  calls_by_status_code: Record<string, number>;
  calls_by_endpoint: Record<string, number>;
  calls_by_method: Record<string, number>;
  peak_usage_times: {
    peak_hour: number;
    peak_hour_calls: number;
    peak_day: string;
    peak_day_calls: number;
  };
  hourly_usage: Record<string, number>;
  daily_usage: Record<string, number>;
  performance_metrics: {
    average_response_time_ms: number;
    success_rate: number;
    error_4xx_count: number;
    error_5xx_count: number;
    error_rate: number;
  };
}

// API Usage Statistics function
export const getApiUsageStats = async (days: number = 30): Promise<ApiUsageStats> => {
  const response = await fetch(`${STATS_API_BASE_URL}/api-usage/stats?days=${days}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new Error(errorData.detail || errorData.message || 'Failed to fetch API usage statistics');
  }

  return responseData as ApiUsageStats;
};

// Utility function to format API usage data for charts and displays
export const formatApiUsageStats = (stats: ApiUsageStats) => {
  return {
    // Overview metrics
    totalCalls: stats.total_calls,
    daysAnalyzed: stats.date_range.days_analyzed,
    dateRange: {
      startDate: new Date(stats.date_range.start_date).toLocaleDateString(),
      endDate: new Date(stats.date_range.end_date).toLocaleDateString(),
    },

    // Performance metrics
    averageResponseTime: stats.performance_metrics.average_response_time_ms,
    successRate: stats.performance_metrics.success_rate,
    errorRate: stats.performance_metrics.error_rate,
    error4xxCount: stats.performance_metrics.error_4xx_count,
    error5xxCount: stats.performance_metrics.error_5xx_count,

    // Peak usage
    peakHour: stats.peak_usage_times.peak_hour,
    peakHourCalls: stats.peak_usage_times.peak_hour_calls,
    peakDay: new Date(stats.peak_usage_times.peak_day).toLocaleDateString(),
    peakDayCall: stats.peak_usage_times.peak_day_calls,

    // Status codes for chart display
    statusCodeChart: Object.entries(stats.calls_by_status_code).map(([code, count]) => ({
      statusCode: code,
      count: count,
      type: code.startsWith('2') ? 'Success' : code.startsWith('4') ? 'Client Error' : code.startsWith('5') ? 'Server Error' : 'Other'
    })),

    // Top endpoints for display
    topEndpoints: Object.entries(stats.calls_by_endpoint).map(([endpoint, count]) => ({
      endpoint: endpoint,
      count: count,
      percentage: ((count / stats.total_calls) * 100).toFixed(1)
    })),

    // HTTP methods
    methodsChart: Object.entries(stats.calls_by_method).map(([method, count]) => ({
      method: method,
      count: count,
      percentage: ((count / stats.total_calls) * 100).toFixed(1)
    })),

    // Hourly usage for chart (24 hour format)
    hourlyUsageChart: Array.from({ length: 24 }, (_, hour) => ({
      hour: hour,
      calls: stats.hourly_usage[hour.toString()] || 0,
      formattedHour: `${hour.toString().padStart(2, '0')}:00`
    })),

    // Daily usage for chart
    dailyUsageChart: Object.entries(stats.daily_usage).map(([date, calls]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      calls: calls,
      fullDate: date
    })).sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()),

    // Performance status
    performanceStatus: {
      responseTime: stats.performance_metrics.average_response_time_ms < 100 ? 'Excellent' : 
                   stats.performance_metrics.average_response_time_ms < 500 ? 'Good' : 
                   stats.performance_metrics.average_response_time_ms < 1000 ? 'Fair' : 'Poor',
      successRate: stats.performance_metrics.success_rate > 99 ? 'Excellent' : 
                  stats.performance_metrics.success_rate > 95 ? 'Good' : 
                  stats.performance_metrics.success_rate > 90 ? 'Fair' : 'Poor',
      errorRate: stats.performance_metrics.error_rate < 1 ? 'Excellent' : 
                stats.performance_metrics.error_rate < 5 ? 'Good' : 
                stats.performance_metrics.error_rate < 10 ? 'Fair' : 'Poor'
    }
  };
};