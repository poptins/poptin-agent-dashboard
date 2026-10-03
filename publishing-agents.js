// Public-safe agent descriptions and verified public outcomes only.
// Never place raw private receipts, credentials, signed asset URLs or drafts here.
window.PUBLISHING_AGENT_DATA = {
  "source": "poptins/poptin-agents",
  "lastUpdated": "2026-10-03T19:12:57Z",
  "agents": [
    {
      "id": "youtube-shorts",
      "name": "YouTube Shorts Agent",
      "role": "Short-form video · YouTube",
      "initials": "YS",
      "status": "manual",
      "statusLabel": "Manual · approval required",
      "color": "#ffe3df",
      "ink": "#8b322a",
      "owner": "Poptin Video & Social",
      "cadence": "On demand · no automatic posting",
      "priority": "Medium",
      "instructions": [
        "Start with the reviewed video and the exact approved destination.",
        "Require separate approval for each public publication; never infer permission from a previous post.",
        "Check existing publication state before sending media to prevent duplicate uploads.",
        "Record publication only after the platform confirms the final public result."
      ],
      "statusNote": "YouTube Shorts publishing is verified. Only confirmed publications with timestamps are shown; older pending checkpoints are excluded.",
      "manualPublishing": true,
      "workflowUrl": "https://github.com/poptins/poptin-agents/blob/publish/agents-api-20261003/.github/workflows/shorts-preview.yml",
      "workflowLabel": "Review publishing workflow",
      "activities": [
        {
          "type": "past",
          "status": "Published",
          "taskType": "video-publication",
          "publicationVerified": true,
          "publicationTaskId": "YouTube Short:SBO0iyBRgAQ",
          "title": "Published AI agents API Short",
          "detail": "Public publication confirmed by the publishing workflow. Time shown is the confirmation time.",
          "date": "2026-10-03T06:08:45Z",
          "dateBasis": "publication-confirmed",
          "url": "https://www.youtube.com/shorts/SBO0iyBRgAQ",
          "assetLabel": "View YouTube Short",
          "evidenceUrl": "https://github.com/poptins/poptin-agents/actions/runs/37101978489"
        },
        {
          "type": "past",
          "status": "Published",
          "taskType": "video-publication",
          "publicationVerified": true,
          "publicationTaskId": "YouTube Short:M4RBRcLFyFc",
          "title": "Published Poptin upbeat Short",
          "detail": "Public publication confirmed by the publishing workflow. Time shown is the confirmation time.",
          "date": "2026-10-02T10:45:43Z",
          "dateBasis": "publication-confirmed",
          "url": "https://www.youtube.com/shorts/M4RBRcLFyFc",
          "assetLabel": "View YouTube Short",
          "evidenceUrl": "https://github.com/poptins/poptin-agents/actions/runs/36995718688"
        },
        {
          "type": "past",
          "status": "Published",
          "taskType": "video-publication",
          "publicationVerified": true,
          "publicationTaskId": "YouTube Short:_jG-2G3nRE0",
          "title": "Published Shopify integration Short",
          "detail": "Public publication confirmed by the publishing workflow. Time shown is the confirmation time.",
          "date": "2026-10-02T08:44:29Z",
          "dateBasis": "publication-confirmed",
          "url": "https://www.youtube.com/shorts/_jG-2G3nRE0",
          "assetLabel": "View YouTube Short",
          "evidenceUrl": "https://github.com/poptins/poptin-agents/actions/runs/36985723908"
        }
      ]
    },
    {
      "id": "youtube-video",
      "name": "YouTube Video Agent",
      "role": "Landscape product videos · YouTube",
      "initials": "YV",
      "status": "manual",
      "statusLabel": "Manual · approval required",
      "color": "#ffe9d8",
      "ink": "#885521",
      "owner": "Poptin Video & Social",
      "cadence": "On demand · no automatic posting",
      "priority": "Medium",
      "instructions": [
        "Start with the reviewed video and the exact approved destination.",
        "Require separate approval for each public publication; never infer permission from a previous post.",
        "Check existing publication state before sending media to prevent duplicate uploads.",
        "Record publication only after the platform confirms the final public result."
      ],
      "statusNote": "Produces reviewed long-form landscape videos, chapters, narration and thumbnails. Public publication is confirmed.",
      "manualPublishing": true,
      "workflowUrl": "https://github.com/poptins/poptin-agents/blob/publish/september-updates-20261003/.github/workflows/shorts-preview.yml",
      "workflowLabel": "Review publishing workflow",
      "activities": [
        {
          "type": "past",
          "status": "Published",
          "taskType": "video-publication",
          "publicationVerified": true,
          "publicationTaskId": "YouTube video:Xm2pNFWOxuU",
          "title": "Published September 2026 product update video",
          "detail": "Public publication confirmed by the publishing workflow. Time shown is the confirmation time.",
          "date": "2026-10-03T10:06:11Z",
          "dateBasis": "publication-confirmed",
          "url": "https://www.youtube.com/watch?v=Xm2pNFWOxuU",
          "assetLabel": "View YouTube video",
          "evidenceUrl": "https://github.com/poptins/poptin-agents/actions/runs/37115171124"
        }
      ]
    },
    {
      "id": "instagram-reels",
      "name": "Instagram Reels Agent",
      "role": "Short-form video · Instagram",
      "initials": "IR",
      "status": "manual",
      "statusLabel": "Manual · approval required",
      "color": "#f5def0",
      "ink": "#853268",
      "owner": "Poptin Video & Social",
      "cadence": "On demand · no automatic posting",
      "priority": "Medium",
      "instructions": [
        "Start with the reviewed video and the exact approved destination.",
        "Require separate approval for each public publication; never infer permission from a previous post.",
        "Check existing publication state before sending media to prevent duplicate uploads.",
        "Record publication only after the platform confirms the final public result."
      ],
      "statusNote": "Five Reels have verified public results. The Meta connection was renewed; every new publication still requires approval.",
      "manualPublishing": true,
      "workflowUrl": "https://github.com/poptins/poptin-agents/blob/publish/instagram-shorts-20261003/.github/workflows/shorts-preview.yml",
      "workflowLabel": "Review publishing workflow",
      "activities": [
        {
          "type": "past",
          "status": "Published",
          "taskType": "video-publication",
          "publicationVerified": true,
          "publicationTaskId": "Instagram Reel:DeCStVfANsM",
          "title": "Published BFCM Reel",
          "detail": "Public publication confirmed by the publishing workflow. Time shown is the confirmation time.",
          "date": "2026-10-03T14:39:13Z",
          "dateBasis": "publication-confirmed",
          "url": "https://www.instagram.com/reel/DeCStVfANsM/",
          "assetLabel": "View Instagram Reel",
          "evidenceUrl": "https://github.com/poptins/poptin-agents/actions/runs/37130088327"
        },
        {
          "type": "past",
          "status": "Published",
          "taskType": "video-publication",
          "publicationVerified": true,
          "publicationTaskId": "Instagram Reel:DeCSmXPgAKX",
          "title": "Published AI agents API Reel",
          "detail": "Public publication confirmed by the publishing workflow. Time shown is the confirmation time.",
          "date": "2026-10-03T14:38:15Z",
          "dateBasis": "publication-confirmed",
          "url": "https://www.instagram.com/reel/DeCSmXPgAKX/",
          "assetLabel": "View Instagram Reel",
          "evidenceUrl": "https://github.com/poptins/poptin-agents/actions/runs/37130088327"
        },
        {
          "type": "past",
          "status": "Published",
          "taskType": "video-publication",
          "publicationVerified": true,
          "publicationTaskId": "Instagram Reel:DeCSgB4AFE0",
          "title": "Published Poptin upbeat Reel",
          "detail": "Public publication confirmed by the publishing workflow. Time shown is the confirmation time.",
          "date": "2026-10-03T14:37:18Z",
          "dateBasis": "publication-confirmed",
          "url": "https://www.instagram.com/reel/DeCSgB4AFE0/",
          "assetLabel": "View Instagram Reel",
          "evidenceUrl": "https://github.com/poptins/poptin-agents/actions/runs/37130088327"
        },
        {
          "type": "past",
          "status": "Published",
          "taskType": "video-publication",
          "publicationVerified": true,
          "publicationTaskId": "Instagram Reel:DeCSZGRAIXw",
          "title": "Published Shopify integration Reel",
          "detail": "Public publication confirmed by the publishing workflow. Time shown is the confirmation time.",
          "date": "2026-10-03T14:36:25Z",
          "dateBasis": "publication-confirmed",
          "url": "https://www.instagram.com/reel/DeCSZGRAIXw/",
          "assetLabel": "View Instagram Reel",
          "evidenceUrl": "https://github.com/poptins/poptin-agents/actions/runs/37130088327"
        },
        {
          "type": "past",
          "status": "Published",
          "taskType": "video-publication",
          "publicationVerified": true,
          "publicationTaskId": "Instagram Reel:DeCQCT8gNuG",
          "title": "Published original API launch Reel",
          "detail": "Public publication confirmed by the publishing workflow. Time shown is the confirmation time.",
          "date": "2026-10-03T14:15:47Z",
          "dateBasis": "publication-confirmed",
          "url": "https://www.instagram.com/reel/DeCQCT8gNuG/",
          "assetLabel": "View Instagram Reel",
          "evidenceUrl": "https://github.com/poptins/poptin-agents/actions/runs/37128926048"
        }
      ]
    },
    {
      "id": "instagram-stories",
      "name": "Instagram Stories Agent",
      "role": "24-hour video stories · Instagram",
      "initials": "IS",
      "status": "manual",
      "statusLabel": "Manual · approval required",
      "color": "#eee0fb",
      "ink": "#68408b",
      "owner": "Poptin Video & Social",
      "cadence": "On demand · no automatic posting",
      "priority": "Medium",
      "instructions": [
        "Start with the reviewed video and the exact approved destination.",
        "Require separate approval for each public publication; never infer permission from a previous post.",
        "Check existing publication state before sending media to prevent duplicate uploads.",
        "Record publication only after the platform confirms the final public result."
      ],
      "statusNote": "The BFCM Story is verified. Stories remain visible for approximately 24 hours; the calendar keeps their publication history after expiry.",
      "manualPublishing": true,
      "workflowUrl": "https://github.com/poptins/poptin-agents/blob/publish/instagram-shorts-20261003/.github/workflows/shorts-preview.yml",
      "workflowLabel": "Review publishing workflow",
      "activities": [
        {
          "type": "past",
          "status": "Published",
          "taskType": "video-publication",
          "publicationVerified": true,
          "publicationTaskId": "instagram-story:3999905595335451754",
          "title": "Published BFCM Instagram Story",
          "detail": "Verified as an active Instagram Story. Expected to expire approximately 24 hours after publication.",
          "date": "2026-10-03T16:45:59Z",
          "dateBasis": "platform-published",
          "expiresAt": "2026-10-04T16:45:59Z",
          "url": "https://www.instagram.com/stories/popt.in/3999905595335451754",
          "assetLabel": "View Instagram Story",
          "evidenceUrl": "https://github.com/poptins/poptin-agents/actions/runs/37137960263"
        }
      ]
    },
    {
      "id": "facebook-stories",
      "name": "Facebook Stories Agent",
      "role": "24-hour page stories · Facebook",
      "initials": "FS",
      "status": "manual",
      "statusLabel": "Manual · approval required",
      "color": "#dceaff",
      "ink": "#285590",
      "owner": "Poptin Video & Social",
      "cadence": "On demand · no automatic posting",
      "priority": "Medium",
      "instructions": [
        "Start with the reviewed video and the exact approved destination.",
        "Require separate approval for each public publication; never infer permission from a previous post.",
        "Check existing publication state before sending media to prevent duplicate uploads.",
        "Record publication only after the platform confirms the final public result."
      ],
      "statusNote": "The BFCM Facebook Story is verified as published and ready. Future posts still require approval. Native AI disclosure was sent; the displayed label has not been independently verified.",
      "manualPublishing": true,
      "workflowUrl": "https://github.com/poptins/poptin-agents/actions/runs/37147077989",
      "workflowLabel": "Review publication verification",
      "activities": [
        {
          "type": "past",
          "status": "Published",
          "taskType": "video-publication",
          "publicationVerified": true,
          "publicationTaskId": "facebook-story:990423010748826",
          "title": "Published BFCM Facebook Story",
          "detail": "Story creation time is 19:03:58 UTC. Facebook accepted publication at 19:04 UTC; published/ready state was verified at 19:12 UTC. Expected expiry is around October 4 at 19:04 UTC, based on the usual 24-hour duration, not an exact API expiry. Native AI disclosure was sent; its displayed label is not independently verified.",
          "date": "2026-10-03T19:03:58Z",
          "dateBasis": "platform-created",
          "publicationAcceptedAt": "2026-10-03T19:04:00.546060Z",
          "platformCreatedAt": "2026-10-03T19:03:58Z",
          "expiresAt": "2026-10-04T19:03:58Z",
          "expiryEstimated": true,
          "url": "https://facebook.com/stories/174171244298670/UzpfSVNDOjk5MDQyMzAxNDA4MjE1OQ==/?view_single=1",
          "assetLabel": "View Facebook Story",
          "evidenceUrl": "https://github.com/poptins/poptin-agents/actions/runs/37147077989",
          "publicationVerifiedAt": "2026-10-03T19:12:57Z"
        }
      ]
    }
  ]
};

window.applyPublishingAgents = function applyPublishingAgents(target) {
  const publishing = window.PUBLISHING_AGENT_DATA;
  if (!target || target.source !== publishing.source) return target;
  const ids = new Set(publishing.agents.map(agent => agent.id));
  target.agents = [
    ...target.agents.filter(agent => !ids.has(agent.id)),
    ...publishing.agents.map(agent => ({...agent, activities: agent.activities.map(item => ({...item}))}))
  ];
  if (new Date(publishing.lastUpdated) > new Date(target.lastUpdated)) target.lastUpdated = publishing.lastUpdated;
  return target;
};
window.applyPublishingAgents(window.AGENT_DATA);
