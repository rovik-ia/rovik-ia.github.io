#!/usr/bin/env node
// Compila con formulario y medición de prueba, pasa tests/ads.spec.ts y vuelve a compilar la versión normal.
import { execSync } from "node:child_process";

const TEST_ENV = {
  NEXT_PUBLIC_FORM_PROVIDER: "formspree",
  NEXT_PUBLIC_FORM_ENDPOINT: "https://formspree.io/f/testform1",
  NEXT_PUBLIC_GA4_ID: "G-TEST12345",
  NEXT_PUBLIC_GOOGLE_ADS_ID: "AW-123456789",
  NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL: "abcDEF123",
  NEXT_PUBLIC_META_PIXEL_ID: "1234567890123",
};

const run = (cmd, env = {}) => execSync(cmd, { stdio: "inherit", env: { ...process.env, ...env } });
let failed = false;
try {
  run("npm run build", TEST_ENV);
  run("npx playwright test tests/ads.spec.ts --project=escritorio-1440 --project=movil-390", { ADS_BUILD: "1" });
} catch {
  failed = true;
} finally {
  run("npm run build");
}
process.exit(failed ? 1 : 0);
