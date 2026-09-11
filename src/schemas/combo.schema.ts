import { z } from 'zod';

export const comboItemSchema = z.object({
  product_id: z.string().uuid('Selecciona un producto del catálogo.'),
  quantity: z.number().int('La cantidad debe ser entera.').min(1).max(999),
});
export const comboFormSchema = z.object({
  name: z.string().trim().min(3, 'Escribe un nombre de al menos 3 caracteres.').max(120),
  description: z.string().trim().max(2000),
  image_url: z.union([z.string().trim().url('Usa una URL pública de imagen.').regex(/^https?:\/\//, 'La imagen debe tener una URL HTTP o HTTPS.'), z.literal('')]).nullish(),
  features: z.array(z.string().trim().min(1).max(300)).max(30),
  is_active: z.boolean(),
  items: z.array(comboItemSchema).min(1, 'Agrega al menos un producto.').max(100)
    .refine(items => new Set(items.map(item => item.product_id)).size === items.length, 'Un producto no puede repetirse; ajusta su cantidad.'),
});
export type ComboFormData = z.infer<typeof comboFormSchema>;
