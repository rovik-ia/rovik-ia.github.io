export default function BuyButton({
  href,
  label = "Ver en Amazon",
  size = "md",
}: {
  href: string;
  label?: string;
  size?: "sm" | "md" | "lg";
}) {
  const clases = {
    sm: "px-3.5 py-2 text-sm",
    md: "px-5 py-3",
    lg: "px-6 py-3.5 text-lg",
  }[size];
  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow sponsored noopener"
      className={`inline-flex items-center justify-center gap-2 bg-accent-dark hover:bg-accent-deep text-white font-bold rounded-xl transition-colors ${clases}`}
    >
      {label} <span aria-hidden>→</span>
    </a>
  );
}
