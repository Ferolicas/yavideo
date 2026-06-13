import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Webhook de Mercado Pago (Colombia): activa/actualiza la suscripción.
// No confiamos en el payload: releemos el preapproval desde la API de MP.
export async function POST(req: Request) {
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    return NextResponse.json({ received: true, configured: false });
  }

  const url = new URL(req.url);
  const dataId = url.searchParams.get("data.id") ?? url.searchParams.get("id");
  const topic = url.searchParams.get("type") ?? url.searchParams.get("topic");
  const body = await req.json().catch(() => null);
  const id = dataId ?? body?.data?.id ?? null;
  const kind = topic ?? body?.type ?? body?.action ?? "";

  const { verifyMpSignature, getPreapproval, mpStatusToApp } = await import(
    "@/lib/payments/mercadopago"
  );

  // Firma opcional: si hay secreto y no valida, rechazamos.
  if (verifyMpSignature(req, dataId) === false) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  // Solo nos interesan las suscripciones (preapproval).
  if (!id || (kind && !String(kind).includes("preapproval"))) {
    return NextResponse.json({ received: true, ignored: kind || "sin-id" });
  }

  try {
    const pre = await getPreapproval(String(id));
    if (pre?.external_reference) {
      const { upsertSubscription } = await import("@/lib/subscription");
      const reason: string = pre.reason ?? "";
      const plan = /business/i.test(reason) ? "business" : "creator";
      const status = mpStatusToApp(pre.status);
      await upsertSubscription({
        userId: pre.external_reference,
        provider: "mercadopago",
        customerId: pre.payer_id ? String(pre.payer_id) : null,
        subscriptionId: String(pre.id),
        plan: status === "active" ? plan : "free",
        status,
      });
    }
  } catch (e) {
    console.error("[mp webhook] handler:", e);
    return NextResponse.json({ error: "Handler falló" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
