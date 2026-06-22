import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const BASE = 'http://localhost:8081';
const OUT = 'C:/Users/ROG/AppData/Local/Temp/ringo_screenshots';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

async function shot(name, url, waitMs = 2000) {
  console.log(`📸 ${name} → ${url}`);
  try {
    await page.goto(BASE + url, { waitUntil: 'networkidle', timeout: 15000 });
  } catch(e) {}
  await page.waitForTimeout(waitMs);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
  console.log(`   ✅ saved`);
}

await shot('01_login', '/login');
await shot('02_register', '/register');
await shot('03_dashboard', '/dashboard');
await shot('04_campaign_list', '/campaign');
await shot('05_campaign_create', '/campaign/create');
await shot('06_settings_profile', '/settings');
await shot('07_settings_call_defaults', '/settings/call-defaults');
await shot('08_settings_flow', '/settings/flow');
await shot('09_analytics', '/analytics');

await browser.close();
console.log('\n✅ Done:', OUT);
