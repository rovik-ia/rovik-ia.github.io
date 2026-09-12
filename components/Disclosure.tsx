import Link from "next/link";
import { AFFILIATE_DISCLOSURE } from "@/lib/site";

export default function Disclosure() {
  return (
    <p className="text-xs text-muted bg-accent-soft border border-line rounded-lg px-3 py-2">
      {AFFILIATE_DISCLOSURE} Esto no cambia el precio que pagas.{" "}
      <Link href="/afiliacion/" className="underline">Más información</Link>.
    </p>
  );
}
