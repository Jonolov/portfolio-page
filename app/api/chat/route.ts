import { anthropic } from "@ai-sdk/anthropic";
import {
  convertToModelMessages,
  isStepCount,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { checkBotId } from "botid/server";
import {
  getEarlierRoles,
  getExperience,
  getProfile,
  getSideProjects,
  getSkillGroups,
} from "@/lib/cms";
import { ipFromHeaders } from "@/lib/chat/ip";
import {
  MAX_OUTPUT_TOKENS,
  MAX_STEPS,
  withinLimits,
} from "@/lib/chat/limits";
import { rateLimit } from "@/lib/chat/rate-limit";
import { buildSystemPrompt } from "@/lib/chat/system-prompt";

export const maxDuration = 30;

const MODEL = anthropic("claude-haiku-4-5");

const showContactCard = tool({
  description:
    "Show Jon's contact details (email and LinkedIn). Call this when the visitor asks how to reach Jon, discusses a possible role or engagement, or asks whether Jon is available.",
  inputSchema: z.object({
    reason: z
      .string()
      .describe("Why the visitor might want to contact Jon, in a few words"),
  }),
  // The panel renders the card client-side from this tool part; execute just
  // resolves the call so the conversation history stays valid on the next turn.
  execute: async () => "The visitor has been shown Jon's contact card.",
});

export async function POST(req: Request): Promise<Response> {
  const { isBot } = await checkBotId();
  if (isBot) return Response.json({ error: "forbidden" }, { status: 403 });

  const ip = ipFromHeaders(req.headers);
  if (!rateLimit.check(ip)) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let messages: UIMessage[];
  try {
    ({ messages } = (await req.json()) as { messages: UIMessage[] });
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  if (!withinLimits(messages)) {
    return Response.json({ error: "too_long" }, { status: 400 });
  }

  const [profile, experience, earlierRoles, skills, sideProjects] =
    await Promise.all([
      getProfile(),
      getExperience(),
      getEarlierRoles(),
      getSkillGroups(),
      getSideProjects(),
    ]);

  const result = streamText({
    model: MODEL,
    system: buildSystemPrompt({
      profile,
      experience,
      earlierRoles,
      skills,
      sideProjects,
      today: new Date(),
    }),
    messages: await convertToModelMessages(messages),
    tools: { showContactCard },
    stopWhen: isStepCount(MAX_STEPS),
    temperature: 0.3,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
  });

  return result.toUIMessageStreamResponse();
}
