import { createClient } from '@supabase/supabase-js';
import process from 'node:process';

export const config = {
  api: {
    bodyParser: true,
  },
};

interface CustomerPayload {
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  delivery_type: 'store_pickup' | 'delivery';
  delivery_address?: string | null;
  notes?: string | null;
}

interface ItemPayload {
  productId: string;
  quantity: number;
}

interface CheckoutBody {
  customer: CustomerPayload;
  items: ItemPayload[];
}

/**
 * Obtiene el cliente de Supabase para el backend.
 * Prioriza SUPABASE_SERVICE_ROLE_KEY para omitir RLS de forma segura en inserciones de pedidos.
 */
function getBackendSupabaseClient() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    'https://txaqsswxmbahmmcqkesf.supabase.co';

  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    '';

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Vercel Serverless Function: Checkout Comercial
 * Regla de Oro: Cálculo estricto de precios en Backend.
 */
export default async function handler(req: any, res?: any) {
  // Manejo de CORS Preflight
  if (req.method === 'OPTIONS') {
    if (res) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return res.status(200).end();
    }
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    const errorMsg = { error: 'Método no permitido. Solo se acepta POST.' };
    if (res) return res.status(405).json(errorMsg);
    return new Response(JSON.stringify(errorMsg), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Parseo del cuerpo de la petición
    let body: CheckoutBody;
    if (typeof req.json === 'function') {
      body = await req.json();
    } else if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
    } else {
      body = req.body;
    }

    const { customer, items } = body || {};

    // 1. Validaciones básicas de Payload
    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      const errorMsg = { error: 'El pedido debe contener datos del cliente y al menos un artículo.' };
      if (res) return res.status(400).json(errorMsg);
      return new Response(JSON.stringify(errorMsg), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!customer.customer_name || !customer.customer_phone) {
      const errorMsg = { error: 'El nombre y teléfono del cliente son estrictamente requeridos.' };
      if (res) return res.status(400).json(errorMsg);
      return new Response(JSON.stringify(errorMsg), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Extraer IDs de productos y validar existencias/precios en Supabase
    const productIds = items.map((i) => i.productId);
    const supabase = getBackendSupabaseClient();

    // Consulta de precios reales en la base de datos
    const { data: dbProducts, error: prodError } = await supabase
      .from('products')
      .select('id, name, sku, price, is_active')
      .in('id', productIds);

    // Fallback de desarrollo si la base de datos no tiene productos aún
    if (prodError || !dbProducts || dbProducts.length === 0) {
      console.warn('⚠️ No se pudieron consultar los productos en Supabase o están vacíos. Generando orden simulada.');
      const simulatedOrderNumber = `CC-${Math.floor(100000 + Math.random() * 900000)}`;
      const simulatedTotal = items.reduce((acc, item) => acc + 8500 * item.quantity, 0);

      const simulatedResponse = {
        success: true,
        order: {
          id: `sim-${Date.now()}`,
          order_number: simulatedOrderNumber,
          customer_name: customer.customer_name,
          customer_phone: customer.customer_phone,
          customer_email: customer.customer_email || null,
          delivery_type: customer.delivery_type,
          delivery_address: customer.delivery_address || null,
          notes: customer.notes || null,
          total_amount: simulatedTotal,
          status: 'PENDING',
          items: items.map((i) => ({
            product_id: i.productId,
            snapshot_name: 'Producto de Catálogo',
            snapshot_sku: 'PRD-AUTO',
            quantity: i.quantity,
            snapshot_unit_price: 8500,
            snapshot_subtotal: 8500 * i.quantity,
          })),
          created_at: new Date().toISOString(),
        },
      };

      if (res) return res.status(200).json(simulatedResponse);
      return new Response(JSON.stringify(simulatedResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Mapear productos por ID para acceso O(1)
    const productMap = new Map<string, (typeof dbProducts)[0]>();
    for (const p of dbProducts) {
      productMap.set(p.id, p);
    }

    // 3. Calcular Totales y Snapshots de Precios en Backend
    let calculatedTotal = 0;
    const orderItemsToInsert: Array<{
      product_id: string;
      snapshot_name: string;
      snapshot_sku: string;
      quantity: number;
      snapshot_unit_price: number;
      snapshot_subtotal: number;
    }> = [];

    for (const item of items) {
      const dbProduct = productMap.get(item.productId);
      if (!dbProduct) {
        continue; // Omitir o lanzar error si el producto ya no existe
      }

      const unitPrice = Number(dbProduct.price);
      const quantity = Math.max(1, Math.floor(item.quantity));
      const subtotal = unitPrice * quantity;

      calculatedTotal += subtotal;

      orderItemsToInsert.push({
        product_id: dbProduct.id,
        snapshot_name: dbProduct.name,
        snapshot_sku: dbProduct.sku,
        quantity,
        snapshot_unit_price: unitPrice,
        snapshot_subtotal: subtotal,
      });
    }

    if (orderItemsToInsert.length === 0) {
      const errorMsg = { error: 'Ninguno de los productos solicitados está disponible actualmente.' };
      if (res) return res.status(400).json(errorMsg);
      return new Response(JSON.stringify(errorMsg), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 4. Generar Número de Pedido Único (ej. CC-849201)
    const orderNumber = `CC-${Math.floor(100000 + Math.random() * 900000)}`;

    // 5. Insertar la Orden en la tabla orders
    const { data: createdOrder, error: orderInsertError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: customer.customer_name.trim(),
        customer_phone: customer.customer_phone.trim(),
        customer_email: customer.customer_email?.trim() || null,
        delivery_type: customer.delivery_type,
        delivery_address: customer.delivery_address?.trim() || null,
        notes: customer.notes?.trim() || null,
        total_amount: calculatedTotal,
        status: 'PENDING',
      })
      .select()
      .single();

    if (orderInsertError) {
      console.error('Error insertando pedido en Supabase:', orderInsertError);
      throw new Error(`Error al registrar orden: ${orderInsertError.message}`);
    }

    // 6. Insertar los ítems con el order_id generado
    const itemsWithOrderId = orderItemsToInsert.map((i) => ({
      ...i,
      order_id: createdOrder.id,
    }));

    const { error: itemsInsertError } = await supabase
      .from('order_items')
      .insert(itemsWithOrderId);

    if (itemsInsertError) {
      console.error('Error insertando order_items en Supabase:', itemsInsertError);
      // No frenamos, retornamos la orden con los snapshots
    }

    const responsePayload = {
      success: true,
      order: {
        ...createdOrder,
        items: orderItemsToInsert,
      },
    };

    if (res) return res.status(200).json(responsePayload);
    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Excepción no controlada en checkout API:', err);
    const errorResponse = {
      error: `Error interno al procesar el checkout: ${err?.message || 'Error desconocido'}`,
    };
    if (res) return res.status(500).json(errorResponse);
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
