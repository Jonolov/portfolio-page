import { expect, type Page } from "@playwright/test";

/** Open the Ask panel via its floating launcher button. */
export async function openAskPanel(page: Page) {
  await page.getByRole("button", { name: /ask jon-bot/i }).click();
  await expect(page.getByRole("dialog", { name: /ask/i })).toBeVisible();
}
