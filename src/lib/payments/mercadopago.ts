import "../env";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../env";
import { convertEurToCop } from "./currency";
import { PLANS, type PlanKey } from "./index";

const MP_API = "https://api.mercadopago.com";

function token(): string {
  return process.env.MERCADOPAGO_ACCESS_TOKEN ?? "";
}

// Crea una suscripción recurrente (preapproval). El importe en COP se fija a la
// tasa del día. Devuelve init_point (checkout alojado de MP) para redirigir.
export async function createPreapproval(opts: {
  userId: string;
  email: string;
  plan: PlanKey;
}): Promise<{ id: string; initPoint: string; amountCop: number }> {
  const cfg = PLANS[opts.plan];
  if (!cfg || cfg.eur <= 0) throw new Error("Plan inválido para Mercado Pago");
  const amountCop = await convertEurToCop(cfg.eur);

  const body = {
    reason: `yavideo — Plan ${cfg.name}`,
    external_reference: opts.userId,
    payer_email: opts.email,
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: amountCop,
      currency_id: "COP",
    },
    back_url: `${env.appUrl}/panel?suscripcion=ok`,
    status: "pending",
  };

  const res = await fetch(`${MP_API}/preapproval`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `MP preapproval ${res.status}: ${JSON.stringify(data).slice(0, 200)}`,
    );
  }
  return {
    id: data.id,
    initPoint: data.init_point,
    amountCop,
  };
}

// Relee el estado real de la suscripción desde MP (no confiamos en el webhook).
export async function getPreapproval(id: string) {
  const res = await fetch(`${MP_API}/preapproval/${id}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  return res.ok ? res.json() : null;
}

export function mpStatusToApp(mpStatus?: string): string {
  switch (mpStatus) {
    case "authorized":
      return "active";
    case "paused":
      return "past_due";
    case "cancelled":
      return "cancelled";
    default:
      return "inactive";
  }
}

// Verifica la firma del webhook (x-signature) según la spec de MP. Opcional:
// si no hay secreto, devuelve null y el caller confía en la re-lectura por API.
export function verifyMpSignature(
  req: Request,
  dataIdFromQuery: string | null,
): boolean | null {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");
  if (!secret || !xSignature) return null;
  try {
    let ts: string | undefined;
    let v1: string | undefined;
    for (const part of xSignature.split(",")) {
      const idx = part.indexOf("=");
      if (idx === -1) continue;
      const key = part.slice(0, idx).trim();
      const val = part.slice(idx + 1).trim();
      if (key === "ts") ts = val;
      else if (key === "v1") v1 = val;
    }
    if (!ts || !v1) return false;
    const rawId = String(dataIdFromQuery ?? "");
    const id = /[A-Z]/.test(rawId) ? rawId.toLowerCase() : rawId;
    const manifest = `id:${id};request-id:${xRequestId};ts:${ts};`;
    const expected = createHmac("sha256", secret).update(manifest).digest("hex");
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(v1, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
