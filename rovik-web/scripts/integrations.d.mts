export type FormProvider = "formspree" | "web3forms" | "generic" | "";
export interface FormConfig {
  provider: FormProvider;
  endpoint: string;
  accessKey: string;
  enabled: boolean;
}
export interface TrackingConfig {
  ga4: string;
  googleAds: string;
  googleAdsLeadLabel: string;
  metaPixel: string;
  enabled: boolean;
}
export interface Integrations {
  form: FormConfig;
  tracking: TrackingConfig;
  warnings: string[];
}
export const WEB3FORMS_ENDPOINT: string;
export function readIntegrations(
  config: { form?: Record<string, unknown>; tracking?: Record<string, unknown> },
  env: Record<string, string | undefined>
): Integrations;
export function cspSources(i: Integrations): { script: string[]; connect: string[]; img: string[]; frame: string[] };
export function envFromProcess(): Record<string, string | undefined>;
