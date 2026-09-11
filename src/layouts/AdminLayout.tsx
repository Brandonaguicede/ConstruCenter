import React, { useState } from 'react';
import { Navigate, Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Stack as Layers,
  Medal as Award,
  SignOut as LogOut,
  List as Menu,
  X,
  StackPlus as PackagePlus,
  CaretRight as ChevronRight,
  ShieldCheck,
  User as UserIcon,
  Sparkle as Sparkles,
  ClipboardText as ClipboardList,
  Gear as SettingsIcon,
  FileText,
  Images,
} from '@phosphor-icons/react';
import { useAuthStore } from '@/store/useAuthStore';
import { SupabaseStatusAlert } from '@/components/ui/SupabaseStatusAlert';
import construLogo from '@/img/ConstruCenter_Nicoya_logo_transparente.svg';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: 'Pedidos', path: '/admin/pedidos', icon: ClipboardList },
  { label: 'Productos', path: '/admin/products', icon: Package },
  { label: 'Combos', path: '/admin/combos', icon: PackagePlus },
  { label: 'Categorías', path: '/admin/categories', icon: Layers },
  { label: 'Marcas', path: '/admin/brands', icon: Award },
  { label: 'Catálogos PDF', path: '/admin/catalogos', icon: FileText },
  { label: 'Galería', path: '/admin/galeria', icon: Images },
  { label: 'Configuración', path: '/admin/configuracion', icon: SettingsIcon },
];

export const AdminLayout: React.FC = () => {
  const { user, isDemoMode, isLoading, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-constru-offwhite">
        <div className="w-12 h-12 border-4 border-constru-primary border-t-constru-accent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-semibold text-constru-dark tracking-wide">
          Verificando credenciales de acceso...
        </p>
      </div>
    );
  }

  // Protección estricta de rutas administrativas
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  return (
    <div className="admin-shell min-h-screen bg-constru-offwhite flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:w-64 flex-col bg-constru-primary text-white shadow-xl z-20">
        {/* Header Marca */}
        <div className="p-5 border-b border-white/10 flex flex-col items-center gap-1.5">
          <img
            src={construLogo}
            alt="ConstruCenter Nicoya"
            className="admin-logo h-10 w-auto max-w-[190px] object-contain drop-shadow"
          />
          <span className="text-[10px] tracking-widest uppercase font-bold text-constru-accent">
            Panel Administrativo
          </span>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== '/admin' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                  isActive
                    ? 'bg-constru-accent text-constru-primary shadow-md font-bold'
                    : 'text-gray-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-constru-primary' : 'text-constru-accent group-hover:scale-110 transition-transform'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-constru-primary" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer Usuario & Cerrar Sesión */}
        <div className="p-4 border-t border-white/10 bg-black/15">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-constru-accent/20 flex items-center justify-center text-constru-accent font-bold border border-constru-accent/30">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user.email}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-constru-accent">
                {isDemoMode ? (
                  <span className="inline-flex items-center gap-1 text-amber-300 font-bold">
                    <Sparkles className="w-3 h-3" />
                    Modo Demo
                  </span>
                ) : (
                  <>
                    <ShieldCheck className="w-3 h-3" />
                    <span>Admin activo</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-red-200 hover:text-white hover:bg-red-600/30 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Topbar Mobile */}
      <div className="md:hidden bg-constru-primary text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <img
            src={construLogo}
            alt="ConstruCenter Nicoya"
            className="admin-logo h-8 w-auto max-w-[150px] object-contain drop-shadow"
          />
        </div>
        <button
          aria-label={mobileMenuOpen ? "Cerrar navegación" : "Abrir navegación"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Drawer Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-constru-primary text-white border-b border-white/10 px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold ${
                  isActive ? 'bg-constru-accent text-constru-primary font-bold' : 'text-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-gray-300 truncate max-w-[200px]">{user.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-red-300 hover:text-white font-bold"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Barra superior con estado de Supabase */}
        <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between">
          <div className="text-xs text-gray-500 font-medium hidden sm:block">
            Panel de Administración Comercial &bull; ConstruCenter
          </div>
          <div className="ml-auto">
            <SupabaseStatusAlert compact />
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <React.Suspense fallback={<div role="status" className="p-12 text-center text-constru-muted">Cargando página…</div>}><Outlet /></React.Suspense>
        </div>
      </main>
    </div>
  );
};
export default AdminLayout;
