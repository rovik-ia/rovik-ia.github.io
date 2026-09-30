"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { CoreHandle } from "@/lib/core/scene";

type Mode = "hero" | "sequence";

interface Props {
  mode: Mode;
  /** Progreso 0..1 del protocolo (solo modo sequence). */
  progressRef?: RefObject<number>;
  /** Imagen estática para movimiento reducido, sin WebGL o mientras carga. */
  fallback: React.ReactNode;
  className?: string;
}

/**
 * WebGL con aceleración por hardware. Si el navegador solo ofrece renderizado por software
 * (SwiftShader, llvmpipe…), el 3D bloquearía el hilo principal: se sirve la imagen estática.
 */
function hardwareWebgl(): boolean {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return false;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
  } catch {
    return false;
  }
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Lienzo del núcleo 3D. Carga three.js solo cuando el lienzo se acerca a la pantalla,
 * renderiza solo mientras es visible y respeta prefers-reduced-motion y el ahorro de datos.
 */
export default function CoreCanvas({ mode, progressRef, fallback, className = "relative" }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    // Decisión única tras montar: WebGL disponible y sin preferencia de movimiento reducido.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLive(!reduce && !conn?.saveData && hardwareWebgl());
  }, []);

  useEffect(() => {
    if (!live) return;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    let core: CoreHandle | null = null;
    let raf = 0;
    let visible = false;
    let loading = false;
    let disposed = false;
    let bootStart = 0;
    let firstFrame = false;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    const resize = () => {
      if (!core) return;
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (!w || !h) return;
      core.resize(w, h);
      const aspect = w / h;
      const base = mode === "hero" ? 8.6 : 9.4;
      core.setCamera(base / Math.min(1, Math.pow(aspect, 0.92)));
    };

    const tick = (now: number) => {
      raf = 0;
      if (!core || !visible || document.hidden) return;
      const t = now / 1000;
      if (mode === "hero") {
        if (!bootStart) bootStart = t;
        const boot = easeOut(Math.min(1, (t - bootStart) / 2.4));
        core.setAssembly(0.3 + 0.7 * boot);
        const scroll = Math.min(1, window.scrollY / Math.max(1, window.innerHeight));
        core.setView({
          yaw: -0.42 + Math.sin(t * 0.25) * 0.12 + scroll * 0.6,
          pitch: 0.2 + Math.cos(t * 0.2) * 0.05 - scroll * 0.25,
          offsetY: scroll * 0.6,
        });
      } else {
        const p = progressRef?.current ?? 0;
        core.setAssembly(p);
        core.setView({
          yaw: -0.62 + p * 0.85 + Math.sin(t * 0.3) * 0.04,
          pitch: 0.3 - p * 0.14 + Math.cos(t * 0.25) * 0.03,
          roll: 0,
        });
      }
      core.render(t);
      if (!firstFrame) {
        firstFrame = true;
        setReady(true);
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (!raf && core && visible) raf = requestAnimationFrame(tick);
    };

    const init = async () => {
      loading = true;
      // Cede el hilo principal a la primera pintura antes de descargar three.js
      await new Promise<void>((resolve) => {
        const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
        if (w.requestIdleCallback) w.requestIdleCallback(() => resolve(), { timeout: 1200 });
        else window.setTimeout(resolve, 300);
      });
      if (disposed) return;
      const { createCore } = await import("@/lib/core/scene");
      if (disposed) return;
      try {
        core = createCore({
          canvas,
          pixelRatio: Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2),
          antialias: !coarse || (window.devicePixelRatio || 1) < 2,
        });
      } catch {
        setLive(false);
        return;
      }
      resize();
      // Compilación de shaders en paralelo (KHR_parallel_shader_compile) para no congelar la página
      await core.compile();
      if (disposed) return;
      start();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !core && !loading) void init();
        start();
      },
      { rootMargin: "300px 0px" }
    );
    io.observe(wrap);

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const onPointer = (e: PointerEvent) => {
      if (!core || e.pointerType !== "mouse") return;
      core.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    };
    if (mode === "hero") window.addEventListener("pointermove", onPointer, { passive: true });
    const onVis = () => start();
    document.addEventListener("visibilitychange", onVis);

    const onLost = (e: Event) => {
      e.preventDefault();
      setLive(false);
    };
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("webglcontextlost", onLost);
      core?.dispose();
    };
  }, [live, mode, progressRef]);

  return (
    <div ref={wrapRef} className={className}>
      {live === null && <noscript>{fallback}</noscript>}
      {live === false && <div className="absolute inset-0">{fallback}</div>}
      {live && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}
