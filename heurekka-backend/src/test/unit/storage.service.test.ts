import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';

// Mock Supabase Storage
const mockStorageUpload = vi.fn();
const mockStorageRemove = vi.fn();
const mockStorageGetPublicUrl = vi.fn();
const mockStorageListBuckets = vi.fn();

const mockStorageFrom = vi.fn((bucket: string) => ({
  upload: mockStorageUpload,
  remove: mockStorageRemove,
  getPublicUrl: mockStorageGetPublicUrl,
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    storage: {
      from: mockStorageFrom,
      listBuckets: mockStorageListBuckets,
    },
  }))
}));

describe('StorageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup environment variables
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_KEY = 'test-service-key';
  });

  describe('uploadProfilePhoto', () => {
    it('should upload profile photo successfully', async () => {
      const mockBuffer = Buffer.from('fake-image-data');
      const mockUrl = 'https://test.supabase.co/storage/v1/object/public/profile-photos/test.jpg';

      mockStorageUpload.mockResolvedValueOnce({
        data: { path: 'landlords/user-123/profile/test.jpg' },
        error: null
      });

      mockStorageGetPublicUrl.mockReturnValueOnce({
        data: { publicUrl: mockUrl }
      });

      const { getStorageService } = await import('@/services/storage.service');
      const service = getStorageService();

      const result = await service.uploadProfilePhoto(
        'user-123',
        mockBuffer,
        'image/jpeg',
        'profile.jpg'
      );

      expect(result.url).toBe(mockUrl);
      expect(result.path).toContain('landlords/user-123/profile');
      expect(mockStorageFrom).toHaveBeenCalledWith('profile-photos');
      expect(mockStorageUpload).toHaveBeenCalled();
    });

    it('should reject invalid file type', async () => {
      const mockBuffer = Buffer.from('fake-pdf-data');

      const { getStorageService } = await import('@/services/storage.service');
      const service = getStorageService();

      await expect(
        service.uploadProfilePhoto('user-123', mockBuffer, 'application/pdf', 'file.pdf')
      ).rejects.toThrow(TRPCError);
    });

    it('should reject oversized file', async () => {
      const largBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB

      const { getStorageService } = await import('@/services/storage.service');
      const service = getStorageService();

      await expect(
        service.uploadProfilePhoto('user-123', largBuffer, 'image/jpeg', 'large.jpg')
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('uploadVerificationDocument', () => {
    it('should upload verification document successfully', async () => {
      const mockBuffer = Buffer.from('fake-document-data');
      const mockUrl = 'https://test.supabase.co/storage/v1/object/public/verification-documents/test.pdf';

      mockStorageUpload.mockResolvedValueOnce({
        data: { path: 'landlords/user-123/verification/identity_123.pdf' },
        error: null
      });

      mockStorageGetPublicUrl.mockReturnValueOnce({
        data: { publicUrl: mockUrl }
      });

      const { getStorageService } = await import('@/services/storage.service');
      const service = getStorageService();

      const result = await service.uploadVerificationDocument(
        'user-123',
        mockBuffer,
        'application/pdf',
        'id.pdf',
        'identity'
      );

      expect(result.url).toBe(mockUrl);
      expect(result.path).toContain('landlords/user-123/verification');
      expect(mockStorageFrom).toHaveBeenCalledWith('verification-documents');
    });

    it('should reject invalid document type', async () => {
      const mockBuffer = Buffer.from('fake-data');

      const { getStorageService } = await import('@/services/storage.service');
      const service = getStorageService();

      await expect(
        service.uploadVerificationDocument(
          'user-123',
          mockBuffer,
          'text/plain',
          'file.txt',
          'identity'
        )
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('deleteProfilePhoto', () => {
    it('should delete photo successfully', async () => {
      mockStorageRemove.mockResolvedValueOnce({
        data: null,
        error: null
      });

      const { getStorageService } = await import('@/services/storage.service');
      const service = getStorageService();

      await expect(
        service.deleteProfilePhoto('landlords/user-123/profile/photo.jpg')
      ).resolves.not.toThrow();

      expect(mockStorageRemove).toHaveBeenCalledWith(['landlords/user-123/profile/photo.jpg']);
    });

    it('should not throw on delete error', async () => {
      mockStorageRemove.mockResolvedValueOnce({
        data: null,
        error: new Error('File not found')
      });

      const { getStorageService } = await import('@/services/storage.service');
      const service = getStorageService();

      // Should not throw even if delete fails
      await expect(
        service.deleteProfilePhoto('nonexistent/photo.jpg')
      ).resolves.not.toThrow();
    });
  });

  describe('validateAndDecodeBase64Image', () => {
    it('should validate and decode base64 image', () => {
      const base64Image = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';

      vi.isolateModules(async () => {
        const { getStorageService } = await import('@/services/storage.service');
        const service = getStorageService();

        const result = service.validateAndDecodeBase64Image(base64Image);

        expect(result.buffer).toBeInstanceOf(Buffer);
        expect(result.mimeType).toBe('image/jpeg');
      });
    });

    it('should reject invalid base64 format', () => {
      const invalidBase64 = 'not-base64-data';

      vi.isolateModules(async () => {
        const { getStorageService } = await import('@/services/storage.service');
        const service = getStorageService();

        expect(() => service.validateAndDecodeBase64Image(invalidBase64)).toThrow(TRPCError);
      });
    });

    it('should reject invalid mime type', () => {
      const base64Pdf = 'data:application/pdf;base64,JVBERi0xLjQ=';

      vi.isolateModules(async () => {
        const { getStorageService } = await import('@/services/storage.service');
        const service = getStorageService();

        expect(() => service.validateAndDecodeBase64Image(base64Pdf)).toThrow(TRPCError);
      });
    });

    it('should reject oversized base64 image', () => {
      // Create a base64 string that would decode to >5MB
      const largeData = 'A'.repeat(7 * 1024 * 1024); // Base64 is ~33% larger than binary
      const base64Large = `data:image/jpeg;base64,${Buffer.from(largeData).toString('base64')}`;

      vi.isolateModules(async () => {
        const { getStorageService } = await import('@/services/storage.service');
        const service = getStorageService();

        expect(() => service.validateAndDecodeBase64Image(base64Large)).toThrow(TRPCError);
      });
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status', async () => {
      mockStorageListBuckets.mockResolvedValueOnce({
        data: [{ name: 'profile-photos' }, { name: 'verification-documents' }],
        error: null
      });

      const { getStorageService } = await import('@/services/storage.service');
      const service = getStorageService();

      const health = await service.healthCheck();

      expect(health.status).toBe('healthy');
    });

    it('should return unhealthy on error', async () => {
      mockStorageListBuckets.mockResolvedValueOnce({
        data: null,
        error: new Error('Storage error')
      });

      const { getStorageService } = await import('@/services/storage.service');
      const service = getStorageService();

      const health = await service.healthCheck();

      expect(health.status).toBe('unhealthy');
    });
  });
});
