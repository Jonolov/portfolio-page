import { expect, test } from "@playwright/test";
import { profile } from "@/content/profile";

test.describe("contact flip", () => {
  test("static sign-off content is present and correct", async ({ page }) => {
    await page.goto("/");
    const contact = page.locator("#contact");
    await contact.scrollIntoViewIfNeeded();
    await expect(contact).toBeVisible();

    await expect(contact.getByRole("heading", { level: 2 })).toBeVisible();

    const mail = page.getByRole("link", { name: profile.contact.email });
    await expect(mail).toHaveAttribute(
      "href",
      `mailto:${profile.contact.email}`,
    );
    await expect(mail).toBeInViewport();

    await expect(page.getByRole("link", { name: /linkedin/i })).toBeVisible();
    // the static mark is the SSR / fallback image — always in the DOM
    // (the animated path visually swaps it for the flown overlay)
    await expect(contact.locator("[data-contact-mark]")).toBeAttached();
  });

  test("the FlipMark overlay is idle at the top of the page", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("[data-flip-mark]")).toBeHidden();
    await expect(page.locator("[data-nav-mark]")).toBeVisible();
  });

  test("contact is still reachable by scrolling to the bottom", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await expect(
      page.getByRole("link", { name: profile.contact.email }),
    ).toBeInViewport();
  });

  test("no horizontal overflow on a narrow viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 720 });
    await page.goto("/");
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1600); // let the fly-out + shatter run

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("the mark flies to centre when contact enters, docks away on scroll up", async ({
    page,
  }) => {
    await page.goto("/");
    const overlay = page.locator("[data-flip-mark]");
    await expect(overlay).toBeHidden();

    await page.locator("#contact").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000); // fly-out is ~0.8s
    await expect(overlay).toBeVisible();

    const box = await overlay.boundingBox();
    const vp = page.viewportSize()!;
    expect(box?.width ?? 0).toBeGreaterThan(vp.width * 0.1);
    expect(
      Math.abs(box!.x + box!.width / 2 - vp.width / 2),
    ).toBeLessThan(vp.width * 0.15);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);
    await expect(overlay).toBeHidden();
  });
});
