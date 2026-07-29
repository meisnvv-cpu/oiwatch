import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("work/imports/watclub-full");
const totals = {
  products: 0,
  files: 0,
  bytes: 0,
  imagesReferenced: 0,
  videosReferenced: 0,
  downloaded: 0,
  failed: 0,
  failedItems: [],
};

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(absolute);
      continue;
    }
    const info = await stat(absolute);
    totals.files += 1;
    totals.bytes += info.size;
    if (entry.name !== "product.json") continue;
    totals.products += 1;
    const product = JSON.parse(await readFile(absolute, "utf8"));
    for (const media of product.media ?? []) {
      if (media.kind === "image") totals.imagesReferenced += 1;
      if (media.kind === "video") totals.videosReferenced += 1;
      if (media.download?.ok === true) totals.downloaded += 1;
      if (media.download?.ok === false) {
        totals.failed += 1;
        totals.failedItems.push({
          product: product.sourceId,
          url: media.sourceUrl,
          error: media.download.error,
        });
      }
    }
  }
}

await walk(root);
totals.sizeGB = Number((totals.bytes / 1024 ** 3).toFixed(3));
console.log(JSON.stringify(totals, null, 2));
