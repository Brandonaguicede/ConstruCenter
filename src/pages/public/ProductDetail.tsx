import { CatalogImage } from '@/components/ui/CatalogImage';
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ShoppingCart,
  WhatsappLogo as MessageCircle,
  Truck,
  ShieldCheck,
  CheckCircle as CheckCircle2,
  Stack as Layers,
  Medal as Award,
  CaretRight as ChevronRight,
  Package,
  Certificate as FileCheck,
  Clock,
  CircleNotch as Loader2,
  Lightning as Zap,
} from '@phosphor-icons/react';
import { publicService } from '@/services/public.service';
import { formatColones } from '@/utils/currency';
import { useCartStore } from '@/store/useCartStore';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  // Cargar detalle del producto por su Slug
  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['public-product-detail', slug],
    queryFn: () => (slug ? publicService.getProductBySlug(slug) : null),
    enabled: Boolean(slug),
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-constru-primary animate-spin" />
        <p className="text-sm font-semibold text-constru-muted">Cargando ficha del producto...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-constru-dark">Producto no encontrado</h2>
        <p className="text-sm text-constru-muted">
          El producto solicitado no existe o fue deshabilitado del catálogo público.
        </p>
        <Link
          to="/productos"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-constru-primary hover:bg-constru-primary-hover transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </Link>
      </div>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'];

  const currentImage = images[selectedImageIndex] || images[0];

  // Enlace dinámico preconstruido para consultar por WhatsApp
  const whatsappMessage = encodeURIComponent(
    `Hola ConstruCenter Nicoya, deseo cotizar o consultar sobre el producto "${product.name}" (SKU: ${product.sku}).`
  );
  const whatsappUrl = `https://wa.me/50685252840?text=${whatsappMessage}`;

  const handleAddToCartClick = () => {
    if (!product) return;
    addItem(product, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-constru-ink">
      {/* Breadcrumb de navegación */}
      <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-xs font-semibold text-constru-muted">
        <Link to="/" className="hover:text-constru-primary transition-colors">
          Inicio
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
        <Link to="/productos" className="hover:text-constru-primary transition-colors">
          Equipos
        </Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <Link
              to={`/productos?categoria=${product.category.slug}`}
              className="hover:text-constru-primary transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
        <span className="text-constru-muted truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Grid Principal: Galería a la izquierda + Ficha de Compra a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* 1. GALERÍA DE IMÁGENES (COLUMNA IZQUIERDA - 7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Imagen Principal en marco oscuro */}
          <div className="relative w-full h-80 sm:h-96 md:h-[480px] bg-white rounded-2xl border border-constru-line flex items-center justify-center p-6 overflow-hidden shadow-md">
            <CatalogImage
              src={currentImage}
              alt={product.name}
              className="max-h-full max-w-full object-contain transition-all duration-300"
            />
            {product.is_featured && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-constru-accent text-constru-primary shadow-sm">
                Equipo Destacado
              </span>
            )}
          </div>

          {/* Carrusel de Miniaturas si hay más de 1 imagen */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative w-20 h-20 rounded-2xl bg-white p-2 border-2 transition-all flex-shrink-0 cursor-pointer ${
                    selectedImageIndex === index
                      ? 'border-constru-accent ring-2 ring-constru-accent/30 scale-105'
                      : 'border-constru-line hover:border-gray-600 opacity-70 hover:opacity-100'
                  }`}
                >
                  <CatalogImage
                    src={img}
                    alt={`${product.name} miniatura ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. INFORMACIÓN COMERCIAL Y COMPRA (COLUMNA DERECHA - 5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            {/* Metadatos Superiores: Marca y Categoría */}
            <div className="flex flex-wrap items-center gap-2">
              {product.brand?.name && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-white text-constru-ink border border-constru-line shadow-xs">
                  <Award className="w-3.5 h-3.5 text-constru-primary" />
                  {product.brand.name}
                </span>
              )}
              {product.category?.name && (
                <Link
                  to={`/productos?categoria=${product.category.slug}`}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-constru-primary text-white border border-constru-accent/30 hover:bg-constru-primary transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  {product.category.name}
                </Link>
              )}
            </div>

            {/* Título Principal */}
            <h1 className="text-2xl sm:text-3xl font-bold text-constru-ink tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* SKU y Disponibilidad */}
            <div className="flex items-center gap-3 text-xs pt-1">
              <span className="tabular-nums text-constru-muted bg-white px-2.5 py-1 rounded-md border border-constru-line">
                SKU: <strong>{product.sku}</strong>
              </span>
              <span className="inline-flex items-center gap-1 text-constru-primary font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Disponible para entrega o instalación
              </span>
            </div>
          </div>

          {/* Bloque de Precio Oficial */}
          <div className="p-5 bg-white rounded-2xl border border-constru-line shadow-md space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-constru-muted">
              Precio al Consumidor
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-constru-primary tracking-tight">
                {formatColones(product.price)}
              </span>
              {!!product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-base text-constru-muted line-through">
                  {formatColones(product.compare_at_price)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-constru-muted">
              Precios con IVA incluido. Consulta opciones de instalación certificada y financiamiento.
            </p>
          </div>

          {/* Selector de Cantidad y Botón de Carrito */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold uppercase tracking-wider text-constru-muted">
                Cantidad:
              </label>
              <div className="flex items-center border border-constru-line rounded-xl overflow-hidden bg-white shadow-xs">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="px-3.5 py-2 text-constru-muted hover:bg-constru-mist font-bold transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-14 text-center font-bold text-sm text-constru-ink bg-transparent focus:outline-none border-x border-constru-line py-2"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="px-3.5 py-2 text-constru-muted hover:bg-constru-mist font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Botón Agregar al Carrito */}
            <button
              type="button"
              onClick={handleAddToCartClick}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-base text-constru-primary bg-constru-accent hover:bg-constru-accent-hover shadow-sm transition-all cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Agregar {quantity} al Carrito de Cotización</span>
            </button>

            {/* Notificación Toast Informativa */}
            {addedToast && (
              <div className="p-3 bg-constru-primary border border-constru-accent/40 rounded-xl text-xs text-white font-bold flex items-center justify-between animate-fadeIn shadow-md">
                <span className="flex items-center gap-1.5 text-white">
                  <CheckCircle2 className="w-4 h-4" />
                  Agregado a tu lista de cotización
                </span>
                <Link
                  to="/carrito"
                  className="text-xs font-bold text-white underline hover:text-white/80"
                >
                  Ver carrito &rarr;
                </Link>
              </div>
            )}

            {/* Botón Consultar por WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl font-bold text-sm text-constru-ink bg-white hover:bg-constru-mist border border-constru-line hover:border-constru-accent/40 transition-colors shadow-xs text-center"
            >
              <MessageCircle className="w-5 h-5 text-constru-primary" />
              <span>Consultar Asesoría por WhatsApp</span>
            </a>
          </div>

          {/* Tarjeta de Garantías y Despacho */}
          <div className="bg-white p-4 rounded-2xl border border-constru-line space-y-2.5 text-xs text-constru-muted">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-constru-primary flex-shrink-0" />
              <span>
                <strong>Cero Apagones:</strong> Sistemas de respaldo continuo y protección contra fluctuaciones.
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <FileCheck className="w-4 h-4 text-constru-primary flex-shrink-0" />
              <span>
                <strong>Factura Electrónica y Garantía:</strong> Cobertura oficial directa de fabricante.
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-constru-primary flex-shrink-0" />
              <span>
                <strong>Ingeniería en Guanacaste:</strong> Asesoría técnica y soporte presencial en Nicoya.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DESCRIPCIÓN EXTENDIDA Y FICHA TÉCNICA */}
      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-constru-line shadow-md space-y-8">
        {/* Descripción */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-constru-ink tracking-tight pb-2 border-b border-constru-line">
            Descripción del Equipo
          </h2>
          <p className="text-constru-muted text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {product.description ||
              'Equipo de alta eficiencia energética certificado para uso residencial, comercial e industrial en Costa Rica.'}
          </p>
        </div>

        {/* Especificaciones Técnicas */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-constru-ink tracking-tight pb-2 border-b border-constru-line">
              Especificaciones Técnicas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(product.specs).map(([key, val]) => (
                <div key={key} className="p-3.5 bg-white rounded-xl border border-constru-line">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-constru-muted">
                    {key}
                  </span>
                  <span className="block text-sm font-extrabold text-constru-primary mt-0.5">
                    {String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ProductDetail;
