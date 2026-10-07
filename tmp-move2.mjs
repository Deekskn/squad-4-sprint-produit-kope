import fs from 'node:fs';
import path from 'node:path';

const replacements = [
  ["'@/lib/", "'@/shared/lib/"],
  ['"@/lib/', '"@/shared/lib/'],
  ["'@/assets/", "'@/shared/assets/"],
  ['"@/assets/', '"@/shared/assets/'],
  ["'@/mocks/", "'@/shared/mocks/"],
  ['"@/mocks/', '"@/shared/mocks/'],
  ["'../src/lib/", "'../src/shared/lib/"],
  ["'../src/assets/", "'../src/shared/assets/"],
  ["'../src/mocks/", "'../src/shared/mocks/"],
];

for (const dir of ['src', 'server', 'tests']) {
  if (!fs.existsSync(dir)) continue;
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) {
        if (e.name !== 'node_modules' && e.name !== '.git') walk(p);
        continue;
      }
      if (!/\.(js|jsx|css)$/.test(e.name)) continue;
      let s = fs.readFileSync(p, 'utf8');
      let n = s;
      for (const [a, b] of replacements) n = n.split(a).join(b);
      if (n !== s) { fs.writeFileSync(p, n); console.log('rewrote:', p); }
    }
  })(dir);
}
