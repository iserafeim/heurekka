import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WhatsAppService } from '../../services/whatsapp.service';
import type { Property, WhatsAppContactInfo } from '../../types/property';

// Mock fetch globally
global.fetch = vi.fn();

describe('WhatsAppService', () => {
  let whatsAppService: WhatsAppService;
  let originalEnv: any;

  beforeEach(() => {
    // Store original environment variables
    originalEnv = {
      WHATSAPP_API_URL: process.env.WHATSAPP_API_URL,
      WHATSAPP_API_TOKEN: process.env.WHATSAPP_API_TOKEN,
      WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
      WHATSAPP_BUSINESS_ACCOUNT_ID: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    };

    // Set test environment variables
    process.env.WHATSAPP_API_URL = 'https://graph.facebook.com/v17.0';
    process.env.WHATSAPP_API_TOKEN = 'test-token';
    process.env.WHATSAPP_PHONE_NUMBER_ID = 'test-phone-id';
    process.env.WHATSAPP_BUSINESS_ACCOUNT_ID = 'test-business-id';
    process.env.NEXT_PUBLIC_APP_URL = 'https://test.heurekka.com';

    vi.clearAllMocks();
    whatsAppService = new WhatsAppService();
  });

  afterEach(() => {
    // Restore original environment variables
    Object.assign(process.env, originalEnv);
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with environment variables', () => {
      expect(whatsAppService).toBeInstanceOf(WhatsAppService);
    });

    it('should warn when credentials are not configured', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Clear environment variables
      delete process.env.WHATSAPP_API_TOKEN;
      delete process.env.WHATSAPP_PHONE_NUMBER_ID;

      new WhatsAppService();

      expect(consoleSpy).toHaveBeenCalledWith(
        'WhatsApp API credentials not configured. WhatsApp features will be limited.'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('generatePropertyInquiryMessage', () => {
    const mockProperty: Property = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Apartamento en Lomas del Guijarro',
      description: 'Moderno apartamento con vista a la ciudad',
      type: 'apartment',
      address: 'Col. Lomas del Guijarro Sur, Bloque A-5',
      neighborhood: 'Lomas del Guijarro',
      coordinates: { lat: 14.0723, lng: -87.2072 },
      price: { amount: 15000, currency: 'HNL', period: 'month' },
      bedrooms: 2,
      bathrooms: 2,
      areaSqm: 85,
      amenities: ['parking', 'gym', 'pool', 'security'],
      images: [],
      viewCount: 45,
      favoriteCount: 8,
      contactCount: 3,
      contactPhone: '+50499887766',
      landlord: {
        id: 'landlord-1',
        name: 'Inmobiliaria Central',
        phone: '+50499887766',
        rating: 4.5,
        verified: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should generate basic property inquiry message', () => {
      const message = whatsAppService.generatePropertyInquiryMessage(mockProperty);

      expect(message).toContain('¡Hola! Vi esta propiedad en HEUREKKA y me interesa:');
      expect(message).toContain('📍 *Col. Lomas del Guijarro Sur, Bloque A-5*');
      expect(message).toContain('💰 *L.15,000/mes*');
      expect(message).toContain('🏠 Apartamento');
      expect(message).toContain('🛏️ 2 habitaciones');
      expect(message).toContain('🚿 2 baños');
      expect(message).toContain('📐 85 m²');
      expect(message).toContain('✨ *Amenidades destacadas:*');
      expect(message).toContain('• parking');
      expect(message).toContain('• gym');
      expect(message).toContain('• pool');
      expect(message).toContain('• security');
      expect(message).toContain('¿Podríamos coordinar una visita?');
      expect(message).toContain('🔗 Ver más: https://test.heurekka.com/propiedades/123e4567-e89b-12d3-a456-426614174000');
      expect(message).toContain('📌 Ref: 123E4567');
    });

    it('should generate message with user profile information', () => {
      const userProfile = {
        name: 'María González',
        phone: '+50499123456',
        email: 'maria@example.com',
        budget: { min: 12000, max: 18000 },
        moveDate: '2024-02-15',
        preferences: ['pet-friendly', 'near metro']
      };

      const message = whatsAppService.generatePropertyInquiryMessage(mockProperty, userProfile);

      expect(message).toContain('*Mi información:*');
      expect(message).toContain('👤 María González');
      expect(message).toContain('📱 +50499123456');
      expect(message).toContain('📧 maria@example.com');
      expect(message).toContain('💵 Presupuesto: L.12,000-18,000');
      expect(message).toContain('📅 Fecha de mudanza: 15 de febrero de 2024');
      expect(message).toContain('*Preferencias especiales:*');
      expect(message).toContain('• pet-friendly');
      expect(message).toContain('• near metro');
    });

    it('should handle property with single bedroom/bathroom correctly', () => {
      const singleRoomProperty = {
        ...mockProperty,
        bedrooms: 1,
        bathrooms: 1
      };

      const message = whatsAppService.generatePropertyInquiryMessage(singleRoomProperty);

      expect(message).toContain('🛏️ 1 habitación');
      expect(message).toContain('🚿 1 baño');
    });

    it('should handle property without area', () => {
      const propertyWithoutArea = {
        ...mockProperty,
        areaSqm: undefined
      };

      const message = whatsAppService.generatePropertyInquiryMessage(propertyWithoutArea);

      expect(message).not.toContain('📐');
    });

    it('should limit amenities to first 5', () => {
      const propertyWithManyAmenities = {
        ...mockProperty,
        amenities: ['parking', 'gym', 'pool', 'security', 'garden', 'balcony', 'elevator', 'laundry']
      };

      const message = whatsAppService.generatePropertyInquiryMessage(propertyWithManyAmenities);

      const amenityMatches = message.match(/• /g);
      expect(amenityMatches?.length).toBeLessThanOrEqual(5); // 5 amenities max
    });

    it('should handle different property types correctly', () => {
      const propertyTypes = [
        { type: 'apartment', label: 'Apartamento' },
        { type: 'house', label: 'Casa' },
        { type: 'room', label: 'Habitación' },
        { type: 'office', label: 'Oficina' }
      ];

      propertyTypes.forEach(({ type, label }) => {
        const property = { ...mockProperty, type: type as any };
        const message = whatsAppService.generatePropertyInquiryMessage(property);
        expect(message).toContain(`🏠 ${label}`);
      });
    });

    it('should format user budget correctly', () => {
      const userProfile = {
        budget: { min: 5000, max: 25000 }
      };

      const message = whatsAppService.generatePropertyInquiryMessage(mockProperty, userProfile);

      expect(message).toContain('💵 Presupuesto: L.5,000-25,000');
    });

    it('should handle invalid move date gracefully', () => {
      const userProfile = {
        name: 'Test User',
        moveDate: 'invalid-date'
      };

      const message = whatsAppService.generatePropertyInquiryMessage(mockProperty, userProfile);

      expect(message).toContain('📅 Fecha de mudanza: invalid-date');
    });
  });

  describe('generateWhatsAppLink', () => {
    const testPhoneNumber = '+50499887766';
    const testMessage = 'Hola, me interesa la propiedad';

    it('should generate app link by default', () => {
      const link = whatsAppService.generateWhatsAppLink(testPhoneNumber, testMessage);

      expect(link).toBe('https://wa.me/50499887766?text=Hola%2C%20me%20interesa%20la%20propiedad');
    });

    it('should generate web link when requested', () => {
      const link = whatsAppService.generateWhatsAppLink(testPhoneNumber, testMessage, true);

      expect(link).toBe('https://web.whatsapp.com/send/50499887766?text=Hola%2C%20me%20interesa%20la%20propiedad');
    });

    it('should format Honduras phone number correctly', () => {
      const localNumber = '99887766';
      const link = whatsAppService.generateWhatsAppLink(localNumber, testMessage);

      expect(link).toContain('50499887766');
    });

    it('should handle phone number with country code', () => {
      const numberWithCode = '50499887766';
      const link = whatsAppService.generateWhatsAppLink(numberWithCode, testMessage);

      expect(link).toContain('50499887766');
    });

    it('should encode message properly', () => {
      const messageWithSpecialChars = 'Hola! ¿Cómo estás? Me interesa & quiero más información.';
      const link = whatsAppService.generateWhatsAppLink(testPhoneNumber, messageWithSpecialChars);

      expect(link).toContain(encodeURIComponent(messageWithSpecialChars));
    });
  });

  describe('sendMessage', () => {
    const testPhoneNumber = '+50499887766';
    const testMessage = 'Test message';

    it('should send message successfully with API', async () => {
      const mockResponse = {
        messages: [{ id: 'msg-123' }]
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse)
      } as any);

      const result = await whatsAppService.sendMessage(testPhoneNumber, testMessage);

      expect(result).toEqual({
        success: true,
        messageId: 'msg-123'
      });

      expect(fetch).toHaveBeenCalledWith(
        'https://graph.facebook.com/v17.0/test-phone-id/messages',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: '50499887766',
            type: 'text',
            text: {
              body: testMessage
            }
          })
        })
      );
    });

    it('should send template message when template name provided', async () => {
      const mockResponse = {
        messages: [{ id: 'msg-123' }]
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse)
      } as any);

      const result = await whatsAppService.sendMessage(testPhoneNumber, testMessage, 'property_inquiry');

      expect(result.success).toBe(true);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: '50499887766',
            type: 'template',
            template: {
              name: 'property_inquiry',
              language: {
                code: 'es'
              }
            }
          })
        })
      );
    });

    it('should fallback to link generation when API not configured', async () => {
      // Clear API credentials
      process.env.WHATSAPP_API_TOKEN = '';
      process.env.WHATSAPP_PHONE_NUMBER_ID = '';
      
      const serviceWithoutAPI = new WhatsAppService();

      const result = await serviceWithoutAPI.sendMessage(testPhoneNumber, testMessage);

      expect(result).toMatchObject({
        success: true,
        messageId: expect.stringContaining('fallback-'),
        error: 'API not configured, generated WhatsApp link instead'
      });

      expect(fetch).not.toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      const mockErrorResponse = {
        error: {
          message: 'Invalid phone number format',
          code: 1001
        }
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue(mockErrorResponse)
      } as any);

      const result = await whatsAppService.sendMessage(testPhoneNumber, testMessage);

      expect(result).toEqual({
        success: false,
        error: 'Invalid phone number format'
      });
    });

    it('should handle fetch errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const result = await whatsAppService.sendMessage(testPhoneNumber, testMessage);

      expect(result).toEqual({
        success: false,
        error: 'Network error'
      });
    });

    it('should handle API response without message ID', async () => {
      const mockResponse = {
        messages: []
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse)
      } as any);

      const result = await whatsAppService.sendMessage(testPhoneNumber, testMessage);

      expect(result.success).toBe(false);
    });
  });

  describe('sendPropertyInquiryTemplate', () => {
    const mockContactInfo: WhatsAppContactInfo = {
      propertyId: '123e4567-e89b-12d3-a456-426614174000',
      propertyTitle: 'Apartamento en Lomas del Guijarro',
      propertyPrice: 15000,
      propertyAddress: 'Col. Lomas del Guijarro Sur',
      propertyBedrooms: 2,
      propertyBathrooms: 2,
      propertyArea: 85,
      landlordPhone: '+50499887766',
      userProfile: {
        name: 'María González',
        phone: '+50499123456',
        email: 'maria@example.com'
      }
    };

    it('should send property inquiry template successfully', async () => {
      const mockResponse = {
        messages: [{ id: 'msg-123' }]
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse)
      } as any);

      const result = await whatsAppService.sendPropertyInquiryTemplate(mockContactInfo);

      expect(result).toEqual({
        success: true,
        messageId: 'msg-123'
      });

      expect(fetch).toHaveBeenCalled();
    });

    it('should handle template sending errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Template send failed'));

      const result = await whatsAppService.sendPropertyInquiryTemplate(mockContactInfo);

      expect(result).toEqual({
        success: false,
        error: 'Template send failed'
      });
    });
  });

  describe('validatePhoneNumber', () => {
    it('should validate full international Honduras number', () => {
      const result = whatsAppService.validatePhoneNumber('50499887766');

      expect(result).toEqual({
        valid: true,
        formatted: '50499887766'
      });
    });

    it('should validate local Honduras number and add country code', () => {
      const result = whatsAppService.validatePhoneNumber('99887766');

      expect(result).toEqual({
        valid: true,
        formatted: '50499887766'
      });
    });

    it('should handle number with formatting characters', () => {
      const result = whatsAppService.validatePhoneNumber('+504 9988-7766');

      expect(result).toEqual({
        valid: true,
        formatted: '50499887766'
      });
    });

    it('should reject invalid local number length', () => {
      const result = whatsAppService.validatePhoneNumber('9988776');

      expect(result).toEqual({
        valid: false,
        error: 'Número de teléfono inválido. Use formato: +504 XXXX-XXXX o XXXX-XXXX'
      });
    });

    it('should reject invalid international number length', () => {
      const result = whatsAppService.validatePhoneNumber('504998877663');

      expect(result).toEqual({
        valid: false,
        error: 'Número de teléfono inválido. Use formato: +504 XXXX-XXXX o XXXX-XXXX'
      });
    });

    it('should handle non-Honduras country code', () => {
      const result = whatsAppService.validatePhoneNumber('1234567890');

      expect(result).toEqual({
        valid: false,
        error: 'Número de teléfono inválido. Use formato: +504 XXXX-XXXX o XXXX-XXXX'
      });
    });

    it('should handle validation errors', () => {
      // Test with an object that will cause an error in phone processing
      const result = whatsAppService.validatePhoneNumber(null as any);

      expect(result).toEqual({
        valid: false,
        error: 'Error validating phone number'
      });
    });
  });

  describe('getMessageTemplates', () => {
    it('should fetch message templates when API is configured', async () => {
      const mockTemplates = [
        {
          id: 'template1',
          name: 'property_inquiry',
          status: 'APPROVED',
          language: 'es'
        }
      ];

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ data: mockTemplates })
      } as any);

      const result = await whatsAppService.getMessageTemplates();

      expect(result).toEqual(mockTemplates);
      expect(fetch).toHaveBeenCalledWith(
        'https://graph.facebook.com/v17.0/test-business-id/message_templates',
        {
          headers: {
            'Authorization': 'Bearer test-token',
          }
        }
      );
    });

    it('should return empty array when API not configured', async () => {
      process.env.WHATSAPP_API_TOKEN = '';
      process.env.WHATSAPP_BUSINESS_ACCOUNT_ID = '';

      const serviceWithoutAPI = new WhatsAppService();
      const result = await serviceWithoutAPI.getMessageTemplates();

      expect(result).toEqual([]);
    });

    it('should handle API errors gracefully', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('API error'));

      const result = await whatsAppService.getMessageTemplates();

      expect(result).toEqual([]);
    });

    it('should handle response without data field', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({})
      } as any);

      const result = await whatsAppService.getMessageTemplates();

      expect(result).toEqual([]);
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when API is configured and responsive', async () => {
      const mockApiResponse = {
        display_phone_number: '+50499887766',
        verified_name: 'Heurekka Test'
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockApiResponse)
      } as any);

      const result = await whatsAppService.healthCheck();

      expect(result).toEqual({
        status: 'healthy',
        details: {
          phoneNumberId: 'test-phone-id',
          displayPhoneNumber: '+50499887766',
          verifiedName: 'Heurekka Test'
        }
      });
    });

    it('should return unhealthy status when API not configured', async () => {
      process.env.WHATSAPP_API_TOKEN = '';
      process.env.WHATSAPP_PHONE_NUMBER_ID = '';

      const serviceWithoutAPI = new WhatsAppService();
      const result = await serviceWithoutAPI.healthCheck();

      expect(result).toEqual({
        status: 'unhealthy',
        details: { error: 'API credentials not configured' }
      });
    });

    it('should return unhealthy status when API returns error', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 403
      } as any);

      const result = await whatsAppService.healthCheck();

      expect(result).toEqual({
        status: 'unhealthy',
        details: { error: 'API returned 403' }
      });
    });

    it('should handle health check network errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network unavailable'));

      const result = await whatsAppService.healthCheck();

      expect(result).toEqual({
        status: 'unhealthy',
        details: { error: 'Network unavailable' }
      });
    });
  });

  describe('utility methods', () => {
    describe('generateLandlordResponses', () => {
      it('should return predefined landlord response templates', () => {
        const responses = whatsAppService.generateLandlordResponses();

        expect(responses).toBeInstanceOf(Array);
        expect(responses.length).toBeGreaterThan(0);
        expect(responses[0]).toContain('Hola');
        expect(responses.some(r => r.includes('visita'))).toBe(true);
      });
    });

    describe('generateFollowUpMessages', () => {
      it('should return predefined follow-up message templates', () => {
        const messages = whatsAppService.generateFollowUpMessages();

        expect(messages).toBeInstanceOf(Array);
        expect(messages.length).toBeGreaterThan(0);
        expect(messages.some(m => m.includes('propiedad'))).toBe(true);
        expect(messages.some(m => m.includes('información'))).toBe(true);
      });
    });
  });

  describe('private utility methods', () => {
    it('should format Honduras phone numbers correctly', () => {
      // Test through public method that uses private formatHondurasPhone
      const testCases = [
        { input: '99887766', expected: '50499887766' },
        { input: '+504-99887766', expected: '50499887766' },
        { input: '504 9988 7766', expected: '50499887766' },
        { input: '50499887766', expected: '50499887766' }
      ];

      testCases.forEach(({ input, expected }) => {
        const link = whatsAppService.generateWhatsAppLink(input, 'test');
        expect(link).toContain(expected);
      });
    });

    it('should format dates correctly', () => {
      // Test through generatePropertyInquiryMessage which uses private formatDate
      const mockProperty = {
        id: 'test',
        title: 'Test',
        description: '',
        type: 'apartment' as const,
        address: '',
        neighborhood: '',
        coordinates: { lat: 0, lng: 0 },
        price: { amount: 1000, currency: 'HNL', period: 'month' },
        bedrooms: 1,
        bathrooms: 1,
        amenities: [],
        images: [],
        viewCount: 0,
        favoriteCount: 0,
        contactCount: 0,
        contactPhone: '',
        landlord: { id: '', name: '', phone: '', rating: 0, verified: false },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const userProfile = {
        moveDate: '2024-02-15'
      };

      const message = whatsAppService.generatePropertyInquiryMessage(mockProperty, userProfile);

      expect(message).toContain('📅 Fecha de mudanza: 15 de febrero de 2024');
    });

    it('should generate property URLs correctly', () => {
      const mockProperty = {
        id: 'test-property-id',
        title: 'Test Property',
        description: '',
        type: 'apartment' as const,
        address: '',
        neighborhood: '',
        coordinates: { lat: 0, lng: 0 },
        price: { amount: 1000, currency: 'HNL', period: 'month' },
        bedrooms: 1,
        bathrooms: 1,
        amenities: [],
        images: [],
        viewCount: 0,
        favoriteCount: 0,
        contactCount: 0,
        contactPhone: '',
        landlord: { id: '', name: '', phone: '', rating: 0, verified: false },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const message = whatsAppService.generatePropertyInquiryMessage(mockProperty);

      expect(message).toContain('🔗 Ver más: https://test.heurekka.com/propiedades/test-property-id');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle missing property fields gracefully', () => {
      const minimalProperty = {
        id: 'test-id',
        title: 'Test Property',
        description: '',
        type: 'apartment' as const,
        address: '',
        neighborhood: '',
        coordinates: { lat: 0, lng: 0 },
        price: { amount: 1000, currency: 'HNL', period: 'month' },
        bedrooms: 0,
        bathrooms: 0,
        amenities: [],
        images: [],
        viewCount: 0,
        favoriteCount: 0,
        contactCount: 0,
        contactPhone: '',
        landlord: { id: '', name: '', phone: '', rating: 0, verified: false },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const message = whatsAppService.generatePropertyInquiryMessage(minimalProperty);

      expect(message).toContain('Test Property');
      expect(message).toContain('L.1,000/mes');
      expect(message).not.toContain('Amenidades destacadas');
    });

    it('should handle empty user profile gracefully', () => {
      const mockProperty = {
        id: 'test-id',
        title: 'Test Property',
        description: '',
        type: 'apartment' as const,
        address: '',
        neighborhood: '',
        coordinates: { lat: 0, lng: 0 },
        price: { amount: 1000, currency: 'HNL', period: 'month' },
        bedrooms: 1,
        bathrooms: 1,
        amenities: [],
        images: [],
        viewCount: 0,
        favoriteCount: 0,
        contactCount: 0,
        contactPhone: '',
        landlord: { id: '', name: '', phone: '', rating: 0, verified: false },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const emptyProfile = {};

      const message = whatsAppService.generatePropertyInquiryMessage(mockProperty, emptyProfile);

      expect(message).not.toContain('Mi información:');
      expect(message).toContain('¿Podríamos coordinar una visita?');
    });

    it('should handle special characters in messages', () => {
      const messageWithSpecialChars = 'Message with émojis 🏠 and special chars: ñáéíóú';
      const link = whatsAppService.generateWhatsAppLink('+50499887766', messageWithSpecialChars);

      expect(link).toBeDefined();
      expect(typeof link).toBe('string');
    });

    it('should handle malformed WhatsApp API responses', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ malformed: 'response' })
      } as any);

      const result = await whatsAppService.sendMessage('+50499887766', 'test');

      expect(result.success).toBe(false);
    });

    it('should handle fetch timeout/network errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('ETIMEDOUT'));

      const result = await whatsAppService.sendMessage('+50499887766', 'test');

      expect(result).toEqual({
        success: false,
        error: 'ETIMEDOUT'
      });
    });
  });
});