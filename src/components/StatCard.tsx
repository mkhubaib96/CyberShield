import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  variant?: "default" | "primary" | "danger" | "warning" | "success";
}

const styles = {
  default: { card: "bg-card", icon: "bg-muted text-foreground/70", value: "text-foreground" },
  primary: { card: "gradient-primary text-white border-transparent", icon: "bg-white/10 text-white", value: "text-white" },
  danger: { card: "bg-card border-destructive/15", icon: "bg-destructive/10 text-destructive", value: "text-destructive" },
  warning: { card: "bg-card border-warning/20", icon: "bg-warning/10 text-warning", value: "text-foreground" },
  success: { card: "bg-card border-success/20", icon: "bg-success/10 text-success", value: "text-foreground" },
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = "default" }: StatCardProps) {
  const style = styles[variant];
  return <div className={cn("panel-hover rounded-2xl border p-5 shadow-card", style.card)}>
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0"><p className={cn("text-[11px] font-bold uppercase tracking-[0.12em]", variant === "primary" ? "text-white/60" : "text-muted-foreground")}>{title}</p><p className={cn("mt-2 font-display text-3xl font-bold tracking-tight", style.value)}>{value}</p>{subtitle && <p className={cn("mt-1 text-[11px]", variant === "primary" ? "text-white/55" : "text-muted-foreground")}>{subtitle}</p>}{trend && <p className={cn("mt-2 text-[10px] font-bold", trend.positive ? "text-success" : "text-destructive")}>{trend.positive ? "↘" : "↗"} {trend.value}</p>}</div>
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", style.icon)}><Icon className="h-5 w-5" /></div>
    </div>
  </div>;
}
