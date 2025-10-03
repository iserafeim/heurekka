import { z } from 'zod';

/**
 * Individual Owner Form Validation Schema
 * Todas las validaciones y mensajes en español
 */
export const individualOwnerSchema = z.object({
  fullName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-záéíóúñü\s]+$/i, 'El nombre solo puede contener letras y espacios'),

  phone: z
    .string()
    .regex(/^\d{4}-\d{4}$/, 'El formato debe ser 9999-9999')
    .refine((val) => val !== '0000-0000', 'Ingrese un número de teléfono válido'),

  whatsappNumber: z
    .string()
    .regex(/^\d{4}-\d{4}$/, 'El formato debe ser 9999-9999')
    .refine((val) => val !== '0000-0000', 'Ingrese un número de WhatsApp válido')
    .optional()
    .or(z.literal('')),

  primaryLocation: z
    .string()
    .min(1, 'Debe seleccionar una ubicación'),

  propertyCountRange: z
    .enum(['1', '2-3', '4-5', '5+'])
    .optional(),

  rentingReason: z
    .string()
    .max(200, 'La razón no puede exceder 200 caracteres')
    .optional()
    .or(z.literal('')),
});

export type IndividualOwnerInput = z.infer<typeof individualOwnerSchema>;
