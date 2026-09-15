export type ThreatLevel = "low" | "medium" | "high" | "critical";
export type ConfidenceLevel = "low" | "medium" | "high";
export type ThreatCategory =
  | "No Significant Risk"
  | "Inappropriate Language"
  | "Cyberbullying"
  | "Potential Grooming"
  | "Explicit Content"
  | "Scam / Phishing"
  | "Location Sharing"
  | "Privacy Risk"
  | "Self-Harm Content"
  | "Threat / Violence";
export type AlertStatus = "open" | "resolved" | "dismissed";

export interface Alert {
  id: string;
  childId: string;
  childName: string;
  childAvatar: string;
  platform: string;
  threatType: ThreatCategory;
  severity: ThreatLevel;
  confidence: ConfidenceLevel;
  riskScore: number;
  summary: string;
  recommendation: string;
  indicators: string[];
  sourceText?: string;
  timestamp: string;
  createdAt: string;
  isRead: boolean;
  status: AlertStatus;
}

export interface Child {
  id: string;
  name: string;
  age: number;
  avatar: string;
  ageGroup: "6-9" | "10-13" | "14-17";
  safetyScore: number;
  platforms: string[];
  recentAlerts: number;
  screenTimeMinutes: number;
  status: "safe" | "warning" | "alert";
}

export interface PlatformStatus {
  name: string;
  icon: string;
  status: "active" | "paused" | "disconnected";
  lastSync: string;
  threatsBlocked: number;
  children: string[];
  monitoredEvents: number;
}

export interface ActivityPoint {
  day: string;
  threats: number;
  blocked: number;
  screenTime: number;
}

export const seedChildren: Child[] = [
  { id: "1", name: "Emma", age: 12, avatar: "E", ageGroup: "10-13", safetyScore: 87, platforms: ["Instagram", "TikTok", "Roblox", "Discord"], recentAlerts: 2, screenTimeMinutes: 204, status: "warning" },
  { id: "2", name: "Lucas", age: 9, avatar: "L", ageGroup: "6-9", safetyScore: 95, platforms: ["Roblox", "Minecraft", "YouTube Kids"], recentAlerts: 0, screenTimeMinutes: 105, status: "safe" },
  { id: "3", name: "Sophie", age: 15, avatar: "S", ageGroup: "14-17", safetyScore: 72, platforms: ["Instagram", "Snapchat", "TikTok", "Discord", "WhatsApp"], recentAlerts: 5, screenTimeMinutes: 250, status: "alert" },
];

export const seedAlerts: Alert[] = [
  { id: "a1", childId: "3", childName: "Sophie", childAvatar: "S", platform: "Instagram", threatType: "Cyberbullying", severity: "high", confidence: "high", riskScore: 82, summary: "Repeated hostile messages and targeted insults detected in a group conversation.", recommendation: "Review the conversation, preserve evidence, and consider blocking/reporting the sender.", indicators: ["Targeted hostility", "Repeated insults"], timestamp: "2 min ago", createdAt: "2026-09-14T19:20:00+05:30", isRead: false, status: "open" },
  { id: "a2", childId: "3", childName: "Sophie", childAvatar: "S", platform: "Discord", threatType: "Potential Grooming", severity: "critical", confidence: "high", riskScore: 94, summary: "Secrecy, trust-building and private-contact indicators triggered a high-risk safety alert.", recommendation: "Do not engage further. Review the account, preserve evidence, and use platform reporting tools.", indicators: ["Secrecy request", "Trust manipulation", "Private-contact cue"], sourceText: "Don't tell your parents about our conversations. You can trust me. Let's keep this private.", timestamp: "15 min ago", createdAt: "2026-09-14T19:07:00+05:30", isRead: false, status: "open" },
  { id: "a3", childId: "1", childName: "Emma", childAvatar: "E", platform: "TikTok", threatType: "Explicit Content", severity: "medium", confidence: "high", riskScore: 61, summary: "Age-inappropriate content was detected and flagged for review.", recommendation: "Confirm filtering is enabled and review the content source if it reappears.", indicators: ["Explicit-content cue"], timestamp: "1 hour ago", createdAt: "2026-09-14T18:22:00+05:30", isRead: true, status: "resolved" },
  { id: "a4", childId: "1", childName: "Emma", childAvatar: "E", platform: "Roblox", threatType: "Inappropriate Language", severity: "low", confidence: "medium", riskScore: 29, summary: "Mildly inappropriate language was detected without strong targeting.", recommendation: "Keep chat filtering enabled; no urgent action is required.", indicators: ["Mild profanity"], timestamp: "3 hours ago", createdAt: "2026-09-14T16:20:00+05:30", isRead: true, status: "resolved" },
  { id: "a5", childId: "3", childName: "Sophie", childAvatar: "S", platform: "Snapchat", threatType: "Location Sharing", severity: "high", confidence: "high", riskScore: 79, summary: "A location-sharing attempt with a non-approved contact was blocked.", recommendation: "Review the contact and remind the child not to share live location with unknown accounts.", indicators: ["Live-location request", "In-person meetup cue"], timestamp: "5 hours ago", createdAt: "2026-09-14T14:20:00+05:30", isRead: true, status: "resolved" },
  { id: "a6", childId: "3", childName: "Sophie", childAvatar: "S", platform: "WhatsApp", threatType: "Potential Grooming", severity: "medium", confidence: "medium", riskScore: 64, summary: "Isolation and secret-keeping language patterns were detected.", recommendation: "Talk with the child about healthy boundaries and review the contact together.", indicators: ["Isolation language", "Secret-keeping"], timestamp: "Yesterday", createdAt: "2026-09-13T17:20:00+05:30", isRead: true, status: "resolved" },
  { id: "a7", childId: "3", childName: "Sophie", childAvatar: "S", platform: "TikTok", threatType: "Self-Harm Content", severity: "high", confidence: "high", riskScore: 76, summary: "Content associated with self-harm was detected in browsing activity.", recommendation: "Check in with the child calmly, review the content, and use platform safety/reporting tools where appropriate.", indicators: ["Self-harm cue"], timestamp: "Yesterday", createdAt: "2026-09-13T12:20:00+05:30", isRead: true, status: "resolved" },
];

export const seedPlatforms: PlatformStatus[] = [
  { name: "Instagram", icon: "◎", status: "active", lastSync: "Just now", threatsBlocked: 12, monitoredEvents: 186, children: ["Emma", "Sophie"] },
  { name: "TikTok", icon: "♪", status: "active", lastSync: "1 min ago", threatsBlocked: 8, monitoredEvents: 142, children: ["Emma", "Sophie"] },
  { name: "Discord", icon: "◈", status: "active", lastSync: "Just now", threatsBlocked: 15, monitoredEvents: 231, children: ["Emma", "Sophie"] },
  { name: "Snapchat", icon: "◆", status: "active", lastSync: "2 min ago", threatsBlocked: 5, monitoredEvents: 98, children: ["Sophie"] },
  { name: "Roblox", icon: "▦", status: "active", lastSync: "Just now", threatsBlocked: 3, monitoredEvents: 121, children: ["Emma", "Lucas"] },
  { name: "WhatsApp", icon: "◔", status: "paused", lastSync: "1 hour ago", threatsBlocked: 2, monitoredEvents: 76, children: ["Sophie"] },
  { name: "Minecraft", icon: "⬡", status: "active", lastSync: "5 min ago", threatsBlocked: 0, monitoredEvents: 65, children: ["Lucas"] },
  { name: "YouTube Kids", icon: "▶", status: "active", lastSync: "Just now", threatsBlocked: 1, monitoredEvents: 88, children: ["Lucas"] },
];

export const seedWeeklyActivity: ActivityPoint[] = [
  { day: "Mon", threats: 3, blocked: 3, screenTime: 180 },
  { day: "Tue", threats: 1, blocked: 1, screenTime: 210 },
  { day: "Wed", threats: 5, blocked: 4, screenTime: 195 },
  { day: "Thu", threats: 2, blocked: 2, screenTime: 240 },
  { day: "Fri", threats: 4, blocked: 3, screenTime: 260 },
  { day: "Sat", threats: 6, blocked: 5, screenTime: 300 },
  { day: "Sun", threats: 4, blocked: 4, screenTime: 230 },
];
