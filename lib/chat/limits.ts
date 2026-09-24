import type { UIMessage } from "ai";

export const MAX_MESSAGES = 16;
export const MAX_TOTAL_CHARS = 4000;
// The client sends the whole history, assistant turns included, so the
// whole conversation needs a ceiling too. Sized for 8 max-length answers
// (350 tokens each) plus the user budget, with room for part overhead.
export const MAX_CONVERSATION_CHARS = 24_000;

export function withinLimits(messages: UIMessage[]): boolean {
  if (!Array.isArray(messages) || messages.length === 0) return false;
  if (messages.length > MAX_MESSAGES) return false;

  let userChars = 0;
  let conversationChars = 0;
  for (const message of messages) {
    if (!Array.isArray(message?.parts)) return false;
    // Serialized size covers every part type (text, tool input/output, ...).
    conversationChars += JSON.stringify(message.parts).length;
    if (message.role !== "user") continue;
    for (const part of message.parts) {
      if (part?.type === "text" && typeof part.text === "string") {
        userChars += part.text.length;
      }
    }
  }
  return (
    userChars <= MAX_TOTAL_CHARS && conversationChars <= MAX_CONVERSATION_CHARS
  );
}
