import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

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
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("keyboard-only traversal reaches nav, hero CTAs, and contact", async ({
    page,
  }) => {
    await page.goto("/");

    const expectedStops = [
      "Skip to content",
      /Jon Stjärnström/,
      "About",
      "Experience",
      "Skills",
      "Contact",
      "Get in touch",
      "See experience",
    ];

    for (const name of expectedStops) {
      await page.keyboard.press("Tab");
      const focused = page.locator(":focus");
      await expect(focused).toBeVisible();
      if (typeof name === "string") {
        await expect(focused).toHaveText(new RegExp(name));
      }
    }
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

  test("experience toggle exposes aria-expanded state", async ({ page }) => {
    await page.goto("/");
    const toggle = page.locator('button[aria-controls="earlier-roles"]');
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
  });
});
