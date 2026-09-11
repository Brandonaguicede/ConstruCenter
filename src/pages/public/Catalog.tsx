import { Modal } from '@/components/ui/Modal';
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MagnifyingGlass as Search,
  Funnel as Filter,
  Stack as Layers,
  X,
  Package,
  CircleNotch as Loader2,
  SlidersHorizontal,
  CaretRight as ChevronRight,
  Sparkle as Sparkles,
} from '@phosphor-icons/react';
import { publicService } from '@/services/public.service';
import { ProductCard } from '@/components/ui/ProductCard';

export const Catalog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('categoria') || '';
  const initialSearch = searchParams.get('q') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchTerm, setSearchTerm] = useState<string>(initialSearch);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sincronizar estado local con query params de la URL
  useEffect(() => {
    setSelectedCategory(searchParams.get('categoria') || '');
    setSearchTerm(searchParams.get('q') || '');
  }, [searchParams]);

  // Actualizar URL al cambiar filtros
  const handleCategorySelect = (slug: string) => {
    const nextCategory = selectedCategory === slug ? '' : slug;
    setSelectedCategory(nextCategory);

    const newParams = new URLSearchParams(searchParams);
    if (nextCategory) {
      newParams.set('categoria', nextCategory);
    } else {
      newParams.delete('categoria');
    }
    setSearchParams(newParams);
    setMobileFiltersOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    const newParams = new URLSearchParams(searchParams);
    if (value.trim()) {
      newParams.set('q', value.trim());
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSearchTerm('');
    setSearchParams(new URLSearchParams());
  };

  // 1. Cargar Categorías para el sidebar de filtros
  const { data: categories = [] } = useQuery({
    queryKey: ['public-categories'],
    queryFn: () => publicService.getActiveCategories(),
  });

  // 2. Cargar Productos con los filtros actuales
  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['public-products', selectedCategory, searchTerm],
    queryFn: () =>
      publicService.getActiveProducts({
        categorySlug: selectedCategory || undefined,
        searchTerm: searchTerm || undefined,
      }),
  });

  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb y Encabezado */}
      <div className="page-intro space-y-4">
        <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-xs font-semibold text-constru-muted">
          <Link to="/" className="hover:text-constru-primary transition-colors">
            Inicio
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-constru-primary">Productos</span>
          {activeCategoryObj && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-constru-ink font-bold">{activeCategoryObj.name}</span>
            </>
          )}
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-constru-ink tracking-tight">
              {activeCategoryObj ? activeCategoryObj.name : 'Productos'}
            </h1>
            <p className="text-sm text-constru-muted mt-1">
              {activeCategoryObj?.description ||
                'Paneles Solares, Baterías LiFePO4, Inversores Híbridos, Smart Home y Acabados Eléctricos de Lujo.'}
            </p>
          </div>

          {/* Botón Filtros en Mobile */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-white border border-constru-line text-constru-ink shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-constru-primary" />
            <span>Filtros {selectedCategory ? '(1)' : ''}</span>
          </button>
        </div>
      </div>

      {/* Contenedor Principal: Sidebar + Grilla */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* SIDEBAR DE FILTROS (DESKTOP) */}
        <aside className="catalog-filters hidden lg:block bg-white p-6 rounded-2xl border border-constru-line space-y-6 sticky top-28">
          {/* Barra de Búsqueda */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-constru-muted mb-2">
              Buscar equipo o SKU
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-constru-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                aria-label="Buscar equipo o SKU"
                placeholder="Panel, inversor, batería…"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-constru-line rounded-xl text-constru-ink placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-constru-accent focus:border-constru-accent"
              />
            </div>
          </div>

          {/* Filtro por Categorías */}
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-constru-line">
              <span className="text-xs font-bold uppercase tracking-wider text-constru-muted flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-constru-primary" />
                Categorías
              </span>
              {selectedCategory && (
                <button
                  onClick={() => handleCategorySelect(selectedCategory)}
                  className="text-[11px] text-rose-700 font-bold hover:underline"
                >
                  Limpiar
                </button>
              )}
            </div>

            <ul className="space-y-1 text-sm">
              <li>
                <button
                  onClick={() => handleCategorySelect('')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-between ${
                    !selectedCategory
                      ? 'bg-constru-primary text-white font-bold border border-constru-accent/30'
                      : 'text-constru-muted hover:bg-constru-mist'
                  }`}
                >
                  <span>Todas las Categorías</span>
                </button>
              </li>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.slug;
                return (
                  <li key={cat.id}>
                    <button
                      onClick={() => handleCategorySelect(cat.slug)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-constru-primary text-white font-bold border border-constru-accent/30'
                          : 'text-constru-muted hover:bg-constru-mist'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {isSelected && <span className="text-xs text-white font-bold">&bull;</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* MODAL DE FILTROS PARA MOBILE */}
        {mobileFiltersOpen && (
          <Modal titleId="filters-title" onClose={() => setMobileFiltersOpen(false)}>
            <div className="bg-white border border-constru-line rounded-t-3xl sm:rounded-3xl w-full p-6 space-y-6 max-h-[85vh] overflow-y-auto animate-slideUp text-constru-ink">
              <div className="flex items-center justify-between pb-3 border-b border-constru-line">
                <h3 id="filters-title" className="text-lg font-bold text-constru-ink flex items-center gap-2">
                  <Filter className="w-5 h-5 text-constru-primary" />
                  Filtrar Equipos
                </h3>
                <button
                  aria-label="Cerrar filtros"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1.5 rounded-lg text-constru-muted hover:bg-constru-mist"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Búsqueda en Mobile */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-constru-muted mb-2">
                  Búsqueda por texto o SKU
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-constru-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    aria-label="Buscar equipo o SKU"
                    placeholder="Panel, inversor, batería…"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-constru-mist border border-constru-line text-constru-ink rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Categorías en Mobile */}
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-constru-muted mb-2">
                  Seleccionar Categoría
                </span>
                <div className="space-y-1.5">
                  <button
                    onClick={() => handleCategorySelect('')}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
                      !selectedCategory ? 'bg-constru-primary text-white font-bold border border-constru-accent/30' : 'bg-constru-mist text-constru-muted'
                    }`}
                  >
                    Todas las Categorías
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.slug)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
                        selectedCategory === cat.slug
                          ? 'bg-constru-primary text-white font-bold border border-constru-accent/30'
                          : 'bg-constru-mist text-constru-muted'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-constru-line flex items-center gap-3">
                <button
                  onClick={handleClearFilters}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-constru-muted bg-constru-mist hover:bg-constru-mist"
                >
                  Limpiar
                </button>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-constru-primary bg-constru-accent hover:bg-constru-accent-hover"
                >
                  Ver Resultados
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* CONTENEDOR DE PRODUCTOS (GRILLA) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Barra de Estado y Conteo */}
          <div className="bg-white px-5 py-3 rounded-2xl border border-constru-line flex flex-wrap items-center justify-between gap-3 text-xs text-constru-muted">
            <div>
              Mostrando <strong className="text-constru-primary">{products.length}</strong> equipos
              {selectedCategory && (
                <span>
                  {' '}
                  en <strong className="text-constru-ink">{activeCategoryObj?.name}</strong>
                </span>
              )}
              {searchTerm && (
                <span>
                  {' '}
                  para "<strong className="text-constru-ink">{searchTerm}</strong>"
                </span>
              )}
            </div>

            {(selectedCategory || searchTerm) && (
              <div className="flex items-center gap-2">
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-constru-primary text-white border border-constru-accent/30 font-semibold">
                    {activeCategoryObj?.name}
                    <button
                      onClick={() => handleCategorySelect(selectedCategory)}
                      className="hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-constru-mist text-constru-muted border border-constru-line font-semibold">
                    "{searchTerm}"
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        const newParams = new URLSearchParams(searchParams);
                        newParams.delete('q');
                        setSearchParams(newParams);
                      }}
                      className="hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Grilla o Estado de Carga */}
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-constru-line">
              <Loader2 className="w-9 h-9 text-constru-primary animate-spin" />
              <p className="text-sm font-semibold text-constru-muted">Cargando catálogo de equipos...</p>
            </div>
          ) : isError ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-constru-line">
              <p className="text-base font-bold text-rose-700">Error al consultar los equipos</p>
              <p className="text-xs text-constru-muted mt-1">Por favor reintenta en unos instantes.</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-2xl border border-constru-line space-y-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto text-constru-muted">
                <Package className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-constru-ink">
                  No se encontraron equipos coincidentes
                </h3>
                <p className="text-xs text-constru-muted max-w-sm mx-auto mt-1">
                  Intenta cambiar los términos de búsqueda o seleccionar otra categoría de eficiencia energética.
                </p>
              </div>
              <button
                onClick={handleClearFilters}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-constru-primary bg-constru-accent hover:bg-constru-accent-hover transition-colors inline-flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mostrar todos los equipos</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Catalog;
