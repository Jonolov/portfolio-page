// Regenerates public/favicon.png + public/apple-touch-icon.png as the
// "JS" text lockup (cream on a burnt-sienna rounded square). Run with:
//   node scripts/generate-icons.mjs
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

const RUST = "#a03f1c";
const CREAM = "#fbf7f0";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="18" fill="${RUST}"/>
  <text x="50" y="50" dy="0.35em" text-anchor="middle"
        font-family="Familjen Grotesk, Archivo, sans-serif"
        font-weight="700" font-size="62" letter-spacing="-4"
        fill="${CREAM}">JS</text>
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
