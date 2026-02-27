export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
  statusCode: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface ErrorResponse {
  message: string;
  errors: string[];
  statusCode: number;
  timestamp: string;
  path: string;
}