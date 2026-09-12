import type { Article } from "../types";
import sillas from "./sillas-de-escritorio-ergonomicas";
import pistolas from "./pistolas-de-masaje";
import freidoras from "./freidoras-de-aire";
import robots from "./robots-aspiradores";
import calefactores from "./calefactores-bajo-consumo";
import smartwatch from "./smartwatch-calidad-precio";
import deshumidificadores from "./deshumidificadores";
import mantas from "./mantas-electricas";
import auriculares from "./auriculares-inalambricos";
import purificadores from "./purificadores-de-aire";
import cepillos from "./cepillos-electricos";

export const articles: Article[] = [
  sillas, calefactores, pistolas, freidoras, robots, smartwatch, deshumidificadores, mantas, auriculares, purificadores, cepillos,
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}
