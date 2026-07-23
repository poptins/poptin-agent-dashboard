(() => {
  const poptinData = window.AGENT_DATA;
  const productData = {
    poptin: poptinData,
    chatway: {
      source: "poptins/chatway-agents",
      lastUpdated: "2026-07-23T12:00:00+03:00",
      agents: [
        {
          id: "seo",
          name: "SEO Agent",
          role: "SEO/GEO/AEO research & publishing",
          initials: "SE",
          status: "active",
          color: "#d9eee4",
          ink: "#18543d",
          instructions: ["Research a useful Chatway topic with clear SEO, GEO, and AEO potential.","Write an original 2,000-3,000 word article grounded in trustworthy non-competitor sources.","Add the approved Chatway summary and key-takeaways box.","Select the most relevant existing WordPress category and attach 3-6 relevant tags, reusing existing tags whenever they fit.","Build contextual internal links using approved Chatway URLs.","Place relevant Pexels images between the paragraphs they support.","Generate a branded Chatway-format cover image.","Validate factual accuracy, structure, metadata, links, images, and duplicate risk before publishing.","Publish the approved article through WordPress when the current 4- or 5-day cadence is due."],
          owner: "Chatway Content & SEO",
          cadence: "Every 4-5 days + on demand",
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
          instructions: ["Monitor Chatway for the latest confirmed published article.","Reject articles that have already been handed off or shared.","Create distinct platform-appropriate copy for LinkedIn, Facebook, and X.","Use only verified Chatway product claims and article facts.","Attach the published article's featured cover image.","Check scheduled and sent Buffer posts separately for every channel.","Schedule the first approved post about five minutes after handoff, then use a separate random 5-10 minute gap before each remaining channel."],
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
          instructions: ["Choose one unique term related to live chat, customer service, helpdesk operations, ecommerce, SaaS, analytics, automation, privacy, or customer experience.","Check the published Chatway glossary and reject duplicate or near-duplicate terms.","Use the existing structure exactly: Definition, Why It Matters, Real-Life Use Case or Use Cases, and three to four FAQs.","Write clear, practical explanations grounded in reliable sources.","Do not invent Chatway product capabilities, statistics, legal claims, or compliance guarantees.","Validate the entry and publish only when every quality check passes."],
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
          instructions: ["Run every day and whenever a user requests Find opportunities.","Read the last 28 days of Chatway Search Console page and query performance.","Select and rank the first 10 high-impression, low-CTR pages in useful ranking positions.","Read each page's current SEO title, meta description, language, and leading search queries.","Generate an exact locale-aware suggested SEO title and meta description without unsupported claims.","Identify the correct blog, glossary, or page WordPress REST endpoint.","Verify authenticated WordPress edit permission for every result.","Show current-versus-suggested metadata, evidence, and permission status in the dashboard.","Never write to WordPress during discovery."],
          owner: "Chatway Growth & SEO",
          cadence: "Daily at 07:45 IDT + on demand",
          priority: "High",
          activities: [
            {
              type: "scheduled",
              title: "Run daily Chatway opportunity scan",
              detail: "Refresh Search Console opportunities and exact title and meta-description suggestions every day at 04:45 UTC.",
              date: "2026-07-23T07:45:00+03:00",
              scheduleUtc: "04:45",
              url: "https://github.com/poptins/chatway-agents/actions/workflows/optimization-agent.yml",
              assetLabel: "Open Optimization workflow"
            },
            {
              type: "past",
              title: "Verified scheduled Chatway opportunity scan",
              detail: "Enabled the daily schedule and completed a successful production verification run.",
              date: "2026-07-22T12:45:00+03:00",
              url: "https://github.com/poptins/chatway-agents/actions/workflows/optimization-agent.yml",
              assetLabel: "Open successful scan"
            },
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
      ,
        {
          id: "update-blog",
          name: "Update Blog Agent",
          role: "Old article refresh & optimization",
          initials: "UP",
          status: "active",
          color: "#e7ecff",
          ink: "#384c96",
          instructions: ["Run independently from the SEO Agent on six spaced candidate days each month.","Choose a deterministic target of four to six old articles per month and update at most one per run.","Select a published article older than one year that has not already been refreshed that month.","Preserve its post ID, slug, URL, existing category, tags, and featured image.","Rewrite outdated content and improve accuracy, SEO, answer-first structure, headings, examples, spelling, grammar, and internal links.","Add a site-matched Summary and four to six Key takeaways without duplicating existing blocks.","Never add editorial image suggestions, placeholders, or production notes.","Set the publication date to the refresh date and verify the saved slug and URL are unchanged."],
          owner: "Chatway Content & SEO",
          cadence: "4-6 articles monthly on spaced days",
          priority: "High",
          activities: [{
            type: "scheduled",
            title: "Refresh the next eligible old Chatway article",
            detail: "Update one old article on the next selected monthly slot while preserving its exact URL.",
            date: "2026-07-28T09:40:00+03:00",
            scheduleUtc: "06:40 on days 3, 8, 13, 18, 23, and 28",
            url: "https://github.com/poptins/chatway-agents/actions/workflows/update-blog-agent.yml",
            assetLabel: "Open Update Blog workflow"
          }]
        },
      ]
    }, 
    prospero: {
      source: "poptins/prospero-agents",
      lastUpdated: "2026-07-23T12:00:00+03:00",
      agents: [
        {
          id: "seo",
          name: "SEO Agent",
          role: "SEO/GEO/AEO research & publishing",
          initials: "SE",
          status: "active",
          color: "#eee9ff",
          ink: "#4f3ea8",
          instructions: [
            "Check the latest published Prospero article and publish only when the selected interval for the cycle is four or five days.",
            "Choose a useful, non-duplicate topic about proposals, templates, e-signatures, client workflows, sales enablement, freelance business, or proposal analytics.",
            "Write an original 2,000-3,000 word SEO, GEO, and AEO article grounded in trustworthy non-competitor sources.",
            "Add an answer summary and four to six key takeaways above the first article paragraph.",
            "Generate the SEO title, focus keyphrase, meta description, excerpt, and slug.",
            "Choose one relevant existing WordPress category and attach three to six relevant tags, reusing existing tags whenever possible.",
            "Add three to five verified Prospero internal links and at least two authoritative external citations.",
            "Generate a full-bleed editorial-photo cover with a black lower-left title panel and large white text in the existing Prospero blog format.",
            "Add two to three relevant Pexels images with accurate alt text and captions.",
            "Add direct FAQ answers, validate article quality and duplicate risk, upload the media, and publish through authenticated WordPress."
          ],
          owner: "Prospero Content & SEO",
          cadence: "Every 4-5 days + on demand",
          priority: "High",
          activities: [
            {
              type: "past",
              title: "Published and repaired the first Prospero SEO article",
              detail: "Published the proposal-template workflow article, corrected the cover, distributed all three inline images through the article, and normalized the summary and takeaway typography.",
              date: "2026-07-22T12:33:00+03:00",
              url: "https://goprospero.com/blog/how-to-build-a-proposal-template-client-workflow/",
              assetLabel: "View published article"
            },
            {
              type: "past",
              title: "Created the Prospero SEO publishing system",
              detail: "Added long-form SEO, GEO, and AEO publishing with top summaries, key takeaways, metadata, categories, tags, verified links, inline images, and the established Prospero cover format.",
              date: "2026-07-22T11:30:00+03:00",
              url: "https://github.com/poptins/prospero-agents/blob/main/agents/content_agent.py",
              assetLabel: "Open SEO agent"
            },
            {
              type: "scheduled",
              title: "Check the next Prospero article window",
              detail: "GitHub checks daily and publishes only when the latest Prospero article satisfies the current variable four- or five-day interval.",
              date: "2026-07-23T08:00:00+03:00",
              scheduleUtc: "05:00",
              url: "https://github.com/poptins/prospero-agents/actions/workflows/seo-agent.yml",
              assetLabel: "Open SEO workflow"
            }
          ]
        },
        {
          id: "update-blog",
          name: "Update Blog Agent",
          role: "Old article refresh & optimization",
          initials: "UP",
          status: "active",
          color: "#e7ecff",
          ink: "#384c96",
          instructions: ["Run independently from the SEO Agent on six spaced candidate days each month.","Choose a deterministic target of four to six old articles per month and update at most one per run.","Select a published article older than one year that has not already been refreshed that month.","Preserve its post ID, slug, URL, existing category, tags, and featured image.","Rewrite outdated content and improve accuracy, SEO, answer-first structure, headings, proposal examples, spelling, grammar, and internal links.","Add the Prospero Summary and four to six Key takeaways using inherited site typography.","Never add editorial image suggestions, placeholders, or production notes.","Set the publication date to the refresh date and verify the saved slug and URL are unchanged."],
          owner: "Prospero Content & SEO",
          cadence: "4-6 articles monthly on spaced days",
          priority: "High",
          activities: [{
            type: "scheduled",
            title: "Refresh the next eligible old Prospero article",
            detail: "Update one old article on the next selected monthly slot while preserving its exact URL.",
            date: "2026-07-28T10:00:00+03:00",
            scheduleUtc: "07:00 on days 3, 8, 13, 18, 23, and 28",
            url: "https://github.com/poptins/prospero-agents/actions/workflows/update-blog-agent.yml",
            assetLabel: "Open Update Blog workflow"
          }]
        },
        {
          id: "social",
          name: "Social Media Agent",
          role: "Buffer distribution with cover images",
          initials: "SM",
          status: "active",
          color: "#e9f7f4",
          ink: "#17645c",
          instructions: [
            "Monitor Prospero for the latest confirmed published article.",
            "Require and validate the article's public featured cover image.",
            "Create distinct, factual, platform-appropriate copy for LinkedIn, Facebook, and X.",
            "Include the published article URL in every social post.",
            "Locate the matching Buffer channel and respect paused queues.",
            "Check scheduled and sent posts separately for every channel to prevent duplicate handoffs.",
            "Attach the WordPress featured cover image and custom-schedule the first post about five minutes after handoff, with independently randomized 5-10 minute gaps between later channels.",
            "Report every queued or skipped result in the GitHub Actions log."
          ],
          owner: "Prospero Social & Brand",
          cadence: "Hourly at minute 17 + on demand",
          priority: "High",
          activities: [
            {
              type: "past",
              title: "Regrouped Prospero Buffer posts",
              detail: "Replaced channel queue slots with exact custom schedules and verified the current LinkedIn, X, and Facebook posts were grouped together. Future gaps are independently randomized between 5 and 10 minutes.",
              date: "2026-07-22T13:02:00+03:00",
              url: "https://github.com/poptins/prospero-agents/actions/runs/29910326035",
              assetLabel: "Open successful Buffer repair"
            },
            {
              type: "past",
              title: "Created the Prospero social handoff",
              detail: "Added distinct LinkedIn, Facebook, and X copy, featured-cover attachments, Buffer queue matching, paused-queue handling, and per-channel duplicate protection.",
              date: "2026-07-22T11:35:00+03:00",
              url: "https://github.com/poptins/prospero-agents/blob/main/social-agent/main.py",
              assetLabel: "Open Social agent"
            },
            {
              type: "scheduled",
              title: "Check for a newly published Prospero article",
              detail: "At minute 17 of every hour, inspect the latest Prospero article and hand it to Buffer only when it has not already been sent to each selected channel.",
              date: "2026-07-22T13:17:00+03:00",
              schedule: {frequency: "hourly", minuteUtc: 17},
              url: "https://github.com/poptins/prospero-agents/actions/workflows/social-agent.yml",
              assetLabel: "Open Social workflow"
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
    const productName = {poptin: "Poptin", chatway: "Chatway", prospero: "Prospero"}[productId] || productId;
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
