import { cn } from "@/lib/utils";
import { ArrowUpRight, Clock3, MonitorSmartphone, ShieldAlert } from "lucide-react";
import type { Child } from "@/lib/data";
import { SafetyScoreRing } from "./SafetyScoreRing";
import { useNavigate } from "react-router-dom";

const statusStyles = { safe: "bg-success/10 text-success border-success/15", warning: "bg-warning/10 text-warning border-warning/15", alert: "bg-destructive/10 text-destructive border-destructive/15" };
const statusLabels = { safe: "Protected", warning: "Review", alert: "Action required" };
const minutes = (total: number) => `${Math.floor(total / 60)}h ${total % 60}m`;

export function ChildCard({ child }: { child: Child }) {
  const navigate = useNavigate();
  return <button onClick={() => navigate(`/children?child=${child.id}`)} className="group w-full rounded-2xl border bg-card p-5 text-left shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/20 hover:shadow-card-hover">
    <div className="flex items-start justify-between gap-4"><div className="flex min-w-0 items-center gap-3"><div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white shadow-md"><span>{child.avatar}</span><span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-card bg-success" /></div><div className="min-w-0"><h3 className="truncate font-display font-semibold text-foreground">{child.name}</h3><p className="mt-0.5 text-[11px] text-muted-foreground">Age {child.age} · {child.ageGroup} years</p></div></div><span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide", statusStyles[child.status])}>{statusLabels[child.status]}</span></div>
    <div className="mt-5 flex items-center gap-4"><SafetyScoreRing score={child.safetyScore} size={82} strokeWidth={8} /><div className="min-w-0 flex-1 space-y-2 text-xs"><div className="flex items-center gap-2 text-muted-foreground"><Clock3 className="h-3.5 w-3.5" /><span>{minutes(child.screenTimeMinutes)} today</span></div><div className="flex items-center gap-2 text-muted-foreground"><ShieldAlert className="h-3.5 w-3.5" /><span>{child.recentAlerts} active signals</span></div><div className="flex items-center gap-2 text-muted-foreground"><MonitorSmartphone className="h-3.5 w-3.5" /><span>{child.platforms.length} services</span></div></div></div>
    <div className="mt-4 flex items-center justify-between gap-3"><div className="flex min-w-0 flex-wrap gap-1.5">{child.platforms.slice(0, 3).map((platform) => <span key={platform} className="rounded-md bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">{platform}</span>)}{child.platforms.length > 3 && <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">+{child.platforms.length - 3}</span>}</div><span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold text-muted-foreground opacity-0 transition group-hover:opacity-100">Open <ArrowUpRight className="h-3.5 w-3.5" /></span></div>
  </button>;
}
