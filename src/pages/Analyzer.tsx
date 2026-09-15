import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, ScanSearch, ShieldAlert, RotateCcw, ShieldCheck, Gauge, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { analyzeText, type ThreatAnalysis } from "@/lib/threat-engine";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const examples = [
  { label: "Grooming", text: "Don't tell your parents about our conversations. You can trust me. Let's keep this private." },
  { label: "Cyberbullying", text: "Everyone hates you. Go away, loser. Nobody likes you." },
  { label: "Phishing", text: "URGENT: verify your account now and send me the OTP to claim free Robux." },
  { label: "Location", text: "Send me your live location. Where do you live? Meet me at 7 tonight." },
];

const severityMeta = {
  low: { label: "LOW", icon: CheckCircle2, className: "text-success bg-success/10", bar: "bg-success", message: "No urgent intervention indicated." },
  medium: { label: "MEDIUM", icon: AlertTriangle, className: "text-warning bg-warning/10", bar: "bg-warning", message: "Review context and watch for repetition." },
  high: { label: "HIGH", icon: ShieldAlert, className: "text-destructive bg-destructive/10", bar: "bg-destructive", message: "Review promptly and preserve useful context." },
  critical: { label: "CRITICAL", icon: ShieldAlert, className: "text-white gradient-danger", bar: "bg-destructive", message: "Immediate review is recommended." },
};

export default function Analyzer() {
  const { children, platforms, addAlert } = useStore();
  const [text, setText] = useState("");
  const [result, setResult] = useState<ThreatAnalysis | null>(null);
  const [childId, setChildId] = useState(children[0]?.id || "");
  const [platform, setPlatform] = useState(platforms.find((p) => p.status === "active")?.name || "Instagram");

  const meta = useMemo(() => result ? severityMeta[result.severity] : null, [result]);

  const analyze = () => {
    if (!text.trim()) {
      toast.error("Enter some content to analyze first.");
      return;
    }
    setResult(analyzeText(text));
  };

  const createAlert = () => {
    if (!result || !children.length || result.category === "No Significant Risk") return;
    const child = children.find((c) => c.id === childId) || children[0];
    addAlert({
      id: crypto.randomUUID(),
      childId: child.id,
      childName: child.name,
      childAvatar: child.avatar,
      platform,
      threatType: result.category,
      severity: result.severity,
      confidence: result.confidence,
      riskScore: result.score,
      summary: text.trim().slice(0, 180),
      recommendation: result.recommendation,
      indicators: result.indicators,
      sourceText: text.trim(),
      timestamp: "Just now",
      createdAt: new Date().toISOString(),
      isRead: false,
      status: "open",
    });
    toast.success("Safety incident created");
  };

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary"><ScanSearch className="h-4 w-4" /> Explainable risk analysis</div>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Threat Analyzer</h1>
        <p className="mt-1 max-w-3xl text-muted-foreground">Paste a message, caption or chat excerpt. CyberShield scores observable safety signals locally and explains what triggered the result.</p>
      </div>
      <div className="hidden rounded-xl border bg-card px-4 py-2 text-xs text-muted-foreground sm:block"><span className="font-semibold text-foreground">Local engine</span> · no content leaves this browser</div>
    </div>

    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.02fr_0.98fr]">
      <section className="rounded-2xl border bg-card p-5 shadow-card sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><label htmlFor="analyzer-child" className="text-xs font-semibold text-muted-foreground">Child profile</label><select id="analyzer-child" value={childId} onChange={(e) => setChildId(e.target.value)} className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm">{children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label htmlFor="analyzer-platform" className="text-xs font-semibold text-muted-foreground">Platform</label><select id="analyzer-platform" value={platform} onChange={(e) => setPlatform(e.target.value)} className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm">{platforms.map((p) => <option key={p.name}>{p.name}</option>)}</select></div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between"><label htmlFor="analyzer-text" className="text-xs font-semibold text-muted-foreground">Message or content</label><span className="text-[11px] text-muted-foreground">{text.length} characters</span></div>
          <Textarea id="analyzer-text" className="mt-1.5 min-h-[240px] resize-y" value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste a message here..." />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {examples.map((example) => <button key={example.label} type="button" onClick={() => setText(example.text)} className="rounded-full border bg-muted/40 px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">{example.label} example</button>)}
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={analyze} className="flex-1"><ScanSearch className="mr-2 h-4 w-4" />Analyze content</Button>
          <Button variant="outline" onClick={() => { setText(""); setResult(null); }}><RotateCcw className="mr-2 h-4 w-4" />Clear</Button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-muted/50 p-3"><Gauge className="mx-auto h-4 w-4 text-secondary" /><p className="mt-1 text-[11px] font-semibold">Risk score</p><p className="text-[10px] text-muted-foreground">0–100</p></div>
          <div className="rounded-xl bg-muted/50 p-3"><ShieldCheck className="mx-auto h-4 w-4 text-secondary" /><p className="mt-1 text-[11px] font-semibold">Explainable</p><p className="text-[10px] text-muted-foreground">Rule-backed</p></div>
          <div className="rounded-xl bg-muted/50 p-3"><Sparkles className="mx-auto h-4 w-4 text-secondary" /><p className="mt-1 text-[11px] font-semibold">Demo-safe</p><p className="text-[10px] text-muted-foreground">Local only</p></div>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-card sm:p-6">
        {!result ? <div className="flex h-full min-h-[520px] flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10 text-secondary"><ScanSearch className="h-8 w-8" /></div>
          <h2 className="mt-4 font-display text-xl font-semibold">Analysis will appear here</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">CyberShield will show the category, risk score, confidence, matched indicators and a recommended next step.</p>
        </div> : <div className="space-y-5">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Risk assessment</p><h2 className="mt-1 font-display text-2xl font-bold">{result.category}</h2></div><div className="rounded-xl bg-primary/10 px-4 py-2 text-right"><p className="text-[11px] font-semibold text-muted-foreground">Risk score</p><p className="text-2xl font-bold text-primary">{result.score}<span className="text-sm font-medium text-muted-foreground">/100</span></p></div></div>

          {result.category === "No Significant Risk" && <div className="rounded-xl border border-success/20 bg-success/5 p-4"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 text-success" /><div><p className="font-semibold text-success">No significant risk detected</p><p className="mt-1 text-sm text-muted-foreground">This is a low-risk classification for the current rule set, not a guarantee that the content is safe.</p></div></div></div>}

          {meta && <div className={cn("flex items-center gap-3 rounded-xl p-4", meta.className)}><div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/60"><meta.icon className="h-5 w-5" /></div><div className="flex-1"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold uppercase">{meta.label} severity</p><span className="text-xs font-semibold">{result.confidence} confidence</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/50"><div className={cn("h-full rounded-full", meta.bar)} style={{ width: `${Math.max(4, result.score)}%` }} /></div><p className="mt-1 text-xs opacity-75">{meta.message}</p></div></div>}

          <div><h3 className="font-semibold">Matched indicators</h3>{result.indicators.length ? <div className="mt-3 space-y-2">{result.indicators.map((item) => <div key={item} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs"><span className="h-2 w-2 rounded-full bg-secondary" />{item}</div>)}</div> : <p className="mt-2 text-sm text-muted-foreground">No high-confidence indicators matched.</p>}</div>
          {result.matchedTerms.length > 0 && <div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Matched phrases</p><div className="mt-2 flex flex-wrap gap-2">{result.matchedTerms.map((term) => <span key={term} className="rounded-full border bg-background px-2.5 py-1 text-[11px] text-muted-foreground">"{term}"</span>)}</div></div>}
          <div className="rounded-xl border bg-secondary/5 p-4"><div className="flex gap-3"><Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary" /><p className="text-sm leading-6 text-muted-foreground">{result.explanation}</p></div></div>
          <div><h3 className="font-semibold">Recommended action</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{result.recommendation}</p></div>
          <Button onClick={createAlert} className="w-full" disabled={!children.length || result.category === "No Significant Risk"}>{result.category === "No Significant Risk" ? "No alert needed" : "Create incident from this analysis"}</Button>
        </div>}
      </section>
    </div>

    <section className="rounded-2xl border bg-card p-5 sm:p-6"><div className="flex gap-3"><Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-secondary" /><div><h2 className="font-semibold">Responsible-use note</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">CyberShield is a decision-support demo, not a surveillance product or diagnostic system. Real-world integrations require explicit consent, appropriate permissions and authorized APIs or device services. Review context before acting on any automated signal.</p></div></div></section>
  </div>;
}
