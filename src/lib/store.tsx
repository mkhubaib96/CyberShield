import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { seedAlerts, seedChildren, seedPlatforms, seedWeeklyActivity, type Alert, type Child, type PlatformStatus } from "./data";
import { backendMode, supabase } from "./supabase";
import { useAuth } from "@/contexts/AuthContext";

const KEY_PREFIX = "cybershield";
const schemaVersion = 2;

export type AuditAction = "incident_created" | "incident_updated" | "child_added" | "platform_updated" | "setting_updated" | "demo_reset" | "workspace_exported";
export interface AuditEvent { id: string; action: AuditAction; title: string; description: string; entityId?: string; timestamp: string; }
export type SafetySettings = {
  pushNotifications: boolean; emailDigest: boolean; smsAlerts: boolean;
  onDeviceProcessing: boolean; anonymousReporting: boolean; autoDataPurge: boolean;
  strictMode: boolean; profanityFilter: boolean; imageAnalysis: boolean;
  screenTimeLimits: boolean; bedtimeMode: boolean; appSpecificLimits: boolean;
};
export interface WorkspaceSnapshot { children: Child[]; alerts: Alert[]; platforms: PlatformStatus[]; weeklyActivity: typeof seedWeeklyActivity; settings: SafetySettings; audit: AuditEvent[]; }

const defaultSettings: SafetySettings = {
  pushNotifications: true, emailDigest: true, smsAlerts: false,
  onDeviceProcessing: true, anonymousReporting: true, autoDataPurge: true,
  strictMode: false, profanityFilter: true, imageAnalysis: true,
  screenTimeLimits: true, bedtimeMode: true, appSpecificLimits: false,
};

function read<T>(key: string, fallback: T): T { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; } }
function persist(key: string, value: unknown) { localStorage.setItem(key, JSON.stringify(value)); }
function keys(userId: string) { return { children: `${KEY_PREFIX}:${userId}:children`, alerts: `${KEY_PREFIX}:${userId}:alerts`, platforms: `${KEY_PREFIX}:${userId}:platforms`, activity: `${KEY_PREFIX}:${userId}:activity`, settings: `${KEY_PREFIX}:${userId}:settings`, audit: `${KEY_PREFIX}:${userId}:audit` }; }

function normalizeAlerts(value: Alert[] | undefined): Alert[] {
  if (!Array.isArray(value)) return [];
  return value.map((alert) => ({ ...alert, indicators: Array.isArray(alert.indicators) ? alert.indicators : [], riskScore: Number.isFinite(alert.riskScore) ? alert.riskScore : 0, confidence: alert.confidence ?? "medium", status: alert.status ?? "open", isRead: Boolean(alert.isRead) }));
}
function normalizePlatforms(value: PlatformStatus[] | undefined): PlatformStatus[] {
  if (!Array.isArray(value)) return [];
  return value.map((platform) => ({ ...platform, threatsBlocked: Number.isFinite(platform.threatsBlocked) ? platform.threatsBlocked : 0, monitoredEvents: Number.isFinite(platform.monitoredEvents) ? platform.monitoredEvents : 0, children: Array.isArray(platform.children) ? platform.children : [], lastSync: platform.lastSync ?? "Not synced" }));
}
function normalizeSnapshot(raw: Partial<WorkspaceSnapshot> | null | undefined): WorkspaceSnapshot {
  return {
    children: Array.isArray(raw?.children) ? raw.children : seedChildren,
    alerts: Array.isArray(raw?.alerts) ? normalizeAlerts(raw.alerts) : seedAlerts,
    platforms: Array.isArray(raw?.platforms) ? normalizePlatforms(raw.platforms) : seedPlatforms,
    weeklyActivity: Array.isArray(raw?.weeklyActivity) ? raw.weeklyActivity : seedWeeklyActivity,
    settings: { ...defaultSettings, ...(raw?.settings ?? {}) },
    audit: Array.isArray(raw?.audit) ? raw.audit : [],
  };
}

const BASE_SCORES: Record<string, number> = { "1": 87, "2": 95, "3": 72 };
function recalculateChildren(children: Child[], alerts: Alert[]) {
  return children.map((child) => {
    const childAlerts = alerts.filter((alert) => alert.childId === child.id);
    const active = childAlerts.filter((alert) => alert.status === "open");
    const baseScore = BASE_SCORES[child.id] ?? Math.max(70, child.safetyScore || 100);
    const severePenalty = active.reduce((sum, alert) => sum + Math.max(1, Math.round((alert.riskScore / 28) * (alert.severity === "critical" ? 1.25 : alert.severity === "high" ? 1 : 0.6))), 0);
    const safetyScore = Math.max(0, Math.min(100, baseScore - severePenalty));
    const status: Child["status"] = active.some((alert) => alert.severity === "critical" || alert.severity === "high") ? "alert" : active.length ? "warning" : "safe";
    return { ...child, safetyScore, recentAlerts: active.length, status };
  });
}

interface StoreValue extends WorkspaceSnapshot {
  backendMode: "cloud" | "local";
  isHydrated: boolean;
  isSyncing: boolean;
  syncError: string | null;
  addChild: (child: Omit<Child, "id" | "avatar" | "ageGroup" | "safetyScore" | "platforms" | "recentAlerts" | "screenTimeMinutes" | "status">) => void;
  addAlert: (alert: Alert) => void;
  updateAlert: (id: string, patch: Partial<Alert>) => void;
  togglePlatform: (name: string) => void;
  simulatePlatformEvent: (platformName: string, childId: string, alert: Alert) => void;
  updateSetting: <K extends keyof SafetySettings>(key: K, value: SafetySettings[K]) => void;
  resetDemo: () => void;
  clearLocalData: () => void;
  clearCloudWorkspace: () => Promise<void>;
  syncNow: () => Promise<void>;
  exportSnapshot: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children: reactChildren }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? "guest";
  const [children, setChildren] = useState<Child[]>(seedChildren);
  const [alerts, setAlerts] = useState<Alert[]>(seedAlerts);
  const [platforms, setPlatforms] = useState<PlatformStatus[]>(seedPlatforms);
  const [weeklyActivity, setWeeklyActivity] = useState<typeof seedWeeklyActivity>(seedWeeklyActivity);
  const [settings, setSettings] = useState<SafetySettings>(defaultSettings);
  const [audit, setAudit] = useState<AuditEvent[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const skipNextCloudSave = useRef(true);

  useEffect(() => {
    let active = true;
    setIsHydrated(false);
    setSyncError(null);
    skipNextCloudSave.current = true;
    const localKeys = keys(userId);

    const hydrate = async () => {
      let snapshot: WorkspaceSnapshot;
      if (backendMode === "cloud" && supabase && user?.id) {
        const { data, error } = await supabase.from("cybershield_workspaces").select("state, schema_version").eq("user_id", user.id).maybeSingle();
        if (error) {
          snapshot = normalizeSnapshot({
            children: read(localKeys.children, seedChildren), alerts: read(localKeys.alerts, seedAlerts), platforms: read(localKeys.platforms, seedPlatforms), weeklyActivity: read(localKeys.activity, seedWeeklyActivity), settings: read(localKeys.settings, defaultSettings), audit: read(localKeys.audit, []),
          });
          setSyncError(`Cloud sync unavailable: ${error.message}`);
        } else if (data?.state) {
          snapshot = normalizeSnapshot(data.state as Partial<WorkspaceSnapshot>);
        } else {
          snapshot = normalizeSnapshot(null);
        }
      } else {
        snapshot = normalizeSnapshot({ children: read(localKeys.children, seedChildren), alerts: read(localKeys.alerts, seedAlerts), platforms: read(localKeys.platforms, seedPlatforms), weeklyActivity: read(localKeys.activity, seedWeeklyActivity), settings: read(localKeys.settings, defaultSettings), audit: read(localKeys.audit, []) });
      }
      if (!active) return;
      setChildren(snapshot.children);
      setAlerts(snapshot.alerts);
      setPlatforms(snapshot.platforms);
      setWeeklyActivity(snapshot.weeklyActivity);
      setSettings(snapshot.settings);
      setAudit(snapshot.audit);
      setIsHydrated(true);
      setTimeout(() => { skipNextCloudSave.current = false; }, 0);
    };
    void hydrate();
    return () => { active = false; };
  }, [userId, user?.id]);

  const snapshot = useMemo<WorkspaceSnapshot>(() => ({ children, alerts, platforms, weeklyActivity, settings, audit }), [children, alerts, platforms, weeklyActivity, settings, audit]);

  useEffect(() => {
    if (!isHydrated) return;
    const localKeys = keys(userId);
    persist(localKeys.children, children); persist(localKeys.alerts, alerts); persist(localKeys.platforms, platforms); persist(localKeys.activity, weeklyActivity); persist(localKeys.settings, settings); persist(localKeys.audit, audit);
    if (backendMode === "cloud" && supabase && user?.id) {
      if (skipNextCloudSave.current) return;
      const timer = window.setTimeout(() => { void (async () => {
        setIsSyncing(true); setSyncError(null);
        const { error } = await supabase.from("cybershield_workspaces").upsert({ user_id: user.id, schema_version: schemaVersion, state: snapshot }, { onConflict: "user_id" });
        if (error) setSyncError(error.message);
        setIsSyncing(false);
      })(); }, 450);
      return () => window.clearTimeout(timer);
    }
  }, [snapshot, isHydrated, userId, user?.id, children, alerts, platforms, weeklyActivity, settings, audit]);

  const appendAudit = useCallback((event: Omit<AuditEvent, "id" | "timestamp">) => setAudit((current) => [{ ...event, id: crypto.randomUUID(), timestamp: new Date().toISOString() }, ...current].slice(0, 250)), []);
  const addChild = useCallback((input: Omit<Child, "id" | "avatar" | "ageGroup" | "safetyScore" | "platforms" | "recentAlerts" | "screenTimeMinutes" | "status">) => {
    const id = crypto.randomUUID(); const ageGroup: Child["ageGroup"] = input.age <= 9 ? "6-9" : input.age <= 13 ? "10-13" : "14-17";
    const child: Child = { ...input, id, avatar: input.name.charAt(0).toUpperCase(), ageGroup, safetyScore: 100, platforms: [], recentAlerts: 0, screenTimeMinutes: 0, status: "safe" };
    setChildren((current) => [...current, child]); appendAudit({ action: "child_added", title: `Child profile added: ${child.name}`, description: `${child.age} years old · age group ${child.ageGroup}`, entityId: child.id });
  }, [appendAudit]);
  const addAlert = useCallback((alert: Alert) => { setAlerts((current) => { const next = [normalizeAlerts([alert])[0], ...current]; setChildren((cc) => recalculateChildren(cc, next)); return next; }); appendAudit({ action: "incident_created", title: `Incident created: ${alert.threatType}`, description: `${alert.childName} · ${alert.platform} · risk ${alert.riskScore}/100`, entityId: alert.id }); }, [appendAudit]);
  const updateAlert = useCallback((id: string, patch: Partial<Alert>) => { const existing = alerts.find((item) => item.id === id); setAlerts((current) => { const next = current.map((item) => item.id === id ? normalizeAlerts([{ ...item, ...patch }])[0] : item); setChildren((cc) => recalculateChildren(cc, next)); return next; }); if (existing) appendAudit({ action: "incident_updated", title: `Incident updated: ${existing.threatType}`, description: `${existing.childName} · ${Object.entries(patch).map(([key, value]) => `${key}=${String(value)}`).join(" · ")}`, entityId: id }); }, [alerts, appendAudit]);
  const togglePlatform = useCallback((name: string) => setPlatforms((current) => current.map((p) => { if (p.name !== name) return p; const status = p.status === "active" ? "paused" : "active"; appendAudit({ action: "platform_updated", title: `${name} ${status}`, description: `Service monitoring ${status === "active" ? "resumed" : "paused"}.`, entityId: name }); return { ...p, status, lastSync: "Just now" }; })), [appendAudit]);
  const simulatePlatformEvent = useCallback((platformName: string, childId: string, alert: Alert) => { setPlatforms((current) => current.map((p) => p.name === platformName ? { ...p, threatsBlocked: p.threatsBlocked + 1, monitoredEvents: p.monitoredEvents + 1, lastSync: "Just now" } : p)); addAlert({ ...alert, childId }); }, [addAlert]);
  const updateSetting = useCallback(<K extends keyof SafetySettings>(key: K, value: SafetySettings[K]) => { setSettings((current) => ({ ...current, [key]: value })); appendAudit({ action: "setting_updated", title: `Setting changed: ${String(key)}`, description: `Value set to ${String(value)}.` }); }, [appendAudit]);
  const resetDemo = useCallback(() => { setChildren(seedChildren); setAlerts(seedAlerts); setPlatforms(seedPlatforms); setWeeklyActivity(seedWeeklyActivity); setSettings(defaultSettings); setAudit([]); setTimeout(() => appendAudit({ action: "demo_reset", title: "Demo workspace reset", description: "Seed children, incidents, services and settings restored." }), 0); }, [appendAudit]);
  const clearLocalData = useCallback(() => { Object.values(keys(userId)).forEach((key) => localStorage.removeItem(key)); setChildren([]); setAlerts([]); setPlatforms([]); setWeeklyActivity([]); setSettings(defaultSettings); setAudit([]); }, [userId]);
  const clearCloudWorkspace = useCallback(async () => { if (backendMode !== "cloud" || !supabase || !user?.id) return; setIsSyncing(true); const { error } = await supabase.from("cybershield_workspaces").delete().eq("user_id", user.id); setIsSyncing(false); if (error) { setSyncError(error.message); throw new Error(error.message); } clearLocalData(); }, [user?.id, clearLocalData]);
  const syncNow = useCallback(async () => { if (backendMode !== "cloud" || !supabase || !user?.id) return; setIsSyncing(true); setSyncError(null); const { error } = await supabase.from("cybershield_workspaces").upsert({ user_id: user.id, schema_version: schemaVersion, state: snapshot }, { onConflict: "user_id" }); setIsSyncing(false); if (error) { setSyncError(error.message); throw new Error(error.message); } }, [user?.id, snapshot]);
  const exportSnapshot = useCallback(() => { const payload = { exportedAt: new Date().toISOString(), app: "CyberShield", version: "2.4.0", backendMode, user: user ? { id: user.id, name: user.name, email: user.email } : null, ...snapshot, securityNote: "Demo/workspace export. Review and remove sensitive content before sharing." }; const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `cybershield-snapshot-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url); appendAudit({ action: "workspace_exported", title: "Workspace export created", description: "A JSON snapshot was downloaded locally." }); }, [snapshot, user, appendAudit]);

  const value = useMemo<StoreValue>(() => ({ ...snapshot, backendMode, isHydrated, isSyncing, syncError, addChild, addAlert, updateAlert, togglePlatform, simulatePlatformEvent, updateSetting, resetDemo, clearLocalData, clearCloudWorkspace, syncNow, exportSnapshot }), [snapshot, isHydrated, isSyncing, syncError, addChild, addAlert, updateAlert, togglePlatform, simulatePlatformEvent, updateSetting, resetDemo, clearLocalData, clearCloudWorkspace, syncNow, exportSnapshot]);
  return <StoreContext.Provider value={value}>{reactChildren}</StoreContext.Provider>;
}

export function useStore() { const ctx = useContext(StoreContext); if (!ctx) throw new Error("useStore must be used inside StoreProvider"); return ctx; }
