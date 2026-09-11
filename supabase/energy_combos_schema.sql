-- Contrato del Home. Aplicar si energy_combos todavía no existe.
-- No inserta paquetes ni precios comerciales de ejemplo.
CREATE TABLE IF NOT EXISTS public.energy_combos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  features jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(features) = 'array'),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.energy_combos ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.energy_combos TO anon, authenticated;
DROP POLICY IF EXISTS "Public can view active energy combos" ON public.energy_combos;
CREATE POLICY "Public can view active energy combos"
  ON public.energy_combos FOR SELECT TO anon, authenticated
  USING (is_active = true);
