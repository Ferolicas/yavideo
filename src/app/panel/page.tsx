import { PanelFrases } from "@/components/panel-frases";
import { automations } from "@/lib/automations/registry";

export const metadata = { title: "Panel" };

export default function PanelPage() {
  const proximamente = automations.filter((a) => !a.enabled);

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Crea tu contenido
        </h1>
        <p className="text-white/60 mt-1">
          Elige una automatización, rellena tus datos y deja que las plantillas
          hagan el resto.
        </p>
      </div>

      <PanelFrases />

      <section>
        <h2 className="font-bold text-lg mb-3">Más automatizaciones</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {proximamente.map((a) => (
            <div
              key={a.key}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4 opacity-70"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{a.name}</h3>
                <span className="text-[11px] text-white/35">Próximamente</span>
              </div>
              <p className="text-xs text-white/50 mt-1">{a.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
