# yavideo — memoria del proyecto

SaaS multi-tenant del holding Olcas para generar **contenido en vídeo a escala** con
plantillas. Los clientes pagan una **suscripción mensual** y acceden a un **catálogo
de 19 automatizaciones**; cada una es una composición **Remotion** + un esquema de
inputs (Zod) + un handler en la cola de render. yavideo es **una sola app**.

- **URL:** https://yavideo.olcas.app · **Puerto:** 4001 · **DB:** `yavideo_db`
- **Repo:** público (Ferolicas/yavideo). CI/CD: push a `main` → deploy automático al VPS.

## Estado actual (act. 2026-06-17)
La app está **desplegada y viva** (PM2: `yavideo` + `yavideo-worker`, Redis arriba,
`/api/health` OK). El código compila limpio (Next 16, TS estricto).

**Funcionando y configurado en el `.env` del VPS:**
- **Auth** Google OAuth + magic link (Resend), sesión JWT. Claves de Google y Resend puestas.
- **R2** (Cloudflare) configurado y verificado de punta a punta (bucket `yavideo` creado,
  subida/descarga firmada/borrado OK). Es el almacén de los vídeos renderizados.
- **Resend** clave válida, dominio `olcas.app` verificado, remitente `yavideo@olcas.app`.
- **Pagos** Stripe (checkout + portal + webhook con firma) y Mercado Pago (preapproval +
  webhook con firma, EUR→COP en vivo). Claves y price ids de Stripe (`CREATOR`, `BUSINESS`)
  y de MP ya puestos. Gating por plan activo.
- **Worker** de render real (Remotion → R2), avisos por email al terminar el lote.

**Pendiente (ver detalle abajo):** registrar el redirect URI de Google en Google Cloud
Console; habilitar las 18 automatizaciones restantes; pulido de calidad (legales, rate
limit, error/loading, tests, CSP, SEO). Solo la automatización **`frases`** está activa.

## Stack
- **Next.js 16** (App Router, React 19, TypeScript) — web + API + Server Actions.
- **Remotion 4** (`@remotion/renderer` + `@remotion/bundler`) — motor de render.
- **BullMQ + Redis (ioredis)** — cola de trabajos de render (worker aparte).
- **PostgreSQL 17 + Drizzle ORM** — datos (driver `postgres` JS puro).
- **Auth.js v5 (NextAuth)** — Google OAuth + magic link (Resend). Sesión **JWT**.
- **Cloudflare R2** (S3-compatible, `@aws-sdk/client-s3`) — vídeos por link firmado.
- **Stripe** (mundo) + **Mercado Pago** (Colombia) — suscripciones.
- **Resend** (email) · **Evolution API** (WhatsApp, opcional) · Tailwind v4.

## Infra (holding Olcas)
- VPS Ubuntu 24.04, acceso `ssh vps` (root). Proxy **Caddy** (SSL auto). PM2, sin Docker.
- Dos procesos PM2: `yavideo` (web, `pnpm start`) y `yavideo-worker` (render, `pnpm worker`).
- CI/CD: push a `main` → GitHub Actions → `bash /var/www/yavideo/deploy.sh`
  (git reset, pnpm install, build, db:migrate, pm2 reload, healthcheck).
- Secretos solo en `/var/www/yavideo/.env` (VPS, root 600) y en `.env` local (gitignored).

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
  Root.tsx                Registro de <Composition>. compositions/Frases.tsx (activa).
worker/index.ts           Worker BullMQ: bundle + render + subida a R2 + borra temp + email.
src/
  proxy.ts                Middleware Next 16 (antes middleware.ts): protege /panel y /api/jobs.
  app/
    page.tsx              Landing. precios/ login/ panel/ (page, layout, biblioteca/).
    api/health            Healthcheck.
    api/auth/[...nextauth] Auth.js handlers.
    api/jobs              Crear (POST, con gating) y listar (GET) trabajos.
    api/jobs/[id]         Estado + assets con links firmados.
    api/checkout          Inicia checkout (Stripe o Mercado Pago según provider).
    api/portal            Portal de facturación de Stripe.
    api/{stripe,mercadopago}/webhook  Webhooks de pago (con verificación de firma).
  components/             panel-frases (crear lote + polling), boton-suscribir, boton-portal.
  lib/
    env.ts               Carga .env fuera de Next (worker, migraciones).
    db/                  schema.ts (Drizzle) + cliente + migrate.ts.
    auth/                config.ts (edge) + index.ts (con adapter Drizzle).
    queue/               Cola BullMQ (productor).
    storage/r2.ts        Cliente R2: presign subida/descarga, upload, delete.
    automations/         registry.ts (19 servicios) + schemas.ts (Zod) + types.ts.
    payments/            index.ts (planes), stripe.ts, mercadopago.ts, currency.ts.
    subscription.ts      Plan del usuario, uso mensual y gating (canRender).
    email.ts             Emails transaccionales (Resend).
```

## Modelo de datos (Drizzle, `src/lib/db/schema.ts`)
- Auth.js: `user`, `account`, `session`, `verificationToken`.
- `jobs` (lote de render: inputs, status, progress, outputCount).
- `assets` (cada vídeo en R2: r2Key, label, dimensiones, duración).
- `subscriptions` (una por usuario: provider, plan, status, currentPeriodEnd).
- `usage_counters` (vídeos renderizados por usuario y periodo YYYY-MM, para el gating).

## Planes (`src/lib/payments/index.ts`)
- **Free** 0€ — 5 vídeos/mes, con marca de agua.
- **Creator** 19€/mes — 150 vídeos/mes, sin marca de agua.
- **Business** 79€/mes — 1000 vídeos/mes, sin marca, prioridad y soporte.

## Variables de entorno
Plantilla en `.env.example`. Estado en producción (VPS):
- **App:** `NODE_ENV`, `PORT`, `APP_URL` ✓
- **Auth:** `AUTH_SECRET`, `AUTH_URL`, `AUTH_TRUST_HOST` ✓ · `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` ✓
- **DB/Cola:** `DATABASE_URL`, `REDIS_URL` ✓
- **Email:** `RESEND_API_KEY` ✓ · `EMAIL_FROM="yavideo <yavideo@olcas.app>"` ✓
- **R2:** `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` ✓ ·
  `R2_PUBLIC_BASE_URL` (opcional, vacío) · `R2_S3_ENDPOINT` (opcional; vacío = jurisdicción
  por defecto; usar `https://<account>.eu.r2.cloudflarestorage.com` para UE)
- **Stripe:** `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `STRIPE_PRICE_CREATOR`, `STRIPE_PRICE_BUSINESS` ✓ · (`STRIPE_PRICE_ID` legado: eliminar)
- **Mercado Pago:** `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_PUBLIC_KEY`,
  `MERCADOPAGO_CLIENT_ID`, `MERCADOPAGO_CLIENT_SECRET` ✓ · `MERCADOPAGO_WEBHOOK_SECRET` (vacío, recomendado)
- **Opcionales:** `HUBSPOT_ACCESS_TOKEN`, `EVOLUTION_API_*` (vacíos)

## Reglas del proyecto
- **El disco del VPS no se llena**: las fuentes son efímeras (se borran tras procesar);
  las salidas van a **R2**; los datos pequeños (transcripciones) a Postgres.
- **Dentro de `src/lib/**` solo imports relativos** (los usa el worker vía `tsx`).
  `@/` solo en `app/`, `components/` y `proxy.ts`.
- Todo lo sensible **en servidor**: validación con **Zod**, secretos solo en `.env`
  (gitignored, repo público) y GitHub Actions. Nunca subir `.env*`.
- No tocar otras apps del holding ni reusar el puerto 4001.

## Añadir una automatización
1. Nueva composición en `remotion/compositions/` y registrarla en `remotion/Root.tsx`.
2. Entrada en `registry.ts` con `enabled: true` y `composition`.
3. Esquema de inputs (Zod) en `schemas.ts` y registrarlo en `automationSchemas`.
4. Un `case` en el `switch` de `worker/index.ts` con su handler de render.

## Pendiente / próximos pasos
**Para que el login con Google funcione (acción externa, imprescindible):**
en Google Cloud Console → Credentials, añadir al cliente OAuth:
- Origen JS autorizado: `https://yavideo.olcas.app`
- Redirect URI: `https://yavideo.olcas.app/api/auth/callback/google`
(El magic link por email ya funciona; Google da `redirect_uri_mismatch` sin esto.)

**Producto:** habilitar las 18 automatizaciones restantes (hoy solo `frases`).

**Calidad (estándares del holding, aún sin hacer):**
- Páginas legales `/terminos` y `/privacidad` (el login ya las enlaza; las piden Stripe/MP y RGPD).
- Rate limiting en API routes con input (`/api/jobs`, `/api/checkout`).
- `error.tsx`, `loading.tsx`, `not-found.tsx` en rutas principales.
- Tests E2E (Playwright) de auth, pagos y creación de lotes.
- Cabecera `Content-Security-Policy` (faltan; el resto de headers de seguridad están).
- SEO: `sitemap.ts`, `robots.ts`, imagen OG y favicon.

**Higiene:** añadir `MERCADOPAGO_WEBHOOK_SECRET` y eliminar la clave legada `STRIPE_PRICE_ID`.
