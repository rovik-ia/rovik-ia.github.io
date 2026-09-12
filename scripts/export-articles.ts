// Vuelca las guías a JSON para los generadores de vídeo y campañas.
import { articles } from "../lib/articles";
import { writeFileSync, mkdirSync } from "node:fs";
mkdirSync("marketing/data", { recursive: true });
writeFileSync("marketing/data/articles.json", JSON.stringify(articles, null, 2));
console.log(`exportadas ${articles.length} guías`);
