(() => {
  const calendarView = document.querySelector("#calendarView");
  const operationsView = document.querySelector("#operationsView");
  const toggleButton = document.querySelector("#calendarViewButton");
  const productFilter = document.querySelector("#calendarProductFilter");
  const monthLabel = document.querySelector("#calendarMonthLabel");
  const calendarGrid = document.querySelector("#calendarGrid");
  let visibleMonth = new Date();
  let calendarOpen = false;
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);

  const productNames = {poptin: "Poptin", chatway: "Chatway", prospero: "Prospero"};

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[character]);
  }

  function isPublicPublishedOutcome(activity) {
    if (activity.type !== "past" || !/^https?:\/\//i.test(activity.url || "")) return false;
    if (/github\.com/i.test(activity.url)) return false;
    const signal = `${activity.title || ""} ${activity.assetLabel || ""}`.toLowerCase();
    return signal.includes("published") ||
      signal.includes("view blog post") ||
      signal.includes("view academy guide") ||
      signal.includes("view glossary term") ||
      signal.includes("view published article");
  }

  function calendarItems() {
    const products = window.PRODUCT_AGENT_DATA || {};
    const now = new Date();
    const scheduleLimit = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return Object.entries(products)
      .filter(([productId]) => productId !== "all")
      .flatMap(([productId, product]) => (product.agents || []).flatMap(agent =>
        (agent.activities || []).flatMap(activity => {
          if (isPublicPublishedOutcome(activity)) {
            return [{...activity, productId, agentName: agent.name, calendarType: "published", calendarDate: new Date(activity.date)}];
          }
          if (activity.type === "scheduled") {
            const nextDate = activityDate(activity);
            if (nextDate > now && nextDate <= scheduleLimit) {
              return [{...activity, productId, agentName: agent.name, calendarType: "scheduled", calendarDate: nextDate}];
            }
          }
          return [];
        })
      ));
  }

  function sameCalendarDay(left, right) {
    return left.getFullYear() === right.getFullYear() &&
      left.getMonth() === right.getMonth() &&
      left.getDate() === right.getDate();
  }

  function renderItem(item) {
    const scheduled = item.calendarType === "scheduled";
    const tag = item.url ? "a" : "div";
    const linkAttributes = item.url
      ? ` href="${escapeHtml(item.url)}" target="_blank" rel="noopener"`
      : "";
    const cleanTitle = String(item.title || "").replace(/^Published\s+/i, "");
    return `
      <${tag} class="calendar-outcome ${scheduled ? "scheduled" : "published"}" data-product="${escapeHtml(item.productId)}"${linkAttributes}>
        <span class="calendar-product">${scheduled ? "◷ Scheduled" : "✓ Published"} · ${escapeHtml(productNames[item.productId] || item.productId)}</span>
        <span class="calendar-task-title">${escapeHtml(cleanTitle)}</span>
        <span class="calendar-agent">Agent: ${escapeHtml(item.agentName || "Unassigned")}</span>
      </${tag}>
    `;
  }

  function renderCalendar() {
    const selectedProduct = productFilter.value;
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const gridStart = new Date(year, month, 1 - firstDay.getDay());
    const today = new Date();
    const items = calendarItems().filter(item =>
      selectedProduct === "all" || item.productId === selectedProduct
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

  toggleButton.addEventListener("click", () => {
    calendarOpen = !calendarOpen;
    calendarView.hidden = !calendarOpen;
    operationsView.hidden = calendarOpen;
    toggleButton.classList.toggle("active", calendarOpen);
    toggleButton.setAttribute("aria-pressed", String(calendarOpen));
    toggleButton.textContent = calendarOpen ? "← Operations view" : "▦ Calendar view";
    if (calendarOpen) renderCalendar();
  });
  productFilter.addEventListener("change", renderCalendar);
  document.querySelector("#calendarPreviousMonth").addEventListener("click", () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
    renderCalendar();
  });
  document.querySelector("#calendarNextMonth").addEventListener("click", () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
    renderCalendar();
  });
})();
