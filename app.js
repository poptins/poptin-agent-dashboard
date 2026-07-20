const data = window.AGENT_DATA;
let selectedAgentId = data.agents[0]?.id;
let activityFilter = "all";
let activityAgentFilter = "all";

const $ = (selector) => document.querySelector(selector);
const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

function allActivities() {
  return data.agents.flatMap(agent => agent.activities.map(activity => ({ ...activity, agent })));
}

function renderStats() {
  const activities = allActivities();
  const completed = activities.filter(item => item.type === "past").length;
  const scheduled = activities.filter(item => item.type === "scheduled").length;
  const active = data.agents.filter(agent => agent.status === "active").length;
  const stats = [
    ["Total agents", data.agents.length, `${active} active`],
    ["Completed tasks", completed, "Recorded"],
    ["Scheduled", scheduled, "Upcoming"],
    ["Coverage", `${Math.round((active / data.agents.length) * 100)}%`, "Online"]
  ];
  $("#statsGrid").innerHTML = stats.map(([label, value, note]) => `
    <article class="stat-card"><span>${label}</span><strong>${value}</strong><small>${note}</small></article>
  `).join("");
}

function avatarStyle(agent) {
  return `--avatar-bg:${agent.color};--avatar-ink:${agent.ink}`;
}

function renderAsset(item, compact = false) {
  if (item.url) {
    return `<a class="asset-link ${compact ? "compact-asset" : ""}" href="${item.url}" target="_blank" rel="noopener">${item.assetLabel || "View published asset"} ↗</a>`;
  }
  return item.assetStatus ? `<span class="asset-note">${item.assetStatus}</span>` : "";
}

function renderAgents(query = "") {
  const normalized = query.trim().toLowerCase();
  const agents = data.agents.filter(agent => `${agent.name} ${agent.role}`.toLowerCase().includes(normalized));
  $("#agentCount").textContent = agents.length;
  $("#agentList").innerHTML = agents.length ? agents.map(agent => `
    <button class="agent-row ${agent.id === selectedAgentId ? "active" : ""}" data-agent-id="${agent.id}" type="button">
      <span class="avatar" style="${avatarStyle(agent)}">${agent.initials}</span>
      <span><span class="agent-name">${agent.name}</span><span class="agent-role">${agent.role}</span></span>
      <span class="status-dot ${agent.status}" title="${agent.status}"></span>
    </button>
  `).join("") : `<div class="empty-state">No agents match that search.</div>`;

  document.querySelectorAll("[data-agent-id]").forEach(button => {
    button.addEventListener("click", () => {
      selectedAgentId = button.dataset.agentId;
      renderAgents($("#agentSearch").value);
      renderAgentDetail();
    });
  });
}

function renderAgentDetail() {
  const agent = data.agents.find(item => item.id === selectedAgentId) || data.agents[0];
  if (!agent) return;
  const past = agent.activities.filter(item => item.type === "past").slice(0, 2);
  const scheduled = agent.activities.filter(item => item.type === "scheduled").slice(0, 2);
  const compact = (items, type) => items.length ? items.map(item => `
    <div class="compact-item ${type}">
      <strong>${item.title}</strong>
      <span>${dateFormat.format(new Date(item.date))} · ${timeFormat.format(new Date(item.date))}</span>
      ${renderAsset(item, true)}
    </div>
  `).join("") : `<span class="agent-role">Nothing here yet.</span>`;

  $("#agentDetail").innerHTML = `
    <div class="detail-top">
      <div class="profile">
        <span class="avatar" style="${avatarStyle(agent)}">${agent.initials}</span>
        <div><h2>${agent.name}</h2><p>${agent.role}</p></div>
      </div>
      <span class="status-pill"><span class="status-dot ${agent.status}"></span>${agent.status === "active" ? "Active now" : "Standing by"}</span>
    </div>
    <div class="task-block">
      <p class="eyebrow">TASK DESCRIPTION</p>
      <h3>What ${agent.name} is responsible for</h3>
      <p>${agent.task}</p>
    </div>
    <div class="task-meta">
      <div class="meta-box"><span>OWNER</span><strong>${agent.owner}</strong></div>
      <div class="meta-box"><span>CADENCE</span><strong>${agent.cadence}</strong></div>
      <div class="meta-box"><span>PRIORITY</span><strong>${agent.priority}</strong></div>
    </div>
    <div class="detail-columns">
      <div><div class="mini-heading"><h3>Recent work</h3><span>${past.length} shown</span></div><div class="compact-list">${compact(past, "past")}</div></div>
      <div><div class="mini-heading"><h3>Up next</h3><span>${scheduled.length} planned</span></div><div class="compact-list">${compact(scheduled, "scheduled")}</div></div>
    </div>
  `;
}

function renderTimeline() {
  const activities = allActivities()
    .filter(item => activityFilter === "all" || item.type === activityFilter)
    .filter(item => activityAgentFilter === "all" || item.agent.id === activityAgentFilter)
    .sort((a, b) => activityFilter === "past" ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date));

  $("#activityTimeline").innerHTML = activities.length ? activities.map(item => `
    <article class="activity-card">
      <span class="timeline-icon ${item.type}">${item.type === "past" ? "✓" : "→"}</span>
      <div>
        <h3>${item.title}</h3>
        <p>${item.agent.name} · ${item.detail}</p>
        ${renderAsset(item)}
      </div>
      <div class="activity-date"><strong>${dateFormat.format(new Date(item.date))}</strong><span>${timeFormat.format(new Date(item.date))}</span></div>
    </article>
  `).join("") : `<div class="empty-state">No activity in this view.</div>`;
}

function setUpdatedTime() {
  const date = new Date(data.lastUpdated);
  $("#lastUpdated").textContent = `${dateFormat.format(date)}, ${timeFormat.format(date)}`;
}

function renderActivityAgentFilter() {
  $("#activityAgentFilter").innerHTML = `
    <option value="all">All agents</option>
    ${data.agents.map(agent => `<option value="${agent.id}">${agent.name}</option>`).join("")}
  `;
}

$("#agentSearch").addEventListener("input", event => renderAgents(event.target.value));
$("#refreshButton").addEventListener("click", () => {
  setUpdatedTime();
  const button = $("#refreshButton");
  button.textContent = "✓ Refreshed";
  setTimeout(() => button.textContent = "↻ Refresh", 1200);
});
document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => {
  activityFilter = button.dataset.filter;
  document.querySelectorAll(".filter").forEach(item => item.classList.toggle("active", item === button));
  renderTimeline();
}));
$("#activityAgentFilter").addEventListener("change", event => {
  activityAgentFilter = event.target.value;
  renderTimeline();
});
$("#themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  $("#themeToggle").textContent = document.body.classList.contains("dark") ? "☀" : "☾";
});
$("#logoutButton").addEventListener("click", () => {
  sessionStorage.removeItem("agentDashboardAccess");
  window.location.replace("index.html");
});

renderStats();
renderAgents();
renderAgentDetail();
renderActivityAgentFilter();
renderTimeline();
setUpdatedTime();


function recommendationKey(item) {
  return (item.url || item.title).replace(/[^a-z0-9]+/gi, "-").toLowerCase();
}

function proposedChange(item) {
  if (item.url && item.url.includes("careers.poptin.com")) {
    return {
      current: "Organic clicks declined materially versus the previous comparison period.",
      proposed: "Investigate query mix, rankings, seasonality, and recent page changes before proposing any page edit.",
      ready: false
    };
  }
  return {
    current: "The live SEO title and meta description still need to be captured as the protected before-state.",
    proposed: "Replace the English SEO title and meta description with an exact, query-aligned version after the before/after patch is generated.",
    ready: false
  };
}

function renderRecommendationQueue() {
  const grid = $("#recommendationGrid");
  if (!grid) return;
  const agent = data.agents.find(item => item.id === "optimization");
  const cancelled = new Set(JSON.parse(sessionStorage.getItem("cancelledOptimizationRecommendations") || "[]"));
  const items = (agent?.activities || []).filter(item => item.type === "past" && !cancelled.has(recommendationKey(item)));
  grid.innerHTML = items.length ? items.map(item => {
    const change = proposedChange(item);
    const key = recommendationKey(item);
    return `
      <article class="recommendation-card">
        <div class="recommendation-top">
          <span class="property-pill">${item.url?.includes("/academy/") ? "poptin.com/academy" : item.url?.includes("/blog/") ? "poptin.com/blog" : "poptin.com"}</span>
          <span class="readiness ${change.ready ? "ready" : "blocked"}">${change.ready ? "Ready to approve" : "Exact patch pending"}</span>
        </div>
        <h3>${item.title}</h3>
        <a class="recommendation-url" href="${item.url}" target="_blank" rel="noopener">${item.url} ↗</a>
        <div class="change-preview">
          <div><span>CURRENT</span><p>${change.current}</p></div>
          <div><span>PROPOSED CHANGE</span><p>${change.proposed}</p></div>
        </div>
        <div class="recommendation-actions">
          <button class="approve-button" type="button" data-approve="${key}">Approve</button>
          <button class="cancel-button" type="button" data-cancel="${key}">Cancel</button>
        </div>
      </article>
    `;
  }).join("") : '<div class="empty-state">No optimization recommendations in the queue.</div>';

  grid.querySelectorAll("[data-approve]").forEach(button => button.addEventListener("click", () => {
    $("#approvalStatus").textContent = "This item cannot execute yet: the agent must first capture the live SEO title and meta description and publish an exact before/after patch for approval.";
  }));
  grid.querySelectorAll("[data-cancel]").forEach(button => button.addEventListener("click", () => {
    cancelled.add(button.dataset.cancel);
    sessionStorage.setItem("cancelledOptimizationRecommendations", JSON.stringify([...cancelled]));
    $("#approvalStatus").textContent = "Recommendation cancelled for this browser session.";
    renderRecommendationQueue();
  }));
}

renderRecommendationQueue();
