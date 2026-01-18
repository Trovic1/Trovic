import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const svgPath = resolve(__dirname, "../public/brand/icon.svg");
const outputDir = resolve(__dirname, "../public/brand");

const sizes = [512, 1024];

const svgBuffer = await fs.readFile(svgPath);

await Promise.all(
  sizes.map(async (size) => {
    const outputPath = resolve(outputDir, `icon-${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size, { fit: "contain" })
      .png()
      .toFile(outputPath);
  })
);

console.log("✅ Exported brand PNGs:", sizes.map((s) => `icon-${s}.png`).join(", "));
