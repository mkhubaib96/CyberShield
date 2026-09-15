import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Eye, FileSearch, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import type { Alert, ThreatLevel } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

const severityConfig: Record<ThreatLevel, { icon: typeof AlertTriangle; badge: string; rail: string; label: string }> = {
  low: { icon: ShieldCheck, badge: "bg-info/10 text-info border-info/15", rail: "border-l-info", label: "Low" },
  medium: { icon: AlertTriangle, badge: "bg-warning/10 text-warning border-warning/15", rail: "border-l-warning", label: "Medium" },
  high: { icon: ShieldAlert, badge: "bg-destructive/10 text-destructive border-destructive/15", rail: "border-l-destructive", label: "High" },
  critical: { icon: ShieldX, badge: "bg-destructive text-white border-transparent", rail: "border-l-destructive", label: "Critical" },
};

export function AlertCard({ alert }: { alert: Alert }) {
  const { updateAlert } = useStore();
  const config = severityConfig[alert.severity];
  const Icon = config.icon;
  const resolve = () => { updateAlert(alert.id, { status: "resolved", isRead: true }); toast.success("Incident marked as resolved"); };
  const read = () => updateAlert(alert.id, { isRead: true });

  return <div className={cn("group rounded-2xl border border-l-4 bg-card p-4 shadow-card transition-all hover:shadow-card-hover sm:p-5", config.rail, alert.status === "resolved" && "opacity-90")}>
    <div className="flex items-start gap-4">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", config.badge)}><Icon className="h-5 w-5" /></div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-display text-sm font-bold">{alert.threatType}</span><span className={cn("rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]", config.badge)}>{config.label} · {alert.riskScore}</span><span className="rounded-full border bg-muted/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{alert.confidence} confidence</span>{alert.status !== "open" && <span className="rounded-full bg-success/10 px-2 py-0.5 text-[9px] font-bold uppercase text-success">resolved</span>}</div><p className="mt-2 max-w-3xl text-sm leading-5 text-muted-foreground">{alert.summary}</p></div>{!alert.isRead && <span className="mt-1 h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-destructive ring-4 ring-destructive/10" />}</div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground"><span className="font-semibold text-foreground/80">{alert.childName}</span><span>{alert.platform}</span><span>{alert.timestamp}</span></div>
        <div className="mt-4 flex flex-wrap gap-2"><Dialog><DialogTrigger asChild><Button size="sm" variant="outline" className="rounded-lg"><FileSearch className="mr-1.5 h-3.5 w-3.5" />Details</Button></DialogTrigger><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle className="font-display text-2xl">{alert.threatType}</DialogTitle><DialogDescription>{alert.childName} · {alert.platform} · {config.label} risk · {alert.confidence} confidence</DialogDescription></DialogHeader><div className="space-y-5"><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Risk", `${alert.riskScore}/100`],["Severity", config.label],["Status", alert.status],["Detected", alert.timestamp]].map(([label, value]) => <div key={label} className="rounded-xl border bg-muted/30 p-3"><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>)}</div>{alert.sourceText && <div><p className="eyebrow">Observed content</p><blockquote className="mt-2 rounded-xl border bg-muted/20 p-4 text-sm leading-6">“{alert.sourceText}”</blockquote></div>}<div><p className="eyebrow">Why it was flagged</p><div className="mt-2 flex flex-wrap gap-2">{(alert.indicators ?? []).map((item) => <span key={item} className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">{item}</span>)}</div></div><div><p className="eyebrow">Recommended action</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{alert.recommendation}</p></div></div></DialogContent></Dialog><Button size="sm" variant="outline" className="rounded-lg" onClick={read} disabled={alert.isRead}><Eye className="mr-1.5 h-3.5 w-3.5" />{alert.isRead ? "Read" : "Mark read"}</Button>{alert.status === "open" && <Button size="sm" className="rounded-lg" onClick={resolve}><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />Resolve</Button>}</div>
      </div>
    </div>
  </div>;
}
