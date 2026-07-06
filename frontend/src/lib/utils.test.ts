import { describe, expect, it } from "vitest";

import { cn, deriveTitleFromText } from "./utils";

describe("cn", () => {
  it("joins truthy class names", () => {
    expect(cn("a", "b", false && "c", undefined, "d")).toBe("a b d");
  });

  it("resolves conflicting Tailwind classes to the last one", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });
});

describe("deriveTitleFromText", () => {
  it("falls back to a placeholder for empty or whitespace-only input", () => {
    expect(deriveTitleFromText("")).toBe("Pasted note");
    expect(deriveTitleFromText("   \n\t  ")).toBe("Pasted note");
  });

  it("collapses internal whitespace and returns short text unchanged", () => {
    expect(deriveTitleFromText("Discovery call\nwith  Acme Corp")).toBe(
      "Discovery call with Acme Corp",
    );
  });

  it("truncates long text at a word boundary with an ellipsis", () => {
    const longText =
      "We spoke with the VP of Sales about their onboarding pains and rollout timeline for next quarter.";
    const title = deriveTitleFromText(longText, 60);
    expect(title.length).toBeLessThanOrEqual(61);
    expect(title.endsWith("…")).toBe(true);
    expect(title.startsWith("We spoke with the VP of Sales")).toBe(true);
  });

  it("hard-truncates when there is no reasonable word boundary", () => {
    const longWord = "a".repeat(80);
    const title = deriveTitleFromText(longWord, 60);
    expect(title).toBe(`${"a".repeat(60)}…`);
  });
});
