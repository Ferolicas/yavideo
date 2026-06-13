import Link from "next/link";
import { PanelFrases } from "@/components/panel-frases";
import { BotonPortal } from "@/components/boton-portal";
import { automations } from "@/lib/automations/registry";
import { auth } from "@/lib/auth";
import { getUserPlan, getUsage } from "@/lib/subscription";
import { PLANS } from "@/lib/payments";

export const metadata = { title: "Panel" };
export const dynamic = "force-dynamic";

export default async function PanelPage({
  searchParams,
}: {
  searchParams: Promise<{ suscripcion?: string }>;
}) {
  const sp = await searchParams;
  const session = await auth();
  const userId = session!.user.id;
  const [plan, used] = await Promise.all([
    getUserPlan(userId),
    getUsage(userId),
  ]);
  const planCfg = PLANS[plan];
  const proximamente = automations.filter((a) => !a.enabled);

  return (
    <div className="space-y-12">
      {sp.suscripcion === "ok" ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          ¡Suscripción activada! Si tu plan tarda en reflejarse, recarga en unos
          segundos.
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Crea tu contenido
          </h1>
          <p className="text-white/60 mt-1">
            Elige una automatización, rellena tus datos y deja que las plantillas
            hagan el resto.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
          <div className="font-semibold">
            Plan {planCfg.name}{" "}
            <span className="text-white/50 font-normal">
              · {used}/{planCfg.monthlyVideos} vídeos este mes
            </span>
          </div>
          <div className="mt-1">
            {plan === "free" ? (
              <Link
                href="/precios"
                className="text-brand underline underline-offset-2"
              >
                Mejorar plan
              </Link>
            ) : (
              <BotonPortal className="text-brand underline underline-offset-2" />
            )}
          </div>
        </div>
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
