import { z } from 'zod';

/**
 * Property Company Form Validation Schema
 * Todas las validaciones y mensajes en español
 */
export const propertyCompanySchema = z
  .object({
    companyName: z
      .string()
      .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres')
      .max(150, 'El nombre de la empresa no puede exceder 150 caracteres'),

    rtn: z
      .string()
      .regex(/^\d{4}-\d{4}-\d{6}$/, 'El RTN debe tener el formato 0801-1990-123456')
      .refine((val) => val !== '0000-0000-000000', 'Ingrese un RTN válido'),

    companyType: z.string().min(1, 'Debe seleccionar el tipo de empresa'),

    foundedYear: z
      .number()
      .int('El año debe ser un número entero')
      .min(1900, 'El año debe ser mayor a 1900')
      .max(new Date().getFullYear(), `El año no puede ser mayor a ${new Date().getFullYear()}`)
      .optional()
      .nullable(),

    primaryPhone: z
      .string()
      .regex(/^\d{4}-\d{4}$/, 'El formato debe ser 9999-9999')
      .refine((val) => val !== '0000-0000', 'Ingrese un número de teléfono válido'),

    whatsappBusiness: z
      .string()
      .regex(/^\d{4}-\d{4}$/, 'El formato debe ser 9999-9999')
      .refine((val) => val !== '0000-0000', 'Ingrese un número de WhatsApp válido'),

    contactEmail: z
      .string()
      .email('Debe ser un email válido')
      .optional()
      .or(z.literal('')),

    website: z
      .string()
      .url('Debe ser una URL válida')
      .optional()
      .or(z.literal('')),

    officeAddress: z
      .string()
      .min(10, 'La dirección debe tener al menos 10 caracteres')
      .max(200, 'La dirección no puede exceder 200 caracteres'),

    city: z.string().min(1, 'Debe seleccionar una ciudad'),

    operatingAreas: z
      .array(z.string())
      .min(1, 'Debe seleccionar al menos una zona de operación')
      .max(20, 'Puede seleccionar hasta 20 zonas de operación'),

    portfolioSize: z.enum(['1-10', '11-25', '26-50', '50+'], {
      errorMap: () => ({ message: 'Debe seleccionar el tamaño del portfolio' }),
    }),

    propertyTypes: z
      .array(z.enum(['residential', 'commercial', 'industrial', 'land']))
      .min(1, 'Debe seleccionar al menos un tipo de propiedad')
      .max(4, 'Puede seleccionar hasta 4 tipos de propiedades'),

    priceRangeMin: z
      .number()
      .int('El precio debe ser un número entero')
      .min(0, 'El precio mínimo debe ser mayor o igual a 0')
      .optional()
      .nullable(),

    priceRangeMax: z
      .number()
      .int('El precio debe ser un número entero')
      .min(0, 'El precio máximo debe ser mayor o igual a 0')
      .optional()
      .nullable(),

    companyLogoUrl: z
      .string()
      .url('Debe ser una URL válida')
      .optional()
      .or(z.literal('')),

    licenseDocumentUrl: z
      .string()
      .url('Debe ser una URL válida')
      .optional()
      .or(z.literal('')),

    companyDescription: z
      .string()
      .max(500, 'La descripción no puede exceder 500 caracteres')
      .optional()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      // Validar que priceRangeMax >= priceRangeMin si ambos están presentes
      if (data.priceRangeMin != null && data.priceRangeMax != null) {
        return data.priceRangeMax >= data.priceRangeMin;
      }
      return true;
    },
    {
      message: 'El precio máximo debe ser mayor o igual al precio mínimo',
      path: ['priceRangeMax'],
    }
  );

export type PropertyCompanyInput = z.infer<typeof propertyCompanySchema>;
