import { expect, test } from "@playwright/test";

test("landing page loads and shows the product name", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /campustutor/i })).toBeVisible();
});
