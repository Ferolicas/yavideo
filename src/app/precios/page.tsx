import Link from "next/link";
import { PLANS } from "@/lib/payments";
import { BotonSuscribir } from "@/components/boton-suscribir";

export const metadata = { title: "Precios" };

export default function PreciosPage() {
  const order = [PLANS.free, PLANS.creator, PLANS.business];

  return (
    <div className="flex flex-col">
      <header className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          ya<span className="brand-text">video</span>
        </Link>
        <Link
          href="/login"
          className="px-4 py-2 rounded-full border border-white/15 text-sm font-semibold hover:bg-white/5 transition"
        >
          Entrar
        </Link>
      </header>

      <section className="px-6 pt-10 pb-6 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Precios simples
        </h1>
        <p className="mt-3 text-white/65">
          Suscripción mensual. Cancela cuando quieras. Pago con tarjeta (mundo) o
          Mercado Pago (Colombia).
        </p>
      </section>

      <section className="px-6 py-8 max-w-5xl mx-auto w-full grid md:grid-cols-3 gap-5">
        {order.map((p) => {
          const destacado = p.key === "creator";
          return (
            <div
              key={p.key}
              className={`rounded-2xl border p-6 flex flex-col ${
                destacado
                  ? "border-brand bg-white/[0.04]"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              {destacado ? (
                <span className="self-start text-[11px] font-bold uppercase tracking-wider brand-text mb-2">
                  Más popular
                </span>
              ) : null}
              <h2 className="text-xl font-bold">{p.name}</h2>
              <div className="mt-2">
                <span className="text-4xl font-extrabold">{p.eur}€</span>
                <span className="text-white/50"> / mes</span>
              </div>
              <ul className="mt-5 space-y-2 text-sm text-white/70 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-emerald-400">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-6 space-y-2">
                {p.key === "free" ? (
                  <Link
                    href="/login"
                    className="block text-center w-full py-3 rounded-xl border border-white/15 font-semibold hover:bg-white/5 transition"
                  >
                    Empezar gratis
                  </Link>
                ) : (
                  <>
                    <BotonSuscribir
                      plan={p.key}
                      provider="stripe"
                      className="block w-full py-3 rounded-xl brand-gradient font-semibold hover:opacity-90 transition disabled:opacity-50"
                    >
                      Suscribirme
                    </BotonSuscribir>
                    <BotonSuscribir
                      plan={p.key}
                      provider="mercadopago"
                      className="block w-full py-2 text-xs text-white/50 hover:text-white transition"
                    >
                      ¿En Colombia? Pagar con Mercado Pago
                    </BotonSuscribir>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </section>

      <footer className="mt-auto px-6 py-8 border-t border-white/10 text-center text-sm text-white/40">
        © {new Date().getFullYear()} yavideo · Parte del holding Olcas
      </footer>
    </div>
  );
}
