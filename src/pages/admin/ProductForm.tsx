import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  FloppyDisk as Save,
  Package,
  Sparkle as Sparkles,
  WarningCircle as AlertCircle,
  CircleNotch as Loader2,
  CurrencyDollar as DollarSign,
  Cube as Boxes,
  Barcode,
  Question as HelpCircle,
} from '@phosphor-icons/react';
import { productService } from '@/services/product.service';
import { taxonomyService } from '@/services/taxonomy.service';
import { productSchema, type ProductFormData } from '@/schemas/product.schema';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { generateSlug } from '@/utils/slug';

export const AdminProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [autoSlugEnabled, setAutoSlugEnabled] = useState(!isEditing);

  // 1. Cargar Taxonomías (Categorías y Marcas)
  const { data: categories = [], isLoading: isLoadingCategories, error: categoriesError } = useQuery({
    queryKey: ['admin-categories-active'],
    queryFn: () => taxonomyService.getCategories(true),
  });

  const { data: brands = [], isLoading: isLoadingBrands, error: brandsError } = useQuery({
    queryKey: ['admin-brands-active'],
    queryFn: () => taxonomyService.getBrands(true),
  });

  // 2. Cargar Producto existente en modo Edición
  const { data: productData, isLoading: isLoadingProduct, error: productError } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => (id ? productService.getProductById(id) : null),
    enabled: isEditing,
  });

  // 3. Configuración de React Hook Form
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: '',
      name: '',
      slug: '',
      description: '',
      price: 0,
      compare_at_price: null,
      cost_price: null,
      stock: 0,
      category_id: '',
      brand_id: '',
      images: [],
      is_active: true,
      is_featured: false,
    },
  });

  const nameValue = watch('name');

  // Sincronizar datos al editar
  useEffect(() => {
    if (productData) {
      reset({
        sku: productData.sku,
        name: productData.name,
        slug: productData.slug,
        description: productData.description || '',
        price: Number(productData.price),
        compare_at_price: productData.compare_at_price ? Number(productData.compare_at_price) : null,
        cost_price: productData.cost_price ? Number(productData.cost_price) : null,
        stock: productData.stock,
        category_id: productData.category_id,
        brand_id: productData.brand_id,
        images: productData.images || [],
        is_active: productData.is_active,
        is_featured: productData.is_featured,
        specs: productData.specs,
      });
      setAutoSlugEnabled(false);
    }
  }, [productData, reset]);

  // Manejo de auto-slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue('name', value, { shouldValidate: true });
    if (autoSlugEnabled) {
      setValue('slug', generateSlug(value), { shouldValidate: true });
    }
  };

  const handleGenerateSku = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const prefix = nameValue ? nameValue.slice(0, 3).toUpperCase() : 'PRD';
    setValue('sku', `${prefix}-${Date.now().toString().slice(-4)}${randomSuffix}`, {
      shouldValidate: true,
    });
  };

  // 4. Mutaciones
  const createMutation = useMutation({
    mutationFn: (data: ProductFormData) => productService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-product'] });
      queryClient.invalidateQueries({ queryKey: ['public-products'] });
      queryClient.invalidateQueries({ queryKey: ['public-product-detail'] });
      queryClient.invalidateQueries({ queryKey: ['admin-combos'] });
      navigate('/admin/products');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProductFormData) => {
      if (!id) throw new Error('ID no provisto');
      return productService.updateProduct(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-product'] });
      queryClient.invalidateQueries({ queryKey: ['public-products'] });
      queryClient.invalidateQueries({ queryKey: ['public-product-detail'] });
      queryClient.invalidateQueries({ queryKey: ['admin-combos'] });
      navigate('/admin/products');
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const mutationError = (createMutation.error || updateMutation.error) as Error | null;

  const onSubmit = (data: ProductFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (productError) return <div role="alert" className="rounded-xl bg-red-50 p-6 text-red-800"><p>No se pudo cargar el producto: {productError.message}</p><Link to="/admin/products" className="mt-3 inline-block underline">Volver a productos</Link></div>;

  if (isEditing && isLoadingProduct) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-9 h-9 text-constru-primary animate-spin" />
        <p className="text-sm font-semibold text-gray-500">Cargando información del producto...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Navegación */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/products"
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-constru-accent" />
              <h1 className="text-xl font-black text-constru-dark tracking-tight">
                {isEditing ? 'Editar Producto' : 'Crear Nuevo Producto'}
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Configura los valores de venta, inventario y especificaciones técnicas
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={isSaving || isLoadingCategories || isLoadingBrands || Boolean(categoriesError || brandsError) || !categories.length || !brands.length}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-constru-primary hover:bg-constru-primary-hover text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4 text-constru-accent" />
          )}
          <span>{isEditing ? 'Guardar Cambios' : 'Registrar Producto'}</span>
        </button>
      </div>

      {/* Alerta de Error de Mutación */}
      {mutationError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">No fue posible guardar el producto</p>
            <p className="text-xs mt-0.5">{mutationError.message}</p>
          </div>
        </div>
      )}

      {(categoriesError || brandsError) && <p role="alert" className="p-4 rounded-xl bg-red-50 text-red-800">No se pudo cargar la clasificación: {categoriesError?.message || brandsError?.message}</p>}
      {(!isLoadingCategories && !categories.length || !isLoadingBrands && !brands.length) && <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900"><p>Para crear un producto necesitas una categoría y una marca activas.</p><div className="mt-3 flex gap-5"><Link className="underline" to="/admin/categories">Crear categoría</Link><Link className="underline" to="/admin/brands">Crear marca</Link></div></div>}
      {/* Formulario Principal */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda: Información Básica y Precios (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card: Información General */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-constru-dark pb-2 border-b border-gray-100 flex items-center gap-2">
                <Package className="w-4 h-4 text-constru-primary" />
                Información Principal
              </h2>

              {/* Nombre */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Nombre Comercial del Producto *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Panel Solar Monocristalino 450W, Batería de Litio 5kWh"
                  {...register('name')}
                  onChange={handleNameChange}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.name ? 'border-red-400' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-constru-primary`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500 font-semibold">{errors.name.message}</p>
                )}
              </div>

              {/* SKU & Slug en dos columnas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* SKU */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                      Código SKU *
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateSku}
                      className="text-[11px] text-constru-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Barcode className="w-3 h-3 text-constru-accent" />
                      Auto-generar SKU
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="PAN-450W-MONO"
                    {...register('sku')}
                    className={`w-full px-3.5 py-2 text-sm rounded-xl border font-mono uppercase ${
                      errors.sku ? 'border-red-400' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-constru-primary`}
                  />
                  {errors.sku && (
                    <p className="mt-1 text-xs text-red-500 font-semibold">{errors.sku.message}</p>
                  )}
                </div>

                {/* Slug */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                      Slug URL *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setAutoSlugEnabled(!autoSlugEnabled);
                        if (!autoSlugEnabled && nameValue) {
                          setValue('slug', generateSlug(nameValue), { shouldValidate: true });
                        }
                      }}
                      className="text-[11px] text-constru-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-constru-accent" />
                      {autoSlugEnabled ? 'Auto-slug activo' : 'Manual'}
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="panel-solar-monocristalino-450w"
                    {...register('slug')}
                    className={`w-full px-3.5 py-2 text-sm rounded-xl border font-mono ${
                      errors.slug ? 'border-red-400' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-constru-primary`}
                  />
                  {errors.slug && (
                    <p className="mt-1 text-xs text-red-500 font-semibold">{errors.slug.message}</p>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Descripción Comercial y Ficha Técnica
                </label>
                <textarea
                  rows={4}
                  placeholder="Detalles técnicos, potencia, capacidad, eficiencia, garantía, condiciones de instalación..."
                  {...register('description')}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-constru-primary"
                />
              </div>
            </div>

            {/* Card: Precios e Inventario */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 space-y-4">
              <div className="pb-2 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-constru-dark flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-constru-primary" />
                  Estructura Comercial de Precios
                </h2>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Precios verificados en Backend
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Precio de Venta Real */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Precio de venta (CRC) *
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 font-bold text-sm">
                      ₡
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="285.50"
                      {...register('price', { valueAsNumber: true })}
                      className={`w-full pl-8 pr-3 py-2 text-sm font-bold rounded-xl border ${
                        errors.price ? 'border-red-400' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-constru-primary`}
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-xs text-red-500 font-semibold">{errors.price.message}</p>
                  )}
                </div>

                {/* Precio Comparación */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Precio Anterior / Lista
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 font-bold text-sm">
                      ₡
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="320.00"
                      {...register('compare_at_price', {
                        setValueAs: (v) => (v === '' || isNaN(v) ? null : Number(v)),
                      })}
                      className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-constru-primary"
                    />
                  </div>
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Stock Disponible *
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <Boxes className="w-4 h-4" />
                    </span>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      placeholder="50"
                      {...register('stock', { valueAsNumber: true })}
                      className={`w-full pl-9 pr-3 py-2 text-sm font-bold rounded-xl border ${
                        errors.stock ? 'border-red-400' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-constru-primary`}
                    />
                  </div>
                  {errors.stock && (
                    <p className="mt-1 text-xs text-red-500 font-semibold">{errors.stock.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Multimedia y Relaciones (1 col) */}
          <div className="space-y-6">
            {/* Card: Fotografía (Cloudflare R2) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-constru-dark pb-2 border-b border-gray-100">
                Imagen Principal
              </h2>

              <Controller
                control={control}
                name="images"
                render={({ field }) => (
                  <ImageUpload
                    value={field.value && field.value.length > 0 ? field.value[0] : ''}
                    onChange={(url) => {
                      field.onChange(url ? [url, ...(field.value ?? []).slice(1)] : (field.value ?? []).slice(1));
                    }}
                    label="Subir fotografía"
                    error={errors.images?.message}
                  />
                )}
              />
              <label className="block text-sm font-medium">O pega una URL de imagen
                <input type="url" className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" placeholder="https://..." value={watch('images')?.[0] ?? ''} onChange={event => setValue('images', event.target.value ? [event.target.value, ...(watch('images') ?? []).slice(1)] : [], { shouldValidate: true })} />
              </label>
              {errors.images && <p role="alert" className="text-xs text-red-700">Usa una URL de imagen HTTP o HTTPS válida.</p>}
            </div>

            {/* Card: Clasificación (Categoría y Marca) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-constru-dark pb-2 border-b border-gray-100">
                Clasificación Comercial
              </h2>

              {/* Select Categoría */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Categoría *
                </label>
                <select
                  {...register('category_id')}
                  disabled={isLoadingCategories}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.category_id ? 'border-red-400' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-constru-primary bg-white`}
                >
                  <option value="">-- Seleccionar Categoría --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="mt-1 text-xs text-red-500 font-semibold">{errors.category_id.message}</p>
                )}
              </div>

              {/* Select Marca */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Marca / Fabricante *
                </label>
                <select
                  {...register('brand_id')}
                  disabled={isLoadingBrands}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.brand_id ? 'border-red-400' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-constru-primary bg-white`}
                >
                  <option value="">-- Seleccionar Marca --</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                {errors.brand_id && (
                  <p className="mt-1 text-xs text-red-500 font-semibold">{errors.brand_id.message}</p>
                )}
              </div>
            </div>

            {/* Card: Visibilidad y Estados */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-constru-dark pb-2 border-b border-gray-100">
                Estado y Visibilidad
              </h2>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_active_prod"
                    {...register('is_active')}
                    className="w-4 h-4 text-constru-primary rounded-sm border-gray-300 focus:ring-constru-accent accent-constru-primary cursor-pointer"
                  />
                  <label htmlFor="is_active_prod" className="text-sm font-semibold text-gray-700 cursor-pointer">
                    Producto Activo (Visible en tienda)
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_featured_prod"
                    {...register('is_featured')}
                    className="w-4 h-4 text-constru-primary rounded-sm border-gray-300 focus:ring-constru-accent accent-constru-primary cursor-pointer"
                  />
                  <label htmlFor="is_featured_prod" className="text-sm font-semibold text-gray-700 cursor-pointer">
                    Destacado en Portada
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Barra de Botones */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200/80 flex items-center justify-end gap-4">
          <Link
            to="/admin/products"
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-constru-primary hover:bg-constru-primary-hover text-white rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-60 cursor-pointer"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isEditing ? 'Guardar Cambios' : 'Registrar Producto'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
export default AdminProductForm;
