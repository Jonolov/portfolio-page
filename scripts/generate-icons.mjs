// Regenerates public/favicon.png + public/apple-touch-icon.png as the
// "JS" block mark, matching components/ui/block-mark.ts. Run with:
//   node scripts/generate-icons.mjs
// Keep GRID in sync with block-mark.ts (it changes rarely).
import { createRequire } from "node:module";
import { writeFile } from "node:fs/promises";
import { globSync } from "node:fs";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
// sharp ships as a transitive dep (via next) and isn't hoisted under
// strict pnpm — resolve it straight out of the store.
const [sharpRel] = globSync("node_modules/.pnpm/sharp@*/node_modules/sharp");
if (!sharpRel) throw new Error("sharp not found under node_modules/.pnpm");
const sharp = require(resolve(process.cwd(), sharpRel));

const GRID = [
  ".####..###",
  "...#..#...",
  "...#..#...",
  "...#...##.",
  "#..#.....#",
  "#..#.....#",
  ".##...###.",
  "..........",
  "==========",
];

const INK = "#121815";
const PAPER = "#eafbf1";
const GREEN = "#3ddc84";

const COLS = GRID[0].length;
const ROWS = GRID.length;

// Layout inside a 100×100 viewBox. Chunky + tight padding so it still
// reads when a browser paints the favicon at 16px.
const CELL = 7.4;
const GAP = 0.6;
const gw = COLS * CELL + (COLS - 1) * GAP;
const gh = ROWS * CELL + (ROWS - 1) * GAP;
const x0 = (100 - gw) / 2;
const y0 = (100 - gh) / 2;

const rects = [];
GRID.forEach((line, row) => {
  [...line].forEach((ch, col) => {
    if (ch !== "#" && ch !== "=") return;
    const x = (x0 + col * (CELL + GAP)).toFixed(2);
    const y = (y0 + row * (CELL + GAP)).toFixed(2);
    const fill = ch === "=" ? GREEN : PAPER;
    rects.push(`<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" fill="${fill}"/>`);
  });
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<rect width="100" height="100" fill="${INK}"/>
${rects.join("\n")}
</svg>`;

async function render(size, path) {
  const png = await sharp(Buffer.from(svg), { density: 512 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(path, png);
  console.log(`wrote ${path} (${size}×${size}, ${png.length} bytes)`);
}

await render(64, "public/favicon.png");
await render(180, "public/apple-touch-icon.png");
