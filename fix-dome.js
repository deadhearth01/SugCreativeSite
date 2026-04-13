const fs = require('fs');
let code = fs.readFileSync('src/components/DomeGallery/DomeGallery.tsx', 'utf8');

// Update buildItems
const oldCols = 'const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);';
const newCols = `const startX = -((seg - 1) * 2) / 2;
  const xCols = Array.from({ length: seg }, (_, i) => startX + i * 2);`;

code = code.replace(oldCols, newCols);

fs.writeFileSync('src/components/DomeGallery/DomeGallery.tsx', code);
console.log('fixed dome centering');
