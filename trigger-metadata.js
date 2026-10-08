// Public-safe trigger inventory inspected from repository workflow definitions.
// A configured trigger is not proof that GitHub has enabled the workflow.
// No dispatch, credentials, private drafts, or publication permissions are added.
window.AGENT_TRIGGER_METADATA = {
  "poptin": {
    "quarterly-benchmark": {
      "modes": [],
      "paused": false,
      "enabledState": "disabled",
      "schedules": [],
      "events": [],
      "sources": [],
      "note": "On-demand preparation after an explicit user request; verified aggregate data is required. The separate quarterly reminder does not trigger this agent. No report workflow or schedule is active; data connectors and publishing are unimplemented."
    },
    "seo": {
      "modes": [
        "scheduled",
        "manual",
        "event"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "0 5 * * *",
          "timezone": "UTC"
        }
      ],
      "events": [
        {
          "event": "push",
          "paths": [
            ".github/seo-publish-now"
          ]
        }
      ],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/poptin-agents/blob/main/.github/workflows/seo-agent.yml"
      ],
      "note": "Workflow wake-ups do not guarantee publication. Cadence, review and eligibility checks still apply."
    },
    "update-blog": {
      "modes": [
        "scheduled",
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "20 6 3,8,13,18,23,28 * *",
          "timezone": "UTC"
        }
      ],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/poptin-agents/blob/main/.github/workflows/update-blog-agent.yml"
      ],
      "note": "Workflow wake-ups do not guarantee publication. Cadence, review and eligibility checks still apply."
    },
    "alternatives": {
      "modes": [
        "scheduled",
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "30 5 5,20 * *",
          "timezone": "UTC"
        }
      ],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/poptin-agents/blob/main/.github/workflows/alternatives-agent.yml"
      ],
      "note": "Workflow wake-ups do not guarantee publication. Cadence, review and eligibility checks still apply."
    },
    "social": {
      "modes": [
        "scheduled",
        "manual",
        "event"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "17 * * * *",
          "timezone": "UTC"
        }
      ],
      "events": [
        {
          "event": "push",
          "paths": [
            "seo-agent/runs/social-handoff-source-*.json"
          ]
        }
      ],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/poptin-agents/blob/main/.github/workflows/social-media-agent.yml"
      ],
      "note": "Workflow wake-ups do not guarantee publication. Cadence, review and eligibility checks still apply."
    },
    "academy": {
      "modes": [
        "scheduled",
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "0 6 * * 0",
          "timezone": "UTC"
        }
      ],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/poptin-agents/blob/main/.github/workflows/academic-best-practices-agent.yml"
      ],
      "note": "Workflow wake-ups do not guarantee publication. Cadence, review and eligibility checks still apply."
    },
    "glossary": {
      "modes": [
        "scheduled",
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "15 6 * * *",
          "timezone": "UTC"
        }
      ],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/poptin-agents/blob/main/.github/workflows/glossary-poptin-agent.yml"
      ],
      "note": "Workflow wake-ups do not guarantee publication. Cadence, review and eligibility checks still apply."
    },
    "buying-intent": {
      "modes": [
        "scheduled",
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "15 5 * * *",
          "timezone": "Asia/Jerusalem"
        },
        {
          "cron": "18 8,11 * * *",
          "timezone": "Asia/Jerusalem"
        }
      ],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/poptin-agents/blob/main/.github/workflows/buying-intent-agent.yml"
      ],
      "note": "Scheduled times are wake-up and recovery opportunities. Daily completion guards prevent repeating a successful day's work. Draft creation and follow-up checks are distinct from sending."
    },
    "buying-intent-followup": {
      "modes": [
        "scheduled",
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "0 7 * * *",
          "timezone": "Asia/Jerusalem"
        },
        {
          "cron": "7 10,13 * * *",
          "timezone": "Asia/Jerusalem"
        }
      ],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/poptin-agents/blob/main/.github/workflows/buying-intent-followup-agent.yml"
      ],
      "note": "Scheduled times are wake-up and recovery opportunities. Daily completion guards prevent repeating a successful day's work. Draft creation and follow-up checks are distinct from sending."
    },
    "optimization": {
      "modes": [],
      "paused": true,
      "enabledState": "unverified",
      "schedules": [],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/poptin-agents/blob/main/.github/workflows/optimization-agent.yml"
      ],
      "note": "Execution is explicitly paused in the workflow. Its only job is disabled; manual dispatch does not perform optimization."
    },
    "quora": {
      "modes": [
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/poptin-agents/blob/main/.github/workflows/quora-agent.yml"
      ],
      "note": "Manual research and draft review. Final Quora submission remains human-controlled."
    },
    "partners-agencies": {
      "modes": [
        "scheduled",
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "30 4 * * *",
          "timezone": "Asia/Jerusalem"
        },
        {
          "cron": "33 7,10 * * *",
          "timezone": "Asia/Jerusalem"
        }
      ],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/poptin-agents/blob/main/.github/workflows/partners-agencies-agent.yml"
      ],
      "note": "Scheduled times are wake-up and recovery opportunities. Daily completion guards prevent repeating a successful day's work. Draft creation and follow-up checks are distinct from sending."
    },
    "marketing-consultant-outreach": {
      "modes": [
        "scheduled",
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "0 5 * * *",
          "timezone": "Asia/Jerusalem"
        },
        {
          "cron": "3 8,11 * * *",
          "timezone": "Asia/Jerusalem"
        }
      ],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/poptin-agents/blob/main/.github/workflows/marketing-consultant-outreach-agent.yml"
      ],
      "note": "Scheduled times are wake-up and recovery opportunities. Daily completion guards prevent repeating a successful day's work. Draft creation and follow-up checks are distinct from sending."
    },
    "marketing-consultant-followup": {
      "modes": [
        "scheduled",
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "45 7 * * *",
          "timezone": "Asia/Jerusalem"
        },
        {
          "cron": "48 10,13 * * *",
          "timezone": "Asia/Jerusalem"
        }
      ],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/poptin-agents/blob/main/.github/workflows/marketing-consultant-followup-agent.yml"
      ],
      "note": "Scheduled times are wake-up and recovery opportunities. Daily completion guards prevent repeating a successful day's work. Draft creation and follow-up checks are distinct from sending."
    },
    "listicle-outreach": {
      "modes": [
        "scheduled",
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "45 4 * * *",
          "timezone": "Asia/Jerusalem"
        },
        {
          "cron": "48 7,10 * * *",
          "timezone": "Asia/Jerusalem"
        }
      ],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/poptin-agents/blob/main/.github/workflows/listicle-outreach-agent.yml"
      ],
      "note": "Scheduled times are wake-up and recovery opportunities. Daily completion guards prevent repeating a successful day's work. Draft creation and follow-up checks are distinct from sending."
    },
    "agency-followup": {
      "modes": [
        "scheduled",
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "15 6 * * *",
          "timezone": "Asia/Jerusalem"
        },
        {
          "cron": "18 9,12 * * *",
          "timezone": "Asia/Jerusalem"
        }
      ],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/poptin-agents/blob/main/.github/workflows/agency-followup-agent.yml"
      ],
      "note": "Scheduled times are wake-up and recovery opportunities. Daily completion guards prevent repeating a successful day's work. Draft creation and follow-up checks are distinct from sending."
    },
    "listicle-followup": {
      "modes": [
        "scheduled",
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "30 6 * * *",
          "timezone": "Asia/Jerusalem"
        },
        {
          "cron": "33 9,12 * * *",
          "timezone": "Asia/Jerusalem"
        }
      ],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/poptin-agents/blob/main/.github/workflows/listicle-followup-agent.yml"
      ],
      "note": "Scheduled times are wake-up and recovery opportunities. Daily completion guards prevent repeating a successful day's work. Draft creation and follow-up checks are distinct from sending."
    },
    "affiliate-outreach": {
      "modes": [
        "scheduled",
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "30 5 * * *",
          "timezone": "Asia/Jerusalem"
        },
        {
          "cron": "33 8,11 * * *",
          "timezone": "Asia/Jerusalem"
        }
      ],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/poptin-agents/blob/main/.github/workflows/affiliate-outreach-agent.yml"
      ],
      "note": "Scheduled times are wake-up and recovery opportunities. Daily completion guards prevent repeating a successful day's work. Draft creation and follow-up checks are distinct from sending."
    },
    "competitor-affiliate-outreach": {
      "modes": [
        "scheduled",
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "45 5 * * *",
          "timezone": "Asia/Jerusalem"
        },
        {
          "cron": "48 8,11 * * *",
          "timezone": "Asia/Jerusalem"
        }
      ],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/poptin-agents/blob/main/.github/workflows/competitor-affiliate-outreach-agent.yml"
      ],
      "note": "Scheduled times are wake-up and recovery opportunities. Daily completion guards prevent repeating a successful day's work. Draft creation and follow-up checks are distinct from sending."
    },
    "competitor-affiliate-followup": {
      "modes": [
        "scheduled",
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "30 7 * * *",
          "timezone": "Asia/Jerusalem"
        },
        {
          "cron": "33 10,13 * * *",
          "timezone": "Asia/Jerusalem"
        }
      ],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/poptin-agents/blob/main/.github/workflows/competitor-affiliate-followup-agent.yml"
      ],
      "note": "Scheduled times are wake-up and recovery opportunities. Daily completion guards prevent repeating a successful day's work. Draft creation and follow-up checks are distinct from sending."
    },
    "affiliate-followup": {
      "modes": [
        "scheduled",
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "15 7 * * *",
          "timezone": "Asia/Jerusalem"
        },
        {
          "cron": "18 10,13 * * *",
          "timezone": "Asia/Jerusalem"
        }
      ],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/poptin-agents/blob/main/.github/workflows/affiliate-followup-agent.yml"
      ],
      "note": "Scheduled times are wake-up and recovery opportunities. Daily completion guards prevent repeating a successful day's work. Draft creation and follow-up checks are distinct from sending."
    },
    "ecommerce-cro": {
      "modes": [
        "scheduled",
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "0 6 * * *",
          "timezone": "Asia/Jerusalem"
        },
        {
          "cron": "7 9,12 * * *",
          "timezone": "Asia/Jerusalem"
        }
      ],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/poptin-agents/blob/main/.github/workflows/ecommerce-cro-agent.yml"
      ],
      "note": "Scheduled times are wake-up and recovery opportunities. Daily completion guards prevent repeating a successful day's work. Draft creation and follow-up checks are distinct from sending."
    },
    "ecommerce-cro-followup": {
      "modes": [
        "scheduled",
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "45 6 * * *",
          "timezone": "Asia/Jerusalem"
        },
        {
          "cron": "48 9,12 * * *",
          "timezone": "Asia/Jerusalem"
        }
      ],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/poptin-agents/blob/main/.github/workflows/ecommerce-cro-followup-agent.yml"
      ],
      "note": "Scheduled times are wake-up and recovery opportunities. Daily completion guards prevent repeating a successful day's work. Draft creation and follow-up checks are distinct from sending."
    },
    "youtube-shorts": {
      "modes": [
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/poptin-agents/actions/runs/37197079635"
      ],
      "note": "Review-led production and publication. No automatic posting schedule is configured in the inspected publisher workflows."
    },
    "youtube-video": {
      "modes": [
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/poptin-agents/blob/publish/september-updates-20261003/.github/workflows/shorts-preview.yml"
      ],
      "note": "Review-led production and publication. No automatic posting schedule is configured in the inspected publisher workflows."
    },
    "tutorial-video": {
      "modes": [
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/poptin-agents/tree/main/tutorial-agent"
      ],
      "note": "Review-led production and publication. No automatic posting schedule is configured in the inspected publisher workflows."
    },
    "instagram-reels": {
      "modes": [
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/poptin-agents/actions/runs/37197079635"
      ],
      "note": "Review-led production and publication. No automatic posting schedule is configured in the inspected publisher workflows."
    },
    "instagram-stories": {
      "modes": [
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/poptin-agents/actions/runs/37199218069"
      ],
      "note": "Review-led production and publication. No automatic posting schedule is configured in the inspected publisher workflows."
    },
    "facebook-stories": {
      "modes": [
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/poptin-agents/actions/runs/37197079635"
      ],
      "note": "Review-led production and publication. No automatic posting schedule is configured in the inspected publisher workflows."
    },
    "facebook-reels": {
      "modes": [
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/poptin-agents/actions/runs/37198435678"
      ],
      "note": "Review-led production and publication. No automatic posting schedule is configured in the inspected publisher workflows."
    }
  },
  "chatway": {
    "seo": {
      "modes": [
        "scheduled",
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "0 5 * * *",
          "timezone": "UTC"
        }
      ],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/chatway-agents/blob/main/.github/workflows/seo-agent.yml"
      ],
      "note": "Workflow wake-ups do not guarantee publication. Cadence, review and eligibility checks still apply."
    },
    "update-blog": {
      "modes": [
        "scheduled",
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "40 6 3,8,13,18,23,28 * *",
          "timezone": "UTC"
        }
      ],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/chatway-agents/blob/main/.github/workflows/update-blog-agent.yml"
      ],
      "note": "Workflow wake-ups do not guarantee publication. Cadence, review and eligibility checks still apply."
    },
    "alternatives": {
      "modes": [
        "scheduled",
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "20 7 5,20 * *",
          "timezone": "UTC"
        }
      ],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/chatway-agents/blob/main/.github/workflows/alternatives-agent.yml"
      ],
      "note": "Workflow wake-ups do not guarantee publication. Cadence, review and eligibility checks still apply."
    },
    "social": {
      "modes": [
        "scheduled",
        "manual",
        "event"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "17 * * * *",
          "timezone": "UTC"
        }
      ],
      "events": [
        {
          "event": "push",
          "paths": [
            ".github/chatway-social-check"
          ]
        }
      ],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/chatway-agents/blob/main/.github/workflows/social-agent.yml"
      ],
      "note": "Workflow wake-ups do not guarantee publication. Cadence, review and eligibility checks still apply."
    },
    "glossary": {
      "modes": [
        "scheduled",
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "15 6 * * *",
          "timezone": "UTC"
        }
      ],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/chatway-agents/blob/main/.github/workflows/glossary-agent.yml"
      ],
      "note": "Workflow wake-ups do not guarantee publication. Cadence, review and eligibility checks still apply."
    },
    "optimization": {
      "modes": [
        "manual",
        "event"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [],
      "events": [
        {
          "event": "push",
          "paths": [
            ".github/chatway-find-opportunities"
          ]
        }
      ],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/chatway-agents/blob/main/.github/workflows/optimization-agent.yml"
      ],
      "note": "Workflow wake-ups do not guarantee publication. Cadence, review and eligibility checks still apply."
    }
  },
  "chaty": {
    "seo": {
      "modes": [
        "scheduled",
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "15 6 2,7,12,17,22,27 * *",
          "timezone": "UTC"
        }
      ],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/chaty-agents/blob/main/.github/workflows/seo-agent.yml"
      ],
      "note": "Workflow wake-ups do not guarantee publication. Cadence, review and eligibility checks still apply."
    },
    "update-blog": {
      "modes": [
        "scheduled",
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "40 6 3,8,13,18,23,28 * *",
          "timezone": "UTC"
        }
      ],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/chaty-agents/blob/main/.github/workflows/update-blog-agent.yml"
      ],
      "note": "Workflow wake-ups do not guarantee publication. Cadence, review and eligibility checks still apply."
    }
  },
  "prospero": {
    "seo": {
      "modes": [
        "scheduled",
        "manual",
        "event"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "17 8 * * *",
          "timezone": "Asia/Jerusalem"
        }
      ],
      "events": [
        {
          "event": "push",
          "paths": [
            ".github/prospero-seo-publish-now"
          ]
        }
      ],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/prospero-agents/blob/main/.github/workflows/seo-agent.yml"
      ],
      "note": "Workflow wake-ups do not guarantee publication. Cadence, review and eligibility checks still apply."
    },
    "update-blog": {
      "modes": [
        "scheduled",
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "0 7 3,8,13,18,23,28 * *",
          "timezone": "UTC"
        }
      ],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/prospero-agents/blob/main/.github/workflows/update-blog-agent.yml"
      ],
      "note": "Workflow wake-ups do not guarantee publication. Cadence, review and eligibility checks still apply."
    },
    "alternatives": {
      "modes": [
        "scheduled",
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "40 7 5,20 * *",
          "timezone": "UTC"
        }
      ],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/prospero-agents/blob/main/.github/workflows/alternatives-agent.yml"
      ],
      "note": "Workflow wake-ups do not guarantee publication. Cadence, review and eligibility checks still apply."
    },
    "social": {
      "modes": [
        "scheduled",
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "17 * * * *",
          "timezone": "UTC"
        }
      ],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/prospero-agents/blob/main/.github/workflows/social-agent.yml"
      ],
      "note": "Workflow wake-ups do not guarantee publication. Cadence, review and eligibility checks still apply."
    }
  },
  "premio": {
    "seo": {
      "modes": [
        "scheduled",
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "0 5 * * *",
          "timezone": "UTC"
        }
      ],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/premio-agents/blob/main/.github/workflows/seo-agent.yml"
      ],
      "note": "Workflow wake-ups do not guarantee publication. Cadence, review and eligibility checks still apply."
    },
    "update-blog": {
      "modes": [
        "scheduled",
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "20 7 3,8,13,18,23,28 * *",
          "timezone": "UTC"
        }
      ],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/premio-agents/blob/main/.github/workflows/update-blog-agent.yml"
      ],
      "note": "Workflow wake-ups do not guarantee publication. Cadence, review and eligibility checks still apply."
    },
    "social": {
      "modes": [
        "scheduled",
        "manual"
      ],
      "paused": false,
      "enabledState": "unverified",
      "schedules": [
        {
          "cron": "17 * * * *",
          "timezone": "UTC"
        }
      ],
      "events": [],
      "verifiedAt": "2026-10-05T10:31:00Z",
      "sources": [
        "https://github.com/poptins/premio-agents/blob/main/.github/workflows/social-media-agent.yml"
      ],
      "note": "Workflow wake-ups do not guarantee publication. Cadence, review and eligibility checks still apply."
    }
  }
};
