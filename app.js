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
      renderRecommendationQueue();
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


var exactOptimizationPatches = {
  "http://www.poptin.com/": {
    currentTitle: "Email Marketing Automation & Newsletters | Exit intent Popups - Poptin",
    currentDescription: "Create email campaigns, email automations, popups & forms in minutes. Grow audience, capture leads, and drive sales. Start for free - no credit card required.",
    suggestedTitle: "Email Marketing Automation & Popups for Lead Growth | Poptin",
    suggestedDescription: "Create email campaigns, automations, popups, and forms that capture leads and drive sales. Start free with Poptin—no credit card required."
  },
  "https://www.poptin.com/pricing/": {
    currentTitle: "Pricing - Poptin",
    currentDescription: "Explore affordable pricing plans for popups, forms, email campaigns, and email marketing automation. Choose the plan that fits your business.",
    suggestedTitle: "Poptin Pricing: Email Marketing, Popups & Forms Plans",
    suggestedDescription: "Compare Poptin plans for email marketing, automation, popups, and forms. Choose the right features and limits for your business."
  },
  "https://www.poptin.com/about-us/": {
    currentTitle: "About Us - Poptin",
    currentDescription: "(No meta description is currently published.)",
    suggestedTitle: "About Poptin | Our Team and Marketing Platform",
    suggestedDescription: "Meet the team behind Poptin and learn how our email marketing, popup, and form tools help businesses capture leads and grow."
  },
  "https://careers.poptin.com/": {
    currentTitle: "Careers at Poptin, Prospero, Premio & Chatway - Job Openings",
    currentDescription: "(No meta description is currently published.)",
    suggestedTitle: "(No replacement proposed yet.)",
    suggestedDescription: "Investigate query mix, rankings, seasonality, and recent site changes before approving any text change.",
    investigation: true
  },
  "https://www.poptin.com/blog/9-ultimate-sales-funnel-examples-that-convert/": {
    currentTitle: "9 Ultimate Sales Funnel Examples That Convert Like Crazy - Poptin blog",
    currentDescription: "Learn from these effective sales funnel examples by big brands that help track the buyer’s journey to better target them and convert them into sales faster.",
    suggestedTitle: "9 Sales Funnel Examples That Convert (With Tips) | Poptin",
    suggestedDescription: "Explore nine proven sales funnel examples from leading brands and learn practical ways to improve targeting, conversions, and the buyer journey."
  },
  "https://www.poptin.com/blog/types-of-email-marketing/": {
    currentTitle: "Types of Email Marketing: A Complete Guide for Successful Campaigns - Poptin blog",
    currentDescription: "Discover the different types of email marketing and learn how to strategically use each one. Boost engagement and conversions with transactional, promotional, and informational emails, plus more!",
    suggestedTitle: "Types of Email Marketing: 10 Campaigns to Use | Poptin",
    suggestedDescription: "Learn the main types of email marketing campaigns, when to use each one, and how transactional, promotional, and educational emails drive results."
  },
  "https://www.poptin.com/blog/": {
    currentTitle: "Poptin blog - Pop Ups, Email Marketing, CRO & Digital Marketing Tips",
    currentDescription: "Pop Ups, Email Marketing, CRO & Digital Marketing Tips",
    suggestedTitle: "Poptin Blog: Email Marketing, Popups & CRO Tips",
    suggestedDescription: "Practical guides for email marketing, popups, lead generation, ecommerce, and conversion optimization from the Poptin team."
  },
  "https://www.poptin.com/blog/30-free-banks-images-icons-vectors-visually-appealing-content/": {
    currentTitle: "30+ FREE Banks of Images, Icons and Vectors For Visually Appealing Content - Poptin blog",
    currentDescription: "(No meta description is currently published.)",
    suggestedTitle: "30+ Free Image, Icon & Vector Sites for Content | Poptin",
    suggestedDescription: "Find more than 30 free sources for images, icons, and vectors to create polished blog posts, landing pages, emails, and social content."
  },
  "https://www.poptin.com/blog/what-is-a-pop-up-the-only-guide-you-need/": {
    currentTitle: "What Is a Pop Up? The Only Guide You Need - Poptin blog",
    currentDescription: "Are you confused about pop ups and unsure of how to use them to boost sales, increase signups or grow your business? Read this guide.",
    suggestedTitle: "What Is a Pop-Up? Types, Examples & Best Practices | Poptin",
    suggestedDescription: "Learn what pop-ups are, explore common types and examples, and discover best practices for increasing signups, leads, and sales."
  },
  "https://www.poptin.com/blog/6-ways-increase-brand-recognition-business/": {
    currentTitle: "6 Ways To Increase Brand Recognition For Your Business - Poptin blog",
    currentDescription: "(No meta description is currently published.)",
    suggestedTitle: "6 Ways to Increase Brand Recognition for Your Business | Poptin",
    suggestedDescription: "Discover six practical ways to strengthen brand recognition, build customer trust, and make your business more memorable across channels."
  },
  "https://www.poptin.com/blog/is-chaty-pro-the-best-wordpress-chat-plugin-for-you-a-review/": {
    currentTitle: "Is Chaty Pro The Best WordPress Chat Plugin For You? (A Review) - Poptin blog",
    currentDescription: "Looking for a chat app that seamlessly integrates with your WordPress website? Check out this review of Chaty Pro for WordPress.",
    suggestedTitle: "Chaty Pro Review: Is It the Best WordPress Chat Plugin? | Poptin",
    suggestedDescription: "Read our Chaty Pro review to compare its channels, WordPress features, setup experience, and use cases before choosing a chat plugin."
  },
  "https://www.poptin.com/academy/glossary/scroll-trigger/": {
    currentTitle: "What is Scroll Trigger | Scroll Trigger Definition - Poptin Academy",
    currentDescription: "(No meta description is currently published.)",
    suggestedTitle: "What Is a Scroll Trigger? Definition & Examples | Poptin Academy",
    suggestedDescription: "A scroll trigger launches a popup or action after a visitor reaches a defined page depth. Learn how it works and when marketers use it."
  },
  "https://www.poptin.com/academy/glossary/flash-sale/": {
    currentTitle: "What is Flash Sale | Flash Sale Definition - Poptin Academy",
    currentDescription: "A flash sale is a limited-time promotion offering discounts to drive urgency, and engage customers through email or popup campaigns.",
    suggestedTitle: "What Is a Flash Sale? Definition & Examples | Poptin Academy",
    suggestedDescription: "A flash sale is a short, limited-time promotion designed to create urgency and increase sales through email, popups, and other campaigns."
  }
};

function renderRecommendationQueue() {
  var grid = $("#recommendationGrid");
  var timeline = $("#activityTimeline");
  var status = $("#approvalStatus");
  if (!grid || !timeline || !status) return;
  var isOptimization = selectedAgentId === "optimization";
  grid.hidden = !isOptimization;
  status.hidden = !isOptimization;
  timeline.hidden = isOptimization;
  if (!isOptimization) return;

  var agent = data.agents.find(item => item.id === "optimization");
  var cancelled = new Set(JSON.parse(sessionStorage.getItem("cancelledOptimizationRecommendations") || "[]"));
  var items = (agent?.activities || []).filter(item => item.type === "past" && !cancelled.has(recommendationKey(item)));
  grid.innerHTML = items.map(item => {
    var patch = exactOptimizationPatches[item.url];
    var key = recommendationKey(item);
    if (!patch) return "";
    var property = item.url.includes("/academy/") ? "poptin.com/academy" : item.url.includes("/blog/") ? "poptin.com/blog" : "poptin.com";
    return `
      <article class="recommendation-card">
        <div class="recommendation-top"><span class="property-pill">${property}</span><span class="readiness ${patch.investigation ? "blocked" : "ready"}">${patch.investigation ? "Investigation required" : "Suggested text ready"}</span></div>
        <h3>${escapeHtml(item.title)}</h3>
        <a class="recommendation-url" href="${item.url}" target="_blank" rel="noopener">${item.url} ↗</a>
        <div class="change-preview">
          <div><span>CURRENT SEO TITLE</span><p>${escapeHtml(patch.currentTitle)}</p></div>
          <div><span>SUGGESTED SEO TITLE</span><p>${escapeHtml(patch.suggestedTitle)}</p></div>
          <div><span>CURRENT META DESCRIPTION</span><p>${escapeHtml(patch.currentDescription)}</p></div>
          <div><span>SUGGESTED META DESCRIPTION</span><p>${escapeHtml(patch.suggestedDescription)}</p></div>
        </div>
        <div class="recommendation-actions">
          <button class="approve-button" type="button" data-approve="${key}">Approve</button>
          <button class="cancel-button" type="button" data-cancel="${key}">Cancel</button>
        </div>
      </article>
    `;
  }).join("");

  grid.querySelectorAll("[data-approve]").forEach(button => button.addEventListener("click", () => {
    status.textContent = "Suggested text is ready, but execution is waiting for the exact WordPress page/post ID and protected before-state. No live change was made.";
  }));
  grid.querySelectorAll("[data-cancel]").forEach(button => button.addEventListener("click", () => {
    cancelled.add(button.dataset.cancel);
    sessionStorage.setItem("cancelledOptimizationRecommendations", JSON.stringify([...cancelled]));
    status.textContent = "Recommendation cancelled for this browser session.";
    renderRecommendationQueue();
  }));
}

$("#agentList").addEventListener("click", () => setTimeout(renderRecommendationQueue, 0));
renderRecommendationQueue();

