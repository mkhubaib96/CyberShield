import { useMemo } from "react";
import { Activity, BarChart3, Download, Gauge, ShieldAlert, ShieldCheck, Target, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type Tone = "safe" | "warning" | "danger";

const categoryOrder = ["Potential Grooming", "Cyberbullying", "Scam / Phishing", "Location Sharing", "Privacy Risk", "Explicit Content", "Self-Harm Content", "Threat / Violence", "Inappropriate Language"];

function posture(score: number): { label: string; tone: Tone } {
  if (score >= 85) return { label: "Strong posture", tone: "safe" };
  if (score >= 70) return { label: "Watch posture", tone: "warning" };
  return { label: "Elevated risk", tone: "danger" };
}

export default function Intelligence() {
  const { alerts, children, platforms, audit, exportSnapshot } = useStore();
  const open = alerts.filter((a) => a.status === "open");
  const critical = open.filter((a) => a.severity === "critical");
  const high = open.filter((a) => a.severity === "high");
  const avgRisk = alerts.length ? Math.round(alerts.reduce((sum, a) => sum + a.riskScore, 0) / alerts.length) : 0;
  const postureData = children.length ? Math.round(children.reduce((sum, c) => sum + c.safetyScore, 0) / children.length) : 100;
  const current = posture(postureData);
  const resolvedRate = alerts.length ? Math.round((alerts.filter((a) => a.status === "resolved").length / alerts.length) * 100) : 0;
  const coverage = platforms.length ? Math.round((platforms.filter((p) => p.status === "active").length / platforms.length) * 100) : 0;

  const categoryData = useMemo(() => categoryOrder.map((name) => ({ name: name.replace("Potential ", ""), count: alerts.filter((a) => a.threatType === name).length })).filter((item) => item.count > 0), [alerts]);
  const confidenceData = useMemo(() => ["high", "medium", "low"].map((name) => ({ name, count: alerts.filter((a) => a.confidence === name).length })).filter((item) => item.count > 0), [alerts]);
  const platformData = useMemo(() => platforms.map((p) => ({ name: p.name, blocked: p.threatsBlocked, events: p.monitoredEvents })).sort((a, b) => b.blocked - a.blocked).slice(0, 7), [platforms]);
  const childData = useMemo(() => children.map((child) => ({ name: child.name, score: child.safetyScore, open: alerts.filter((a) => a.childId === child.id && a.status === "open").length })).sort((a, b) => a.score - b.score), [children, alerts]);

  const exportAudit = () => {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), app: "CyberShield", audit }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `cybershield-audit-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url);
  };

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="eyebrow">Security intelligence</p><h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Intelligence Center</h1><p className="mt-1 max-w-3xl text-muted-foreground">A portfolio-grade view of risk, detection coverage, service exposure and response health.</p></div>
      <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={exportSnapshot}><Download className="mr-2 h-4 w-4" />Export workspace</Button><Button variant="outline" onClick={exportAudit}><Activity className="mr-2 h-4 w-4" />Export audit trail</Button></div>
    </div>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Family posture" value={`${postureData}%`} note={current.label} icon={Gauge} tone={current.tone} />
      <Metric label="Open critical" value={critical.length} note={`${high.length} high-risk open`} icon={ShieldAlert} tone={critical.length ? "danger" : "safe"} />
      <Metric label="Response rate" value={`${resolvedRate}%`} note="Incidents resolved" icon={ShieldCheck} tone={resolvedRate >= 70 ? "safe" : "warning"} />
      <Metric label="Service coverage" value={`${coverage}%`} note={`${platforms.filter((p) => p.status === "active").length}/${platforms.length} active`} icon={Target} tone={coverage >= 75 ? "safe" : "warning"} />
    </section>

    <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
      <div className="panel p-5 sm:p-6"><div className="flex items-start justify-between"><div><p className="eyebrow">Risk concentration</p><h2 className="mt-1 font-display text-lg font-bold">Threat categories</h2><p className="mt-1 text-xs text-muted-foreground">Where current incidents are concentrated.</p></div><BarChart3 className="h-5 w-5 text-secondary" /></div><div className="mt-6 h-[280px]">{categoryData.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={categoryData} layout="vertical" margin={{ left: 8, right: 10 }}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} /><XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} fontSize={11} /><YAxis type="category" dataKey="name" width={110} axisLine={false} tickLine={false} fontSize={10} /><Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "14px", fontSize: "11px" }} /><Bar dataKey="count" fill="hsl(var(--secondary))" radius={[0, 7, 7, 0]} /></BarChart></ResponsiveContainer> : <Empty text="No categorized incidents yet." />}</div></div>
      <div className="panel p-5 sm:p-6"><div className="flex items-start justify-between"><div><p className="eyebrow">Model quality</p><h2 className="mt-1 font-display text-lg font-bold">Confidence mix</h2><p className="mt-1 text-xs text-muted-foreground">Signals grouped by confidence.</p></div><ShieldCheck className="h-5 w-5 text-secondary" /></div><div className="mt-5 h-[180px]">{confidenceData.length ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={confidenceData} innerRadius={52} outerRadius={72} paddingAngle={4} dataKey="count">{confidenceData.map((entry, index) => <Cell key={entry.name} fill={["hsl(var(--secondary))", "hsl(var(--warning))", "hsl(var(--muted-foreground))"][index % 3]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "14px", fontSize: "11px" }} /></PieChart></ResponsiveContainer> : <Empty text="No confidence data yet." />}</div><div className="space-y-2">{confidenceData.map((item, index) => <div key={item.name} className="flex items-center justify-between text-xs"><span className="flex items-center gap-2 capitalize text-muted-foreground"><span className="h-2 w-2 rounded-full" style={{ background: ["hsl(var(--secondary))", "hsl(var(--warning))", "hsl(var(--muted-foreground))"][index % 3] }} />{item.name}</span><span className="font-bold">{item.count}</span></div>)}</div></div>
    </section>

    <section className="grid gap-6 xl:grid-cols-2">
      <div className="panel p-5 sm:p-6"><div className="flex items-start justify-between"><div><p className="eyebrow">Exposure map</p><h2 className="mt-1 font-display text-lg font-bold">Service telemetry</h2><p className="mt-1 text-xs text-muted-foreground">Modeled activity and blocked signals.</p></div><Activity className="h-5 w-5 text-secondary" /></div><div className="mt-5 h-[250px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={platformData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} /><XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={9} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} fontSize={10} /><Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "14px", fontSize: "11px" }} /><Bar dataKey="events" name="Events" fill="hsl(var(--primary))" radius={[5,5,0,0]} /><Bar dataKey="blocked" name="Blocked" fill="hsl(var(--secondary))" radius={[5,5,0,0]} /></BarChart></ResponsiveContainer></div></div>
      <div className="panel overflow-hidden"><div className="flex items-center justify-between border-b px-5 py-4"><div><p className="eyebrow">Family posture</p><h2 className="mt-1 font-display text-lg font-bold">Risk by child</h2></div><UsersRound className="h-5 w-5 text-secondary" /></div><div className="divide-y">{childData.map((child) => { const level = child.score >= 85 ? "safe" : child.score >= 70 ? "watch" : "risk"; return <div key={child.name} className="flex items-center gap-4 px-5 py-4"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">{child.name.charAt(0)}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">{child.name}</p><span className={cn("text-xs font-bold", level === "safe" ? "text-success" : level === "watch" ? "text-warning" : "text-destructive")}>{child.score}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full", level === "safe" ? "bg-success" : level === "watch" ? "bg-warning" : "bg-destructive")} style={{ width: `${child.score}%` }} /></div><p className="mt-1 text-[10px] text-muted-foreground">{child.open} open incident{child.open === 1 ? "" : "s"}</p></div><Link to="/children" className="text-xs font-semibold text-secondary hover:underline">View</Link></div>})}</div></div>
    </section>

    <section className="panel overflow-hidden"><div className="flex items-center justify-between border-b px-5 py-4 sm:px-6"><div><p className="eyebrow">Audit trail</p><h2 className="mt-1 font-display text-lg font-bold">Recent security activity</h2><p className="mt-1 text-xs text-muted-foreground">Local audit events generated by CyberShield actions.</p></div><span className="rounded-full border bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{audit.length} recorded</span></div><div className="divide-y">{audit.slice(0, 8).map((event, index) => <div key={event.id} className="flex items-start gap-3 px-5 py-4 sm:px-6"><div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-secondary" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{event.title}</p><p className="mt-0.5 text-xs leading-5 text-muted-foreground">{event.description}</p></div><time className="shrink-0 text-[10px] font-medium text-muted-foreground">{index === 0 ? "Now" : new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time></div>)}{!audit.length && <div className="p-10 text-center text-sm text-muted-foreground">Actions you perform in CyberShield will appear here.</div>}</div></section>

    <section className="rounded-2xl border bg-slate-950 p-5 text-white shadow-elevated sm:p-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Defensible by design</p><h2 className="mt-1 font-display text-xl font-bold">Explainable signals. Human review. Local-first data.</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">Every modeled incident can be traced back to a category, score, confidence level and recommended response. Production integrations should add consent, authorized APIs, access control and secure server-side storage.</p></div><div className="grid grid-cols-2 gap-2 sm:min-w-[290px]"><InfoPill label="Average risk" value={`${avgRisk}/100`} trend={avgRisk >= 60 ? "↑" : "↓"} /><InfoPill label="Open incidents" value={String(open.length)} trend={critical.length ? "!" : "✓"} /></div></div></section>
  </div>;
}

function Metric({ label, value, note, icon: Icon, tone }: { label: string; value: string | number; note: string; icon: typeof Gauge; tone: Tone }) { const toneClass = tone === "safe" ? "text-success bg-success/10" : tone === "warning" ? "text-warning bg-warning/10" : "text-destructive bg-destructive/10"; return <div className="panel p-5"><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p><div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", toneClass)}><Icon className="h-4 w-4" /></div></div><p className="mt-4 font-display text-3xl font-bold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div>; }
function InfoPill({ label, value, trend }: { label: string; value: string; trend: string }) { return <div className="rounded-xl border border-white/10 bg-white/5 p-3"><div className="flex items-center justify-between"><p className="text-[10px] uppercase tracking-wider text-white/40">{label}</p><span className="text-xs text-emerald-300">{trend}</span></div><p className="mt-1 text-lg font-bold">{value}</p></div>; }
function Empty({ text }: { text: string }) { return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">{text}</div>; }
