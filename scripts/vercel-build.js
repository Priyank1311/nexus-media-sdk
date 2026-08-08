const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('[Vercel Build] Building web app...');
execSync('pnpm --filter web build', { stdio: 'inherit' });

const srcDist = path.join(__dirname, '../apps/web/dist');
const destDist = path.join(__dirname, '../dist');

console.log(`[Vercel Build] Copying ${srcDist} -> ${destDist}...`);
if (fs.existsSync(destDist)) {
  fs.rmSync(destDist, { recursive: true, force: true });
}
fs.cpSync(srcDist, destDist, { recursive: true });

console.log('[Vercel Build] Successfully prepared output directory at ./dist');
