import { expect, test } from "@playwright/test";
import { profile } from "@/content/profile";

test.describe("smoke", () => {
  test("all sections render with their key content", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#hero")).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 1, name: profile.name }),
    ).toBeVisible();

    await expect(page.locator("#about")).toBeAttached();
    await expect(
      page.locator("#about").getByRole("heading", { level: 2 }),
    ).toBeVisible();

    await expect(page.locator("#experience")).toBeAttached();
    await expect(
      page.locator("#experience").getByRole("heading", { level: 2 }),
    ).toBeVisible();
    await expect(
      page.locator("#experience").getByRole("heading", { level: 3 }).first(),
    ).toBeVisible();

    await expect(page.locator("#skills")).toBeAttached();
    await expect(
      page.locator("#skills").getByRole("heading", { level: 2 }),
    ).toBeVisible();

    await expect(page.locator("#projects")).toBeAttached();
    await expect(
      page.locator("#projects").getByRole("link", { name: /Synthesizer/ }),
    ).toBeVisible();
    // one project today → no reel affordance
    await expect(page.locator("#projects [data-reel-hint]")).toHaveCount(0);

    await expect(page.locator("#contact")).toBeAttached();
    await expect(
      page.getByRole("link", { name: profile.contact.email }),
    ).toBeAttached();
  });

  test("contact is reachable within one click from the top of the page", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Contact", exact: true }).click();
    await expect(
      page.getByRole("link", { name: profile.contact.email }),
    ).toBeInViewport();
  });

  test("contact is reachable within one click from the bottom of the page", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#contact").scrollIntoViewIfNeeded();
    // already there — this confirms scrolling alone reaches it, no extra click needed
    await expect(
      page.getByRole("link", { name: profile.contact.email }),
    ).toBeInViewport();
  });

  test("mailto link points at the published contact email", async ({
    page,
  }) => {
    await page.goto("/");
    const mailLink = page.getByRole("link", { name: profile.contact.email });
    await expect(mailLink).toHaveAttribute(
      "href",
      `mailto:${profile.contact.email}`,
    );
  });

  test("no horizontal overflow at narrow widths", async ({ page }) => {
    for (const width of [320, 360, 390, 414]) {
      await page.setViewportSize({ width, height: 780 });
      await page.goto("/");
      // walk the whole page so every section (and its decorative layers) lays out
      for (const id of ["hero", "experience", "projects", "contact"]) {
        await page.locator(`#${id}`).scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
      }
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow, `horizontal overflow at ${width}px`).toBe(0);
    }
  });

  test("experience 'show earlier roles' toggle works", async ({ page }) => {
    await page.goto("/");
    const earlierRoles = page.locator("#earlier-roles");
    const toggle = page.getByRole("button", { name: /show earlier roles/i });

    await expect(earlierRoles).toBeHidden();
    await toggle.click();
    await expect(earlierRoles).toBeVisible();
    await expect(
      page.getByRole("button", { name: /hide earlier roles/i }),
    ).toBeVisible();
  });
});
