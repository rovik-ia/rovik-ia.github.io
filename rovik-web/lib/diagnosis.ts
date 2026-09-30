/**
 * Lógica del escáner ROVIK.IA. Pura y determinista: sin red, sin almacenamiento.
 * Puntúa cuatro sistemas de 0 a 100 y propone por dónde empezar respetando el orden
 * del protocolo (no se automatiza lo que aún no vende).
 */
import type { ModuleId } from "./content";

export type SystemId = "captacion" | "conversion" | "operacion" | "direccion";

export interface Option {
  id: string;
  label: string;
  /** Ajustes sobre la puntuación base de cada sistema. */
  effect?: Partial<Record<SystemId, number>>;
}

export interface Question {
  id: "sector" | "equipo" | "canal" | "medicion" | "tiempo" | "dependencia" | "objetivo";
  prompt: string;
  options: Option[];
}

export const SYSTEMS: { id: SystemId; label: string; hint: string }[] = [
  { id: "captacion", label: "Captación", hint: "Entrada predecible de oportunidades" },
  { id: "conversion", label: "Conversión", hint: "Cómo se convierten en clientes" },
  { id: "operacion", label: "Operación", hint: "Entrega sin fugas de tiempo" },
  { id: "direccion", label: "Dirección", hint: "Datos y autonomía del equipo" },
];

export const QUESTIONS: Question[] = [
  {
    id: "sector",
    prompt: "Empecemos. ¿En qué sector opera tu empresa?",
    options: [
      { id: "servicios", label: "Servicios profesionales" },
      { id: "construccion", label: "Construcción e industria" },
      { id: "estetica", label: "Salud y estética" },
      { id: "automocion", label: "Automoción" },
      { id: "comercio", label: "Comercio y e-commerce" },
      { id: "hosteleria", label: "Hostelería y turismo" },
      { id: "otro", label: "Otro sector" },
    ],
  },
  {
    id: "equipo",
    prompt: "¿Cuántas personas trabajan en la empresa?",
    options: [
      { id: "1", label: "Solo yo", effect: { direccion: -10, operacion: 5 } },
      { id: "2-5", label: "De 2 a 5", effect: {} },
      { id: "6-20", label: "De 6 a 20", effect: { operacion: -5 } },
      { id: "21-50", label: "De 21 a 50", effect: { operacion: -8, direccion: 5 } },
      { id: "50+", label: "Más de 50", effect: { operacion: -10, direccion: 10 } },
    ],
  },
  {
    id: "canal",
    prompt: "¿Cómo te llegan hoy los clientes nuevos?",
    options: [
      { id: "boca", label: "Boca a boca y recomendaciones", effect: { captacion: -30 } },
      { id: "web", label: "Web y buscadores", effect: { captacion: 5 } },
      { id: "anuncios", label: "Publicidad online", effect: { captacion: 5, conversion: -5 } },
      { id: "prospeccion", label: "Prospección directa", effect: { captacion: 0 } },
      { id: "mezcla", label: "Un poco de todo, sin control", effect: { captacion: -20, direccion: -10 } },
    ],
  },
  {
    id: "medicion",
    prompt: "¿Sabes cuántas oportunidades entran cada mes y cuántas cierras?",
    options: [
      { id: "si", label: "Sí, lo medimos cada semana", effect: { conversion: 20, direccion: 25 } },
      { id: "aprox", label: "Más o menos", effect: { conversion: -5, direccion: -5 } },
      { id: "no", label: "No lo medimos", effect: { conversion: -25, direccion: -25 } },
    ],
  },
  {
    id: "tiempo",
    prompt: "¿Dónde se os va más tiempo que no se factura?",
    options: [
      { id: "presupuestos", label: "Presupuestos y seguimiento comercial", effect: { conversion: -20, operacion: -5 } },
      { id: "atencion", label: "Atención a clientes y mensajes", effect: { operacion: -15, conversion: -5 } },
      { id: "admin", label: "Partes, albaranes y administración", effect: { operacion: -30 } },
      { id: "coordinacion", label: "Coordinar al equipo", effect: { operacion: -15, direccion: -15 } },
      { id: "marketing", label: "Contenido y marketing", effect: { captacion: -10, operacion: -5 } },
    ],
  },
  {
    id: "dependencia",
    prompt: "Si desaparecieras dos semanas, ¿qué pasaría con las ventas?",
    options: [
      { id: "paran", label: "Se paran casi por completo", effect: { direccion: -30, conversion: -10 } },
      { id: "bajan", label: "Bajan bastante", effect: { direccion: -12, conversion: -3 } },
      { id: "siguen", label: "El equipo sigue vendiendo", effect: { direccion: 20, conversion: 10 } },
    ],
  },
  {
    id: "objetivo",
    prompt: "Última. ¿Qué quieres conseguir en los próximos 12 meses?",
    options: [
      { id: "clientes", label: "Más clientes" },
      { id: "margen", label: "Más margen por cliente" },
      { id: "tiempo", label: "Recuperar mi tiempo" },
      { id: "mercado", label: "Abrir un mercado nuevo" },
    ],
  },
];

const BASE: Record<SystemId, number> = { captacion: 62, conversion: 60, operacion: 64, direccion: 58 };

export type Answers = Partial<Record<Question["id"], string>>;

export function scoreSystems(answers: Answers): Record<SystemId, number> {
  const s = { ...BASE };
  for (const q of QUESTIONS) {
    const opt = q.options.find((o) => o.id === answers[q.id]);
    if (!opt?.effect) continue;
    for (const [k, v] of Object.entries(opt.effect) as [SystemId, number][]) s[k] += v;
  }
  for (const k of Object.keys(s) as SystemId[]) s[k] = Math.round(Math.min(96, Math.max(8, s[k])));
  return s;
}

const MODULE_FOR: Record<SystemId, ModuleId> = {
  captacion: "propulsion",
  conversion: "nucleo",
  operacion: "blindaje",
  direccion: "nucleo",
};

const MODULE_NAME: Record<ModuleId, string> = {
  nucleo: "Núcleo · Estrategia",
  propulsion: "Propulsión · Captación",
  copiloto: "Copiloto · IA y automatización",
  blindaje: "Blindaje · Operaciones y datos",
};

const SECTOR_HINT: Record<string, string> = {
  servicios: "propuestas y seguimiento de cada oportunidad",
  construccion: "presupuestos, partes de obra y horas sin facturar",
  estetica: "reservas, recordatorios y clientes que no repiten",
  automocion: "solicitudes que llegan y no se siguen a tiempo",
  comercio: "tráfico que no compra y clientes que no vuelven",
  hosteleria: "reservas directas frente a intermediarios y reseñas",
  otro: "los procesos que más horas consumen",
};

const LEAK_TEXT: Record<SystemId, string> = {
  captacion: "La entrada de clientes depende de rachas: sin un canal predecible no puedes planificar el crecimiento.",
  conversion: "Se pierden oportunidades entre el primer contacto y el cierre: seguimiento, propuesta o precio.",
  operacion: "La operación consume horas que no se facturan: procesos manuales y tareas repetidas.",
  direccion: "El negocio depende demasiado de ti y decide sin números: ese es tu techo actual.",
};

export interface Report {
  scores: Record<SystemId, number>;
  overall: number;
  ranked: SystemId[];
  module: ModuleId;
  moduleName: string;
  leaks: string[];
  plan: string[];
  notice: string | null;
  sectorLabel: string;
}

export function buildReport(answers: Answers): Report {
  const scores = scoreSystems(answers);
  const ranked = (Object.keys(scores) as SystemId[]).sort((a, b) => scores[a] - scores[b]);
  const overall = Math.round((scores.captacion + scores.conversion + scores.operacion + scores.direccion) / 4);

  // Regla del protocolo: si captación o conversión están flojas, se empieza por vender
  // aunque la operación puntúe más bajo.
  let first = ranked[0];
  let notice: string | null = null;
  const sellWeak = Math.min(scores.captacion, scores.conversion) < 50;
  if (first === "operacion" && sellWeak) {
    first = scores.captacion <= scores.conversion ? "captacion" : "conversion";
    notice =
      "Tu operación es lo que más duele, pero primero hay que asegurar las ventas: automatizar un proceso que no trae caja solo lo hace más rápido, no más rentable.";
  }
  let mod = MODULE_FOR[first];
  if (first === "operacion" && !sellWeak) mod = answers.tiempo === "admin" ? "blindaje" : "copiloto";
  if (first === "conversion" && answers.tiempo === "presupuestos" && scores.captacion >= 50) mod = "copiloto";

  const sector = QUESTIONS[0].options.find((o) => o.id === answers.sector);
  const hint = SECTOR_HINT[answers.sector ?? "otro"] ?? SECTOR_HINT.otro;
  const goal = QUESTIONS[6].options.find((o) => o.id === answers.objetivo)?.label.toLowerCase() ?? "crecer";

  const PLAN: Record<SystemId, string[]> = {
    captacion: [
      "Semana 1: definir el cliente ideal y reescribir la oferta para que se entienda en 10 segundos.",
      "Semanas 2-3: abrir un único canal medible (web de conversión, campañas o prospección) con presupuesto acotado.",
      "Semana 4: revisar coste por oportunidad y decidir si se escala o se corrige el canal.",
    ],
    conversion: [
      "Semana 1: mapear el camino del contacto al cierre y medir dónde se caen las oportunidades.",
      "Semanas 2-3: plantilla de propuesta, guion de llamada y seguimiento en 48 h para cada oportunidad.",
      "Semana 4: primera revisión de tasa de cierre y ajuste de precio u oferta.",
    ],
    operacion: [
      `Semana 1: medir las horas que se van en ${hint}.`,
      "Semanas 2-3: digitalizar el proceso que más horas consume, con el equipo usándolo desde el primer día.",
      "Semana 4: medir horas liberadas y decidir qué automatizar a continuación.",
    ],
    direccion: [
      "Semana 1: cuadro de mando con cinco números semanales: oportunidades, cierres, facturación, margen y caja.",
      "Semanas 2-3: documentar el proceso de venta para que el equipo cierre sin ti.",
      "Semana 4: primera reunión semanal con números y delegación de la primera decisión recurrente.",
    ],
  };

  const leaks = ranked.slice(0, 2).map((id) => LEAK_TEXT[id]);
  if (first !== ranked[0]) leaks.unshift(LEAK_TEXT[first]);

  return {
    scores,
    overall,
    ranked,
    module: mod,
    moduleName: MODULE_NAME[mod],
    leaks: Array.from(new Set(leaks)).slice(0, 2),
    plan: PLAN[first],
    notice,
    sectorLabel: `${sector?.label ?? "Tu sector"} · objetivo: ${goal}`,
  };
}

export function reportAsText(answers: Answers, r: Report): string {
  const lines: string[] = [];
  lines.push("INFORME DE ESCANEO · ROVIK.IA");
  lines.push("");
  for (const q of QUESTIONS) {
    const o = q.options.find((x) => x.id === answers[q.id]);
    if (o) lines.push(`- ${q.prompt.replace(/^(Empecemos\.|Última\.)\s*/, "")} ${o.label}`);
  }
  lines.push("");
  lines.push(`Índice de escalabilidad: ${r.overall}/100`);
  for (const s of SYSTEMS) lines.push(`- ${s.label}: ${r.scores[s.id]}/100`);
  lines.push("");
  lines.push(`Módulo recomendado: ${r.moduleName}`);
  lines.push("Fugas principales:");
  r.leaks.forEach((l) => lines.push(`- ${l}`));
  lines.push("Plan de 30 días:");
  r.plan.forEach((p) => lines.push(`- ${p}`));
  return lines.join("\n");
}
