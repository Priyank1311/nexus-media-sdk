const { execSync } = require('node:child_process');
const { cpSync, rmSync, mkdirSync, existsSync } = require('node:fs');
const { resolve } = require('node:path');

const root = resolve(__dirname, '..');
const webDist = resolve(root, 'apps/web/dist');
const docsSite = resolve(root, 'docs-site');
const docsTarget = resolve(webDist, 'docs');

function run(command) {
  execSync(command, { cwd: root, stdio: 'inherit' });
}

function copyDocs() {
  if (!existsSync(docsSite)) {
    throw new Error('docs-site was not generated. Run `pnpm docs:build` first.');
  }

  rmSync(docsTarget, { recursive: true, force: true });
  mkdirSync(webDist, { recursive: true });
  cpSync(docsSite, docsTarget, { recursive: true });
}

run('pnpm docs:build');
run('pnpm build');
copyDocs();
