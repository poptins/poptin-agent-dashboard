import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const context = {window: {}};
runInNewContext(readFileSync(new URL('../data.js', import.meta.url), 'utf8'), context);
const agents = context.window.AGENT_DATA.agents;
const agent = id => agents.find(item => item.id === id);
const scheduledText = id => agent(id).activities.filter(item => item.type === 'scheduled').map(item => `${item.title} ${item.detail}`).join(' ');

test('initial outreach descriptions match the approved 30/20/20/20 daily targets', () => {
  assert.match(agent('affiliate-outreach').instructions.join(' '), /30 eligible new contacts per Israel day/);
  assert.match(scheduledText('affiliate-outreach'), /target of 30 new contacts/);
  assert.match(agent('marketing-consultant-outreach').instructions.join(' '), /20 eligible new independent-consultant contacts per Israel day/);
  assert.match(scheduledText('marketing-consultant-outreach'), /20 verified independent consultants/);
  assert.match(agent('competitor-affiliate-outreach').instructions.join(' '), /20 eligible new editorial-publisher contacts per Israel day/);
  assert.match(scheduledText('competitor-affiliate-outreach'), /20 verified editorial publishers/);
  assert.match(agent('ecommerce-cro').instructions.join(' '), /20 eligible new independent ecommerce stores per Israel day/);
  assert.match(scheduledText('ecommerce-cro'), /20 ecommerce CRO reviews/);
});

test('current target descriptions are mode-neutral and do not promise daily output', () => {
  for (const id of ['affiliate-outreach', 'marketing-consultant-outreach', 'competitor-affiliate-outreach', 'ecommerce-cro']) {
    const instructions = agent(id).instructions.join(' ');
    assert.match(instructions, /actual output depends on qualification and remaining capacity/i);
    assert.doesNotMatch(instructions + ' ' + scheduledText(id), /never send|drafts only|review.only|automatically|manual runs and partial-failure retries/i);
  }
});

test('historical competitor counts remain 1 of 10 and 2 of 10', () => {
  const history = agent('competitor-affiliate-outreach').activities.filter(item => item.type === 'past');
  const first = history.find(item => item.url.endsWith('/35263495379'));
  const retry = history.find(item => item.url.endsWith('/35265137736'));
  assert.equal(first.detail, 'The first production run created 1 of 10 targeted drafts after prospect and contact checks. No initial email was sent.');
  assert.equal(retry.detail, 'A same-day retry checked the 10-draft Israel-day cap, found 1 existing draft, and created 1 more. The total is 2 of 10; no initial email was sent.');
});
