import { expect, test } from "@playwright/test";

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

  test("hover-tilt is fully inert on experience cards", async ({ page }) => {
    await page.goto("/");
    await page.locator("#experience").scrollIntoViewIfNeeded();

    const tiltCard = page.locator("#experience .rounded-2xl").first().locator("xpath=..");
    const before = await tiltCard.evaluate((el) => getComputedStyle(el).transform);

    const box = await tiltCard.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.85, {
        steps: 5,
      });
    }
    await page.waitForTimeout(200);

    const after = await tiltCard.evaluate((el) => getComputedStyle(el).transform);
    // transformPerspective alone always yields a near-identity 3D matrix
    // rather than the literal string "none" — what actually proves the
    // tilt is inert is that hovering doesn't change it at all.
    expect(after).toBe(before);
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
