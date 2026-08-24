// 预先解压 Electron 到 release/electron-dist + 确保 dist-electron/package.json 为 CommonJS
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..');
fs.mkdirSync(path.join(baseDir, 'dist-electron'), { recursive: true });
fs.writeFileSync(path.join(baseDir, 'dist-electron', 'package.json'), '{"type":"commonjs"}\n');
const os = require('os');

const releaseDir = path.join(__dirname, '..', 'release');
const distDir = path.join(releaseDir, 'electron-dist');
const unpackedDir = path.join(releaseDir, 'win-unpacked');

// 清理上次构建的 win-unpacked
if (fs.existsSync(unpackedDir)) {
  try {
    fs.rmSync(unpackedDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 1000 });
    console.log('Cleaned old win-unpacked.');
  } catch {
    console.log('Could not clean old win-unpacked (files in use). Close Tineapp.exe first!');
    process.exit(1);
  }
}

// 如果已存在则跳过
if (fs.existsSync(path.join(distDir, 'electron.exe'))) {
  console.log('Electron already extracted, skipping.');
  process.exit(0);
}

// 查找缓存的 electron zip
const cacheRoot = path.join(os.homedir(), 'AppData', 'Local', 'electron', 'Cache');
if (!fs.existsSync(cacheRoot)) {
  console.error('Electron cache not found. Run electron-builder once first to download.');
  process.exit(1);
}

const dirs = fs.readdirSync(cacheRoot);
let zipPath = null;
for (const d of dirs) {
  const files = fs.readdirSync(path.join(cacheRoot, d));
  const zip = files.find(f => f.endsWith('.zip'));
  if (zip) { zipPath = path.join(cacheRoot, d, zip); break; }
}

if (!zipPath) {
  console.error('Electron zip not found in cache.');
  process.exit(1);
}

console.log(`Extracting ${zipPath}...`);
fs.mkdirSync(distDir, { recursive: true });

try {
  execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${distDir}' -Force"`, { stdio: 'inherit' });
  console.log('Electron extracted successfully.');
} catch {
  console.log('PowerShell extract failed, trying unzip...');
  execSync(`unzip -o "${zipPath}" -d "${distDir}"`, { stdio: 'inherit' });
}
