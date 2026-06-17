import "../env";
import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "../db";
import { users, accounts, sessions, verificationTokens } from "../db/schema";
import { authConfig } from "./config";

// Configuración completa (runtime Node): añade el adapter Drizzle.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  // El proveedor de email (magic link) requiere el adapter, por eso se añade
  // aquí (Node) y no en el config edge que usa el middleware.
  providers: [
    ...authConfig.providers,
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM ?? "yavideo <yavideo@olcas.app>",
    }),
  ],
});
