import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';

const script = new URL('../scripts/sync-wordpress-posts.mjs', import.meta.url);
const sourceCount = [...readFileSync(script, 'utf8').matchAll(/endpoint: /g)].length;
const baseline = Object.fromEntries(['data.js', 'product-tabs.js'].map(name => [name, readFileSync(new URL(`../${name}`, import.meta.url), 'utf8')]));

function run({available = sourceCount, article = false, social = false} = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'wordpress-sync-status-'));
  try {
    for (const [name, body] of Object.entries(baseline)) writeFileSync(join(dir, name), body);
    // Intercept every request, including unexpected hosts. Never contact WordPress.
    const mock = join(dir, 'mock.mjs');
    writeFileSync(mock, `
      const urls = new Set();
      globalThis.fetch = async url => {
        const key = String(url).split('?')[0];
        urls.add(key);
        const index = [...urls].indexOf(key);
        if (index >= ${available}) return {ok:false,status:403,statusText:'Forbidden'};
        return {ok:true,json:async()=>${article} && index === 0 ? [{id:99999999,status:'publish',date_gmt:'2026-10-26T06:00:00',title:{rendered:'Fixture publication'},link:'https://www.poptin.com/blog/fixture-coverage-check/'}] : []};
      };
      globalThis.setTimeout = callback => { queueMicrotask(callback); return 0; };
    `);
    const event = join(dir, 'event.json');
    writeFileSync(event, JSON.stringify({client_payload: {socialPosts: social ? [{id:'fixture-social',title:'Fixture social event',sharedAt:'2026-10-26T06:00:00Z',url:'https://www.poptin.com/blog/fixture-social/'}] : []}}));
    const result = spawnSync(process.execPath, ['--import', mock, script.pathname], {cwd:dir, env:{PATH:process.env.PATH || '',GITHUB_EVENT_PATH:event},encoding:'utf8',timeout:10000});
    assert.equal(result.error, undefined);
    assert.equal(result.status, 0, result.stderr);
    return {...result, files:Object.fromEntries(Object.keys(baseline).map(name=>[name,readFileSync(join(dir,name),'utf8')]))};
  } finally { rmSync(dir, {recursive:true,force:true}); }
}

test('complete empty read reports verified coverage and preserves history', () => {
  const result = run();
  assert.match(result.stdout, /All WordPress sources checked; no new publications found/);
  assert.deepEqual(result.files, baseline);
});

test('all source failures report deferred, not synchronized, and preserve history', () => {
  const result = run({available:0});
  assert.match(result.stdout, new RegExp(`deferred: 0 of ${sourceCount} sources available`));
  assert.match(result.stderr, /publication coverage is unverified/);
  assert.doesNotMatch(result.stdout, /already synchronized|no new publications found/);
  assert.deepEqual(result.files, baseline);
});

test('partial empty read only makes claims about available sources', () => {
  const result = run({available:2});
  assert.match(result.stdout, new RegExp(`partial: 2 of ${sourceCount} sources checked`));
  assert.match(result.stdout, /Unavailable sources remain unverified/);
  assert.doesNotMatch(result.stdout, /already synchronized|All WordPress sources checked/);
  assert.deepEqual(result.files, baseline);
});

test('partial read retains valid additions without claiming full coverage', () => {
  const result = run({available:1,article:true});
  assert.match(result.stdout, /Added 1 WordPress publication/);
  assert.match(result.stdout, new RegExp(`coverage remains incomplete: 1 of ${sourceCount}`));
  assert.match(result.files['data.js'], /fixture-coverage-check/);
});

test('social events still reconcile when all WordPress feeds are unavailable', () => {
  const result = run({available:0,social:true});
  assert.match(result.stdout, /Added 0 WordPress publication\(s\) and 1 social/);
  assert.match(result.stdout, new RegExp(`coverage remains incomplete: 0 of ${sourceCount}`));
  assert.match(result.files['data.js'], /fixture-social/);
});
