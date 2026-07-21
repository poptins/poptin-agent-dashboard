(() => {
  const renderOtherQueues = renderRecommendationQueue;
  let discoveredOpportunities = [];
  let discoveryInProgress = false;

  const githubHeaders = token => ({
    "Accept": "application/vnd.github+json",
    "Authorization": `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28"
  });

  const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

  function decodeGithubContent(encoded) {
    return decodeURIComponent(escape(atob(encoded.replace(/\s/g, ""))));
  }

  async function loadOpportunityFeed(token) {
    const response = await fetch(
      "https://api.github.com/repos/poptins/poptin-agents/contents/dashboard/search-console-recommendations.js?ref=main",
      {headers: githubHeaders(token), cache: "no-store"}
    );
    if (!response.ok) throw new Error(`GitHub could not load the opportunity results (${response.status}).`);
    const file = await response.json();
    const source = decodeGithubContent(file.content);
    const match = source.match(/^window\.SEARCH_CONSOLE_DATA\s*=\s*([\s\S]+);\s*$/);
    if (!match) throw new Error("The opportunity result file is invalid.");
    const payload = JSON.parse(match[1]);
    return (payload.recommendations || []).slice(0, 10);
  }

  async function waitForDiscoveryRun(token, startedAt) {
    const runsUrl = "https://api.github.com/repos/poptins/poptin-agents/actions/workflows/search-console-audit.yml/runs?event=workflow_dispatch&branch=main&per_page=10";
    for (let attempt = 0; attempt < 180; attempt += 1) {
      const response = await fetch(runsUrl, {headers: githubHeaders(token), cache: "no-store"});
      if (!response.ok) throw new Error(`GitHub could not read the workflow status (${response.status}).`);
      const payload = await response.json();
      const run = (payload.workflow_runs || []).find(candidate =>
        new Date(candidate.created_at).getTime() >= startedAt - 15000
      );
      if (run) {
        const status = $("#approvalStatus");
        status.innerHTML = `Finding opportunities on GitHub: ${escapeHtml(run.status)}. <a href="${escapeHtml(run.html_url)}" target="_blank" rel="noopener">Open run ↗</a>`;
        if (run.status === "completed") {
          if (run.conclusion !== "success") {
            throw new Error(`The opportunity workflow finished with status: ${run.conclusion}.`);
          }
          return run;
        }
      }
      await delay(5000);
    }
    throw new Error("The GitHub workflow is still running. Open Actions to follow it, then click Find opportunities again.");
  }

  async function findOpportunities() {
    if (discoveryInProgress) return;
    const token = await getOptimizationGithubToken();
    discoveryInProgress = true;
    renderOptimizationDiscovery();
    const status = $("#approvalStatus");
    const startedAt = Date.now();

    try {
      status.textContent = "Starting the on-demand GitHub opportunity scan…";
      const response = await fetch(
        "https://api.github.com/repos/poptins/poptin-agents/actions/workflows/search-console-audit.yml/dispatches",
        {
          method: "POST",
          headers: githubHeaders(token),
          body: JSON.stringify({ref: "main"})
        }
      );
      if (response.status !== 204) {
        if ([401, 403, 404].includes(response.status)) sessionStorage.removeItem("optimizationGithubToken");
        throw new Error(`GitHub rejected the opportunity scan (${response.status}). The token needs Actions: write and Contents: read access.`);
      }

      await waitForDiscoveryRun(token, startedAt);
      discoveredOpportunities = await loadOpportunityFeed(token);
      status.textContent = `Found and ranked ${discoveredOpportunities.length} opportunities. Permission checks are shown on each card.`;
    } finally {
      discoveryInProgress = false;
      renderOptimizationDiscovery();
    }
  }

  function evidenceMarkup(item) {
    const evidence = item.evidence || {};
    const values = [
      ["Impressions", evidence.impressions == null ? "—" : Math.round(evidence.impressions).toLocaleString()],
      ["Clicks", evidence.clicks == null ? "—" : Math.round(evidence.clicks).toLocaleString()],
      ["Position", evidence.position == null ? "—" : Number(evidence.position).toFixed(1)]
    ];
    return `<dl class="opportunity-evidence">${values.map(([label, value]) =>
      `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`
    ).join("")}</dl>`;
  }

  function renderOptimizationDiscovery() {
    const grid = $("#recommendationGrid");
    const timeline = $("#activityTimeline");
    const status = $("#approvalStatus");
    if (!grid || !timeline || !status) return;

    grid.hidden = false;
    status.hidden = false;
    timeline.hidden = true;

    const cards = discoveredOpportunities.map((item, index) => {
      const permission = item.permission || {can_edit: false, label: "Not checked", reason: "No permission result was returned."};
      return `
        <article class="recommendation-card opportunity-card">
          <div class="recommendation-top">
            <span class="property-pill">#${index + 1} · ${escapeHtml(item.property)}</span>
            <span class="readiness ${permission.can_edit ? "ready" : "blocked"}">${escapeHtml(permission.label)}</span>
          </div>
          <h3>${escapeHtml(item.title)}</h3>
          <a class="recommendation-url" href="${escapeHtml(item.source)}" target="_blank" rel="noopener">${escapeHtml(item.source)} ↗</a>
          <p>${escapeHtml(item.summary)}</p>
          ${evidenceMarkup(item)}
          <div class="permission-result ${permission.can_edit ? "allowed" : "denied"}">
            <strong>${permission.can_edit ? "✓ Permission to edit verified" : "! Permission to edit not verified"}</strong>
            <span>${escapeHtml(permission.reason)}</span>
          </div>
          <p class="card-feedback">${escapeHtml(item.reason)}</p>
        </article>
      `;
    }).join("");

    grid.innerHTML = `
      <article class="recommendation-card opportunity-launcher">
        <div class="recommendation-top">
          <span class="property-pill">On demand</span>
          <span class="readiness ${discoveryInProgress ? "blocked" : "ready"}">${discoveryInProgress ? "Running on GitHub" : "Ready"}</span>
        </div>
        <h3>Find optimization opportunities</h3>
        <p>Run a fresh Search Console scan, rank the findings, verify authenticated WordPress edit access for every target, and show the first 10.</p>
        <div class="recommendation-actions">
          <button class="approve-button" id="findOpportunitiesButton" type="button" ${discoveryInProgress ? "disabled" : ""}>
            ${discoveryInProgress ? "Finding opportunities…" : "Find opportunities"}
          </button>
        </div>
      </article>
      ${cards || '<div class="empty-state opportunity-empty">Click “Find opportunities” to run a fresh GitHub scan.</div>'}
    `;

    const button = $("#findOpportunitiesButton");
    if (button) button.addEventListener("click", () => {
      findOpportunities().catch(error => {
        discoveryInProgress = false;
        renderOptimizationDiscovery();
        $("#approvalStatus").textContent = error.message;
      });
    });
  }

  renderRecommendationQueue = function () {
    const isOptimization = selectedAgentId === "optimization" || activityAgentFilter === "optimization";
    if (isOptimization) {
      renderOptimizationDiscovery();
      return;
    }
    renderOtherQueues();
  };

  renderRecommendationQueue();
})();
