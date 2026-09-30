import { createCore, type PartGroup, type CoreView } from "../../lib/core/scene";

interface Shot {
  width: number;
  height: number;
  assembly: number;
  time?: number;
  distance?: number;
  fov?: number;
  view?: Partial<CoreView>;
  only?: PartGroup[];
}

declare global {
  interface Window {
    shot: (s: Shot) => string;
  }
}

window.shot = (s: Shot) => {
  const canvas = document.createElement("canvas");
  canvas.width = s.width;
  canvas.height = s.height;
  document.body.appendChild(canvas);
  const core = createCore({ canvas, pixelRatio: 1, preserveDrawingBuffer: true, only: s.only });
  core.resize(s.width, s.height);
  if (s.distance) core.setCamera(s.distance, s.fov);
  if (s.view) core.setView(s.view);
  core.setAssembly(s.assembly);
  // Varios fotogramas para que el suavizado del puntero y las texturas se asienten
  for (let i = 0; i < 4; i++) core.render(s.time ?? 1.2);
  const url = canvas.toDataURL("image/png");
  core.dispose();
  canvas.remove();
  return url;
};
