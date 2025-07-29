/**
 * API response and request type definitions
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  /** Response data */
  data: T;
  /** Success status */
  success: boolean;
  /** Optional error message */
  message?: string;
  /** Optional error details */
  error?: string;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T = any> {
  /** Array of items */
  data: T[];
  /** Pagination metadata */
  pagination: {
    /** Current page number */
    page: number;
    /** Items per page */
    limit: number;
    /** Total number of items */
    total: number;
    /** Total number of pages */
    totalPages: number;
    /** Whether there are more pages */
    hasNext: boolean;
    /** Whether there are previous pages */
    hasPrev: boolean;
  };
}

/**
 * Standard pagination query parameters
 */
export interface PaginationParams {
  /** Page number (1-based) */
  page?: number;
  /** Items per page */
  limit?: number;
  /** Sort field */
  sortBy?: string;
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Common error response structure
 */
export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
}

/**
 * Generic ID parameter
 */
export interface IdParam {
  id: string;
}
