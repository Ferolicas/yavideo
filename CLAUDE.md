# yavideo — memoria del proyecto

SaaS multi-tenant del holding Olcas para generar **contenido en vídeo a escala** con
plantillas. Los clientes pagan una **suscripción mensual** y acceden a un **catálogo
de 19 automatizaciones**; cada una es una composición **Remotion** + un esquema de
inputs (Zod) + un handler en la cola de render. yavideo es **una sola app**.

## Stack
- **Next.js 16** (App Router, React 19, TypeScript) — web + API + Server Actions.
- **Remotion 4** (`@remotion/renderer` + `@remotion/bundler`) — motor de render.
- **BullMQ + Redis** — cola de trabajos de render (worker aparte).
- **PostgreSQL 17 + Drizzle ORM** — datos (driver `postgres` JS puro).
- **Auth.js v5 (NextAuth)** — Google OAuth + magic link (Resend). Sesión **JWT**.
- **Cloudflare R2** (S3-compatible) — almacenamiento de vídeos por link firmado.
- **Stripe** (mundo) + **Mercado Pago** (Colombia) — suscripciones.
- **Resend** (email) · **Evolution API** (WhatsApp, entrega) · Tailwind v4.

## Infra (holding Olcas)
- VPS alias `vps` (87.106.236.248). Proxy **Caddy** (SSL auto). PM2, sin Docker.
- Dominio: **yavideo.olcas.app** · Puerto: **4001** · DB: **yavideo_db**.
- Dos procesos PM2: `yavideo` (web) y `yavideo-worker` (render).
- CI/CD: push a `main` → GitHub Actions → `bash /var/www/yavideo/deploy.sh`.

## Comandos
```bash
pnpm dev            # desarrollo
pnpm build          # build de producción (next build)
pnpm start          # sirve producción (lee PORT)
pnpm worker         # worker de render (BullMQ + Remotion) -> tsx worker/index.ts
pnpm db:generate    # genera migraciones SQL desde el schema (no necesita DB)
pnpm db:migrate     # aplica migraciones (necesita DATABASE_URL)
pnpm studio         # Remotion Studio para editar composiciones
```

## Estructura esencial
```
remotion/                 Composiciones (catálogo visual). index.ts = registerRoot.
  compositions/Frases.tsx Plantilla de frases (activa).
worker/index.ts           Worker BullMQ: bundle + render + subida a R2 + borra temp.
src/
  middleware.ts           Protege /panel y /api/jobs (sesión JWT, edge).
  app/
    page.tsx              Landing.
    login/                Auth (Google + magic link).
    panel/                Panel del cliente (crear lotes, biblioteca).
    api/health            Healthcheck.
    api/auth/[...nextauth] Auth.js handlers.
    api/jobs              Crear (POST) y listar (GET) trabajos.
    api/jobs/[id]         Estado + assets con links firmados.
    api/{stripe,mercadopago}/webhook  Webhooks de pago (stubs hasta tener claves).
  lib/
    env.ts               Carga .env fuera de Next (worker, migraciones).
    db/                  schema.ts (Drizzle) + cliente + migrate.ts.
    auth/                config.ts (edge) + index.ts (con adapter Drizzle).
    queue/               Cola BullMQ (productor).
    storage/r2.ts        Cliente R2: presign subida/descarga, upload, delete.
    automations/         registry.ts (19 servicios) + schemas.ts (Zod).
    payments/            Planes + selección de proveedor (Stripe/MercadoPago).
```

## Reglas del proyecto
- **El disco del VPS no se llena**: las fuentes son efímeras (se borran tras procesar);
  las salidas van a **R2**; los datos pequeños (transcripciones) a Postgres.
- **Dentro de `src/lib/**` solo imports relativos** (los usa el worker vía `tsx`).
  `@/` solo en `app/`, `components/` y `middleware`.
- Todo lo sensible **en servidor**: validación con **Zod**, secretos solo en `.env`
  (gitignored) y GitHub Actions. Repos públicos: nunca subir `.env*`.
- Añadir una automatización = nueva composición en `remotion/` + entrada en
  `registry.ts` (`enabled: true`, `composition`) + esquema en `schemas.ts` + un
  `case` en `worker/index.ts`.
- No tocar otras apps del holding ni reusar el puerto 4001.

## Pendiente (rellenar en el .env del VPS)
- `AUTH_GOOGLE_ID/SECRET`, `RESEND_API_KEY`, claves `R2_*`, `STRIPE_*`,
  `MERCADOPAGO_*`. Mercado Pago: el usuario dará project id / application id
  (referencia en `C:\FUTBOL`, sin usar sus datos).
