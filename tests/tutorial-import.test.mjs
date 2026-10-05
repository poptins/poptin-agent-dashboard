import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {importTutorialPublications} from '../scripts/sync-tutorial-publications.mjs';

const source = readFileSync(new URL('../publishing-agents.js',import.meta.url),'utf8');
const data = JSON.parse(source.split('window.PUBLISHING_AGENT_DATA = ')[1].split(';\n\nwindow.applyPublishingAgents')[0]);
const agent = data.agents.find(item=>item.id==='tutorial-video');
const catalog = {schema_version:1,agent_id:'tutorial-video',publications:agent.activities.map(event=>({
  video_id:new URL(event.url).searchParams.get('v'),youtube_url:event.url,title:event.title,
  publicationVerified:true,verified_at:event.date,date_basis:event.dateBasis,evidence_url:event.evidenceUrl,
  video_sha256:'PRIVATE_HASH_MUST_NOT_LEAK',raw_receipt:{token:'PRIVATE_TOKEN_MUST_NOT_LEAK'}
}))};

test('tutorial import is deterministic, private-field safe and retains history on partial imports',()=>{
  assert.equal(importTutorialPublications(source,catalog),source);
  assert.equal(importTutorialPublications(source,{...catalog,publications:catalog.publications.slice(0,1)}),source);
  assert.ok(!source.includes('PRIVATE_'));
  assert.equal(agent.activities.length,3);
  assert.deepEqual(agent.activities.map(event=>event.date),['2026-10-05T08:46:34Z','2026-10-05T07:08:14Z','2026-10-04T21:16:00Z']);
});

test('tutorial importer refuses unverified, malformed, duplicate or conflicting history',()=>{
  for(const patch of [{publicationVerified:false},{youtube_url:'javascript:alert(1)'},{verified_at:'2026-10-05'},{evidence_url:'https://example.com'},{title:'Different title'}]) {
    assert.throws(()=>importTutorialPublications(source,{...catalog,publications:[{...catalog.publications[0],...patch}]}));
  }
  assert.throws(()=>importTutorialPublications(source,{...catalog,publications:[catalog.publications[0],catalog.publications[0]]}));
});

test('WordPress sync cannot replace publishing module and runtime refresh reapplies it',()=>{
  const sync=readFileSync(new URL('../scripts/sync-wordpress-posts.mjs',import.meta.url),'utf8');
  assert.ok(!sync.includes('publishing-agents.js'));
  const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
  assert.match(app,/await loadDataScript\("publishing-agents.js"\)/);
});
