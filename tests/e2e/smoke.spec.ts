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

    await expect(page.locator("#contact")).toBeAttached();
    await expect(
      page.getByRole("link", { name: profile.contact.email }),
    ).toBeAttached();
  });

  test("contact is reachable within one click from the top of the page", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "contact", exact: true }).click();
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
