/**
 * Formateador de moneda oficial para ConstruCenter (Colones ₡)
 */
export function formatColones(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₡0';
  }
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    maximumFractionDigits: 0, // En colones comúnmente no se usan centavos
  }).format(amount);
}
