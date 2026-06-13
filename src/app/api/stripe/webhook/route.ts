import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Webhook de Stripe (mundo). La verificación de firma con STRIPE_WEBHOOK_SECRET
// y el alta/baja de suscripción se implementan al conectar las claves de Stripe.
export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  if (!process.env.STRIPE_WEBHOOK_SECRET || !signature) {
    return NextResponse.json({ received: true, configured: false });
  }
  // TODO(pagos): construir el evento con stripe.webhooks.constructEvent(...)
  return NextResponse.json({ received: true });
}
