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
