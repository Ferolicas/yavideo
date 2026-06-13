// Conversión EUR → COP en vivo (open.er-api.com, sin API key) con fallback.
// El euro es la moneda de referencia; Mercado Pago cobra el equivalente en COP.

const FALLBACK_EUR_COP = 4300;

export async function convertEurToCop(eur: number): Promise<number> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/EUR", {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      const rate = data?.rates?.COP;
      if (typeof rate === "number" && rate > 0) {
        return Math.round(eur * rate);
      }
    }
  } catch {
    // FX no disponible: usamos el fallback para no bloquear el cobro
  }
  return Math.round(eur * FALLBACK_EUR_COP);
}
