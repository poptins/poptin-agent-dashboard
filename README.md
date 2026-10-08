# Agent Operations Dashboard

A dependency-free dashboard for tracking the SEO, Social Media, Academy, Glossary, Optimization, and Quora agents from the private `poptins/poptin-agents` repository.

The public site includes a client-side password gate. This discourages casual access but is not equivalent to server-side authentication because GitHub Pages serves static files publicly.

## Update the dashboard

All displayed agent content lives in `data.js`. The initial snapshot was derived from repository agent definitions, GitHub issues, persisted run state, and workflow cron schedules. Update this file from those sources, then commit and push; GitHub Pages will redeploy automatically.

The Quora Agent loads its review queue from the private agent repository only after GitHub authentication. Its Publish action copies an answer and opens the matching Quora question for human review and submission. Drafts and account identity are not embedded in this public repository.

Each activity has a `type` of:

- `past` for completed work
- `scheduled` for upcoming work
- `failed` for unsuccessful agent or workflow tasks

Dates should use ISO 8601 format, including a time zone.

## Run locally

Open `index.html` directly, or serve the folder with any static web server.

## Deploy

The included GitHub Actions workflow publishes this repository to GitHub Pages whenever `main` is updated.


## Manual video publishers

`publishing-agents.js` adds the Poptin YouTube Shorts, YouTube Video, Instagram Reels, Instagram Stories, and Facebook Stories agents. They are approval-led and have no automatic posting schedules. Workflow links open the existing private publishing implementation for review; the dashboard does not dispatch publishing or collect new credentials.

Keep this public module limited to public-safe descriptions and verified publication outcomes. Add `video-publication` history only with `publicationVerified: true`, a real public result URL, a unique platform/object `publicationTaskId`, and a timezone-qualified confirmation timestamp. `dateBasis: publication-confirmed` explicitly means the recorded time is publication confirmation, not an inferred platform timestamp. Preserve the private evidence URL for authorized reviewers, but never copy raw logs, private media, draft captions, account IDs, hashes, tokens or signed asset URLs into this repository. Pending uploads and successful workflow runs are not publication evidence.

For Stories, include `expiresAt` from the verified platform timestamp; the calendar retains the historical outcome while hiding the stale Story link after expiration. Do not record a pending or blocked Story as published.

Data refresh reapplies the publishing module idempotently, rebuilds the all-product aggregate and refreshes calendar filters. The WordPress sync remains independent. To add newer public outcomes, update this module from confirmed publisher receipts; no new recurring publication or data-sharing automation is enabled by this change.

Run `npm ci --ignore-scripts` and `npm test` for the DOM/data regression checks. The runtime dashboard remains dependency-free; jsdom is a development-only test dependency.

## Tutorial Video Agent and publication history

The Tutorial Video Agent is on demand and review-led. Its reusable production pipeline accepts interactive product UI captures; it does not autonomously navigate the product or schedule public uploads. The three initial YouTube tutorials are historical, verified publications from the existing reviewed workflows, not new uploads by the consolidated agent.

The canonical private catalog is `tutorial-agent/state/publications.json` in `poptins/poptin-agents`. From an authorized local checkout, run:

    node scripts/sync-tutorial-publications.mjs /path/to/poptin-agents/tutorial-agent/state/publications.json

This offline importer only updates the public-safe `publishing-agents.js` projection. It allowlists titles, public video URLs, confirmation dates and GitHub evidence links; private media, hashes and raw receipts are never copied. It rejects unverified, duplicate and conflicting records, retains earlier history on partial imports, and produces the same result on repeated imports. Review the diff and tests before publishing a dashboard update. It does not dispatch uploads, enable a schedule, or create credentials.

The existing WordPress sync only edits `data.js` and `product-tabs.js`. It cannot erase the tutorial projection. The browser reapplies `publishing-agents.js` after refresh and rebuilds the all-product inventory, preserving one tutorial card and one calendar outcome per video. Workflow success remains activity evidence only, never publication evidence.

## Company tree

The homepage groups the existing product agents by responsibility below Poptimus Prime. The root and departments are navigation, not additional operational agents. Agent selection opens the existing responsibilities and activity feed in the sidebar. Product tabs preserve a matching selection; missing agents return to the company overview. Search reveals matching branches without changing stored collapse choices. Native buttons support Enter/Space, plus Arrow Up/Down and Home/End inside the tree. Back or Escape returns to the company with focus restored.

`trigger-metadata.js` is a public-safe projection inspected from the real agent workflow definitions on October 5, 2026. Multiple badges represent scheduled, manual and GitHub push triggers. The sidebar shows exact cron expressions, configured timezones, event paths, source links and the verification date. Configured schedules are not proof of enabled workflow state or guaranteed publication. Poptin Optimization is explicitly paused. New agents without a verified projection display “Not verified” and remain visible under Other responsibilities. Refresh reloads the projection without dispatching any workflows.

`company-tree.js` and `company-tree.css` only change navigation and presentation. The existing password gate, GitHub authentication, review/approval controls, publication verification, calendar and refresh paths remain in place. No additional schedules, public uploads or permissions are created.

The PR-only Company tree visual smoke workflow renders offline component fixtures at desktop, tablet and mobile sizes, including dark mode. It blocks network requests, mocks reads, and never runs the production authentication scripts or supplies login credentials. Screenshots and overflow metrics are retained as short-lived CI artifacts. This supplements DOM tests; it is not a claim of authenticated end-to-end production testing.

Follow-up agents are nested directly under their verified originating agent in the company tree. Each retains its own selection, triggers, details and activity. Search keeps the parent/follow-up context; department collapse includes both. Relationships are explicit and product-scoped, so the all-product view never nests a follow-up under another product's agent. No execution or schedule definitions change.

Interview Publishing and Monthly Product Updates are Poptin-only workflow references in Content & SEO. They describe the existing per-artifact review-led paths and link to their sources; they do not add backend agents, dispatches or recurring schedules. The Local Codex agents panel lists the four user-supplied names as informational references only. Labels containing “Daily” or “2-days” are retained as names, not interpreted as verified schedules. Local references are never registered in agent data, calendar events, workflow fetching, activity or health/connection checks.

## Quarterly Benchmark Report Agent

The Poptin-only Quarterly Benchmark Report Agent is a preparation-stage entry under Content & SEO. It is awaiting verified, anonymized aggregate data; no report or publication is recorded. The first planned report covers Q4 2026, targeted for January 1–7, 2027. The intended cadence is the first week of January, April, July and October. These are planning windows, not active schedules or calendar jobs. No data connection, workflow dispatch or publisher is added. Execution and publishing remain disabled pending verified data, review and separate activation approval. The disabled implementation is proposed in [poptins/poptin-agents PR #121](https://github.com/poptins/poptin-agents/pull/121), including `quarterly-benchmark-agent/README.md`. This dashboard change does not establish that the implementation has merged or is operational.
