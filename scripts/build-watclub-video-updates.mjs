import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.argv[2] || 'work/imports/watclub-full');
const manifest = JSON.parse(await fs.readFile(path.join(root, 'manifest.json'), 'utf8'));

const updates = manifest.products.map(product => {
  const videos = (product.media || [])
    .filter(media => media.kind === 'video')
    .map((media, index) => {
      if (media.sourceType === 'file' && media.download?.ok && (media.publicUrl || media.sourceUrl)) {
        const fileName = media.fileName || path.basename(media.r2Key || new URL(media.sourceUrl).pathname);
        return {
          id:media.r2Key || `watclub-${product.sourceId}-video-${index + 1}`,
          objectKey:media.r2Key,
          type:'video',
          url:media.sourceUrl,
          name:fileName,
          storage:'external',
          sourceUrl:media.sourceUrl,
          position:index,
          contentType:media.download?.contentType || 'video/mp4',
        };
      }
      if (media.sourceType === 'embed' && media.publicUrl) {
        return {
          id:`watclub-${product.sourceId}-embed-${index + 1}`,
          objectKey:null,
          type:'embed',
          url:media.publicUrl,
          name:`Video ${index + 1}`,
          storage:'external',
          sourceUrl:media.sourceUrl,
          position:index,
          contentType:'video/embed',
        };
      }
      return null;
    })
    .filter(Boolean);
  return videos.length ? { id:`watclub-${product.sourceId}`, videos } : null;
}).filter(Boolean);

const output = path.join(root, 'video-updates.json');
await fs.writeFile(output, `${JSON.stringify(updates, null, 2)}\n`);
console.log(JSON.stringify({
  output,
  products:updates.length,
  videos:updates.reduce((sum, product) => sum + product.videos.length, 0),
  files:updates.flatMap(product => product.videos).filter(video => video.type === 'video').length,
  embeds:updates.flatMap(product => product.videos).filter(video => video.type === 'embed').length,
}, null, 2));
