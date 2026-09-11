import { CatalogImage } from '@/components/ui/CatalogImage';
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CaretRight as ChevronRight, FileText, WhatsappLogo as MessageCircle, Medal as Award, CircleNotch as Loader2 } from '@phosphor-icons/react';
import { publicService } from '@/services/public.service';
import { settingsService } from '@/services/settings.service';

function formatFileSize(bytes?: number | null): string {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

export const PdfCatalogs: React.FC = () => {
  const { data: settings } = useQuery({
    queryKey: ['store-settings'],
    queryFn: () => settingsService.getSettings(),
  });
  const adminPhone = settings?.whatsapp_number || '50685252840';

  const {
    data: catalogs = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['public-catalogs'],
    queryFn: () => publicService.getActiveCatalogs(),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb y Encabezado */}
      <div className="page-intro space-y-4">
        <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-xs font-semibold text-constru-muted">
          <Link to="/" className="hover:text-constru-primary transition-colors">
            Inicio
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-constru-primary">Catálogos PDF</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-constru-ink tracking-tight">
          Catálogos y Fichas Técnicas
        </h1>
        <p className="text-sm text-constru-muted mt-1">
          Descarga los catálogos de nuestras marcas: paneles solares, baterías, inversores híbridos, generadores y smart home.
        </p>
      </div>

      {isLoading ? (
        <div className="p-20 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-constru-line">
          <Loader2 className="w-9 h-9 text-constru-primary animate-spin" />
          <p className="text-sm font-semibold text-constru-muted">Cargando catálogos...</p>
        </div>
      ) : isError ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-constru-line">
          <p className="text-base font-bold text-rose-700">Error al consultar los catálogos</p>
          <p className="text-xs text-constru-muted mt-1">Por favor reintenta en unos instantes.</p>
        </div>
      ) : catalogs.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-constru-line space-y-4">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto text-constru-muted">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-constru-ink">Estamos preparando nuestros catálogos</h3>
            <p className="text-xs text-constru-muted max-w-sm mx-auto mt-1">
              Consúltanos por WhatsApp y te enviamos la ficha técnica que necesites.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {catalogs.map((cat) => (
            <article key={cat.id} className="group bg-white rounded-2xl border border-constru-line shadow-md hover:border-constru-accent/60 hover:-translate-y-0.5 transition-all duration-300 flex flex-col overflow-hidden">
              <a
                href={cat.file_url}
                target="_blank"
                rel="noreferrer"
                className="relative block w-full h-44 bg-constru-mist overflow-hidden"
              >
                {cat.cover_image_url ? (
                  <CatalogImage
                    src={cat.cover_image_url}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-constru-muted">
                    <FileText className="w-10 h-10" />
                  </div>
                )}
                {cat.brand?.name && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-white text-constru-ink shadow-sm border border-constru-line">
                      <Award className="w-3 h-3 text-constru-primary" />
                      {cat.brand.name}
                    </span>
                  </div>
                )}
              </a>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-constru-ink leading-snug line-clamp-2">
                    {cat.title}
                  </h3>
                  {!!cat.file_size_bytes && (
                    <p className="mt-1.5 text-xs text-constru-muted tabular-nums">{formatFileSize(cat.file_size_bytes)}</p>
                  )}
                </div>

                <div className="pt-4 mt-3 border-t border-constru-line grid grid-cols-2 gap-2">
                  <a
                    href={cat.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-constru-primary hover:bg-constru-primary-hover border border-constru-accent/40 hover:border-constru-accent transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-constru-primary" />
                    <span>Ver o Descargar PDF</span>
                  </a>
                  <a
                    href={`https://wa.me/${adminPhone}?text=${encodeURIComponent(`Hola ConstruCenter, deseo consultar sobre el catálogo: ${cat.title}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-constru-ink bg-constru-mist hover:bg-constru-mist border border-constru-line transition-colors cursor-pointer"
                  >
                    <MessageCircle weight="fill" className="w-3.5 h-3.5 text-constru-primary" />
                    <span>Consultar</span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
export default PdfCatalogs;
