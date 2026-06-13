import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";

export const metadata = { title: "Entrar" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/panel");

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="block text-center text-2xl font-extrabold tracking-tight mb-8"
        >
          ya<span className="brand-text">video</span>
        </Link>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
          <h1 className="text-xl font-bold text-center">Entra en tu cuenta</h1>
          <p className="text-sm text-white/60 text-center mt-1">
            Sin contraseñas. Usa Google o tu correo.
          </p>

          {/* Google */}
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/panel" });
            }}
            className="mt-6"
          >
            <button
              type="submit"
              className="w-full py-3 rounded-xl border border-white/15 font-semibold hover:bg-white/5 transition"
            >
              Continuar con Google
            </button>
          </form>

          <div className="flex items-center gap-3 my-5 text-white/30 text-xs">
            <div className="h-px flex-1 bg-white/10" />o<div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Magic link */}
          <form
            action={async (formData: FormData) => {
              "use server";
              const email = String(formData.get("email") ?? "").trim();
              if (!email) return;
              await signIn("resend", { email, redirectTo: "/panel" });
            }}
            className="space-y-3"
          >
            <input
              name="email"
              type="email"
              required
              placeholder="tu@correo.com"
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/15 outline-none focus:border-brand transition"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl brand-gradient font-semibold hover:opacity-90 transition"
            >
              Enviarme un enlace de acceso
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/40 mt-6">
          Al continuar aceptas los términos del servicio.
        </p>
      </div>
    </div>
  );
}
