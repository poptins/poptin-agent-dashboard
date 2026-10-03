import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {Script} from 'node:vm';

const source = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const ids = ['youtube-shorts','youtube-video','instagram-reels','instagram-stories','facebook-stories'];
const files = ['data.js','publishing-agents.js','app.js','product-tabs.js','preserve-agent-on-product-switch.js','calendar-view.js'];
async function harness({runs = [], token = false} = {}) {
  const dom = new JSDOM(source('dashboard.html'), {url:'https://dashboard.example/dashboard.html',runScripts:'outside-only'});
  const {window:w} = dom;
  const RealDate = w.Date;
  w.Date = class extends RealDate {
    constructor(...args) { super(...(args.length ? args : ['2026-10-03T20:00:00Z'])); }
    static now() { return RealDate.parse('2026-10-03T20:00:00Z'); }
  };
  const requests = [];
  w.fetch = async (url, options = {}) => {
    requests.push({url, method: options.method || 'GET'});
    return {ok:true,status:200,json: async () => String(url).includes('/actions/runs') ? {workflow_runs:runs} : []};
  };
  if (token) w.sessionStorage.setItem('optimizationGithubToken','fixture-token');
  const append = w.document.head.appendChild.bind(w.document.head);
  w.document.head.appendChild = element => {
    const result = append(element);
    if (element.tagName === 'SCRIPT') queueMicrotask(() => {
      try {new Script(source(new URL(element.src).pathname.slice(1))).runInContext(dom.getInternalVMContext());element.onload?.();}
      catch (error) {element.onerror?.(error);}
    });
    return result;
  };
  for(const file of files) new Script(source(file),{filename:file}).runInContext(dom.getInternalVMContext());
  await new Promise(setImmediate);
  return {w,dom,requests,close:async()=>{await new Promise(setImmediate);w.close();}};
}
function select(w,selector,value) {const e=w.document.querySelector(selector);e.value=value;e.dispatchEvent(new w.Event('change',{bubbles:true}));}
function calendar(w,id) {
  if(w.document.querySelector('#calendarView').hidden) w.document.querySelector('#calendarViewButton').click();
  select(w,'#calendarProductFilter','poptin');select(w,'#calendarAgentFilter',id);
  return [...w.document.querySelectorAll('.calendar-outcome')];
}

// These are source-grounded snapshot expectations, not simulated publication receipts.
test('five approval-led publishers, eleven verified public outcomes, no invented schedules', async () => {
 const h=await harness();try {
  const agents=h.w.PRODUCT_AGENT_DATA.poptin.agents.filter(a=>ids.includes(a.id));
  assert.equal(agents.length,5);assert.equal(agents.flatMap(a=>a.activities).length,11);
  assert.ok(agents.every(a=>a.manualPublishing && a.activities.every(x=>x.type==='past')));
  const events=agents.flatMap(a=>a.activities);assert.equal(new Set(events.map(e=>e.publicationTaskId)).size,11);
  for(const event of events) {
   assert.equal(event.publicationVerified,true);assert.ok(['publication-confirmed','platform-published','platform-created'].includes(event.dateBasis));
   assert.ok(Number.isFinite(new Date(event.date).getTime()));assert.equal(new URL(event.url).protocol,'https:');
   assert.ok(!/token|caption|sha256|account_id|upload_uri|password/i.test(Object.keys(event).join(' ')));
  }
  for(const a of agents.filter(a=>a.id.includes('instagram'))) assert.equal(a.status,'manual');
  assert.equal(agents.find(a=>a.id==='facebook-stories').status,'manual');
 }finally{await h.close();}
});

test('agent cards expose readiness and safe review links without dispatch controls',async()=>{
 const h=await harness();try {
  for(const id of ids){h.w.document.querySelector(`[data-agent-id="${id}"]`).click();
   const card=h.w.document.querySelector('#agentDetail');assert.match(card.textContent,/No automatic schedule/);
   assert.equal(card.querySelectorAll('button').length,0);assert.match(card.querySelector('.publishing-workflow').href,/^https:\/\/github.com\/poptins\/poptin-agents\//);
  }
  assert.ok(h.requests.every(r=>r.method==='GET'));
 }finally{await h.close();}
});

test('calendar includes verified outcomes for all five publishing formats',async()=>{
 const h=await harness();try {
  for(const [id,count] of [['youtube-shorts',3],['youtube-video',1],['instagram-reels',5],['instagram-stories',1],['facebook-stories',1]]) assert.equal(calendar(h.w,id).length,count,id);
 }finally{await h.close();}
});

test('repeated refresh, calendar selection and product switching keep exactly one copy',async()=>{
 const h=await harness();try {
  const w=h.w;calendar(w,'instagram-reels');const allCount=w.PRODUCT_AGENT_DATA.all.agents.length;
  for(let i=0;i<2;i++) {
   await w.loadLatestData();w.eval('data = window.PRODUCT_AGENT_DATA.poptin');w.renderDashboard();w.document.dispatchEvent(new w.CustomEvent('marketingActivityUpdated'));
   assert.equal(w.PRODUCT_AGENT_DATA.poptin.agents.filter(a=>ids.includes(a.id)).length,5);
   assert.equal(w.PRODUCT_AGENT_DATA.all.agents.length,allCount);
   assert.equal(w.PRODUCT_AGENT_DATA.all.agents.filter(a=>a.manualPublishing).length,5);
   assert.equal(w.document.querySelector('#calendarAgentFilter').value,'instagram-reels');
   assert.equal(w.document.querySelectorAll('.calendar-outcome').length,5);
  }
  w.selectMarketingProduct('chatway');await w.loadLatestData();assert.equal(w.AGENT_DATA.source,'poptins/chatway-agents');
  w.selectMarketingProduct('poptin');assert.equal(w.document.querySelectorAll('[data-agent-id="instagram-reels"]').length,1);
  const all=w.PRODUCT_AGENT_DATA.all;assert.ok(w.allActivities(all).filter(a=>a.agent.manualPublishing).every(a=>a.source==='poptins/poptin-agents'));
  assert.ok(all.agents.every(a=>!a.name.includes('undefined')));
 }finally{await h.close();}
});

test('authenticated workflow reconciliation excludes aggregate endpoint and is not publication evidence',async()=>{
 const h=await harness({runs:[{id:99,name:'Shorts agent - publish approved Poptin upbeat Reel',path:'.github/workflows/shorts-preview.yml',head_branch:'publish/september-updates-20261003',created_at:'2026-10-03T15:00:00Z',updated_at:'2026-10-03T15:01:00Z',status:'completed',conclusion:'success',html_url:'https://github.com/poptins/poptin-agents/actions/runs/99'}]});
 try {
  h.w.sessionStorage.setItem('optimizationGithubToken','fixture-token');await h.w.mergeRecentGithubActivity();await h.w.mergeRecentGithubActivity();
  const agent=h.w.PRODUCT_AGENT_DATA.poptin.agents.find(a=>a.id==='youtube-video');
  assert.equal(agent.activities.filter(a=>a.githubRunId===99).length,1);assert.equal(agent.activities.find(a=>a.githubRunId===99).status,'Completed');
  assert.equal(calendar(h.w,'youtube-video').length,1);
  assert.ok(h.requests.every(r=>!r.url.includes('all product repositories')));assert.ok(h.requests.every(r=>r.method==='GET'));
 }finally{await h.close();}
});

test('unverified video receipt and unsafe links cannot become public calendar outcomes',async()=>{
 const h=await harness();try {
  const agent=h.w.PRODUCT_AGENT_DATA.poptin.agents.find(a=>a.id==='instagram-stories');
  agent.activities=[];
  for(const event of [
   {publicationVerified:false,url:'https://www.instagram.com/stories/popt.in/123/'},
   {publicationVerified:true,url:'javascript:alert(1)'},
   {publicationVerified:true,url:''},
   {publicationVerified:true,url:'https://github.com/poptins/poptin-agents/actions/runs/123'}
  ]) agent.activities.push({type:'past',status:'Published',taskType:'video-publication',date:'2026-10-03T16:00:00Z',title:'Unverified',...event});
  assert.equal(calendar(h.w,'instagram-stories').length,0);
  assert.equal(h.w.safeExternalUrl('javascript:alert(1)'),'');
 }finally{await h.close();}
});

test('expired Stories retain historical calendar outcomes without stale clickable links',async()=>{
 const h=await harness();try {
  const agent=h.w.PRODUCT_AGENT_DATA.poptin.agents.find(a=>a.id==='instagram-stories');
  agent.activities=[];
  agent.activities.push({type:'past',status:'Published',taskType:'video-publication',publicationVerified:true,date:'2026-10-01T12:00:00Z',expiresAt:'2026-10-02T12:00:00Z',url:'https://www.instagram.com/stories/popt.in/123/',title:'Published Story'});
  const items=calendar(h.w,'instagram-stories');assert.equal(items.length,1);assert.match(items[0].textContent,/expired/);assert.equal(items[0].tagName,'DIV');
 }finally{await h.close();}
});

test('activity rendering escapes source text and keeps other-product data intact',async()=>{
 const h=await harness();try {
  const w=h.w;const before=w.PRODUCT_AGENT_DATA.chatway.agents.length;w.applyPublishingAgents(w.PRODUCT_AGENT_DATA.chatway);assert.equal(w.PRODUCT_AGENT_DATA.chatway.agents.length,before);
  const agent=w.PRODUCT_AGENT_DATA.poptin.agents.find(a=>a.id==='instagram-reels');agent.activities.unshift({type:'past',date:'2026-10-03T16:00:00Z',title:'<img src=x onerror=alert(1)>',detail:'<script>alert(1)</script>',url:'javascript:alert(1)'});
  w.renderTimeline();assert.equal(w.document.querySelectorAll('#activityTimeline script, #activityTimeline img').length,0);assert.match(w.document.querySelector('#activityTimeline').textContent,/<script>/);
 }finally{await h.close();}
});


test('switching product during the publishing refresh never replaces Poptin with another product',async()=>{
 const h=await harness();try {
  const w=h.w;const load=w.loadDataScript;
  w.loadDataScript=async path=>{if(path==='publishing-agents.js') w.selectMarketingProduct('chatway');await load(path);};
  const current=await w.loadLatestData();
  assert.equal(current.source,'poptins/chatway-agents');
  assert.equal(w.PRODUCT_AGENT_DATA.poptin.source,'poptins/poptin-agents');
  assert.equal(w.PRODUCT_AGENT_DATA.poptin.agents.filter(a=>a.manualPublishing).length,5);
  assert.equal(w.PRODUCT_AGENT_DATA.chatway.agents.filter(a=>a.manualPublishing).length,0);
 }finally{await h.close();}
});


test('all-product publisher selection preserves a valid format filter',async()=>{
 const h=await harness();try {
  const w=h.w;w.selectMarketingProduct('all');
  w.document.querySelector('[data-agent-id="poptin-youtube-shorts"]').click();
  assert.equal(w.document.querySelector('#activityAgentFilter').value,'youtube-shorts');
  assert.equal(w.document.querySelectorAll('#activityTimeline .activity-card').length,3);
 }finally{await h.close();}
});


test('Facebook Story retains verified evidence and qualifies estimated expiry',async()=>{
 const h=await harness();try {
  const w=h.w;const agent=w.PRODUCT_AGENT_DATA.poptin.agents.find(a=>a.id==='facebook-stories');
  const event=agent.activities[0];
  assert.equal(event.date,'2026-10-03T19:03:58Z');
  assert.equal(event.dateBasis,'platform-created');
  assert.equal(event.publicationVerifiedAt,'2026-10-03T19:12:57Z');
  assert.equal(event.publicationAcceptedAt,'2026-10-03T19:04:00.546060Z');
  assert.equal(event.platformCreatedAt,'2026-10-03T19:03:58Z');
  assert.equal(event.expiryEstimated,true);
  assert.equal(event.expiresAt,'2026-10-04T19:03:58Z');
  assert.match(agent.statusNote,/displayed label has not been independently verified/);
  assert.match(event.url,/^https:\/\/facebook\.com\/stories\//);
  event.expiresAt='2026-10-02T19:03:58Z';
  const items=calendar(w,'facebook-stories');
  assert.equal(items.length,1);assert.match(items[0].textContent,/expected expiry passed/);
  assert.equal(items[0].tagName,'DIV');
  assert.match(w.renderAsset(event),/Expected Story expiry passed/);
 }finally{await h.close();}
});
