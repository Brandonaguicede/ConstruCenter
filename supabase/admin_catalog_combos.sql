




-- Ejecutar después de schema.sql. Conserva los registros existentes.
BEGIN;

-- Compatibilidad con las columnas del esquema inicial.
DO $$
DECLARE v_table_name text;
BEGIN
  FOREACH v_table_name IN ARRAY ARRAY['categories','brands','products'] LOOP
    IF EXISTS (SELECT 1 FROM information_schema.columns c WHERE c.table_schema='public' AND c.table_name=v_table_name AND c.column_name='active')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns c WHERE c.table_schema='public' AND c.table_name=v_table_name AND c.column_name='is_active') THEN
      EXECUTE format('ALTER TABLE public.%I RENAME COLUMN active TO is_active', v_table_name);
    END IF;
  END LOOP;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='featured')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='is_featured') THEN
    ALTER TABLE public.products RENAME COLUMN featured TO is_featured;
  END IF;
END $$;

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS image_url text, ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS logo_url text, ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS compare_at_price numeric CHECK (compare_at_price >= 0),
  ADD COLUMN IF NOT EXISTS cost_price numeric CHECK (cost_price >= 0),
  ADD COLUMN IF NOT EXISTS stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  ADD COLUMN IF NOT EXISTS images jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS specs jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.energy_combos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, description text,
  features jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(features)='array'),
  is_active boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.energy_combo_products (
  combo_id uuid NOT NULL REFERENCES public.energy_combos(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 999),
  PRIMARY KEY (combo_id, product_id)
);
CREATE INDEX IF NOT EXISTS energy_combo_products_product_idx ON public.energy_combo_products(product_id);
ALTER TABLE public.energy_combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_combo_products ENABLE ROW LEVEL SECURITY;

-- Usa el modelo de acceso del panel existente: usuarios autenticados administran.
-- No habilitar registros públicos de usuarios administradores.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products, public.categories, public.brands,
  public.energy_combos, public.energy_combo_products TO authenticated;
GRANT SELECT ON public.products, public.categories, public.brands, public.energy_combos, public.energy_combo_products TO anon;
DROP POLICY IF EXISTS "Admin CRUD combos" ON public.energy_combos;
CREATE POLICY "Admin CRUD combos" ON public.energy_combos FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public can view active energy combos" ON public.energy_combos;
CREATE POLICY "Public can view active energy combos" ON public.energy_combos FOR SELECT TO anon USING (is_active = true);
DROP POLICY IF EXISTS "Admin CRUD combo products" ON public.energy_combo_products;
CREATE POLICY "Admin CRUD combo products" ON public.energy_combo_products FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public can view published combo products" ON public.energy_combo_products;
CREATE POLICY "Public can view published combo products" ON public.energy_combo_products FOR SELECT TO anon USING (
  EXISTS (SELECT 1 FROM public.energy_combos c WHERE c.id=combo_id AND c.is_active)
  AND EXISTS (SELECT 1 FROM public.products p WHERE p.id=product_id AND p.is_active)
);

-- Guarda cabecera y productos en una sola transacción; un fallo revierte todo.
CREATE OR REPLACE FUNCTION public.save_energy_combo(
  p_id uuid, p_name text, p_description text, p_features jsonb, p_is_active boolean, p_items jsonb
) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
DECLARE saved_id uuid; item jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Inicia sesión para guardar combos.' USING ERRCODE='42501'; END IF;
  IF p_name IS NULL OR length(trim(p_name)) NOT BETWEEN 3 AND 120
     OR length(coalesce(p_description,'')) > 2000 OR p_is_active IS NULL THEN
    RAISE EXCEPTION 'Información del combo inválida.';
  END IF;
  IF p_features IS NULL OR jsonb_typeof(p_features) <> 'array' THEN RAISE EXCEPTION 'Los beneficios deben ser una lista.'; END IF;
  IF jsonb_array_length(p_features) > 30 THEN RAISE EXCEPTION 'Máximo 30 beneficios.'; END IF;
  FOR item IN SELECT value FROM jsonb_array_elements(p_features) LOOP
    IF jsonb_typeof(item) <> 'string' OR length(trim(item #>> '{}')) NOT BETWEEN 1 AND 300 THEN
      RAISE EXCEPTION 'Cada beneficio debe tener entre 1 y 300 caracteres.';
    END IF;
  END LOOP;
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' THEN RAISE EXCEPTION 'Selecciona productos del catálogo.'; END IF;
  IF jsonb_array_length(p_items) NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Selecciona entre 1 y 100 productos.'; END IF;
  FOR item IN SELECT value FROM jsonb_array_elements(p_items) LOOP
    IF jsonb_typeof(item->'quantity') IS DISTINCT FROM 'number'
       OR (item->>'quantity')::numeric NOT BETWEEN 1 AND 999
       OR trunc((item->>'quantity')::numeric) <> (item->>'quantity')::numeric THEN
      RAISE EXCEPTION 'La cantidad debe ser un entero entre 1 y 999.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.products WHERE id=(item->>'product_id')::uuid AND (NOT p_is_active OR is_active)) THEN
      RAISE EXCEPTION 'Producto no disponible. Para publicar, todos los productos deben estar activos.';
    END IF;
  END LOOP;
  IF (SELECT count(DISTINCT value->>'product_id') FROM jsonb_array_elements(p_items)) <> jsonb_array_length(p_items) THEN
    RAISE EXCEPTION 'Un producto no puede aparecer dos veces.';
  END IF;
  IF p_id IS NULL THEN
    INSERT INTO public.energy_combos(name,description,features,is_active)
      VALUES(trim(p_name),nullif(trim(p_description),''),p_features,p_is_active) RETURNING id INTO saved_id;
  ELSE
    UPDATE public.energy_combos SET name=trim(p_name),description=nullif(trim(p_description),''),features=p_features,is_active=p_is_active
      WHERE id=p_id RETURNING id INTO saved_id;
    IF saved_id IS NULL THEN RAISE EXCEPTION 'Combo no encontrado o sin permisos.'; END IF;
    DELETE FROM public.energy_combo_products WHERE combo_id=saved_id;
  END IF;
  INSERT INTO public.energy_combo_products(combo_id,product_id,quantity)
    SELECT saved_id,(value->>'product_id')::uuid,(value->>'quantity')::integer FROM jsonb_array_elements(p_items);
  RETURN saved_id;
END $$;
REVOKE ALL ON FUNCTION public.save_energy_combo(uuid,text,text,jsonb,boolean,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_energy_combo(uuid,text,text,jsonb,boolean,jsonb) TO authenticated;
NOTIFY pgrst, 'reload schema';
COMMIT;
