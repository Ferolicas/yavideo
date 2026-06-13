import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const sub = await getSubscription(session.user.id);
  if (!sub || sub.provider !== "stripe" || !sub.customerId) {
    return NextResponse.json(
      { error: "No hay suscripción de Stripe que gestionar" },
      { status: 400 },
    );
  }
  try {
    const { createStripePortal } = await import("@/lib/payments/stripe");
    const url = await createStripePortal(sub.customerId);
    return NextResponse.json({ url });
  } catch (e) {
    console.error("[portal]", e);
    return NextResponse.json({ error: "Error al abrir el portal" }, { status: 500 });
  }
}
