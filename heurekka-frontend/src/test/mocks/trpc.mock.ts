import { vi } from 'vitest';

export const mockTrpcClient = {
  auth: {
    signup: {
      useMutation: vi.fn(() => ({
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: false,
        error: null,
      })),
    },
    login: {
      useMutation: vi.fn(() => ({
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: false,
        error: null,
      })),
    },
    googleAuth: {
      useMutation: vi.fn(() => ({
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: false,
        error: null,
      })),
    },
  },
  tenantProfile: {
    create: {
      useMutation: vi.fn(() => ({
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: false,
        error: null,
      })),
    },
    exists: {
      query: vi.fn(),
    },
  },
  landlordProfile: {
    create: {
      useMutation: vi.fn(() => ({
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: false,
        error: null,
      })),
    },
    getCurrent: {
      query: vi.fn(),
    },
  },
};

// Mock the trpc client module
vi.mock('@/lib/trpc/client', () => ({
  trpc: mockTrpcClient,
}));

export const resetTrpcMocks = () => {
  vi.clearAllMocks();
};