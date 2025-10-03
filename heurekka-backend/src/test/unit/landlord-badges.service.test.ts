import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';

// Mock Supabase client
const mockSupabaseFrom = vi.fn().mockReturnThis();
const mockSupabaseSelect = vi.fn().mockReturnThis();
const mockSupabaseInsert = vi.fn().mockReturnThis();
const mockSupabaseEq = vi.fn().mockReturnThis();
const mockSupabaseOrder = vi.fn().mockReturnThis();
const mockSupabaseLimit = vi.fn().mockReturnThis();
const mockSupabaseSingle = vi.fn();
const mockSupabaseMaybeSingle = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockSupabaseFrom,
  }))
}));

describe('LandlordBadgesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup environment variables
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_KEY = 'test-service-key';

    // Reset mock chain
    mockSupabaseFrom.mockReturnValue({
      select: mockSupabaseSelect,
      insert: mockSupabaseInsert,
    });

    mockSupabaseSelect.mockReturnValue({
      eq: mockSupabaseEq,
      order: mockSupabaseOrder,
      limit: mockSupabaseLimit,
      single: mockSupabaseSingle,
      maybeSingle: mockSupabaseMaybeSingle,
    });

    mockSupabaseInsert.mockReturnValue({
      select: mockSupabaseSelect,
    });

    mockSupabaseEq.mockReturnValue({
      order: mockSupabaseOrder,
      maybeSingle: mockSupabaseMaybeSingle,
    });

    mockSupabaseOrder.mockReturnValue({
      limit: mockSupabaseLimit,
    });
  });

  describe('awardBadge', () => {
    it('should award badge successfully', async () => {
      // Mock no existing badge
      mockSupabaseMaybeSingle.mockResolvedValueOnce({
        data: null,
        error: null
      });

      // Mock successful insert
      mockSupabaseSingle.mockResolvedValueOnce({
        data: {
          id: 'badge-123',
          landlord_id: 'landlord-123',
          badge_type: 'verified_phone',
          badge_name: 'Teléfono Verificado',
          badge_description: 'Has verificado tu número de teléfono',
          badge_icon: '📱',
          awarded_at: new Date().toISOString()
        },
        error: null
      });

      const { getLandlordBadgesService } = await import(
        '@/services/landlord-badges.service'
      );
      const service = getLandlordBadgesService();

      const badge = await service.awardBadge('landlord-123', 'verified_phone');

      expect(badge.badgeType).toBe('verified_phone');
      expect(badge.badgeName).toBe('Teléfono Verificado');
      expect(mockSupabaseFrom).toHaveBeenCalledWith('profile_badges');
      expect(mockSupabaseInsert).toHaveBeenCalled();
    });

    it('should not award duplicate badge', async () => {
      // Mock existing badge
      mockSupabaseMaybeSingle.mockResolvedValueOnce({
        data: {
          id: 'badge-123',
          badge_type: 'verified_phone'
        },
        error: null
      });

      const { getLandlordBadgesService } = await import(
        '@/services/landlord-badges.service'
      );
      const service = getLandlordBadgesService();

      await expect(
        service.awardBadge('landlord-123', 'verified_phone')
      ).rejects.toThrow(TRPCError);
    });

    it('should reject invalid badge type', async () => {
      const { getLandlordBadgesService } = await import(
        '@/services/landlord-badges.service'
      );
      const service = getLandlordBadgesService();

      await expect(
        service.awardBadge('landlord-123', 'invalid_badge' as any)
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('getBadges', () => {
    it('should return landlord badges', async () => {
      const mockBadges = [
        {
          id: 'badge-1',
          landlord_id: 'landlord-123',
          badge_type: 'verified_phone',
          badge_name: 'Teléfono Verificado',
          badge_description: 'Has verificado tu número de teléfono',
          badge_icon: '📱',
          awarded_at: new Date().toISOString()
        },
        {
          id: 'badge-2',
          landlord_id: 'landlord-123',
          badge_type: 'verified_email',
          badge_name: 'Email Verificado',
          badge_description: 'Has verificado tu correo electrónico',
          badge_icon: '✉️',
          awarded_at: new Date().toISOString()
        }
      ];

      mockSupabaseOrder.mockResolvedValueOnce({
        data: mockBadges,
        error: null
      });

      const { getLandlordBadgesService } = await import(
        '@/services/landlord-badges.service'
      );
      const service = getLandlordBadgesService();

      const badges = await service.getBadges('landlord-123');

      expect(badges).toHaveLength(2);
      expect(badges[0].badgeType).toBe('verified_phone');
      expect(badges[1].badgeType).toBe('verified_email');
    });

    it('should return empty array when no badges', async () => {
      mockSupabaseOrder.mockResolvedValueOnce({
        data: [],
        error: null
      });

      const { getLandlordBadgesService } = await import(
        '@/services/landlord-badges.service'
      );
      const service = getLandlordBadgesService();

      const badges = await service.getBadges('landlord-123');

      expect(badges).toHaveLength(0);
    });
  });

  describe('hasBadge', () => {
    it('should return true if badge exists', async () => {
      mockSupabaseMaybeSingle.mockResolvedValueOnce({
        data: { id: 'badge-123' },
        error: null
      });

      const { getLandlordBadgesService } = await import(
        '@/services/landlord-badges.service'
      );
      const service = getLandlordBadgesService();

      const hasBadge = await service.hasBadge('landlord-123', 'verified_phone');

      expect(hasBadge).toBe(true);
    });

    it('should return false if badge does not exist', async () => {
      mockSupabaseMaybeSingle.mockResolvedValueOnce({
        data: null,
        error: null
      });

      const { getLandlordBadgesService } = await import(
        '@/services/landlord-badges.service'
      );
      const service = getLandlordBadgesService();

      const hasBadge = await service.hasBadge('landlord-123', 'verified_phone');

      expect(hasBadge).toBe(false);
    });
  });

  describe('checkAndAwardBadges', () => {
    it('should award verification badges based on profile', async () => {
      // Mock landlord profile
      mockSupabaseSingle.mockResolvedValueOnce({
        data: {
          id: 'landlord-123',
          phone_verified: true,
          email_verified: true,
          identity_verified: false,
          business_license_verified: false,
          profile_completion_percentage: 80,
          rating: 4.7,
          total_reviews: 10,
          verification_status: 'verified',
          created_at: new Date('2025-02-01').toISOString()
        },
        error: null
      });

      // Mock hasBadge checks (all false - no badges yet)
      mockSupabaseMaybeSingle
        .mockResolvedValueOnce({ data: null, error: null }) // phone badge
        .mockResolvedValueOnce({ data: null, error: null }) // email badge
        .mockResolvedValueOnce({ data: null, error: null }) // complete profile
        .mockResolvedValueOnce({ data: null, error: null }) // highly rated
        .mockResolvedValueOnce({ data: null, error: null }); // early adopter

      // Mock successful badge awards
      mockSupabaseSingle
        .mockResolvedValueOnce({
          data: {
            id: 'badge-1',
            landlord_id: 'landlord-123',
            badge_type: 'verified_phone',
            badge_name: 'Teléfono Verificado',
            badge_description: 'Has verificado tu número de teléfono',
            badge_icon: '📱',
            awarded_at: new Date().toISOString()
          },
          error: null
        })
        .mockResolvedValueOnce({
          data: {
            id: 'badge-2',
            landlord_id: 'landlord-123',
            badge_type: 'verified_email',
            badge_name: 'Email Verificado',
            badge_description: 'Has verificado tu correo electrónico',
            badge_icon: '✉️',
            awarded_at: new Date().toISOString()
          },
          error: null
        });

      const { getLandlordBadgesService } = await import(
        '@/services/landlord-badges.service'
      );
      const service = getLandlordBadgesService();

      const badges = await service.checkAndAwardBadges('landlord-123');

      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('getAvailableBadges', () => {
    it('should return all badge types with earned status', async () => {
      // Mock earned badges
      mockSupabaseOrder.mockResolvedValueOnce({
        data: [
          {
            id: 'badge-1',
            landlord_id: 'landlord-123',
            badge_type: 'verified_phone',
            badge_name: 'Teléfono Verificado',
            badge_description: 'Has verificado tu número de teléfono',
            badge_icon: '📱',
            awarded_at: new Date().toISOString()
          }
        ],
        error: null
      });

      const { getLandlordBadgesService } = await import(
        '@/services/landlord-badges.service'
      );
      const service = getLandlordBadgesService();

      const badges = await service.getAvailableBadges('landlord-123');

      expect(badges.length).toBeGreaterThan(0);
      expect(badges.some((b) => b.badgeType === 'verified_phone' && b.earned)).toBe(true);
      expect(badges.some((b) => b.badgeType === 'verified_email' && !b.earned)).toBe(true);
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status', async () => {
      mockSupabaseLimit.mockResolvedValueOnce({
        error: null
      });

      const { getLandlordBadgesService } = await import(
        '@/services/landlord-badges.service'
      );
      const service = getLandlordBadgesService();

      const health = await service.healthCheck();

      expect(health.status).toBe('healthy');
    });
  });
});
