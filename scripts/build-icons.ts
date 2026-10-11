/**
 * Regenerates the browser icons from `public/favicon.svg`.
 *
 * The ICO container holds PNG entries, which every current browser accepts.
 * Chromium does the rasterising, so the repository needs no image toolchain.
 *
 * Run `bun run build:icons` after a change to `public/favicon.svg`.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";
import type { Browser } from "playwright";

const root = path.join(import.meta.dirname, "..");
const sourcePath = path.join(root, "public/favicon.svg");
const icoSizes = [16, 32, 48];
const appleTouchSize = 180;

/**
 * A 16-pixel tab icon loses the inner curve of the mark, so the smallest entry
 * uses a single stroke that stays legible when the browser scales it down.
 */
const smallMark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none"><path d="M11 34V17C11 9.5 15.5 6 21 6C28 6 33 11 33 18C33 25.5 28 31 21 31H18" stroke="#7960a0" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const rasterise = async (browser: Browser, svg: string, size: number) => {
  const page = await browser.newPage({
    deviceScaleFactor: 1,
    viewport: { height: size, width: size },
  });

  try {
    await page.setContent(
      `<body style="margin:0;width:${size}px;height:${size}px">${svg.replace(
        "<svg",
        `<svg width="${size}" height="${size}"`
      )}</body>`
    );

    return await page.screenshot({ omitBackground: true });
  } finally {
    await page.close();
  }
};

/** Packs PNG images into an ICO container: a 6-byte header, then one 16-byte directory entry per image. */
const buildIco = (images: { data: Buffer; size: number }[]): Buffer => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const directory = Buffer.alloc(images.length * 16);
  const payloads: Buffer[] = [];

  for (const [index, { data, size }] of images.entries()) {
    const entry = index * 16;
    directory.writeUInt8(size >= 256 ? 0 : size, entry);
    directory.writeUInt8(size >= 256 ? 0 : size, entry + 1);
    directory.writeUInt8(0, entry + 2);
    directory.writeUInt8(0, entry + 3);
    directory.writeUInt16LE(1, entry + 4);
    directory.writeUInt16LE(32, entry + 6);
    directory.writeUInt32LE(data.length, entry + 8);
    directory.writeUInt32LE(offset, entry + 12);
    offset += data.length;
    payloads.push(data);
  }

  return Buffer.concat([header, directory, ...payloads]);
};

const source = await readFile(sourcePath, "utf-8");
const browser = await chromium.launch();

try {
  const entries = await Promise.all(
    icoSizes.map(async (size) => ({
      data: await rasterise(browser, size <= 16 ? smallMark : source, size),
      size,
    }))
  );

  await mkdir(path.join(root, "public"), { recursive: true });
  await writeFile(path.join(root, "public/favicon.ico"), buildIco(entries));
  await writeFile(
    path.join(root, "public/apple-touch-icon.png"),
    await rasterise(browser, source, appleTouchSize)
  );

  console.log(
    `Wrote public/favicon.ico (${icoSizes.join(", ")}px) and public/apple-touch-icon.png (${appleTouchSize}px).`
  );
} finally {
  await browser.close();
}
