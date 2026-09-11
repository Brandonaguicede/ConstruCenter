import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  User,
  Phone,
  EnvelopeSimple as Mail,
  MapPin,
  Calendar,
  FileText,
  CurrencyDollar as DollarSign,
  Package,
  Truck,
  Storefront as Store,
  CheckCircle as CheckCircle2,
  WarningCircle as AlertCircle,
  CircleNotch as Loader2,
  Clock,
  Printer,
  ArrowSquareOut as ExternalLink,
  WhatsappLogo as MessageCircle,
} from '@phosphor-icons/react';
import { orderService } from '@/services/order.service';
import type { OrderStatus, PaymentStatus } from '@/types/models';
import { formatColones } from '@/utils/currency';
import { renderOrderStatusBadge, renderPaymentStatusBadge } from '@/pages/admin/Orders';

export const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // 1. Cargar detalle del pedido por ID
  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['admin-order-detail', id],
    queryFn: () => (id ? orderService.getOrderById(id) : null),
    enabled: Boolean(id),
  });

  // 2. Mutaciones independientes para Order Status y Payment Status
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      orderService.updateOrderStatus(orderId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-order-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setStatusFeedback(`Estado logístico actualizado a "${variables.status}"`);
      setTimeout(() => setStatusFeedback(null), 3000);
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ orderId, paymentStatus }: { orderId: string; paymentStatus: PaymentStatus }) =>
      orderService.updatePaymentStatus(orderId, paymentStatus),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-order-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setStatusFeedback(`Estado de pago actualizado a "${variables.paymentStatus}"`);
      setTimeout(() => setStatusFeedback(null), 3000);
    },
  });

  if (isLoading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-constru-primary animate-spin" />
        <p className="text-sm font-semibold text-gray-500">Cargando información histórica del pedido...</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="p-16 text-center bg-white rounded-2xl border border-gray-200 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-constru-dark">Pedido no encontrado</h2>
        <p className="text-sm text-gray-500">{(error as Error)?.message || 'El registro no existe en la base de datos.'}</p>
        <Link
          to="/admin/pedidos"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-constru-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al listado de pedidos</span>
        </Link>
      </div>
    );
  }

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('es-CR', {
        dateStyle: 'full',
        timeStyle: 'medium',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  const deliveryLabel =
    order.delivery_type === 'delivery' ? 'Envío a Obra / Domicilio' : 'Retiro en Almacén';

  const clientWhatsAppUrl = `https://wa.me/${order.customer_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hola ${order.customer_name}, te contactamos de ConstruCenter respecto a tu pedido ${order.order_number}.`
  )}`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Superior con Volver y Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80">
        <div className="flex items-center gap-3.5">
          <Link
            to="/admin/pedidos"
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-sm font-black bg-gray-100 px-2.5 py-0.5 rounded-md text-constru-dark">
                {order.order_number}
              </span>
              <span className="text-xs text-gray-400">&bull;</span>
              <span className="text-xs text-gray-500">{formatDate(order.created_at)}</span>
            </div>
            <h1 className="text-xl font-black text-constru-dark tracking-tight mt-1">
              Pedido de {order.customer_name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {renderOrderStatusBadge(order.status)}
          {renderPaymentStatusBadge(order.payment_status)}
        </div>
      </div>

      {/* Toast de confirmación de cambio de estado */}
      {statusFeedback && (
        <div className="p-3.5 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-constru-accent flex-shrink-0" />
          <span>{statusFeedback}</span>
        </div>
      )}

      {/* CONTENEDOR PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMNA IZQUIERDA: CONTROLES DE ESTADO Y DATOS DEL CLIENTE (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Gestión de Estados Separados */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-constru-dark pb-2 border-b border-gray-100 flex items-center justify-between">
              <span>Gestión de Estados</span>
              <span className="text-[11px] text-gray-400 font-normal">Modificación Independiente</span>
            </h2>

            {/* Selector 1: Estado del Pedido (order_status) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Estado Logístico del Pedido:
              </label>
              <select
                value={order.status}
                disabled={updateStatusMutation.isPending}
                onChange={(e) =>
                  updateStatusMutation.mutate({
                    orderId: order.id,
                    status: e.target.value as OrderStatus,
                  })
                }
                className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-constru-primary cursor-pointer"
              >
                <option value="PENDING">🕒 PENDING (Pendiente de revisión)</option>
                <option value="CONFIRMED">✅ CONFIRMED (Confirmado por ventas)</option>
                <option value="PREPARING">📦 PREPARING (En preparación en bodega)</option>
                <option value="READY">🚚 READY (Listo para entrega o retiro)</option>
                <option value="COMPLETED">🎉 COMPLETED (Entregado y completado)</option>
                <option value="CANCELLED">❌ CANCELLED (Cancelado)</option>
              </select>
              {updateStatusMutation.isPending && (
                <p className="text-[11px] text-constru-primary flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Guardando estado logístico...
                </p>
              )}
            </div>

            {/* Selector 2: Estado del Pago (payment_status) */}
            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              <label className="block text-xs font-bold text-gray-700">
                Estado de Cobro / Pago:
              </label>
              <select
                value={order.payment_status}
                disabled={updatePaymentMutation.isPending}
                onChange={(e) =>
                  updatePaymentMutation.mutate({
                    orderId: order.id,
                    paymentStatus: e.target.value as PaymentStatus,
                  })
                }
                className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-constru-primary cursor-pointer"
              >
                <option value="PENDING">🟠 PENDING (Por Cobrar / Pendiente)</option>
                <option value="PAID">🟢 PAID (Pagado y verificado en cuenta)</option>
                <option value="CANCELLED">⚪ CANCELLED (Anulado)</option>
              </select>
              {updatePaymentMutation.isPending && (
                <p className="text-[11px] text-constru-primary flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Guardando estado de pago...
                </p>
              )}
            </div>
          </div>

          {/* Card: Datos del Cliente */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-constru-dark pb-2 border-b border-gray-100">
              Datos de Contacto y Entrega
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 font-bold uppercase tracking-wider">Cliente:</span>
                <p className="font-extrabold text-sm text-constru-dark mt-0.5">{order.customer_name}</p>
              </div>

              <div>
                <span className="text-gray-400 font-bold uppercase tracking-wider">Teléfono:</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono font-bold text-sm text-constru-dark">
                    {order.customer_phone}
                  </span>
                  <a
                    href={clientWhatsAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200"
                  >
                    <MessageCircle weight="fill" className="w-3 h-3" />
                    WhatsApp
                  </a>
                </div>
              </div>

              {order.customer_email && (
                <div>
                  <span className="text-gray-400 font-bold uppercase tracking-wider">Email:</span>
                  <p className="text-gray-700 mt-0.5">{order.customer_email}</p>
                </div>
              )}

              <div>
                <span className="text-gray-400 font-bold uppercase tracking-wider">Modalidad:</span>
                <div className="flex items-center gap-1.5 font-bold text-constru-dark mt-0.5">
                  {order.delivery_type === 'delivery' ? (
                    <Truck className="w-3.5 h-3.5 text-constru-primary" />
                  ) : (
                    <Store className="w-3.5 h-3.5 text-constru-primary" />
                  )}
                  <span>{deliveryLabel}</span>
                </div>
              </div>

              {order.delivery_address && (
                <div>
                  <span className="text-gray-400 font-bold uppercase tracking-wider">Dirección:</span>
                  <p className="text-gray-700 mt-0.5 leading-relaxed bg-gray-50 p-2.5 rounded-lg">
                    {order.delivery_address}
                  </p>
                </div>
              )}

              {order.notes && (
                <div>
                  <span className="text-gray-400 font-bold uppercase tracking-wider">Observaciones:</span>
                  <p className="text-gray-700 mt-0.5 italic bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/60">
                    "{order.notes}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: SNAPSHOTS DE ARTÍCULOS (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200/80 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-constru-dark">
                  Artículos del Pedido (Snapshots Congelados)
                </h2>
                <p className="text-[11px] text-gray-400">
                  Precios unitarios históricos registrados en la tabla order_items
                </p>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>
            </div>

            {/* Tabla de Snapshots */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 uppercase tracking-wider pb-2 bg-gray-50/50">
                    <th className="py-2.5 px-3">Artículo Histórico</th>
                    <th className="py-2.5 px-2 text-center">Cant.</th>
                    <th className="py-2.5 px-3 text-right">Precio Unit.</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/40">
                        <td className="py-3 px-3">
                          <p className="font-bold text-constru-dark text-sm">{item.snapshot_name}</p>
                          <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                            SKU: {item.snapshot_sku}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center font-bold text-gray-800 text-sm">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-3 text-right text-gray-600 font-semibold">
                          {formatColones(item.snapshot_unit_price)}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-constru-primary text-sm">
                          {formatColones(item.snapshot_subtotal)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-400">
                        No hay artículos asociados registrados para esta orden.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-green-50/30">
                    <td colSpan={3} className="py-4 px-3 font-black text-sm text-constru-dark text-right">
                      Total Validado en Servidor:
                    </td>
                    <td className="py-4 px-3 text-right font-black text-xl text-constru-primary">
                      {formatColones(order.total_amount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Aviso Histórico Intacto */}
            <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-500 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-constru-accent flex-shrink-0 mt-0.5" />
              <span>
                <strong>Garantía de Auditoría:</strong> Estos valores son inmutables y no cambiarán si
                en el futuro se actualiza el precio del producto en el catálogo.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminOrderDetail;
