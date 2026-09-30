"use client";

import { useEffect } from "react";

/**
 * Activa el revelado de los elementos .reveal al entrar en pantalla.
 * Sin JavaScript todo se ve (clase no-js en <html>); lo que ya está en pantalla
 * al cargar se marca visible antes de quitar no-js para evitar parpadeos.
 */
export default function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    const items = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const vh = window.innerHeight;
    for (const el of items) {
      const r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) el.classList.add("is-in");
    }
    root.classList.remove("no-js");

    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    items.filter((el) => !el.classList.contains("is-in")).forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
