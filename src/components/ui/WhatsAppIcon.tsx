import whatsappBadge from '@/img/whatsapp.png';

export function WhatsAppIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return <img src={whatsappBadge} alt="" className={`wa-badge ${className}`} />;
}
