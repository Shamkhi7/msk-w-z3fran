import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

console.log('🚀 Building production web bundle...');
execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });

console.log('📄 Adding .nojekyll & 404 fallback...');
fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
fs.copyFileSync(path.join(distDir, 'index.html'), path.join(distDir, '404.html'));

console.log('📤 Pushing dist to gh-pages branch...');
try {
  // Clean up any stale .git inside dist
  if (fs.existsSync(path.join(distDir, '.git'))) {
    fs.rmSync(path.join(distDir, '.git'), { recursive: true, force: true });
  }

  const runDist = (cmd) => execSync(cmd, { cwd: distDir, stdio: 'inherit' });
  runDist('git init');
  runDist('git config http.curloptresolve "github.com:443:20.205.243.166"');
  runDist('git checkout -b gh-pages');
  runDist('git add -A');
  runDist('git commit -m "Deploy web build to gh-pages"');
  runDist('git remote add origin https://github.com/Shamkhi7/msk-w-z3fran.git');
  runDist('git push -f origin gh-pages');

  console.log('✅ Successfully published to gh-pages branch!');
} finally {
  if (fs.existsSync(path.join(distDir, '.git'))) {
    fs.rmSync(path.join(distDir, '.git'), { recursive: true, force: true });
  }
}
