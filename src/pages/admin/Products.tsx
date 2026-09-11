import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  MagnifyingGlass as Search,
  PencilSimple as Edit2,
  Trash as Trash2,
  CheckCircle as CheckCircle2,
  XCircle,
  Star,
  WarningCircle as AlertCircle,
  CircleNotch as Loader2,
  Funnel as Filter,
  Stack as Layers,
  Medal as Award,
} from '@phosphor-icons/react';
import { productService, type ProductFilters } from '@/services/product.service';
import { taxonomyService } from '@/services/taxonomy.service';

export const AdminProducts: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // 1. Cargar Categorías y Marcas para filtros
  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => taxonomyService.getCategories(),
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: () => taxonomyService.getBrands(),
  });

  // 2. Cargar Productos con filtros
  const filters: ProductFilters = {
    searchTerm: searchTerm || undefined,
    categoryId: selectedCategory || undefined,
    brandId: selectedBrand || undefined,
  };

  const {
    data: products = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['admin-products', filters],
    queryFn: () => productService.getProducts(filters),
  });

  // 3. Mutación de Eliminación
  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['public-products'] });
      queryClient.invalidateQueries({ queryKey: ['public-product-detail'] });
      setDeleteConfirmId(null);
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-green-50 rounded-xl">
              <Package className="w-6 h-6 text-constru-primary" />
            </div>
            <h1 className="text-2xl font-black text-constru-dark tracking-tight">Catálogo de Productos</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Administra precios reales de backend, SKUs, inventario y relaciones comerciales
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-constru-primary hover:bg-constru-primary-hover text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-constru-accent" />
          <span>Nuevo Producto</span>
        </Link>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200/80 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por SKU, nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-constru-primary focus:border-constru-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Filtro Categoría */}
          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-300 text-xs">
            <Layers className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-gray-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="">Todas las Categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Marca */}
          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-300 text-xs">
            <Award className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-transparent text-gray-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="">Todas las Marcas</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {(searchTerm || selectedCategory || selectedBrand) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedBrand('');
              }}
              className="text-xs text-red-600 font-bold hover:underline px-2 py-1"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-9 h-9 text-constru-primary animate-spin" />
            <p className="text-sm font-semibold text-gray-500">Cargando catálogo de productos...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <p className="text-base font-bold text-gray-800">Error al cargar productos</p>
            <p className="text-sm text-gray-500 mt-1">{(error as Error)?.message}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
              <Package className="w-7 h-7" />
            </div>
            <p className="text-lg font-bold text-constru-dark">No hay productos registrados</p>
            <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
              {searchTerm || selectedCategory || selectedBrand
                ? 'Ningún producto coincide con los filtros aplicados.'
                : 'Comienza agregando los productos de tu ferretería o distribuidora.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/75 text-xs font-bold uppercase tracking-wider text-gray-600">
                  <th className="py-3.5 px-6">Producto / SKU</th>
                  <th className="py-3.5 px-6">Clasificación</th>
                  <th className="py-3.5 px-6 text-right">Precio Real</th>
                  <th className="py-3.5 px-6 text-center">Inventario</th>
                  <th className="py-3.5 px-6 text-center">Estado</th>
                  <th className="py-3.5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {products.map((prod) => {
                  const mainImage = prod.images && prod.images.length > 0 ? prod.images[0] : null;

                  return (
                    <tr key={prod.id} className="hover:bg-green-50/25 transition-colors">
                      {/* Producto / SKU */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          {mainImage ? (
                            <img
                              src={mainImage}
                              alt={prod.name}
                              className="w-12 h-12 rounded-xl object-contain bg-white border border-gray-200 p-1 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-constru-dark truncate max-w-xs block">
                                {prod.name}
                              </span>
                              {prod.is_featured && (
                                <span
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800"
                                  title="Producto Destacado"
                                >
                                  <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-0.5" />
                                  Destacado
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                SKU: {prod.sku}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Clasificación (Categoría & Marca) */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700">
                            <Layers className="w-3 h-3 text-constru-primary" />
                            {prod.category?.name || 'Sin categoría'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <Award className="w-3 h-3 text-constru-accent" />
                            {prod.brand?.name || 'Sin marca'}
                          </span>
                        </div>
                      </td>

                      {/* Precio */}
                      <td className="py-4 px-6 text-right">
                        <div className="font-black text-constru-dark text-base">
                          {formatPrice(prod.price)}
                        </div>
                        {!!prod.compare_at_price && prod.compare_at_price > prod.price && (
                          <div className="text-xs text-gray-400 line-through">
                            {formatPrice(prod.compare_at_price)}
                          </div>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-4 px-6 text-center">
                        {prod.stock > 10 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                            {prod.stock} uds
                          </span>
                        ) : prod.stock > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                            {prod.stock} uds
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                            Agotado
                          </span>
                        )}
                      </td>

                      {/* Estado Activo */}
                      <td className="py-4 px-6 text-center">
                        {prod.is_active ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-constru-accent" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-400">
                            <XCircle className="w-3.5 h-3.5 text-gray-400" />
                            Inactivo
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => navigate(`/admin/products/${prod.id}/edit`)}
                          className="p-1.5 text-gray-500 hover:text-constru-primary hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          title="Editar producto"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(prod.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Confirmación de Eliminación */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-scaleUp">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">¿Eliminar producto?</h3>
            <p className="text-xs text-gray-500 mt-2">
              Esta acción no se puede deshacer. El producto será removido del catálogo comercial.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirmId)}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-md transition-all cursor-pointer"
              >
                {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminProducts;
