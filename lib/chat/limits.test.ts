import { describe, expect, it } from "vitest";
import type { UIMessage } from "ai";
import {
  MAX_ASSISTANT_MESSAGE_CHARS,
  MAX_CONVERSATION_CHARS,
  MAX_MESSAGES,
  MAX_OUTPUT_TOKENS,
  MAX_STEPS,
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

  it("accepts a full conversation of max-length multi-step tool replies", () => {
    // Every reply uses all steps at max output (~5 chars/token, with quotes
    // and newlines that JSON escaping inflates) and calls the tool once.
    const stepText = 'He said "yes".\n'
      .repeat(200)
      .slice(0, MAX_OUTPUT_TOKENS * 5);
    const reply = (): UIMessage =>
      ({
        id: Math.random().toString(36).slice(2),
        role: "assistant",
        parts: [
          { type: "step-start" },
          { type: "text", text: stepText, state: "done" },
          {
            type: "tool-showContactCard",
            toolCallId: "call_0123456789abcdef",
            state: "output-available",
            input: { reason: "wants to discuss a consulting engagement" },
            output: "The visitor has been shown Jon's contact card.",
          },
          ...Array.from({ length: MAX_STEPS - 1 }, () => [
            { type: "step-start" },
            { type: "text", text: stepText, state: "done" },
          ]).flat(),
        ],
      }) as UIMessage;
    const convo = Array.from({ length: MAX_MESSAGES / 2 }, () => [
      userMsg("q".repeat(200)),
      reply(),
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

  it("rejects stuffing spread across many assistant messages", () => {
    const perMessage = MAX_ASSISTANT_MESSAGE_CHARS - 100;
    const count = Math.ceil(MAX_CONVERSATION_CHARS / perMessage) + 1;
    expect(count).toBeLessThan(MAX_MESSAGES);
    const stuffed = [
      ...Array.from({ length: count }, () => assistantMsg("x".repeat(perMessage))),
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
    for (const parts of [[null], [{ type: "text" }, null], [{}], [{ type: 1 }], ["text"]]) {
      const msgs = [{ id: "1", role: "user", parts }] as unknown as UIMessage[];
      expect(withinLimits(msgs), JSON.stringify(parts)).toBe(false);
    }
  });
});
