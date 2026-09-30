import config from "../site.config.json";
import { readIntegrations, type Integrations } from "../scripts/integrations.mjs";

// Las variables NEXT_PUBLIC_* se escriben literalmente para que Next las incruste al compilar.
export const INTEGRATIONS: Integrations = readIntegrations(config, {
  NEXT_PUBLIC_FORM_PROVIDER: process.env.NEXT_PUBLIC_FORM_PROVIDER,
  NEXT_PUBLIC_FORM_ENDPOINT: process.env.NEXT_PUBLIC_FORM_ENDPOINT,
  NEXT_PUBLIC_FORM_ACCESS_KEY: process.env.NEXT_PUBLIC_FORM_ACCESS_KEY,
  NEXT_PUBLIC_GA4_ID: process.env.NEXT_PUBLIC_GA4_ID,
  NEXT_PUBLIC_GOOGLE_ADS_ID: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID,
  NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL: process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL,
  NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
});
