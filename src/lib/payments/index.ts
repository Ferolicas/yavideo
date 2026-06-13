import "../env";

// Capa de pagos con dos proveedores: Stripe (mundo) y Mercado Pago (Colombia).
// Las claves se rellenan en el .env del VPS cuando estén disponibles.

export type PaymentProvider = "stripe" | "mercadopago";
export type PlanKey = "free" | "creator" | "business";

export interface Plan {
  key: PlanKey;
  name: string;
  /** Vídeos renderizados incluidos por mes. */
  monthlyVideos: number;
  /** Marca de agua en los vídeos. */
  watermark: boolean;
  priceEur: number;
}

export const PLANS: Record<PlanKey, Plan> = {
  free: { key: "free", name: "Free", monthlyVideos: 5, watermark: true, priceEur: 0 },
  creator: {
    key: "creator",
    name: "Creator",
    monthlyVideos: 150,
    watermark: false,
    priceEur: 19,
  },
  business: {
    key: "business",
    name: "Business",
    monthlyVideos: 1000,
    watermark: false,
    priceEur: 79,
  },
};

// Colombia → Mercado Pago; resto del mundo → Stripe.
export function providerForCountry(country?: string | null): PaymentProvider {
  return (country ?? "").toUpperCase() === "CO" ? "mercadopago" : "stripe";
}

export function stripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

export function mercadoPagoConfigured(): boolean {
  return !!process.env.MERCADOPAGO_ACCESS_TOKEN;
}

export function paymentsConfigured(): boolean {
  return stripeConfigured() || mercadoPagoConfigured();
}
