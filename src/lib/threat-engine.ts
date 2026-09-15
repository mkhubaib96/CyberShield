import type { ConfidenceLevel, ThreatCategory, ThreatLevel } from "./data";

export interface ThreatAnalysis {
  score: number;
  severity: ThreatLevel;
  confidence: ConfidenceLevel;
  category: ThreatCategory;
  indicators: string[];
  recommendation: string;
  explanation: string;
  matchedTerms: string[];
}

type Rule = {
  category: Exclude<ThreatCategory, "No Significant Risk">;
  weight: number;
  terms: string[];
  indicator: string;
  confidence: ConfidenceLevel;
};

const RULES: Rule[] = [
  { category: "Potential Grooming", weight: 30, terms: ["don't tell your parents", "keep this secret", "secret from your parents", "don't tell anyone", "you can trust me", "you're mature for your age", "let's keep this private", "private chat"], indicator: "Secrecy or boundary-testing language", confidence: "high" },
  { category: "Potential Grooming", weight: 24, terms: ["you're special", "no one needs to know", "just between us", "move this to a private chat"], indicator: "Isolation or accelerated trust-building", confidence: "medium" },
  { category: "Cyberbullying", weight: 24, terms: ["nobody likes you", "everyone hates you", "you're worthless", "go away loser", "ugly loser", "shut up loser"], indicator: "Targeted hostility or humiliation", confidence: "high" },
  { category: "Cyberbullying", weight: 17, terms: ["loser", "idiot", "ugly", "shut up", "go away"], indicator: "Insulting or hostile language", confidence: "medium" },
  { category: "Scam / Phishing", weight: 25, terms: ["click this link", "verify your account", "send me the code", "send me the otp", "free robux", "gift card", "your account will be locked", "urgent"], indicator: "Credential, payment or urgency cues", confidence: "high" },
  { category: "Scam / Phishing", weight: 16, terms: ["password", "otp", "login code", "claim your prize"], indicator: "Credential or prize language", confidence: "medium" },
  { category: "Location Sharing", weight: 28, terms: ["where do you live", "send your location", "share your live location", "what's your address", "meet me at", "home alone"], indicator: "Location or in-person meetup request", confidence: "high" },
  { category: "Privacy Risk", weight: 22, terms: ["send your phone number", "send me your address", "what school do you go to", "send your password", "share your personal details"], indicator: "Personal information request", confidence: "high" },
  { category: "Explicit Content", weight: 34, terms: ["nudes", "send nudes", "nude photo", "explicit photo", "sexual photo", "send pics"], indicator: "Sexual or explicit-content cue", confidence: "high" },
  { category: "Self-Harm Content", weight: 34, terms: ["hurt myself", "cut myself", "self harm", "self-harm", "don't want to live", "end my life", "kill myself"], indicator: "Self-harm distress cue", confidence: "high" },
  { category: "Threat / Violence", weight: 32, terms: ["i will hurt you", "i'll hurt you", "i'm going to hurt you", "i will find you", "you better watch out"], indicator: "Threat of physical harm", confidence: "high" },
  { category: "Inappropriate Language", weight: 14, terms: ["damn", "stupid", "crap", "what the hell"], indicator: "Mildly inappropriate language", confidence: "medium" },
];

function emptyResult(): ThreatAnalysis {
  return {
    score: 0,
    severity: "low",
    confidence: "high",
    category: "No Significant Risk",
    indicators: [],
    recommendation: "No urgent action indicated. Continue normal online-safety awareness.",
    explanation: "No high-confidence safety indicators matched the current rule set. This does not prove content is safe; context and human review still matter.",
    matchedTerms: [],
  };
}

function severityFor(score: number): ThreatLevel {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 35) return "medium";
  return "low";
}

function recommendationFor(category: ThreatCategory): string {
  switch (category) {
    case "Potential Grooming":
      return "Do not engage further. Preserve context, review the account, and use the platform's reporting/blocking controls.";
    case "Self-Harm Content":
      return "Treat this as a wellbeing signal, not a diagnosis. Check in calmly and seek appropriate support when needed.";
    case "Scam / Phishing":
      return "Do not click links or share passwords, codes, money, or personal information.";
    case "Location Sharing":
    case "Privacy Risk":
      return "Avoid sharing sensitive information. Review the contact and reinforce safe-sharing boundaries.";
    case "Explicit Content":
      return "Preserve context, review the source, and use age-appropriate filtering/reporting controls.";
    case "Threat / Violence":
      return "Preserve evidence, avoid escalation, and use platform reporting tools. Seek local help if there is an immediate safety concern.";
    case "Cyberbullying":
      return "Review the conversation, preserve evidence, and consider blocking/reporting the sender.";
    case "Inappropriate Language":
      return "Keep chat filtering enabled; discuss respectful communication if the pattern continues.";
    default:
      return "No urgent action indicated. Continue normal online-safety awareness.";
  }
}

export function analyzeText(text: string): ThreatAnalysis {
  const normalized = text.trim().toLowerCase();
  if (!normalized) {
    return {
      ...emptyResult(),
      confidence: "low",
      recommendation: "Enter a message, caption, or chat excerpt for a safety analysis.",
      explanation: "Nothing was analyzed yet.",
    };
  }

  const matched = RULES.flatMap((rule) =>
    rule.terms
      .filter((term) => normalized.includes(term))
      .map((term) => ({ ...rule, term })),
  );

  if (!matched.length) return emptyResult();

  const byCategory = matched.reduce<Record<string, { total: number; rules: typeof matched }>>((acc, item) => {
    acc[item.category] ??= { total: 0, rules: [] };
    acc[item.category].total += item.weight;
    acc[item.category].rules.push(item);
    return acc;
  }, {});

  const ranked = Object.entries(byCategory).sort((a, b) => b[1].total - a[1].total);
  const [primaryCategory, primaryData] = ranked[0];
  const uniqueIndicators = [...new Set(primaryData.rules.map((item) => item.indicator))];
  const matchedTerms = [...new Set(primaryData.rules.map((item) => item.term))];

  let score = Math.min(99, 8 + primaryData.total);
  if (primaryCategory === "Potential Grooming" && matched.length >= 2) score = Math.min(99, score + 8);
  if (primaryCategory === "Scam / Phishing" && matched.length >= 2) score = Math.min(99, score + 6);
  if (primaryCategory === "Cyberbullying" && matched.length >= 2) score = Math.min(99, score + 4);
  if (ranked.length > 1) score = Math.min(99, score + Math.min(10, ranked.length * 3));

  const confidence: ConfidenceLevel = matched.some((item) => item.confidence === "high")
    ? "high"
    : matched.length > 1 ? "medium" : "low";

  return {
    score,
    severity: severityFor(score),
    confidence,
    category: primaryCategory as ThreatCategory,
    indicators: uniqueIndicators,
    recommendation: recommendationFor(primaryCategory as ThreatCategory),
    matchedTerms,
    explanation: `Matched ${matched.length} signal${matched.length === 1 ? "" : "s"} across ${ranked.length} categor${ranked.length === 1 ? "y" : "ies"} using transparent phrase rules. Highest-confidence category: ${primaryCategory}. This is assistive classification, not a guarantee or diagnosis.`,
  };
}
