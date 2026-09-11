import { z } from 'zod';

export const productSchema = z.object({
  sku: z
    .string()
    .min(3, 'El SKU debe tener al menos 3 caracteres')
    .max(64, 'El SKU no puede exceder 64 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'El SKU solo puede contener letras, números, guiones y guiones bajos'),
  name: z
    .string()
    .min(3, 'El nombre del producto debe tener al menos 3 caracteres')
    .max(255, 'El nombre no puede exceder 255 caracteres'),
  slug: z
    .string()
    .min(3, 'El slug debe tener al menos 3 caracteres')
    .max(280, 'El slug no puede exceder 280 caracteres')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'El slug solo debe contener minúsculas, números y guiones'),
  description: z.string().optional().nullable(),
  price: z
    .number({ message: 'El precio debe ser un número válido' })
    .positive('El precio debe ser mayor a 0 (estrictamente > 0)'),
  compare_at_price: z
    .number({ message: 'El precio debe ser numérico' })
    .nonnegative('No puede ser un valor negativo')
    .optional()
    .nullable(),
  cost_price: z
    .number({ message: 'El costo debe ser numérico' })
    .nonnegative('No puede ser un valor negativo')
    .optional()
    .nullable(),
  stock: z
    .number({ message: 'El inventario debe ser numérico' })
    .int('El inventario debe ser un número entero')
    .nonnegative('El inventario no puede ser negativo'),
  category_id: z
    .string()
    .uuid('Debes seleccionar una categoría válida'),
  brand_id: z
    .string()
    .uuid('Debes seleccionar una marca válida'),
  images: z
    .array(z.string().url('Usa una URL pública de imagen.').regex(/^https?:\/\//, 'La imagen debe tener una URL HTTP o HTTPS persistente.')),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  specs: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional().nullable(),
});

export type ProductFormData = z.infer<typeof productSchema>;
