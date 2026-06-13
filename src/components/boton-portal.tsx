"use client";

import { useState } from "react";

export function BotonPortal({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);
  async function go() {
    setLoading(true);
    try {
      const res = await fetch("/api/portal", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert(data?.error ?? "No se pudo abrir el portal");
        setLoading(false);
      }
    } catch {
      alert("Error de red");
      setLoading(false);
    }
  }
  return (
    <button onClick={go} disabled={loading} className={className}>
      {loading ? "Abriendo…" : "Gestionar suscripción"}
    </button>
  );
}
