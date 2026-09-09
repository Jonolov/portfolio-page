import { expect, test } from "@playwright/test";
import { profile } from "@/content/profile";

test.describe("scroll session", () => {
  test("renders the terminal transcript content statically", async ({
    page,
  }) => {
    await page.goto("/");
    const section = page.locator("#session");
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();

    // Command lines are deterministic regardless of CMS data.
    for (const cmd of ["whoami", "ls ~/work", "cat stack.txt", "render --mark"]) {
      await expect(
        section.getByText(cmd, { exact: false }).first(),
      ).toBeVisible();
    }
    // And there is real output between the commands.
    await expect(section.locator("[data-line='output']").first()).toBeVisible();
  });

  test("contact is still reachable by scrolling past the section", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await expect(
      page.getByRole("link", { name: profile.contact.email }),
    ).toBeInViewport();
  });

  test("pins the terminal window while scrolling through it", async ({
    page,
  }) => {
    await page.goto("/");
    // Scroll well into the pinned range.
    await page
      .locator("#session")
      .evaluate((el) => el.scrollIntoView({ block: "start" }));
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(400);
    const win = page.locator("[data-session-window]");
    const y1 = (await win.boundingBox())?.y ?? 0;

    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(400);
    const y2 = (await win.boundingBox())?.y ?? 0;

    // Pinned: the window barely moves despite a 400px scroll.
    expect(Math.abs(y1 - y2)).toBeLessThan(80);
  });
});
