(() => {
  const poptinData = window.AGENT_DATA;
  const productData = {
    poptin: poptinData,
    chatway: {
      source: "poptins/chatway-agents",
      lastUpdated: "2026-07-22T08:20:00+03:00",
      agents: [
        {
          id: "seo",
          name: "SEO Agent",
          role: "SEO/GEO/AEO research & publishing",
          initials: "SE",
          status: "active",
          color: "#d9eee4",
          ink: "#18543d",
          task: "Creates original 2,000–3,000 word Chatway blog articles optimized for SEO, GEO, and AEO. It adds the Chatway summary and key-takeaways box, selects a relevant existing category, builds internal links, uses trustworthy non-competitor external sources, places Pexels images between relevant paragraphs, and generates a Chatway-format cover image before publishing through WordPress.",
          owner: "Chatway Content & SEO",
          cadence: "Every 4 days + on demand",
          priority: "High",
          activities: [
            {
              type: "past",
              title: "Published live-chat response-time guide",
              detail: "Published the first production Chatway SEO article with its cover image, summary box, internal links, trusted sources, relevant category, and inline images.",
              date: "2026-07-21T21:00:00+03:00",
              url: "https://chatway.app/blog/live-chat-response-time-guide",
              assetLabel: "View blog post"
            },
            {
              type: "past",
              title: "Completed article presentation repairs",
              detail: "Placed article images contextually, removed duplicate takeaways and the extra Answer paragraph, and confirmed the final Chatway summary format.",
              date: "2026-07-22T00:15:00+03:00",
              url: "https://github.com/poptins/chatway-agents/issues/15",
              assetLabel: "Open verified repair"
            },
            {
              type: "scheduled",
              title: "Check next SEO article window",
              detail: "GitHub checks daily at 05:00 UTC and publishes only when the latest Chatway SEO article is at least four days old.",
              date: "2026-07-23T08:00:00+03:00",
              scheduleUtc: "05:00",
              url: "https://github.com/poptins/chatway-agents/actions/workflows/seo-agent.yml",
              assetLabel: "Open SEO workflow"
            }
          ]
        },
        {
          id: "social",
          name: "Social Media Agent",
          role: "Buffer distribution with cover images",
          initials: "SM",
          status: "active",
          color: "#f4e6cc",
          ink: "#764c12",
          task: "Watches the latest published Chatway article, creates distinct LinkedIn, Facebook, and X copy using verified product claims, attaches the article’s featured cover image, and sends each post to the matching Buffer queue. Before every handoff it checks scheduled and sent posts per channel to prevent duplicates.",
          owner: "Chatway Social & Brand",
          cadence: "Hourly at minute 17 + on demand",
          priority: "High",
          activities: [
            {
              type: "past",
              title: "Scheduled response-time guide on three channels",
              detail: "Handed the article and its cover image to Chatway’s LinkedIn, Facebook, and X Buffer channels.",
              date: "2026-07-21T21:38:00+03:00",
              url: "https://github.com/poptins/chatway-agents/issues/20",
              assetLabel: "Open cover verification"
            },
            {
              type: "past",
              title: "Verified hourly duplicate protection",
              detail: "A GitHub Actions test found the existing LinkedIn, Facebook, and X handoffs and correctly skipped all three without creating another Buffer post.",
              date: "2026-07-22T08:16:11+03:00",
              url: "https://github.com/poptins/chatway-agents/issues/23",
              assetLabel: "Open dedup test"
            },
            {
              type: "scheduled",
              title: "Check for a newly published article",
              detail: "At minute 17 of every hour, check the latest Chatway blog post and hand it to Buffer only when that article has not already been sent to each channel.",
              date: "2026-07-22T09:17:00+03:00",
              schedule: {frequency: "hourly", minuteUtc: 17},
              url: "https://github.com/poptins/chatway-agents/actions/workflows/social-agent.yml",
              assetLabel: "Open Social workflow"
            }
          ]
        },
        {
          id: "glossary",
          name: "Glossary Agent",
          role: "Chatway glossary publisher",
          initials: "GL",
          status: "active",
          color: "#e9e2f2",
          ink: "#5d4378",
          task: "Creates one unique Chatway glossary entry using the existing site format exactly: Definition, Why It Matters, Real-Life Use Case or Use Cases, and three to four FAQs. It covers live chat, customer service, helpdesk operations, ecommerce, SaaS, analytics, automation, privacy, and customer experience without inventing product or legal claims.",
          owner: "Chatway Content & SEO",
          cadence: "Daily at 06:15 UTC + on demand",
          priority: "Medium",
          activities: [
            {
              type: "past",
              title: "Published and verified first glossary entry",
              detail: "The production smoke test successfully created a Chatway glossary term through the shared website, blog, and glossary WordPress credentials.",
              date: "2026-07-21T22:00:00+03:00",
              url: "https://github.com/poptins/chatway-agents/issues/9",
              assetLabel: "Open publishing test"
            },
            {
              type: "scheduled",
              title: "Publish daily Chatway glossary term",
              detail: "Create, validate, and publish one non-duplicate term in the established Chatway glossary structure.",
              date: "2026-07-23T09:15:00+03:00",
              scheduleUtc: "06:15",
              url: "https://github.com/poptins/chatway-agents/actions/workflows/glossary-agent.yml",
              assetLabel: "Open Glossary workflow"
            }
          ]
        },
        {
          id: "optimization",
          name: "Optimization Agent",
          role: "Search Console opportunities & permissions",
          initials: "OP",
          status: "active",
          color: "#dff0ee",
          ink: "#17645c",
          task: "Runs only when Find opportunities is requested. It reads the last 28 days of Chatway Search Console page performance, selects the first 10 high-impression, low-CTR opportunities in useful ranking positions, identifies the correct blog, glossary, or page REST endpoint, and verifies authenticated WordPress edit permission for every result. Discovery never writes to WordPress.",
          owner: "Chatway Growth & SEO",
          cadence: "On demand",
          priority: "High",
          activities: [
            {
              type: "past",
              title: "Verified first 10 Search Console opportunities",
              detail: "The GitHub-only test found 10 Chatway opportunities and confirmed authenticated WordPress edit access for all 10.",
              date: "2026-07-22T08:15:02+03:00",
              url: "https://github.com/poptins/chatway-agents/issues/22",
              assetLabel: "Open Search Console test"
            }
          ]
        }
      ]
    }
  };
  let activeProduct = sessionStorage.getItem("marketingBoardProduct") || "poptin";
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
    const footerSource = document.querySelector("footer span:last-child");
    if (footerSource) footerSource.textContent = `Activity snapshot sourced from ${data.source}`;
    renderDashboard();
  }

  document.querySelectorAll("[data-product]").forEach(button => {
    button.addEventListener("click", () => selectProduct(button.dataset.product));
  });
  selectProduct(activeProduct in productData ? activeProduct : "poptin");
})();
