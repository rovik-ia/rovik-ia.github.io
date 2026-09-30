interface Props {
  code: string;
  label: string;
  tone?: "red" | "gold" | "cyan";
  className?: string;
}

const TONES = { red: "text-red-text", gold: "text-gold", cyan: "text-cyan" } as const;

/** Etiqueta técnica de sección: "01 — ESCANEO DE DAÑOS". */
export default function SectionLabel({ code, label, tone = "gold", className = "" }: Props) {
  return (
    <p className={`hud-label flex items-center gap-3 text-muted ${className}`}>
      <span className={TONES[tone]}>{code}</span>
      <span aria-hidden="true" className="h-px w-8 bg-line-2" />
      <span>{label}</span>
    </p>
  );
}
