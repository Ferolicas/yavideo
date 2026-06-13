import "../env";
import Stripe from "stripe";
import { env } from "../env";
import { PLANS, stripePriceId, type PlanKey } from "./index";

let _stripe: Stripe | null = null;
export function stripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY no configurado");
    _stripe = new Stripe(key);
  }
  return _stripe;
}

async function getOrCreateCustomer(email: string, userId: string) {
  const s = stripe();
  const found = await s.customers.list({ email, limit: 1 });
  if (found.data[0]) return found.data[0];
  return s.customers.create({ email, metadata: { userId } });
}

export async function createStripeCheckout(opts: {
  userId: string;
  email: string;
  plan: PlanKey;
}): Promise<string> {
  const price = stripePriceId(opts.plan);
  if (!price) throw new Error(`Sin price id de Stripe para el plan ${opts.plan}`);
  const customer = await getOrCreateCustomer(opts.email, opts.userId);
  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer: customer.id,
    line_items: [{ price, quantity: 1 }],
    success_url: `${env.appUrl}/panel?suscripcion=ok`,
    cancel_url: `${env.appUrl}/precios?cancelado=1`,
    allow_promotion_codes: true,
    subscription_data: { metadata: { userId: opts.userId, plan: opts.plan } },
    metadata: { userId: opts.userId, plan: opts.plan },
  });
  if (!session.url) throw new Error("Stripe no devolvió URL de checkout");
  return session.url;
}

export async function createStripePortal(customerId: string): Promise<string> {
  const ps = await stripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.appUrl}/panel`,
  });
  return ps.url;
}

export function mapStripeStatus(status: string): string {
  if (status === "active" || status === "trialing") return "active";
  if (status === "past_due" || status === "unpaid") return "past_due";
  if (status === "canceled") return "cancelled";
  return "inactive";
}

// Deduce el plan a partir del price id de una suscripción de Stripe.
export function planFromPriceId(priceId?: string | null): PlanKey {
  if (!priceId) return "free";
  for (const key of Object.keys(PLANS) as PlanKey[]) {
    if (stripePriceId(key) === priceId) return key;
  }
  return "free";
}
