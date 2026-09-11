-- Ejecutar en el editor SQL de Supabase después de schema.sql / admin_catalog_combos.sql.
-- Reconcilia catalog_pdfs con los nombres de columna que ya usa el código
-- (title/file_url/is_active) en vez de los del DDL original (name/pdf_url/active),
-- y agrega file_size_bytes/cover_image_url si faltan. Conserva los registros existentes.
BEGIN;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='catalog_pdfs' AND column_name='name')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='catalog_pdfs' AND column_name='title') THEN
    ALTER TABLE public.catalog_pdfs RENAME COLUMN name TO title;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='catalog_pdfs' AND column_name='pdf_url')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='catalog_pdfs' AND column_name='file_url') THEN
    ALTER TABLE public.catalog_pdfs RENAME COLUMN pdf_url TO file_url;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='catalog_pdfs' AND column_name='active')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='catalog_pdfs' AND column_name='is_active') THEN
    ALTER TABLE public.catalog_pdfs RENAME COLUMN active TO is_active;
  END IF;
END $$;

ALTER TABLE public.catalog_pdfs
  ADD COLUMN IF NOT EXISTS cover_image_url text,
  ADD COLUMN IF NOT EXISTS file_size_bytes bigint,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

COMMIT;
