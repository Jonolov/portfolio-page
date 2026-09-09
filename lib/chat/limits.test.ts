import { describe, expect, it } from "vitest";
import type { UIMessage } from "ai";
import { MAX_MESSAGES, withinLimits } from "@/lib/chat/limits";

const userMsg = (text: string): UIMessage => ({
  id: Math.random().toString(36).slice(2),
  role: "user",
  parts: [{ type: "text", text }],
});

describe("withinLimits", () => {
  it("rejects an empty array", () => {
    expect(withinLimits([])).toBe(false);
  });

  it("accepts a normal short conversation", () => {
    expect(withinLimits([userMsg("Does Jon know Kubernetes?")])).toBe(true);
  });

  it("rejects more than MAX_MESSAGES messages", () => {
    const many = Array.from({ length: MAX_MESSAGES + 1 }, () => userMsg("hi"));
    expect(withinLimits(many)).toBe(false);
  });

  it("rejects when total user text exceeds the character budget", () => {
    expect(withinLimits([userMsg("x".repeat(4001))])).toBe(false);
  });
});
