# Decisiones — yavideo

Registro de decisiones tomadas durante el refinamiento.

## Monetización (2026-06-13)
- **Modelo:** suscripción mensual. Planes:
  - **Free** — 0€, 5 vídeos/mes, con marca de agua (`yavideo.olcas.app`).
  - **Creator** — 19€/mes, 150 vídeos/mes, sin marca de agua.
  - **Business** — 79€/mes, 1000 vídeos/mes, sin marca de agua, prioridad.
- **Proveedores:** Stripe (mundo) + Mercado Pago (Colombia). Precio de referencia
  único en EUR; MP convierte a COP en vivo (open.er-api.com, fallback 1€≈4300 COP).
- **Stripe:** Checkout hospedado (modo subscription) + Customer Portal. Webhook en
  `/api/stripe/webhook` (firma verificada). Precios creados vía API (live).
- **Mercado Pago:** preapproval recurrente (COP). Webhook en
  `/api/mercadopago/webhook` con re-lectura por API (fuente de verdad). Referencia
  de patrón: `C:\FUTBOL` (sin usar sus datos).
- **Gating:** límite mensual por plan (tabla `usage_counters`); al superarlo, la
  creación de lotes devuelve 402 y el panel invita a mejorar plan.

## Email (2026-06-13)
- **Resend** con dominio `olcas.app` verificado. Magic link de login + aviso
  "tu lote está listo" al terminar el render.

## Pendiente de configurar por el usuario
- Google OAuth (`AUTH_GOOGLE_ID/SECRET`) y Cloudflare R2 (`R2_*`): el usuario
  seguirá los pasos indicados. Sin R2, el render falla con aviso claro; sin Google,
  el login funciona igual por magic link.
- (Opcional) Webhook de Mercado Pago en el panel de MP apuntando a
  `https://yavideo.olcas.app/api/mercadopago/webhook` (topic preapproval) y, si se
  quiere validación de firma, `MERCADOPAGO_WEBHOOK_SECRET`.

## Producto y usuarios
- _Pendiente: bloque 1 de la entrevista (se interrumpió para implementar pagos)._
