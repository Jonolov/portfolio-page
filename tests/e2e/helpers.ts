import { expect, type Page } from "@playwright/test";

/**
 * Open the ⌘K command palette. The global keydown listener attaches in an
 * effect after hydration, so an early press can be dropped — retry until the
 * palette's items are actually on screen.
 */
export async function openPalette(page: Page) {
  const anyItem = page.getByRole("option").first();
  await expect(async () => {
    if (!(await anyItem.isVisible())) {
      await page.keyboard.press("ControlOrMeta+k");
    }
    await expect(anyItem).toBeVisible({ timeout: 1500 });
  }).toPass({ timeout: 20000 });
}

/** Open the palette and select "Ask about Jon's experience". */
export async function openAskPanel(page: Page) {
  await openPalette(page);
  await page.getByRole("option", { name: /ask about jon/i }).click();
  await expect(page.getByRole("dialog", { name: /ask/i })).toBeVisible();
}
