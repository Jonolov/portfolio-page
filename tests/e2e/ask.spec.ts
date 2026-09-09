import { expect, test, type Page } from "@playwright/test";

// Stub the chat endpoint so tests never call the model.
async function stubChat(page: Page, body: string, status = 200) {
  await page.route("**/api/chat", (route) =>
    route.fulfill({
      status,
      headers: { "content-type": "text/event-stream" },
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
