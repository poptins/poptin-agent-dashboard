# Agent Operations Dashboard

A dependency-free dashboard for tracking the SEO, Social Media, Academy, and Glossary agents from the private `poptins/poptin-agents` repository.

The public site includes a client-side password gate. This discourages casual access but is not equivalent to server-side authentication because GitHub Pages serves static files publicly.

## Update the dashboard

All displayed agent content lives in `data.js`. The initial snapshot was derived from repository agent definitions, GitHub issues, persisted run state, and workflow cron schedules. Update this file from those sources, then commit and push; GitHub Pages will redeploy automatically.

Each activity has a `type` of either:

- `past` for completed work
- `scheduled` for upcoming work

Dates should use ISO 8601 format, including a time zone.

## Run locally

Open `index.html` directly, or serve the folder with any static web server.

## Deploy

The included GitHub Actions workflow publishes this repository to GitHub Pages whenever `main` is updated.
