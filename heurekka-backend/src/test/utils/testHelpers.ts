import { vi } from 'vitest';
import type { Property, SearchResults, HomepageData, Suggestion } from '@/types/homepage';

// Helper to create mock request context
export const createMockContext = (overrides: Record<string, any> = {}) => ({
  req: {
    ip: '127.0.0.1',
    connection: { remoteAddress: '127.0.0.1' },
    headers: {
      'user-agent': 'test-agent',
      'x-session-id': 'test-session-123',
      referer: 'http://localhost:3000',
      ...overrides.headers
    },
    ...overrides.req
  },
  res: {
    ...overrides.res
  },
  ...overrides
});

// Helper to create a delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to generate UUID-like strings for tests
export const generateTestId = () => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper to create mock date
export const createMockDate = (daysFromNow = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
};

// Helper to validate tRPC response structure
export const validateTRPCResponse = (response: any) => {
  expect(response).toBeDefined();
  expect(typeof response.success).toBe('boolean');
  if (response.success) {
    expect(response.data).toBeDefined();
  } else {
    expect(response.error).toBeDefined();
  }
};

// Helper to validate pagination structure
export const validatePagination = (results: any, expectedLimit: number) => {
  expect(results).toHaveProperty('properties');
  expect(results).toHaveProperty('total');
  expect(results).toHaveProperty('page');
  expect(results).toHaveProperty('limit');
  expect(results.limit).toBe(expectedLimit);
  expect(Array.isArray(results.properties)).toBe(true);
};