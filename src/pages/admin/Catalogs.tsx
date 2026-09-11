import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FileText,
  Plus,
  MagnifyingGlass as Search,
  PencilSimple as Edit2,
  Trash as Trash2,
  CheckCircle as CheckCircle2,
  XCircle,
  X,
  WarningCircle as AlertCircle,
  CircleNotch as Loader2,
} from '@phosphor-icons/react';
import { catalogService } from '@/services/catalog.service';
import { taxonomyService } from '@/services/taxonomy.service';
import { catalogSchema, type CatalogFormData } from '@/schemas/catalog.schema';
import { PdfUpload } from '@/components/ui/PdfUpload';
import { ImageUpload } from '@/components/ui/ImageUpload';
import type { CatalogPDF } from '@/types/models';

function formatFileSize(bytes?: number | null): string {
  if (!bytes) return '—';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

export const AdminCatalogs: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState<CatalogPDF | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const {
    data: catalogs = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['admin-catalogs'],
    queryFn: () => catalogService.getCatalogs(),
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['admin-brands-active'],
    queryFn: () => taxonomyService.getBrands(true),
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CatalogFormData>({
    resolver: zodResolver(catalogSchema),
    defaultValues: {
      title: '',
      file_url: '',
      cover_image_url: '',
      brand_id: '',
      file_size_bytes: null,
      is_active: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CatalogFormData) => catalogService.createCatalog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-catalogs'] });
      queryClient.invalidateQueries({ queryKey: ['public-catalogs'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CatalogFormData }) =>
      catalogService.updateCatalog(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-catalogs'] });
      queryClient.invalidateQueries({ queryKey: ['public-catalogs'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogService.deleteCatalog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-catalogs'] });
      queryClient.invalidateQueries({ queryKey: ['public-catalogs'] });
      setDeleteConfirmId(null);
    },
  });

  const openCreateModal = () => {
    setEditingCatalog(null);
    reset({
      title: '',
      file_url: '',
      cover_image_url: '',
      brand_id: '',
      file_size_bytes: null,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CatalogPDF) => {
    setEditingCatalog(cat);
    reset({
      title: cat.title,
      file_url: cat.file_url,
      cover_image_url: cat.cover_image_url || '',
      brand_id: cat.brand_id || '',
      file_size_bytes: cat.file_size_bytes ?? null,
      is_active: cat.is_active,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCatalog(null);
    reset();
  };

  const onSubmit = (formData: CatalogFormData) => {
    if (editingCatalog) {
      updateMutation.mutate({ id: editingCatalog.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredCatalogs = catalogs.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.brand?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-green-50 rounded-xl">
              <FileText className="w-6 h-6 text-constru-primary" />
            </div>
            <h1 className="text-2xl font-black text-constru-dark tracking-tight">Catálogos PDF</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Sube y actualiza las fichas técnicas y catálogos por marca o familia de productos
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-constru-primary hover:bg-constru-primary-hover text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-constru-accent" />
          <span>Nuevo Catálogo</span>
        </button>
      </div>

      {/* Barra de Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar catálogo por título o marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-constru-primary focus:border-constru-primary shadow-sm"
          />
        </div>
        <div className="text-xs font-semibold text-gray-500 bg-white px-3.5 py-2 rounded-xl border border-gray-200">
          Total: <span className="text-constru-primary font-bold">{catalogs.length}</span> catálogos
        </div>
      </div>

      {/* Tabla de Listado */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-constru-primary animate-spin" />
            <p className="text-sm font-semibold text-gray-500">Cargando catálogos...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <p className="text-base font-bold text-gray-800">Error al cargar datos</p>
            <p className="text-sm text-gray-500 mt-1">{(error as Error)?.message}</p>
          </div>
        ) : filteredCatalogs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-base font-bold text-constru-dark">No se encontraron catálogos</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm ? 'Prueba con otros términos de búsqueda.' : 'Sube tu primer catálogo usando el botón superior.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/75 text-xs font-bold uppercase tracking-wider text-gray-600">
                  <th className="py-3.5 px-6">Catálogo</th>
                  <th className="py-3.5 px-6">Marca / Familia</th>
                  <th className="py-3.5 px-6">Tamaño</th>
                  <th className="py-3.5 px-6 text-center">Estado</th>
                  <th className="py-3.5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredCatalogs.map((cat) => (
                  <tr key={cat.id} className="hover:bg-green-50/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-constru-dark">
                      <div className="flex items-center gap-3">
                        {cat.cover_image_url ? (
                          <img
                            src={cat.cover_image_url}
                            alt={cat.title}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                            <FileText className="w-4 h-4" />
                          </div>
                        )}
                        <a href={cat.file_url} target="_blank" rel="noreferrer" className="hover:text-constru-primary hover:underline underline-offset-2 max-w-xs truncate">
                          {cat.title}
                        </a>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-500">
                      {cat.brand?.name || '—'}
                    </td>
                    <td className="py-4 px-6 text-gray-500 font-mono text-xs">
                      {formatFileSize(cat.file_size_bytes)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {cat.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-constru-accent" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                          <XCircle className="w-3.5 h-3.5 text-gray-400" />
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 text-gray-500 hover:text-constru-primary hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        title="Editar catálogo"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(cat.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar catálogo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden animate-fadeIn my-8">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-constru-primary text-white">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-constru-accent" />
                <h3 className="text-lg font-black">
                  {editingCatalog ? 'Editar Catálogo' : 'Nuevo Catálogo'}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {(createMutation.isError || updateMutation.isError) && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                  {((createMutation.error || updateMutation.error) as Error)?.message}
                </div>
              )}

              {/* Título */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Título del Catálogo *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Catálogo de Baterías LiFePO4 2026"
                  {...register('title')}
                  className={`w-full px-3.5 py-2 text-sm rounded-xl border ${
                    errors.title ? 'border-red-400' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-constru-primary`}
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-500 font-semibold">{errors.title.message}</p>
                )}
              </div>

              {/* Marca / Familia */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Marca / Familia (Opcional)
                </label>
                <select
                  {...register('brand_id')}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-constru-primary bg-white"
                >
                  <option value="">-- Sin marca específica --</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* PDF */}
              <div>
                <Controller
                  control={control}
                  name="file_url"
                  render={({ field }) => (
                    <PdfUpload
                      value={field.value}
                      onChange={(url, sizeBytes) => {
                        field.onChange(url);
                        setValue('file_size_bytes', sizeBytes ?? null);
                      }}
                      error={errors.file_url?.message}
                    />
                  )}
                />
                <label className="block text-sm font-medium mt-2">O pega una URL de PDF
                  <input
                    type="url"
                    className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    placeholder="https://..."
                    {...register('file_url')}
                  />
                </label>
              </div>

              {/* Portada */}
              <div>
                <Controller
                  control={control}
                  name="cover_image_url"
                  render={({ field }) => (
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      label="Imagen de Portada (Opcional)"
                      error={errors.cover_image_url?.message}
                    />
                  )}
                />
              </div>

              {/* Estado Activo */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  {...register('is_active')}
                  className="w-4 h-4 text-constru-primary rounded-sm border-gray-300 focus:ring-constru-accent accent-constru-primary"
                />
                <label htmlFor="is_active" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  Catálogo Activo (Visible en /catalogos)
                </label>
              </div>

              {/* Botones de Acción */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-constru-primary hover:bg-constru-primary-hover text-white shadow-md transition-all disabled:opacity-60 cursor-pointer"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingCatalog ? 'Guardar Cambios' : 'Crear Catálogo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación para Eliminar */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-scaleUp">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">¿Eliminar catálogo?</h3>
            <p className="text-xs text-gray-500 mt-2">
              Esta acción no se puede deshacer. El catálogo dejará de mostrarse en la tienda.
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
export default AdminCatalogs;
