-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabla de categorias
CREATE TABLE IF NOT EXISTS categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Tabla de marcas
CREATE TABLE IF NOT EXISTS brands (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sku text UNIQUE NOT NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price > 0),
  category_id uuid REFERENCES categories(id) ON DELETE RESTRICT,
  brand_id uuid REFERENCES brands(id) ON DELETE RESTRICT,
  active boolean DEFAULT true,
  featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 5. Tabla de catalogos PDF (entidad separada)
CREATE TABLE IF NOT EXISTS catalog_pdfs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  cover_image_url text,
  pdf_url text,
  category_id uuid REFERENCES categories(id) ON DELETE RESTRICT,
  brand_id uuid REFERENCES brands(id) ON DELETE RESTRICT,
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- 6. Habilitar Seguridad de Filas (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_pdfs ENABLE ROW LEVEL SECURITY;

-- 7. Politicas de Lectura Publica (Para que los clientes vean la tienda)
CREATE POLICY "Lectura publica categorias" ON categories FOR SELECT USING (true);
CREATE POLICY "Lectura publica marcas" ON brands FOR SELECT USING (true);
CREATE POLICY "Lectura publica productos" ON products FOR SELECT USING (true);
CREATE POLICY "Lectura publica catalogos" ON catalog_pdfs FOR SELECT USING (true);

-- 8. Politicas de Escritura (Solo para administradores autenticados)
CREATE POLICY "Admin CRUD categorias" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin CRUD marcas" ON brands FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin CRUD productos" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin CRUD catalogos" ON catalog_pdfs FOR ALL TO authenticated USING (true) WITH CHECK (true);