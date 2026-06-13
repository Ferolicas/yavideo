"use client";

import { useCallback, useEffect, useState } from "react";

type JobRow = {
  id: string;
  automation: string;
  status: string;
  progress: number;
  title: string | null;
  outputCount: number;
  error: string | null;
  createdAt: string;
};

const statusLabel: Record<string, string> = {
  queued: "En cola",
  processing: "Renderizando",
  done: "Listo",
  error: "Error",
};

const statusColor: Record<string, string> = {
  queued: "text-white/60",
  processing: "text-amber-400",
  done: "text-emerald-400",
  error: "text-red-400",
};

export function PanelFrases() {
  const [frases, setFrases] = useState("");
  const [marca, setMarca] = useState("");
  const [usuario, setUsuario] = useState("");
  const [colorFondo, setColorFondo] = useState("#0ea5e9");
  const [colorTexto, setColorTexto] = useState("#ffffff");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobRow[]>([]);

  const loadJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/jobs", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setJobs(data.jobs ?? []);
    } catch {
      // silencioso: reintenta en el siguiente tick
    }
  }, []);

  useEffect(() => {
    loadJobs();
    const t = setInterval(loadJobs, 4000);
    return () => clearInterval(t);
  }, [loadJobs]);

  async function submit() {
    setError(null);
    const list = frases
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (list.length === 0) {
      setError("Escribe al menos una frase (una por línea).");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          automation: "frases",
          inputs: { frases: list, marca, usuario, colorFondo, colorTexto },
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(
          typeof data?.error === "string"
            ? data.error
            : "No se pudo crear el lote. Revisa los datos.",
        );
        return;
      }
      setFrases("");
      await loadJobs();
    } catch {
      setError("Error de red al crear el lote.");
    } finally {
      setSubmitting(false);
    }
  }

  const fraseCount = frases.split("\n").filter((l) => l.trim()).length;

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Formulario */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="font-bold text-lg">Frases motivacionales</h2>
        <p className="text-sm text-white/55 mt-1">
          Una frase por línea. Se genera un vídeo vertical por cada frase.
        </p>

        <label className="block text-sm font-medium mt-5 mb-1.5">
          Frases ({fraseCount})
        </label>
        <textarea
          value={frases}
          onChange={(e) => setFrases(e.target.value)}
          rows={8}
          placeholder={"La disciplina vence al talento.\nHazlo aunque tengas miedo.\nUn paso cada día."}
          className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/15 outline-none focus:border-brand transition text-sm resize-y"
        />

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Marca</label>
            <input
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              placeholder="Tu Marca"
              className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/15 outline-none focus:border-brand transition text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Usuario</label>
            <input
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="@tumarca"
              className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/15 outline-none focus:border-brand transition text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Color de fondo
            </label>
            <input
              type="color"
              value={colorFondo}
              onChange={(e) => setColorFondo(e.target.value)}
              className="w-full h-10 rounded-xl bg-black/40 border border-white/15"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Color de texto
            </label>
            <input
              type="color"
              value={colorTexto}
              onChange={(e) => setColorTexto(e.target.value)}
              className="w-full h-10 rounded-xl bg-black/40 border border-white/15"
            />
          </div>
        </div>

        {error ? (
          <p className="mt-4 text-sm text-red-400">{error}</p>
        ) : null}

        <button
          onClick={submit}
          disabled={submitting}
          className="mt-5 w-full py-3 rounded-xl brand-gradient font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {submitting ? "Creando lote…" : `Generar ${fraseCount || ""} vídeo(s)`}
        </button>
      </div>

      {/* Trabajos */}
      <div>
        <h2 className="font-bold text-lg mb-3">Tus lotes</h2>
        {jobs.length === 0 ? (
          <p className="text-sm text-white/50">
            Aún no has creado ningún lote. Crea el primero a la izquierda.
          </p>
        ) : (
          <ul className="space-y-3">
            {jobs.map((j) => (
              <li
                key={j.id}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{j.title ?? j.automation}</span>
                  <span
                    className={`text-xs font-semibold ${statusColor[j.status] ?? "text-white/60"}`}
                  >
                    {statusLabel[j.status] ?? j.status}
                  </span>
                </div>
                {j.status === "processing" ? (
                  <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full brand-gradient transition-all"
                      style={{ width: `${j.progress}%` }}
                    />
                  </div>
                ) : null}
                {j.status === "error" && j.error ? (
                  <p className="mt-2 text-xs text-red-400">{j.error}</p>
                ) : null}
                {j.status === "done" ? (
                  <p className="mt-2 text-xs text-white/55">
                    {j.outputCount} vídeo(s) ·{" "}
                    <a
                      href="/panel/biblioteca"
                      className="text-brand underline underline-offset-2"
                    >
                      ver en biblioteca
                    </a>
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
