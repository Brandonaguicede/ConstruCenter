import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  ClipboardText as ClipboardList,
  MagnifyingGlass as Search,
  Funnel as Filter,
  Eye,
  Calendar,
  Phone,
  User,
  WarningCircle as AlertCircle,
  CircleNotch as Loader2,
  CheckCircle as CheckCircle2,
  Clock,
  Truck,
  CurrencyDollar as DollarSign,
  Package,
} from '@phosphor-icons/react';
import { orderService, type OrderFilters } from '@/services/order.service';
import type { OrderStatus, PaymentStatus } from '@/types/models';
import { formatColones } from '@/utils/currency';

// Helper para badges de estado logístico del pedido
export const renderOrderStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          Pendiente
        </span>
      );
    case 'CONFIRMED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
          <CheckCircle2 className="w-3 h-3 text-blue-600" />
          Confirmado
        </span>
      );
    case 'PREPARING':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
          <Package className="w-3 h-3 text-purple-600" />
          En Preparación
        </span>
      );
    case 'READY':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-cyan-100 text-cyan-800 border border-cyan-200">
          <Truck className="w-3 h-3 text-cyan-600" />
          Listo p/ Entrega
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-green-100 text-green-800 border border-green-200">
          <CheckCircle2 className="w-3 h-3 text-green-600" />
          Completado
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-800 border border-red-200">
          Cancelado
        </span>
      );
    default:
      return <span>{status}</span>;
  }
};

// Helper para badges de estado de pago
export const renderPaymentStatusBadge = (status: PaymentStatus) => {
  switch (status) {
    case 'PAID':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <DollarSign className="w-3 h-3 text-emerald-600" />
          Pagado
        </span>
      );
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-orange-100 text-orange-800 border border-orange-200">
          <Clock className="w-3 h-3 text-orange-600" />
          Por Cobrar
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-gray-100 text-gray-700 border border-gray-300">
          Anulado
        </span>
      );
    default:
      return <span>{status}</span>;
  }
};

export const AdminOrders: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | ''>('');

  const filters: OrderFilters = {
    searchTerm: searchTerm || undefined,
    status: statusFilter || undefined,
    paymentStatus: paymentFilter || undefined,
  };

  const {
    data: orders = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['admin-orders', filters],
    queryFn: () => orderService.getOrders(filters),
  });

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('es-CR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-green-50 rounded-xl">
              <ClipboardList className="w-6 h-6 text-constru-primary" />
            </div>
            <h1 className="text-2xl font-black text-constru-dark tracking-tight">Gestión de Pedidos</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Administra las órdenes comerciales recibidas, estados logísticos y verificación de pago
          </p>
        </div>

        <div className="text-xs font-semibold text-gray-500 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
          Total de Órdenes: <strong className="text-constru-primary font-bold">{orders.length}</strong>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200/80 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Buscador */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por N° Pedido, cliente o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-constru-primary focus:border-constru-primary"
          />
        </div>

        {/* Selectores de Estado */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Filtro Estado del Pedido */}
          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-300 text-xs">
            <Package className="w-3.5 h-3.5 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
              className="bg-transparent text-gray-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="">Todos los Estados</option>
              <option value="PENDING">Pendiente</option>
              <option value="CONFIRMED">Confirmado</option>
              <option value="PREPARING">En Preparación</option>
              <option value="READY">Listo para Entrega</option>
              <option value="COMPLETED">Completado</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>

          {/* Filtro Estado de Pago */}
          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-300 text-xs">
            <DollarSign className="w-3.5 h-3.5 text-gray-500" />
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as PaymentStatus | '')}
              className="bg-transparent text-gray-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="">Cualquier Pago</option>
              <option value="PENDING">Por Cobrar</option>
              <option value="PAID">Pagado</option>
              <option value="CANCELLED">Anulado</option>
            </select>
          </div>

          {(searchTerm || statusFilter || paymentFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setPaymentFilter('');
              }}
              className="text-xs text-red-600 font-bold hover:underline px-2 py-1"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Tabla de Listado de Pedidos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-9 h-9 text-constru-primary animate-spin" />
            <p className="text-sm font-semibold text-gray-500">Cargando pedidos comerciales...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <p className="text-base font-bold text-gray-800">Error al cargar pedidos</p>
            <p className="text-sm text-gray-500 mt-1">{(error as Error)?.message}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
              <ClipboardList className="w-7 h-7" />
            </div>
            <p className="text-lg font-bold text-constru-dark">No hay pedidos registrados</p>
            <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
              {searchTerm || statusFilter || paymentFilter
                ? 'No se encontraron pedidos con los filtros seleccionados.'
                : 'Los pedidos generados desde la tienda aparecerán aquí automáticamente.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/75 text-xs font-bold uppercase tracking-wider text-gray-600">
                  <th className="py-3.5 px-6">N° Pedido</th>
                  <th className="py-3.5 px-6">Fecha</th>
                  <th className="py-3.5 px-6">Cliente</th>
                  <th className="py-3.5 px-6">Teléfono</th>
                  <th className="py-3.5 px-6 text-right">Total Validado</th>
                  <th className="py-3.5 px-6 text-center">Estado Pedido</th>
                  <th className="py-3.5 px-6 text-center">Estado Pago</th>
                  <th className="py-3.5 px-6 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-green-50/25 transition-colors">
                    {/* Número de Pedido */}
                    <td className="py-4 px-6 font-mono font-bold text-constru-dark">
                      <span className="bg-gray-100 px-2 py-1 rounded-md text-xs">
                        {ord.order_number}
                      </span>
                    </td>

                    {/* Fecha */}
                    <td className="py-4 px-6 text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(ord.created_at)}
                    </td>

                    {/* Cliente */}
                    <td className="py-4 px-6 font-bold text-constru-dark">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate max-w-xs">{ord.customer_name}</span>
                      </div>
                    </td>

                    {/* Teléfono */}
                    <td className="py-4 px-6 font-mono text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-constru-accent" />
                        <span>{ord.customer_phone}</span>
                      </div>
                    </td>

                    {/* Total Validado */}
                    <td className="py-4 px-6 text-right font-black text-constru-primary whitespace-nowrap">
                      {formatColones(ord.total_amount)}
                    </td>

                    {/* Estado del Pedido */}
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      {renderOrderStatusBadge(ord.status)}
                    </td>

                    {/* Estado de Pago */}
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      {renderPaymentStatusBadge(ord.payment_status)}
                    </td>

                    {/* Botón Ver Detalle */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => navigate(`/admin/pedidos/${ord.id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-constru-primary bg-green-50 hover:bg-green-100 border border-green-200 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Detalle</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminOrders;
