import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPlan, type PaymentProvider } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const plan = getPlan(body?.plan);
  const provider: PaymentProvider =
    body?.provider === "mercadopago" ? "mercadopago" : "stripe";

  if (!plan || plan.key === "free") {
    return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
  }

  try {
    if (provider === "mercadopago") {
      const { createPreapproval } = await import("@/lib/payments/mercadopago");
      const { initPoint } = await createPreapproval({
        userId: session.user.id,
        email: session.user.email,
        plan: plan.key,
      });
      return NextResponse.json({ url: initPoint });
    }
    const { createStripeCheckout } = await import("@/lib/payments/stripe");
    const url = await createStripeCheckout({
      userId: session.user.id,
      email: session.user.email,
      plan: plan.key,
    });
    return NextResponse.json({ url });
  } catch (e) {
    console.error("[checkout]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al iniciar el pago" },
      { status: 500 },
    );
  }
}
