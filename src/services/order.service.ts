import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import type { OrderRecord, OrderStatus, PaymentStatus } from '@/types/models';

export interface OrderFilters {
  searchTerm?: string;
  status?: OrderStatus | '';
  paymentStatus?: PaymentStatus | '';
}

// Fallback de demostración cuando Supabase esté en desarrollo local o vacío
const MOCK_ORDERS: OrderRecord[] = [
  {
    id: 'ord-demo-001',
    order_number: 'CC-849201',
    customer_name: 'Ing. Carlos Mendoza',
    customer_phone: '8888-1234',
    customer_email: 'carlos.mendoza@constructora.cr',
    delivery_type: 'delivery',
    delivery_address: 'San José, Curridabat, Condominio Monterán, Casa 45',
    notes: 'Descarga en horas de la mañana con camión de plataforma.',
    total_amount: 264000,
    status: 'CONFIRMED',
    payment_status: 'PAID',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // Hace 2 horas
    items: [
      {
        id: 'item-001',
        order_id: 'ord-demo-001',
        product_id: 'prod-001',
        snapshot_name: 'Cemento Gris CPC 30R Extra 50kg',
        snapshot_sku: 'CEM-EXT-50KG',
        quantity: 10,
        snapshot_unit_price: 8500,
        snapshot_subtotal: 85000,
      },
      {
        id: 'item-002',
        order_id: 'ord-demo-001',
        product_id: 'prod-002',
        snapshot_name: 'Taladro Rotomartillo Inalámbrico DeWalt 20V MAX',
        snapshot_sku: 'DWT-DCD771-20V',
        quantity: 2,
        snapshot_unit_price: 89500,
        snapshot_subtotal: 179000,
      },
    ],
  },
  {
    id: 'ord-demo-002',
    order_number: 'CC-715309',
    customer_name: 'Constructora Alturas del Valle S.A.',
    customer_phone: '8700-9988',
    customer_email: 'compras@alturasdelvalle.com',
    delivery_type: 'store_pickup',
    delivery_address: null,
    notes: 'Retira chofer en camión institucional con cédula jurídica.',
    total_amount: 135000,
    status: 'PREPARING',
    payment_status: 'PAID',
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    items: [
      {
        id: 'item-003',
        order_id: 'ord-demo-002',
        product_id: 'prod-003',
        snapshot_name: 'Tanque / Tinaco Tricapa Rotoplas 1100 Litros',
        snapshot_sku: 'ROT-TIN-1100L',
        quantity: 1,
        snapshot_unit_price: 135000,
        snapshot_subtotal: 135000,
      },
    ],
  },
  {
    id: 'ord-demo-003',
    order_number: 'CC-630184',
    customer_name: 'Mariana Brenes Fernández',
    customer_phone: '8344-5566',
    customer_email: null,
    delivery_type: 'delivery',
    delivery_address: 'Alajuela, San Rafael, 300m norte del Ebais',
    notes: 'Llamar 30 minutos antes de llegar.',
    total_amount: 24750,
    status: 'PENDING',
    payment_status: 'PENDING',
    created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(), // Hace 20 minutos
    items: [
      {
        id: 'item-004',
        order_id: 'ord-demo-003',
        product_id: 'prod-004',
        snapshot_name: 'Varilla Corrugada Grado 60 3/8" (6 metros)',
        snapshot_sku: 'VAR-COR-38-6M',
        quantity: 5,
        snapshot_unit_price: 4950,
        snapshot_subtotal: 24750,
      },
    ],
  },
];

export const orderService = {
  /**
   * Obtiene todos los pedidos registrados ordenados por fecha descendente
   */
  async getOrders(filters: OrderFilters = {}): Promise<OrderRecord[]> {
    if (!isSupabaseConfigured()) {
      let filtered = [...MOCK_ORDERS];
      if (filters.status) filtered = filtered.filter((o) => o.status === filters.status);
      if (filters.paymentStatus) filtered = filtered.filter((o) => o.payment_status === filters.paymentStatus);
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(
          (o) =>
            o.order_number.toLowerCase().includes(term) ||
            o.customer_name.toLowerCase().includes(term) ||
            o.customer_phone.includes(term)
        );
      }
      return filtered;
    }

    try {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.paymentStatus) {
        query = query.eq('payment_status', filters.paymentStatus);
      }

      if (filters.searchTerm) {
        const term = filters.searchTerm.trim();
        query = query.or(
          `order_number.ilike.%${term}%,customer_name.ilike.%${term}%,customer_phone.ilike.%${term}%`
        );
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        console.warn('Fallo o tabla orders vacía en Supabase:', error?.message);
        return MOCK_ORDERS;
      }

      // Asegurar compatibilidad con payment_status predeterminado
      return data.map((o) => ({
        ...o,
        payment_status: o.payment_status || 'PENDING',
      })) as OrderRecord[];
    } catch {
      return MOCK_ORDERS;
    }
  },

  /**
   * Obtiene el detalle completo de un pedido por ID con sus order_items congelados
   * REGLA: Lee estrictamente de order_items snapshots, NUNCA de products
   */
  async getOrderById(id: string): Promise<OrderRecord | null> {
    if (!isSupabaseConfigured()) {
      const found = MOCK_ORDERS.find((o) => o.id === id);
      return found || null;
    }

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (orderError || !orderData) {
        const found = MOCK_ORDERS.find((o) => o.id === id);
        return found || null;
      }

      // Cargar estrictamente los order_items (snapshots históricos)
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id);

      if (itemsError) {
        console.error('Error cargando order_items de Supabase:', itemsError);
      }

      return {
        ...orderData,
        payment_status: orderData.payment_status || 'PENDING',
        items: (itemsData as any[]) || [],
      } as OrderRecord;
    } catch {
      const found = MOCK_ORDERS.find((o) => o.id === id);
      return found || null;
    }
  },

  /**
   * Actualiza el estado logístico del pedido (order_status)
   */
  async updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
    if (!isSupabaseConfigured()) {
      const index = MOCK_ORDERS.findIndex((o) => o.id === id);
      if (index !== -1) MOCK_ORDERS[index].status = status;
      return;
    }

    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Error al actualizar estado del pedido: ${error.message}`);
    }
  },

  /**
   * Actualiza el estado de pago del pedido (payment_status)
   */
  async updatePaymentStatus(id: string, payment_status: PaymentStatus): Promise<void> {
    if (!isSupabaseConfigured()) {
      const index = MOCK_ORDERS.findIndex((o) => o.id === id);
      if (index !== -1) MOCK_ORDERS[index].payment_status = payment_status;
      return;
    }

    const { error } = await supabase
      .from('orders')
      .update({ payment_status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Error al actualizar estado de pago: ${error.message}`);
    }
  },
};
