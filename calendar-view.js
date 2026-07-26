(() => {
  const dialog = document.querySelector("#calendarDialog");
  const openButton = document.querySelector("#calendarViewButton");
  const closeButton = document.querySelector("#calendarCloseButton");
  const productFilter = document.querySelector("#calendarProductFilter");
  const monthLabel = document.querySelector("#calendarMonthLabel");
  const calendarGrid = document.querySelector("#calendarGrid");
  let visibleMonth = new Date();
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

  function publishedOutcomes() {
    const products = window.PRODUCT_AGENT_DATA || {};
    return Object.entries(products)
      .filter(([productId]) => productId !== "all")
      .flatMap(([productId, product]) => (product.agents || []).flatMap(agent =>
        (agent.activities || [])
          .filter(isPublicPublishedOutcome)
          .map(activity => ({...activity, productId, agentName: agent.name}))
      ));
  }

  function sameCalendarDay(left, right) {
    return left.getFullYear() === right.getFullYear() &&
      left.getMonth() === right.getMonth() &&
      left.getDate() === right.getDate();
  }

  function renderCalendar() {
    const selectedProduct = productFilter.value;
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const gridStart = new Date(year, month, 1 - firstDay.getDay());
    const today = new Date();
    const outcomes = publishedOutcomes().filter(item =>
      selectedProduct === "all" || item.productId === selectedProduct
    );

    monthLabel.textContent = new Intl.DateTimeFormat("en-US", {
      month: "long", year: "numeric"
    }).format(visibleMonth);

    const cells = [];
    for (let offset = 0; offset < 42; offset += 1) {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + offset);
      const dayOutcomes = outcomes
        .filter(item => sameCalendarDay(new Date(item.date), day))
        .sort((left, right) => new Date(left.date) - new Date(right.date));
      cells.push(`
        <div class="calendar-day ${day.getMonth() !== month ? "muted" : ""} ${sameCalendarDay(day, today) ? "today" : ""}">
          <span class="calendar-day-number">${day.getDate()}</span>
          <div class="calendar-outcomes">
            ${dayOutcomes.map(item => `
              <a class="calendar-outcome" data-product="${escapeHtml(item.productId)}" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">
                <span class="calendar-product">${escapeHtml(productNames[item.productId] || item.productId)}</span>
                ${escapeHtml(item.title.replace(/^Published\s+/i, ""))}
              </a>
            `).join("")}
          </div>
        </div>
      `);
    }
    calendarGrid.innerHTML = cells.join("");
  }

  openButton.addEventListener("click", () => {
    renderCalendar();
    dialog.showModal();
  });
  closeButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
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
