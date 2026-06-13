import "../src/lib/env";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import { Worker, type Job } from "bullmq";
import IORedis from "ioredis";
import { eq, sql } from "drizzle-orm";
import { bundle } from "@remotion/bundler";
import {
  selectComposition,
  renderMedia,
  ensureBrowser,
} from "@remotion/renderer";
import { db } from "../src/lib/db";
import { jobs, assets, usageCounters, users } from "../src/lib/db/schema";
import { uploadBuffer, r2Configured } from "../src/lib/storage/r2";
import { RENDER_QUEUE, type RenderJobData } from "../src/lib/queue";
import type { FrasesInput } from "../src/lib/automations/schemas";
import { getUserPlan } from "../src/lib/subscription";
import { PLANS } from "../src/lib/payments";
import { sendJobDoneEmail } from "../src/lib/email";
import { env } from "../src/lib/env";

const url = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
const connection = new IORedis(url, { maxRetriesPerRequest: null });
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "yavideo-"));

// El bundle de Remotion se construye una vez y se reutiliza.
let _serveUrl: string | null = null;
async function getServeUrl(): Promise<string> {
  if (_serveUrl) return _serveUrl;
  await ensureBrowser();
  _serveUrl = await bundle({
    entryPoint: path.resolve(process.cwd(), "remotion/index.ts"),
  });
  return _serveUrl;
}

function period(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

async function incrementUsage(userId: string, count: number) {
  if (count <= 0) return;
  await db
    .insert(usageCounters)
    .values({ userId, period: period(), videosRendered: count })
    .onConflictDoUpdate({
      target: [usageCounters.userId, usageCounters.period],
      set: {
        videosRendered: sql`${usageCounters.videosRendered} + ${count}`,
      },
    });
}

async function fail(jobId: string, message: string) {
  console.error(`[job ${jobId}] error:`, message);
  await db
    .update(jobs)
    .set({ status: "error", error: message, updatedAt: new Date() })
    .where(eq(jobs.id, jobId));
}

type JobRow = typeof jobs.$inferSelect;

async function processFrases(row: JobRow): Promise<number> {
  const inputs = row.inputs as FrasesInput;
  const list = inputs.frases ?? [];
  const total = list.length;
  if (total === 0) throw new Error("No hay frases para renderizar.");

  // Plan del usuario → marca de agua en el plan Free.
  const plan = await getUserPlan(row.userId);
  const watermark = PLANS[plan].watermark;

  const serveUrl = await getServeUrl();
  let done = 0;

  for (const frase of list) {
    const inputProps = {
      frase,
      marca: inputs.marca ?? "",
      usuario: inputs.usuario ?? "",
      colorFondo: inputs.colorFondo ?? "0EA5E9",
      colorTexto: inputs.colorTexto ?? "FFFFFF",
      watermark,
    };

    const composition = await selectComposition({
      serveUrl,
      id: "frases",
      inputProps,
    });

    const outPath = path.join(tmpRoot, `${row.id}-${done}.mp4`);
    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation: outPath,
      inputProps,
      concurrency: 1,
    });

    const buf = fs.readFileSync(outPath);
    const key = `${row.userId}/${row.id}/${done + 1}.mp4`;
    await uploadBuffer(key, buf, "video/mp4");

    await db.insert(assets).values({
      userId: row.userId,
      jobId: row.id,
      kind: "output",
      r2Key: key,
      label: frase.slice(0, 60),
      bytes: buf.length,
      mime: "video/mp4",
      width: composition.width,
      height: composition.height,
      durationSec: Math.round(composition.durationInFrames / composition.fps),
    });

    // El fichero pesado se borra del VPS inmediatamente tras subirlo a R2.
    fs.rmSync(outPath, { force: true });

    done += 1;
    await db
      .update(jobs)
      .set({
        progress: Math.round((done / total) * 100),
        outputCount: done,
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, row.id));
  }

  await incrementUsage(row.userId, done);
  return done;
}

async function handle(job: Job<RenderJobData>) {
  const { jobId } = job.data;
  const [row] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
  if (!row) {
    console.warn(`[job ${jobId}] no existe en la BD; se ignora.`);
    return;
  }

  if (!r2Configured()) {
    await fail(
      row.id,
      "Almacenamiento R2 no configurado: añade R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY al .env del VPS.",
    );
    return;
  }

  await db
    .update(jobs)
    .set({ status: "processing", progress: 0, error: null, updatedAt: new Date() })
    .where(eq(jobs.id, row.id));

  try {
    let count = 0;
    switch (row.automation) {
      case "frases":
        count = await processFrases(row);
        break;
      default:
        throw new Error(`Automatización aún no disponible: ${row.automation}`);
    }
    await db
      .update(jobs)
      .set({ status: "done", progress: 100, updatedAt: new Date() })
      .where(eq(jobs.id, row.id));
    console.log(`[job ${row.id}] completado (${row.automation}, ${count} vídeos).`);

    // Aviso por email de que el lote está listo.
    try {
      const [u] = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, row.userId))
        .limit(1);
      if (u?.email) {
        await sendJobDoneEmail({ to: u.email, count, appUrl: env.appUrl });
      }
    } catch (e) {
      console.error("[job] email aviso:", e);
    }
  } catch (e) {
    await fail(row.id, e instanceof Error ? e.message : String(e));
  }
}

const worker = new Worker<RenderJobData>(RENDER_QUEUE, handle, {
  connection,
  concurrency: 1,
});

worker.on("ready", () => console.log("yavideo-worker listo. Esperando trabajos…"));
worker.on("failed", (job, err) =>
  console.error(`[job ${job?.id}] falló:`, err?.message),
);

process.on("SIGTERM", async () => {
  await worker.close();
  await connection.quit();
  process.exit(0);
});
