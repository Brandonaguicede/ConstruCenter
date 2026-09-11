import { Suspense, useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  List as Menu,
  X,
  Phone,
  EnvelopeSimple as Mail,
  MapPin,
  ShieldCheck,
  FileText,
  Package,
  House as HomeIcon,
  WhatsappLogo,
} from '@phosphor-icons/react';
import { useCartStore } from '@/store/useCartStore';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import construLogo from '@/img/ConstruCenter_Nicoya_logo_transparente.svg';
import construLogoWhite from '@/img/ConstruCenter_Nicoya_logo_blanco.svg';
import './PublicLayout.css';

const navLinks = [
  { label: 'Inicio', path: '/', icon: HomeIcon },
  { label: 'Productos', path: '/productos', icon: Package },
  { label: 'Catálogos PDF', path: '/catalogos', icon: FileText },
];
const contactUrl = 'https://wa.me/50685252840?text=Hola,%20deseo%20asesor%C3%ADa%20en%20eficiencia%20energ%C3%A9tica';

export const PublicLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const cartCount = useCartStore(state => state.getTotalItems());
  const isActive = (path: string) => path === '/' ? pathname === '/' : pathname.startsWith(path);
  const isHome = pathname === '/';
  const transparent = isHome && !scrolled && !mobileMenuOpen;

  useEffect(() => {
    if (!isHome) { setScrolled(true); return; }
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  return (
    <div className="public-shell min-h-screen flex flex-col bg-white text-constru-ink">
      <a href="#contenido" className="skip-link">Saltar al contenido</a>
      <header className={`public-header z-40 ${transparent ? 'is-transparent' : 'is-solid'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} aria-label="ConstruCenter, inicio">
            <img src={transparent ? construLogoWhite : construLogo} alt="ConstruCenter Nicoya" className="h-10 sm:h-12 w-auto max-w-[165px] sm:max-w-[220px] transition-opacity" />
          </Link>
          <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-2">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                aria-current={isActive(link.path) ? 'page' : undefined}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  transparent
                    ? isActive(link.path) ? 'bg-white/15 text-white font-bold' : 'text-white/90 hover:bg-white/10'
                    : isActive(link.path) ? 'bg-constru-mist text-constru-primary font-bold' : 'text-constru-muted hover:bg-constru-mist'
                }`}
              >{link.label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/carrito"
              onClick={() => setMobileMenuOpen(false)}
              className={`relative grid place-items-center w-11 h-11 rounded-xl border transition-colors ${transparent ? 'border-white/30 text-white hover:bg-white/10' : 'border-constru-line text-constru-primary hover:bg-constru-mist'}`}
              aria-label={'Carrito: ' + cartCount + ' equipos'}
            >
              <ShoppingCart size={20} aria-hidden="true" />
              {cartCount > 0 && <span className="absolute -right-1 -top-1 min-w-5 h-5 px-1 rounded-full bg-constru-primary text-white text-[11px] grid place-items-center">{cartCount}</span>}
            </Link>
            <a href={contactUrl} target="_blank" rel="noreferrer" className="button-primary header-contact-btn hidden sm:inline-flex"><WhatsappLogo size={18} weight="fill" aria-hidden="true" />Contactar</a>
            <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation" className={`md:hidden grid place-items-center w-11 h-11 rounded-xl transition-colors ${transparent ? 'text-white hover:bg-white/10' : 'text-constru-primary hover:bg-constru-mist'}`}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav id="mobile-navigation" aria-label="Navegación móvil" className="md:hidden px-4 pb-5 border-t border-constru-line">
            {navLinks.map(link => {
              const Icon = link.icon;
              return <Link key={link.path} to={link.path} onClick={() => setMobileMenuOpen(false)} aria-current={isActive(link.path) ? 'page' : undefined} className="flex gap-3 px-4 py-3 mt-2 text-constru-primary"><Icon size={18} aria-hidden="true" />{link.label}</Link>;
            })}
            <a href={contactUrl} target="_blank" rel="noreferrer" className="button-primary header-contact-btn w-full mt-4"><WhatsappLogo size={18} weight="fill" aria-hidden="true" />Consultar por WhatsApp</a>
          </nav>
        )}
      </header>
      <main id="contenido" className={`flex-1 ${isHome ? '' : 'page-offset'}`}><Suspense fallback={<div role="status" className="p-12 text-center text-constru-muted">Cargando página…</div>}><Outlet /></Suspense></main>
      <a href={contactUrl} target="_blank" rel="noreferrer" aria-label="Escribir por WhatsApp" className="whatsapp-float"><WhatsAppIcon /></a>
      {/* Footer Comercial */}
      <footer className="site-footer bg-constru-mist text-constru-ink pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] gap-x-8 gap-y-10 items-start mb-12">
            {/* Columna 1: Marca & Descripción */}
            <div>
              <img
                src={construLogo}
                alt="ConstruCenter Nicoya"
                className="h-11 w-auto max-w-[190px] object-contain"
              />
              <p className="mt-4 text-sm text-constru-muted leading-relaxed">
                Solución integral en equipos de eficiencia energética: Paneles Solares, Baterías, Inversores,
                Calentadores de Agua, Generadores Eléctricos y Acabados de Lujo (Iluminación y SmartHome).
              </p>
              <div className="footer-badge mt-4">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                Asesoría técnica y proyectos
              </div>
            </div>

            {/* Columna 2: Enlaces Rápidos */}
            <div>
              <h3 className="footer-heading">Explorar</h3>
              <ul className="space-y-2.5 text-sm text-constru-muted">
                <li>
                  <Link to="/" className="hover:text-constru-primary hover:underline underline-offset-4 transition-colors">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link to="/productos" className="hover:text-constru-primary hover:underline underline-offset-4 transition-colors">
                    Productos
                  </Link>
                </li>
                <li>
                  <Link to="/catalogos" className="hover:text-constru-primary hover:underline underline-offset-4 transition-colors">
                    Catálogos PDF
                  </Link>
                </li>
                <li>
                  <Link to="/admin/login" className="hover:text-constru-primary hover:underline underline-offset-4 transition-colors">
                    Portal de Gestión y Administración
                  </Link>
                </li>
              </ul>
            </div>

            {/* Columna 3: Información de Contacto */}
            <div>
              <h3 className="footer-heading">Atención y Proyectos</h3>
              <ul className="space-y-3.5 text-sm text-constru-muted">
                <li className="flex items-start gap-3">
                  <span className="footer-icon"><MapPin className="w-4 h-4" /></span>
                  <span className="pt-1.5">Nicoya, Guanacaste, Costa Rica &bull; Cobertura en toda la península y a nivel nacional</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="footer-icon"><Phone className="w-4 h-4" /></span>
                  <span className="pt-1.5">+506 8525 2840 / +506 4500 1015</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="footer-icon"><WhatsappLogo weight="fill" className="w-4 h-4" /></span>
                  <span className="pt-1.5">WhatsApp: +506 8525 2840</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="footer-icon"><Mail className="w-4 h-4" /></span>
                  <span className="pt-1.5">ventas@construcenter.cr</span>
                </li>
              </ul>
            </div>

            {/* Columna 4: Canal de WhatsApp Directo */}
            <div className="footer-cta rounded-2xl p-5">
              <div className="footer-cta-icon"><WhatsappLogo weight="fill" className="w-5 h-5" /></div>
              <h3 className="footer-heading footer-heading-cta">¿Dimensionamiento o cotización?</h3>
              <p className="text-xs text-white/75 leading-relaxed">
                Envíanos tu recibo eléctrico o lista de cargas. Diseñamos tu sistema fotovoltaico
                o banco de respaldo a tu medida.
              </p>
              <a
                href="https://wa.me/50685252840?text=Hola,%20deseo%20cotizar%20un%20proyecto%20de%20eficiencia%20energ%C3%A9tica"
                target="_blank"
                rel="noreferrer"
                className="footer-wa-cta mt-4 inline-flex items-center justify-center gap-2.5 w-full py-2.5 px-4 rounded-full text-xs font-bold text-constru-primary bg-constru-accent hover:bg-constru-accent-hover transition-colors shadow-md"
              >
                <WhatsappLogo size={16} weight="fill" aria-hidden="true" />
                <span>Chatear al +506 8525 2840</span>
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-constru-line text-xs text-constru-muted">
            <p>&copy; {new Date().getFullYear()} ConstruCenter. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default PublicLayout;
