import { expect, test } from "@playwright/test";
import { openAskPanel } from "./helpers";

test.use({ contextOptions: { reducedMotion: "reduce" } });

test.describe("reduced motion", () => {
  test("hero content is visible immediately, no animation dependency", async ({
    page,
  }) => {
    await page.goto("/");
    const heading = page.locator("#hero-heading");
    await expect(heading).toBeVisible();
    await expect(heading).toHaveCSS("opacity", "1");
    await expect(heading).toHaveCSS("transform", "none");
  });

  test("below-the-fold sections are fully visible once scrolled to", async ({
    page,
  }) => {
    await page.goto("/");
    for (const id of ["about", "experience", "skills", "projects", "contact"]) {
      const section = page.locator(`#${id}`);
      await section.scrollIntoViewIfNeeded();
      const heading = section.getByRole("heading", { level: 2 }).first();
      await expect(heading).toBeVisible();
      await expect(heading).toHaveCSS("opacity", "1");
    }
  });

  test("revealed elements carry no residual transform", async ({ page }) => {
    await page.goto("/");
    await page.locator("#experience").scrollIntoViewIfNeeded();
    const revealed = page.locator("#experience [data-reveal]");
    const count = await revealed.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(revealed.nth(i)).toHaveCSS("transform", "none");
    }
  });

  test("ask panel streaming caret does not blink", async ({ page }) => {
    await page.route("**/api/chat", (route) =>
      route.fulfill({
        status: 200,
        headers: {
          "content-type": "text/event-stream",
          "x-vercel-ai-ui-message-stream": "v1",
        },
        body:
          'data: {"type":"text-start","id":"t1"}\n\n' +
          'data: {"type":"text-delta","id":"t1","delta":"Streaming."}\n\n' +
          'data: {"type":"text-end","id":"t1"}\n\n' +
          "data: [DONE]\n\n",
      }),
    );
    await page.goto("/");
    await openAskPanel(page);
    const dialog = page.getByRole("dialog", { name: /ask/i });
    await dialog.getByRole("textbox").fill("hi");
    await page.keyboard.press("Enter");
    const caret = dialog.locator(".motion-safe\\:animate-caret");
    await expect(caret.first()).toBeVisible();
    await expect(caret.first()).toHaveCSS("animation-name", "none");
  });

  test("contact mark and every contact link are visible and untransformed", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#contact").scrollIntoViewIfNeeded();

    const mark = page.locator("#contact [data-contact-mark]");
    await expect(mark).toBeVisible();
    await expect(mark).toHaveCSS("transform", "none");

    for (const name of [/@/, /LinkedIn/]) {
      const link = page.locator("#contact").getByRole("link", { name });
      await expect(link).toBeVisible();
      await expect(link).toHaveCSS("opacity", "1");
    }

    const vp = page.viewportSize()!;
    const box = await page.locator("#contact").boundingBox();
    expect(box?.height ?? 0).toBeLessThan(vp.height * 1.6);
  });

  test("command palette open/close transition has zero duration", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForTimeout(200);
    await page.keyboard.press("ControlOrMeta+k");
    const dialog = page.locator("[cmdk-dialog]");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveCSS("transition-duration", "0s");
  });
});
