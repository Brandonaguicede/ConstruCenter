import { z } from 'zod';

export const checkoutSchema = z
  .object({
    customer_name: z
      .string()
      .min(3, 'Ingresa tu nombre completo (mínimo 3 caracteres)')
      .max(150, 'Nombre demasiado extenso'),
    customer_phone: z
      .string()
      .min(8, 'Ingresa un número telefónico válido (mínimo 8 dígitos)')
      .max(25, 'Número telefónico inválido')
      .regex(/^[0-9+\s()-]+$/, 'El formato del teléfono contiene caracteres no válidos'),
    customer_email: z
      .string()
      .email('Ingresa un correo electrónico válido')
      .optional()
      .or(z.literal('')),
    delivery_type: z.enum(['store_pickup', 'delivery'], {
      message: 'Selecciona una modalidad de entrega válida',
    }),
    delivery_address: z.string().optional().or(z.literal('')),
    notes: z.string().max(500, 'Las observaciones no pueden superar 500 caracteres').optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.delivery_type === 'delivery') {
        return Boolean(data.delivery_address && data.delivery_address.trim().length >= 5);
      }
      return true;
    },
    {
      message: 'La dirección de entrega es obligatoria para envíos a obra o domicilio',
      path: ['delivery_address'],
    }
  );

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export interface CheckoutPayload {
  customer: CheckoutFormData;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}
