import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { jobs, assets } from "@/lib/db/schema";
import { presignDownload } from "@/lib/storage/r2";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const { id } = await params;

  const [row] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, id), eq(jobs.userId, session.user.id)))
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const outs = await db.select().from(assets).where(eq(assets.jobId, id));
  const withUrls = await Promise.all(
    outs.map(async (a) => ({
      id: a.id,
      label: a.label,
      bytes: a.bytes,
      url: await presignDownload(a.r2Key, 3600),
    })),
  );

  return NextResponse.json({ job: row, assets: withUrls });
}
