import { expect, test } from "@playwright/test";
import { preview, type PreviewServer } from "vite";

let server: PreviewServer;

test.beforeAll(async () => {
  server = await preview({
    preview: {
      host: "127.0.0.1",
      port: 4173,
      strictPort: true,
    },
  });
});

test.afterAll(async () => {
  await server?.close();
});

test("shows the M0 baseline and required capability result", async ({ page }) => {
  const externalRequests: string[] = [];
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname !== "127.0.0.1") {
      externalRequests.push(url.href);
      await route.abort();
      return;
    }
    await route.continue();
  });

  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "System baseline" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Provisional exhibition profile" }),
  ).toBeVisible();
  await expect(
    page.getByText("Core browser checks passed", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("SunplusIT integrated camera")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Manual hardware checks" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Test camera" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Test audio" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "M1 Camera laboratory" }),
  ).toBeVisible();
  expect(externalRequests).toEqual([]);
});

test("opens the M1 camera laboratory", async ({ page }) => {
  await page.goto("/lab/camera");

  await expect(
    page.getByRole("heading", { name: "Camera laboratory" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Start camera" })).toBeVisible();
  await expect(page.getByLabel("Available camera")).toBeVisible();
  await expect(page.getByText("Preview is stopped")).toBeVisible();
  await expect(page.getByText("No recording or upload")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "M0 System baseline" }),
  ).toBeVisible();
});
