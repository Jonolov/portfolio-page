import { expect, test } from "@playwright/test";
import { openAskPanel } from "./helpers";

test.use({ contextOptions: { reducedMotion: "reduce" } });

test.describe("reduced motion", () => {
  test("hero content is visible immediately, with no animation dependency", async ({
    page,
  }) => {
    await page.goto("/");
    const heading = page.locator("#hero-heading");
    await expect(heading).toBeVisible();
    await expect(heading).toHaveCSS("opacity", "1");
    await expect(heading).toHaveCSS("transform", "none");
  });

  test("below-the-fold sections are still fully visible once scrolled to, without a sliding transform", async ({
    page,
  }) => {
    await page.goto("/");

    for (const id of ["about", "experience", "skills", "contact"]) {
      const section = page.locator(`#${id}`);
      await section.scrollIntoViewIfNeeded();
      await expect(section).toBeVisible();

      const heading = section.getByRole("heading", { level: 2 }).first();
      await expect(heading).toBeVisible();
      await expect(heading).toHaveCSS("opacity", "1");
    }
  });

  test("experience cards render with no residual slide transform", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#experience").scrollIntoViewIfNeeded();

    const cards = page.locator("#experience li > div");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toHaveCSS("transform", "none");
    }
  });

  test("contact flip: no overlay, static J shown, nav mark stays", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await expect(page.locator("[data-flip-mark]")).toBeHidden();
    await expect(page.locator("#contact [data-contact-mark]")).toBeVisible();
    await expect(page.locator("[data-nav-mark]")).toBeVisible();

    // The nav mark's assemble-on-load stagger must not leave cells hidden.
    await expect(page.locator("[data-nav-mark] > span").first()).toHaveCSS(
      "opacity",
      "1",
    );

    const vp = page.viewportSize()!;
    const box = await page.locator("#contact").boundingBox();
    expect(box?.height ?? 0).toBeLessThan(vp.height * 1.6);
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
