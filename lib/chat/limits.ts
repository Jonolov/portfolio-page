import type { UIMessage } from "ai";

// Model settings live here so the history budgets below are derived from
// what the model can actually produce, instead of drifting from the route.
export const MAX_STEPS = 3;
export const MAX_OUTPUT_TOKENS = 350; // per step, not per reply

export const MAX_MESSAGES = 16;
export const MAX_TOTAL_CHARS = 4000;
// The client sends the whole history, assistant turns included, so those
// need a ceiling too. One reply is at most MAX_STEPS steps of
// MAX_OUTPUT_TOKENS each; 6 serialized chars per token leaves room for JSON
// escaping and non-ASCII, plus a flat allowance for tool call/result parts.
export const MAX_ASSISTANT_MESSAGE_CHARS =
  MAX_STEPS * MAX_OUTPUT_TOKENS * 6 + 1_500;
export const MAX_CONVERSATION_CHARS =
  (MAX_MESSAGES / 2) * MAX_ASSISTANT_MESSAGE_CHARS + 2 * MAX_TOTAL_CHARS;

function isPart(part: unknown): part is { type: string; text?: unknown } {
  return (
    typeof part === "object" &&
    part !== null &&
    typeof (part as { type?: unknown }).type === "string"
  );
}

export function withinLimits(messages: UIMessage[]): boolean {
  if (!Array.isArray(messages) || messages.length === 0) return false;
  if (messages.length > MAX_MESSAGES) return false;

  let userChars = 0;
  let conversationChars = 0;
  for (const message of messages) {
    if (!Array.isArray(message?.parts) || !message.parts.every(isPart)) {
      return false;
    }
    // Serialized size covers every part type (text, tool input/output, ...).
    const size = JSON.stringify(message.parts).length;
    conversationChars += size;
    if (message.role !== "user") {
      if (size > MAX_ASSISTANT_MESSAGE_CHARS) return false;
      continue;
    }
    for (const part of message.parts) {
      if (part.type === "text" && typeof part.text === "string") {
        userChars += part.text.length;
      }
    }
  }
  return (
    userChars <= MAX_TOTAL_CHARS && conversationChars <= MAX_CONVERSATION_CHARS
  );
}
