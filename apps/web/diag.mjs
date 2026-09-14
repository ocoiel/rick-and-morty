import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const respostas = [];
page.on('response', (r) => {
  const url = r.url();
  if (!url.includes('/character/avatar/')) return;
  respostas.push({ status: r.status(), type: r.headers()['content-type'] ?? '(nenhum)' });
});
page.on('requestfailed', (r) => {
  if (r.url().includes('/character/avatar/')) {
    respostas.push({ status: 'FALHOU', type: r.failure()?.errorText ?? '?' });
  }
});

await page.goto('http://127.0.0.1:3200/episode/28', { waitUntil: 'networkidle' });

// força o lazy-load de todos os cards
for (let i = 0; i < 25; i++) {
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(250);
}
await page.waitForTimeout(4000);

const imgs = await page.locator('img').evaluateAll((els) =>
  els.map((e) => ({ src: (e.currentSrc || e.src).split('/').pop(), w: e.naturalWidth })),
);
const quebradas = imgs.filter((i) => i.w === 0);
console.log(`IMAGENS NO DOM: ${imgs.length} | carregadas: ${imgs.length - quebradas.length} | quebradas: ${quebradas.length}`);
if (quebradas.length) console.log('QUEBRADAS:', quebradas.map((i) => i.src).join(', '));

const porStatus = {};
for (const r of respostas) {
  const k = `${r.status} — ${r.type}`;
  porStatus[k] = (porStatus[k] ?? 0) + 1;
}
console.log('RESPOSTAS DO CDN:', JSON.stringify(porStatus, null, 1));

await browser.close();
