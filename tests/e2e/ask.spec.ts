import { expect, test, type Page } from "@playwright/test";
import { openAskPanel } from "./helpers";

// Build a UI-message SSE stream body the way toUIMessageStreamResponse does.
function uiStream(chunks: object[]): string {
  return (
    chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("") +
    "data: [DONE]\n\n"
  );
}

const TEXT_ANSWER = uiStream([
  { type: "text-start", id: "t1" },
  { type: "text-delta", id: "t1", delta: "Jon has deep React experience." },
  { type: "text-end", id: "t1" },
]);

// Stub the chat endpoint so tests never call the model.
async function stubChat(page: Page, body: string, status = 200) {
  await page.route("**/api/chat", (route) =>
    route.fulfill({
      status,
      headers: {
        "content-type": "text/event-stream",
        "x-vercel-ai-ui-message-stream": "v1",
      },
      body,
    }),
  );
}

const openPanel = openAskPanel;

test.describe("ask launcher", () => {
  test("is visible from the top and opens the panel; hides while it's open", async ({
    page,
  }) => {
    await stubChat(page, "");
    await page.goto("/");

    const launcher = page.getByRole("button", { name: /ask jon-bot/i });
    await expect(launcher).toBeVisible();

    await launcher.click();
    const dialog = page.getByRole("dialog", { name: /ask/i });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("textbox")).toBeFocused();
    await expect(launcher).toBeHidden();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(launcher).toBeVisible();
  });
});

test.describe("ask panel — plumbing", () => {
  test("Escape closes the panel and restores focus to the launcher", async ({
    page,
  }) => {
    await stubChat(page, "");
    await page.goto("/");
    const launcher = page.getByRole("button", { name: /ask jon-bot/i });
    await openPanel(page);

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: /ask/i })).toBeHidden();
    await expect(launcher).toBeFocused();
  });
});

test.describe("ask panel — conversation", () => {
  test("renders a streamed assistant answer", async ({ page }) => {
    await stubChat(page, TEXT_ANSWER);
    await page.goto("/");
    await openPanel(page);

    const dialog = page.getByRole("dialog", { name: /ask/i });
    await dialog.getByRole("textbox").fill("react?");
    await page.keyboard.press("Enter");

    await expect(
      dialog.getByRole("log").getByText("Jon has deep React experience."),
    ).toBeVisible();
  });

  test("renders the contact card when the model calls showContactCard", async ({
    page,
  }) => {
    await stubChat(
      page,
      uiStream([
        {
          type: "tool-input-available",
          toolCallId: "c1",
          toolName: "showContactCard",
          input: { reason: "wants to hire" },
        },
      ]),
    );
    await page.goto("/");
    await openPanel(page);

    const dialog = page.getByRole("dialog", { name: /ask/i });
    await dialog.getByRole("textbox").fill("how do I hire you?");
    await page.keyboard.press("Enter");

    await expect(dialog.locator('a[href^="mailto:"]')).toBeVisible();
  });

  test("clears the conversation when the panel is closed and reopened", async ({
    page,
  }) => {
    await stubChat(page, TEXT_ANSWER);
    await page.goto("/");
    await openPanel(page);

    const dialog = page.getByRole("dialog", { name: /ask/i });
    await dialog.getByRole("textbox").fill("react?");
    await page.keyboard.press("Enter");
    await expect(
      dialog.getByRole("log").getByText("Jon has deep React experience."),
    ).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await openPanel(page);

    await expect(
      dialog.getByRole("log").getByText("Jon has deep React experience."),
    ).toBeHidden();
    await expect(dialog.getByText(/Ask about Jon/i)).toBeVisible();
  });

  test("shows a friendly line when rate-limited", async ({ page }) => {
    await page.route("**/api/chat", (route) =>
      route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({ error: "rate_limited" }),
      }),
    );
    await page.goto("/");
    await openPanel(page);

    const dialog = page.getByRole("dialog", { name: /ask/i });
    await dialog.getByRole("textbox").fill("hi");
    await page.keyboard.press("Enter");

    await expect(page.getByText(/sending messages a bit fast/i)).toBeVisible();
  });
});
