const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const run = (command) => {
  console.log(`[Vercel Build] ${command}`);
  execSync(command, { stdio: 'inherit' });
};

console.log('[Vercel Build] Building monorepo workspace...');
run('pnpm --filter @media-sdk/core build');
run('pnpm --filter @media-sdk/react build');
run('pnpm --filter @media-sdk/ui-react build');
run('pnpm --filter web build');

const srcDist = path.join(__dirname, '../apps/web/dist');
const destDist = path.join(__dirname, '../dist');

console.log(`[Vercel Build] Copying ${srcDist} -> ${destDist}...`);
if (fs.existsSync(destDist)) {
  fs.rmSync(destDist, { recursive: true, force: true });
}
fs.cpSync(srcDist, destDist, { recursive: true });

console.log('[Vercel Build] Successfully prepared output directory at ./dist');
