/**
 * Genera un slug seguro y limpio para URLs a partir de una cadena de texto.
 */
export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // Descompone caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Elimina diacríticos/acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remueve caracteres no alfanuméricos
    .replace(/[\s_]+/g, '-') // Reemplaza espacios y guiones bajos por guiones
    .replace(/-+/g, '-') // Elimina guiones repetidos
    .replace(/^-+|-+$/g, ''); // Remueve guiones iniciales y finales
}
