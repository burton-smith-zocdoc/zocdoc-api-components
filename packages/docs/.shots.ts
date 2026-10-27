import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
const [, , ...pages] = process.argv;
for (const spec of pages) {
  const [path, theme, width, name] = spec.split(',');
  const p = await b.newPage({ viewport: { width: Number(width), height: 900 } });
  await p.addInitScript((t) => localStorage.setItem('starlight-theme', t), theme);
  await p.goto('http://localhost:4329/zocdoc-api-components' + path, { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  await p.screenshot({ path: `/tmp/shots/${name}.png`, fullPage: true });
  await p.close();
}
await b.close();
