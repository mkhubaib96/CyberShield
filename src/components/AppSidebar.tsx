import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Activity, AlertTriangle, BarChart3, LayoutDashboard, LogOut, Menu, MonitorSmartphone, ScanSearch, Settings, Shield, Sparkles, Users, X } from "lucide-react";
import { useState } from "react";
import shieldLogo from "@/assets/shield-logo.png";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/lib/store";

const groups = [
  { label: "Monitor", items: [{ to: "/", icon: LayoutDashboard, label: "Overview" }, { to: "/alerts", icon: AlertTriangle, label: "Incidents" }, { to: "/children", icon: Users, label: "Family" }] },
  { label: "Intelligence", items: [{ to: "/platforms", icon: MonitorSmartphone, label: "Services" }, { to: "/analyzer", icon: ScanSearch, label: "Threat Analyzer" }, { to: "/simulator", icon: Activity, label: "Event Lab" }, { to: "/intelligence", icon: BarChart3, label: "Intelligence Center" }] },
  { label: "Workspace", items: [{ to: "/settings", icon: Settings, label: "Settings" }] },
];

export function AppSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { alerts } = useStore();
  const unread = alerts.filter((a) => !a.isRead && a.status === "open").length;

  const sidebar = <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl transition-transform duration-300 lg:z-40 lg:translate-x-0", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
    <div className="relative px-5 pb-4 pt-5">
      <div className="absolute right-4 top-3 hidden h-24 w-24 rounded-full bg-sidebar-primary/10 blur-3xl lg:block" />
      <div className="relative flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white p-1 shadow-lg shadow-black/15"><img src={shieldLogo} alt="CyberShield" className="h-full w-full rounded-[14px] object-cover" /></div>
        <div className="min-w-0"><p className="font-display text-lg font-bold tracking-tight text-white">CyberShield</p><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/45">Safety intelligence</p></div>
        <button className="ml-auto rounded-lg p-2 text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-white lg:hidden" onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button>
      </div>
    </div>

    <div className="mx-4 mb-4 rounded-2xl border border-sidebar-border bg-sidebar-accent/55 p-3.5 shadow-inner">
      <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/90"><span className="h-2 w-2 animate-pulse rounded-full bg-sidebar-primary" /> Live protection</span><Shield className="h-4 w-4 text-sidebar-primary" /></div>
      <p className="mt-2 text-[11px] leading-5 text-sidebar-foreground/55">Local-first by default. Cloud mode uses authenticated, RLS-protected workspace sync.</p>
    </div>

    <nav className="flex-1 overflow-y-auto px-3 pb-4">
      {groups.map((group) => <div key={group.label} className="mb-5">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/30">{group.label}</p>
        <div className="space-y-1">
          {group.items.map((item) => {
            const active = location.pathname === item.to;
            return <NavLink key={item.to} to={item.to} onClick={() => setMobileOpen(false)} className={cn("group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all", active ? "bg-white/[0.10] text-white shadow-sm" : "text-sidebar-foreground/58 hover:bg-white/[0.06] hover:text-white")}>
              {active && <span className="absolute left-0 top-1/2 h-7 w-0.5 -translate-y-1/2 rounded-r-full bg-sidebar-primary" />}
              <item.icon className={cn("h-[17px] w-[17px] flex-shrink-0 transition", active ? "text-sidebar-primary" : "group-hover:text-sidebar-primary")} />
              <span>{item.label}</span>
              {item.label === "Incidents" && unread > 0 && <span className="ml-auto rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-white">{unread}</span>}
            </NavLink>;
          })}
        </div>
      </div>)}
    </nav>

    <div className="border-t border-sidebar-border px-3 py-3">
      <button onClick={() => navigate("/analyzer")} className="mb-3 flex w-full items-center gap-3 rounded-xl border border-sidebar-primary/20 bg-sidebar-primary/10 px-3 py-3 text-left hover:bg-sidebar-primary/20">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary/20 text-sidebar-primary"><Sparkles className="h-4 w-4" /></div>
        <div className="min-w-0"><p className="text-xs font-semibold text-white">Quick analysis</p><p className="text-[10px] text-sidebar-foreground/40">Run a content check</p></div>
      </button>
      {user && <div className="mb-2 flex items-center gap-3 rounded-xl bg-sidebar-accent/40 px-3 py-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary/20 text-xs font-bold text-sidebar-primary">{user.name.charAt(0).toUpperCase()}</div>
        <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-white">{user.name}</p><p className="truncate text-[10px] text-sidebar-foreground/40">{user.email}</p></div>
      </div>}
      <button onClick={() => { void logout(); navigate("/login"); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-sidebar-foreground/45 hover:bg-destructive/10 hover:text-red-200"><LogOut className="h-4 w-4" /> Sign out</button>
      <div className="mt-2 flex items-center justify-between px-2 text-[9px] font-bold uppercase tracking-[0.14em] text-sidebar-foreground/25"><span>CYBERSHIELD OS</span><span>v2.4.0</span></div>
    </div>
  </aside>;

  return <>
    <button className="fixed left-4 top-4 z-40 rounded-xl border bg-card/90 p-2 shadow-card backdrop-blur lg:hidden" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button>
    {mobileOpen && <div className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />}
    {sidebar}
  </>;
}
