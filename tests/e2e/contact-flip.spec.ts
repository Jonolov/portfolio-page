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
    await expect(contact.locator("[data-contact-mark]")).toBeVisible();
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
});
