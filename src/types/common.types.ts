/**
 * Common utility types used across the application
 */

/**
 * Make all properties optional except specified keys
 */
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/**
 * Make specified properties required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Timestamp fields that are common across models
 */
export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Base model interface with common fields
 */
export interface BaseModel extends Timestamps {
  id: string;
}

/**
 * Sort order options
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Generic filter type for list queries
 */
export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains';
