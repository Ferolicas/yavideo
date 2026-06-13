import Link from "next/link";
import { automations } from "@/lib/automations/registry";

const categoryLabel: Record<string, string> = {
  redes: "Redes",
  datos: "Desde datos",
  personalizado: "Personalizado",
  publicidad: "Publicidad",
};

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Cabecera */}
      <header className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <div className="text-xl font-extrabold tracking-tight">
          ya<span className="brand-text">video</span>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/precios" className="text-white/70 hover:text-white transition">
            Precios
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-full brand-gradient font-semibold hover:opacity-90 transition"
          >
            Entrar
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="px-6 pt-16 pb-20 max-w-4xl mx-auto w-full text-center">
        <p className="inline-block text-xs font-semibold uppercase tracking-widest text-white/50 mb-5">
          Vídeo automatizado con plantillas · Remotion
        </p>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.05]">
          Tu contenido en vídeo,
          <br />
          <span className="brand-text">a escala y sin editar</span>
        </h1>
        <p className="mt-6 text-lg text-white/70 max-w-2xl mx-auto">
          Rellena tus datos —una lista de frases, tu catálogo, tus clientes— y
          recibe decenas de vídeos verticales listos para subir. Las plantillas
          hacen el trabajo del editor. Tú solo eliges y publicas.
        </p>
        <div className="mt-9 flex items-center justify-center gap-4">
          <Link
            href="/login"
            className="px-6 py-3 rounded-full brand-gradient font-semibold hover:opacity-90 transition"
          >
            Empezar gratis
          </Link>
          <a
            href="#catalogo"
            className="px-6 py-3 rounded-full border border-white/15 font-semibold hover:bg-white/5 transition"
          >
            Ver el catálogo
          </a>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="px-6 py-12 max-w-5xl mx-auto w-full">
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              n: "1",
              t: "Rellena tus inputs",
              d: "Sube tu lista, tu catálogo o tus datos. Elige tu marca y colores.",
            },
            {
              n: "2",
              t: "Se renderiza solo",
              d: "Nuestra cola genera un vídeo por cada elemento con tu plantilla.",
            },
            {
              n: "3",
              t: "Descarga y publica",
              d: "Tus vídeos quedan en tu biblioteca, listos para Reels, TikTok y Shorts.",
            },
          ].map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="w-9 h-9 rounded-full brand-gradient flex items-center justify-center font-bold mb-4">
                {s.n}
              </div>
              <h3 className="font-bold text-lg">{s.t}</h3>
              <p className="mt-2 text-sm text-white/65">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Catálogo */}
      <section id="catalogo" className="px-6 py-16 max-w-6xl mx-auto w-full">
        <h2 className="text-3xl font-extrabold tracking-tight text-center">
          19 servicios, una sola plataforma
        </h2>
        <p className="text-center text-white/60 mt-3 max-w-2xl mx-auto">
          Cada servicio es una plantilla. Empezamos por las frases
          motivacionales; el resto llega pronto al mismo panel.
        </p>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {automations.map((a) => (
            <div
              key={a.key}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-wider text-white/40">
                  {categoryLabel[a.category]}
                </span>
                {a.enabled ? (
                  <span className="text-[11px] font-semibold text-emerald-400">
                    Disponible
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-white/35">
                    Próximamente
                  </span>
                )}
              </div>
              <h3 className="font-bold">{a.name}</h3>
              <p className="mt-1.5 text-sm text-white/60">{a.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="px-6 py-20 max-w-3xl mx-auto w-full text-center">
        <h2 className="text-4xl font-extrabold tracking-tight">
          Empieza a producir hoy
        </h2>
        <p className="mt-4 text-white/70">
          Crea tu cuenta y genera tu primer lote de vídeos en minutos.
        </p>
        <Link
          href="/login"
          className="inline-block mt-8 px-7 py-3 rounded-full brand-gradient font-semibold hover:opacity-90 transition"
        >
          Crear cuenta
        </Link>
      </section>

      <footer className="mt-auto px-6 py-8 border-t border-white/10 text-center text-sm text-white/40">
        © {new Date().getFullYear()} yavideo · Parte del holding Olcas
      </footer>
    </div>
  );
}
