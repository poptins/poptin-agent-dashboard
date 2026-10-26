import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {runInNewContext, Script} from 'node:vm';
import {JSDOM, VirtualConsole} from 'jsdom';

// Calendar/schedule assertions use the UTC dates in the public CMS fixtures.
process.env.TZ = 'UTC';

const script = fileURLToPath(new URL('../scripts/sync-wordpress-posts.mjs', import.meta.url));
const endpoints = [
  'https://www.poptin.com/blog/wp-json/wp/v2/posts',
  'https://www.poptin.com/wp-json/wp/v2/popt_guide',
  'https://www.poptin.com/wp-json/wp/v2/popt_glossary',
  'https://chatway.app/wp-json/wp/v2/post',
  'https://chatway.app/wp-json/wp/v2/chatway_glossary',
  'https://chaty.app/wp-json/wp/v2/post',
  'https://premio.io/wp-json/wp/v2/posts',
  'https://goprospero.com/blog/wp-json/wp/v2/posts'
];
const poptinEndpoint = endpoints[2];
const chatwayEndpoint = endpoints[4];
// Public CMS records read on October 13, 2026; no raw receipts or private fields.
const poptinTerm = {
  id: 461539, date: '2026-10-13T17:09:07', date_gmt: '2026-10-13T14:09:07',
  slug: 'engagement-decay', status: 'publish',
  link: 'https://www.poptin.com/academy/glossary/engagement-decay/',
  title: {rendered: 'Engagement Decay'}
};
const chatwayTerm = {
  id: 6505, date: '2026-10-13T14:15:22', date_gmt: '2026-10-13T14:15:22',
  slug: 'post-purchase-support-signal', status: 'publish',
  link: 'https://chatway.app/glossary/post-purchase-support-signal',
  title: {rendered: 'Post-Purchase Support Signal'}
};
const historicalActivity = {
  type: 'past', status: 'Published', title: 'Keep existing history',
  date: '2026-07-01T10:00:00Z', url: 'https://example.invalid/history'
};
const card = id => ({id, name: id, instructions: ['Keep instructions'], activities: [historicalActivity]});
const initialPoptin = {
  source: 'poptins/poptin-agents', lastUpdated: '2026-10-12T10:00:00Z',
  agents: ['seo', 'academy', 'glossary', 'social', 'tutorial-video'].map(card)
};
const initialProducts = Object.fromEntries(
  ['chatway', 'chaty', 'premio', 'prospero'].map(id => [id, {
    source: `${id}-agents`, lastUpdated: '2026-10-12T10:00:00Z',
    agents: ['seo', 'glossary', 'social'].map(card)
  }])
);
const serialize = value => JSON.stringify(value, null, 2).replace(/"([A-Za-z]\w*)":/g, '$1:');
const activity = (data, id) => data.agents.find(agent => agent.id === id).activities;
const records = data => data.agents.flatMap(agent => agent.activities);

// Every request must match a fixture and the public GET contract. Production
// catch/process.exit cannot hide an unexpected call. No secrets are inherited.
const preloader = String.raw`
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync} from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import tls from 'node:tls';
import {syncBuiltinESMExports} from 'node:module';
const config = JSON.parse(readFileSync('responses.json', 'utf8'));
const requests = [];
const violations = [];
const exit = process.exit.bind(process);
const save = () => writeFileSync('requests.json', JSON.stringify({requests, violations}));
process.exit = code => { save(); exit(violations.length ? 97 : code); };
process.on('exit', save);
function forbidden(message) { violations.push(message); process.exit(97); }
for (const [object, names] of [
  [http, ['request', 'get']], [https, ['request', 'get']],
  [net, ['connect', 'createConnection']], [net.Socket.prototype, ['connect']],
  [tls, ['connect']]
]) for (const name of names) object[name] = () => forbidden('Unmocked network: ' + name);
syncBuiltinESMExports();
const timeout = globalThis.setTimeout;
globalThis.setTimeout = (fn, ms, ...args) => timeout(fn, ms === 5000 || ms === 10000 ? 0 : ms, ...args);
globalThis.fetch = async (input, options = {}) => {
  const url = new URL(input);
  const endpoint = url.origin + url.pathname;
  requests.push({endpoint, url: url.href, method: options.method || 'GET'});
  try {
    assert.ok(Object.hasOwn(config, endpoint), 'Unmocked endpoint: ' + endpoint);
    assert.equal(options.method || 'GET', 'GET');
    assert.deepEqual(Object.fromEntries(url.searchParams), {
      status: 'publish', per_page: '50', orderby: 'date', order: 'desc',
      _fields: 'id,date,date_gmt,link,slug,title,status'
    });
    assert.deepEqual(options.headers, {
      Accept: 'application/json', 'User-Agent': 'PoptinMarketingDashboardSync/1.0'
    });
    assert.ok(options.signal instanceof AbortSignal);
  } catch (error) { forbidden(error.message); }
  const response = config[endpoint];
  if (response.error) throw new Error(response.error);
  return {
    ok: !response.status || response.status === 200,
    status: response.status || 200, statusText: 'Fixture response',
    json: async () => structuredClone(response.payload)
  };
};
`;

function harness(t, options = {}) {
  const directory = mkdtempSync(join(tmpdir(), 'wordpress-sync-test-'));
  t.after(() => rmSync(directory, {recursive: true, force: true}));
  const poptin = structuredClone(options.poptin || initialPoptin);
  const products = structuredClone(options.products || initialProducts);
  const newline = options.newline || '\n';
  writeFileSync(join(directory, 'data.js'),
    options.dataSource ?? ('window.AGENT_DATA = ' + serialize(poptin) + ';\n').replaceAll('\n', newline));
  writeFileSync(join(directory, 'product-tabs.js'),
    options.productSource ?? ('window.PRODUCT_AGENT_DATA = {\n' + Object.entries(products).map(([id, product]) =>
      '    ' + id + ': ' + serialize(product).replaceAll('\n', '\n    ')).join(',\n') + '\n};\n').replaceAll('\n', newline));
  writeFileSync(join(directory, 'offline.mjs'), preloader);
  const read = () => ({
    data: readFileSync(join(directory, 'data.js'), 'utf8'),
    products: readFileSync(join(directory, 'product-tabs.js'), 'utf8')
  });
  const parse = () => {
    const window = {};
    const files = read();
    runInNewContext(files.data + '\n' + files.products, {window}, {timeout: 1000});
    return JSON.parse(JSON.stringify({poptin: window.AGENT_DATA, products: window.PRODUCT_AGENT_DATA}));
  };
  const run = (responses = {}, args = [script]) => {
    const config = Object.fromEntries(endpoints.map(endpoint => [endpoint, {payload: []}]));
    Object.assign(config, responses);
    writeFileSync(join(directory, 'responses.json'), JSON.stringify(config));
    const result = spawnSync(process.execPath,
      ['--import', pathToFileURL(join(directory, 'offline.mjs')).href, ...args], {
        cwd: directory, encoding: 'utf8', timeout: 10000, env: {PATH: process.env.PATH || ''}
      });
    const trace = JSON.parse(readFileSync(join(directory, 'requests.json'), 'utf8'));
    return {...result, ...trace};
  };
  return {run, read, parse};
}
const terms = () => ({
  [poptinEndpoint]: {payload: [poptinTerm]}, [chatwayEndpoint]: {payload: [chatwayTerm]}
});
function succeeded(result) {
  assert.equal(result.status, 0, result.stderr || result.error?.message);
  assert.deepEqual(result.violations, []);
}

test('public glossary receipts route once to their own cards and retain unrelated history', t => {
  const h = harness(t);
  const result = h.run({...terms(), [poptinEndpoint]: {payload: [poptinTerm, poptinTerm]}});
  succeeded(result);
  assert.deepEqual(result.requests.map(request => request.endpoint), endpoints);
  assert.match(result.stdout, /Added 2 WordPress publication\(s\) and 0 social/);
  const {poptin, products} = h.parse();
  for (const [data, record, source] of [
    [poptin, poptinTerm, 'poptin glossary'], [products.chatway, chatwayTerm, 'chatway glossary']
  ]) {
    const activities = activity(data, 'glossary');
    assert.equal(activities.length, 2);
    assert.equal(activities[0].url, record.link);
    assert.equal(activities[0].date, record.date_gmt + 'Z');
    assert.equal(activities[0].wordpressPostId, record.id);
    assert.equal(activities[0].publicationTaskId, source + '-wordpress-' + record.id);
    assert.equal(activities[0].publicationSource, source);
    assert.equal(activities[0].taskType, 'publication');
    assert.equal(activities[0].status, 'Published');
    assert.equal(activities[0].assetLabel, 'View glossary term');
    assert.match(activities[0].title, /Glossary term$/);
    assert.equal(records(data).filter(item => item.url === record.link).length, 1);
    assert.deepEqual(activities[1], historicalActivity);
  }
  assert.equal(records(poptin).some(item => item.url === chatwayTerm.link), false);
  assert.equal(records(products.chatway).some(item => item.url === poptinTerm.link), false);
  for (const agent of poptin.agents.filter(item => item.id !== 'glossary'))
    assert.deepEqual(agent, initialPoptin.agents.find(item => item.id === agent.id));
  for (const [id, product] of Object.entries(products))
    for (const agent of product.agents.filter(item => id !== 'chatway' || item.id !== 'glossary'))
      assert.deepEqual(agent, initialProducts[id].agents.find(item => item.id === agent.id));
});

test('identical retries are byte-identical and normalized existing URLs are not duplicated', t => {
  const h = harness(t, {newline: '\r\n'});
  succeeded(h.run(terms()));
  const first = h.read();
  assert.ok(first.data.includes('\r\n') && first.data.includes('        {\n'));
  succeeded(h.run(terms()));
  assert.deepEqual(h.read(), first);
  const existing = structuredClone(initialPoptin);
  activity(existing, 'glossary').push({...historicalActivity, url: poptinTerm.link.toUpperCase().replace(/\/$/, '')});
  const duplicate = harness(t, {poptin: existing});
  const before = duplicate.read();
  succeeded(duplicate.run({[poptinEndpoint]: {payload: [poptinTerm, poptinTerm]}}));
  assert.deepEqual(duplicate.read(), before);
});

test('glossary sources reject non-public statuses, invalid dates, old entries and wrong hosts/paths', t => {
  const h = harness(t);
  const before = h.read();
  const invalid = record => [
    ...['draft', 'private', 'trash', 'future', undefined].map(status => ({...record, status})),
    {...record, date_gmt: 'invalid'}, {...record, date_gmt: '', date: 'invalid'},
    {...record, date_gmt: '2026-07-29T23:59:59'},
    ...['http://', 'https://example.invalid/', 'https://www.poptin.com.evil.invalid/',
      'https://chatway.app.evil.invalid/', 'https://www.poptin.com/blog/wrong/',
      'https://chatway.app/blog/wrong/', 'javascript:alert(1)', '',
      record === poptinTerm ? chatwayTerm.link : poptinTerm.link].map(link => ({...record, link}))
  ];
  succeeded(h.run({[poptinEndpoint]: {payload: invalid(poptinTerm)}, [chatwayEndpoint]: {payload: invalid(chatwayTerm)}}));
  assert.deepEqual(h.read(), before);
});

test('same numeric IDs remain distinct across blog, guide, glossary and product sources', t => {
  const h = harness(t);
  const links = [
    'https://www.poptin.com/blog/collision/', 'https://www.poptin.com/academy/guides/collision/',
    'https://www.poptin.com/academy/glossary/collision/', 'https://chatway.app/blog/collision/',
    'https://chatway.app/glossary/collision/'
  ];
  succeeded(h.run(Object.fromEntries(endpoints.slice(0, 5).map((endpoint, index) =>
    [endpoint, {payload: [{...poptinTerm, id: 42, link: links[index]}]}]))));
  const {poptin, products} = h.parse();
  const imported = [...records(poptin), ...records(products.chatway)].filter(item => item.wordpressPostId === 42);
  assert.equal(imported.length, 5);
  assert.equal(new Set(imported.map(item => item.publicationTaskId)).size, 5);
  for (const [data, id, index] of [[poptin, 'seo', 0], [poptin, 'academy', 1], [poptin, 'glossary', 2],
    [products.chatway, 'seo', 3], [products.chatway, 'glossary', 4]]) assert.equal(activity(data, id)[0].url, links[index]);
});

test('partial glossary failure keeps history and still imports the healthy product', t => {
  const h = harness(t);
  succeeded(h.run({[poptinEndpoint]: {payload: [poptinTerm]}}));
  const prior = h.parse().poptin;
  const result = h.run({[poptinEndpoint]: {status: 503}, [chatwayEndpoint]: {payload: [chatwayTerm]}});
  succeeded(result);
  assert.equal(result.requests.filter(item => item.endpoint === poptinEndpoint).length, 3);
  assert.match(result.stderr, /Poptin Glossary sync unavailable/);
  assert.deepEqual(h.parse().poptin.agents, prior.agents);
  assert.equal(activity(h.parse().products.chatway, 'glossary')[0].url, chatwayTerm.link);
});

test('empty or wholly unavailable reads do not invent publications or update timestamps', t => {
  const h = harness(t);
  const before = h.read();
  succeeded(h.run());
  assert.deepEqual(h.read(), before);
  const result = h.run(Object.fromEntries(endpoints.map(endpoint => [endpoint, {error: 'Fixture unavailable'}])));
  succeeded(result);
  assert.equal(result.requests.length, endpoints.length * 3);
  assert.match(result.stderr, /All WordPress sources were temporarily unavailable/);
  assert.deepEqual(h.read(), before);
});

test('unsupported payloads retry without erasing data or blocking the other glossary', t => {
  for (const payload of [null, {}, {message: 'Unsupported fixture'}, {posts: {id: 1}}, 'invalid']) {
    const h = harness(t);
    const result = h.run({[poptinEndpoint]: {payload}, [chatwayEndpoint]: {payload: [chatwayTerm]}});
    succeeded(result);
    assert.match(result.stderr, /unsupported response shape/);
    assert.deepEqual(h.parse().poptin.agents, initialPoptin.agents);
    assert.equal(activity(h.parse().products.chatway, 'glossary')[0].url, chatwayTerm.link);
  }
});

test('supported collection wrappers and local date fallback keep the existing fetch contract', t => {
  for (const wrapper of ['posts', 'data', 'items']) {
    const h = harness(t);
    succeeded(h.run({
      [poptinEndpoint]: {payload: {[wrapper]: [{...poptinTerm, date_gmt: '', date: '2026-10-13T14:09:07Z'}]}},
      [chatwayEndpoint]: {payload: {[wrapper]: [chatwayTerm]}}
    }));
    assert.equal(activity(h.parse().poptin, 'glossary')[0].date, '2026-10-13T14:09:07Z');
    assert.equal(activity(h.parse().products.chatway, 'glossary')[0].url, chatwayTerm.link);
  }
});

test('only public projection fields survive, and hostile titles remain inert text', t => {
  const h = harness(t);
  const record = {...poptinTerm,
    title: {rendered: '&lt;img src=x onerror=alert(1)&gt; A &amp; B &quot;quoted&quot; &#39; \n "); globalThis.injected = true; //'},
    content: {rendered: 'PRIVATE_BODY_SENTINEL'}, token: 'PRIVATE_TOKEN_SENTINEL',
    receipt: {password: 'PRIVATE_RECEIPT_SENTINEL'}, author: 'PRIVATE_AUTHOR_SENTINEL'
  };
  succeeded(h.run({[poptinEndpoint]: {payload: [record]}}));
  const files = h.read();
  assert.doesNotMatch(files.data + files.products, /PRIVATE_(?:BODY|TOKEN|RECEIPT|AUTHOR)_SENTINEL/);
  const context = {window: {}};
  runInNewContext(files.data + '\n' + files.products, context, {timeout: 1000});
  assert.equal(context.injected, undefined);
  const imported = activity(h.parse().poptin, 'glossary')[0];
  assert.doesNotMatch(imported.detail, /<img|onerror/);
  assert.match(imported.detail, /A & B "quoted"/);
  assert.deepEqual(Object.keys(imported).sort(), [
    'type', 'status', 'taskType', 'title', 'detail', 'date', 'url', 'assetLabel',
    'wordpressPostId', 'publicationTaskId', 'publicationSource'
  ].sort());
});

test('offline guard fails closed on unmocked fetch and socket requests', t => {
  const h = harness(t);
  for (const code of [
    "await fetch('https://example.invalid/unmocked')",
    "import http from 'node:http'; http.get('https://example.invalid/unmocked')",
    "import net from 'node:net'; net.connect(443, 'example.invalid')"
  ]) {
    const result = h.run({}, ['--input-type=module', '-e', code]);
    assert.equal(result.status, 97);
    assert.equal(result.violations.length, 1);
  }
});

const dashboardSource = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const dashboardScripts = ['data.js', 'publishing-agents.js', 'trigger-metadata.js',
  'company-tree.js', 'app.js', 'product-tabs.js', 'preserve-agent-on-product-switch.js',
  'calendar-view.js', 'glossary-activity-links.js', 'optimization-opportunities.js'];
const glossaryTargets = [
  {product: 'poptin', endpoint: poptinEndpoint, term: poptinTerm},
  {product: 'chatway', endpoint: chatwayEndpoint, term: chatwayTerm}
];
const dashboardTick = () => new Promise(setImmediate);

async function glossaryDashboard(snapshot, liveFeed) {
  const source = file => file === 'data.js' ? snapshot.data
    : file === 'product-tabs.js' ? snapshot.products : dashboardSource(file);
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM(source('dashboard.html'), {
    url: 'https://dashboard.example/dashboard.html', runScripts: 'outside-only', virtualConsole
  });
  const {window: w} = dom;
  // Do not execute production auth or request external resources.
  w.document.querySelectorAll('script, link').forEach(element => element.remove());
  const RealDate = w.Date;
  w.Date = class extends RealDate {
    constructor(...args) { super(...(args.length ? args : ['2026-10-13T20:00:00Z'])); }
    static now() { return RealDate.parse('2026-10-13T20:00:00Z'); }
  };
  const requests = [];
  const unmockedNetwork = () => {
    errors.push('Unmocked browser network request');
    throw new Error(errors.at(-1));
  };
  w.XMLHttpRequest = w.WebSocket = w.EventSource = unmockedNetwork;
  w.navigator.sendBeacon = unmockedNetwork;
  w.fetch = async (url, options = {}) => {
    const method = options.method || 'GET';
    requests.push({url: String(url), method});
    assert.equal(method, 'GET', 'DOM fixture never permits writes');
    const parsed = new URL(url, 'https://dashboard.example/');
    const feed = glossaryTargets.find(target => target.endpoint === parsed.origin + parsed.pathname);
    if (!feed && parsed.href !== 'https://dashboard.example/dismissed-recommendations.json') {
      errors.push('Unmocked dashboard request: ' + url);
      throw new Error(errors.at(-1));
    }
    return {ok: true, status: 200, json: async () =>
      feed && liveFeed ? JSON.parse(JSON.stringify([feed.term])) : []};
  };
  const append = w.document.head.appendChild.bind(w.document.head);
  w.document.head.appendChild = element => {
    const result = append(element);
    if (element.tagName === 'SCRIPT') queueMicrotask(() => {
      try {
        const file = new URL(element.src).pathname.slice(1);
        assert.ok(dashboardScripts.includes(file), 'Unmocked dashboard script: ' + file);
        new Script(source(file), {filename: file}).runInContext(dom.getInternalVMContext());
        element.onload?.();
      } catch (error) { errors.push(error.message); element.onerror?.(error); }
    });
    return result;
  };
  const evaluate = file => new Script(source(file), {filename: file}).runInContext(dom.getInternalVMContext());
  for (const file of dashboardScripts) evaluate(file);
  await dashboardTick();
  return {w, errors, requests, evaluate, close: () => w.close()};
}

function verifyGlossaryOwners(w) {
  for (const {product, term} of glossaryTargets) {
    const owners = w.PRODUCT_AGENT_DATA[product].agents.filter(agent =>
      agent.activities.some(item => item.url === term.link));
    assert.equal(owners.length, 1);
    assert.equal(owners[0].id, 'glossary');
    assert.equal(owners[0].activities.filter(item => item.url === term.link).length, 1);
  }
  assert.equal(w.PRODUCT_AGENT_DATA.all.agents.length, 44);
}

function verifyGlossarySchedule(w) {
  assert.equal(w.sessionStorage.getItem('optimizationGithubToken'), null);
  for (const {product, term} of glossaryTargets) {
    const agent = w.PRODUCT_AGENT_DATA[product].agents.find(item => item.id === 'glossary');
    const receipt = agent.activities.find(item => item.url === term.link);
    assert.equal(receipt.assetLabel, 'View glossary term');
    const scheduled = agent.activities.find(item => item.type === 'scheduled');
    const state = w.scheduledActivityState(scheduled, agent);
    assert.equal(state.status, 'scheduled', `${product}: persisted receipt reconciles the UTC schedule`);
    assert.equal(state.date.toISOString(), '2026-10-14T06:15:00.000Z');
    // The label is also consumed by the existing no-token schedule reconciler.
    const incompatible = {...agent, activities: agent.activities.map(item => item === receipt
      ? {...item, assetLabel: `View ${product} glossary term`} : item)};
    assert.equal(w.scheduledActivityState(scheduled, incompatible).status, 'delayed');
  }
}

function verifyGlossaryCalendar(w) {
  if (w.document.querySelector('#calendarView').hidden)
    w.document.querySelector('#calendarViewButton').click();
  for (const [selector, value] of [['#calendarProductFilter', 'all'], ['#calendarAgentFilter', 'glossary']]) {
    const select = w.document.querySelector(selector);
    select.value = value;
    select.dispatchEvent(new w.Event('change', {bubbles: true}));
  }
  for (const {term} of glossaryTargets)
    assert.equal(w.document.querySelectorAll(`.calendar-outcome[href="${term.link}"]`).length, 1);
}

async function clickDashboardRefresh(h) {
  const button = h.w.document.querySelector('#refreshButton');
  // Respect the actual button's 1.4-second disabled interval between clicks.
  const deadline = Date.now() + 5000;
  while (button.disabled) {
    assert.ok(Date.now() < deadline, 'Refresh control did not become enabled');
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  const completed = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Refresh did not complete')), 3000);
    h.w.document.addEventListener('marketingActivityUpdated', () => {
      clearTimeout(timeout); resolve();
    }, {once: true});
  });
  button.click();
  await completed;
  await dashboardTick();
  assert.match(button.textContent, /Updated/);
}

function verifyGlossarySwitching(w) {
  if (!w.document.querySelector('#calendarView').hidden)
    w.document.querySelector('#calendarViewButton').click();
  w.document.querySelector('.product-tabs [data-product="poptin"]').click();
  w.document.querySelector('[data-agent-id="glossary"]').click();
  assert.ok(w.document.querySelector(`#agentDetail a[href="${poptinTerm.link}"]`));
  w.document.querySelector('.product-tabs [data-product="chatway"]').click();
  assert.equal(w.eval('selectedAgentId'), 'glossary');
  assert.ok(w.document.querySelector(`#agentDetail a[href="${chatwayTerm.link}"]`));
  // Aggregate selection uses the existing public helper; the current UI has
  // five product tabs and exposes All products through the calendar filter.
  w.selectMarketingProduct('all');
  assert.equal(w.document.querySelectorAll('#companyTree [data-agent-id]').length, 44);
  for (const {product, term} of glossaryTargets) {
    w.document.querySelector(`[data-agent-id="${product}-glossary"]`).click();
    assert.ok(w.document.querySelector(`#agentDetail a[href="${term.link}"]`));
  }
}

for (const liveFeed of [false, true]) {
  test(`synced glossary receipts survive UI refresh and product switching with live feed ${liveFeed ? 'present' : 'empty'}`, async t => {
    const sync = harness(t, {
      dataSource: dashboardSource('data.js'), productSource: dashboardSource('product-tabs.js')
    });
    succeeded(sync.run(terms()));
    const h = await glossaryDashboard(sync.read(), liveFeed);
    try {
      verifyGlossaryOwners(h.w);
      verifyGlossarySchedule(h.w);
      verifyGlossarySwitching(h.w);
      verifyGlossaryCalendar(h.w);
      for (let repeat = 0; repeat < 2; repeat++) {
        await clickDashboardRefresh(h);
        assert.equal(h.w.document.querySelector('#calendarAgentFilter').value, 'glossary');
        verifyGlossaryOwners(h.w);
        verifyGlossarySchedule(h.w);
        verifyGlossaryCalendar(h.w);
      }
      if (liveFeed) for (let repeat = 0; repeat < 2; repeat++) {
        h.evaluate('glossary-activity-links.js');
        await dashboardTick();
        verifyGlossaryOwners(h.w);
        verifyGlossaryCalendar(h.w);
      }
      verifyGlossarySwitching(h.w);
      assert.deepEqual(h.errors, []);
      assert.ok(h.requests.every(request => request.method === 'GET'));
    } finally { h.close(); }
  });
}
