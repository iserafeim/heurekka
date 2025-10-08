/**
 * Tests for useTenantProfile hooks
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useTenantProfile,
  useTenantProfileExists,
  useCreateTenantProfile,
  useUpdateTenantProfile,
  useProfileCompletionStatus,
} from '../useTenantProfile';

// Mock tRPC client
jest.mock('@/lib/trpc/client', () => ({
  trpc: {
    tenantProfile: {
      getCurrent: {
        useQuery: jest.fn(),
      },
      exists: {
        useQuery: jest.fn(),
      },
      create: {
        useMutation: jest.fn(),
      },
      update: {
        useMutation: jest.fn(),
      },
      getCompletionStatus: {
        useQuery: jest.fn(),
      },
    },
    useContext: jest.fn(),
  },
}));

describe('useTenantProfile hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  describe('useTenantProfile', () => {
    it('should fetch tenant profile', () => {
      const mockProfile = {
        id: '1',
        userId: 'user-1',
        personalInfo: {
          fullName: 'Juan Pérez',
          phone: '9999-9999',
          email: 'juan@example.com',
        },
        searchPreferences: {
          budgetMin: 5000,
          budgetMax: 15000,
          preferredAreas: ['Lomas del Guijarro'],
          propertyTypes: ['apartment'],
        },
      };

      const { trpc } = require('@/lib/trpc/client');
      trpc.tenantProfile.getCurrent.useQuery.mockReturnValue({
        data: mockProfile,
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useTenantProfile(), { wrapper });

      expect(result.current.data).toEqual(mockProfile);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle loading state', () => {
      const { trpc } = require('@/lib/trpc/client');
      trpc.tenantProfile.getCurrent.useQuery.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      const { result } = renderHook(() => useTenantProfile(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeNull();
    });

    it('should handle error state', () => {
      const error = new Error('Failed to fetch profile');
      const { trpc } = require('@/lib/trpc/client');
      trpc.tenantProfile.getCurrent.useQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error,
      });

      const { result } = renderHook(() => useTenantProfile(), { wrapper });

      expect(result.current.error).toEqual(error);
    });
  });

  describe('useTenantProfileExists', () => {
    it('should return true when profile exists', () => {
      const { trpc } = require('@/lib/trpc/client');
      trpc.tenantProfile.exists.useQuery.mockReturnValue({
        data: { exists: true },
        isLoading: false,
      });

      const { result } = renderHook(() => useTenantProfileExists(), { wrapper });

      expect(result.current.data?.exists).toBe(true);
    });

    it('should return false when profile does not exist', () => {
      const { trpc } = require('@/lib/trpc/client');
      trpc.tenantProfile.exists.useQuery.mockReturnValue({
        data: { exists: false },
        isLoading: false,
      });

      const { result } = renderHook(() => useTenantProfileExists(), { wrapper });

      expect(result.current.data?.exists).toBe(false);
    });
  });

  describe('useCreateTenantProfile', () => {
    it('should create profile successfully', async () => {
      const mockMutate = jest.fn().mockResolvedValue({ id: '1' });
      const mockUtils = {
        tenantProfile: {
          getCurrent: { invalidate: jest.fn() },
          exists: { invalidate: jest.fn() },
          getCompletionStatus: { invalidate: jest.fn() },
        },
      };

      const { trpc } = require('@/lib/trpc/client');
      trpc.tenantProfile.create.useMutation.mockReturnValue({
        mutateAsync: mockMutate,
        isPending: false,
      });
      trpc.useContext.mockReturnValue(mockUtils);

      const { result } = renderHook(() => useCreateTenantProfile(), { wrapper });

      const profileData = {
        personalInfo: {
          fullName: 'Test User',
          phone: '9999-9999',
        },
      };

      await result.current.mutateAsync(profileData);

      expect(mockMutate).toHaveBeenCalledWith(profileData);
    });
  });

  describe('useUpdateTenantProfile', () => {
    it('should update profile successfully', async () => {
      const mockMutate = jest.fn().mockResolvedValue({ id: '1' });
      const mockUtils = {
        tenantProfile: {
          getCurrent: { invalidate: jest.fn(), cancel: jest.fn(), getData: jest.fn(), setData: jest.fn() },
          getCompletionStatus: { invalidate: jest.fn() },
        },
      };

      const { trpc } = require('@/lib/trpc/client');
      trpc.tenantProfile.update.useMutation.mockReturnValue({
        mutateAsync: mockMutate,
        isPending: false,
      });
      trpc.useContext.mockReturnValue(mockUtils);

      const { result } = renderHook(() => useUpdateTenantProfile(), { wrapper });

      const updateData = {
        personalInfo: {
          fullName: 'Updated Name',
        },
      };

      await result.current.mutateAsync(updateData);

      expect(mockMutate).toHaveBeenCalledWith(updateData);
    });
  });

  describe('useProfileCompletionStatus', () => {
    it('should return completion status', () => {
      const mockStatus = {
        percentage: 75,
        missingFields: ['occupation'],
        nextSteps: ['Add occupation'],
      };

      const { trpc } = require('@/lib/trpc/client');
      trpc.tenantProfile.getCompletionStatus.useQuery.mockReturnValue({
        data: mockStatus,
        isLoading: false,
      });

      const { result } = renderHook(() => useProfileCompletionStatus(), { wrapper });

      expect(result.current.data).toEqual(mockStatus);
    });
  });
});
