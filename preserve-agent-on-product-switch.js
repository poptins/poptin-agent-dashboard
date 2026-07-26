(() => {
  let agentTypeBeforeSwitch = "seo";

  function selectedAgentType() {
    const selected = data?.agents?.find(agent => agent.id === selectedAgentId);
    return selected?.activityGroupId || selected?.id || "seo";
  }

  document.addEventListener("click", event => {
    const productButton = event.target.closest?.("[data-product]");
    if (!productButton) return;
    agentTypeBeforeSwitch = selectedAgentType();
  }, true);

  document.addEventListener("click", event => {
    const productButton = event.target.closest?.("[data-product]");
    if (!productButton) return;

    const productId = productButton.dataset.product;
    const destination = window.PRODUCT_AGENT_DATA?.[productId];
    if (!destination?.agents?.length) return;

    const matchingAgent = destination.agents.find(agent =>
      (agent.activityGroupId || agent.id) === agentTypeBeforeSwitch
    );
    const fallbackAgent = destination.agents.find(agent =>
      (agent.activityGroupId || agent.id) === "seo"
    ) || destination.agents[0];
    const nextAgent = matchingAgent || fallbackAgent;

    selectedAgentId = nextAgent.id;
    activityProductFilter = productId;
    activityAgentFilter = nextAgent.id;

    const productFilter = document.querySelector("#activityProductFilter");
    if (productFilter) productFilter.value = productId;
    renderDashboard();
  });
})();
