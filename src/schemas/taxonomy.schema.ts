import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(150),
  slug: z
    .string()
    .min(2, 'El slug debe tener al menos 2 caracteres')
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'El slug solo debe contener letras minúsculas, números y guiones'),
  description: z.string().max(500).optional().nullable(),
  image_url: z.string().url('Debe ser una URL válida').optional().nullable().or(z.literal('')),
  is_active: z.boolean(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

export const brandSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(150),
  slug: z
    .string()
    .min(2, 'El slug debe tener al menos 2 caracteres')
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'El slug solo debe contener letras minúsculas, números y guiones'),
  description: z.string().max(500).optional().nullable(),
  logo_url: z.string().url('Debe ser una URL válida').optional().nullable().or(z.literal('')),
  is_active: z.boolean(),
});

export type BrandFormData = z.infer<typeof brandSchema>;
