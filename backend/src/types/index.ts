// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface HealthCheckResponse {
  status: string;
  timestamp: number;
  service: string;
  version: string;
}

// Request/Response helpers
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Environment types
export interface EnvironmentConfig {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  FRONTEND_URL: string;
  DATABASE_URL?: string;
  JWT_SECRET?: string;
  JWT_EXPIRES_IN?: string;
}