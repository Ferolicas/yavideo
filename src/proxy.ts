import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";

// Proxy (antes "middleware") edge: valida la sesión JWT sin tocar la base de datos.
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // Protege el panel y las APIs de trabajos. El resto queda abierto.
  matcher: ["/panel/:path*", "/api/jobs/:path*"],
};
