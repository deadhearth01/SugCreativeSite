const fs = require('fs');
let code = fs.readFileSync('src/components/DomeGallery/DomeGallery.tsx', 'utf8');

const oldBuildItems = `function buildItems(pool: ImageItem[], seg: number): ItemWithImage[] {`;
const newBuildItems = `function buildItems(pool: ImageItem[], seg: number): ItemWithImage[] {
  const startX = -((seg - 1) * 2) / 2;
  const xCols = Array.from({ length: seg }, (_, i) => startX + i * 2);
  const evenYs = [-4, -2, 0, 2, 4];
  const oddYs = [-3, -1, 1, 3, 5];

  const coords: Coord[] = xCols.flatMap((x, c) => {
    const ys = c % 2 === 0 ? evenYs : oddYs;
    return ys.map(y => ({ x, y, sizeX: 2, sizeY: 2 }));
  });

  const totalSlots = coords.length;
  if (pool.length === 0) {
    return coords.map(c => ({ ...c, src: '', alt: '' }));
  }

  const normalizedImages = pool.map(image => {
    if (typeof image === 'string') {
      return { src: image, alt: '' };
    }
    return { src: image.src || '', alt: image.alt || '' };
  });

  // To prevent any duplicate photo side-by-side or near,
  // we completely randomize the pool selection for all slots.
  // We'll iterate and pick an image, ensuring it doesn't match recently used images.
  const usedImages = [];
  const recentHistory = [];
  
  for (let i = 0; i < totalSlots; i++) {
    // try finding an image not in recent history
    let candidate;
    for (let attempts = 0; attempts < 50; attempts++) {
      const randomIndex = Math.floor(Math.random() * normalizedImages.length);
      candidate = normalizedImages[randomIndex];
      // Keep last 15 images to avoid clustering too densely
      if (!recentHistory.includes(candidate.src)) {
        break;
      }
    }
    usedImages.push(candidate);
    recentHistory.push(candidate.src);
    if (recentHistory.length > 15) recentHistory.shift();
  }

  return coords.map((c, i) => ({
    ...c,
    src: usedImages[i].src,
    alt: usedImages[i].alt
  }));
}`;

code = code.replace(/function buildItems[\s\S]*?return coords\.map[\s\S]*?\}\s*\}/, newBuildItems);

fs.writeFileSync('src/components/DomeGallery/DomeGallery.tsx', code);
console.log("Updated DomeGallery buildItems completely!");
