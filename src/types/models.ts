export type ProductStatus = 'active' | 'inactive' | 'draft' | 'archived';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  compare_at_price?: number | null;
  cost_price?: number | null;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  category_id: string;
  brand_id: string;
  images: string[];
  specs?: Record<string, string | number | boolean> | null;
  created_at: string;
  updated_at?: string;
  // Relaciones opcionales expandidas
  category?: Category | null;
  brand?: Brand | null;
}

export interface CatalogPDF {
  id: string;
  brand_id?: string | null;
  title: string;
  file_url: string;
  cover_image_url?: string | null;
  file_size_bytes?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  brand?: Brand | null;
}

export interface GalleryImage {
  id: string;
  title?: string | null;
  description?: string | null;
  image_url: string;
  sort_order?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

// ==========================================
// MODELOS DE PEDIDOS Y ESTADOS (HITO 4)
// ==========================================

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'CANCELLED';

export interface OrderItemRecord {
  id: string;
  order_id: string;
  product_id?: string | null;
  snapshot_name: string;
  snapshot_sku: string;
  quantity: number;
  snapshot_unit_price: number;
  snapshot_subtotal: number;
  created_at?: string;
}

export interface OrderRecord {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  delivery_type: 'store_pickup' | 'delivery';
  delivery_address?: string | null;
  notes?: string | null;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  items?: OrderItemRecord[];
  created_at: string;
  updated_at?: string;
}

// Configuración comercial de la tienda
export interface StoreSettings {
  id: number;
  whatsapp_number: string;
  store_name?: string | null;
  support_email?: string | null;
  updated_at?: string;
}
