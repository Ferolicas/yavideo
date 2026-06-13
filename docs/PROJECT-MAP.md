# PROJECT-MAP — yavideo

Mapa vivo del proyecto. Mantener al día con cada cambio relevante.

## Rutas (web)
| Ruta | Tipo | Auth | Descripción |
|---|---|---|---|
| `/` | Server | público | Landing: propuesta de valor + catálogo de 19 servicios. |
| `/login` | Server | público | Entrar con Google o magic link (Resend). |
| `/panel` | Server | requiere sesión | Crear lotes (frases) + ver estado en vivo. |
| `/panel/biblioteca` | Server | requiere sesión | Vídeos generados con links firmados de R2. |

## Endpoints (API)
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/health` | público | `{ "status": "ok" }` (healthcheck del deploy). |
| GET/POST | `/api/auth/[...nextauth]` | — | Handlers de Auth.js. |
| GET | `/api/jobs` | sesión | Lista los trabajos del usuario. |
| POST | `/api/jobs` | sesión | Crea un trabajo: valida con Zod y encola en BullMQ. |
| GET | `/api/jobs/[id]` | sesión | Estado del trabajo + assets con URL firmada. |
| POST | `/api/stripe/webhook` | firma | Webhook Stripe (stub hasta configurar claves). |
| POST | `/api/mercadopago/webhook` | — | Webhook Mercado Pago (stub hasta configurar). |

## Modelo de datos (PostgreSQL / Drizzle)
- **user / account / session / verificationToken** — Auth.js (Drizzle adapter).
- **jobs** — `id, userId, automation, status(queued|processing|done|error),
  progress, title, inputs(jsonb), error, outputCount, createdAt, updatedAt`.
- **assets** — biblioteca del cliente: `id, userId, jobId, kind(output|source),
  r2Key, label, bytes, mime, width, height, durationSec, meta, createdAt`.
- **subscriptions** — `userId(unique), provider(stripe|mercadopago), customerId,
  subscriptionId, plan, status, currentPeriodEnd`.
- **usage_counters** — límites por plan: `userId, period(YYYY-MM), videosRendered`
  (único por userId+period).

## Flujos clave
### Render de un lote (frases)
1. Cliente rellena el formulario en `/panel` → `POST /api/jobs`.
2. Validación Zod (`schemas.ts`) → fila en `jobs` (status `queued`) → `renderQueue.add`.
3. `yavideo-worker` toma el job: `bundle()` Remotion (una vez) → por cada frase
   `selectComposition` + `renderMedia` → sube el `.mp4` a **R2** → fila en `assets`
   → **borra el temporal del VPS** → actualiza `progress`.
4. Al terminar: `jobs.status = done`. El panel refresca por polling cada 4s.
5. `/panel/biblioteca` lista los assets con `presignDownload` (link firmado 1h).

### Auth
- Middleware (edge) valida la sesión **JWT** para `/panel` y `/api/jobs`.
- Magic link y Google pasan por el handler Node con adapter Drizzle.

## Almacenamiento (regla de oro)
- **Fuentes** (vídeos subidos / enlaces): efímeras, se borran tras procesar.
- **Salidas** (reels): en **R2** (`<userId>/<jobId>/<n>.mp4`), egress gratis.
- **Transcripciones** (subtítulos, futuro): en Postgres (KB) para re-editar sin re-subir.

## Estado del catálogo
- Activa: **frases**.
- Próximamente (18): catalogo-reels, subtitulos*, audiograma*, ventas-personalizado,
  invitaciones, cumpleanos, bienvenida, wrapped, graficas, inmuebles,
  producto-ecommerce, presupuestos, deportes, noticias, ab-ads, intros-outros,
  mockups, certificados. (* = necesita Whisper, ya disponible en el VPS.)

## Pendientes técnicos
- Conectar claves: Google, Resend, R2, Stripe, Mercado Pago.
- Subida directa a R2 (presigned multipart, hasta 4GB) e ingesta por enlace (yt-dlp).
- Integración Whisper para subtítulos/audiogramas.
- Gating por plan (usage_counters) y portal de suscripción.
