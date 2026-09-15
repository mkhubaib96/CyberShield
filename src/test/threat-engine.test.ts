import { describe, expect, it } from "vitest";
import { analyzeText } from "@/lib/threat-engine";

describe("CyberShield threat engine", () => {
  it("flags secrecy and grooming indicators", () => {
    const result = analyzeText("Don't tell your parents. You can trust me. Keep this secret.");
    expect(result.category).toBe("Potential Grooming");
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.indicators.length).toBeGreaterThan(0);
    expect(result.severity).toBe("critical");
    expect(result.confidence).toBe("high");
  });

  it("flags phishing signals", () => {
    const result = analyzeText("URGENT: verify your account now and send me the OTP to claim free Robux.");
    expect(result.category).toBe("Scam / Phishing");
    expect(result.severity).toBe("critical");
    expect(result.matchedTerms).toContain("send me the otp");
  });

  it("keeps benign text as no significant risk", () => {
    const result = analyzeText("Can you help me with my maths homework tonight?");
    expect(result.category).toBe("No Significant Risk");
    expect(result.severity).toBe("low");
    expect(result.score).toBe(0);
    expect(result.indicators).toHaveLength(0);
  });
});
