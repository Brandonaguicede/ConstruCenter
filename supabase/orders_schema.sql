-- ==============================================================================
-- CONSTRUCENTER - SCHEMA SQL DE PEDIDOS Y SNAPSHOTS DE PRECIOS
-- Hito 3: Carrito y Checkout Comercial (Cierre por WhatsApp)
-- ==============================================================================

-- 1. TABLA: ORDERS (Encabezado de Pedido)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(32) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255),
    delivery_type VARCHAR(50) NOT NULL DEFAULT 'store_pickup' CHECK (delivery_type IN ('store_pickup', 'delivery')),
    delivery_address TEXT,
    notes TEXT,
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de búsqueda y filtrado
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 2. TABLA: ORDER_ITEMS (Snapshots Históricos de Productos Comprados)
-- Regla de Dominio: El precio y SKU quedan congelados en el momento de la compra
-- ==============================================================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    snapshot_name VARCHAR(255) NOT NULL,
    snapshot_sku VARCHAR(64) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    snapshot_unit_price NUMERIC(12, 2) NOT NULL CHECK (snapshot_unit_price >= 0),
    snapshot_subtotal NUMERIC(12, 2) NOT NULL CHECK (snapshot_subtotal >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- ==============================================================================
-- 3. POLÍTICAS ROW LEVEL SECURITY (RLS)
-- Seguridad Estricta:
-- - Clientes públicos NO pueden consultar pedidos ajenos directamente en Supabase.
-- - Solo usuarios autenticados (administradores) pueden ver y gestionar pedidos.
-- - El backend (Vercel Function api/checkout.ts) inserta usando Service Role Key.
-- ==============================================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Políticas para ORDERS
DROP POLICY IF EXISTS "Admins can view and manage all orders" ON orders;
CREATE POLICY "Admins can view and manage all orders"
    ON orders FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Políticas para ORDER_ITEMS
DROP POLICY IF EXISTS "Admins can view and manage all order items" ON order_items;
CREATE POLICY "Admins can view and manage all order items"
    ON order_items FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
