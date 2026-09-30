// Calculadora de fugas de horas: trabajo pagado en obra que no llega a facturarse.
export interface LeakInput {
  /** Operarios en obra. */
  workers: number;
  /** Horas por semana y operario sin parte o albarán firmado. */
  hoursPerWeek: number;
  /** Precio de facturación por hora (€). */
  rate: number;
}

export interface LeakResult {
  hoursMonth: number;
  euroMonth: number;
  euroYear: number;
}

/** Semanas medias por mes (52/12). */
export const WEEKS_PER_MONTH = 52 / 12;

const clamp = (v: number, min: number, max: number) => (Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : min);

export const LIMITS = {
  workers: { min: 1, max: 500 },
  hoursPerWeek: { min: 0, max: 20 },
  rate: { min: 10, max: 120 },
} as const;

export function normalize(i: LeakInput): LeakInput {
  return {
    workers: Math.round(clamp(i.workers, LIMITS.workers.min, LIMITS.workers.max)),
    hoursPerWeek: Math.round(clamp(i.hoursPerWeek, LIMITS.hoursPerWeek.min, LIMITS.hoursPerWeek.max) * 2) / 2,
    rate: Math.round(clamp(i.rate, LIMITS.rate.min, LIMITS.rate.max)),
  };
}

export function leak(input: LeakInput): LeakResult {
  const i = normalize(input);
  const hoursMonth = i.workers * i.hoursPerWeek * WEEKS_PER_MONTH;
  const euroMonth = hoursMonth * i.rate;
  return { hoursMonth: Math.round(hoursMonth), euroMonth: Math.round(euroMonth), euroYear: Math.round(euroMonth * 12) };
}

export const eur = (n: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
export const num = (n: number) => new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(n);
