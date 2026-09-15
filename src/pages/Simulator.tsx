import { useMemo, useState } from "react";
import { Activity, CheckCircle2, Play, RotateCcw, ShieldAlert, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { analyzeText } from "@/lib/threat-engine";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const scenarios = [
  { id: "grooming", title: "Potential grooming", platform: "Discord", text: "Don't tell your parents. You're special. Let's keep this private.", tone: "danger" },
  { id: "bullying", title: "Cyberbullying", platform: "Instagram", text: "Everyone hates you. Go away, loser. Nobody likes you.", tone: "danger" },
  { id: "phishing", title: "Phishing attempt", platform: "Roblox", text: "URGENT: click this link and send me the OTP to claim free Robux.", tone: "warning" },
  { id: "safe", title: "Benign conversation", platform: "WhatsApp", text: "Hey, are you coming to the football match tomorrow?", tone: "safe" },
] as const;

export default function Simulator() {
  const { children, platforms, simulatePlatformEvent } = useStore();
  const [selected, setSelected] = useState<(typeof scenarios)[number]["id"]>(scenarios[0].id);
  const [running, setRunning] = useState(false);
  const scenario = scenarios.find((item) => item.id === selected) || scenarios[0];
  const result = useMemo(() => analyzeText(scenario.text), [scenario]);

  const run = () => {
    if (!children.length) {
      toast.error("Add a child before running a simulation.");
      return;
    }
    setRunning(true);
    window.setTimeout(() => {
      if (result.category === "No Significant Risk") {
        toast.success("Simulation completed: no alert created.");
      } else {
        const child = children[0];
        simulatePlatformEvent(scenario.platform, child.id, {
          id: crypto.randomUUID(),
          childId: child.id,
          childName: child.name,
          childAvatar: child.avatar,
          platform: scenario.platform,
          threatType: result.category,
          severity: result.severity,
          confidence: result.confidence,
          riskScore: result.score,
          summary: scenario.text,
          recommendation: result.recommendation,
          indicators: result.indicators,
          sourceText: scenario.text,
          timestamp: "Just now",
          createdAt: new Date().toISOString(),
          isRead: false,
          status: "open",
        });
        toast.success("Simulated event detected and added to incidents");
      }
      setRunning(false);
    }, 700);
  };

  return <div className="space-y-6">
    <div><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary"><Activity className="h-4 w-4" /> Demonstration lab</div><h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Event Simulator</h1><p className="mt-1 max-w-3xl text-muted-foreground">Run realistic safety events through the same local detection pipeline used by the Analyzer. This is the fastest way to demonstrate CyberShield during a presentation.</p></div>

    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-2xl border bg-card p-5 shadow-card sm:p-6">
        <div className="flex items-center justify-between"><div><h2 className="font-display font-semibold">Choose a scenario</h2><p className="text-sm text-muted-foreground">Each scenario is deterministic and local.</p></div><Sparkles className="h-5 w-5 text-secondary" /></div>
        <div className="mt-4 space-y-2">
          {scenarios.map((item) => <button key={item.id} type="button" onClick={() => setSelected(item.id)} className={cn("w-full rounded-xl border p-4 text-left transition", selected === item.id ? "border-primary bg-primary/5" : "hover:bg-muted/40")}>
            <div className="flex items-center justify-between gap-3"><span className="font-semibold text-sm">{item.title}</span><span className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.platform}</span></div>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{item.text}</p>
          </button>)}
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Simulation preview</p><h2 className="mt-1 font-display text-2xl font-bold">{scenario.title}</h2></div><div className="rounded-xl bg-primary/10 px-4 py-2 text-right"><p className="text-[11px] text-muted-foreground">Predicted risk</p><p className="text-2xl font-bold text-primary">{result.score}<span className="text-sm font-medium text-muted-foreground">/100</span></p></div></div>
        <div className="mt-5 rounded-xl border bg-muted/30 p-4 text-sm leading-6">“{scenario.text}”</div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-muted/50 p-3"><p className="text-[10px] uppercase text-muted-foreground">Category</p><p className="mt-1 text-xs font-semibold">{result.category}</p></div>
          <div className="rounded-xl bg-muted/50 p-3"><p className="text-[10px] uppercase text-muted-foreground">Severity</p><p className="mt-1 text-xs font-semibold uppercase">{result.severity}</p></div>
          <div className="rounded-xl bg-muted/50 p-3"><p className="text-[10px] uppercase text-muted-foreground">Confidence</p><p className="mt-1 text-xs font-semibold uppercase">{result.confidence}</p></div>
          <div className="rounded-xl bg-muted/50 p-3"><p className="text-[10px] uppercase text-muted-foreground">Pipeline</p><p className="mt-1 text-xs font-semibold">Local rules</p></div>
        </div>
        <div className="mt-4 rounded-xl border bg-secondary/5 p-4"><div className="flex gap-3"><ShieldAlert className="h-5 w-5 flex-shrink-0 text-secondary" /><div><p className="text-sm font-semibold">Detection path</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Event → phrase matching → category scoring → severity → incident workflow → dashboard state.</p></div></div></div>
        <Button className="mt-5 w-full" size="lg" onClick={run} disabled={running}><Play className="mr-2 h-4 w-4" />{running ? "Running simulation…" : result.category === "No Significant Risk" ? "Run safe simulation" : "Run & create incident"}</Button>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-success" /> {platforms.length} demo platforms available · results persist locally</div>
      </section>
    </div>

    <section className="rounded-2xl border bg-card p-5 sm:p-6"><div className="flex items-start gap-3"><Zap className="mt-0.5 h-5 w-5 text-secondary" /><div><h2 className="font-semibold">Presentation tip</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Run the grooming scenario, open Alerts, show the new incident, open Details, then return to Overview to demonstrate how an event flows through the product.</p></div><Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSelected("grooming")}><RotateCcw className="mr-2 h-4 w-4" />Reset scenario</Button></div></section>
  </div>;
}
