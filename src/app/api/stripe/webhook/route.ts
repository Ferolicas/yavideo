import { NextResponse } from "next/server";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

// Webhook de Stripe (mundo): activa/actualiza la suscripción del usuario.
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  if (!secret || !sig) {
    return NextResponse.json(
      { error: "Webhook sin firma o sin secreto" },
      { status: 400 },
    );
  }

  const { stripe, mapStripeStatus, planFromPriceId } = await import(
    "@/lib/payments/stripe"
  );
  const { upsertSubscription } = await import("@/lib/subscription");

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, sig, secret);
  } catch (e) {
    console.error("[stripe webhook] firma inválida:", e);
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  const periodEnd = (sub: Stripe.Subscription): Date | null => {
    const ts = (sub as unknown as { current_period_end?: number })
      .current_period_end;
    return ts ? new Date(ts * 1000) : null;
  };

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object;
        const userId = s.metadata?.userId;
        if (userId && s.subscription) {
          const sub = await stripe().subscriptions.retrieve(
            String(s.subscription),
          );
          const priceId = sub.items.data[0]?.price?.id;
          await upsertSubscription({
            userId,
            provider: "stripe",
            customerId: String(s.customer),
            subscriptionId: sub.id,
            plan: planFromPriceId(priceId),
            status: mapStripeStatus(sub.status),
            currentPeriodEnd: periodEnd(sub),
          });
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object;
        const userId = sub.metadata?.userId;
        if (userId) {
          const priceId = sub.items.data[0]?.price?.id;
          await upsertSubscription({
            userId,
            provider: "stripe",
            customerId: String(sub.customer),
            subscriptionId: sub.id,
            plan: planFromPriceId(priceId),
            status: mapStripeStatus(sub.status),
            currentPeriodEnd: periodEnd(sub),
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const userId = sub.metadata?.userId;
        if (userId) {
          await upsertSubscription({
            userId,
            provider: "stripe",
            customerId: String(sub.customer),
            subscriptionId: sub.id,
            plan: "free",
            status: "cancelled",
          });
        }
        break;
      }
    }
  } catch (e) {
    console.error("[stripe webhook] handler:", e);
    return NextResponse.json({ error: "Handler falló" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
