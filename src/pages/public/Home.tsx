import { CatalogImage } from '@/components/ui/CatalogImage';
import './Home.css';
import { Modal } from '@/components/ui/Modal';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  CaretLeft as ChevronLeft,
  CaretRight as ChevronRight,
  CheckCircle as CheckCircle2,
  Sun,
  Lightning as Zap,
  Lightbulb,
  Leaf,
  Users,
  Plug,
  X,
  Cube as Boxes,
  MapPin,
  Phone,
  WhatsappLogo,
  EnvelopeSimple,
  ShieldCheck,
  Truck,
  Leaf as SproutIcon,
} from '@phosphor-icons/react';
import { comboService, type EnergyCombo } from '@/services/combo.service';
import { publicService } from '@/services/public.service';
import { formatColones } from '@/utils/currency';
import type { GalleryImage } from '@/types/models';
import energyImage from '@/img/9ff5e69d-1517-42ec-aa2f-cd8ab0d34d96.png';

const whatsapp = (message: string) => `https://wa.me/50685252840?text=${encodeURIComponent(message)}`;
const contactUrl = whatsapp('Hola ConstruCenter, deseo asesoría en equipos de eficiencia energética.');
const CATEGORY_ICONS: Record<string, typeof Sun> = {
  'paneles-solares': Sun,
  'inversores-y-baterias': Zap,
  'smart-home': Lightbulb,
  'acabados-electricos': Plug,
};
const getCategoryIcon = (slug: string) => CATEGORY_ICONS[slug] ?? Boxes;

export const Home = () => {
  const {
    data: categories = [],
    isPending: categoriesPending,
    isError: categoriesError,
    isFetching: categoriesFetching,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ['public-categories'],
    queryFn: publicService.getActiveCategories,
    retry: 1,
  });
  const { data: combos = [], isPending, isError, isFetching, refetch } = useQuery({
    queryKey: ['energy-combos'],
    queryFn: comboService.getActiveCombos,
    retry: 1,
  });
  const {
    data: galleryImages = [],
    isPending: galleryPending,
    isError: galleryError,
    isFetching: galleryFetching,
    refetch: refetchGallery,
  } = useQuery({
    queryKey: ['public-gallery'],
    queryFn: publicService.getActiveGalleryImages,
    retry: 1,
  });
  const [activeCombo, setActiveCombo] = useState<EnergyCombo | null>(null);
  const [activeGalleryImage, setActiveGalleryImage] = useState<GalleryImage | null>(null);
  const categoryTrackRef = useRef<HTMLDivElement>(null);
  const comboTrackRef = useRef<HTMLDivElement>(null);
  const galleryTrackRef = useRef<HTMLDivElement>(null);
  const scrollTrack = (ref: React.RefObject<HTMLDivElement | null>, direction: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({
      left: direction * el.clientWidth * 0.9,
      behavior: prefersReducedMotion ? 'instant' : 'smooth',
    });
  };

  return (
    <div className="home-page home-redesign bg-white text-constru-dark pb-16 sm:pb-24">
      <section className="hero-section-full relative isolate overflow-hidden" aria-labelledby="hero-title">
        <img
          src={energyImage}
          alt="Composición de un hogar con paneles solares, baterías y generador de respaldo"
          className="hero-bg absolute inset-0 h-full w-full object-cover object-[68%_45%]"
          fetchPriority="high"
          width={1672}
          height={941}
        />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-64 sm:h-72 bg-gradient-to-b from-black/55 via-black/10 to-transparent" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent lg:to-55%" />

        <div className="hero-content-full relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 id="hero-title" className="home-title-full font-bold text-white">Cero apagones con soluciones de <span>eficiencia energética.</span></h1>
          <p className="mt-6 max-w-[43ch] text-base sm:text-lg leading-relaxed text-white/85">Energía solar, almacenamiento y respaldo para tu hogar o empresa. Asesoría desde Nicoya, Guanacaste.</p>
          <div className="hero-cta-row-full mt-8 flex flex-wrap items-center gap-4">
            <a href={contactUrl} target="_blank" rel="noreferrer" className="hero-contact inline-flex items-center rounded-full bg-constru-accent transition-colors">
              <WhatsappLogo weight="fill" aria-hidden="true" className="hero-wa-icon w-6 h-6" />
              <span className="hero-btn-text">
                <span className="hero-btn-title">Contáctenos</span>
              </span>
              <ArrowRight aria-hidden="true" className="button-arrow w-5 h-5" />
            </a>
            <Link to="/productos" className="hero-secondary inline-flex items-center rounded-full transition-colors">
              <span className="hero-btn-icon"><Boxes aria-hidden="true" className="w-6 h-6" /></span>
              <span className="hero-btn-text">
                <span className="hero-btn-title">Ver productos</span>
              </span>
              <ArrowRight aria-hidden="true" className="button-arrow w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="hero-chips relative z-10 hidden md:flex md:flex-wrap items-center gap-x-7 gap-y-3 md:absolute md:left-8 md:bottom-8 lg:left-12">
          <span className="hero-chip"><Leaf aria-hidden="true" className="w-5 h-5 shrink-0" />Hogares más sostenibles</span>
          <span className="hero-chip"><Zap aria-hidden="true" className="w-5 h-5 shrink-0" />Ahorro en tu energía</span>
          <span className="hero-chip"><Users aria-hidden="true" className="w-5 h-5 shrink-0" />Asesoría local en Nicoya</span>
        </div>
      </section>

      <section className="home-categories max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20" aria-labelledby="categories-title">
        <div className="section-heading">
          <h2 id="categories-title" className="text-3xl sm:text-4xl font-bold tracking-tight text-constru-primary">Categorías</h2>
          <div className="section-heading-actions">
            <Link to="/productos" className="section-link">Ver todos los equipos <ArrowRight aria-hidden="true" size={18} /></Link>
            {!categoriesPending && !categoriesError && categories.length > 1 && (
              <div className="home-carousel-nav">
                <button type="button" onClick={() => scrollTrack(categoryTrackRef, -1)} aria-label="Categoría anterior" className="home-carousel-arrow"><ChevronLeft aria-hidden="true" className="w-5 h-5" /></button>
                <button type="button" onClick={() => scrollTrack(categoryTrackRef, 1)} aria-label="Siguiente categoría" className="home-carousel-arrow"><ChevronRight aria-hidden="true" className="w-5 h-5" /></button>
              </div>
            )}
          </div>
        </div>
        <div className="mt-8" aria-live="polite" aria-busy={categoriesPending}>
          {categoriesPending ? <div role="status"><span className="sr-only">Cargando categorías…</span><div className="grid md:grid-cols-3 gap-6">{[1, 2, 3].map(i => <div key={i} aria-hidden="true" className="rounded-2xl bg-white p-6 sm:p-7 space-y-5"><div className="h-[205px] rounded-[21px] bg-constru-offwhite animate-pulse" /><div className="h-7 w-2/3 bg-constru-offwhite rounded animate-pulse" /><div className="h-4 bg-constru-offwhite rounded animate-pulse" /><div className="h-4 w-4/5 bg-constru-offwhite rounded animate-pulse" /></div>)}</div></div>
            : categoriesError ? <div className="combo-state bg-constru-offwhite rounded-2xl p-6 sm:p-10"><p className="font-semibold text-constru-primary">No pudimos cargar las categorías.</p><p className="mt-2 text-constru-muted">Intenta nuevamente o consulta el catálogo completo.</p><button type="button" onClick={() => void refetchCategories()} disabled={categoriesFetching} className="mt-5 rounded-xl bg-constru-primary text-white px-5 py-3 font-semibold disabled:opacity-60">{categoriesFetching ? 'Reintentando…' : 'Reintentar'}</button><Link to="/productos" className="inline-flex px-5 py-3 text-constru-primary underline underline-offset-4">Ver todos los equipos</Link></div>
            : categories.length === 0 ? <div className="combo-state bg-constru-offwhite rounded-2xl p-6 sm:p-10"><p className="font-semibold text-constru-primary">Estamos organizando el catálogo por categorías.</p><p className="mt-2 text-constru-muted">Mientras tanto, explora todos los equipos disponibles.</p><Link to="/productos" className="mt-5 inline-flex items-center gap-2 text-constru-primary font-semibold underline underline-offset-4">Ver todos los equipos<ArrowRight aria-hidden="true" className="w-4 h-4" /></Link></div>
            : <div ref={categoryTrackRef} className="category-carousel">{categories.map(category => {
              const Icon = getCategoryIcon(category.slug);
              return (
                <article key={category.id} className="category-card p-6 sm:p-7 rounded-2xl bg-white flex flex-col">
                  <div className="category-photo"><CatalogImage src={category.image_url || energyImage} alt="" loading="lazy" width="800" height="540" /><div className="category-icon"><Icon aria-hidden="true" className="w-6 h-6" /></div></div>
                  <div className="category-copy">
                    <h3 className="text-2xl font-bold text-constru-primary break-words">{category.name}</h3>
                    {category.description && <p className="mt-3 mb-6 text-constru-muted leading-relaxed category-desc-clamp">{category.description}</p>}
                    <div className="mt-auto pt-4 border-t border-constru-line flex flex-col items-start gap-1">
                      <Link to={`/productos?categoria=${category.slug}`} className="category-link inline-flex items-center gap-2 py-2 font-semibold text-constru-primary hover:underline underline-offset-4">Ver productos<ArrowRight aria-hidden="true" className="w-4 h-4" /></Link>
                    </div>
                  </div>
                </article>
              );
            })}</div>}
        </div>
      </section>

      <section className="home-combos bg-constru-offwhite py-16 sm:py-20" aria-labelledby="combos-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-heading">
            <div>
              <h2 id="combos-title" className="text-3xl sm:text-4xl font-bold tracking-tight text-constru-primary">Combos Energéticos</h2>
              <p className="mt-3 text-constru-muted">Soluciones en conjunto. Consulta el paquete que mejor se adapte a tu proyecto.</p>
            </div>
            {!isPending && !isError && combos.length > 1 && (
              <div className="home-carousel-nav">
                <button type="button" onClick={() => scrollTrack(comboTrackRef, -1)} aria-label="Combo anterior" className="home-carousel-arrow"><ChevronLeft aria-hidden="true" className="w-5 h-5" /></button>
                <button type="button" onClick={() => scrollTrack(comboTrackRef, 1)} aria-label="Siguiente combo" className="home-carousel-arrow"><ChevronRight aria-hidden="true" className="w-5 h-5" /></button>
              </div>
            )}
          </div>
          <div className="mt-8" aria-live="polite" aria-busy={isPending}>
            {isPending ? <div role="status"><span className="sr-only">Cargando combos energéticos…</span><div className="grid md:grid-cols-3 gap-6">{[1, 2, 3].map(i => <div key={i} aria-hidden="true" className="rounded-2xl bg-white p-7 space-y-5 animate-pulse"><div className="h-7 w-2/3 bg-constru-offwhite rounded" /><div className="h-4 bg-constru-offwhite rounded" /><div className="h-4 w-4/5 bg-constru-offwhite rounded" /><div className="h-4 w-3/4 bg-constru-offwhite rounded" /><div className="h-12 bg-constru-offwhite rounded-xl" /></div>)}</div></div>
              : isError ? <div className="combo-state bg-white rounded-2xl p-6 sm:p-10"><p className="font-semibold text-constru-primary">No pudimos cargar los combos.</p><p className="mt-2 text-constru-muted">Intenta nuevamente o contáctanos para consultar los paquetes disponibles.</p><button type="button" onClick={() => void refetch()} disabled={isFetching} className="mt-5 rounded-xl bg-constru-primary text-white px-5 py-3 font-semibold disabled:opacity-60">{isFetching ? 'Reintentando…' : 'Reintentar'}</button><a href={contactUrl} target="_blank" rel="noreferrer" className="inline-flex px-5 py-3 text-constru-primary underline underline-offset-4">Consultar por WhatsApp</a></div>
              : combos.length === 0 ? <div className="combo-state bg-white rounded-2xl p-6 sm:p-10"><p className="font-semibold text-constru-primary">Estamos preparando nuevos combos energéticos.</p><p className="mt-2 text-constru-muted">Podemos ayudarte a armar una solución a tu medida.</p><a href={contactUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-constru-primary font-semibold underline underline-offset-4">Consultar por WhatsApp<ArrowRight aria-hidden="true" className="w-4 h-4" /></a></div>
              : <div ref={comboTrackRef} className="combo-carousel">{combos.map(combo => <article key={combo.id} className="combo-card min-w-0 bg-white rounded-2xl flex flex-col overflow-hidden">
                <button type="button" onClick={() => setActiveCombo(combo)} className="combo-card-trigger text-left">
                  {combo.image_url ? <CatalogImage src={combo.image_url} alt="" loading="lazy" className="combo-photo" /> : <div className="combo-photo combo-photo-placeholder"><Boxes aria-hidden="true" className="w-9 h-9" /></div>}
                  <div className="combo-copy">
                    <h3 className="text-2xl font-bold text-constru-primary break-words">{combo.name}</h3>
                    {combo.description && <p className="mt-3 text-constru-muted leading-relaxed combo-desc-clamp">{combo.description}</p>}
                    <span className="combo-see-more">Ver detalle y productos<ArrowRight aria-hidden="true" className="w-4 h-4" /></span>
                  </div>
                </button>
                <div className="combo-cta">
                  <a href={whatsapp(`Hola ConstruCenter, me interesa cotizar el paquete: ${combo.name}`)} target="_blank" rel="noreferrer" aria-label={`Cotizar ${combo.name} por WhatsApp`} className="home-button inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-constru-accent text-constru-primary font-bold hover:bg-constru-accent-hover transition-colors"><WhatsappLogo weight="fill" aria-hidden="true" className="w-5 h-5 shrink-0" />Cotizar este paquete</a>
                </div>
              </article>)}</div>}
          </div>
        </div>
      </section>

      {activeCombo && (
        <Modal titleId="combo-modal-title" onClose={() => setActiveCombo(null)}>
          <div className="combo-modal bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {activeCombo.image_url && <CatalogImage src={activeCombo.image_url} alt="" className="combo-modal-photo" />}
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <h3 id="combo-modal-title" className="text-2xl font-bold text-constru-primary break-words">{activeCombo.name}</h3>
                <button type="button" onClick={() => setActiveCombo(null)} aria-label="Cerrar" className="combo-modal-close shrink-0"><X aria-hidden="true" className="w-5 h-5" /></button>
              </div>
              {activeCombo.description && <p className="mt-3 text-constru-muted leading-relaxed">{activeCombo.description}</p>}
              {activeCombo.features.length > 0 && <ul className="mt-6 space-y-3">{activeCombo.features.map((feature, index) => <li key={`${index}-${feature}`} className="flex items-start gap-3"><CheckCircle2 aria-hidden="true" className="w-5 h-5 mt-0.5 shrink-0 text-constru-primary" /><span className="min-w-0 break-words">{feature}</span></li>)}</ul>}

              <h4 className="mt-8 text-sm font-bold uppercase tracking-wide text-constru-muted">Productos que incluye este combo</h4>
              {activeCombo.items.length === 0 ? <p className="mt-3 text-sm text-constru-muted">Consultanos por WhatsApp para conocer el detalle de productos de este paquete.</p> : <ul className="mt-3 divide-y divide-constru-line">{activeCombo.items.map(item => <li key={item.product_id} className="flex items-center gap-4 py-3">
                {item.product?.images?.[0] ? <CatalogImage src={item.product.images[0]} alt="" className="w-14 h-14 rounded-lg object-cover bg-constru-offwhite shrink-0" /> : <div className="w-14 h-14 rounded-lg bg-constru-offwhite shrink-0" />}
                <div className="min-w-0 flex-1">
                  {item.product ? <Link to={`/producto/${item.product.slug}`} onClick={() => setActiveCombo(null)} className="font-semibold text-constru-primary hover:underline underline-offset-4 break-words">{item.product.name}</Link> : <span className="font-semibold text-constru-muted">Producto no disponible</span>}
                  <p className="mt-0.5 text-sm text-constru-muted">{item.quantity} × {item.product ? formatColones(item.product.price) : '—'}</p>
                </div>
              </li>)}</ul>}

              <a href={whatsapp(`Hola ConstruCenter, me interesa cotizar el paquete: ${activeCombo.name}`)} target="_blank" rel="noreferrer" className="home-button mt-8 inline-flex w-full items-center justify-center gap-2 px-5 py-3 rounded-full bg-constru-accent text-constru-primary font-bold hover:bg-constru-accent-hover transition-colors"><WhatsappLogo weight="fill" aria-hidden="true" className="w-5 h-5 shrink-0" />Cotizar este paquete</a>
            </div>
          </div>
        </Modal>
      )}

      <section className="home-gallery max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20" aria-labelledby="gallery-title">
        <div className="section-heading">
          <div>
            <h2 id="gallery-title" className="text-3xl sm:text-4xl font-bold tracking-tight text-constru-primary">Nuestros Proyectos</h2>
            <p className="mt-3 text-constru-muted">Instalaciones y trabajos reales que hemos entregado en Guanacaste y el resto del país.</p>
          </div>
          {!galleryPending && !galleryError && galleryImages.length > 1 && (
            <div className="home-carousel-nav">
              <button type="button" onClick={() => scrollTrack(galleryTrackRef, -1)} aria-label="Foto anterior" className="home-carousel-arrow"><ChevronLeft aria-hidden="true" className="w-5 h-5" /></button>
              <button type="button" onClick={() => scrollTrack(galleryTrackRef, 1)} aria-label="Siguiente foto" className="home-carousel-arrow"><ChevronRight aria-hidden="true" className="w-5 h-5" /></button>
            </div>
          )}
        </div>
        <div className="mt-8" aria-live="polite" aria-busy={galleryPending}>
          {galleryPending ? <div role="status"><span className="sr-only">Cargando galería…</span><div className="grid md:grid-cols-3 gap-6">{[1, 2, 3].map(i => <div key={i} aria-hidden="true" className="rounded-2xl bg-constru-offwhite aspect-square animate-pulse" />)}</div></div>
            : galleryError ? <div className="combo-state bg-constru-offwhite rounded-2xl p-6 sm:p-10"><p className="font-semibold text-constru-primary">No pudimos cargar la galería.</p><p className="mt-2 text-constru-muted">Intenta nuevamente.</p><button type="button" onClick={() => void refetchGallery()} disabled={galleryFetching} className="mt-5 rounded-xl bg-constru-primary text-white px-5 py-3 font-semibold disabled:opacity-60">{galleryFetching ? 'Reintentando…' : 'Reintentar'}</button></div>
            : galleryImages.length === 0 ? <div className="combo-state bg-constru-offwhite rounded-2xl p-6 sm:p-10"><p className="font-semibold text-constru-primary">Estamos preparando nuestra galería de proyectos.</p><p className="mt-2 text-constru-muted">Muy pronto vas a poder ver fotos de nuestras instalaciones aquí.</p></div>
            : <div ref={galleryTrackRef} className="gallery-carousel">{galleryImages.map(image => (
              <button key={image.id} type="button" onClick={() => setActiveGalleryImage(image)} className="gallery-card">
                <CatalogImage src={image.image_url} alt={image.title || 'Foto del proyecto'} loading="lazy" className="gallery-photo" />
                {image.title && <span className="gallery-caption">{image.title}</span>}
              </button>
            ))}</div>}
        </div>
      </section>

      {activeGalleryImage && (
        <Modal titleId="gallery-modal-title" onClose={() => setActiveGalleryImage(null)}>
          <div className="gallery-modal bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CatalogImage src={activeGalleryImage.image_url} alt={activeGalleryImage.title || 'Foto del proyecto'} className="combo-modal-photo" />
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <h3 id="gallery-modal-title" className="text-2xl font-bold text-constru-primary break-words">{activeGalleryImage.title || 'Foto del proyecto'}</h3>
                <button type="button" onClick={() => setActiveGalleryImage(null)} aria-label="Cerrar" className="combo-modal-close shrink-0"><X aria-hidden="true" className="w-5 h-5" /></button>
              </div>
              {activeGalleryImage.description && <p className="mt-3 text-constru-muted leading-relaxed">{activeGalleryImage.description}</p>}
            </div>
          </div>
        </Modal>
      )}

      <section className="home-contact max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20" aria-labelledby="contact-title">
        <div className="contact-panel relative grid lg:grid-cols-[1.05fr_1fr] gap-6 lg:gap-8 items-stretch">
          <span aria-hidden="true" className="contact-blob contact-blob-a" />
          <span aria-hidden="true" className="contact-blob contact-blob-b" />
          <div className="contact-card relative rounded-2xl bg-white border border-constru-line p-7 sm:p-12">
            <span className="contact-eyebrow">Contáctanos</span>
            <h2 id="contact-title" className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-constru-ink">Estamos para ayudarte</h2>
            <p className="mt-4 text-constru-muted leading-relaxed max-w-md">Desde Nicoya, Guanacaste, te asesoramos en la elección de tu solución de eficiencia energética. Escríbenos, llámanos o visítanos.</p>

            <ul className="contact-list mt-8 space-y-5">
              <li className="flex items-start gap-4">
                <span className="contact-list-icon"><MapPin aria-hidden="true" className="w-5 h-5" /></span>
                <span>
                  <span className="block font-bold text-constru-ink">Ubicación</span>
                  <span className="block text-sm text-constru-muted">Nicoya, Guanacaste, Costa Rica</span>
                  <span className="block text-sm text-constru-muted">Cobertura en toda la península y a nivel nacional</span>
                </span>
              </li>
              <li className="flex items-start gap-4">
                <span className="contact-list-icon"><Phone aria-hidden="true" className="w-5 h-5" /></span>
                <span>
                  <span className="block font-bold text-constru-ink">Teléfonos</span>
                  <span className="block text-sm text-constru-muted">+506 8525 2840 / +506 4500 1015</span>
                </span>
              </li>
              <li className="flex items-start gap-4">
                <span className="contact-list-icon"><WhatsappLogo aria-hidden="true" weight="fill" className="w-5 h-5" /></span>
                <span>
                  <span className="block font-bold text-constru-ink">WhatsApp</span>
                  <span className="block text-sm text-constru-muted">+506 8525 2840</span>
                  <span className="block text-sm text-constru-muted">Respuesta rápida</span>
                </span>
              </li>
              <li className="flex items-start gap-4">
                <span className="contact-list-icon"><EnvelopeSimple aria-hidden="true" className="w-5 h-5" /></span>
                <span>
                  <span className="block font-bold text-constru-ink">Correo electrónico</span>
                  <span className="block text-sm text-constru-muted">ventas@construcenter.cr</span>
                  <span className="block text-sm text-constru-muted">Te respondemos en menos de 24 horas</span>
                </span>
              </li>
            </ul>

            <a href={contactUrl} target="_blank" rel="noreferrer" className="contact-cta mt-8">
              <span className="contact-cta-icon"><WhatsappLogo aria-hidden="true" weight="fill" className="w-5 h-5" /></span>
              <span className="flex-1">Escribir por WhatsApp</span>
              <ArrowRight aria-hidden="true" className="w-5 h-5 shrink-0" />
            </a>

            <div className="contact-badges mt-7">
              <div className="contact-badge"><span className="contact-badge-icon"><ShieldCheck aria-hidden="true" className="w-5 h-5" /></span><span>Asesoría<br />personalizada</span></div>
              <div className="contact-badge"><span className="contact-badge-icon"><Truck aria-hidden="true" className="w-5 h-5" /></span><span>Cobertura<br />en todo el país</span></div>
              <div className="contact-badge"><span className="contact-badge-icon"><SproutIcon aria-hidden="true" className="w-5 h-5" /></span><span>Soluciones<br />sostenibles</span></div>
            </div>
          </div>
          <div className="contact-map relative rounded-2xl overflow-hidden bg-constru-offwhite">
            <iframe
              title="Ubicación de ConstruCenter Nicoya en Google Maps"
              src="https://maps.google.com/maps?q=Nicoya%2C%20Guanacaste%2C%20Costa%20Rica&z=13&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full min-h-[280px] border-0"
            />
            <div className="contact-map-badge">
              <span className="contact-map-badge-icon"><MapPin aria-hidden="true" className="w-4 h-4" /></span>
              <div>
                <span className="block text-sm font-bold text-constru-primary">ConstruCenter Nicoya</span>
                <span className="block text-xs text-constru-muted">Nicoya, Guanacaste, Costa Rica</span>
              </div>
            </div>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Nicoya%2C%20Guanacaste%2C%20Costa%20Rica"
              target="_blank"
              rel="noreferrer"
              className="contact-map-directions"
            >
              Cómo llegar<ArrowRight aria-hidden="true" className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Home;
