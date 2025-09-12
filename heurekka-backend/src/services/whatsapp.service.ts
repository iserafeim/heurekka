import type { 
  WhatsAppMessage, 
  WhatsAppContactInfo, 
  Property,
} from '../types/property';

export class WhatsAppService {
  private readonly apiUrl: string;
  private readonly apiToken: string;
  private readonly phoneNumberId: string;
  private readonly businessAccount: string;

  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v17.0';
    this.apiToken = process.env.WHATSAPP_API_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.businessAccount = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '';

    if (!this.apiToken || !this.phoneNumberId) {
      console.warn('WhatsApp API credentials not configured. WhatsApp features will be limited.');
    }
  }

  /**
   * Generate property inquiry message for WhatsApp
   */
  generatePropertyInquiryMessage(
    property: Property,
    userProfile?: {
      name?: string;
      phone?: string;
      email?: string;
      budget?: { min: number; max: number };
      moveDate?: string;
      preferences?: string[];
    }
  ): string {
    const lines = [
      '¡Hola! Vi esta propiedad en HEUREKKA y me interesa:',
      '',
      `📍 *${property.address}*`,
      `💰 *L.${property.price.amount.toLocaleString('es-HN')}/mes*`,
      `🏠 ${this.getPropertyTypeLabel(property.type)}`,
      `🛏️ ${property.bedrooms} ${property.bedrooms === 1 ? 'habitación' : 'habitaciones'}`,
      `🚿 ${property.bathrooms} ${property.bathrooms === 1 ? 'baño' : 'baños'}`,
    ];

    // Add area if available
    if (property.areaSqm) {
      lines.push(`📐 ${property.areaSqm} m²`);
    }

    // Add key amenities if available
    if (property.amenities?.length > 0) {
      lines.push('', '✨ *Amenidades destacadas:*');
      property.amenities.slice(0, 5).forEach(amenity => {
        lines.push(`• ${amenity}`);
      });
    }

    // Add user profile information if provided
    if (userProfile) {
      lines.push('', '*Mi información:*');
      
      if (userProfile.name) {
        lines.push(`👤 ${userProfile.name}`);
      }
      
      if (userProfile.phone) {
        lines.push(`📱 ${userProfile.phone}`);
      }
      
      if (userProfile.email) {
        lines.push(`📧 ${userProfile.email}`);
      }
      
      if (userProfile.budget) {
        lines.push(`💵 Presupuesto: L.${userProfile.budget.min.toLocaleString()}-${userProfile.budget.max.toLocaleString()}`);
      }
      
      if (userProfile.moveDate) {
        lines.push(`📅 Fecha de mudanza: ${this.formatDate(userProfile.moveDate)}`);
      }
      
      if (userProfile.preferences?.length) {
        lines.push('', '*Preferencias especiales:*');
        userProfile.preferences.forEach(pref => {
          lines.push(`• ${pref}`);
        });
      }
    }

    lines.push(
      '',
      '¿Podríamos coordinar una visita?',
      '',
      `🔗 Ver más: ${this.getPropertyUrl(property.id)}`,
      `📌 Ref: ${property.id.slice(0, 8).toUpperCase()}`
    );

    return lines.join('\n');
  }

  /**
   * Generate WhatsApp deep link for web or app
   */
  generateWhatsAppLink(
    phoneNumber: string,
    message: string,
    useWebVersion: boolean = false
  ): string {
    // Format Honduras phone number
    const formattedPhone = this.formatHondurasPhone(phoneNumber);
    const encodedMessage = encodeURIComponent(message);
    
    const baseUrl = useWebVersion ? 'https://web.whatsapp.com/send' : 'https://wa.me';
    return `${baseUrl}/${formattedPhone}?text=${encodedMessage}`;
  }

  /**
   * Send WhatsApp message using Business API (if configured)
   */
  async sendMessage(
    to: string,
    message: string,
    templateName?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.apiToken || !this.phoneNumberId) {
        // Fallback to WhatsApp link generation
        const link = this.generateWhatsAppLink(to, message);
        return {
          success: true,
          messageId: `fallback-${Date.now()}`,
          error: 'API not configured, generated WhatsApp link instead'
        };
      }

      const formattedPhone = this.formatHondurasPhone(to);
      
      let payload;
      
      if (templateName) {
        // Use approved message template
        payload = {
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: 'es'
            }
          }
        };
      } else {
        // Send text message (requires 24-hour window)
        payload = {
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: {
            body: message
          }
        };
      }

      const response = await fetch(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        }
      );

      const result = await response.json();
      
      if (response.ok && result.messages?.[0]?.id) {
        return {
          success: true,
          messageId: result.messages[0].id
        };
      } else {
        console.error('WhatsApp API error:', result);
        return {
          success: false,
          error: result.error?.message || 'Failed to send message'
        };
      }

    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send property inquiry template message
   */
  async sendPropertyInquiryTemplate(
    contactInfo: WhatsAppContactInfo
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Generate the message
      const message = this.generatePropertyInquiryMessage(
        {
          id: contactInfo.propertyId,
          title: contactInfo.propertyTitle,
          address: contactInfo.propertyAddress,
          price: { amount: contactInfo.propertyPrice, currency: 'HNL', period: 'month' },
          bedrooms: contactInfo.propertyBedrooms,
          bathrooms: contactInfo.propertyBathrooms,
          areaSqm: contactInfo.propertyArea,
          type: 'apartment', // This should come from contactInfo
          neighborhood: '',
          coordinates: { lat: 0, lng: 0 },
          amenities: [],
          images: [],
          viewCount: 0,
          favoriteCount: 0,
          contactCount: 0,
          contactPhone: contactInfo.landlordPhone,
          landlord: {
            id: '',
            name: 'Propietario',
            phone: contactInfo.landlordPhone,
            rating: 4.5,
            verified: false,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          description: '',
        },
        contactInfo.userProfile
      );

      return await this.sendMessage(
        contactInfo.landlordPhone,
        message
      );

    } catch (error) {
      console.error('Error sending property inquiry template:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send inquiry'
      };
    }
  }

  /**
   * Validate WhatsApp phone number format
   */
  validatePhoneNumber(phone: string): { valid: boolean; formatted?: string; error?: string } {
    try {
      const cleaned = phone.replace(/\D/g, '');
      
      // Check if it's a valid Honduras number
      if (cleaned.startsWith('504')) {
        // Full international format
        if (cleaned.length === 11) {
          return { valid: true, formatted: cleaned };
        }
      } else if (cleaned.length === 8) {
        // Local format, add country code
        return { valid: true, formatted: `504${cleaned}` };
      }
      
      return {
        valid: false,
        error: 'Número de teléfono inválido. Use formato: +504 XXXX-XXXX o XXXX-XXXX'
      };
      
    } catch (error) {
      return {
        valid: false,
        error: 'Error validating phone number'
      };
    }
  }

  /**
   * Get available message templates
   */
  async getMessageTemplates(): Promise<any[]> {
    try {
      if (!this.apiToken || !this.businessAccount) {
        return [];
      }

      const response = await fetch(
        `${this.apiUrl}/${this.businessAccount}/message_templates`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
          }
        }
      );

      const result = await response.json();
      return result.data || [];

    } catch (error) {
      console.error('Error fetching WhatsApp templates:', error);
      return [];
    }
  }

  /**
   * Check WhatsApp Business API health
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details?: any }> {
    try {
      if (!this.apiToken || !this.phoneNumberId) {
        return {
          status: 'unhealthy',
          details: { error: 'API credentials not configured' }
        };
      }

      const response = await fetch(
        `${this.apiUrl}/${this.phoneNumberId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        return {
          status: 'healthy',
          details: {
            phoneNumberId: this.phoneNumberId,
            displayPhoneNumber: result.display_phone_number,
            verifiedName: result.verified_name,
          }
        };
      } else {
        return {
          status: 'unhealthy',
          details: { error: `API returned ${response.status}` }
        };
      }

    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  // Private utility methods

  private formatHondurasPhone(phone: string): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present
    if (!cleaned.startsWith('504')) {
      return `504${cleaned}`;
    }
    
    return cleaned;
  }

  private getPropertyTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      apartment: 'Apartamento',
      house: 'Casa',
      room: 'Habitación',
      office: 'Oficina',
    };
    return labels[type] || type;
  }

  private formatDate(date: string): string {
    try {
      const d = new Date(date);
      return d.toLocaleDateString('es-HN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (error) {
      return date; // Return original if parsing fails
    }
  }

  private getPropertyUrl(propertyId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://heurekka.com';
    return `${baseUrl}/propiedades/${propertyId}`;
  }

  /**
   * Generate quick response templates for landlords
   */
  generateLandlordResponses(): string[] {
    return [
      '¡Hola! Gracias por tu interés en la propiedad. ¿Cuándo podrías hacer una visita?',
      'La propiedad está disponible. ¿Te gustaría coordinar una visita esta semana?',
      'Perfecto, me parece que podrías ser un buen inquilino. ¿Cuándo puedes venir a verla?',
      'Tengo tiempo mañana por la tarde o el sábado en la mañana. ¿Cuál te conviene?',
      'La propiedad incluye todos los servicios básicos. ¿Tienes alguna pregunta específica?',
    ];
  }

  /**
   * Generate follow-up messages for tenants
   */
  generateFollowUpMessages(): string[] {
    return [
      '¿Ya tuviste oportunidad de revisar la propiedad? ¿Te interesa coordinar una visita?',
      'Vi que viste la propiedad hace unos días. ¿Te gustaría más información?',
      'Esta propiedad ha tenido mucho interés. ¿Te gustaría asegurar una visita pronto?',
      '¿Tienes alguna pregunta adicional sobre la propiedad o el vecindario?',
      'Puedo enviarte más fotos o un video tour si te ayuda a decidir.',
    ];
  }
}

// Singleton instance
let whatsappServiceInstance: WhatsAppService | null = null;

export const getWhatsAppService = (): WhatsAppService => {
  if (!whatsappServiceInstance) {
    whatsappServiceInstance = new WhatsAppService();
  }
  return whatsappServiceInstance;
};

// For backward compatibility
export { getWhatsAppService as whatsappService };