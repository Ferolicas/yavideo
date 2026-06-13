import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assets } from "@/lib/db/schema";
import { presignDownload, r2Configured } from "@/lib/storage/r2";
import { formatBytes } from "@/lib/utils";

export const metadata = { title: "Biblioteca" };
export const dynamic = "force-dynamic";

export default async function BibliotecaPage() {
  const session = await auth();
  const userId = session!.user.id;

  const rows = await db
    .select()
    .from(assets)
    .where(eq(assets.userId, userId))
    .orderBy(desc(assets.createdAt))
    .limit(200);

  const configured = r2Configured();
  const items = configured
    ? await Promise.all(
        rows.map(async (r) => ({
          ...r,
          url: await presignDownload(r.r2Key, 3600),
        })),
      )
    : rows.map((r) => ({ ...r, url: null as string | null }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Tu biblioteca</h1>
        <p className="text-white/60 mt-1">
          Tus vídeos generados. Los enlaces de descarga caducan por seguridad.
        </p>
      </div>

      {!configured ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          El almacenamiento R2 aún no está configurado en el servidor. Cuando se
          añadan las claves R2 al .env, tus vídeos aparecerán aquí.
        </div>
      ) : null}

      {items.length === 0 ? (
        <p className="text-sm text-white/50">
          Todavía no hay vídeos. Crea un lote desde el panel.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden"
            >
              {a.url ? (
                <video
                  src={a.url}
                  controls
                  className="w-full aspect-[9/16] bg-black object-cover"
                />
              ) : (
                <div className="w-full aspect-[9/16] bg-black/60" />
              )}
              <div className="p-3">
                <p className="text-xs text-white/70 truncate" title={a.label ?? ""}>
                  {a.label ?? "Vídeo"}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] text-white/40">
                    {formatBytes(a.bytes)}
                  </span>
                  {a.url ? (
                    <a
                      href={a.url}
                      download
                      className="text-[11px] text-brand underline underline-offset-2"
                    >
                      Descargar
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
