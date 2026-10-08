import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {Script} from 'node:vm';

const source = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const inventory = {
  poptin: ['quarterly-benchmark', 'seo', 'update-blog', 'alternatives', 'social', 'youtube-shorts',
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
  content: ['seo', 'update-blog', 'alternatives', 'optimization', 'quarterly-benchmark'],
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
const followupParents = {
  'agency-followup': 'partners-agencies',
  'marketing-consultant-followup': 'marketing-consultant-outreach',
  'listicle-followup': 'listicle-outreach',
  'affiliate-followup': 'affiliate-outreach',
  'competitor-affiliate-followup': 'competitor-affiliate-outreach',
  'buying-intent-followup': 'buying-intent',
  'ecommerce-cro-followup': 'ecommerce-cro'
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

function family(w, parentId, childId) {
  const parent = card(w, parentId);
  const child = card(w, childId);
  const group = parent.closest('.agent-family');
  assert.ok(group, `${parentId} has a family wrapper`);
  assert.equal(group.dataset.parentAgent, parentId);
  assert.equal(parent.parentElement, group, `${parentId} is the family parent`);
  const children = group.querySelector(':scope > ul.followup-list');
  assert.ok(children, `${parentId} has a semantic child list`);
  assert.ok(children.getAttribute('aria-label')?.trim(), 'The follow-up list has an accessible label');
  assert.equal(child.closest('ul.followup-list'), children, `${childId} belongs under ${parentId}`);
  assert.equal(child.parentElement.tagName, 'LI');
  assert.equal(parent.contains(child), false, 'Child buttons are never nested inside parent buttons');
  assert.equal(child.tagName, 'BUTTON');
  assert.equal(child.type, 'button');
  return group;
}

function calendar(w, id) {
  if (w.document.querySelector('#calendarView').hidden) {
    w.document.querySelector('#calendarViewButton').click();
  }
  select(w, '#calendarProductFilter', 'poptin');
  select(w, '#calendarAgentFilter', id);
  return [...w.document.querySelectorAll('.calendar-outcome')];
}

test('company tree preserves the exact 45-record product inventory and 30 Poptin agents', async () => {
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
    assert.equal(expectedAll.length, 45);
    assert.equal(inventory.poptin.length, 30);
    assert.deepEqual(sorted(w.PRODUCT_AGENT_DATA.all.agents.map(agent => agent.id)), sorted(expectedAll));
    assert.equal(new Set(w.PRODUCT_AGENT_DATA.all.agents.map(agent => agent.id)).size, 45);
    assert.ok(w.PRODUCT_AGENT_DATA.all.agents.every(agent => !agent.name.includes('undefined')));
    w.selectMarketingProduct('all');
    assert.deepEqual(sorted([...w.document.querySelectorAll('#companyTree [data-agent-id]')].map(button => button.dataset.agentId)), sorted(expectedAll));
    assert.equal(Number(w.document.querySelector('#agentCount').textContent), 45);
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
    assert.equal(Number(w.document.querySelector('#agentCount').textContent), 30);
    assert.ok(w.PRODUCT_AGENT_DATA.all.agents.every(agent => !/Poptimus Prime/i.test(`${agent.id} ${agent.name}`)));
    assert.equal(w.document.querySelector('#statsGrid .stat-card strong').textContent.trim(), '30');
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
      assert.equal(w.PRODUCT_AGENT_DATA.poptin.agents.length, 30);
      assert.equal(w.PRODUCT_AGENT_DATA.all.agents.length, 45);
      assert.equal(w.document.querySelectorAll('#companyTree [data-agent-id]').length, 30);
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
        if (productId === 'poptin' && id === 'quarterly-benchmark') {
          assert.equal(trigger.enabledState, 'disabled');
          for (const key of ['modes', 'schedules', 'events', 'sources']) assert.equal(trigger[key].length, 0);
          assert.equal(trigger.verifiedAt, undefined, 'No workflow inspection date is invented');
          continue;
        }
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
    assert.equal(new Set(Object.values(departments).flat()).size, 30);
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
    assert.equal(w.document.querySelector('#agentCount').textContent, '30');
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
    assert.equal(w.document.querySelectorAll('#companyTree [data-agent-id]').length, 30);
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

test('all seven follow-ups nest under their exact parent without changing the source inventory', async () => {
  const h = await harness();
  try {
    const {w} = h;
    const before = JSON.stringify(w.PRODUCT_AGENT_DATA);
    assert.deepEqual({...w.companyTree.followupParents}, followupParents);
    for (const [childId, parentId] of Object.entries(followupParents)) {
      assert.ok(inventory.poptin.includes(childId) && inventory.poptin.includes(parentId));
      const group = family(w, parentId, childId);
      assert.deepEqual([...group.querySelectorAll('[data-agent-id]')].map(button => button.dataset.agentId), [parentId, childId]);
      const departmentId = Object.keys(departments).find(id => departments[id].includes(parentId));
      assert.equal(group.closest('.department-agents').id, `department-${departmentId}`);
      assert.equal(w.document.querySelectorAll(`#companyTree [data-agent-id="${childId}"]`).length, 1);
      assert.equal(w.document.querySelectorAll(`#companyTree [data-agent-id="${parentId}"]`).length, 1);
    }
    assert.equal(w.document.querySelectorAll('#companyTree ul.followup-list').length, 7);
    assert.equal(w.document.querySelectorAll('#companyTree [data-agent-id]').length, 30);
    assert.equal(w.document.querySelector('#agentCount').textContent, '30');
    assert.equal(w.document.querySelector('#statsGrid .stat-card strong').textContent.trim(), '30');
    w.companyTree.render();
    assert.equal(JSON.stringify(w.PRODUCT_AGENT_DATA), before, 'Nesting is view-only and never rewrites agent records');
  } finally { await h.close(); }
});

test('search keeps the exact parent and follow-up together for either side of every family', async () => {
  const h = await harness();
  try {
    const {w} = h;
    for (const [childId, parentId] of Object.entries(followupParents)) {
      const parent = w.PRODUCT_AGENT_DATA.poptin.agents.find(agent => agent.id === parentId);
      const child = w.PRODUCT_AGENT_DATA.poptin.agents.find(agent => agent.id === childId);
      // Use existing name/role text to distinguish similarly named affiliate families.
      for (const match of [child, parent]) {
        search(w, `  ${`${match.name} ${match.role}`.toUpperCase()}  `);
        family(w, parentId, childId);
        assert.deepEqual(sorted([...w.document.querySelectorAll('#companyTree [data-agent-id]')].map(button => button.dataset.agentId)), sorted([parentId, childId]));
        assert.equal(w.document.querySelector('#agentCount').textContent, '2', 'Both displayed records are counted');
        const group = card(w, childId).closest('.department-agents');
        assert.equal(group.hidden, false);
        const toggle = w.document.querySelector(`[aria-controls="${group.id}"]`);
        assert.match(toggle.querySelector('.department-copy small').textContent, /^2 agents$/);
      }
    }
    search(w, 'no-such-followup-xyz');
    assert.equal(w.document.querySelectorAll('#companyTree [data-agent-id]').length, 0);
    assert.equal(w.document.querySelectorAll('#companyTree .followup-list').length, 0);
    assert.equal(w.document.querySelector('#agentCount').textContent, '0');
    search(w, '');
    assert.equal(w.document.querySelectorAll('#companyTree [data-agent-id]').length, 30);
    assert.equal(w.document.querySelectorAll('#companyTree .followup-list').length, 7);
  } finally { await h.close(); }
});

test('missing parents and unmapped follow-ups remain standalone without dropping any records', async () => {
  const h = await harness();
  try {
    const {w} = h;
    const product = w.PRODUCT_AGENT_DATA.poptin;
    product.agents = product.agents.filter(agent => agent.id !== 'partners-agencies');
    // This isolated fixture represents a future unknown agent, rather than adding a production record.
    const unknown = {...product.agents.find(agent => agent.id === 'agency-followup'), id: 'unmapped-followup'};
    product.agents.push(unknown);
    w.companyTree.render();
    assert.equal(card(w, 'agency-followup').closest('.followup-list'), null, 'An orphan stays visible as a standalone card');
    assert.equal(card(w, unknown.id).closest('.followup-list'), null, 'An unmapped follow-up is not guessed into a family');
    assert.equal(card(w, unknown.id).closest('.department-agents').id, 'department-other');
    assert.equal(w.document.querySelector('[data-parent-agent="partners-agencies"]'), null);
    assert.deepEqual(sorted([...w.document.querySelectorAll('#companyTree [data-agent-id]')].map(button => button.dataset.agentId)), sorted(product.agents.map(agent => agent.id)));
    assert.equal(w.document.querySelector('#agentCount').textContent, '30');
    search(w, 'Agency Follow-up Agent');
    assert.deepEqual(sorted([...w.document.querySelectorAll('#companyTree [data-agent-id]')].map(button => button.dataset.agentId)), ['agency-followup', 'unmapped-followup']);
    card(w, 'agency-followup').click();
    assert.equal(selectedId(w), 'agency-followup');
    assert.equal(w.document.querySelector('#agentDetail h2').textContent, 'Agency Follow-up Agent');
  } finally { await h.close(); }
});

test('aggregate families preserve 45 real records and never attach a child to another product', async () => {
  const h = await harness();
  try {
    const {w} = h;
    w.selectMarketingProduct('all');
    for (const [childId, parentId] of Object.entries(followupParents)) family(w, `poptin-${parentId}`, `poptin-${childId}`);
    assert.equal(w.document.querySelectorAll('#companyTree [data-agent-id]').length, 45);
    assert.equal(w.document.querySelector('#agentCount').textContent, '45');
    assert.equal(w.document.querySelectorAll('#companyTree .followup-list').length, 7);
    const agents = w.PRODUCT_AGENT_DATA.all.agents;
    const parent = agents.find(agent => agent.id === 'poptin-partners-agencies');
    const child = agents.find(agent => agent.id === 'poptin-agency-followup');
    // Duplicate existing base types only in this fixture to prove product-aware pairing.
    const chatwayParent = {...parent, id: 'chatway-partners-agencies', productId: 'chatway', name: 'Agency fixture parent · Chatway'};
    const chatwayChild = {...child, id: 'chatway-agency-followup', productId: 'chatway', name: 'Agency fixture follow-up · Chatway'};
    const chatyOrphan = {...child, id: 'chaty-agency-followup', productId: 'chaty', name: 'Agency fixture follow-up · Chaty'};
    agents.unshift(chatwayChild, chatwayParent, chatyOrphan);
    w.companyTree.render();
    family(w, 'poptin-partners-agencies', 'poptin-agency-followup');
    family(w, chatwayParent.id, chatwayChild.id);
    assert.equal(card(w, chatyOrphan.id).closest('.followup-list'), null, 'A parent in another product cannot claim an orphan');
    assert.equal(w.document.querySelectorAll('#companyTree [data-agent-id]').length, agents.length);
    assert.equal(new Set([...w.document.querySelectorAll('#companyTree [data-agent-id]')].map(button => button.dataset.agentId)).size, agents.length);
    search(w, child.name);
    assert.deepEqual(sorted([...w.document.querySelectorAll('#companyTree [data-agent-id]')].map(button => button.dataset.agentId)), ['poptin-agency-followup', 'poptin-partners-agencies']);
    family(w, 'poptin-partners-agencies', 'poptin-agency-followup');
  } finally { await h.close(); }
});

test('nested child cards retain their own trigger badges, selection, instructions, and activity', async () => {
  const h = await harness();
  try {
    const {w} = h;
    for (const [childId, parentId] of Object.entries(followupParents)) {
      const child = w.PRODUCT_AGENT_DATA.poptin.agents.find(agent => agent.id === childId);
      w.AGENT_TRIGGER_METADATA.poptin[parentId].paused = true;
      w.companyTree.render();
      family(w, parentId, childId);
      assert.deepEqual(triggerModes(card(w, parentId)), ['paused']);
      assert.deepEqual(triggerModes(card(w, childId)), ['scheduled', 'manual'], 'The child does not inherit parent trigger state');
      card(w, childId).click();
      assert.equal(selectedId(w), childId);
      assert.equal(card(w, childId).getAttribute('aria-pressed'), 'true');
      assert.equal(card(w, parentId).getAttribute('aria-pressed'), 'false');
      assert.equal(w.document.querySelectorAll('#companyTree [data-agent-id][aria-pressed="true"]').length, 1);
      assert.equal(w.document.querySelector('#agentDetail h2').textContent, child.name);
      assert.deepEqual([...w.document.querySelectorAll('#agentDetail .agent-instructions li')].map(item => item.textContent), Array.from(child.instructions));
      assert.equal(w.document.querySelector('#activityAgentFilter').value, childId);
      assert.equal(w.document.querySelector('#activityProductFilter').value, 'poptin');
      assert.deepEqual(sorted([...w.document.querySelectorAll('#activityTimeline .activity-card h3')].map(item => item.textContent)), sorted(child.activities.map(item => item.title)));
      const sourceLinks = [...w.document.querySelectorAll('#agentDetail .trigger-details a')].map(link => link.href);
      assert.deepEqual(sourceLinks, Array.from(w.AGENT_TRIGGER_METADATA.poptin[childId].sources));
      assert.equal(w.document.activeElement.id, 'agentDetail');
      w.AGENT_TRIGGER_METADATA.poptin[parentId].paused = false;
    }
    assert.ok(h.requests.every(request => request.method === 'GET'));
  } finally { await h.close(); }
});

test('child keyboard movement and Back restore the nested card and skip collapsed families', async () => {
  const h = await harness();
  try {
    const {w} = h;
    const parentId = 'partners-agencies';
    const childId = 'agency-followup';
    family(w, parentId, childId);
    card(w, parentId).focus();
    assert.equal(key(w, w.document.activeElement, 'ArrowDown').defaultPrevented, true);
    assert.equal(w.document.activeElement, card(w, childId));
    key(w, w.document.activeElement, 'ArrowUp');
    assert.equal(w.document.activeElement, card(w, parentId));
    card(w, childId).click();
    w.document.querySelector('#companyBack').click();
    assert.equal(selectedId(w), null);
    assert.equal(w.document.activeElement, card(w, childId));
    card(w, childId).click();
    key(w, w.document.querySelector('#agentDetail'), 'Escape');
    assert.equal(selectedId(w), null);
    assert.equal(w.document.activeElement, card(w, childId));
    department(w, 'partnerships').click();
    assert.ok(card(w, parentId).closest('[hidden]'));
    assert.ok(card(w, childId).closest('[hidden]'));
    key(w, department(w, 'partnerships'), 'ArrowDown');
    assert.equal(w.document.activeElement, department(w, 'conversion'));
    department(w, 'partnerships').click();
    card(w, childId).click();
    department(w, 'partnerships').click();
    w.document.querySelector('#companyBack').click();
    assert.equal(w.document.activeElement.id, 'companyRoot', 'Back never focuses a child hidden by department collapse');
    search(w, 'Agency Follow-up Agent');
    family(w, parentId, childId);
    card(w, childId).click();
    search(w, 'YouTube');
    w.document.querySelector('#companyBack').click();
    assert.equal(w.document.activeElement.id, 'companyRoot', 'Back falls back when search removes the previous child');
  } finally { await h.close(); }
});

test('child search expands its full family temporarily and restores department collapse after clearing', async () => {
  const h = await harness();
  try {
    const {w} = h;
    for (const [departmentId, parentId, childId] of [
      ['partnerships', 'partners-agencies', 'agency-followup'],
      ['conversion', 'ecommerce-cro', 'ecommerce-cro-followup']
    ]) {
      department(w, departmentId).click();
      assert.ok(family(w, parentId, childId).closest('[hidden]'));
      const child = w.PRODUCT_AGENT_DATA.poptin.agents.find(agent => agent.id === childId);
      search(w, child.name);
      assert.equal(family(w, parentId, childId).closest('[hidden]'), null);
      assert.equal(department(w, departmentId).getAttribute('aria-expanded'), 'true');
      department(w, departmentId).click();
      assert.ok(family(w, parentId, childId).closest('[hidden]'));
      search(w, '');
      assert.equal(department(w, departmentId).getAttribute('aria-expanded'), 'false');
      assert.ok(family(w, parentId, childId).closest('[hidden]'));
    }
    clickProduct(w, 'chatway');
    assert.equal(w.document.querySelectorAll('#companyTree .followup-list').length, 0);
    assert.equal(w.document.querySelectorAll('#companyTree [data-agent-id]').length, 6);
    clickProduct(w, 'poptin');
    assert.equal(w.document.querySelectorAll('#companyTree .followup-list').length, 7);
    assert.equal(department(w, 'partnerships').getAttribute('aria-expanded'), 'false');
    assert.equal(department(w, 'conversion').getAttribute('aria-expanded'), 'false');
  } finally { await h.close(); }
});

test('refresh preserves a selected nested child, its search context, calendar choice, and one card per record', async () => {
  const h = await harness();
  try {
    const {w} = h;
    const childId = 'competitor-affiliate-followup';
    const parentId = 'competitor-affiliate-outreach';
    card(w, childId).click();
    const calendarCount = calendar(w, childId).length;
    assert.ok(calendarCount > 0);
    search(w, 'Competitor Affiliate Follow-up Agent');
    department(w, 'partnerships').click();
    for (let attempt = 0; attempt < 3; attempt++) {
      await w.loadLatestData();
      w.eval('data = window.PRODUCT_AGENT_DATA.poptin');
      w.renderDashboard();
      w.document.dispatchEvent(new w.CustomEvent('marketingActivityUpdated'));
      assert.equal(selectedId(w), childId);
      assert.equal(card(w, childId).getAttribute('aria-pressed'), 'true');
      assert.ok(family(w, parentId, childId).closest('[hidden]'), 'Refresh retains search-time collapse state');
      assert.equal(w.document.querySelector('#agentSearch').value, 'Competitor Affiliate Follow-up Agent');
      assert.equal(w.document.querySelector('#activityAgentFilter').value, childId);
      assert.equal(w.document.querySelector('#calendarAgentFilter').value, childId);
      assert.equal(w.document.querySelectorAll('.calendar-outcome').length, calendarCount);
      assert.equal(w.document.querySelectorAll('#companyTree [data-agent-id]').length, 2);
      assert.equal(w.PRODUCT_AGENT_DATA.poptin.agents.length, 30);
      assert.equal(w.PRODUCT_AGENT_DATA.all.agents.length, 45);
    }
    search(w, '');
    assert.equal(w.document.querySelectorAll('#companyTree [data-agent-id]').length, 30);
    assert.equal(w.document.querySelectorAll('#companyTree .followup-list').length, 7);
    w.selectMarketingProduct('all');
    assert.equal(selectedId(w), null, 'An unavailable concrete child ID returns to root on product switch');
    card(w, `poptin-${childId}`).click();
    assert.equal(selectedId(w), `poptin-${childId}`);
    assert.equal(w.document.querySelector('#activityAgentFilter').value, childId);
    assert.equal(w.document.querySelectorAll('#companyTree [data-agent-id]').length, 45);
    assert.ok(h.requests.every(request => request.method === 'GET'));
  } finally { await h.close(); }
});

test('Poptin workflow references are read-only details outside the operational inventory and calendar', async () => {
  const h = await harness();
  try {
    const {w} = h;
    assert.deepEqual(sorted(w.companyTree.workflowReferences.map(reference => reference.id)), ['interviews', 'monthly-updates']);
    const before = JSON.stringify(w.PRODUCT_AGENT_DATA);
    const references = [...w.document.querySelectorAll('#companyTree [data-workflow-reference]')];
    assert.deepEqual(sorted(references.map(reference => reference.dataset.workflowReference)), ['interviews', 'monthly-updates']);
    const requestsBefore = JSON.stringify(h.requests);
    const selectedBefore = selectedId(w);
    for (const reference of references) {
      assert.equal(reference.tagName, 'DETAILS');
      assert.equal(reference.closest('.department-agents').id, 'department-content');
      assert.equal(reference.querySelectorAll('[data-agent-id], button').length, 0, 'References expose no agent selection or execution buttons');
      assert.deepEqual(triggerModes(reference), reference.dataset.workflowReference === 'interviews' ? ['manual'] : ['manual', 'event'], 'Reference badges describe only the reviewed workflow triggers');
      assert.match(reference.textContent, /reference/i);
      const summary = reference.querySelector(':scope > summary');
      assert.ok(summary?.textContent.trim());
      summary.click();
      assert.equal(reference.open, true, 'Reference details expand natively');
      summary.click();
      assert.equal(reference.open, false);
    }
    await tick();
    assert.equal(JSON.stringify(h.requests), requestsBefore, 'Reading reference details never starts network work');
    assert.equal(selectedId(w), selectedBefore);
    assert.equal(JSON.stringify(w.PRODUCT_AGENT_DATA), before);
    assert.equal(w.document.querySelector('#agentCount').textContent, '30');
    assert.equal(w.document.querySelector('#statsGrid .stat-card strong').textContent.trim(), '30');
    assert.equal(w.document.querySelectorAll('#companyTree [data-agent-id]').length, 30);
    assert.equal(calendar(w, 'youtube-shorts').length, 4, 'Reference entries do not add calendar outcomes');
    const calendarAgentIds = [...w.document.querySelectorAll('#calendarAgentFilter option')].map(option => option.value);
    assert.deepEqual(sorted(calendarAgentIds.filter(id => id !== 'all')), sorted(inventory.poptin));
    const activityAgentIds = [...w.document.querySelectorAll('#activityAgentFilter option')].map(option => option.value);
    assert.deepEqual(sorted(activityAgentIds.filter(id => id !== 'all')), sorted(inventory.poptin));
    for (const referenceId of ['interviews', 'monthly-updates']) {
      w.companyTree.selectAgent(referenceId);
      assert.equal(selectedId(w), null, 'A reference cannot be selected as a real agent');
    }
  } finally { await h.close(); }
});

test('workflow references are scoped to Poptin and its aggregate context across product switches', async () => {
  const h = await harness();
  try {
    const {w} = h;
    for (const [productId, ids] of Object.entries(inventory)) {
      clickProduct(w, productId);
      const references = [...w.document.querySelectorAll('#companyTree [data-workflow-reference]')];
      assert.equal(references.length, productId === 'poptin' ? 2 : 0, `${productId} reference scope`);
      assert.equal(w.document.querySelectorAll('#companyTree [data-agent-id]').length, ids.length);
      assert.equal(Number(w.document.querySelector('#agentCount').textContent), ids.length);
    }
    w.selectMarketingProduct('all');
    const aggregateReferences = [...w.document.querySelectorAll('#companyTree [data-workflow-reference]')];
    assert.equal(aggregateReferences.length, 2);
    for (const reference of aggregateReferences) assert.match(reference.closest('.workflow-references').querySelector('.reference-eyebrow').textContent, /Poptin/i, 'Aggregate reference groups clearly identify their Poptin context');
    assert.equal(w.document.querySelectorAll('#companyTree [data-agent-id]').length, 45);
    assert.equal(w.document.querySelector('#agentCount').textContent, '45');
    assert.equal(w.PRODUCT_AGENT_DATA.all.agents.length, 45);
  } finally { await h.close(); }
});

test('monthly reference search exposes Content and SEO with zero matching operational agents', async () => {
  const h = await harness();
  try {
    const {w} = h;
    department(w, 'content').click();
    search(w, '  MONTHLY  ');
    assert.equal(w.document.querySelectorAll('#companyTree [data-agent-id]').length, 0);
    assert.equal(w.document.querySelector('#agentCount').textContent, '0');
    assert.deepEqual([...w.document.querySelectorAll('#companyTree [data-department]')].map(button => button.dataset.department), ['content']);
    assert.equal(department(w, 'content').getAttribute('aria-expanded'), 'true');
    const references = [...w.document.querySelectorAll('#companyTree [data-workflow-reference]')];
    assert.equal(references.length, 1);
    assert.equal(references[0].dataset.workflowReference, 'monthly-updates');
    assert.equal(references[0].closest('[hidden]'), null);
    assert.equal(w.document.querySelector('#companyTree [role="status"]'), null, 'A matching reference is a useful result, not an empty search');
    references[0].querySelector('summary').click();
    assert.equal(selectedId(w), null);
    search(w, '');
    assert.equal(department(w, 'content').getAttribute('aria-expanded'), 'false', 'The original department collapse state is restored');
    assert.equal(w.document.querySelectorAll('#companyTree [data-workflow-reference]').length, 2);
    assert.equal(w.document.querySelector('#agentCount').textContent, '30');
    clickProduct(w, 'chatway');
    search(w, 'monthly');
    assert.equal(w.document.querySelectorAll('#companyTree [data-workflow-reference]').length, 0);
    assert.ok(w.document.querySelector('#companyTree [role="status"]'), 'Other products do not surface Poptin reference matches');
    w.selectMarketingProduct('all');
    assert.equal(w.document.querySelectorAll('#companyTree [data-workflow-reference]').length, 1);
    assert.equal(w.document.querySelectorAll('#companyTree [data-agent-id]').length, 0);
    assert.equal(w.document.querySelector('#agentCount').textContent, '0');
  } finally { await h.close(); }
});

test('the local Codex reference panel remains separate from agents, triggers, activity, and calendar data', async () => {
  const h = await harness();
  try {
    const {w} = h;
    const panel = w.document.querySelector('#localAgentReferences');
    assert.ok(panel);
    assert.match(panel.textContent, /local|Codex/i);
    assert.match(panel.textContent, /reference/i);
    assert.equal(panel.closest('#companyTree'), null, 'The local reference panel is separate from the operational company tree');
    assert.equal(panel.querySelectorAll('[data-agent-id], [data-trigger], [data-workflow-reference]').length, 0);
    assert.equal(panel.querySelectorAll('button, input, select, iframe').length, 0, 'The reference panel has no connection, run, or credential controls');
    assert.ok(w.PRODUCT_AGENT_DATA.all.agents.every(agent => !/local.*codex|codex.*local/i.test(`${agent.id} ${agent.name}`)));
    assert.ok([...w.document.querySelectorAll('#activityAgentFilter option, #calendarAgentFilter option')].every(option => !/local.*codex|codex.*local/i.test(option.textContent)));
    const before = JSON.stringify(w.PRODUCT_AGENT_DATA);
    const requestsBefore = JSON.stringify(h.requests);
    panel.click();
    await tick();
    assert.equal(selectedId(w), null);
    assert.equal(JSON.stringify(h.requests), requestsBefore);
    assert.equal(JSON.stringify(w.PRODUCT_AGENT_DATA), before);
    assert.equal(w.PRODUCT_AGENT_DATA.poptin.agents.length, 30);
    assert.equal(w.PRODUCT_AGENT_DATA.all.agents.length, 45);
  } finally { await h.close(); }
});

test('four user-supplied local names are displayed literally without schedule or status inference', async () => {
  const h = await harness();
  try {
    const {w} = h;
    const names = ['2-days follow ups', 'Daily signed up enterprise demo outreach',
      'Daily popup/form creation draft - not published', 'Daily upgrade qualified users agent'];
    const panel = w.document.querySelector('#localAgentReferences');
    assert.deepEqual([...panel.querySelectorAll('.local-agent-list li')].map(item => item.textContent.trim()), names);
    assert.equal(panel.querySelectorAll('[data-trigger], .status-pill, .status-dot, [data-agent-id]').length, 0);
    assert.doesNotMatch(panel.textContent, /names pending|not been supplied/i);
    for (const name of names) {
      assert.equal(w.PRODUCT_AGENT_DATA.all.agents.some(agent => agent.name === name), false);
      assert.equal([...w.document.querySelectorAll('#activityAgentFilter option, #calendarAgentFilter option')].some(option => option.textContent === name), false);
    }
    for (const productId of Object.keys(inventory)) {
      clickProduct(w, productId);
      assert.deepEqual([...panel.querySelectorAll('.local-agent-list li')].map(item => item.textContent.trim()), names);
    }
    assert.equal(w.PRODUCT_AGENT_DATA.all.agents.length, 45);
    assert.ok(h.requests.every(request => request.method === 'GET'));
  } finally { await h.close(); }
});

test('quarterly benchmark is Poptin-only, disabled, truthful and survives refresh', async () => {
  const h = await harness();
  try {
    const {w} = h;
    card(w, 'quarterly-benchmark').click();
    const detail = w.document.querySelector('#agentDetail');
    assert.match(detail.textContent, /On demand — data required/);
    assert.match(detail.textContent, /only when the user requests it/);
    assert.match(detail.textContent, /separate quarterly reminder/i);
    assert.match(detail.textContent, /data connectors and publishing are unimplemented/i);
    assert.doesNotMatch(detail.textContent, /Q4 2026|January 1–7|first week|First planned report/);
    assert.match(detail.textContent, /Execution and publishing are not enabled/);
    assert.equal(detail.querySelectorAll('[data-trigger="scheduled"], [data-trigger="manual"], .publishing-workflow').length, 0);
    assert.equal(detail.querySelectorAll('[data-trigger="disabled"]').length, 1);
    const original = w.PRODUCT_AGENT_DATA.poptin.agents.find(a => a.id === 'quarterly-benchmark');
    assert.equal(original.activities.length, 0);
    assert.equal(original.status, 'on-demand-data-required');
    assert.equal(original.name, 'On-Demand Benchmark Report Agent');
    for (const product of ['chatway', 'chaty', 'prospero', 'premio']) {
      assert.equal(w.PRODUCT_AGENT_DATA[product].agents.some(a => a.id === original.id), false);
    }
    await w.eval('loadLatestData()');
    await w.eval('loadLatestData()');
    assert.equal(w.PRODUCT_AGENT_DATA.poptin.agents.filter(a => a.id === original.id).length, 1);
    assert.equal(w.PRODUCT_AGENT_DATA.all.agents.filter(a => a.activityGroupId === original.id).length, 1);
    assert.equal(w.PRODUCT_AGENT_DATA.poptin.agents.find(a => a.id === original.id).activities.length, 0);
    assert.ok(h.requests.every(request => request.method === 'GET'));
  } finally { await h.close(); }
});
