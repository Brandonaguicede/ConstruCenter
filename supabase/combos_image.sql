-- Ejecutar después de admin_catalog_combos.sql. Agrega foto de portada a los combos energéticos.
BEGIN;

ALTER TABLE public.energy_combos ADD COLUMN IF NOT EXISTS image_url text;

-- Reemplaza la función anterior (firma distinta: agrega p_image_url).
DROP FUNCTION IF EXISTS public.save_energy_combo(uuid, text, text, jsonb, boolean, jsonb);

CREATE OR REPLACE FUNCTION public.save_energy_combo(
  p_id uuid, p_name text, p_description text, p_features jsonb, p_is_active boolean, p_items jsonb,
  p_image_url text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
DECLARE saved_id uuid; item jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Inicia sesión para guardar combos.' USING ERRCODE='42501'; END IF;
  IF p_name IS NULL OR length(trim(p_name)) NOT BETWEEN 3 AND 120
     OR length(coalesce(p_description,'')) > 2000 OR p_is_active IS NULL THEN
    RAISE EXCEPTION 'Información del combo inválida.';
  END IF;
  IF p_image_url IS NOT NULL AND (length(p_image_url) > 2000 OR p_image_url !~ '^https?://') THEN
    RAISE EXCEPTION 'La imagen debe ser una URL pública http(s).';
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
    INSERT INTO public.energy_combos(name,description,features,is_active,image_url)
      VALUES(trim(p_name),nullif(trim(p_description),''),p_features,p_is_active,nullif(trim(p_image_url),'')) RETURNING id INTO saved_id;
  ELSE
    UPDATE public.energy_combos SET name=trim(p_name),description=nullif(trim(p_description),''),features=p_features,
      is_active=p_is_active,image_url=nullif(trim(p_image_url),'')
      WHERE id=p_id RETURNING id INTO saved_id;
    IF saved_id IS NULL THEN RAISE EXCEPTION 'Combo no encontrado o sin permisos.'; END IF;
    DELETE FROM public.energy_combo_products WHERE combo_id=saved_id;
  END IF;
  INSERT INTO public.energy_combo_products(combo_id,product_id,quantity)
    SELECT saved_id,(value->>'product_id')::uuid,(value->>'quantity')::integer FROM jsonb_array_elements(p_items);
  RETURN saved_id;
END $$;
REVOKE ALL ON FUNCTION public.save_energy_combo(uuid,text,text,jsonb,boolean,jsonb,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_energy_combo(uuid,text,text,jsonb,boolean,jsonb,text) TO authenticated;
NOTIFY pgrst, 'reload schema';
COMMIT;
