import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import crypto from 'crypto';

/**
 * Storage Service for managing file uploads to Supabase Storage
 * Handles profile photos and other landlord-related files
 */
class StorageService {
  private supabase: SupabaseClient;
  private readonly PROFILE_PHOTOS_BUCKET = 'profile-photos';
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration for storage service');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('✅ Storage service initialized');
  }

  /**
   * Upload profile photo for landlord
   */
  async uploadProfilePhoto(
    userId: string,
    fileBuffer: Buffer,
    mimeType: string,
    originalName: string
  ): Promise<{ url: string; path: string }> {
    try {
      // Validate file type
      if (!this.ALLOWED_IMAGE_TYPES.includes(mimeType)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Tipo de archivo no permitido. Use JPG, PNG o WEBP'
        });
      }

      // Validate file size
      if (fileBuffer.length > this.MAX_FILE_SIZE) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'El archivo es demasiado grande. Máximo 5MB'
        });
      }

      // Generate unique filename
      const fileExtension = this.getFileExtension(originalName);
      const fileName = `${userId}_${Date.now()}_${crypto.randomBytes(8).toString('hex')}.${fileExtension}`;
      const filePath = `landlords/${userId}/profile/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(this.PROFILE_PHOTOS_BUCKET)
        .upload(filePath, fileBuffer, {
          contentType: mimeType,
          upsert: false
        });

      if (error) {
        console.error('Error uploading profile photo:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al subir la foto de perfil'
        });
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(this.PROFILE_PHOTOS_BUCKET)
        .getPublicUrl(filePath);

      return {
        url: urlData.publicUrl,
        path: filePath
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error uploading profile photo:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al subir la foto'
      });
    }
  }

  /**
   * Delete profile photo
   */
  async deleteProfilePhoto(filePath: string): Promise<void> {
    try {
      const { error } = await this.supabase.storage
        .from(this.PROFILE_PHOTOS_BUCKET)
        .remove([filePath]);

      if (error) {
        console.error('Error deleting profile photo:', error);
        // Don't throw error for delete failures - log and continue
      }
    } catch (error) {
      console.error('Error deleting profile photo:', error);
      // Don't throw - deletion errors shouldn't block operations
    }
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'jpg';
  }

  /**
   * Validate base64 image data and convert to buffer
   */
  validateAndDecodeBase64Image(base64Data: string): {
    buffer: Buffer;
    mimeType: string;
  } {
    try {
      // Check if it's a data URL
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const base64Content = matches[2];

        if (!this.ALLOWED_IMAGE_TYPES.includes(mimeType)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Formato de imagen no permitido'
          });
        }

        const buffer = Buffer.from(base64Content, 'base64');

        if (buffer.length > this.MAX_FILE_SIZE) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'La imagen es demasiado grande. Máximo 5MB'
          });
        }

        return { buffer, mimeType };
      }

      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Formato de imagen inválido'
      });
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Error al procesar la imagen'
      });
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy' }> {
    try {
      const { data, error } = await this.supabase.storage.listBuckets();
      return { status: error ? 'unhealthy' : 'healthy' };
    } catch (error) {
      return { status: 'unhealthy' };
    }
  }
}

// Export singleton instance
let storageServiceInstance: StorageService | null = null;

export function getStorageService(): StorageService {
  if (!storageServiceInstance) {
    storageServiceInstance = new StorageService();
  }
  return storageServiceInstance;
}

export default StorageService;
