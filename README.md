# ConstruCenter Nicoya

Tienda en línea de equipos de eficiencia energética (paneles solares, baterías,
inversores, calentadores de agua, generadores) para Nicoya, Guanacaste, Costa Rica.

- **Frontend**: React + TypeScript + Vite, Tailwind CSS, TanStack React Query.
- **Backend**: Supabase (base de datos + autenticación), con respaldo en
  `localStorage` cuando Supabase no está configurado.
- **Funciones serverless** (`api/`): subida de archivos a Cloudflare R2
  (`api/upload.ts`) y checkout comercial (`api/checkout.ts`), pensadas para
  desplegarse como Vercel Functions.

## Desarrollo local

```bash
npm install
cp .env.example .env   # completa tus valores reales
npm run dev
```

## Scripts

- `npm run dev` — servidor de desarrollo (Vite).
- `npm run build` — type-check (`tsc -b`) + build de producción (`vite build`).
- `npm run preview` — sirve el build de `dist/` localmente.
- `npm run lint` — Oxlint.

## Desplegar en Vercel

1. Importa el repositorio en Vercel (detecta el preset Vite automáticamente).
2. En **Project Settings → Environment Variables**, configura:

   | Variable | Dónde se usa |
   |---|---|
   | `VITE_SUPABASE_URL` | Frontend (se incluye en el build) |
   | `VITE_SUPABASE_ANON_KEY` | Frontend (se incluye en el build) |
   | `SUPABASE_SERVICE_ROLE_KEY` | Solo `api/checkout.ts` (backend, nunca se expone al navegador) |
   | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_DOMAIN` | Solo `api/upload.ts` |
   | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Si se usan notificaciones por correo |
   | `ADMIN_WHATSAPP_NUMBER` | Notificaciones de pedidos |

   Sin `R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY`, `api/upload.ts` responde con
   una URL simulada en vez de subir a R2 — útil para probar el flujo sin
   credenciales reales, pero recuerda configurarlas antes de usarlo en serio.
3. `vercel.json` ya incluye el rewrite necesario para que las rutas de
   React Router (`/productos`, `/admin/...`, etc.) funcionen al recargar o
   entrar directo por URL.
4. Ejecuta el script SQL de `supabase/schema.sql` (y los demás archivos en
   `supabase/`) en el editor SQL de tu proyecto de Supabase antes del primer
   despliegue.

## Estructura

- `src/pages/public/` — páginas del sitio público (Home, catálogo, carrito, checkout).
- `src/pages/admin/` — panel de administración (`/admin/login`).
- `src/services/` — capa de datos: cada `*.service.ts` habla con Supabase y cae
  a `localStorage`/datos de ejemplo si no está configurado.
- `src/layouts/` — `PublicLayout` (nav + footer) y `AdminLayout` (sidebar).
- `supabase/` — esquema SQL y migraciones, para ejecutar manualmente en Supabase.
