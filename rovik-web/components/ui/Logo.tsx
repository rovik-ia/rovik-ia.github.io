interface Props {
  className?: string;
  withWord?: boolean;
}

/** Marca Rovik: núcleo hexagonal dentro de un anillo con dos muescas. */
export function CoreMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="14" stroke="var(--red)" strokeWidth="2.5" strokeDasharray="38 6" transform="rotate(-62 16 16)" />
      <circle cx="16" cy="16" r="8.5" stroke="var(--gold)" strokeWidth="1.6" />
      <path d="M16 11.2l4.16 2.4v4.8L16 20.8l-4.16-2.4v-4.8z" fill="var(--cyan)" />
    </svg>
  );
}

export default function Logo({ className = "", withWord = true }: Props) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <CoreMark className="h-7 w-7 shrink-0" />
      {withWord && (
        <span className="display text-[1.15rem] leading-none tracking-[0.06em] text-fg">
          Rovik
        </span>
      )}
    </span>
  );
}
