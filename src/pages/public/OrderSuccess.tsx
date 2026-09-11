import React, { useEffect, useState } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import {
  CheckCircle as CheckCircle2,
  Copy,
  Check,
  WhatsappLogo as MessageCircle,
  Truck,
  Storefront as Store,
  Printer,
  ArrowRight,
  ShieldCheck,
  Buildings as Building2,
  Calendar,
  Phone,
  User,
  MapPin,
  FileText,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '@/store/useCartStore';
import { formatColones } from '@/utils/currency';
import { settingsService } from '@/services/settings.service';

interface OrderItemSnapshot {
  product_id?: string;
  snapshot_name: string;
  snapshot_sku: string;
  quantity: number;
  snapshot_unit_price: number;
  snapshot_subtotal: number;
}

interface OrderData {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  delivery_type: 'store_pickup' | 'delivery';
  delivery_address?: string | null;
  notes?: string | null;
  total_amount: number;
  status: string;
  items: OrderItemSnapshot[];
  created_at: string;
}

export const OrderSuccess: React.FC = () => {
  const location = useLocation();
  const clearCart = useCartStore((state) => state.clearCart);
  const [copied, setCopied] = useState(false);

  // 1. Cargar número de WhatsApp dinámico desde store_settings
  const { data: settings } = useQuery({
    queryKey: ['store-settings'],
    queryFn: () => settingsService.getSettings(),
  });

  const adminPhone = settings?.whatsapp_number || '50685252840';

  // Recuperar orden del state de React Router
  const order = (location.state as { order?: OrderData })?.order;

  useEffect(() => {
    if (order) {
      clearCart();
    }
  }, [order, clearCart]);

  if (!order) {
    return <Navigate to="/" replace />;
  }

  // Construir mensaje oficial estructurado para WhatsApp
  const itemsText = order.items
    .map(
      (item) =>
        `• ${item.quantity}x ${item.snapshot_name} (SKU: ${item.snapshot_sku}) - ${formatColones(
          item.snapshot_subtotal
        )}`
    )
    .join('\n');

  const deliveryLabel =
    order.delivery_type === 'delivery' ? 'Envío a Obra / Domicilio' : 'Retiro en Tienda';

  const rawMessage = `⚡ *NUEVO PEDIDO CONSTRUCENTER NICOYA - ENERGÍA*
*N° de Pedido:* ${order.order_number}
*Cliente:* ${order.customer_name}
*Teléfono:* ${order.customer_phone}
*Modalidad:* ${deliveryLabel}
${order.delivery_address ? `*Dirección:* ${order.delivery_address}\n` : ''}${
    order.notes ? `*Observaciones:* ${order.notes}\n` : ''
}
📦 *Equipos Solicitados:*
${itemsText}

💰 *TOTAL VALIDADO:* ${formatColones(order.total_amount)}

_Hola, he generado este pedido en el catálogo web y deseo coordinar el pago y la programación de entrega con ConstruCenter Nicoya._`;

  const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(rawMessage)}`;

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.order_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. Encabezado de Éxito */}
      <div className="text-center space-y-3 bg-white p-8 sm:p-10 rounded-2xl border border-constru-line">
        <div className="w-16 h-16 bg-constru-accent/15 border border-constru-accent/30 text-constru-primary rounded-3xl flex items-center justify-center mx-auto shadow-xs animate-scaleUp">
          <CheckCircle2 className="w-10 h-10 text-constru-primary" />
        </div>
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-constru-accent/15 text-constru-primary border border-constru-accent/30">
          Pedido Registrado con Éxito
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-constru-ink tracking-tight">
          ¡Gracias por tu Pedido, {order.customer_name}!
        </h1>
        <p className="text-sm text-constru-muted max-w-lg mx-auto leading-relaxed">
          Tu orden ha sido registrada en nuestro servidor y los precios reales han sido reservados.
          Finaliza la compra enviando el comprobante por WhatsApp a nuestros asesores en Nicoya.
        </p>

        {/* Badge con Número de Pedido */}
        <div className="pt-3 flex items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white border border-constru-line tabular-nums font-bold text-base text-constru-ink shadow-xs">
            <span>N°: {order.order_number}</span>
            <button
              onClick={handleCopyOrderNumber}
              className="p-1 hover:bg-constru-mist rounded-md transition-colors text-constru-muted hover:text-constru-ink"
              title="Copiar número de pedido"
            >
              {copied ? <Check className="w-4 h-4 text-constru-primary" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. BOTÓN GIGANTE OFICIAL DE WHATSAPP (#25D366) */}
      <div className="bg-constru-mist p-6 sm:p-8 rounded-2xl text-constru-ink text-center space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
            <MessageCircle weight="fill" className="w-8 h-8" />
            <span>Paso Final: Enviar Pedido a WhatsApp</span>
          </h2>
          <p className="text-sm text-constru-muted max-w-xl mx-auto">
            Haz clic en el botón a continuación para abrir WhatsApp con el detalle completo del
            pedido listo para ser enviado a nuestro departamento de ventas.
          </p>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-5 rounded-2xl text-lg font-bold text-constru-ink bg-[#20ba5c] hover:bg-[#1caa54] shadow-2xl transition-all transform hover:scale-[1.02] cursor-pointer"
        >
          <MessageCircle weight="fill" className="w-6 h-6 text-constru-ink" />
          <span>Enviar Pedido a WhatsApp Ahora ({order.order_number})</span>
        </a>

        <p className="text-xs text-constru-muted">
          Respuesta promedio: Menos de 15 minutos en horario comercial.
        </p>
      </div>

      {/* 3. Desglose del Pedido (Comprobante Digital) */}
      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-constru-line space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-constru-line">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-constru-primary" />
            <h3 className="text-lg font-bold text-constru-ink">Comprobante de Cotización</h3>
          </div>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-constru-muted bg-white hover:bg-constru-mist border border-constru-line transition-colors self-start"
          >
            <Printer className="w-4 h-4 text-constru-muted" />
            <span>Imprimir Resumen</span>
          </button>
        </div>

        {/* Metadatos del Cliente y Entrega */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-white rounded-xl border border-constru-line space-y-1">
            <span className="text-constru-muted font-bold uppercase tracking-wider flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-constru-primary" /> Cliente
            </span>
            <p className="font-extrabold text-constru-ink text-sm">{order.customer_name}</p>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-constru-line space-y-1">
            <span className="text-constru-muted font-bold uppercase tracking-wider flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-constru-primary" /> Teléfono
            </span>
            <p className="font-extrabold text-constru-ink text-sm">{order.customer_phone}</p>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-constru-line space-y-1">
            <span className="text-constru-muted font-bold uppercase tracking-wider flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-constru-primary" /> Entrega
            </span>
            <p className="font-extrabold text-constru-ink text-sm">{deliveryLabel}</p>
          </div>
        </div>

        {order.delivery_address && (
          <div className="p-3.5 bg-white rounded-xl border border-constru-line text-xs space-y-1">
            <span className="text-constru-muted font-bold uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-constru-primary" /> Dirección de Entrega
            </span>
            <p className="font-medium text-constru-muted">{order.delivery_address}</p>
          </div>
        )}

        {/* Tabla de Artículos */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-constru-line text-constru-muted uppercase tracking-wider pb-2">
                <th className="py-2.5">Artículo</th>
                <th className="py-2.5 text-center">Cant.</th>
                <th className="py-2.5 text-right">Precio Unitario</th>
                <th className="py-2.5 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {order.items.map((item, index) => (
                <tr key={index} className="hover:bg-white transition-colors">
                  <td className="py-3 font-semibold text-constru-ink">
                    <p>{item.snapshot_name}</p>
                    <span className="tabular-nums text-[10px] text-constru-muted">SKU: {item.snapshot_sku}</span>
                  </td>
                  <td className="py-3 text-center font-bold text-constru-muted">{item.quantity}</td>
                  <td className="py-3 text-right text-constru-muted tabular-nums">
                    {formatColones(item.snapshot_unit_price)}
                  </td>
                  <td className="py-3 text-right font-bold text-constru-primary tabular-nums">
                    {formatColones(item.snapshot_subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-constru-line">
                <td colSpan={3} className="py-4 font-bold text-sm text-constru-ink text-right">
                  Total Validado (IVA Incluido):
                </td>
                <td className="py-4 text-right font-bold text-xl text-constru-primary tabular-nums">
                  {formatColones(order.total_amount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Botón Volver al Catálogo */}
        <div className="pt-4 border-t border-constru-line flex items-center justify-center">
          <Link
            to="/productos"
            className="inline-flex items-center gap-2 text-sm font-bold text-constru-primary hover:underline"
          >
            <span>Volver al catálogo de eficiencia energética</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
export default OrderSuccess;
