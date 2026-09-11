import { z } from 'zod';

export const catalogSchema = z.object({
  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(255, 'El título no puede exceder 255 caracteres'),
  file_url: z
    .string()
    .min(1, 'Debes subir un PDF o pegar su URL')
    .url('Usa una URL pública de PDF.')
    .regex(/^https?:\/\//, 'El PDF debe tener una URL HTTP o HTTPS persistente.'),
  cover_image_url: z.string().url('Debe ser una URL válida').optional().nullable().or(z.literal('')),
  brand_id: z.string().optional().nullable().or(z.literal('')),
  file_size_bytes: z.number().nonnegative().optional().nullable(),
  is_active: z.boolean(),
});

export type CatalogFormData = z.infer<typeof catalogSchema>;
