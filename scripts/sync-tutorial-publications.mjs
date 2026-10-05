import {readFile, writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

// Offline, explicit import from the private agent catalog. Never fetch credentials,
// dispatch a publisher, or copy private receipt fields into this public dashboard.
export function tutorialAgent() {
  return {
    id: 'tutorial-video', name: 'Tutorial Video Agent',
    role: 'Step-by-step product tutorials · YouTube', initials: 'TV',
    status: 'manual', statusLabel: 'On demand · review required',
    color: '#e6e0ff', ink: '#56408c', owner: 'Poptin Video & Social',
    cadence: 'On demand · interactive capture and approval', priority: 'Medium',
    instructions: [
      'Start from a reviewed tutorial topic and verified product instructions.',
      'Capture the real product UI interactively; review each demonstrated step before rendering.',
      'Reuse the tutorial production pipeline for narration, timing, video and thumbnail preparation.',
      'Review the finished video and approve its destination before using the existing publishing workflow.',
      'Check publication history before uploading and record only confirmed public results.'
    ],
    statusNote: 'Reusable tutorial production with an interactive UI-capture handoff and manual review. No autonomous capture or automatic posting schedule. Historical tutorials below were published through the existing reviewed workflows.',
    manualPublishing: true,
    workflowUrl: 'https://github.com/poptins/poptin-agents/tree/main/tutorial-agent',
    workflowLabel: 'Review tutorial agent', activities: []
  };
}

function publication(record) {
  if (record.publicationVerified !== true) throw new Error('Publication must be verified');
  if (!/^[A-Za-z0-9_-]{11}$/.test(record.video_id || '')) throw new Error('Invalid video ID');
  const expected = `https://www.youtube.com/watch?v=${record.video_id}`;
  if (record.youtube_url !== expected) throw new Error('Video URL does not match ID');
  if (typeof record.title !== 'string' || !record.title.trim() || record.title.length > 200) throw new Error('Invalid public title');
  if (record.date_basis !== 'publication-confirmed') throw new Error('Explicit confirmation date basis required');
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(record.verified_at || '') || !Number.isFinite(Date.parse(record.verified_at))) throw new Error('Timezone-qualified confirmation timestamp required');
  if (!/^https:\/\/github\.com\/poptins\/poptin-agents\/actions\/runs\/\d+(?:\/attempts\/\d+)?$/.test(record.evidence_url || '')) throw new Error('Verified publication evidence URL required');
  return {
    type: 'past', status: 'Published', taskType: 'video-publication', publicationVerified: true,
    publicationTaskId: `YouTube video:${record.video_id}`, title: record.title,
    detail: 'Public YouTube publication and completed processing verified. Time shown is publication confirmation. Produced with interactive UI capture and review.',
    date: record.verified_at, dateBasis: 'publication-confirmed', url: expected,
    assetLabel: 'View YouTube tutorial', evidenceUrl: record.evidence_url
  };
}

export function importTutorialPublications(moduleText, catalog) {
  if (catalog.schema_version !== 1 || catalog.agent_id !== 'tutorial-video' || !Array.isArray(catalog.publications)) throw new Error('Unsupported tutorial catalog');
  const marker = 'window.PUBLISHING_AGENT_DATA = ';
  const start = moduleText.indexOf(marker) + marker.length;
  const end = moduleText.indexOf(';\n\nwindow.applyPublishingAgents', start);
  if (start < marker.length || end < 0) throw new Error('Publishing module structure not recognized');
  const data = JSON.parse(moduleText.slice(start, end));
  const previous = data.agents.find(agent => agent.id === catalog.agent_id);
  const agent = tutorialAgent();
  const events = new Map((previous?.activities || []).map(event => [event.publicationTaskId, event]));
  const incoming = new Set();
  for (const record of catalog.publications) {
    const event = publication(record);
    if (incoming.has(event.publicationTaskId)) throw new Error('Duplicate publication in catalog');
    incoming.add(event.publicationTaskId);
    const old = events.get(event.publicationTaskId);
    if (old && (old.url !== event.url || old.date !== event.date || old.title !== event.title)) throw new Error('Conflicting historical publication');
    if (data.agents.some(other => other.id !== agent.id && other.activities.some(item => item.publicationTaskId === event.publicationTaskId || item.url === event.url))) throw new Error('Publication already belongs to another agent');
    events.set(event.publicationTaskId, event);
  }
  agent.activities = [...events.values()].sort((a,b) => Date.parse(b.date) - Date.parse(a.date));
  data.agents = data.agents.filter(item => item.id !== agent.id);
  data.agents.splice(data.agents.findIndex(item => item.id === 'youtube-video') + 1, 0, agent);
  for (const event of agent.activities) if (Date.parse(event.date) > Date.parse(data.lastUpdated)) data.lastUpdated = event.date;
  return moduleText.slice(0,start) + JSON.stringify(data,null,2) + moduleText.slice(end);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.length !== 3) throw new Error('Usage: node scripts/sync-tutorial-publications.mjs /path/to/private/tutorial-agent/state/publications.json');
  const path = new URL('../publishing-agents.js', import.meta.url);
  const result = importTutorialPublications(await readFile(path,'utf8'), JSON.parse(await readFile(process.argv[2],'utf8')));
  await writeFile(path,result);
}
