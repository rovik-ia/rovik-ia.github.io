import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Exportación estática: las imágenes ya se sirven optimizadas (WebP + srcset) desde /public,
      // así que <img> con width/height, lazy y srcset es equivalente y no añade JS.
      "@next/next/no-img-element": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "scripts/render/.cache/**", "test-results/**", "playwright-report/**"]),
]);

export default eslintConfig;
