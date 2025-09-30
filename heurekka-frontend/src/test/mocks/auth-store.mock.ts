import { vi } from 'vitest';

export const mockAuthStore = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  signInWithGoogle: vi.fn(),
};

// Mock the auth store module
vi.mock('@/lib/stores/auth', () => ({
  useAuthStore: vi.fn(() => mockAuthStore),
}));

export const resetAuthStoreMock = () => {
  mockAuthStore.user = null;
  mockAuthStore.isAuthenticated = false;
  mockAuthStore.isLoading = false;
  vi.clearAllMocks();
};

export const setMockUser = (user: any) => {
  mockAuthStore.user = user;
  mockAuthStore.isAuthenticated = !!user;
};