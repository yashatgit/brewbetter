import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';
import { resolve } from 'path';

const BASE = 'http://localhost:3000';
const OUT = resolve(import.meta.dirname, '../screenshots');
mkdirSync(OUT, { recursive: true });

const pages = [
  { name: '01-dashboard', path: '/' },
  { name: '02-brew-history', path: '/brew/history' },
  { name: '03-new-brew', path: '/brew/new' },
  { name: '04-analytics', path: '/analytics' },
  { name: '05-beans', path: '/beans' },
  { name: '06-inventory', path: '/inventory' },
  { name: '07-equipment', path: '/equipment' },
  { name: '08-setups', path: '/setups' },
  { name: '09-settings', path: '/settings' },
  { name: '10-export', path: '/export' },
];

async function run() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Mobile viewport (375px iPhone-style)
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });

  for (const { name, path } of pages) {
    console.log(`📸 ${name} → ${path}`);
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle2', timeout: 15000 });
    // Wait a bit for any animations/data loading
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: `${OUT}/${name}-mobile.png`, fullPage: true });
  }

  // Try to find a brew detail page
  try {
    await page.goto(`${BASE}/brew/history`, { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1500));
    // Click first brew link
    const brewLink = await page.$('a[href^="/brew/"]');
    if (brewLink) {
      await brewLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 1500));
      await page.screenshot({ path: `${OUT}/11-brew-detail-mobile.png`, fullPage: true });
      console.log('📸 11-brew-detail');
    }
  } catch (e) {
    console.log('⚠️  Could not capture brew detail:', e.message);
  }

  // Desktop viewport
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });

  for (const { name, path } of pages) {
    console.log(`📸 ${name} (desktop) → ${path}`);
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: `${OUT}/${name}-desktop.png`, fullPage: true });
  }

  // Brew detail on desktop too
  try {
    await page.goto(`${BASE}/brew/history`, { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1500));
    const brewLink = await page.$('a[href^="/brew/"]');
    if (brewLink) {
      await brewLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 1500));
      await page.screenshot({ path: `${OUT}/11-brew-detail-desktop.png`, fullPage: true });
      console.log('📸 11-brew-detail (desktop)');
    }
  } catch (e) {
    console.log('⚠️  Could not capture brew detail desktop:', e.message);
  }

  await browser.close();
  console.log(`\n✅ Done! Screenshots saved to ${OUT}`);
}

run().catch(console.error);
