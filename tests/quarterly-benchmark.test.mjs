import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync, mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
const source = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const inventory = text => {const c = {window:{}}; vm.runInNewContext(text, c);return JSON.parse(JSON.stringify(c.window.AGENT_DATA));};
test('WordPress sync preserves benchmark definition and never attributes publications to it', () => {
  const temp = mkdtempSync(join(tmpdir(), 'benchmark-sync-'));
  try {
    for (const file of ['data.js', 'product-tabs.js']) writeFileSync(join(temp,file),source(file));
    writeFileSync(join(temp, 'mock-fetch.mjs'), `globalThis.fetch = async url => ({ok:true, json:async()=>String(url).startsWith('https://www.poptin.com/blog/wp-json/') ? [{id:999999999,status:'publish',date_gmt:'2026-10-08T00:00:00',link:'https://www.poptin.com/blog/offline-test-only/',title:{rendered:'Offline test fixture'}}] : []});`);
    const original = inventory(source('data.js')).agents.find(a=>a.id==='quarterly-benchmark');
    const run = () => execFileSync(process.execPath, ['--import', join(temp,'mock-fetch.mjs'),fileURLToPath(new URL('../scripts/sync-wordpress-posts.mjs',import.meta.url))], {cwd:temp, env:{...process.env,GITHUB_EVENT_PATH:''},timeout:10000});
    run();
    const first = readFileSync(join(temp,'data.js'),'utf8');
    const fresh=inventory(first);
    assert.deepEqual(fresh.agents.find(a=>a.id===original.id),original);
    assert.equal(fresh.agents.find(a=>a.id==='seo').activities.some(a=>a.wordpressPostId===999999999),true);
    run();
    assert.equal(readFileSync(join(temp,'data.js'),'utf8'),first);
  } finally {rmSync(temp,{recursive:true,force:true});}
});
