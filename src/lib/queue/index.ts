import "../env";
import { Queue } from "bullmq";

export const RENDER_QUEUE = "render";

export type RenderJobData = {
  jobId: string;
  userId: string;
  automation: string;
};

// Opciones de conexión (no una instancia ioredis): evita choques de versión de
// ioredis entre la app y BullMQ. lazyConnect: no conecta al importar (build).
function redisConnection() {
  const u = new URL(process.env.REDIS_URL ?? "redis://127.0.0.1:6379");
  return {
    host: u.hostname,
    port: u.port ? Number(u.port) : 6379,
    username: u.username || undefined,
    password: u.password || undefined,
    maxRetriesPerRequest: null,
    lazyConnect: true,
  };
}

const globalForQueue = globalThis as unknown as {
  _renderQueue?: Queue<RenderJobData, unknown, string>;
};

export const renderQueue =
  globalForQueue._renderQueue ??
  new Queue<RenderJobData, unknown, string>(RENDER_QUEUE, {
    connection: redisConnection(),
  });

if (process.env.NODE_ENV !== "production") {
  globalForQueue._renderQueue = renderQueue;
}

type AddFn = (
  name: string,
  data: RenderJobData,
  opts?: { removeOnComplete?: number; removeOnFail?: number },
) => Promise<unknown>;

// Encola un trabajo de render. El cast aísla la firma genérica de BullMQ.
export function enqueueRender(data: RenderJobData) {
  return (renderQueue.add as AddFn)("render", data, {
    removeOnComplete: 100,
    removeOnFail: 200,
  });
}
