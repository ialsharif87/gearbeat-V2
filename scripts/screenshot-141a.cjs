const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const outDir = 'C:\\Users\\iaals\\Documents\\gb-screenshots';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function capture(url, file, width, height, extraArgs = []) {
  const outFile = path.join(outDir, file);
  // Remove existing file first
  if (fs.existsSync(outFile)) fs.unlinkSync(outFile);

  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=3000',
    `--window-size=${width},${height}`,
    `--screenshot=${outFile}`,
    ...extraArgs,
    url,
  ];
  console.log(`Capturing ${file} (${width}x${height})...`);
  const result = spawnSync(chromePath, args, { timeout: 30000, stdio: ['ignore', 'pipe', 'pipe'] });
  if (fs.existsSync(outFile) && fs.statSync(outFile).size > 1000) {
    console.log(`  -> saved (${fs.statSync(outFile).size} bytes)`);
    return true;
  }
  console.log(`  -> failed or too small. status: ${result.status}`);
  return false;
}

// 1. Desktop hero
capture('http://localhost:3000', 'desktop-hero-141a.png', 1280, 800);

// 2. Mobile hero
capture('http://localhost:3000', 'mobile-hero-141a.png', 390, 844);

// 3. Desktop below hero (scrolled)
capture('http://localhost:3000', 'desktop-below-hero-141a.png', 1280, 1800);

console.log('\nDone.');
