import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Activity, Globe, Lock, LogOut, MapPin, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminStats, lockAdmin, unlockAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Private" },
      { name: "description", content: "Private area." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Private" },
      { property: "og:description", content: "Private area." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const fetchStats = useServerFn(getAdminStats);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-stats"], queryFn: () => fetchStats(), refetchInterval: (query) => (query.state.data && !query.state.data.locked ? 10000 : false) });
  if (q.isLoading) return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>;
  if (q.isError) return <div className="grid min-h-screen place-items-center text-muted-foreground">Couldn't load. Refresh to retry.</div>;
  if (!q.data || q.data.locked) return <LockScreen onUnlocked={() => qc.invalidateQueries({ queryKey: ["admin-stats"] })} />;
  return <Dashboard stats={q.data.stats} onLock={() => qc.invalidateQueries({ queryKey: ["admin-stats"] })} />;
}

function LockScreen({ onUnlocked }: { onUnlocked: () => void }) {
  const unlock = useServerFn(unlockAdmin);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr(false);
    try { const r = await unlock({ data: { password: pw } }); if (r.ok) onUnlocked(); else setErr(true); }
    catch { setErr(true); } finally { setBusy(false); }
  };
  return <main className="grid min-h-screen place-items-center bg-background px-4">
    <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-glass-border bg-glass p-6 shadow-glass backdrop-blur-xl">
      <Lock className="size-8 text-primary" />
      <h1 className="mt-3 font-display text-2xl font-medium">Admin access</h1>
      <p className="mt-1 text-sm text-muted-foreground">Enter the admin password to continue.</p>
      <input type="password" autoComplete="current-password" aria-label="Admin password" value={pw} onChange={(e) => setPw(e.target.value)} className="mt-4 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
      {err && <p className="mt-2 text-sm text-destructive">Incorrect password</p>}
      <Button type="submit" variant="ink" className="mt-4 h-11 w-full rounded-xl" disabled={!pw || busy}>{busy ? "Checking…" : "Unlock"}</Button>
    </form>
  </main>;
}

import type { AdminStats } from "@/lib/admin.functions";

function Dashboard({ stats, onLock }: { stats: AdminStats; onLock: () => void }) {
  const lock = useServerFn(lockAdmin);
  const cards = [
    { label: "Total users", value: stats.totalUsers, icon: Users },
    { label: "Active now (5 min)", value: stats.activeNow, icon: Activity },
    { label: "Active today", value: stats.activeToday, icon: Activity },
    { label: "Total app opens", value: stats.totalVisits, icon: Globe },
    { label: "AI requests (all time)", value: stats.aiRequests, icon: Sparkles },
    { label: "AI requests today", value: stats.aiToday, icon: Sparkles },
  ];
  return <main className="mx-auto min-h-screen max-w-5xl bg-background px-4 py-8">
    <div className="flex items-center justify-between gap-3">
      <div><h1 className="font-display text-3xl font-medium">Admin Dashboard</h1><p className="text-xs text-muted-foreground">Live · updates every 10s · {new Date(stats.updatedAt).toLocaleTimeString()}</p></div>
      <Button variant="outline" onClick={async () => { await lock(); onLock(); }}><LogOut /> Lock</Button>
    </div>
    <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
      {cards.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl border border-glass-border bg-glass p-4 shadow-glass">
        <Icon className="size-5 text-primary" /><p className="mt-2 text-3xl font-semibold">{value.toLocaleString()}</p><p className="text-xs text-muted-foreground">{label}</p>
      </div>)}
    </div>
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <List title="Top countries" icon={Globe} items={stats.countries} />
      <List title="Top cities" icon={MapPin} items={stats.cities} />
    </div>
  </main>;
}

function List({ title, icon: Icon, items }: { title: string; icon: typeof Globe; items: { name: string; count: number }[] }) {
  return <section className="rounded-2xl border border-glass-border bg-glass p-4 shadow-glass">
    <h2 className="flex items-center gap-2 font-semibold"><Icon className="size-4 text-primary" /> {title}</h2>
    {items.length ? <ul className="mt-3 space-y-2">{items.map((i) => <li key={i.name} className="flex justify-between text-sm"><span>{i.name}</span><span className="font-semibold">{i.count}</span></li>)}</ul>
      : <p className="mt-3 text-sm text-muted-foreground">No data yet.</p>}
  </section>;
}
