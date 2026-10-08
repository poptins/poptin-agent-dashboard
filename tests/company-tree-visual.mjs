// Offline component smoke test. The production login and dashboard auth scripts
// are not executed, modified, or authenticated. No live services are contacted.
import assert from 'node:assert/strict';
import {readFileSync, mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {JSDOM} from 'jsdom';
import {chromium} from 'playwright';
const source = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const directory = process.env.SCREENSHOT_DIR || '/tmp/company-tree-visual';
mkdirSync(directory, {recursive: true});
const fixture = new JSDOM(source('dashboard.html'));
fixture.window.document.querySelectorAll('script, link').forEach(element => element.remove());
const style = fixture.window.document.createElement('style');
style.textContent = ['styles.css', 'calendar-view.css', 'company-tree.css'].map(source).join('\n');
fixture.window.document.head.append(style);
const browser = await chromium.launch(process.env.CHROMIUM_EXECUTABLE_PATH ? {executablePath: process.env.CHROMIUM_EXECUTABLE_PATH} : {});
const page = await browser.newPage({reducedMotion: 'reduce'});
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.route('**/*', route => route.abort());
await page.setViewportSize({width: 1600, height: 1100});
await page.setContent(fixture.serialize(), {waitUntil: 'domcontentloaded'});
await page.evaluate(() => {
  const storage = new Map();
  const local = new Map();
  const adapter = map => ({getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, String(value)), removeItem: key => map.delete(key)});
  Object.defineProperty(window, 'sessionStorage', {value: adapter(storage)});
  Object.defineProperty(window, 'localStorage', {value: adapter(local)});
  window.fixtureRequests = [];
  window.fetch = async (url, options = {}) => {
    const method = options.method || 'GET';
    window.fixtureRequests.push({url: String(url), method});
    if (method !== 'GET') throw new Error('Writes are forbidden in the component fixture');
    return {ok: true, status: 200, json: async () => []};
  };
});
for (const file of ['data.js', 'publishing-agents.js', 'trigger-metadata.js', 'company-tree.js', 'app.js', 'product-tabs.js', 'preserve-agent-on-product-switch.js', 'calendar-view.js', 'glossary-activity-links.js', 'optimization-opportunities.js']) {
  await page.addScriptTag({content: source(file)});
}
const metrics = [];
async function screenshot(name, width, height) {
  await page.setViewportSize({width, height});
  const metric = await page.evaluate(() => ({
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    treeCards: document.querySelectorAll('#companyTree [data-agent-id]').length,
    overflow: [...document.querySelectorAll('.company-agent, .activity-card, .detail-panel')].filter(element => element.getBoundingClientRect().right > innerWidth + 1).map(element => element.className)
  }));
  metrics.push({name, ...metric});
  assert.ok(metric.scrollWidth <= width + 1, `${name}: page overflows horizontally (${metric.scrollWidth} > ${width})`);
  assert.deepEqual(metric.overflow, [], `${name}: cards overflow the viewport`);
  await page.screenshot({path: join(directory, `${name}.png`), fullPage: true});
}
try {
  assert.equal(await page.locator('#companyTree [data-agent-id]').count(), 30);
  await screenshot('root-desktop', 1600, 1100);
  assert.equal(await page.locator('.agent-family').count(), 7);
  assert.equal(await page.locator('[data-workflow-reference]').count(), 2);
  await page.locator('[data-workflow-reference="monthly-updates"] > summary').click();
  await page.locator('.workflow-references').screenshot({path: join(directory, 'publishing-references-desktop.png')});
  await page.locator('[data-workflow-reference="monthly-updates"] > summary').click();
  await page.locator('#localAgentReferences').screenshot({path: join(directory, 'local-reference-desktop.png')});
  await page.locator('.department:has([data-department="partnerships"])').screenshot({path: join(directory, 'followups-desktop.png')});
  await page.locator('[data-agent-id="seo"]').click();
  assert.match(await page.locator('#agentDetail').innerText(), /SEO Agent/);
  await page.locator('.trigger-details > summary').click();
  await screenshot('seo-desktop', 1440, 1100);
  await page.locator('[data-agent-id="quarterly-benchmark"]').click();
  assert.match(await page.locator('#agentDetail').innerText(), /On demand — data required/);
  await screenshot('quarterly-benchmark-desktop', 1440, 1100);
  await screenshot('quarterly-benchmark-mobile', 390, 844);
  await page.locator('[data-agent-id="seo"]').click();
  await page.locator('#themeToggle').click();
  await screenshot('seo-dark', 1440, 1100);
  await page.locator('#themeToggle').click();
  await page.locator('#companyBack').click();
  await screenshot('root-tablet', 900, 1100);
  await page.setViewportSize({width: 390, height: 844});
  await page.locator('[data-agent-id="tutorial-video"]').click();
  assert.ok(await page.locator('#companyBack').isVisible());
  const backBox = await page.locator('#companyBack').boundingBox();
  assert.ok(backBox && backBox.y >= 0 && backBox.y + backBox.height <= 844, 'Mobile selection keeps Back to company in the viewport');
  await screenshot('video-mobile', 390, 844);
  // Viewport screenshot verifies automatic selection scroll reaches the inspector.
  await page.screenshot({path: join(directory, 'video-mobile-inspector.png')});
  await page.locator('#companyBack').click();
  assert.equal(await page.evaluate(() => document.activeElement?.dataset.agentId), 'tutorial-video');
  await page.locator('[data-agent-id="agency-followup"]').click();
  assert.match(await page.locator('#agentDetail').innerText(), /Agency Follow-up Agent/);
  await screenshot('followup-mobile', 390, 844);
  await page.locator('#companyBack').click();
  await page.locator('.agent-family[data-parent-agent="partners-agencies"]').screenshot({path: join(directory, 'followup-family-mobile.png')});
  await page.locator('[data-department="partnerships"]').click();
  assert.equal(await page.locator('[data-department="partnerships"]').getAttribute('aria-expanded'), 'false');
  await screenshot('root-mobile', 390, 844);
  assert.equal((await page.evaluate(() => window.fixtureRequests)).every(request => request.method === 'GET'), true);
  assert.deepEqual(errors, []);
} finally {
  writeFileSync(join(directory, 'metrics.json'), JSON.stringify({metrics, errors}, null, 2));
  await browser.close();
  fixture.window.close();
}
