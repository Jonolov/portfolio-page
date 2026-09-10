import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { openAskPanel } from "./helpers";

test.describe("accessibility", () => {
  test("has no automatically detectable WCAG 2.1 AA violations", async ({
    page,
  }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("skip link is the first tab stop and jumps to main content", async ({
    page,
  }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Skip to content" }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("keyboard-only traversal reaches the skip link, nav, and hero CTAs", async ({
    page,
  }) => {
    await page.goto("/");

    const navStops: (string | RegExp)[] = [
      "Skip to content",
      /Jon Stjärnström/,
      "About",
      "Experience",
      "Skills",
      "Projects",
      "Contact",
    ];

    for (const name of navStops) {
      await page.keyboard.press("Tab");
      const focused = page.locator(":focus");
      await expect(focused).toBeVisible();
      await expect(focused).toHaveText(
        typeof name === "string" ? new RegExp(name) : name,
      );
    }

    // The two hero CTAs are the next focus stops — assert they land,
    // not their exact label.
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();
  });

  test("command palette opens via keyboard, traps focus, and restores it on close", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForTimeout(200); // let the global keydown listener attach

    await page.getByRole("link", { name: "About" }).focus();
    await page.keyboard.press("ControlOrMeta+k");

    const dialog = page.locator("[cmdk-dialog]");
    await expect(dialog).toBeVisible();
    await expect(page.locator("[cmdk-input]")).toBeFocused();

    // focus should stay inside the dialog while tabbing
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("Tab");
      const withinDialog = await page.evaluate(() => {
        const el = document.querySelector("[cmdk-dialog]");
        return el ? el.contains(document.activeElement) : false;
      });
      expect(withinDialog).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("link", { name: "About" })).toBeFocused();
  });

  test("command palette has no WCAG violations while open", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForTimeout(200);
    await page.keyboard.press("ControlOrMeta+k");
    await expect(page.locator("[cmdk-dialog]")).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("ask panel has no WCAG violations with a conversation open", async ({
    page,
  }) => {
    await page.route("**/api/chat", (route) =>
      route.fulfill({
        status: 200,
        headers: {
          "content-type": "text/event-stream",
          "x-vercel-ai-ui-message-stream": "v1",
        },
        body:
          'data: {"type":"text-start","id":"t1"}\n\n' +
          'data: {"type":"text-delta","id":"t1","delta":"Jon has deep React experience."}\n\n' +
          'data: {"type":"text-end","id":"t1"}\n\n' +
          "data: [DONE]\n\n",
      }),
    );
    await page.goto("/");
    await openAskPanel(page);
    const dialog = page.getByRole("dialog", { name: /ask/i });
    await dialog.getByRole("textbox").fill("react?");
    await page.keyboard.press("Enter");
    await expect(
      dialog.getByRole("log").getByText("Jon has deep React experience."),
    ).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("contact sign-off has no WCAG violations", async ({ page }) => {
    await page.goto("/");
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await expect(page.locator("#contact")).toBeVisible();
    // wait out the whole timeline (fly 0.8s + shatter + reveal) so axe
    // doesn't measure contrast on mid-fade text
    await expect(
      page.locator("#contact [data-contact-reveal]").last(),
    ).toHaveCSS("opacity", "1");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("experience toggle exposes aria-expanded state", async ({ page }) => {
    await page.goto("/");
    const toggle = page.locator('button[aria-controls="earlier-roles"]');
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
  });
});
