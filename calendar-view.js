(() => {
  const calendarView = document.querySelector("#calendarView");
  const operationsView = document.querySelector("#operationsView");
  const toggleButton = document.querySelector("#calendarViewButton");
  const productFilter = document.querySelector("#calendarProductFilter");
  const agentFilter = document.querySelector("#calendarAgentFilter");
  const monthLabel = document.querySelector("#calendarMonthLabel");
  const calendarGrid = document.querySelector("#calendarGrid");
  const stateKey = "marketingDashboardStateV1";
  let visibleMonth = new Date();
  let calendarOpen = false;
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);

  const productNames = {poptin: "Poptin", chatway: "Chatway", prospero: "Prospero", premio: "Premio"};

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[character]);
  }

  function isPublicPublishedOutcome(activity) {
    if (activity.type !== "past") return false;
    const signal = `${activity.title || ""} ${activity.assetLabel || ""}`.toLowerCase();
    const publicationSignal =
      activity.status === "Published" ||
      activity.taskType === "publication" ||
      activity.taskType === "social-publication" ||
      activity.status === "Updated" ||
      activity.taskType === "article-update" ||
      signal.includes("published") ||
      signal.includes("updated") ||
      signal.startsWith("shared ") ||
      signal.includes("view blog post") ||
      signal.includes("view academy guide") ||
      signal.includes("view glossary term") ||
      signal.includes("view published article") ||
      signal.includes("view updated article");
    if (!publicationSignal) return false;
    if (activity.taskType === "article-update") return true;
    return !/github\.com/i.test(activity.url || "");
  }

  function calendarItems() {
    const products = window.PRODUCT_AGENT_DATA || {};
    const now = new Date();
    const scheduleLimit = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const items = Object.entries(products)
      .filter(([productId]) => productId !== "all")
      .flatMap(([productId, product]) => (product.agents || []).flatMap(agent =>
        (agent.activities || []).flatMap(activity => {
          if (activity.type === "failed") {
            return [{...activity, productId, agentName: agent.name, agentId: agent.activityGroupId || agent.id, calendarType: "failed", calendarDate: new Date(activity.date)}];
          }
          if (isPublicPublishedOutcome(activity)) {
            return [{...activity, productId, agentName: agent.name, agentId: agent.activityGroupId || agent.id, calendarType: "published", calendarDate: new Date(activity.date)}];
          }
          if (activity.type === "scheduled") {
            const state = scheduledActivityState(activity, {...agent, source: product.source}, now.getTime());
            const nextDate = state.date;
            if (nextDate <= scheduleLimit) {
              return [{
                ...activity,
                productId,
                agentName: agent.name,
                agentId: agent.activityGroupId || agent.id,
                calendarType: state.status,
                calendarDate: nextDate,
                url: state.run?.html_url || activity.url
              }];
            }
          }
          return [];
        })
      ));

    return items.filter(item => {
      if (!["scheduled", "delayed", "awaiting"].includes(item.calendarType)) return true;
      return !items.some(published =>
        published.calendarType === "published" &&
        published.productId === item.productId &&
        published.agentId === item.agentId &&
        sameCalendarDay(published.calendarDate, item.calendarDate)
      );
    });
  }

  function sameCalendarDay(left, right) {
    return left.getFullYear() === right.getFullYear() &&
      left.getMonth() === right.getMonth() &&
      left.getDate() === right.getDate();
  }

  function renderItem(item) {
    const scheduled = item.calendarType === "scheduled";
    const delayed = item.calendarType === "delayed";
    const awaiting = item.calendarType === "awaiting";
    const queued = item.calendarType === "queued";
    const running = item.calendarType === "running";
    const failed = item.calendarType === "failed";
    const itemClass = failed ? "failed" : running ? "running" : queued ? "queued" : awaiting ? "awaiting" : delayed ? "delayed" : scheduled ? "scheduled" : "published";
    const completedLabel = item.taskType === "article-update" || item.status === "Updated" ? "✓ Updated" : "✓ Published";
    const itemLabel = failed ? "! Failed" : running ? "● Running" : queued ? "◌ Queued" : awaiting ? "◌ Awaiting status" : delayed ? "◷ Delayed" : scheduled ? "◷ Scheduled" : completedLabel;
    const taskTime = new Intl.DateTimeFormat("en-US", {hour: "numeric", minute: "2-digit"}).format(item.calendarDate);
    const tag = item.url ? "a" : "div";
    const linkAttributes = item.url
      ? ` href="${escapeHtml(item.url)}" target="_blank" rel="noopener"`
      : "";
    const cleanTitle = String(item.title || "").replace(/^(?:Published|Updated)\s+/i, "");
    return `
      <${tag} class="calendar-outcome ${itemClass}" data-product="${escapeHtml(item.productId)}"${linkAttributes}>
        <span class="calendar-product">${itemLabel} · ${escapeHtml(productNames[item.productId] || item.productId)} · ${escapeHtml(taskTime)}</span>
        <span class="calendar-task-title">${escapeHtml(cleanTitle)}</span>
        <span class="calendar-agent">Agent: ${escapeHtml(item.agentName || "Unassigned")}</span>
      </${tag}>
    `;
  }

  function populateCalendarAgentFilter(preferredValue = agentFilter.value || "all") {
    const products = window.PRODUCT_AGENT_DATA || {};
    const agents = productFilter.value === "all"
      ? Object.entries(products)
          .filter(([productId]) => productId !== "all")
          .flatMap(([, product]) => product.agents || [])
      : products[productFilter.value]?.agents || [];
    const uniqueAgents = [...new Map(agents.map(agent => [
      agent.activityGroupId || agent.id,
      {id: agent.activityGroupId || agent.id, name: agent.name.split(" · ")[0]}
    ])).values()];
    agentFilter.innerHTML = `
      <option value="all">All agents</option>
      ${uniqueAgents.map(agent => `<option value="${escapeHtml(agent.id)}">${escapeHtml(agent.name)}</option>`).join("")}
    `;
    agentFilter.value = uniqueAgents.some(agent => agent.id === preferredValue) ? preferredValue : "all";
  }

  function renderCalendar() {
    const selectedProduct = productFilter.value;
    const selectedAgent = agentFilter.value;
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const gridStart = new Date(year, month, 1 - firstDay.getDay());
    const today = new Date();
    const items = calendarItems().filter(item =>
      (selectedProduct === "all" || item.productId === selectedProduct) &&
      (selectedAgent === "all" || item.agentId === selectedAgent)
    );

    monthLabel.textContent = new Intl.DateTimeFormat("en-US", {
      month: "long", year: "numeric"
    }).format(visibleMonth);

    const cells = [];
    for (let offset = 0; offset < 42; offset += 1) {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + offset);
      const dayItems = items
        .filter(item => sameCalendarDay(item.calendarDate, day))
        .sort((left, right) => left.calendarDate - right.calendarDate);
      cells.push(`
        <div class="calendar-day ${day.getMonth() !== month ? "muted" : ""} ${sameCalendarDay(day, today) ? "today" : ""}">
          <span class="calendar-day-number">${day.getDate()}</span>
          <div class="calendar-outcomes">${dayItems.map(renderItem).join("")}</div>
        </div>
      `);
    }
    calendarGrid.innerHTML = cells.join("");
  }

  function setCalendarOpen(open) {
    calendarOpen = Boolean(open);
    calendarView.hidden = !calendarOpen;
    operationsView.hidden = calendarOpen;
    toggleButton.classList.toggle("active", calendarOpen);
    toggleButton.setAttribute("aria-pressed", String(calendarOpen));
    toggleButton.textContent = calendarOpen ? "← Operations view" : "▦ Calendar view";
    if (calendarOpen) renderCalendar();
  }

  function dashboardState() {
    return {
      product: document.querySelector(".product-tabs [data-product].active")?.dataset.product || "poptin",
      agent: selectedAgentId,
      view: calendarOpen ? "calendar" : "operations",
      activityFilter,
      activityProductFilter,
      activityAgentFilter,
      agentSearch: document.querySelector("#agentSearch")?.value || "",
      calendarProduct: productFilter.value,
      calendarAgent: agentFilter.value,
      calendarMonth: `${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth() + 1).padStart(2, "0")}`
    };
  }

  function saveDashboardState() {
    try {
      localStorage.setItem(stateKey, JSON.stringify(dashboardState()));
    } catch (error) {
      console.warn("Dashboard state could not be saved.", error);
    }
  }

  function restoreDashboardState() {
    let saved;
    try {
      saved = JSON.parse(localStorage.getItem(stateKey) || "null");
    } catch (error) {
      localStorage.removeItem(stateKey);
      return;
    }
    if (!saved) return;

    if (saved.product && window.PRODUCT_AGENT_DATA?.[saved.product]) {
      window.selectMarketingProduct(saved.product);
    }

    if (saved.agent && data?.agents?.some(agent => agent.id === saved.agent)) {
      selectedAgentId = saved.agent;
    }
    if (["all", "past", "scheduled", "failed"].includes(saved.activityFilter)) {
      activityFilter = saved.activityFilter;
    }
    if (saved.activityProductFilter && window.PRODUCT_AGENT_DATA?.[saved.activityProductFilter]) {
      activityProductFilter = saved.activityProductFilter;
    }
    activityAgentFilter = saved.activityAgentFilter || "all";

    const search = document.querySelector("#agentSearch");
    if (search) search.value = saved.agentSearch || "";
    const activityProduct = document.querySelector("#activityProductFilter");
    if (activityProduct) activityProduct.value = activityProductFilter;

    renderDashboard();
    document.querySelectorAll(".filter").forEach(button =>
      button.classList.toggle("active", button.dataset.filter === activityFilter)
    );

    if (saved.calendarProduct && [...productFilter.options].some(option => option.value === saved.calendarProduct)) {
      productFilter.value = saved.calendarProduct;
    }
    populateCalendarAgentFilter(saved.calendarAgent || "all");
    if (/^\d{4}-\d{2}$/.test(saved.calendarMonth || "")) {
      const [year, month] = saved.calendarMonth.split("-").map(Number);
      visibleMonth = new Date(year, month - 1, 1);
    }
    setCalendarOpen(saved.view === "calendar");
  }

  toggleButton.addEventListener("click", () => {
    const openingCalendar = !calendarOpen;
    if (openingCalendar) {
      const now = new Date();
      visibleMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      productFilter.value = "all";
      populateCalendarAgentFilter("all");
    }
    setCalendarOpen(openingCalendar);
    saveDashboardState();
  });
  productFilter.addEventListener("change", () => {
    populateCalendarAgentFilter("all");
    renderCalendar();
    saveDashboardState();
  });
  agentFilter.addEventListener("change", () => {
    renderCalendar();
    saveDashboardState();
  });
  document.addEventListener("marketingActivityUpdated", () => {
    if (calendarOpen) renderCalendar();
  });
  document.querySelector("#calendarPreviousMonth").addEventListener("click", () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
    renderCalendar();
    saveDashboardState();
  });
  document.querySelector("#calendarNextMonth").addEventListener("click", () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
    renderCalendar();
    saveDashboardState();
  });

  document.addEventListener("click", event => {
    if (event.target.closest?.("[data-product], [data-agent-id], .filter")) {
      setTimeout(saveDashboardState, 0);
    }
  });
  document.addEventListener("change", event => {
    if (event.target.matches?.("#activityProductFilter, #activityAgentFilter")) {
      setTimeout(saveDashboardState, 0);
    }
  });
  document.querySelector("#agentSearch")?.addEventListener("input", () => {
    setTimeout(saveDashboardState, 0);
  });
  window.addEventListener("beforeunload", saveDashboardState);

  populateCalendarAgentFilter();
  restoreDashboardState();
})();
