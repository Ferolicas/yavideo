import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Webhook de Mercado Pago (Colombia). Se implementa al conectar las claves
// (project id / application id) usando C:\FUTBOL solo como referencia.
export async function POST() {
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    return NextResponse.json({ received: true, configured: false });
  }
  // TODO(pagos): validar la notificación y actualizar la suscripción.
  return NextResponse.json({ received: true });
}
