-- ==============================================================================
-- CONSTRUCENTER - HITO 4: CONFIGURACIÓN COMERCIAL Y ESTADOS DE PEDIDOS
-- ==============================================================================

-- 1. Añadir payment_status y ampliar estados en tabla orders
ALTER TABLE orders 
    ADD COLUMN IF NOT EXISTS payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING';

-- Actualizar restricción de estados para admitir el ciclo completo
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
    CHECK (status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'));

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check 
    CHECK (payment_status IN ('PENDING', 'PAID', 'CANCELLED'));

-- 2. TABLA STORE_SETTINGS (Configuración Comercial Dinámica)
CREATE TABLE IF NOT EXISTS store_settings (
    id INT PRIMARY KEY DEFAULT 1,
    whatsapp_number VARCHAR(50) NOT NULL DEFAULT '50688888888',
    store_name VARCHAR(150) NOT NULL DEFAULT 'ConstruCenter',
    support_email VARCHAR(255) DEFAULT 'ventas@construcenter.cr',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fila única inicial
INSERT INTO store_settings (id, whatsapp_number, store_name, support_email)
VALUES (1, '50688888888', 'ConstruCenter', 'ventas@construcenter.cr')
ON CONFLICT (id) DO NOTHING;

-- 3. POLÍTICAS RLS PARA STORE_SETTINGS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view store settings" ON store_settings;
CREATE POLICY "Public can view store settings"
    ON store_settings FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can update store settings" ON store_settings;
CREATE POLICY "Authenticated users can update store settings"
    ON store_settings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
