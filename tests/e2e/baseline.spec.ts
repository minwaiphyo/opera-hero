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
  // The baseline is a development surface reached by URL; it advertises no
  // navigation to the laboratories.
  await expect(page.getByRole("link")).toHaveCount(0);
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
    page.getByRole("heading", { name: "Stability monitor" }),
  ).toBeVisible();
  // Development surfaces are reached by URL only; no milestone navigation is shown.
  await expect(page.getByRole("link")).toHaveCount(0);
});

test("runs the M2 landmark replay laboratory without camera access", async ({
  page,
}) => {
  let cameraRequests = 0;
  await page.addInitScript(() => {
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
      configurable: true,
      value: () => {
        window.sessionStorage.setItem("unexpected-camera-request", "true");
        return Promise.reject(new Error("Replay must not request a camera."));
      },
    });
  });

  page.on("console", async () => {
    cameraRequests =
      (await page.evaluate(() =>
        sessionStorage.getItem("unexpected-camera-request"),
      )) === "true"
        ? 1
        : 0;
  });

  await page.goto("/lab/landmarks");

  await expect(
    page.getByRole("heading", { name: "Landmark replay laboratory" }),
  ).toBeVisible();
  await expect(page.getByLabel("Fixture", { exact: true })).toHaveValue(
    "tracking-loss-recovery",
  );
  await page.getByRole("button", { name: "Play" }).click();
  await expect(page.getByText("Replay · running")).toBeVisible();
  await expect(page.getByText(/1\/2|2\/2/)).toBeVisible();
  expect(cameraRequests).toBe(0);
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem("unexpected-camera-request"),
    ),
  ).toBeNull();
});
