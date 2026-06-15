# FitTrack

Aplicación React/Vite para seguimiento de entrenamiento, nutrición y medidas corporales.

## Desarrollo

```bash
pnpm install
pnpm dev
```

La interfaz principal en `src/FitTrack.jsx` es responsive y sirve tanto la experiencia de escritorio como la de navegador móvil. La carpeta `desktop/` es un prototipo histórico y no debe usarse como artefacto de producción.

## Variables

Crear `.env.local` con:

```text
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_ERROR_REPORTING_ENABLED=false
```

La clave anónima es pública por diseño. La seguridad depende de las políticas RLS de Supabase. Nunca incluir una `service_role` en variables `VITE_*`.

## Base de datos

Aplicar las migraciones de `supabase/migrations/` en orden:

1. `20260614000000_secure_app_data_rls.sql`
2. `20260614010000_private_progress_photos.sql`
3. `20260615000000_client_error_reports.sql`

La primera restringe `app_data` al usuario autenticado. La segunda crea un bucket privado para fotos de progreso y limita cada ruta al UUID propietario.

La tercera crea reportes de errores de solo insercion. Tras aplicarla, establecer
`VITE_ERROR_REPORTING_ENABLED=true` en Vercel activa diagnosticos sin correos,
tokens ni parametros de URL. Los usuarios de la app no tienen permiso de lectura;
los reportes se consultan desde el panel de Supabase.

## Despliegue

Producción se despliega en Vercel desde la raíz del repositorio:

- Build command: `pnpm run build`
- Output directory: `dist`
- Framework preset: Vite

GitHub Pages no forma parte del despliegue.

## Verificación

```bash
pnpm run build
pnpm test
pnpm audit --prod
```
