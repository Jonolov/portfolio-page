import { describe, expect, it } from "vitest";
import type { UIMessage } from "ai";
import {
  MAX_CONVERSATION_CHARS,
  MAX_MESSAGES,
  withinLimits,
} from "@/lib/chat/limits";

const userMsg = (text: string): UIMessage => ({
  id: Math.random().toString(36).slice(2),
  role: "user",
  parts: [{ type: "text", text }],
});

const assistantMsg = (text: string): UIMessage => ({
  id: Math.random().toString(36).slice(2),
  role: "assistant",
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

  it("accepts a full-length realistic conversation", () => {
    // 8 turns: ~200-char questions, max-length answers (350 tokens ≈ 1500 chars).
    const convo = Array.from({ length: MAX_MESSAGES / 2 }, () => [
      userMsg("q".repeat(200)),
      assistantMsg("a".repeat(1500)),
    ]).flat();
    expect(withinLimits(convo)).toBe(true);
  });

  it("rejects a history stuffed with oversized assistant text", () => {
    const stuffed = [
      assistantMsg("x".repeat(MAX_CONVERSATION_CHARS)),
      userMsg("hi"),
    ];
    expect(withinLimits(stuffed)).toBe(false);
  });

  it("rejects a history stuffed through tool-call parts", () => {
    const stuffed = [
      {
        id: "a1",
        role: "assistant",
        parts: [
          {
            type: "tool-showContactCard",
            toolCallId: "c1",
            state: "output-available",
            input: { reason: "x".repeat(MAX_CONVERSATION_CHARS) },
            output: "shown",
          },
        ],
      },
      userMsg("hi"),
    ] as UIMessage[];
    expect(withinLimits(stuffed)).toBe(false);
  });

  it("rejects malformed messages instead of throwing", () => {
    const malformed = [{ id: "1", role: "user" }] as unknown as UIMessage[];
    expect(withinLimits(malformed)).toBe(false);
    expect(withinLimits([null] as unknown as UIMessage[])).toBe(false);
    const badPart = [
      { id: "1", role: "user", parts: [{ type: "text" }, null] },
    ] as unknown as UIMessage[];
    expect(() => withinLimits(badPart)).not.toThrow();
  });
});
