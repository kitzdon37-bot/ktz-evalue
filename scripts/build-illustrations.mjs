// Génère les illustrations SVG de la banque KTZ (public/illustrations).
// Dessins simples et légers (moins de 2 Ko chacun), lisibles sur téléphone.
// Usage : node scripts/build-illustrations.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = new URL("../public/illustrations/", import.meta.url);
mkdirSync(OUT, { recursive: true });

const INK = "#44403c";
const ACCENT = "#ea580c";
const SOFT = "#fed7aa";
const PAPER = "#fffaf5";
const FONT = 'font-family="Segoe UI,Roboto,Arial,sans-serif"';

const svg = (w, h, body, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><title>${title}</title><rect width="${w}" height="${h}" fill="${PAPER}"/>${body}</svg>`;
const r1 = (n) => Math.round(n * 10) / 10;
const polygon = (cx, cy, r, sides, rot = -Math.PI / 2) =>
  Array.from({ length: sides }, (_, i) => {
    const a = rot + (i * 2 * Math.PI) / sides;
    return `${r1(cx + r * Math.cos(a))},${r1(cy + r * Math.sin(a))}`;
  }).join(" ");
const box = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#fff" stroke="#e7e2da" stroke-width="2"/>`;
const question = (cx, cy) =>
  `<text x="${cx}" y="${cy + 18}" text-anchor="middle" font-size="52" font-weight="800" fill="${ACCENT}" ${FONT}>?</text>`;

const files = {};

// 1. Suite de figures : triangle, carré, pentagone, ?
files["suite-polygones.svg"] = svg(
  560,
  160,
  [3, 4, 5]
    .map((s, i) => box(20 + i * 135, 20, 115, 120) + `<polygon points="${polygon(77.5 + i * 135, 80, 40, s, s === 4 ? -Math.PI / 4 : -Math.PI / 2)}" fill="${SOFT}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`)
    .join("") + box(425, 20, 115, 120).replace('stroke="#e7e2da"', `stroke="${ACCENT}" stroke-dasharray="8 6"`) + question(482.5, 80),
  "Suite de figures",
);

// 2. Matrice de points : 1 2 3 / 2 3 4 / 3 4 ?
const dots = (cx, cy, n) => {
  const pos = { 1: [[0, 0]], 2: [[-14, 0], [14, 0]], 3: [[-16, 10], [16, 10], [0, -16]], 4: [[-14, -14], [14, -14], [-14, 14], [14, 14]] }[n];
  return pos.map(([dx, dy]) => `<circle cx="${cx + dx}" cy="${cy + dy}" r="9" fill="${INK}"/>`).join("");
};
const grid = [
  [1, 2, 3],
  [2, 3, 4],
  [3, 4, 0],
];
files["matrice-points.svg"] = svg(
  360,
  360,
  grid
    .flatMap((row, r) =>
      row.map((n, c) => {
        const x = 20 + c * 110;
        const y = 20 + r * 110;
        return n
          ? box(x, y, 100, 100) + dots(x + 50, y + 50, n)
          : box(x, y, 100, 100).replace('stroke="#e7e2da"', `stroke="${ACCENT}" stroke-dasharray="8 6"`) + question(x + 50, y + 50);
      }),
    )
    .join(""),
  "Matrice de points",
);

// 3. Horloge indiquant 4 h 30
const hand = (deg, len, width, color) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return `<line x1="150" y1="150" x2="${r1(150 + len * Math.cos(a))}" y2="${r1(150 + len * Math.sin(a))}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
};
const ticks = Array.from({ length: 12 }, (_, i) => {
  const a = ((i * 30 - 90) * Math.PI) / 180;
  const big = i % 3 === 0;
  const r0 = big ? 104 : 110;
  return `<line x1="${r1(150 + r0 * Math.cos(a))}" y1="${r1(150 + r0 * Math.sin(a))}" x2="${r1(150 + 122 * Math.cos(a))}" y2="${r1(150 + 122 * Math.sin(a))}" stroke="${INK}" stroke-width="${big ? 5 : 3}" stroke-linecap="round"/>`;
}).join("");
const numbers = [12, 3, 6, 9]
  .map((n, i) => {
    const a = ((i * 90 - 90) * Math.PI) / 180;
    return `<text x="${r1(150 + 86 * Math.cos(a))}" y="${r1(150 + 86 * Math.sin(a) + 9)}" text-anchor="middle" font-size="26" font-weight="700" fill="${INK}" ${FONT}>${n}</text>`;
  })
  .join("");
files["horloge-4h30.svg"] = svg(
  300,
  300,
  `<circle cx="150" cy="150" r="135" fill="#fff" stroke="${INK}" stroke-width="6"/>${ticks}${numbers}${hand(135, 62, 9, INK)}${hand(180, 100, 6, ACCENT)}<circle cx="150" cy="150" r="9" fill="${INK}"/>`,
  "Horloge",
);

// 4. Graphique des ventes (en milliers de FCFA)
const months = ["Janv.", "Févr.", "Mars", "Avril", "Mai"];
const sales = [150, 200, 250, 175, 300];
const chartBody = [
  ...[0, 100, 200, 300].map((v) => {
    const y = 250 - v * 0.7;
    return `<line x1="70" y1="${y}" x2="560" y2="${y}" stroke="#e7e2da" stroke-width="1.5"/><text x="60" y="${y + 5}" text-anchor="end" font-size="15" fill="#78716c" ${FONT}>${v}</text>`;
  }),
  ...sales.map((v, i) => {
    const x = 95 + i * 95;
    const h = v * 0.7;
    return `<rect x="${x}" y="${250 - h}" width="56" height="${h}" rx="6" fill="${i === 4 ? ACCENT : "#fb923c"}" opacity="${i === 4 ? 1 : 0.75}"/><text x="${x + 28}" y="${244 - h}" text-anchor="middle" font-size="15" font-weight="700" fill="${INK}" ${FONT}>${v}</text><text x="${x + 28}" y="274" text-anchor="middle" font-size="15" fill="${INK}" ${FONT}>${months[i]}</text>`;
  }),
  `<text x="20" y="28" font-size="16" font-weight="700" fill="${INK}" ${FONT}>Ventes mensuelles (milliers de FCFA)</text>`,
].join("");
files["graphique-ventes.svg"] = svg(580, 290, chartBody, "Graphique des ventes");

// 5. Suite de flèches qui tournent d'un quart de tour : haut, droite, bas, ?
const arrow = (cx, cy, deg) =>
  `<g transform="rotate(${deg} ${cx} ${cy})"><line x1="${cx}" y1="${cy + 34}" x2="${cx}" y2="${cy - 22}" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><polygon points="${cx},${cy - 42} ${cx - 22},${cy - 12} ${cx + 22},${cy - 12}" fill="${INK}"/></g>`;
files["suite-fleches.svg"] = svg(
  560,
  160,
  [0, 90, 180].map((d, i) => box(20 + i * 135, 20, 115, 120) + arrow(77.5 + i * 135, 80, d)).join("") +
    box(425, 20, 115, 120).replace('stroke="#e7e2da"', `stroke="${ACCENT}" stroke-dasharray="8 6"`) +
    question(482.5, 80),
  "Suite de flèches",
);

for (const [name, content] of Object.entries(files)) {
  writeFileSync(new URL(name, OUT), content);
  console.log(`${name} : ${content.length} octets`);
}
