import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, CheckCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCard } from "@/components/AlertCard";
import { useStore } from "@/lib/store";
import type { ThreatLevel } from "@/lib/data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const filters: Array<{ label: string; value: ThreatLevel | "all" }> = [{ label: "All", value: "all" }, { label: "Critical", value: "critical" }, { label: "High", value: "high" }, { label: "Medium", value: "medium" }, { label: "Low", value: "low" }];

export default function Alerts() {
  const { alerts, updateAlert } = useStore();
  const [activeFilter, setActiveFilter] = useState<ThreatLevel | "all">("all");
  const [search, setSearch] = useState("");
  const [showResolved, setShowResolved] = useState(false);
  const filtered = useMemo(() => alerts.filter((a) => (showResolved || a.status === "open") && (activeFilter === "all" || a.severity === activeFilter) && `${a.threatType} ${a.childName} ${a.platform} ${a.summary}`.toLowerCase().includes(search.toLowerCase())), [alerts, activeFilter, search, showResolved]);
  const unreadOpen = alerts.filter((a) => a.status === "open" && !a.isRead);

  return <div className="space-y-6"><div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><h1 className="font-display text-3xl font-bold tracking-tight">Alerts</h1><p className="mt-1 text-muted-foreground">Review, triage and resolve detected safety events.</p></div><Button variant="outline" onClick={() => { unreadOpen.forEach((a) => updateAlert(a.id, { isRead: true })); toast.success(`${unreadOpen.length} alert${unreadOpen.length === 1 ? "" : "s"} marked as read`); }} disabled={!unreadOpen.length}><CheckCheck className="mr-2 h-4 w-4" />Mark all read</Button></div>
    <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-card sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search alerts, children or platforms..." /></div><Button variant={showResolved ? "default" : "outline"} onClick={() => setShowResolved((v) => !v)}><SlidersHorizontal className="mr-2 h-4 w-4" />{showResolved ? "Showing resolved" : "Open only"}</Button></div>
    <div className="flex flex-wrap gap-2">{filters.map((filter) => <button key={filter.value} onClick={() => setActiveFilter(filter.value)} className={cn("rounded-lg px-3 py-1.5 text-sm font-medium transition", activeFilter === filter.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>{filter.label}</button>)}</div>
    <div className="space-y-3">{filtered.map((alert) => <AlertCard key={alert.id} alert={alert} />)}{!filtered.length && <div className="rounded-2xl border bg-card p-12 text-center"><p className="font-semibold">No matching alerts</p><p className="mt-1 text-sm text-muted-foreground">Try another filter or search term.</p></div>}</div>
  </div>;
}
