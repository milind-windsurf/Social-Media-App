import { z } from 'zod';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
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

export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface SearchInput extends PaginationInput {
  query: string;
}

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export const searchSchema = paginationSchema.extend({
  query: z.string().min(1),
});

export function isValidUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toISOString();
}

export function parseDate(dateString: string): Date {
  return new Date(dateString);
}
