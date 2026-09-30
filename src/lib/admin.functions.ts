import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";

type AdminSession = { unlocked?: boolean };
const config = () => ({
  password: process.env["SESSION_SECRET"]!,
  name: "cc-admin",
  maxAge: 60 * 60 * 12,
  cookie: { httpOnly: true, secure: true, sameSite: "none" as const, path: "/" },
});

function matches(a: string, b: string) {
  const x = createHash("sha256").update(a).digest();
  const y = createHash("sha256").update(b).digest();
  return timingSafeEqual(x, y);
}

export const unlockAdmin = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ password: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const expected = process.env["ADMIN_PASSWORD"];
    if (!expected || !matches(data.password, expected)) return { ok: false as const };
    const s = await useSession<AdminSession>(config());
    await s.update({ unlocked: true });
    return { ok: true as const };
  });

export const lockAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const s = await useSession<AdminSession>(config());
  await s.clear();
  return { ok: true };
});

export type AdminStats = {
  totalUsers: number; activeToday: number; activeNow: number; totalVisits: number;
  aiRequests: number; aiToday: number;
  countries: { name: string; count: number }[]; cities: { name: string; count: number }[];
  updatedAt: string;
};

export const getAdminStats = createServerFn({ method: "GET" }).handler(async (): Promise<{ locked: true } | { locked: false; stats: AdminStats }> => {
  const s = await useSession<AdminSession>(config());
  if (!s.data.unlocked) return { locked: true };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: rows, error } = await supabaseAdmin.from("app_events").select("visitor_id,event,city,country,created_at").order("created_at", { ascending: false }).limit(50000);
  if (error) throw new Error("Could not load analytics");
  const now = Date.now();
  const users = new Set<string>(), today = new Set<string>(), live = new Set<string>();
  const countryUsers = new Map<string, Set<string>>(), cityUsers = new Map<string, Set<string>>();
  let visits = 0, ai = 0, aiToday = 0;
  for (const r of rows ?? []) {
    const age = now - new Date(r.created_at).getTime();
    if (r.event === "ai") { ai++; if (age < 864e5) aiToday++; continue; }
    visits++; users.add(r.visitor_id);
    if (age < 864e5) today.add(r.visitor_id);
    if (age < 5 * 60e3) live.add(r.visitor_id);
    const c = r.country || "Unknown";
    (countryUsers.get(c) ?? countryUsers.set(c, new Set()).get(c)!).add(r.visitor_id);
    const city = r.city ? `${r.city}, ${c}` : `Unknown, ${c}`;
    (cityUsers.get(city) ?? cityUsers.set(city, new Set()).get(city)!).add(r.visitor_id);
  }
  const top = (m: Map<string, Set<string>>) => [...m].map(([name, v]) => ({ name, count: v.size })).sort((a, b) => b.count - a.count).slice(0, 12);
  return { locked: false, stats: { totalUsers: users.size, activeToday: today.size, activeNow: live.size, totalVisits: visits, aiRequests: ai, aiToday, countries: top(countryUsers), cities: top(cityUsers), updatedAt: new Date().toISOString() } };
});
