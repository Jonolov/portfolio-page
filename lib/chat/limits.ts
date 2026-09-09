import type { UIMessage } from "ai";

export const MAX_MESSAGES = 16;
export const MAX_TOTAL_CHARS = 4000;

export function withinLimits(messages: UIMessage[]): boolean {
  if (!Array.isArray(messages) || messages.length === 0) return false;
  if (messages.length > MAX_MESSAGES) return false;

  let userChars = 0;
  for (const message of messages) {
    if (message.role !== "user") continue;
    for (const part of message.parts) {
      if (part.type === "text") userChars += part.text.length;
    }
  }
  return userChars <= MAX_TOTAL_CHARS;
}
