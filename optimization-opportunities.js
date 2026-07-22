(() => {
  const renderOtherQueues = renderRecommendationQueue;
  let discoveredOpportunities = [];
  let discoveryInProgress = false;
  let discoveryProduct = "";

  const githubHeaders = token => ({
    "Accept": "application/vnd.github+json",
    "Authorization": `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28"
  });
  const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

  function setDiscoveryStatus(message, isHtml = false) {
    const status = $("#approvalStatus");
    const inline = $("#opportunityInlineStatus");
    if (status) isHtml ? status.innerHTML = message : status.textContent = message;
    if (inline) isHtml ? inline.innerHTML = message : inline.textContent = message;
  }

  function optimizationConfig() {
    const isChatway = data.source === "poptins/chatway-agents";
    return isChatway ? {
      product: "Chatway",
      repository: "poptins/chatway-agents",
      workflow: "optimization-agent.yml",
      feed: "dashboard/search-console-recommendations.js"
    } : {
      product: "Poptin",
      repository: "poptins/poptin-agents",
      workflow: "search-console-audit.yml",
      feed: "dashboard/search-console-recommendations.js"
    };
  }

  function decodeGithubContent(encoded) {
    return decodeURIComponent(escape(atob(encoded.replace(/\s/g, ""))));
  }

  async function loadOpportunityFeed(token, config) {
    const response = await fetch(
      `https://api.github.com/repos/${config.repository}/contents/${config.feed}?ref=main&refresh=${Date.now()}`,
      {headers: githubHeaders(token), cache: "no-store"}
    );
    if (!response.ok) throw new Error(`GitHub could not load the ${config.product} opportunity results (${response.status}).`);
    const file = await response.json();
    const source = decodeGithubContent(file.content);
    const match = source.match(/^window\.SEARCH_CONSOLE_DATA\s*=\s*([\s\S]+);\s*$/);
    if (!match) throw new Error("The opportunity result file is invalid.");
    const payload = JSON.parse(match[1]);
    return (payload.recommendations || []).slice(0, 10);
  }

  async function waitForDiscoveryRun(token, config, startedAt) {
    const runsUrl = `https://api.github.com/repos/${config.repository}/actions/workflows/${config.workflow}/runs?event=workflow_dispatch&branch=main&per_page=10`;
    for (let attempt = 0; attempt < 180; attempt += 1) {
      const response = await fetch(runsUrl, {headers: githubHeaders(token), cache: "no-store"});
      if (!response.ok) throw new Error(`GitHub could not read the ${config.product} workflow status (${response.status}).`);
      const payload = await response.json();
      const run = (payload.workflow_runs || []).find(candidate =>
        new Date(candidate.created_at).getTime() >= startedAt - 15000
      );
      if (run) {
        setDiscoveryStatus(
          `Finding ${config.product} opportunities on GitHub: ${escapeHtml(run.status)}. <a href="${escapeHtml(run.html_url)}" target="_blank" rel="noopener">Open run ↗</a>`,
          true
        );
        if (run.status === "completed") {
          if (run.conclusion !== "success") throw new Error(`The opportunity workflow finished with status: ${run.conclusion}.`);
          return run;
        }
      }
      await delay(5000);
    }
    throw new Error("The GitHub workflow is still running. Open Actions to follow it, then click Find opportunities again.");
  }

  async function findOpportunities() {
    if (discoveryInProgress) return;
    const config = optimizationConfig();
    const token = await getOptimizationGithubToken();
    const access = await fetch(`https://api.github.com/repos/${config.repository}`, {
      headers: githubHeaders(token),
      cache: "no-store"
    });
    if (!access.ok) {
      if ([401, 403, 404].includes(access.status)) sessionStorage.removeItem("optimizationGithubToken");
      throw new Error(`This token cannot access ${config.repository} (${access.status}). Update the fine-grained token to include this repository, then click Find opportunities again.`);
    }
    discoveryInProgress = true;
    discoveryProduct = config.product;
    discoveredOpportunities = [];
    renderOptimizationDiscovery();
    const startedAt = Date.now();
    try {
      setDiscoveryStatus(`Starting the on-demand ${config.product} opportunity scan…`);
      const response = await fetch(
        `https://api.github.com/repos/${config.repository}/actions/workflows/${config.workflow}/dispatches`,
        {
          method: "POST",
          headers: githubHeaders(token),
          body: JSON.stringify({ref: "main"})
        }
      );
      if (response.status !== 204) {
        if ([401, 403, 404].includes(response.status)) sessionStorage.removeItem("optimizationGithubToken");
        throw new Error(`GitHub rejected the ${config.product} opportunity scan (${response.status}). Give the token access to ${config.repository} with Actions: write and Contents: read.`);
      }
      await waitForDiscoveryRun(token, config, startedAt);
      discoveredOpportunities = await loadOpportunityFeed(token, config);
      setDiscoveryStatus(`Found and ranked ${discoveredOpportunities.length} ${config.product} opportunities. Permission checks are shown on each card.`);
    } finally {
      discoveryInProgress = false;
      renderOptimizationDiscovery();
    }
  }

  function normalizedOpportunity(item) {
    if (item.page) {
      const parsed = new URL(item.page);
      const path = parsed.pathname.replace(/\/$/, "");
      const label = decodeURIComponent(path.split("/").filter(Boolean).pop() || "Homepage")
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, character => character.toUpperCase());
      const property = path.includes("/glossary/") ? "chatway.app/glossary" : path.includes("/blog/") ? "chatway.app/blog" : "chatway.app";
      const permission = item.permission || {};
      return {
        property,
        title: label,
        source: item.page,
        summary: item.suggestion || "Review search intent and the current snippet before proposing an exact change.",
        current: item.current || null,
        patch: item.patch || null,
        reason: permission.reason || "Permission result unavailable.",
        evidence: item.evidence || {},
        permission: {
          can_edit: Boolean(permission.can_edit),
          label: permission.can_edit ? "Can edit" : `Cannot edit (${permission.status_code || "unknown"})`,
          reason: permission.reason || "No permission result was returned."
        }
      };
    }
    return item;
  }

  function evidenceMarkup(item) {
    const evidence = item.evidence || {};
    const values = [
      ["Impressions", evidence.impressions == null ? "—" : Math.round(evidence.impressions).toLocaleString()],
      ["Clicks", evidence.clicks == null ? "—" : Math.round(evidence.clicks).toLocaleString()],
      ["CTR", evidence.ctr == null ? "—" : `${(Number(evidence.ctr) * 100).toFixed(2)}%`],
      ["Position", evidence.position == null ? "—" : Number(evidence.position).toFixed(1)]
    ];
    return `<dl class="opportunity-evidence">${values.map(([label, value]) =>
      `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`
    ).join("")}</dl>`;
  }

  function seoPatchMarkup(item) {
    if (!item.current || !item.patch) return "";
    return `
      <div class="change-preview">
        <div><span>CURRENT SEO TITLE</span><p>${escapeHtml(item.current.seo_title || "Not set")}</p></div>
        <div><span>SUGGESTED SEO TITLE</span><p>${escapeHtml(item.patch.seo_title || "Not generated")}</p></div>
        <div><span>CURRENT META DESCRIPTION</span><p>${escapeHtml(item.current.meta_description || "Not set")}</p></div>
        <div><span>SUGGESTED META DESCRIPTION</span><p>${escapeHtml(item.patch.meta_description || "Not generated")}</p></div>
      </div>
    `;
  }

  function renderOptimizationDiscovery() {
    const grid = $("#recommendationGrid");
    const timeline = $("#activityTimeline");
    const status = $("#approvalStatus");
    if (!grid || !timeline || !status) return;
    const config = optimizationConfig();
    if (discoveryProduct && discoveryProduct !== config.product && !discoveryInProgress) discoveredOpportunities = [];

    grid.hidden = false;
    status.hidden = false;
    timeline.hidden = true;

    const cards = discoveredOpportunities.map(normalizedOpportunity).map((item, index) => {
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
          ${seoPatchMarkup(item)}
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
          <span class="property-pill">${config.product} · On demand</span>
          <span class="readiness ${discoveryInProgress ? "blocked" : "ready"}">${discoveryInProgress ? "Running on GitHub" : "Ready"}</span>
        </div>
        <h3>Find ${config.product} optimization opportunities</h3>
        <p>Run a fresh Search Console scan, rank the findings, verify authenticated WordPress edit access for every target, and show the first 10.</p>
        <div class="recommendation-actions">
          <button class="approve-button" id="findOpportunitiesButton" type="button" ${discoveryInProgress ? "disabled" : ""}>
            ${discoveryInProgress ? "Finding opportunities…" : "Find opportunities"}
          </button>
        </div>
        <p class="card-feedback" id="opportunityInlineStatus" aria-live="polite">${discoveryInProgress ? "The GitHub workflow is starting. This page will update automatically." : "Click the button to run the scan inside this dashboard; no new page will open."}</p>
      </article>
      ${cards || '<div class="empty-state opportunity-empty">No results loaded yet.</div>'}
    `;

    const button = $("#findOpportunitiesButton");
    if (button) button.addEventListener("click", () => {
      findOpportunities().catch(error => {
        discoveryInProgress = false;
        renderOptimizationDiscovery();
        setDiscoveryStatus(error.message);
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
