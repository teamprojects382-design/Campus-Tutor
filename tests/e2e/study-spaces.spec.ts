import { test, expect } from "@playwright/test";

test.describe("study spaces e2e", () => {
  test("redirects unauthenticated users to sign in", async ({ page }) => {
    await page.goto("/study-spaces");

    await expect(page).toHaveURL(/\/login\?next=%2Fstudy-spaces$/);
  });
});
