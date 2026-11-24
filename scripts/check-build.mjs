import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../build/', import.meta.url);
const html = readFileSync(new URL('index.html', root), 'utf8');
assert.match(html, /<div id="root"><\/div>/);
assert.doesNotMatch(html, /%PUBLIC_URL%|%BASE_URL%|\/src\/index\.tsx/);
const assets = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]);
assert.ok(assets.some(asset => asset.endsWith('.js')), 'Missing production JavaScript entry');
for (const asset of assets) {
  assert.ok(asset.startsWith('/waterfall-typography/'), `Incorrect GitHub Pages path: ${asset}`);
  const file = new URL(asset.slice('/waterfall-typography/'.length), root);
  assert.ok(fileURLToPath(file).startsWith(fileURLToPath(root)), 'Asset outside build directory');
  assert.ok(statSync(file).isFile(), `Missing built asset: ${asset}`);
}
console.log(`Verified ${assets.length} production assets under /waterfall-typography/.`);
