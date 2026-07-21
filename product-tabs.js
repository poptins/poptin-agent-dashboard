(() => {
  const poptinData = window.AGENT_DATA;
  const productData = {
    poptin: poptinData,
    chatway: {
      lastUpdated: new Date().toISOString(),
      agents: [
        {id:"seo",name:"SEO Agent",role:"SEO research & publishing",initials:"SE",status:"standby",color:"#d9eee4",ink:"#18543d",task:"Creates long-form search content for the Chatway blog using one shared Chatway WordPress connection.",owner:"Chatway Content & SEO",cadence:"Daily check + on demand",priority:"High",activities:[]},
        {id:"social",name:"Social Media Agent",role:"Social strategy & distribution",initials:"SM",status:"standby",color:"#f4e6cc",ink:"#764c12",task:"Creates channel-specific social drafts for Chatway using verified product claims.",owner:"Chatway Social & Brand",cadence:"Hourly + on demand",priority:"High",activities:[]},
        {id:"academy",name:"Academy Agent",role:"Customer-support education",initials:"AC",status:"standby",color:"#dceaf3",ink:"#245a7a",task:"Creates practical Chatway Academy guides about live chat and customer-support best practices.",owner:"Chatway Academy",cadence:"Weekly + on demand",priority:"Medium",activities:[]},
        {id:"glossary",name:"Glossary Agent",role:"Support glossary publisher",initials:"GL",status:"standby",color:"#e9e2f2",ink:"#5d4378",task:"Creates plain-English glossary entries for live chat, support, helpdesk, ecommerce, SaaS, and customer experience.",owner:"Chatway Academy",cadence:"Daily + on demand",priority:"Medium",activities:[]},
        {id:"optimization",name:"Optimization Agent",role:"Search Console opportunities",initials:"OP",status:"standby",color:"#dff0ee",ink:"#17645c",task:"Finds the first 10 Search Console opportunities on demand and checks edit access using the shared Chatway WordPress credentials.",owner:"Chatway Growth & SEO",cadence:"On demand",priority:"High",activities:[]}
      ]
    }
  };
  let activeProduct = sessionStorage.getItem("marketingBoardProduct") || "poptin";
  const renderPoptinQueue = renderRecommendationQueue;

  function renderChatwayOptimizationQueue() {
    const grid = $("#recommendationGrid");
    const timeline = $("#activityTimeline");
    const status = $("#approvalStatus");
    grid.hidden = false;
    status.hidden = false;
    timeline.hidden = true;
    grid.innerHTML = `
      <article class="recommendation-card opportunity-launcher">
        <div class="recommendation-top"><span class="property-pill">Chatway</span><span class="readiness ready">GitHub configured</span></div>
        <h3>Find Chatway opportunities</h3>
        <p>The on-demand workflow returns the first 10 Search Console findings and verifies edit access with the single Chatway WordPress credential pair.</p>
        <div class="recommendation-actions">
          <a class="approve-button product-action-link" href="https://github.com/poptins/chatway-agents/actions/workflows/optimization-agent.yml" target="_blank" rel="noopener">Open Find opportunities ↗</a>
        </div>
      </article>`;
    status.textContent = "Chatway automation remains gated until its repository secrets and ENABLE_CHATWAY_AUTOMATION variable are configured.";
  }

  renderRecommendationQueue = function () {
    if (activeProduct === "chatway") {
      const isOptimization = selectedAgentId === "optimization" || activityAgentFilter === "optimization";
      const grid = $("#recommendationGrid");
      const timeline = $("#activityTimeline");
      const status = $("#approvalStatus");
      if (isOptimization) {
        renderChatwayOptimizationQueue();
      } else {
        grid.hidden = true;
        status.hidden = true;
        timeline.hidden = false;
      }
      return;
    }
    renderPoptinQueue();
  };

  function selectProduct(productId) {
    activeProduct = productId;
    sessionStorage.setItem("marketingBoardProduct", productId);
    data = productData[productId];
    window.AGENT_DATA = data;
    selectedAgentId = data.agents[0]?.id;
    activityFilter = "all";
    activityAgentFilter = "all";
    document.querySelectorAll("[data-product]").forEach(button => {
      const selected = button.dataset.product === productId;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-selected", String(selected));
    });
    const productName = productId === "poptin" ? "Poptin" : "Chatway";
    document.querySelector(".hero-copy").innerHTML = `Live operations view for <strong>${productName}</strong> marketing agents.`;
    renderDashboard();
  }

  document.querySelectorAll("[data-product]").forEach(button => {
    button.addEventListener("click", () => selectProduct(button.dataset.product));
  });
  selectProduct(activeProduct in productData ? activeProduct : "poptin");
})();
