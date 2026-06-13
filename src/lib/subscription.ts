import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { subscriptions, usageCounters } from "./db/schema";
import { PLANS, type PlanKey } from "./payments";

export function currentPeriod(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function getSubscription(userId: string) {
  const [s] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);
  return s ?? null;
}

export async function getUserPlan(userId: string): Promise<PlanKey> {
  const s = await getSubscription(userId);
  if (s && s.status === "active" && (s.plan === "creator" || s.plan === "business")) {
    return s.plan;
  }
  return "free";
}

export async function getUsage(userId: string): Promise<number> {
  const [u] = await db
    .select()
    .from(usageCounters)
    .where(
      and(
        eq(usageCounters.userId, userId),
        eq(usageCounters.period, currentPeriod()),
      ),
    )
    .limit(1);
  return u?.videosRendered ?? 0;
}

export async function canRender(
  userId: string,
  count: number,
): Promise<{ allowed: boolean; plan: PlanKey; limit: number; used: number }> {
  const plan = await getUserPlan(userId);
  const limit = PLANS[plan].monthlyVideos;
  const used = await getUsage(userId);
  return { allowed: used + count <= limit, plan, limit, used };
}

export async function upsertSubscription(data: {
  userId: string;
  provider: string;
  customerId?: string | null;
  subscriptionId?: string | null;
  plan: string;
  status: string;
  currentPeriodEnd?: Date | null;
}) {
  await db
    .insert(subscriptions)
    .values({
      userId: data.userId,
      provider: data.provider,
      customerId: data.customerId ?? null,
      subscriptionId: data.subscriptionId ?? null,
      plan: data.plan,
      status: data.status,
      currentPeriodEnd: data.currentPeriodEnd ?? null,
    })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: {
        provider: data.provider,
        customerId: data.customerId ?? null,
        subscriptionId: data.subscriptionId ?? null,
        plan: data.plan,
        status: data.status,
        currentPeriodEnd: data.currentPeriodEnd ?? null,
        updatedAt: new Date(),
      },
    });
}
