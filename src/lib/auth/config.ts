import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Configuración compartida y "edge-safe" (sin adapter ni DB).
// La usa el middleware para validar la sesión JWT sin tocar PostgreSQL.
export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  // Solo proveedores "edge-safe" aquí (sin adapter). El proveedor de email
  // (Resend, magic link) requiere adapter y vive solo en el config Node de
  // ./index.ts; si estuviera aquí, el middleware lanzaría MissingAdapter en
  // cada request a una ruta protegida y provocaría un bucle de redirección.
  providers: [Google],
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
