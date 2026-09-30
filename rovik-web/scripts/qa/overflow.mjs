#!/usr/bin/env node
// Lista los elementos que desbordan en horizontal: node scripts/qa/overflow.mjs <url> <ancho>
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
const url = process.argv[2] ?? "http://localhost:3100/";
const w = Number(process.argv[3] ?? 390);
const base = "/opt/pw-browsers";
const dir = fs.readdirSync(base).find((d) => /^chromium-\d+$/.test(d));
const browser = await chromium.launch({ executablePath: path.join(base, dir, "chrome-linux/chrome") });
const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, isMobile: w < 768, hasTouch: w < 1024 });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const res = await page.evaluate((W) => {
  const out = [];
  for (const el of document.querySelectorAll("body *")) {
    if (getComputedStyle(el).position === "fixed") continue;
    const r = el.getBoundingClientRect();
    if (r.right <= W + 1 || r.width === 0) continue;
    let p = el.parentElement, clipped = false, fixedAnc = false;
    while (p && p !== document.body) {
      const cs = getComputedStyle(p);
      if (cs.position === "fixed") fixedAnc = true;
      if (/(hidden|clip|auto|scroll)/.test(cs.overflowX) && p.getBoundingClientRect().right <= W + 1) { clipped = true; break; }
      p = p.parentElement;
    }
    if (clipped || fixedAnc) continue;
    // solo el elemento más profundo de cada rama
    const cls = (el.className?.baseVal ?? el.className ?? "").toString();
    out.push(`${el.tagName}${el.id ? "#" + el.id : ""}.${cls.slice(0, 80)} w=${Math.round(r.width)} right=${Math.round(r.right)} text="${(el.textContent || "").trim().slice(0, 30)}"`);
  }
  return { iw: innerWidth, items: out.slice(-12) };
}, w);
console.log(`innerWidth=${res.iw}`);
res.items.forEach((l) => console.log(l));
await browser.close();
