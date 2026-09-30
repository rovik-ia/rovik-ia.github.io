import { defineConfig, devices } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// En el entorno de Claude Code el navegador viene preinstalado; en local usa el de Playwright.
function chromiumPath(): string | undefined {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const base = "/opt/pw-browsers";
  if (!fs.existsSync(base)) return undefined;
  const dir = fs.readdirSync(base).find((d) => /^chromium-\d+$/.test(d));
  const p = dir && path.join(base, dir, "chrome-linux/chrome");
  return p && fs.existsSync(p) ? p : undefined;
}

const PORT = 4173;

export default defineConfig({
  testDir: "tests",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "es-ES",
    launchOptions: {
      executablePath: chromiumPath(),
      args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
    },
  },
  webServer: {
    command: `node scripts/serve.mjs ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: true,
    env: { HEADERS: "1" },
  },
  projects: [
    { name: "movil-375", use: { ...devices["iPhone SE"], browserName: "chromium", viewport: { width: 375, height: 667 } } },
    { name: "movil-390", use: { ...devices["iPhone 13"], browserName: "chromium", viewport: { width: 390, height: 844 } } },
    { name: "tableta-768", use: { browserName: "chromium", viewport: { width: 768, height: 1024 }, hasTouch: true } },
    { name: "portatil-1024", use: { browserName: "chromium", viewport: { width: 1024, height: 768 } } },
    { name: "escritorio-1440", use: { browserName: "chromium", viewport: { width: 1440, height: 900 } } },
  ],
});
