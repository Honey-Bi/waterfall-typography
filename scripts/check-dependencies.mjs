import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Local verification of the dependency chains reported by Dependabot.
// This performs no network requests and is not a general advisory audit.
const retired = new Set([
  'react-scripts', 'nth-check', 'webpack-dev-server',
  'serialize-javascript', 'underscore', '@tootallnate/once',
  'uuid', 'svgo', 'webpack-dev-middleware',
]);
const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'));
const found = Object.keys(lock.packages).flatMap(path => {
  const name = path.split('node_modules/').at(-1);
  return retired.has(name) ? [name] : [];
});
assert.deepEqual(found, [], `Retired dependency chains returned: ${found.join(', ')}`);
const postcss = Object.entries(lock.packages).filter(([path]) => path.endsWith('/node_modules/postcss') || path === 'node_modules/postcss');
assert.ok(postcss.length > 0, 'Missing Vite CSS processor');
for (const [path, pkg] of postcss) {
  // 8.5.33 is the resolved patched release used by this migration.
  const [major, minor, patch] = pkg.version.split('.').map(Number);
  assert.ok(major === 8 && (minor > 5 || (minor === 5 && patch >= 33)), `Outdated PostCSS: ${path}@${pkg.version}`);
}
console.log('Verified: 8 reported packages removed, PostCSS >=8.5.33, react-scripts absent.');
