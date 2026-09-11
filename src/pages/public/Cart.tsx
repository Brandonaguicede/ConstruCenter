import { CatalogImage } from '@/components/ui/CatalogImage';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash as Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Package,
  WarningCircle as AlertCircle,
} from '@phosphor-icons/react';
import { useCartStore } from '@/store/useCartStore';
import { formatColones } from '@/utils/currency';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, getEstimatedSubtotal, getTotalItems } =
    useCartStore();

  const subtotal = getEstimatedSubtotal();
  const totalItems = getTotalItems();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6 text-constru-ink">
        <div className="w-20 h-20 bg-white border border-constru-line rounded-3xl flex items-center justify-center mx-auto text-constru-primary shadow-md">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-constru-ink tracking-tight">
            Tu Carrito de Equipos está Vacío
          </h1>
          <p className="text-sm text-constru-muted max-w-md mx-auto">
            Explora nuestro catálogo para seleccionar paneles solares, inversores, baterías LiFePO4 o acabados inteligentes.
          </p>
        </div>
        <Link
          to="/productos"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base text-constru-primary bg-constru-accent hover:bg-constru-accent-hover shadow-lg transition-all"
        >
          <span>Explorar Catálogo de Equipos</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-constru-ink">
      {/* Encabezado */}
      <div className="page-intro flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-constru-ink tracking-tight">
            Tu carrito de cotización
          </h1>
          <p className="text-sm text-constru-muted mt-0.5">
            Tienes <strong className="text-constru-primary">{totalItems}</strong> equipo(s) en tu lista
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-800 self-start sm:self-center"
        >
          <Trash2 className="w-4 h-4" />
          <span>Vaciar Carrito</span>
        </button>
      </div>

      {/* Grid: Lista de Items a la izquierda + Resumen a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LISTADO DE ITEMS (8 COLS) */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const itemSubtotal = item.price * item.quantity;

            return (
              <div
                key={item.productId}
                className="bg-white p-5 rounded-2xl border border-constru-line shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-constru-accent/40"
              >
                {/* Imagen + Info Básica */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-20 h-20 rounded-xl bg-white p-2 border border-constru-line flex items-center justify-center flex-shrink-0">
                    {item.imageUrl ? (
                      <CatalogImage
                        src={item.imageUrl}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-constru-muted" />
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <span className="tabular-nums text-[10.5px] text-constru-muted bg-white border border-constru-line px-2 py-0.5 rounded">
                      SKU: {item.sku}
                    </span>
                    <Link
                      to={`/producto/${item.slug}`}
                      className="block text-sm font-bold text-constru-ink hover:text-constru-primary truncate transition-colors"
                    >
                      {item.name}
                    </Link>
                    <div className="text-xs text-constru-muted">
                      Precio unitario: <strong className="text-constru-primary">{formatColones(item.price)}</strong>
                    </div>
                  </div>
                </div>

                {/* Controles de Cantidad + Subtotal + Eliminar */}
                <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-constru-line">
                  {/* Selector + / - */}
                  <div className="flex items-center border border-constru-line rounded-xl overflow-hidden bg-white shadow-xs">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1.5 px-2.5 text-constru-muted hover:bg-constru-mist font-bold transition-colors"
                      title="Disminuir cantidad"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-bold text-xs text-constru-ink">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1.5 px-2.5 text-constru-muted hover:bg-constru-mist font-bold transition-colors"
                      title="Aumentar cantidad"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal del Item */}
                  <div className="text-right min-w-[100px]">
                    <span className="block text-sm font-bold text-constru-primary">
                      {formatColones(itemSubtotal)}
                    </span>
                  </div>

                  {/* Botón Eliminar */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="p-2 text-constru-muted hover:text-rose-700 hover:bg-constru-mist rounded-lg transition-colors cursor-pointer"
                    title="Eliminar equipo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Enlace para continuar comprando */}
          <div className="pt-2">
            <Link
              to="/productos"
              className="inline-flex items-center gap-2 text-xs font-bold text-constru-primary hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continuar explorando equipos de eficiencia energética</span>
            </Link>
          </div>
        </div>

        {/* RESUMEN COMERCIAL (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-constru-line shadow-md space-y-6">
            <h2 className="text-lg font-bold text-constru-ink pb-3 border-b border-constru-line">
              Resumen del Pedido
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-constru-muted">
                <span>Total de Unidades</span>
                <span className="font-bold text-constru-ink">{totalItems} uds</span>
              </div>
              <div className="flex justify-between text-constru-muted">
                <span>Subtotal Referencial</span>
                <span className="font-bold text-constru-ink">{formatColones(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-constru-muted">
                <span>Impuesto IVA</span>
                <span>Incluido</span>
              </div>

              <div className="pt-3 border-t border-constru-line flex justify-between items-baseline">
                <span className="text-base font-bold text-constru-ink">Total Estimado</span>
                <span className="text-2xl font-bold text-constru-primary">
                  {formatColones(subtotal)}
                </span>
              </div>
            </div>

            {/* Alerta de Precios Backend */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Asesoría y Validación:</strong> Un asesor técnico de ConstruCenter Nicoya verificará la compatibilidad técnica antes del despacho.
              </span>
            </div>

            {/* Botón Proceder al Checkout */}
            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-bold text-base text-constru-primary bg-constru-accent hover:bg-constru-accent-hover shadow-sm transition-all cursor-pointer"
            >
              <span>Proceder a la Cotización</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Tarjeta de Información de Entrega */}
          <div className="bg-white p-5 rounded-2xl border border-constru-line text-xs text-constru-muted space-y-2.5">
            <div className="flex items-center gap-2 text-constru-primary font-bold">
              <Truck className="w-4 h-4" />
              <span>Logística y Entrega en Guanacaste & Nacional</span>
            </div>
            <p className="leading-relaxed text-constru-muted">
              Coordinamos envíos protegidos de paneles, inversores y baterías directamente a tu domicilio o proyecto.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Cart;
