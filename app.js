let data = window.AGENT_DATA;
let selectedAgentId = data.agents[0]?.id;
let activityFilter = "all";
let activityAgentFilter = "all";

const $ = (selector) => document.querySelector(selector);
const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

function activityDate(item) {
  if (item.type === "scheduled" && item.schedule?.frequency === "monthly-days") {
    const now = new Date();
    const days = [...(item.schedule.days || [])].sort((a, b) => a - b);
    for (let monthOffset = 0; monthOffset <= 1; monthOffset += 1) {
      const year = now.getUTCFullYear();
      const month = now.getUTCMonth() + monthOffset;
      for (const day of days) {
        const candidate = new Date(Date.UTC(year, month, day, item.schedule.hourUtc || 0, item.schedule.minuteUtc || 0));
        if (candidate > now) return candidate;
      }
    }
    return new Date(item.date);
  }
  if (item.type === "scheduled" && item.schedule?.frequency === "hourly") {
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setUTCMinutes(item.schedule.minuteUtc || 0, 0, 0);
    if (nextRun <= now) nextRun.setUTCHours(nextRun.getUTCHours() + 1);
    return nextRun;
  }
  if (item.type === "scheduled" && item.schedule?.frequency === "weekly") {
    const now = new Date();
    const nextRun = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      item.schedule.hourUtc,
      item.schedule.minuteUtc || 0
    ));
    const daysUntilRun = (item.schedule.weekdayUtc - nextRun.getUTCDay() + 7) % 7;
    nextRun.setUTCDate(nextRun.getUTCDate() + daysUntilRun);
    if (nextRun <= now) nextRun.setUTCDate(nextRun.getUTCDate() + 7);
    return nextRun;
  }
  if (item.type === "scheduled" && item.scheduleUtc) {
    const [hour, minute] = item.scheduleUtc.split(":").map(Number);
    const now = new Date();
    const nextRun = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour, minute));
    if (nextRun <= now) nextRun.setUTCDate(nextRun.getUTCDate() + 1);
    return nextRun;
  }
  return new Date(item.date);
}

function allActivities() {
  return data.agents.flatMap(agent => agent.activities.map(activity => ({ ...activity, agent })));
}

function isFutureScheduled(item, now = Date.now()) {
  return item.type === "scheduled" && activityDate(item).getTime() > now;
}

function visibleActivities() {
  const now = Date.now();
  return allActivities().filter(item => item.type !== "scheduled" || isFutureScheduled(item, now));
}

function renderStats() {
  const activities = visibleActivities();
  const completed = activities.filter(item => item.type === "past").length;
  const scheduled = activities.filter(item => isFutureScheduled(item)).length;
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
    return `<a class="asset-link ${compact ? "compact-asset" : ""}" href="${item.url}" target="_blank" rel="noopener">${item.assetLabel || "View published asset"} ג†—</a>`;
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
  const now = Date.now();
  const scheduled = agent.activities.filter(item => isFutureScheduled(item, now)).slice(0, 2);
  const compact = (items, type) => items.length ? items.map(item => `
    <div class="compact-item ${type}">
      <strong>${item.title}</strong>
      <span>${dateFormat.format(activityDate(item))} ֲ· ${timeFormat.format(activityDate(item))}</span>
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
      <p class="eyebrow">INSTRUCTIONS FOLLOWED</p>
      <h3>What ${agent.name} does each time it runs</h3>
      <ol class="agent-instructions">${(agent.instructions || [agent.task]).filter(Boolean).map(instruction => `<li>${escapeHtml(instruction)}</li>`).join("")}</ol>
    </div>
    <div class="task-meta">
      <div class="meta-box"><span>OWNER</span><strong>${agent.owner}</strong></div>
      <div class="meta-box"><span>CADENCE</span><strong>${agent.cadence}</strong></div>
      <div class="meta-box"><span>PRIORITY</span><strong>${agent.priority}</strong></div>
    </div>
    <div class="detail-columns">
      <div><div class="mini-heading"><h3>Recent work</h3><span>${past.length} shown</span></div><div class="compact-list">${compact(past, "past")}</div></div>
      <div><div class="mini-heading"><h3>Upcoming schedule</h3><span>${scheduled.length} planned</span></div><div class="compact-list">${compact(scheduled, "scheduled")}</div></div>
    </div>
  `;
}

function renderTimeline() {
  const activities = visibleActivities()
    .filter(item => activityFilter === "all" || item.type === activityFilter)
    .filter(item => activityAgentFilter === "all" || item.agent.id === activityAgentFilter)
    .sort((a, b) => activityFilter === "scheduled" ? activityDate(a) - activityDate(b) : activityDate(b) - activityDate(a));

  const activityIcon = item => item.type === "past" ? "ג“" : item.type === "failed" ? "!" : "ג†’";
  const emptyMessage = activityFilter === "failed" ? "No failed tasks recorded." : "No activity in this view.";

  $("#activityTimeline").innerHTML = activities.length ? activities.map(item => `
    <article class="activity-card">
      <span class="timeline-icon ${item.type}">${activityIcon(item)}</span>
      <div>
        <h3>${item.title}</h3>
        <p>${item.agent.name} ֲ· ${item.detail}</p>
        ${renderAsset(item)}
      </div>
      <div class="activity-date"><strong>${dateFormat.format(activityDate(item))}</strong><span>${timeFormat.format(activityDate(item))}</span></div>
    </article>
  `).join("") : `<div class="empty-state">${emptyMessage}</div>`;
}

function setUpdatedTime() {
  const checkedAt = new Date();
  const snapshotAt = new Date(data.lastUpdated);
  $("#lastUpdated").textContent = `${dateFormat.format(checkedAt)}, ${timeFormat.format(checkedAt)}`;
  $("#dataSnapshot").textContent = `Data snapshot: ${dateFormat.format(snapshotAt)}, ${timeFormat.format(snapshotAt)}`;
}

function renderActivityAgentFilter() {
  $("#activityAgentFilter").innerHTML = `
    <option value="all">All agents</option>
    ${data.agents.map(agent => `<option value="${agent.id}">${agent.name}</option>`).join("")}
  `;
  $("#activityAgentFilter").value = activityAgentFilter;
}

function loadLatestData() {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `data.js?refresh=${Date.now()}`;
    script.async = true;
    script.onload = () => {
      script.remove();
      if (!window.AGENT_DATA?.agents) {
        reject(new Error("The dashboard data is invalid."));
        return;
      }
      const productId = sessionStorage.getItem("marketingBoardProduct") || "poptin";
      if (window.PRODUCT_AGENT_DATA) {
        window.PRODUCT_AGENT_DATA.poptin = window.AGENT_DATA;
        const selectedProductData = window.PRODUCT_AGENT_DATA[productId];
        if (selectedProductData?.agents) {
          window.AGENT_DATA = selectedProductData;
          resolve(selectedProductData);
          return;
        }
      }
      resolve(window.AGENT_DATA);
    };
    script.onerror = () => {
      script.remove();
      reject(new Error("The latest dashboard data could not be loaded."));
    };
    document.head.appendChild(script);
  });
}

async function mergeRecentGithubActivity() {
  const token = sessionStorage.getItem("optimizationGithubToken");
  if (!token || !data?.source) return { loaded: false, reason: "no-token" };
  const response = await fetch(`https://api.github.com/repos/${data.source}/actions/runs?per_page=50`, {
    headers: {"Accept":"application/vnd.github+json","Authorization":`Bearer ${token}`,"X-GitHub-Api-Version":"2022-11-28"}
  });
  if (!response.ok) {
    if ([401, 403, 404].includes(response.status)) sessionStorage.removeItem("optimizationGithubToken");
    throw new Error(`GitHub could not load recent agent activity (${response.status}).`);
  }
  const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const runs = (await response.json()).workflow_runs || [];
  const seen = new Set(allActivities().map(item => item.githubRunId).filter(Boolean));
  const agentForRun = run => {
    const name = `${run.name || ""} ${run.display_title || ""}`.toLowerCase();
    const mappings = [
      ["update-blog", ["update blog", "old article"]],
      ["alternatives", ["alternative", "competitor"]],
      ["glossary", ["glossary"]],
      ["optimization", ["optimization", "search console", "opportunity"]],
      ["social", ["social", "buffer"]],
      ["academy", ["academy", "academic"]],
      ["quora", ["quora"]],
      ["seo", ["seo", "blog publishing"]]
    ];
    const match = mappings.find(([, terms]) => terms.some(term => name.includes(term)));
    return match ? data.agents.find(agent => agent.id === match[0]) : null;
  };
  let added = 0;
  runs
    .filter(run => ["success", "failure"].includes(run.conclusion))
    .filter(run => new Date(run.created_at).getTime() >= cutoff && !seen.has(run.id))
    .slice(0, 30)
    .reverse()
    .forEach(run => {
      const agent = agentForRun(run);
      if (!agent) return;
      const failed = run.conclusion === "failure";
      agent.activities.unshift({
        type: failed ? "failed" : "past",
        title: `${failed ? "Failed" : "Completed"}: ${run.name || run.display_title || "GitHub Actions task"}`,
        detail: failed
          ? `${run.display_title || run.name || "Workflow run"} did not complete successfully. Open GitHub for the failed step and logs.`
          : `${run.display_title || run.name || "Workflow run"} completed successfully.`,
        date: run.created_at,
        url: run.html_url,
        assetLabel: failed ? "Open failed workflow run" : "Open successful workflow run",
        githubRunId: run.id
      });
      seen.add(run.id);
      added += 1;
    });
  return { loaded: true, added };
}

function synchronizeSeoDependentActivities() {
  const seoAgent = data.agents.find(agent => agent.id === "seo");
  const seoNext = seoAgent?.activities.find(activity =>
    activity.type === "scheduled" && activity.title === "Next SEO cadence article window"
  );
  if (!seoNext) return;

  data.agents.forEach(agent => {
    agent.activities
      .filter(activity => activity.dependsOn === "seo-next-article")
      .forEach(activity => {
        activity.date = seoNext.date;
        activity.detail = `After the SEO Agent's article expected on ${dateFormat.format(new Date(seoNext.date))} is confirmed published, custom-schedule LinkedIn, Facebook, and X posts, beginning about five minutes after handoff with independent random 5-10 minute gaps.`;
      });
  });
}

function renderDashboard() {
  synchronizeSeoDependentActivities();
  if (!data.agents.some(agent => agent.id === selectedAgentId)) {
    selectedAgentId = data.agents[0]?.id;
  }
  renderStats();
  renderAgents($("#agentSearch").value);
  renderAgentDetail();
  renderActivityAgentFilter();
  renderTimeline();
  renderRecommendationQueue();
  setUpdatedTime();
}

$("#agentSearch").addEventListener("input", event => renderAgents(event.target.value));
$("#refreshButton").addEventListener("click", async () => {
  const button = $("#refreshButton");
  button.disabled = true;
  button.textContent = "ג†» Refreshingג€¦";
  try {
    data = await loadLatestData();
    const activitySync = await mergeRecentGithubActivity();
    renderDashboard();
    button.textContent = activitySync.loaded ? `ג“ Updated${activitySync.added ? ` + ${activitySync.added} activities` : ""}` : "ג“ Updated";
  } catch (error) {
    console.error(error);
    button.textContent = "! Try again";
  } finally {
    setTimeout(() => {
      button.disabled = false;
      button.textContent = "ג†» Refresh";
    }, 1400);
  }
});
document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => {
  activityFilter = button.dataset.filter;
  document.querySelectorAll(".filter").forEach(item => item.classList.toggle("active", item === button));
  renderTimeline();
}));
$("#activityAgentFilter").addEventListener("change", event => {
  activityAgentFilter = event.target.value;
  renderTimeline();
  renderRecommendationQueue();
});
$("#activityProductFilter").addEventListener("change", event => {
  if (typeof window.selectMarketingProduct === "function") {
    window.selectMarketingProduct(event.target.value);
  }
});
$("#themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  $("#themeToggle").textContent = document.body.classList.contains("dark") ? "ג˜€" : "ג˜¾";
});
$("#logoutButton").addEventListener("click", () => {
  sessionStorage.removeItem("agentDashboardAccess");
  window.location.replace("index.html");
});

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[character]));
}

function recommendationKey(item) {
  return (item.url || item.title).replace(/[^a-z0-9]+/gi, "-").toLowerCase();
}

function recommendationExecutionId(item) {
  const afterHost = item.url.includes("://") ? item.url.split("://")[1].split("/").slice(1) : [];
  const parts = afterHost.filter(Boolean);
  const last = parts.length ? parts[parts.length - 1] : "homepage";
  return `gsc-meta-${last.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
}

async function getOptimizationGithubToken() {
  let token = sessionStorage.getItem("optimizationGithubToken");
  if (!token) {
    token = window.prompt("Enter a fine-grained GitHub token for the Poptin and Chatway agent repositories with Actions: write, Contents: read, and Issues: read access. It is stored only for this browser session.");
    if (!token) throw new Error("Approval was not submitted because no GitHub token was provided.");
    token = token.trim();
    sessionStorage.setItem("optimizationGithubToken", token);
  }
  return token;
}

async function dispatchOptimization(recommendationId, decision = "approve") {
  const token = await getOptimizationGithubToken();
  const accessCheck = await fetch("https://api.github.com/repos/poptins/poptin-agents", {
    headers: {"Accept":"application/vnd.github+json","Authorization":`Bearer ${token}`,"X-GitHub-Api-Version":"2022-11-28"}
  });
  if (!accessCheck.ok) {
    sessionStorage.removeItem("optimizationGithubToken");
    throw new Error(`The token cannot access the private poptins/poptin-agents repository (${accessCheck.status}). Regenerate it with resource owner poptins and select poptin-agents.`);
  }
  const response = await fetch("https://api.github.com/repos/poptins/poptin-agents/actions/workflows/optimization-agent.yml/dispatches", {
    method: "POST",
    headers: {"Accept":"application/vnd.github+json","Authorization":`Bearer ${token}`,"X-GitHub-Api-Version":"2022-11-28"},
    body: JSON.stringify({ref:"main",inputs:{recommendation_id:recommendationId,decision}})
  });
  if (response.status === 204) return;
  if ([401, 403, 404].includes(response.status)) sessionStorage.removeItem("optimizationGithubToken");
  throw new Error(`GitHub rejected the approval (${response.status}). The saved token was cleared; verify poptin-agents is selected and Actions is set to Read and write.`);
}

var permanentlyRemovedRecommendations = new Set();

async function loadPermanentDismissals() {
  try {
    const response = await fetch("dismissed-recommendations.json", {cache: "no-store"});
    if (!response.ok) return;
    const data = await response.json();
    permanentlyRemovedRecommendations = new Set(data.ids || []);
  } finally {
    renderRecommendationQueue();
  }
}

async function removeRecommendationPermanently(recommendationId) {
  const token = await getOptimizationGithubToken();
  const api = "https://api.github.com/repos/poptins/poptin-agent-dashboard/contents/dismissed-recommendations.json";
  const headers = {"Accept":"application/vnd.github+json","Authorization":`Bearer ${token}`,"X-GitHub-Api-Version":"2022-11-28"};
  const currentResponse = await fetch(`${api}?ref=main`, {headers});
  if (!currentResponse.ok) throw new Error(`GitHub could not read the shared dismissal list (${currentResponse.status}).`);
  const current = await currentResponse.json();
  const decoded = JSON.parse(decodeURIComponent(escape(atob(current.content.replace(/\\s/g, "")))));
  const ids = [...new Set([...(decoded.ids || []), recommendationId])];
  const content = btoa(unescape(encodeURIComponent(JSON.stringify({ids}, null, 2) + "\n")));
  const update = await fetch(api, {
    method: "PUT",
    headers: {...headers, "Content-Type":"application/json"},
    body: JSON.stringify({message:`Dismiss optimization recommendation ${recommendationId}`,content,sha:current.sha,branch:"main"})
  });
  if (!update.ok) throw new Error(`GitHub could not save the permanent dismissal (${update.status}). Check Contents: write permission.`);
  permanentlyRemovedRecommendations.add(recommendationId);
}

var exactOptimizationPatches = {
  "http://www.poptin.com/": {
    currentTitle: "Email Marketing Automation & Newsletters | Exit intent Popups - Poptin",
    currentDescription: "Create email campaigns, email automations, popups & forms in minutes. Grow audience, capture leads, and drive sales. Start for free - no credit card required.",
    suggestedTitle: "Email Marketing Automation & Exit Intent Popups - Poptin",
    suggestedDescription: "Create email campaigns, automatio…753 tokens truncated…d generation, ecommerce, and conversion optimization from the Poptin team."
  },
  "https://www.poptin.com/blog/30-free-banks-images-icons-vectors-visually-appealing-content/": {
    currentTitle: "30+ FREE Banks of Images, Icons and Vectors For Visually Appealing Content - Poptin blog",
    currentDescription: "(No meta description is currently published.)",
    suggestedTitle: "30+ Free Image, Icon & Vector Sites for Content - Poptin blog",
    suggestedDescription: "Find more than 30 free sources for images, icons, and vectors to create polished blog posts, landing pages, emails, and social content."
  },
  "https://www.poptin.com/blog/what-is-a-pop-up-the-only-guide-you-need/": {
    currentTitle: "What Is a Pop Up? The Only Guide You Need - Poptin blog",
    currentDescription: "Are you confused about pop ups and unsure of how to use them to boost sales, increase signups or grow your business? Read this guide.",
    suggestedTitle: "What Is a Pop Up? Types, Examples & Best Practices - Poptin blog",
    suggestedDescription: "Learn what pop-ups are, explore common types and examples, and discover best practices for increasing signups, leads, and sales."
  },
  "https://www.poptin.com/blog/6-ways-increase-brand-recognition-business/": {
    currentTitle: "6 Ways To Increase Brand Recognition For Your Business - Poptin blog",
    currentDescription: "(No meta description is currently published.)",
    suggestedTitle: "6 Ways To Increase Brand Recognition For Your Business - Poptin blog",
    suggestedDescription: "Discover six practical ways to strengthen brand recognition, build customer trust, and make your business more memorable across channels."
  },
  "https://www.poptin.com/blog/is-chaty-pro-the-best-wordpress-chat-plugin-for-you-a-review/": {
    currentTitle: "Is Chaty Pro The Best WordPress Chat Plugin For You? (A Review) - Poptin blog",
    currentDescription: "Looking for a chat app that seamlessly integrates with your WordPress website? Check out this review of Chaty Pro for WordPress.",
    suggestedTitle: "Chaty Pro Review: Is It the Best WordPress Chat Plugin? - Poptin blog",
    suggestedDescription: "Read our Chaty Pro review to compare its channels, WordPress features, setup experience, and use cases before choosing a chat plugin."
  },
  "https://www.poptin.com/academy/glossary/scroll-trigger/": {
    currentTitle: "What is Scroll Trigger | Scroll Trigger Definition - Poptin Academy",
    currentDescription: "(No meta description is currently published.)",
    suggestedTitle: "What is Scroll Trigger | Scroll Trigger Definition - Poptin Academy",
    suggestedDescription: "A scroll trigger launches a popup or action after a visitor reaches a defined page depth. Learn how it works and when marketers use it."
  },
  "https://www.poptin.com/academy/glossary/flash-sale/": {
    currentTitle: "What is Flash Sale | Flash Sale Definition - Poptin Academy",
    currentDescription: "A flash sale is a limited-time promotion offering discounts to drive urgency, and engage customers through email or popup campaigns.",
    suggestedTitle: "What is Flash Sale | Flash Sale Definition - Poptin Academy",
    suggestedDescription: "A flash sale is a short, limited-time promotion designed to create urgency and increase sales through email, popups, and other campaigns."
  }
};


function parseQuoraReviewIssue(issue) {
  const sections = [];
  const pattern = /## \d+\. ([^\n]+)\n\n\*\*Question:\*\* (https:\/\/www\.quora\.com\/[^\s]+)\n\n([\s\S]*?)(?=\n\n\*\*Reviewer checks\*\*|\n\n## \d+\.|\n\n---|$)/g;
  for (const match of issue.body.matchAll(pattern)) {
    sections.push({ id: `issue-${issue.number}-${sections.length + 1}`, question: match[1].trim(), url: match[2].trim(), answer: match[3].trim() });
  }
  return sections;
}

const QUORA_PUBLISH_COOLDOWN_MS = 4 * 60 * 1000;
const QUORA_PUBLISH_COOLDOWN_KEY = "quoraPublishCooldownUntil";
let quoraCooldownTimer;

function quoraCooldownRemaining() {
  return Math.max(0, Number(localStorage.getItem(QUORA_PUBLISH_COOLDOWN_KEY) || 0) - Date.now());
}

function applyQuoraPublishCooldown(grid, status) {
  clearInterval(quoraCooldownTimer);
  const update = () => {
    const remaining = quoraCooldownRemaining();
    const cooling = remaining > 0;
    grid.querySelectorAll("[data-publish-answer]").forEach(button => {
      if (button.textContent !== "Opened in Quora") button.disabled = cooling;
    });
    if (!cooling) {
      clearInterval(quoraCooldownTimer);
      localStorage.removeItem(QUORA_PUBLISH_COOLDOWN_KEY);
      return;
    }
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.ceil((remaining % 60000) / 1000).toString().padStart(2, "0");
    status.textContent = `Next Quora answer available in ${minutes}:${seconds}.`;
  };
  update();
  if (quoraCooldownRemaining() > 0) quoraCooldownTimer = setInterval(update, 1000);
}

async function copyQuoraAnswer(answer) {
  const clipboardText = String(answer).replace(/\r\n/g, "\n").replace(/\n(?:[ \t]*\n)+/g, "\n\n").trim();
  const textarea = document.createElement("textarea");
  textarea.value = clipboardText;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (copied) return;
  if (!navigator.clipboard?.writeText) throw new Error("Clipboard access is unavailable");
  await navigator.clipboard.writeText(clipboardText);
}

async function loadQuoraReviewQueue(grid, status) {
  const token = await getOptimizationGithubToken();
  const response = await fetch("https://api.github.com/repos/poptins/poptin-agents/issues?state=open&per_page=100", { headers: {"Accept":"application/vnd.github+json","Authorization":`Bearer ${token}`,"X-GitHub-Api-Version":"2022-11-28"} });
  if (!response.ok) {
    if ([401, 403, 404].includes(response.status)) sessionStorage.removeItem("optimizationGithubToken");
    throw new Error(`GitHub could not load the private Quora review queue (${response.status}). Ensure the token has Issues: read access.`);
  }
  const issues = (await response.json()).filter(issue => issue.title.startsWith("[Quora agent]")).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  if (!issues.length) throw new Error("No open Quora review issue was found.");
  const issue = issues[0];
  const answers = parseQuoraReviewIssue(issue);
  if (!answers.length) throw new Error("The latest Quora review issue did not contain readable answers.");
  grid.innerHTML = answers.map(item => `
    <article class="recommendation-card quora-answer-card" data-answer-id="${escapeHtml(item.id)}">
      <div class="recommendation-top"><span class="property-pill">Quora</span><span class="readiness ready">Ready for human review</span></div>
      <h3>${escapeHtml(item.question)}</h3>
      <a class="recommendation-url" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">${escapeHtml(item.url)} ג†—</a>
      <div class="answer-preview">${escapeHtml(item.answer).replace(/\\n\\n/g, "</p><p>").replace(/^/, "<p>").replace(/$/, "</p>")}</div>
      <div class="recommendation-actions">
        <button class="cancel-button quora-copy-button" type="button" data-copy-answer="${escapeHtml(item.id)}" aria-label="Copy answer">נ“‹ Copy answer</button>
        <button class="approve-button quora-publish-button" type="button" data-publish-answer="${escapeHtml(item.id)}">Open Quora question</button>
      </div>
      <p class="card-feedback" aria-live="polite">Copy the answer first, then open Quora, click Answer, and paste with Ctrl+V.</p>
    </article>
  `).join("");
  grid.querySelectorAll("[data-copy-answer]").forEach(button => button.addEventListener("click", async () => {
    const item = answers.find(answer => answer.id === button.dataset.copyAnswer);
    const feedback = button.closest(".quora-answer-card").querySelector(".card-feedback");
    button.disabled = true;
    try {
      await copyQuoraAnswer(item.answer);
      button.textContent = "ג“ Copied";
      feedback.classList.remove("error");
      feedback.textContent = "Answer copied to your clipboard. Open Quora, click Answer, and paste with Ctrl+V.";
      setTimeout(() => { button.disabled = false; button.textContent = "נ“‹ Copy answer"; }, 2000);
    } catch (error) {
      button.disabled = false;
      button.textContent = "נ“‹ Copy answer";
      feedback.classList.add("error");
      feedback.textContent = "Copy was blocked by the browser. Select the answer text above and copy it manually.";
    }
  }));
  grid.querySelectorAll("[data-publish-answer]").forEach(button => button.addEventListener("click", async () => {
    if (quoraCooldownRemaining() > 0) {
      applyQuoraPublishCooldown(grid, status);
      return;
    }
    {
      const itemToOpen = answers.find(answer => answer.id === button.dataset.publishAnswer);
      const feedbackToUpdate = button.closest(".quora-answer-card").querySelector(".card-feedback");
      const openedWindow = window.open(itemToOpen.url, "_blank", "noopener,noreferrer");
      if (openedWindow) {
        button.disabled = true;
        button.textContent = "Opened in Quora";
        feedbackToUpdate.classList.remove("error");
        feedbackToUpdate.textContent = "Question opened. Click Answer in Quora, then paste the copied answer with Ctrl+V.";
        localStorage.setItem(QUORA_PUBLISH_COOLDOWN_KEY, String(Date.now() + QUORA_PUBLISH_COOLDOWN_MS));
        applyQuoraPublishCooldown(grid, status);
      } else {
        feedbackToUpdate.classList.add("error");
        feedbackToUpdate.textContent = "Your browser blocked the new tab. Use the question link above.";
      }
      return;
    }
    const item = answers.find(answer => answer.id === button.dataset.publishAnswer);
    const feedback = button.closest(".quora-answer-card").querySelector(".card-feedback");
    const quoraWindow = window.open("about:blank", "_blank");
    button.disabled = true; button.textContent = "Copyingג€¦";
    try {
      await copyQuoraAnswer(item.answer);
      if (quoraWindow) {
        button.textContent = "Copied, opening...";
        feedback.textContent = "Answer copied successfully. Opening the Quora question in 1 second.";
        setTimeout(() => {
          try {
            quoraWindow.location.href = item.url;
            button.textContent = "Opened in Quora";
            feedback.textContent = "Answer copied. Click Answer in Quora, paste with Ctrl+V, review, and submit.";
          } catch (error) {
            quoraWindow.close();
            button.textContent = "Copied";
            feedback.textContent = "Answer copied, but the browser blocked navigation. Use the question link above.";
          }
        }, 1000);
      } else {
        button.textContent = "Copied";
        feedback.textContent = "Answer copied, but the browser blocked the new tab. Use the question link above.";
      }
      localStorage.setItem(QUORA_PUBLISH_COOLDOWN_KEY, String(Date.now() + QUORA_PUBLISH_COOLDOWN_MS));
      applyQuoraPublishCooldown(grid, status);
    } catch (error) {
      if (quoraWindow) quoraWindow.close();
      button.disabled = false; button.textContent = "Copy & open Quora"; feedback.classList.add("error");
      feedback.textContent = "Clipboard access was unavailable. Copy the answer from the preview and use the question link.";
      status.textContent = "Clipboard access was unavailable.";
    }
  }));
  status.innerHTML = `Loaded ${answers.length} answers from the latest private review issue. <a href="${escapeHtml(issue.html_url)}" target="_blank" rel="noopener">Open issue ג†—</a>`;
  applyQuoraPublishCooldown(grid, status);
}
function renderQuoraQueue(grid, status) {
  const agent = data.agents.find(item => item.id === "quora");
  const pendingQuestions = agent?.pendingQuestions || [];
  const questionCards = pendingQuestions.map((item, index) => `
    <article class="recommendation-card quora-question-card">
      <div class="recommendation-top"><span class="property-pill">Question ${index + 1}</span><span class="readiness ready">Answer pending review</span></div>
      <h3>${escapeHtml(item.question)}</h3>
      <a class="recommendation-url" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">Open question ג†—</a>
    </article>
  `).join("");
  grid.innerHTML = `
    ${questionCards}
    <article class="recommendation-card quora-load-card">
      <div class="recommendation-top"><span class="property-pill">Private review queue</span><span class="readiness ready">GitHub authentication required</span></div>
      <h3>Load approved Quora drafts</h3>
      <p class="quora-load-copy">The four questions are visible above. Draft answers stay private until you authenticate with GitHub.</p>
      <div class="recommendation-actions"><button class="approve-button" id="loadQuoraQueue" type="button">Load review queue</button></div>
      <p class="card-feedback" id="quoraLoadFeedback" aria-live="polite"></p>
    </article>
  `;
  grid.querySelector("#loadQuoraQueue").addEventListener("click", async event => {
    const button = event.currentTarget; const feedback = grid.querySelector("#quoraLoadFeedback");
    button.disabled = true; button.textContent = "Loadingג€¦";
    try { await loadQuoraReviewQueue(grid, status); }
    catch (error) {
      button.disabled = false; button.textContent = "Load review queue"; feedback.classList.add("error");
      feedback.textContent = error.message; status.textContent = error.message;
    }
  });
}

function renderRecommendationQueue() {
  const grid = $("#recommendationGrid");
  const timeline = $("#activityTimeline");
  const status = $("#approvalStatus");
  if (!grid || !timeline || !status) return;

  const isOptimization = selectedAgentId === "optimization" || activityAgentFilter === "optimization";
  const isQuora = selectedAgentId === "quora" || activityAgentFilter === "quora";
  const hasActionQueue = isOptimization || isQuora;
  grid.hidden = !hasActionQueue;
  status.hidden = !hasActionQueue;
  timeline.hidden = hasActionQueue;
  if (isQuora) {
    renderQuoraQueue(grid, status);
    return;
  }
  if (!isOptimization) return;

  const agent = data.agents.find(item => item.id === "optimization");
  const items = agent?.activities || [];
  const cancelled = new Set(JSON.parse(localStorage.getItem("cancelledOptimizationRecommendations") || "[]"));
  grid.innerHTML = items.filter(item => !permanentlyRemovedRecommendations.has(recommendationExecutionId(item))).map(item => {
    const patch = exactOptimizationPatches[item.url] || {
      currentTitle: "Current value unavailable",
      suggestedTitle: item.title,
      currentDescription: item.detail,
      suggestedDescription: item.detail,
      investigation: true
    };
    const property = item.url.includes("/academy/") ? "poptin.com/academy" : item.url.includes("/blog/") ? "poptin.com/blog" : "poptin.com";
    const key = recommendationKey(item);
    const executionId = recommendationExecutionId(item);
    const isCancelled = cancelled.has(key);
    return `
      <article class="recommendation-card ${isCancelled ? "cancelled" : ""}" data-recommendation="${escapeHtml(key)}" data-execution-id="${escapeHtml(executionId)}">
        <div class="recommendation-top">
          <span class="property-pill">${property}</span>
          <span class="readiness ${isCancelled || patch.investigation ? "blocked" : "ready"}">${isCancelled ? "Cancelled" : patch.investigation ? "Investigation required" : "Suggested text ready"}</span>
          <button class="remove-recommendation" type="button" data-remove="${escapeHtml(key)}" aria-label="Remove ${escapeHtml(item.title)}">ֳ—</button>
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <a class="recommendation-url" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">${escapeHtml(item.url)} ג†—</a>
        <div class="change-preview">
          <div><span>CURRENT SEO TITLE</span><p>${escapeHtml(patch.currentTitle)}</p></div>
          <div><span>SUGGESTED SEO TITLE</span><p>${escapeHtml(patch.suggestedTitle)}</p></div>
          <div><span>CURRENT META DESCRIPTION</span><p>${escapeHtml(patch.currentDescription)}</p></div>
          <div><span>SUGGESTED META DESCRIPTION</span><p>${escapeHtml(patch.suggestedDescription)}</p></div>
        </div>
        <div class="recommendation-actions">
          <button class="approve-button" type="button" ${isCancelled || patch.investigation ? "disabled" : ""}>${patch.investigation ? "Not executable yet" : isCancelled ? "Cancelled" : "Approve"}</button>
          <button class="cancel-button" type="button" ${isCancelled ? "disabled" : ""}>${isCancelled ? "Cancelled" : "Cancel"}</button>
        </div>
        <p class="card-feedback" aria-live="polite">${isCancelled ? "This recommendation is cancelled and will not be executed." : ""}</p>
      </article>
    `;
  }).join("");

  grid.querySelectorAll(".remove-recommendation").forEach(button => button.addEventListener("click", async () => {
    const card = button.closest(".recommendation-card");
    const executionId = card.dataset.executionId;
    button.disabled = true;
    status.textContent = "Removing recommendation for every browserג€¦";
    try {
      await removeRecommendationPermanently(executionId);
      status.textContent = "Recommendation permanently removed.";
      renderRecommendationQueue();
    } catch (error) {
      button.disabled = false;
      status.textContent = error.message;
      card.querySelector(".card-feedback").textContent = error.message;
      card.querySelector(".card-feedback").classList.add("error");
    }
  }));

  grid.querySelectorAll(".approve-button").forEach(button => button.addEventListener("click", async () => {
    const card = button.closest(".recommendation-card");
    const feedback = card.querySelector(".card-feedback");
    button.disabled = true;
    button.textContent = "Submittingג€¦";
    feedback.classList.remove("error");
    feedback.textContent = "Submitting approval to the credentialed Optimization workflowג€¦";
    try {
      await dispatchOptimization(card.dataset.executionId, "approve");
      button.textContent = "Approved";
      feedback.innerHTML = 'Approval submitted. The workflow will use authenticated WordPress API reads, verify the protected before-state, and apply only the displayed metadata. <a href="https://github.com/poptins/poptin-agents/actions/workflows/optimization-agent.yml" target="_blank" rel="noopener">Follow the workflow run ג†—</a>';
      status.textContent = "Approval submitted successfully.";
    } catch (error) {
      button.disabled = false;
      button.textContent = "Approve";
      feedback.classList.add("error");
      feedback.textContent = error.message;
      status.textContent = error.message;
    }
  }));
  grid.querySelectorAll(".cancel-button").forEach(button => button.addEventListener("click", async () => {
    const card = button.closest(".recommendation-card");
    const feedback = card.querySelector(".card-feedback");
    button.disabled = true;
    button.textContent = "Cancellingג€¦";
    feedback.classList.remove("error");
    try {
      await dispatchOptimization(card.dataset.executionId, "cancel");
      cancelled.add(card.dataset.recommendation);
      localStorage.setItem("cancelledOptimizationRecommendations", JSON.stringify([...cancelled]));
      status.textContent = "Recommendation cancelled. No WordPress write was made.";
      renderRecommendationQueue();
    } catch (error) {
      button.disabled = false;
      button.textContent = "Cancel";
      feedback.classList.add("error");
      feedback.textContent = error.message;
      status.textContent = error.message;
    }
  }));
}

renderRecommendationQueue();
loadPermanentDismissals();
renderDashboard();

