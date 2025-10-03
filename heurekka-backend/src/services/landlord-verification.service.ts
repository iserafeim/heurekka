import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import crypto from 'crypto';

/**
 * Verification data types
 */
export type VerificationType =
  | 'phone'
  | 'email'
  | 'identity_document'
  | 'business_license'
  | 'professional_credentials'
  | 'address_proof';

export type VerificationStatus = 'pending' | 'verified' | 'failed' | 'expired';

export interface VerificationRecord {
  id: string;
  landlordId: string;
  verificationType: VerificationType;
  status: VerificationStatus;
  documentUrl?: string;
  verificationCode?: string;
  codeExpiresAt?: Date;
  attempts: number;
  maxAttempts: number;
  verifiedAt?: Date;
  expiresAt?: Date;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Landlord Verification Service
 * Handles phone, email, and document verification for landlords
 */
class LandlordVerificationService {
  private supabase: SupabaseClient;
  private readonly CODE_LENGTH = 6;
  private readonly CODE_EXPIRY_MINUTES = 5;
  private readonly MAX_VERIFICATION_ATTEMPTS = 5;
  private readonly VERIFICATION_CODE_COOLDOWN_SECONDS = 30;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration for verification service');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('✅ Landlord Verification service initialized');
  }

  /**
   * Request phone verification - generate and store code
   */
  async requestPhoneVerification(
    landlordId: string,
    phoneNumber: string
  ): Promise<{ success: boolean; expiresAt: Date; cooldownSeconds?: number }> {
    try {
      // Check if there's a recent pending verification
      const recentVerification = await this.getRecentVerification(landlordId, 'phone');

      if (recentVerification && recentVerification.status === 'pending') {
        const timeSinceCreation = Date.now() - new Date(recentVerification.createdAt).getTime();
        const cooldownMs = this.VERIFICATION_CODE_COOLDOWN_SECONDS * 1000;

        if (timeSinceCreation < cooldownMs) {
          const remainingSeconds = Math.ceil((cooldownMs - timeSinceCreation) / 1000);
          return {
            success: false,
            expiresAt: new Date(recentVerification.codeExpiresAt!),
            cooldownSeconds: remainingSeconds
          };
        }
      }

      // Generate 6-digit code
      const verificationCode = this.generateVerificationCode();
      const codeHash = this.hashCode(verificationCode);

      // Calculate expiry time
      const expiresAt = new Date(Date.now() + this.CODE_EXPIRY_MINUTES * 60 * 1000);

      // Store verification record
      const { data, error } = await this.supabase
        .from('verification_data')
        .insert({
          landlord_id: landlordId,
          verification_type: 'phone',
          status: 'pending',
          verification_code_hash: codeHash,
          code_expires_at: expiresAt.toISOString(),
          attempts: 0,
          max_attempts: this.MAX_VERIFICATION_ATTEMPTS,
          metadata: { phone_number: phoneNumber }
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating verification record:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al crear la verificación'
        });
      }

      // TODO: Send SMS with verification code
      // This is a stub - integrate with SMS provider (Twilio, AWS SNS, etc.)
      console.log(`📱 SMS Code for ${phoneNumber}: ${verificationCode} (expires at ${expiresAt})`);

      return {
        success: true,
        expiresAt
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error requesting phone verification:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al solicitar verificación telefónica'
      });
    }
  }

  /**
   * Verify phone code
   */
  async verifyPhone(landlordId: string, code: string): Promise<{ success: boolean; verified: boolean }> {
    try {
      // Get pending verification
      const verification = await this.getRecentVerification(landlordId, 'phone');

      if (!verification) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No se encontró una verificación pendiente'
        });
      }

      // Check if expired
      if (new Date() > new Date(verification.codeExpiresAt!)) {
        await this.updateVerificationStatus(verification.id, 'expired');
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'El código ha expirado. Solicite uno nuevo'
        });
      }

      // Check attempts
      if (verification.attempts >= verification.maxAttempts) {
        await this.updateVerificationStatus(verification.id, 'failed');
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Demasiados intentos fallidos. Solicite un nuevo código'
        });
      }

      // Increment attempts
      await this.incrementVerificationAttempts(verification.id);

      // Verify code
      const codeHash = this.hashCode(code);
      const { data: verificationData } = await this.supabase
        .from('verification_data')
        .select('verification_code_hash')
        .eq('id', verification.id)
        .single();

      if (!verificationData || verificationData.verification_code_hash !== codeHash) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Código incorrecto'
        });
      }

      // Mark as verified
      await this.updateVerificationStatus(verification.id, 'verified');

      // Update landlord profile
      await this.supabase
        .from('landlords')
        .update({
          phone_verified: true,
          phone_verified_at: new Date().toISOString(),
          verification_status: 'verified'
        })
        .eq('id', landlordId);

      return {
        success: true,
        verified: true
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error verifying phone:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al verificar el teléfono'
      });
    }
  }

  /**
   * Request email verification
   */
  async requestEmailVerification(
    landlordId: string,
    email: string
  ): Promise<{ success: boolean; token: string }> {
    try {
      // Generate unique token
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = this.hashCode(token);

      // Calculate expiry (24 hours)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Store verification record
      const { data, error } = await this.supabase
        .from('verification_data')
        .insert({
          landlord_id: landlordId,
          verification_type: 'email',
          status: 'pending',
          verification_code_hash: tokenHash,
          code_expires_at: expiresAt.toISOString(),
          attempts: 0,
          max_attempts: 1,
          metadata: { email }
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating email verification:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al crear la verificación de email'
        });
      }

      // TODO: Send email with verification link
      // This is a stub - integrate with email service (SendGrid, AWS SES, etc.)
      const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}&landlordId=${landlordId}`;
      console.log(`📧 Email verification link for ${email}: ${verificationLink}`);

      return {
        success: true,
        token
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error requesting email verification:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al solicitar verificación de email'
      });
    }
  }

  /**
   * Verify email token
   */
  async verifyEmail(landlordId: string, token: string): Promise<{ success: boolean; verified: boolean }> {
    try {
      const tokenHash = this.hashCode(token);

      // Get verification record
      const { data: verification, error } = await this.supabase
        .from('verification_data')
        .select('*')
        .eq('landlord_id', landlordId)
        .eq('verification_type', 'email')
        .eq('verification_code_hash', tokenHash)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !verification) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Token de verificación inválido o expirado'
        });
      }

      // Check if expired
      if (new Date() > new Date(verification.code_expires_at)) {
        await this.updateVerificationStatus(verification.id, 'expired');
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'El enlace de verificación ha expirado'
        });
      }

      // Mark as verified
      await this.updateVerificationStatus(verification.id, 'verified');

      // Update landlord profile
      await this.supabase
        .from('landlords')
        .update({
          email_verified: true,
          email_verified_at: new Date().toISOString()
        })
        .eq('id', landlordId);

      return {
        success: true,
        verified: true
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error verifying email:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al verificar el email'
      });
    }
  }

  /**
   * Get verification status for landlord
   */
  async getVerificationStatus(landlordId: string): Promise<{
    phoneVerified: boolean;
    emailVerified: boolean;
    identityVerified: boolean;
    documentsVerified: boolean;
    verificationLevel: 'basic' | 'verified' | 'premium';
  }> {
    try {
      // Get landlord data
      const { data: landlord } = await this.supabase
        .from('landlords')
        .select('phone_verified, email_verified, identity_verified, business_license_verified')
        .eq('id', landlordId)
        .single();

      if (!landlord) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Perfil de arrendador no encontrado'
        });
      }

      const phoneVerified = landlord.phone_verified || false;
      const emailVerified = landlord.email_verified || false;
      const identityVerified = landlord.identity_verified || false;
      const documentsVerified = landlord.business_license_verified || false;

      // Determine verification level
      let verificationLevel: 'basic' | 'verified' | 'premium' = 'basic';

      if (phoneVerified && emailVerified && identityVerified && documentsVerified) {
        verificationLevel = 'premium';
      } else if (phoneVerified && emailVerified && identityVerified) {
        verificationLevel = 'verified';
      } else if (phoneVerified && emailVerified) {
        verificationLevel = 'basic';
      }

      return {
        phoneVerified,
        emailVerified,
        identityVerified,
        documentsVerified,
        verificationLevel
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error getting verification status:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al obtener estado de verificación'
      });
    }
  }

  /**
   * Get recent verification for a type
   */
  private async getRecentVerification(
    landlordId: string,
    type: VerificationType
  ): Promise<any | null> {
    const { data } = await this.supabase
      .from('verification_data')
      .select('*')
      .eq('landlord_id', landlordId)
      .eq('verification_type', type)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return data;
  }

  /**
   * Update verification status
   */
  private async updateVerificationStatus(
    verificationId: string,
    status: VerificationStatus
  ): Promise<void> {
    const updateData: any = { status };

    if (status === 'verified') {
      updateData.verified_at = new Date().toISOString();
    }

    await this.supabase
      .from('verification_data')
      .update(updateData)
      .eq('id', verificationId);
  }

  /**
   * Increment verification attempts
   */
  private async incrementVerificationAttempts(verificationId: string): Promise<void> {
    try {
      // Try to use RPC function if available
      await this.supabase.rpc('increment_verification_attempts', {
        verification_id: verificationId
      });
    } catch (error) {
      // Fallback if RPC doesn't exist - use direct query
      try {
        const { data } = await this.supabase
          .from('verification_data')
          .select('attempts')
          .eq('id', verificationId)
          .single();

        if (data) {
          await this.supabase
            .from('verification_data')
            .update({ attempts: data.attempts + 1 })
            .eq('id', verificationId);
        }
      } catch (fallbackError) {
        console.error('Error incrementing verification attempts:', fallbackError);
      }
    }
  }

  /**
   * Generate random verification code
   */
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Hash code for secure storage
   */
  private hashCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  /**
   * Transform database record to VerificationRecord
   */
  private transformVerificationRecord(data: any): VerificationRecord {
    return {
      id: data.id,
      landlordId: data.landlord_id,
      verificationType: data.verification_type,
      status: data.status,
      documentUrl: data.document_url,
      verificationCode: data.verification_code_hash,
      codeExpiresAt: data.code_expires_at ? new Date(data.code_expires_at) : undefined,
      attempts: data.attempts || 0,
      maxAttempts: data.max_attempts || 5,
      verifiedAt: data.verified_at ? new Date(data.verified_at) : undefined,
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
      metadata: data.metadata || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy' }> {
    try {
      const { error } = await this.supabase
        .from('verification_data')
        .select('id')
        .limit(1);

      return { status: error ? 'unhealthy' : 'healthy' };
    } catch (error) {
      return { status: 'unhealthy' };
    }
  }
}

// Export singleton instance
let verificationServiceInstance: LandlordVerificationService | null = null;

export function getLandlordVerificationService(): LandlordVerificationService {
  if (!verificationServiceInstance) {
    verificationServiceInstance = new LandlordVerificationService();
  }
  return verificationServiceInstance;
}

export default LandlordVerificationService;
