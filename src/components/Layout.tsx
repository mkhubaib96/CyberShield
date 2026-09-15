import { Bell, ChevronRight, Search, ShieldCheck, Zap } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { useStore } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";

const pageMeta: Record<string, { title: string; section: string }> = {
  "/": { title: "Overview", section: "Monitor" },
  "/alerts": { title: "Incident center", section: "Monitor" },
  "/children": { title: "Family profiles", section: "Monitor" },
  "/platforms": { title: "Connected services", section: "Intelligence" },
  "/analyzer": { title: "Threat Analyzer", section: "Intelligence" },
  "/simulator": { title: "Event Lab", section: "Intelligence" },
  "/intelligence": { title: "Intelligence Center", section: "Intelligence" },
  "/settings": { title: "Workspace settings", section: "Workspace" },
};

export function Layout() {
  const location = useLocation();
  const { alerts, backendMode, isSyncing, syncError } = useStore();
  const { user } = useAuth();
  const meta = pageMeta[location.pathname] ?? pageMeta["/"];
  const unread = alerts.filter((a) => !a.isRead && a.status === "open").length;

  return <div className="min-h-screen bg-background">
    <AppSidebar />
    <main className="min-h-screen lg:pl-[260px]">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1560px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <div className="min-w-0 flex-1 pl-12 lg:pl-0">
            <div className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground sm:flex"><span>{meta.section}</span><ChevronRight className="h-3 w-3" /><span className="text-foreground/65">{meta.title}</span></div>
            <h1 className="mt-1 truncate font-display text-base font-bold tracking-tight text-foreground sm:text-lg">{meta.title}</h1>
          </div>
          <div className="hidden items-center gap-2 rounded-xl border bg-card px-3 py-2 text-xs text-muted-foreground shadow-sm md:flex"><Search className="h-4 w-4" /><span>Command center</span><span className="rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-bold">⌘ K</span></div><div className="hidden items-center gap-1.5 rounded-xl border bg-card px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground xl:flex"><span className={`h-1.5 w-1.5 rounded-full ${syncError ? "bg-destructive" : isSyncing ? "bg-warning animate-pulse" : "bg-success"}`} />{backendMode === "cloud" ? (isSyncing ? "Syncing" : "Cloud secure") : "Local secure"}</div>
          <Link to="/analyzer" className="hidden items-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 md:flex"><Zap className="h-4 w-4" /> Quick analyze</Link>
          <Link to="/alerts" className="relative flex h-10 w-10 items-center justify-center rounded-xl border bg-card text-muted-foreground shadow-sm transition hover:text-foreground"><Bell className="h-[18px] w-[18px]" />{unread > 0 && <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white">{unread}</span>}</Link>
          <div className="hidden items-center gap-2.5 pl-1 sm:flex"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white">{user?.name.charAt(0).toUpperCase() ?? "C"}</div><div className="hidden xl:block"><p className="max-w-[120px] truncate text-xs font-semibold">{user?.name ?? "CyberShield"}</p><div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-success"><ShieldCheck className="h-3 w-3" /> Secure</div></div></div>
        </div>
      </header>
      <div className="mx-auto max-w-[1560px] px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-8"><Outlet /></div>
    </main>
  </div>;
}
