// Carga .env en process.env para contextos fuera de Next (worker, migraciones).
// En Next las variables ya están cargadas; aquí solo rellenamos las que falten.
import fs from "node:fs";
import path from "node:path";

(function loadEnv() {
  try {
    const p = path.resolve(process.cwd(), ".env");
    if (!fs.existsSync(p)) return;
    const txt = fs.readFileSync(p, "utf8");
    for (const raw of txt.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const k = line.slice(0, eq).trim();
      if (process.env[k] !== undefined && process.env[k] !== "") continue;
      let v = line.slice(eq + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      process.env[k] = v;
    }
  } catch {
    // sin .env (p.ej. en CI): se usan las variables ya presentes
  }
})();

export const env = {
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL ?? "",
  redisUrl: process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
  emailFrom: process.env.EMAIL_FROM ?? "yavideo <no-reply@olcas.app>",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  r2: {
    accountId: process.env.R2_ACCOUNT_ID ?? "",
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
    bucket: process.env.R2_BUCKET ?? "yavideo",
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL ?? "",
  },
  isProd: process.env.NODE_ENV === "production",
};
