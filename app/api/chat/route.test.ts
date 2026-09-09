import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("botid/server", () => ({
  checkBotId: vi.fn(async () => ({ isBot: false })),
}));

vi.mock("@/lib/cms", () => ({
  getProfile: vi.fn(async () => ({
    name: "Jon Stjärnström",
    roleLine: "",
    heroHook: "",
    about: { paragraphs: [] },
    contact: {
      email: "j@x",
      company: "",
      location: "Stockholm",
      linkedin: "",
      availableForConsulting: true,
      statusLine: "",
    },
  })),
  getExperience: vi.fn(async () => []),
  getEarlierRoles: vi.fn(async () => []),
  getSkillGroups: vi.fn(async () => []),
  getSideProjects: vi.fn(async () => []),
}));

vi.mock("@ai-sdk/anthropic", () => ({
  anthropic: (id: string) => ({ id }),
}));

const streamText = vi.fn<
  (opts: { system: string }) => { toUIMessageStreamResponse: () => Response }
>(() => ({
  toUIMessageStreamResponse: () => new Response("ok", { status: 200 }),
}));
vi.mock("ai", () => ({
  streamText: (opts: { system: string }) => streamText(opts),
  tool: (def: unknown) => def,
  isStepCount: (n: number) => n,
  convertToModelMessages: async (m: unknown) => m,
}));

import { checkBotId } from "botid/server";
import { POST } from "@/app/api/chat/route";
import { __resetRateLimit } from "@/lib/chat/rate-limit";

const mockedCheckBotId = checkBotId as unknown as ReturnType<typeof vi.fn>;

const post = (body: unknown) =>
  POST(
    new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "x-forwarded-for": "9.9.9.9" },
    }),
  );

const oneMessage = {
  messages: [{ id: "1", role: "user", parts: [{ type: "text", text: "hi" }] }],
};

beforeEach(() => {
  __resetRateLimit();
  streamText.mockClear();
  mockedCheckBotId.mockResolvedValue({ isBot: false });
});

describe("POST /api/chat", () => {
  it("returns 403 for bot traffic", async () => {
    mockedCheckBotId.mockResolvedValueOnce({ isBot: true });
    expect((await post(oneMessage)).status).toBe(403);
  });

  it("returns 400 for an oversized conversation", async () => {
    const big = {
      messages: [
        {
          id: "1",
          role: "user",
          parts: [{ type: "text", text: "x".repeat(5000) }],
        },
      ],
    };
    expect((await post(big)).status).toBe(400);
  });

  it("returns 429 once the per-IP burst limit is exceeded", async () => {
    for (let i = 0; i < 5; i++) expect((await post(oneMessage)).status).toBe(200);
    expect((await post(oneMessage)).status).toBe(429);
  });

  it("passes a Jon-grounded system prompt to streamText on the happy path", async () => {
    await post(oneMessage);
    expect(streamText).toHaveBeenCalledOnce();
    const call = streamText.mock.calls[0]?.[0] as { system: string };
    expect(call.system).toContain("Jon Stjärnström");
  });
});
