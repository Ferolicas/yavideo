import "../env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url =
  process.env.DATABASE_URL ?? "postgresql://localhost:5432/yavideo_db";

// Singleton para no abrir múltiples pools en dev (hot reload) ni en el worker.
const globalForDb = globalThis as unknown as {
  _pgClient?: ReturnType<typeof postgres>;
};

// postgres-js conecta de forma perezosa (en la primera query), así que importar
// este módulo durante `next build` no abre conexiones.
const client = globalForDb._pgClient ?? postgres(url, { max: 10 });
if (process.env.NODE_ENV !== "production") globalForDb._pgClient = client;

export const db = drizzle(client, { schema });
export { schema };
