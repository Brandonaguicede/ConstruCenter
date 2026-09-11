import { z } from 'zod';

export const galleryImageSchema = z.object({
  title: z.string().max(150, 'El título no puede exceder 150 caracteres').optional().nullable().or(z.literal('')),
  description: z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional().nullable().or(z.literal('')),
  image_url: z
    .string()
    .min(1, 'Debes subir una foto o pegar su URL')
    .url('Usa una URL pública de imagen.')
    .regex(/^https?:\/\//, 'La imagen debe tener una URL HTTP o HTTPS persistente.'),
  is_active: z.boolean(),
});

export type GalleryImageFormData = z.infer<typeof galleryImageSchema>;
