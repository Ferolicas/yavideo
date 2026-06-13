import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { getAutomation } from "@/lib/automations/registry";
import { getSchema } from "@/lib/automations/schemas";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const rows = await db
    .select()
    .from(jobs)
    .where(eq(jobs.userId, session.user.id))
    .orderBy(desc(jobs.createdAt))
    .limit(50);
  return NextResponse.json({ jobs: rows });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const automationKey = body?.automation as string | undefined;
  const auto = automationKey ? getAutomation(automationKey) : undefined;
  if (!auto || !auto.enabled) {
    return NextResponse.json(
      { error: "Automatización no disponible" },
      { status: 400 },
    );
  }

  const schema = getSchema(auto.key);
  if (!schema) {
    return NextResponse.json(
      { error: "Esta automatización aún no acepta entradas" },
      { status: 400 },
    );
  }

  const parsed = schema.safeParse(body?.inputs);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const [row] = await db
    .insert(jobs)
    .values({
      userId: session.user.id,
      automation: auto.key,
      title: auto.name,
      inputs: parsed.data,
      status: "queued",
    })
    .returning();

  // Carga diferida: no instancia BullMQ/Redis en el build ni al importar la ruta.
  const { enqueueRender } = await import("@/lib/queue");
  await enqueueRender({
    jobId: row.id,
    userId: session.user.id,
    automation: auto.key,
  });

  return NextResponse.json({ job: row }, { status: 201 });
}
