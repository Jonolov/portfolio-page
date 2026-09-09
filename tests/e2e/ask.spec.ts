import { expect, test, type Page } from "@playwright/test";

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

async function openPanel(page: Page) {
  await page.keyboard.press("ControlOrMeta+k");
  await page.getByRole("option", { name: /ask about jon/i }).click();
  await expect(page.getByRole("dialog", { name: /ask/i })).toBeVisible();
}

test.describe("ask panel — plumbing", () => {
  test("opens from the palette Ask item with focus in the textarea", async ({
    page,
  }) => {
    await stubChat(page, "");
    await page.goto("/");
    await page.waitForTimeout(200);
    await openPanel(page);

    const dialog = page.getByRole("dialog", { name: /ask/i });
    await expect(dialog.getByRole("textbox")).toBeFocused();
  });

  test("Escape closes the panel and restores focus to the trigger", async ({
    page,
  }) => {
    await stubChat(page, "");
    await page.goto("/");
    await page.waitForTimeout(200);
    await page.getByRole("link", { name: "About" }).focus();
    await openPanel(page);

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: /ask/i })).toBeHidden();
    await expect(page.getByRole("link", { name: "About" })).toBeFocused();
  });

  test("a non-matching palette search offers 'Ask AI' and seeds the panel", async ({
    page,
  }) => {
    let sentBody = "";
    await page.route("**/api/chat", (route) => {
      sentBody = route.request().postData() ?? "";
      return route.fulfill({
        status: 200,
        headers: { "content-type": "text/event-stream" },
        body: "",
      });
    });
    await page.goto("/");
    await page.waitForTimeout(200);
    await page.keyboard.press("ControlOrMeta+k");
    await page.locator("[cmdk-input]").fill("does jon know rust");
    await page.getByRole("button", { name: /ask ai/i }).click();

    await expect(page.getByRole("dialog", { name: /ask/i })).toBeVisible();
    await expect.poll(() => sentBody).toContain("does jon know rust");
  });
});

test.describe("ask panel — conversation", () => {
  test("renders a streamed assistant answer", async ({ page }) => {
    await stubChat(page, TEXT_ANSWER);
    await page.goto("/");
    await page.waitForTimeout(200);
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
    await page.waitForTimeout(200);
    await openPanel(page);

    const dialog = page.getByRole("dialog", { name: /ask/i });
    await dialog.getByRole("textbox").fill("how do I hire you?");
    await page.keyboard.press("Enter");

    await expect(dialog.locator('a[href^="mailto:"]')).toBeVisible();
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
    await page.waitForTimeout(200);
    await openPanel(page);

    const dialog = page.getByRole("dialog", { name: /ask/i });
    await dialog.getByRole("textbox").fill("hi");
    await page.keyboard.press("Enter");

    await expect(page.getByText(/sending messages a bit fast/i)).toBeVisible();
  });
});
