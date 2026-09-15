import { useState } from "react";
import { RefreshCw, Wifi, WifiOff, Pause, Play, ShieldCheck, Activity, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const statusConfig = {
  active: { icon: Wifi, label: "Active", className: "text-success bg-success/10" },
  paused: { icon: Pause, label: "Paused", className: "text-warning bg-warning/10" },
  disconnected: { icon: WifiOff, label: "Disconnected", className: "text-destructive bg-destructive/10" },
} as const;

export default function Platforms() {
  const { platforms, togglePlatform } = useStore();
  const [syncing, setSyncing] = useState<string | null>(null);

  const sync = (name: string) => {
    setSyncing(name);
    window.setTimeout(() => {
      setSyncing(null);
      toast.success(`${name} sync simulation completed`);
    }, 650);
  };

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary"><ShieldCheck className="h-4 w-4" /> Connected services</div><h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Platforms</h1><p className="mt-1 max-w-2xl text-muted-foreground">Manage simulated integrations and inspect the event volume feeding CyberShield's detection pipeline.</p></div>
      <Link to="/simulator" className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-2.5 text-sm font-semibold shadow-card transition hover:bg-muted"><Activity className="h-4 w-4 text-secondary" />Test event flow <ExternalLink className="h-3.5 w-3.5" /></Link>
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded-2xl border bg-card p-5 shadow-card"><p className="text-xs text-muted-foreground">Connected</p><p className="mt-1 font-display text-2xl font-bold">{platforms.filter((p) => p.status === "active").length}</p></div>
      <div className="rounded-2xl border bg-card p-5 shadow-card"><p className="text-xs text-muted-foreground">Events modeled</p><p className="mt-1 font-display text-2xl font-bold">{platforms.reduce((sum, p) => sum + p.monitoredEvents, 0)}</p></div>
      <div className="rounded-2xl border bg-card p-5 shadow-card"><p className="text-xs text-muted-foreground">Threats blocked</p><p className="mt-1 font-display text-2xl font-bold">{platforms.reduce((sum, p) => sum + p.threatsBlocked, 0)}</p></div>
    </div>

    <div className="rounded-2xl border bg-secondary/5 p-4 text-sm text-muted-foreground"><strong className="text-foreground">Demo boundary:</strong> these are simulated platform records. CyberShield does not secretly monitor third-party accounts. Real monitoring requires explicit consent, platform permissions and authorized APIs/device services.</div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {platforms.map((p) => {
        const cfg = statusConfig[p.status];
        const Icon = cfg.icon;
        return <div key={p.name} className="rounded-2xl border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover">
          <div className="flex items-start justify-between gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-xl">{p.icon}</div><span className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", cfg.className)}><Icon className="h-3 w-3" />{cfg.label}</span></div>
          <h3 className="mt-4 font-display font-semibold">{p.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{p.children.length ? `For ${p.children.join(", ")}` : "No children assigned"}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-muted/50 p-3"><p className="text-[10px] text-muted-foreground">Threats blocked</p><p className="mt-0.5 font-semibold">{p.threatsBlocked}</p></div>
            <div className="rounded-xl bg-muted/50 p-3"><p className="text-[10px] text-muted-foreground">Events</p><p className="mt-0.5 font-semibold">{p.monitoredEvents}</p></div>
          </div>
          <div className="mt-3 rounded-xl border bg-background px-3 py-2.5"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Last sync</p><p className="mt-0.5 text-xs font-semibold">{p.lastSync}</p></div>
          <div className="mt-4 flex gap-2"><Button variant="outline" size="sm" className="flex-1" onClick={() => sync(p.name)} disabled={syncing === p.name}><RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", syncing === p.name && "animate-spin")} />Sync</Button><Button size="sm" variant={p.status === "active" ? "secondary" : "default"} onClick={() => { togglePlatform(p.name); toast.success(`${p.name} ${p.status === "active" ? "paused" : "resumed"}`); }}>{p.status === "active" ? <><Pause className="mr-1.5 h-3.5 w-3.5" />Pause</> : <><Play className="mr-1.5 h-3.5 w-3.5" />Resume</>}</Button></div>
        </div>;
      })}
    </div>
  </div>;
}
