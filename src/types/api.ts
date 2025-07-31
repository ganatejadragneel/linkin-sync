// General API type definitions

export interface ApiResponse<T> {
  data: T;
  error?: string;
  status: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}