import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import type { Product, Category, Brand, CatalogPDF, GalleryImage } from '@/types/models';

export interface PublicProductFilters {
  categorySlug?: string;
  categoryId?: string;
  brandId?: string;
  searchTerm?: string;
  limit?: number;
}

export const FALLBACK_PUBLIC_BRANDS: Brand[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    name: 'ConstruCenter Solar',
    slug: 'construcenter-solar',
    description: 'Equipos fotovoltaicos y proyectos solares garantizados',
    logo_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    name: 'Growatt / Deye',
    slug: 'growatt-deye',
    description: 'Inversores híbridos y almacenamiento inteligente de clase mundial',
    logo_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    name: 'Generac',
    slug: 'generac',
    description: 'Generadores eléctricos de respaldo continuo y plantas automáticas',
    logo_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    name: 'Schneider / Tuya',
    slug: 'schneider-tuya',
    description: 'Smart home, centros de carga y monitoreo de eficiencia energética',
    logo_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

// Datos de fallback en caso de base de datos vacía o modo sin conexión (Restringido a Eficiencia Energética)
export const FALLBACK_PUBLIC_CATEGORIES: Category[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Paneles Solares',
    slug: 'paneles-solares',
    description: 'Módulos monocristalinos de alta eficiencia, bifaciales y proyectos solares llave en mano desde ₡2,000,000',
    image_url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=700&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Inversores y Baterías',
    slug: 'inversores-y-baterias',
    description: 'Inversores híbridos, microinversores y bancos de baterías de litio LiFePO4 para cero apagones',
    image_url: 'https://images.unsplash.com/photo-1558441719-8b489c63f7d1?w=700&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Smart Home',
    slug: 'smart-home',
    description: 'Monitoreo de energía en tiempo real, automatización, sensores y gestión inteligente del hogar',
    image_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=700&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Acabados Eléctricos',
    slug: 'acabados-electricos',
    description: 'Iluminación arquitectónica LED de lujo, placas de diseño, transferencias automáticas y calentadores solares',
    image_url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=700&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const FALLBACK_PUBLIC_PRODUCTS: Product[] = [
  {
    id: 'f0000001-0000-4000-8000-000000000001',
    sku: 'KIT-SOL-5KW',
    name: 'Kit Sistema Solar Fotovoltaico Residencial 5kW Híbrido',
    slug: 'kit-sistema-solar-residencial-5kw-hibrido',
    description: 'Sistema integral fotovoltaico con paneles solares monocristalinos Tier 1 de 550W, inversor híbrido inteligente y protecciones eléctricas. Ideal para reducir hasta un 90% en la factura eléctrica.',
    price: 2450000,
    compare_at_price: 2800000,
    cost_price: 1950000,
    stock: 12,
    is_active: true,
    is_featured: true,
    category_id: '11111111-1111-1111-1111-111111111111',
    brand_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    images: ['https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80'],
    specs: { 'Potencia': '5 kW', 'Tipo': 'Híbrido On/Off Grid', 'Garantía Paneles': '25 Años' },
    created_at: new Date().toISOString(),
    category: {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Paneles Solares',
      slug: 'paneles-solares',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    brand: {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      name: 'ConstruCenter Solar',
      slug: 'construcenter-solar',
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'f0000001-0000-4000-8000-000000000002',
    sku: 'INV-HYB-6KW',
    name: 'Inversor Solar Híbrido 6kW 48V Cero Apagones',
    slug: 'inversor-solar-hibrido-6kw-48v',
    description: 'Inversor cargador de onda senoidal pura con doble seguidor MPPT y conmutación ultra rápida <10ms para cero apagones. Compatible con baterías de litio y monitoreo WiFi.',
    price: 1350000,
    compare_at_price: 1490000,
    cost_price: 1080000,
    stock: 18,
    is_active: true,
    is_featured: true,
    category_id: '22222222-2222-2222-2222-222222222222',
    brand_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    images: ['https://images.unsplash.com/photo-1558441719-8b489c63f7d1?w=800&auto=format&fit=crop&q=80'],
    specs: { 'Capacidad': '6000W', 'Voltaje Batería': '48V DC', 'Monitoreo': 'App iOS & Android' },
    created_at: new Date().toISOString(),
    category: {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Inversores y Baterías',
      slug: 'inversores-y-baterias',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    brand: {
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      name: 'Growatt / Deye',
      slug: 'growatt-deye',
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'f0000001-0000-4000-8000-000000000003',
    sku: 'BAT-LFP-5KWH',
    name: 'Batería de Litio LiFePO4 5.12kWh 48V 100Ah Rack',
    slug: 'bateria-litio-lifepo4-5kwh-48v-100ah',
    description: 'Módulo de almacenamiento de ciclo profundo de más de 6,000 ciclos de vida con BMS inteligente integrado. Respaldo confiable y libre de mantenimiento contra cortes eléctricos.',
    price: 1480000,
    compare_at_price: 1650000,
    cost_price: 1200000,
    stock: 10,
    is_active: true,
    is_featured: true,
    category_id: '22222222-2222-2222-2222-222222222222',
    brand_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    images: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&auto=format&fit=crop&q=80'],
    specs: { 'Capacidad': '5.12 kWh', 'Ciclos': '> 6000 @ 80% DOD', 'Química': 'LiFePO4' },
    created_at: new Date().toISOString(),
    category: {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Inversores y Baterías',
      slug: 'inversores-y-baterias',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    brand: {
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      name: 'Pylontech / Dyness',
      slug: 'pylontech',
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'f0000001-0000-4000-8000-000000000004',
    sku: 'CAL-SOL-200L',
    name: 'Calentador Solar de Agua Presurizado Inox 200 Litros',
    slug: 'calentador-solar-agua-presurizado-inox-200l',
    description: 'Termotanque de acero inoxidable grado alimenticio con tubos de vacío tricapa Heat Pipe. Provee agua caliente constante sin gastar electricidad.',
    price: 485000,
    compare_at_price: 540000,
    cost_price: 380000,
    stock: 8,
    is_active: true,
    is_featured: true,
    category_id: '44444444-4444-4444-4444-444444444444',
    brand_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    images: ['https://images.unsplash.com/photo-1508873696983-2df570464753?w=800&auto=format&fit=crop&q=80'],
    specs: { 'Capacidad': '200 Litros', 'Material': 'Acero Inox SUS304', 'Presión': 'Hasta 6 bar' },
    created_at: new Date().toISOString(),
    category: {
      id: '44444444-4444-4444-4444-444444444444',
      name: 'Acabados Eléctricos',
      slug: 'acabados-electricos',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    brand: {
      id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      name: 'ConstruCenter Solar',
      slug: 'construcenter-solar',
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'f0000001-0000-4000-8000-000000000005',
    sku: 'GEN-INV-4500',
    name: 'Generador Eléctrico Silencioso Inverter 4500W Dual Fuel',
    slug: 'generador-electrico-silencioso-inverter-4500w',
    description: 'Generador inverter de onda pura ultra silencioso (58 dB). Funciona con gasolina o gas LP con arranque eléctrico. Protección perfecta para equipos electrónicos y respaldo domiciliario.',
    price: 690000,
    compare_at_price: null,
    cost_price: 550000,
    stock: 6,
    is_active: true,
    is_featured: false,
    category_id: '22222222-2222-2222-2222-222222222222',
    brand_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'],
    specs: { 'Potencia Pico': '4500W', 'Nivel de Ruido': '58 dB', 'Combustible': 'Gasolina / Gas LP' },
    created_at: new Date().toISOString(),
    category: {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Inversores y Baterías',
      slug: 'inversores-y-baterias',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    brand: {
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      name: 'Champion Power',
      slug: 'champion',
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'f0000001-0000-4000-8000-000000000006',
    sku: 'SMRT-PNL-16CH',
    name: 'Medidor y Tablero Inteligente Smart Home con Monitoreo WiFi',
    slug: 'medidor-tablero-inteligente-smart-home-wifi',
    description: 'Sistema de monitoreo de energía y corte automático para hasta 16 circuitos individuales. Permite ver el consumo en tiempo real y optimizar el uso de energía solar desde el celular.',
    price: 245000,
    compare_at_price: 280000,
    cost_price: 180000,
    stock: 15,
    is_active: true,
    is_featured: false,
    category_id: '33333333-3333-3333-3333-333333333333',
    brand_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    images: ['https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80'],
    specs: { 'Conectividad': 'WiFi / Zigbee', 'Canales': '16 Circuitos', 'App': 'SmartLife / Tuya' },
    created_at: new Date().toISOString(),
    category: {
      id: '33333333-3333-3333-3333-333333333333',
      name: 'Smart Home',
      slug: 'smart-home',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    brand: {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      name: 'Sonoff / Tuya',
      slug: 'tuya-smart',
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
];

const FALLBACK_PUBLIC_GALLERY: GalleryImage[] = [
  {
    id: 'gal-001',
    title: 'Instalación residencial en Nicoya',
    description: 'Sistema fotovoltaico de 5kW con baterías de respaldo.',
    image_url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=900&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'gal-002',
    title: 'Proyecto comercial de respaldo eléctrico',
    description: 'Generador y transferencia automática instalados en un local comercial.',
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=900&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'gal-003',
    title: 'Banco de baterías LiFePO4',
    description: 'Almacenamiento de energía para cero apagones en vivienda.',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=900&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

const FALLBACK_PUBLIC_CATALOGS: CatalogPDF[] = [
  {
    id: 'cat-001',
    title: 'Catálogo de Paneles Solares Tier 1 y Sistemas Fotovoltaicos 2026',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cover_image_url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80',
    file_size_bytes: 14500000,
    is_active: true,
    created_at: new Date().toISOString(),
    brand: {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      name: 'ConstruCenter Solar',
      slug: 'construcenter-solar',
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'cat-002',
    title: 'Guía Técnica de Inversores Híbridos y Baterías LiFePO4 (Cero Apagones)',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cover_image_url: 'https://images.unsplash.com/photo-1558441719-8b489c63f7d1?w=600&auto=format&fit=crop&q=80',
    file_size_bytes: 18200000,
    is_active: true,
    created_at: new Date().toISOString(),
    brand: {
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      name: 'Growatt / Deye',
      slug: 'growatt-deye',
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'cat-003',
    title: 'Catálogo de Smart Home, Automatización y Acabados de Lujo',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cover_image_url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&auto=format&fit=crop&q=80',
    file_size_bytes: 12100000,
    is_active: true,
    created_at: new Date().toISOString(),
    brand: {
      id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      name: 'SmartHome Pro',
      slug: 'smarthome-pro',
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
];

export const publicService = {
  /**
   * Obtiene las categorías activas para navegación y filtros
   */
  async getActiveCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error || !data || data.length === 0) {
        return FALLBACK_PUBLIC_CATEGORIES;
      }

      return data as Category[];
    } catch {
      return FALLBACK_PUBLIC_CATEGORIES;
    }
  },

  /**
   * Obtiene los productos destacados para la página de inicio
   */
  async getFeaturedProducts(limit = 6): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(id, name, slug), brand:brands(id, name, slug)')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data || data.length === 0) {
        return FALLBACK_PUBLIC_PRODUCTS.filter((p) => p.is_featured).slice(0, limit);
      }

      return data as Product[];
    } catch {
      return FALLBACK_PUBLIC_PRODUCTS.filter((p) => p.is_featured).slice(0, limit);
    }
  },

  /**
   * Obtiene los productos activos con filtros dinámicos (categoría, búsqueda, etc.)
   */
  async getActiveProducts(filters: PublicProductFilters = {}): Promise<Product[]> {
    try {
      let query = supabase
        .from('products')
        .select('*, category:categories!inner(id, name, slug), brand:brands(id, name, slug)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (filters.categorySlug) {
        query = query.eq('category.slug', filters.categorySlug);
      }

      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters.brandId) {
        query = query.eq('brand_id', filters.brandId);
      }

      if (filters.searchTerm) {
        const term = filters.searchTerm.trim();
        query = query.or(`name.ilike.%${term}%,sku.ilike.%${term}%,description.ilike.%${term}%`);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        // Fallback filtrado
        let result = [...FALLBACK_PUBLIC_PRODUCTS];
        if (filters.categorySlug) {
          result = result.filter((p) => p.category?.slug === filters.categorySlug);
        }
        if (filters.searchTerm) {
          const t = filters.searchTerm.toLowerCase();
          result = result.filter(
            (p) =>
              p.name.toLowerCase().includes(t) ||
              p.sku.toLowerCase().includes(t) ||
              (p.description && p.description.toLowerCase().includes(t))
          );
        }
        return result;
      }

      return data as Product[];
    } catch {
      return FALLBACK_PUBLIC_PRODUCTS;
    }
  },

  /**
   * Obtiene el detalle completo de un producto por su Slug único
   */
  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(id, name, slug), brand:brands(id, name, slug)')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        const fallback = FALLBACK_PUBLIC_PRODUCTS.find((p) => p.slug === slug);
        return fallback || null;
      }

      return data as Product;
    } catch {
      const fallback = FALLBACK_PUBLIC_PRODUCTS.find((p) => p.slug === slug);
      return fallback || null;
    }
  },

  /**
   * Obtiene los catálogos PDF activos de proveedores
   */
  async getActiveCatalogs(): Promise<CatalogPDF[]> {
    try {
      const { data, error } = await supabase
        .from('catalog_pdfs')
        .select('*, brand:brands(id, name, logo_url)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return FALLBACK_PUBLIC_CATALOGS;
      }

      return data as CatalogPDF[];
    } catch {
      return FALLBACK_PUBLIC_CATALOGS;
    }
  },

  /**
   * Obtiene las fotos activas de la galería de proyectos
   */
  async getActiveGalleryImages(): Promise<GalleryImage[]> {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return FALLBACK_PUBLIC_GALLERY;
      }

      return data as GalleryImage[];
    } catch {
      return FALLBACK_PUBLIC_GALLERY;
    }
  },
};
