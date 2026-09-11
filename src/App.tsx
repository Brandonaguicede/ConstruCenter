import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';

// Layouts
import { PublicLayout } from '@/layouts/PublicLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

// Páginas Públicas (Hitos 2 y 3)
import { Home } from '@/pages/public/Home';
const Catalog = React.lazy(() => import('@/pages/public/Catalog').then(module => ({ default: module.Catalog })));
const ProductDetail = React.lazy(() => import('@/pages/public/ProductDetail').then(module => ({ default: module.ProductDetail })));
const PdfCatalogs = React.lazy(() => import('@/pages/public/PdfCatalogs').then(module => ({ default: module.PdfCatalogs })));
const Cart = React.lazy(() => import('@/pages/public/Cart').then(module => ({ default: module.Cart })));
const Checkout = React.lazy(() => import('@/pages/public/Checkout').then(module => ({ default: module.Checkout })));
const OrderSuccess = React.lazy(() => import('@/pages/public/OrderSuccess').then(module => ({ default: module.OrderSuccess })));

// Páginas Administrativas (Hitos 1 y 4)
const AdminLogin = React.lazy(() => import('@/pages/admin/Login').then(module => ({ default: module.AdminLogin })));
const AdminProducts = React.lazy(() => import('@/pages/admin/Products').then(module => ({ default: module.AdminProducts })));
const AdminProductForm = React.lazy(() => import('@/pages/admin/ProductForm').then(module => ({ default: module.AdminProductForm })));
const AdminCategories = React.lazy(() => import('@/pages/admin/Categories').then(module => ({ default: module.AdminCategories })));
const AdminBrands = React.lazy(() => import('@/pages/admin/Brands').then(module => ({ default: module.AdminBrands })));
const AdminOrders = React.lazy(() => import('@/pages/admin/Orders').then(module => ({ default: module.AdminOrders })));
const AdminOrderDetail = React.lazy(() => import('@/pages/admin/OrderDetail').then(module => ({ default: module.AdminOrderDetail })));
const AdminCombos = React.lazy(() => import('@/pages/admin/Combos').then(module => ({ default: module.AdminCombos })));
const AdminCatalogs = React.lazy(() => import('@/pages/admin/Catalogs').then(module => ({ default: module.AdminCatalogs })));
const AdminGallery = React.lazy(() => import('@/pages/admin/Gallery').then(module => ({ default: module.AdminGallery })));
const AdminSettings = React.lazy(() => import('@/pages/admin/Settings').then(module => ({ default: module.AdminSettings })));

// Configuración de TanStack React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 3, // 3 minutos
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  const initializeAuth = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // Inicializar listener de sesión de Supabase Auth
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <React.Suspense fallback={<div role="status" className="min-h-[50dvh] grid place-items-center text-constru-muted">Cargando página…</div>}>
        <Routes>
          {/* ================================================================= */}
          {/* 1. RUTAS PÚBLICAS (CATÁLOGO + CARRITO + CHECKOUT)                  */}
          {/* ================================================================= */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<Catalog />} />
            <Route path="/producto/:slug" element={<ProductDetail />} />
            <Route path="/catalogos" element={<PdfCatalogs />} />
            <Route path="/carrito" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/pedido-confirmado" element={<OrderSuccess />} />
          </Route>

          {/* ================================================================= */}
          {/* 2. RUTAS ADMINISTRATIVAS (HITOS 1 Y 4: PANEL DE CONTROL)          */}
          {/* ================================================================= */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/pedidos" replace />} />

            {/* Gestión de Pedidos (Hito 4) */}
            <Route path="pedidos" element={<AdminOrders />} />
            <Route path="pedidos/:id" element={<AdminOrderDetail />} />
            
            {/* Gestión de Productos (Hito 1) */}
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/:id/edit" element={<AdminProductForm />} />

            {/* Taxonomías */}
            <Route path="categories" element={<AdminCategories />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="combos" element={<AdminCombos />} />
            <Route path="catalogos" element={<AdminCatalogs />} />
            <Route path="galeria" element={<AdminGallery />} />

            {/* Configuración Comercial (Hito 4) */}
            <Route path="configuracion" element={<AdminSettings />} />
          </Route>

          {/* Redirección Catch-all a la página de inicio */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </React.Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
