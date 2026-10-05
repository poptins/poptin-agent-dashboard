import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {Script} from 'node:vm';

const source = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const inventory = {
  poptin: ['seo', 'update-blog', 'alternatives', 'social', 'youtube-shorts',
    'youtube-video', 'tutorial-video', 'instagram-reels', 'instagram-stories',
    'facebook-stories', 'academy', 'glossary', 'optimization', 'quora',
    'partners-agencies', 'agency-followup', 'marketing-consultant-outreach',
    'marketing-consultant-followup', 'listicle-outreach', 'listicle-followup',
    'affiliate-outreach', 'competitor-affiliate-outreach',
    'competitor-affiliate-followup', 'affiliate-followup', 'ecommerce-cro',
    'ecommerce-cro-followup', 'buying-intent', 'buying-intent-followup', 'facebook-reels'],
  chatway: ['seo', 'update-blog', 'alternatives', 'social', 'glossary', 'optimization'],
  chaty: ['seo', 'update-blog'],
  prospero: ['seo', 'update-blog', 'alternatives', 'social'],
  premio: ['seo', 'update-blog', 'social']
};
const publisherCounts = {
  'youtube-shorts': 4, 'youtube-video': 1, 'tutorial-video': 3,
  'instagram-reels': 6, 'instagram-stories': 2, 'facebook-stories': 2,
  'facebook-reels': 1
};
const departments = {
  content: ['seo', 'update-blog', 'alternatives', 'optimization'],
  education: ['academy', 'glossary'],
  social: ['social', 'quora'],
  video: ['youtube-shorts', 'youtube-video', 'tutorial-video', 'instagram-reels',
    'instagram-stories', 'facebook-reels', 'facebook-stories'],
  partnerships: ['partners-agencies', 'agency-followup', 'marketing-consultant-outreach',
    'marketing-consultant-followup', 'listicle-outreach', 'listicle-followup',
    'affiliate-outreach', 'affiliate-followup', 'competitor-affiliate-outreach',
    'competitor-affiliate-followup'],
  conversion: ['buying-intent', 'buying-intent-followup', 'ecommerce-cro', 'ecommerce-cro-followup']
};
const scripts = ['data.js', 'publishing-agents.js', 'trigger-metadata.js',
  'company-tree.js', 'app.js', 'product-tabs.js',
  'preserve-agent-on-product-switch.js', 'calendar-view.js',
  'glossary-activity-links.js', 'optimization-opportunities.js'];
const tick = () => new Promise(setImmediate);
const sorted = items => Array.from(items).sort();

async function harness() {
  const dom = new JSDOM(source('dashboard.html'), {
    url: 'https://dashboard.example/dashboard.html', runScripts: 'outside-only'
  });
  const {window: w} = dom;
  const RealDate = w.Date;
  w.Date = class extends RealDate {
    constructor(...args) { super(...(args.length ? args : ['2026-10-05T12:00:00Z'])); }
    static now() { return RealDate.parse('2026-10-05T12:00:00Z'); }
  };
  const requests = [];
  w.fetch = async (url, options = {}) => {
    requests.push({url: String(url), method: options.method || 'GET'});
    return {ok: true, status: 200, json: async () =>
      String(url).includes('/actions/runs') ? {workflow_runs: []} : []};
  };
  const append = w.document.head.appendChild.bind(w.document.head);
  w.document.head.appendChild = element => {
    const result = append(element);
    if (element.tagName === 'SCRIPT') queueMicrotask(() => {
      try {
        const file = new URL(element.src).pathname.slice(1);
        new Script(source(file), {filename: file}).runInContext(dom.getInternalVMContext());
        element.onload?.();
      } catch (error) { element.onerror?.(error); }
    });
    return result;
  };
  for (const file of scripts) {
    new Script(source(file), {filename: file}).runInContext(dom.getInternalVMContext());
  }
  await tick();
  return {w, dom, requests, close: async () => {await tick(); w.close();}};
}

function select(w, selector, value) {
  const element = w.document.querySelector(selector);
  assert.ok(element, selector);
  element.value = value;
  element.dispatchEvent(new w.Event('change', {bubbles: true}));
}

function search(w, value) {
  const element = w.document.querySelector('#agentSearch');
  element.value = value;
  element.dispatchEvent(new w.Event('input', {bubbles: true}));
}

function card(w, id) {
  const result = w.document.querySelector(`#companyTree [data-agent-id="${id}"]`);
  assert.ok(result, `Company tree contains ${id}`);
  return result;
}

function clickProduct(w, id) {
  const button = w.document.querySelector(`[data-product="${id}"]`);
  assert.ok(button, `Product control for ${id}`);
  button.click();
}

function selectedId(w) { return w.eval('selectedAgentId'); }

function department(w, id) {
  const button = w.document.querySelector(`#companyTree [data-department="${id}"]`);
  assert.ok(button, `Department ${id}`);
  return button;
}

function key(w, element, name) {
  const event = new w.KeyboardEvent('keydown', {key: name, bubbles: true, cancelable: true});
  element.dispatchEvent(event);
  return event;
}

function triggerModes(element) {
  return [...element.querySelectorAll('[data-trigger]')].map(badge => badge.dataset.trigger);
}

function calendar(w, id) {
  if (w.document.querySelector('#calendarView').hidden) {
    w.document.querySelector('#calendarViewButton').click();
  }
  select(w, '#calendarProductFilter', 'poptin');
  select(w, '#calendarAgentFilter', id);
  return [...w.document.querySelectorAll('.calendar-outcome')];
}

test('company tree preserves the exact 44-record product inventory and 29 Poptin agents', async () => {
  const h = await harness();
  try {
    const {w} = h;
    for (const [productId, expected] of Object.entries(inventory)) {
      clickProduct(w, productId);
      assert.deepEqual(sorted(w.PRODUCT_AGENT_DATA[productId].agents.map(agent => agent.id)), sorted(expected));
      const rendered = [...w.document.querySelectorAll('#companyTree [data-agent-id]')];
      assert.equal(rendered.length, expected.length, `${productId} renders each record once`);
      assert.deepEqual(sorted(rendered.map(button => button.dataset.agentId)), sorted(expected));
      assert.equal(Number(w.document.querySelector('#agentCount').textContent), expected.length);
      assert.equal(selectedId(w), null, 'Product switches preserve root selection');
    }
    const expectedAll = Object.entries(inventory).flatMap(([productId, ids]) => ids.map(id => `${productId}-${id}`));
    assert.equal(expectedAll.length, 44);
    assert.equal(inventory.poptin.length, 29);
    assert.deepEqual(sorted(w.PRODUCT_AGENT_DATA.all.agents.map(agent => agent.id)), sorted(expectedAll));
    assert.equal(new Set(w.PRODUCT_AGENT_DATA.all.agents.map(agent => agent.id)).size, 44);
    assert.ok(w.PRODUCT_AGENT_DATA.all.agents.every(agent => !agent.name.includes('undefined')));
    w.selectMarketingProduct('all');
    assert.deepEqual(sorted([...w.document.querySelectorAll('#companyTree [data-agent-id]')].map(button => button.dataset.agentId)), sorted(expectedAll));
    assert.equal(Number(w.document.querySelector('#agentCount').textContent), 44);
  } finally { await h.close(); }
});

test('Poptimus Prime is the initial root and never an extra agent record', async () => {
  const h = await harness();
  try {
    const {w} = h;
    assert.equal(selectedId(w), null);
    const root = w.document.querySelector('#companyRoot');
    assert.ok(root);
    assert.equal(root.tagName, 'BUTTON');
    assert.match(root.textContent, /Poptimus Prime/);
    assert.equal(root.hasAttribute('data-agent-id'), false);
    assert.equal(w.document.querySelectorAll('#companyRoot').length, 1);
    assert.equal(Number(w.document.querySelector('#agentCount').textContent), 29);
    assert.ok(w.PRODUCT_AGENT_DATA.all.agents.every(agent => !/Poptimus Prime/i.test(`${agent.id} ${agent.name}`)));
    assert.equal(w.document.querySelector('#statsGrid .stat-card strong').textContent.trim(), '29');
  } finally { await h.close(); }
});

test('agent selection uses the existing detail and Everything in motion sidebar', async () => {
  const h = await harness();
  try {
    const {w} = h;
    card(w, 'tutorial-video').click();
    assert.equal(selectedId(w), 'tutorial-video');
    assert.equal(card(w, 'tutorial-video').getAttribute('aria-pressed'), 'true');
    assert.equal(w.document.querySelectorAll('#companyTree [data-agent-id][aria-pressed="true"]').length, 1);
    const sidebar = w.document.querySelector('#companySidebar');
    assert.ok(sidebar.querySelector('#agentDetail'));
    assert.ok(sidebar.querySelector('#activityTimeline'));
    assert.match(sidebar.textContent, /Everything in motion/);
    assert.match(sidebar.querySelector('#agentDetail').textContent, /Tutorial Video Agent/);
    assert.match(sidebar.querySelector('#agentDetail').textContent, /interactive UI-capture handoff/);
    assert.equal(w.document.querySelector('#activityAgentFilter').value, 'tutorial-video');
    assert.equal(w.document.querySelector('#activityProductFilter').value, 'poptin');
    assert.equal(w.document.querySelectorAll('#activityTimeline .activity-card').length, 3);
    w.document.querySelector('[data-filter="past"]').click();
    card(w, 'instagram-reels').click();
    assert.equal(w.document.querySelector('.filter.active').dataset.filter, 'past');
    assert.equal(w.document.querySelector('#activityAgentFilter').value, 'instagram-reels');
    assert.equal(w.document.querySelectorAll('#activityTimeline .activity-card').length, 6);
    assert.ok(h.requests.every(request => request.method === 'GET'));
  } finally { await h.close(); }
});

test('product switches preserve a valid selected type and return missing types to root', async () => {
  const h = await harness();
  try {
    const {w} = h;
    card(w, 'glossary').click();
    clickProduct(w, 'chatway');
    assert.equal(selectedId(w), 'glossary');
    assert.equal(card(w, 'glossary').getAttribute('aria-pressed'), 'true');
    assert.equal(w.document.querySelector('#activityAgentFilter').value, 'glossary');
    assert.equal(w.document.querySelector('#activityProductFilter').value, 'chatway');
    clickProduct(w, 'chaty');
    assert.equal(selectedId(w), null, 'An unavailable agent returns to root rather than silently choosing SEO');
    assert.equal(w.document.querySelector('#activityAgentFilter').value, 'all');
    clickProduct(w, 'poptin');
    assert.equal(selectedId(w), null);
    card(w, 'youtube-shorts').click();
    w.selectMarketingProduct('chatway');
    assert.equal(selectedId(w), null, 'Programmatic product switches use the same missing-agent rule');
    w.selectMarketingProduct('poptin');
    card(w, 'seo').click();
    w.selectMarketingProduct('all');
    card(w, 'poptin-seo').click();
    assert.equal(selectedId(w), 'poptin-seo');
    assert.equal(w.document.querySelector('#activityAgentFilter').value, 'seo');
  } finally { await h.close(); }
});

test('refresh and repeated rendering preserve publishers, calendar selection, and one tree per record', async () => {
  const h = await harness();
  try {
    const {w} = h;
    card(w, 'instagram-reels').click();
    assert.equal(calendar(w, 'instagram-reels').length, 6);
    for (let index = 0; index < 3; index++) {
      await w.loadLatestData();
      w.eval('data = window.PRODUCT_AGENT_DATA.poptin');
      w.renderDashboard();
      w.document.dispatchEvent(new w.CustomEvent('marketingActivityUpdated'));
      assert.equal(selectedId(w), 'instagram-reels');
      assert.equal(w.document.querySelector('#calendarAgentFilter').value, 'instagram-reels');
      assert.equal(w.document.querySelectorAll('.calendar-outcome').length, 6);
      assert.equal(w.PRODUCT_AGENT_DATA.poptin.agents.length, 29);
      assert.equal(w.PRODUCT_AGENT_DATA.all.agents.length, 44);
      assert.equal(w.document.querySelectorAll('#companyTree [data-agent-id]').length, 29);
      assert.equal(w.document.querySelectorAll('#companyRoot').length, 1);
      for (const [id, count] of Object.entries(publisherCounts)) {
        const agents = w.PRODUCT_AGENT_DATA.poptin.agents.filter(agent => agent.id === id);
        assert.equal(agents.length, 1, id);
        assert.equal(agents[0].activities.length, count, id);
        assert.ok(agents[0].activities.every(event => event.publicationVerified && event.type === 'past'));
      }
      const outcomes = w.PRODUCT_AGENT_DATA.poptin.agents.filter(agent => agent.manualPublishing).flatMap(agent => agent.activities);
      assert.equal(outcomes.length, 19);
      assert.equal(new Set(outcomes.map(event => event.publicationTaskId)).size, 19);
    }
    for (const [id, count] of Object.entries(publisherCounts)) assert.equal(calendar(w, id).length, count, id);
    assert.ok(h.requests.every(request => request.method === 'GET'));
  } finally { await h.close(); }
});

test('trigger inventory covers all real records without inventing enabled workflows or video schedules', async () => {
  const h = await harness();
  try {
    const {w} = h;
    for (const [productId, ids] of Object.entries(inventory)) {
      const metadata = w.AGENT_TRIGGER_METADATA[productId];
      assert.deepEqual(sorted(Object.keys(metadata)), sorted(ids), productId);
      for (const id of ids) {
        const trigger = metadata[id];
        assert.equal(trigger.enabledState, 'unverified', `${productId}/${id}`);
        assert.equal(typeof trigger.paused, 'boolean');
        assert.equal(new Set(trigger.modes).size, trigger.modes.length);
        assert.ok(trigger.modes.every(mode => ['scheduled', 'manual', 'event'].includes(mode)));
        assert.ok(trigger.sources.length > 0, `${productId}/${id} has workflow evidence`);
        assert.ok(trigger.sources.every(url => url.startsWith(`https://github.com/poptins/${productId}-agents/`)));
        assert.ok(Number.isFinite(Date.parse(trigger.verifiedAt)));
        assert.equal(trigger.modes.includes('scheduled'), trigger.schedules.length > 0);
        for (const schedule of trigger.schedules) {
          assert.equal(schedule.cron.trim().split(/\s+/).length, 5);
          assert.ok(schedule.timezone);
        }
      }
    }
    for (const id of Object.keys(publisherCounts)) {
      const trigger = w.AGENT_TRIGGER_METADATA.poptin[id];
      assert.deepEqual(Array.from(trigger.modes), ['manual'], id);
      assert.equal(trigger.schedules.length, 0, id);
    }
    assert.deepEqual(Array.from(w.AGENT_TRIGGER_METADATA.poptin.seo.modes), ['scheduled', 'manual', 'event']);
    assert.deepEqual(Array.from(w.AGENT_TRIGGER_METADATA.poptin.social.modes), ['scheduled', 'manual', 'event']);
    const buyingIntent = w.AGENT_TRIGGER_METADATA.poptin['buying-intent'];
    assert.equal(buyingIntent.schedules.length, 2);
    assert.ok(buyingIntent.schedules.every(schedule => schedule.timezone === 'Asia/Jerusalem'));
    assert.equal(w.AGENT_TRIGGER_METADATA.poptin.optimization.paused, true);
  } finally { await h.close(); }
});

test('department membership is exact and expansion controls expose the correct branches', async () => {
  const h = await harness();
  try {
    const {w} = h;
    assert.deepEqual(sorted([...w.document.querySelectorAll('[data-department]')].map(button => button.dataset.department)), sorted(Object.keys(departments)));
    for (const [id, expected] of Object.entries(departments)) {
      const toggle = department(w, id);
      assert.equal(toggle.tagName, 'BUTTON');
      assert.equal(toggle.type, 'button');
      assert.equal(toggle.getAttribute('aria-controls'), `department-${id}`);
      assert.equal(toggle.getAttribute('aria-expanded'), 'true');
      const group = w.document.getElementById(toggle.getAttribute('aria-controls'));
      assert.equal(group.hidden, false);
      assert.deepEqual(sorted([...group.querySelectorAll('[data-agent-id]')].map(button => button.dataset.agentId)), sorted(expected));
      toggle.click();
      assert.equal(department(w, id).getAttribute('aria-expanded'), 'false');
      assert.equal(w.document.getElementById(`department-${id}`).hidden, true);
      assert.equal(w.document.activeElement, department(w, id), 'Collapse retains focus on its control');
      department(w, id).click();
      assert.equal(w.document.getElementById(`department-${id}`).hidden, false);
    }
    assert.equal(new Set(Object.values(departments).flat()).size, 29);
  } finally { await h.close(); }
});

test('search temporarily expands matching branches and restores product-specific collapse state', async () => {
  const h = await harness();
  try {
    const {w} = h;
    department(w, 'video').click();
    department(w, 'content').click();
    search(w, '  INSTAGRAM  ');
    assert.deepEqual([...w.document.querySelectorAll('[data-department]')].map(button => button.dataset.department), ['video']);
    assert.deepEqual(sorted([...w.document.querySelectorAll('#companyTree [data-agent-id]')].map(button => button.dataset.agentId)), ['instagram-reels', 'instagram-stories']);
    assert.equal(department(w, 'video').getAttribute('aria-expanded'), 'true');
    assert.equal(w.document.querySelector('#agentCount').textContent, '2');
    department(w, 'video').click();
    assert.equal(department(w, 'video').getAttribute('aria-expanded'), 'false');
    search(w, 'YouTube');
    assert.equal(department(w, 'video').getAttribute('aria-expanded'), 'true', 'A new search reveals its matches');
    search(w, 'no-such-agent-xyz');
    assert.equal(w.document.querySelectorAll('#companyTree [data-agent-id]').length, 0);
    assert.equal(w.document.querySelectorAll('#companyRoot').length, 1);
    assert.match(w.document.querySelector('#companyTree [role="status"]').textContent, /No agents match/);
    search(w, '');
    assert.equal(w.document.querySelector('#agentCount').textContent, '29');
    assert.equal(department(w, 'video').getAttribute('aria-expanded'), 'false');
    assert.equal(department(w, 'content').getAttribute('aria-expanded'), 'false');
    clickProduct(w, 'chatway');
    assert.equal(department(w, 'content').getAttribute('aria-expanded'), 'true', 'Other products keep independent expansion state');
    clickProduct(w, 'poptin');
    assert.equal(department(w, 'video').getAttribute('aria-expanded'), 'false');
    assert.equal(department(w, 'content').getAttribute('aria-expanded'), 'false');
  } finally { await h.close(); }
});

test('root and back navigation restore a useful focus target without changing inventory', async () => {
  const h = await harness();
  try {
    const {w} = h;
    const back = w.document.querySelector('#companyBack');
    assert.equal(back.hidden, true);
    card(w, 'tutorial-video').click();
    assert.equal(back.hidden, false);
    assert.equal(w.document.activeElement.id, 'agentDetail');
    back.click();
    assert.equal(selectedId(w), null);
    assert.equal(back.hidden, true);
    assert.equal(w.document.activeElement, card(w, 'tutorial-video'));
    assert.equal(w.document.querySelector('#companyRoot').getAttribute('aria-pressed'), 'true');
    assert.equal(w.document.querySelector('#activityAgentFilter').value, 'all');
    assert.match(w.document.querySelector('#agentDetail').textContent, /Your company, connected/);
    card(w, 'instagram-reels').click();
    search(w, 'SEO');
    back.click();
    assert.equal(w.document.activeElement.id, 'companyRoot', 'A filtered-out previous card falls back to the root');
    search(w, '');
    card(w, 'youtube-shorts').click();
    w.document.querySelector('#companyRoot').click();
    assert.equal(selectedId(w), null);
    assert.equal(w.document.activeElement.id, 'companyRoot');
    assert.equal(w.document.querySelectorAll('#companyTree [data-agent-id]').length, 29);
    w.companyTree.selectAgent('not-an-agent');
    assert.equal(selectedId(w), null, 'An invalid selection cannot invent an agent');
  } finally { await h.close(); }
});

test('keyboard movement skips collapsed branches and Escape respects form controls', async () => {
  const h = await harness();
  try {
    const {w} = h;
    // Native button semantics supply Enter/Space activation; movement and Escape are custom.
    assert.ok([...w.document.querySelectorAll('#companyTree button')].every(button => button.type === 'button' && !button.disabled));
    department(w, 'content').click();
    const root = w.document.querySelector('#companyRoot');
    root.focus();
    assert.equal(key(w, root, 'ArrowDown').defaultPrevented, true);
    assert.equal(w.document.activeElement, department(w, 'content'));
    key(w, w.document.activeElement, 'ArrowDown');
    assert.equal(w.document.activeElement, department(w, 'education'), 'Collapsed Content agents are skipped');
    key(w, w.document.activeElement, 'ArrowUp');
    assert.equal(w.document.activeElement, department(w, 'content'));
    key(w, w.document.activeElement, 'End');
    const visibleButtons = [...w.document.querySelectorAll('#companyTree button')].filter(button => !button.closest('[hidden]'));
    assert.equal(w.document.activeElement, visibleButtons.at(-1));
    key(w, w.document.activeElement, 'ArrowDown');
    assert.equal(w.document.activeElement, visibleButtons.at(-1), 'Movement stays inside the tree');
    key(w, w.document.activeElement, 'Home');
    assert.equal(w.document.activeElement.id, 'companyRoot');
    key(w, w.document.activeElement, 'ArrowUp');
    assert.equal(w.document.activeElement.id, 'companyRoot');
    card(w, 'tutorial-video').click();
    const filter = w.document.querySelector('#activityAgentFilter');
    filter.focus();
    assert.equal(key(w, filter, 'Escape').defaultPrevented, false);
    assert.equal(selectedId(w), 'tutorial-video', 'Escape in a native select does not navigate away');
    const detail = w.document.querySelector('#agentDetail');
    detail.focus();
    assert.equal(key(w, detail, 'Escape').defaultPrevented, true);
    assert.equal(selectedId(w), null);
    assert.equal(w.document.activeElement, card(w, 'tutorial-video'));
    card(w, 'youtube-shorts').click();
    const current = card(w, 'youtube-shorts');
    current.focus();
    key(w, current, 'Escape');
    assert.equal(selectedId(w), null);
    assert.equal(w.document.activeElement, card(w, 'youtube-shorts'));
  } finally { await h.close(); }
});

test('trigger badges use explicit metadata, retain multiple modes, and distinguish paused from unverified', async () => {
  const h = await harness();
  try {
    const {w} = h;
    assert.deepEqual(triggerModes(card(w, 'seo')), ['scheduled', 'manual', 'event']);
    assert.deepEqual(triggerModes(card(w, 'social')), ['scheduled', 'manual', 'event']);
    assert.deepEqual(triggerModes(card(w, 'optimization')), ['paused']);
    assert.deepEqual(triggerModes(card(w, 'tutorial-video')), ['manual']);
    for (const badge of card(w, 'seo').querySelectorAll('[data-trigger]')) {
      assert.match(badge.title, /enabled state not verified/);
    }
    card(w, 'seo').click();
    const detail = w.document.querySelector('#agentDetail .trigger-details');
    assert.ok(detail);
    assert.match(detail.textContent, /Daily at 05:00 \(UTC\)/);
    assert.match(detail.textContent, /0 5 \* \* \*/);
    assert.match(detail.textContent, /GitHub push/);
    assert.match(detail.textContent, /\.github\/seo-publish-now/);
    assert.match(detail.textContent, /Workflow enabled state: not verified/);
    assert.ok(detail.querySelector('a[href="https://github.com/poptins/poptin-agents/blob/main/.github/workflows/seo-agent.yml"]'));
    card(w, 'buying-intent').click();
    assert.match(w.document.querySelector('#agentDetail .trigger-details').textContent, /05:15 \(Asia\/Jerusalem\)/);
    assert.match(w.document.querySelector('#agentDetail .trigger-details').textContent, /08:18, 11:18 \(Asia\/Jerusalem\)/);
    const agent = w.PRODUCT_AGENT_DATA.poptin.agents.find(item => item.id === 'seo');
    agent.status = 'paused';
    agent.cadence = 'Every second';
    w.companyTree.render();
    assert.deepEqual(triggerModes(card(w, 'seo')), ['scheduled', 'manual', 'event'], 'Legacy status/cadence cannot override inspected trigger metadata');
    w.AGENT_TRIGGER_METADATA.poptin.seo.paused = true;
    w.companyTree.render();
    assert.deepEqual(triggerModes(card(w, 'seo')), ['paused']);
    delete w.AGENT_TRIGGER_METADATA.poptin.seo;
    w.companyTree.render();
    assert.deepEqual(triggerModes(card(w, 'seo')), ['unknown'], 'Missing metadata is not inferred from cadence or scheduled activities');
    const unknown = JSDOM.fragment(w.companyTree.renderTriggers(agent));
    assert.match(unknown.textContent, /not been verified/);
    assert.match(unknown.textContent, /Workflow enabled state: not verified/);
    assert.equal(unknown.querySelectorAll('a').length, 0);
    w.selectMarketingProduct('all');
    assert.deepEqual(triggerModes(card(w, 'chatway-seo')), ['scheduled', 'manual']);
    assert.deepEqual(triggerModes(card(w, 'poptin-seo')), ['unknown']);
  } finally { await h.close(); }
});

test('tree and trigger details escape source text and reject unsafe evidence links', async () => {
  const h = await harness();
  try {
    const {w} = h;
    const agent = w.PRODUCT_AGENT_DATA.poptin.agents.find(item => item.id === 'seo');
    agent.name = '<img src=x onerror=alert(1)>';
    agent.role = '<script>alert(1)</script>';
    agent.initials = '<svg onload=alert(1)>';
    const metadata = w.AGENT_TRIGGER_METADATA.poptin.seo;
    metadata.note = '<img src=x onerror=alert(1)>';
    metadata.events = [{event: '<script>alert(1)</script>', paths: ['<svg onload=alert(1)>']}];
    metadata.sources = ['javascript:alert(1)', 'https://example.com/unverified'];
    w.companyTree.render();
    const tree = w.document.querySelector('#companyTree');
    assert.equal(tree.querySelectorAll('img, script, svg').length, 0);
    assert.match(tree.textContent, /<img src=x onerror=alert\(1\)>/);
    const trigger = JSDOM.fragment(w.companyTree.renderTriggers(agent));
    assert.equal(trigger.querySelectorAll('img, script, svg, a').length, 0);
    assert.match(trigger.textContent, /<script>alert\(1\)<\/script>/);
    assert.match(trigger.textContent, /<svg onload=alert\(1\)>/);
  } finally { await h.close(); }
});
