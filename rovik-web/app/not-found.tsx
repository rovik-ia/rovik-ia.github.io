import Arrow from "@/components/ui/Arrow";
import { asset } from "@/lib/site";

export default function NotFound() {
  return (
    <section className="blueprint flex min-h-[80svh] items-center pt-[var(--header-h)]">
      <div className="shell">
        <p className="hud-label text-alert">Error 404 · Señal perdida</p>
        <h1 className="display mt-6 text-[3rem] sm:text-7xl">Fuera de rumbo.</h1>
        <p className="mt-6 max-w-md text-lg text-fg-2">Esta página no existe o ha cambiado de sitio. Volvamos a la base.</p>
        <a href={asset("/")} className="btn btn-primary mt-10">
          Volver al inicio
          <Arrow />
        </a>
      </div>
    </section>
  );
}
