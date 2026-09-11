-- Ejecutar en el editor SQL de Supabase después de schema.sql.
-- Tabla para la galería de fotos del proyecto, gestionada desde /admin/galeria
-- y mostrada en la sección "Nuestros Proyectos" de la página de inicio.
BEGIN;

CREATE TABLE IF NOT EXISTS gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  description text,
  image_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura publica galeria" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "Admin CRUD galeria" ON gallery_images FOR ALL TO authenticated USING (true) WITH CHECK (true);

COMMIT;
