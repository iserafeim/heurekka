import { z } from 'zod';

/**
 * Real Estate Agent Form Validation Schema
 * Todas las validaciones y mensajes en español
 */
export const realEstateAgentSchema = z.object({
  professionalName: z
    .string()
    .min(2, 'El nombre profesional debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),

  phone: z
    .string()
    .regex(/^\d{4}-\d{4}$/, 'El formato debe ser 9999-9999')
    .refine((val) => val !== '0000-0000', 'Ingrese un número de teléfono válido'),

  whatsappNumber: z
    .string()
    .regex(/^\d{4}-\d{4}$/, 'El formato debe ser 9999-9999')
    .refine((val) => val !== '0000-0000', 'Ingrese un número de WhatsApp válido'),

  agentType: z.enum(['independent', 'agency_agent'], {
    errorMap: () => ({ message: 'Debe seleccionar un tipo de agente' }),
  }),

  companyName: z
    .string()
    .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres')
    .max(100, 'El nombre de la empresa no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),

  yearsOfExperience: z.enum(['<1', '1-3', '3-5', '5+'], {
    errorMap: () => ({ message: 'Debe seleccionar los años de experiencia' }),
  }),

  licenseNumber: z
    .string()
    .regex(/^AHCI-\d{5}$/, 'El formato debe ser AHCI-12345')
    .optional()
    .or(z.literal('')),

  specializations: z
    .array(z.enum(['residential', 'commercial', 'industrial']))
    .min(1, 'Debe seleccionar al menos una especialización')
    .max(3, 'Puede seleccionar hasta 3 especializaciones'),

  coverageAreas: z
    .array(z.string())
    .min(1, 'Debe seleccionar al menos una zona de cobertura')
    .max(10, 'Puede seleccionar hasta 10 zonas de cobertura'),

  propertiesManaged: z.enum(['1-5', '6-10', '11-20', '20+'], {
    errorMap: () => ({ message: 'Debe seleccionar el rango de propiedades en gestión' }),
  }),

  credentialsUrl: z
    .string()
    .url('Debe ser una URL válida')
    .optional()
    .or(z.literal('')),

  facebook: z
    .string()
    .url('Debe ser una URL válida de Facebook')
    .optional()
    .or(z.literal('')),

  instagram: z
    .string()
    .url('Debe ser una URL válida de Instagram')
    .optional()
    .or(z.literal('')),

  professionalBio: z
    .string()
    .max(300, 'La biografía no puede exceder 300 caracteres')
    .optional()
    .or(z.literal('')),
});

export type RealEstateAgentInput = z.infer<typeof realEstateAgentSchema>;
