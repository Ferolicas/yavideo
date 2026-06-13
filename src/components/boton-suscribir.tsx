"use client";

import { useState } from "react";

export function BotonSuscribir({
  plan,
  provider = "stripe",
  className,
  children,
}: {
  plan: string;
  provider?: "stripe" | "mercadopago";
  className?: string;
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);

  async function go() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, provider }),
      });
      if (res.status === 401) {
        window.location.href = `/login?next=/precios`;
        return;
      }
      const data = await res.json().catch(() => null);
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert(data?.error ?? "No se pudo iniciar el pago");
        setLoading(false);
      }
    } catch {
      alert("Error de red al iniciar el pago");
      setLoading(false);
    }
  }

  return (
    <button onClick={go} disabled={loading} className={className}>
      {loading ? "Redirigiendo…" : children}
    </button>
  );
}
