const fs = require('fs');
let code = fs.readFileSync('src/app/about/page.tsx', 'utf8');

// remove team section
code = code.replace(/\{\/\* ═══ TEAM ═══ \*\/\}.*?<\/section>(\s*)/s, '');

// remove gallery section (Behind the Scenes)
code = code.replace(/\{\/\* ═══ GALLERY ═══ \*\/\}.*?<\/section>(\s*)/s, '');

fs.writeFileSync('src/app/about/page.tsx', code);
console.log('removed team and gallery sections');
