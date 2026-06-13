import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex flex-col min-h-full">
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/panel" className="text-lg font-extrabold tracking-tight">
              ya<span className="brand-text">video</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm text-white/70">
              <Link href="/panel" className="hover:text-white transition">
                Panel
              </Link>
              <Link
                href="/panel/biblioteca"
                className="hover:text-white transition"
              >
                Biblioteca
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-white/50 hidden sm:inline">
              {session.user.email}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button className="text-white/70 hover:text-white transition">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">{children}</main>
    </div>
  );
}
