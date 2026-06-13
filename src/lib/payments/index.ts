import "../env";

// Capa de pagos con dos proveedores: Stripe (mundo) y Mercado Pago (Colombia).
// El precio de referencia único es EUR; Mercado Pago lo convierte a COP en vivo.

export type PaymentProvider = "stripe" | "mercadopago";
export type PlanKey = "free" | "creator" | "business";

export interface Plan {
  key: PlanKey;
  name: string;
  /** Vídeos renderizados incluidos por mes. */
  monthlyVideos: number;
  /** Marca de agua en los vídeos. */
  watermark: boolean;
  /** Precio de referencia mensual en EUR. */
  eur: number;
  /** Nombre de la variable de entorno con el price id de Stripe. */
  stripePriceEnv?: string;
  features: string[];
}

export const PLANS: Record<PlanKey, Plan> = {
  free: {
    key: "free",
    name: "Free",
    monthlyVideos: 5,
    watermark: true,
    eur: 0,
    features: ["5 vídeos al mes", "Con marca de agua", "Catálogo básico"],
  },
  creator: {
    key: "creator",
    name: "Creator",
    monthlyVideos: 150,
    watermark: false,
    eur: 19,
    stripePriceEnv: "STRIPE_PRICE_CREATOR",
    features: ["150 vídeos al mes", "Sin marca de agua", "Todas las plantillas activas"],
  },
  business: {
    key: "business",
    name: "Business",
    monthlyVideos: 1000,
    watermark: false,
    eur: 79,
    stripePriceEnv: "STRIPE_PRICE_BUSINESS",
    features: ["1000 vídeos al mes", "Sin marca de agua", "Prioridad de render", "Soporte directo"],
  },
};

export const PAID_PLANS: PlanKey[] = ["creator", "business"];

export function getPlan(key: string): Plan | undefined {
  return PLANS[key as PlanKey];
}

export function stripePriceId(key: PlanKey): string | undefined {
  const env = PLANS[key].stripePriceEnv;
  return env ? process.env[env] : undefined;
}

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
