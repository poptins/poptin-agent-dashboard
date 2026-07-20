// Snapshot generated from the private poptins/poptin-agents repository.
// Refresh this file from repository issues, run state, and workflow schedules.
window.AGENT_DATA = {
  source: "poptins/poptin-agents",
  lastUpdated: "2026-07-20T07:05:07+03:00",
  agents: [
    {
      id: "seo",
      name: "SEO Agent",
      role: "SEO research & publishing",
      initials: "SE",
      status: "active",
      color: "#d9eee4",
      ink: "#18543d",
      task: "Researches verified SEO opportunities and publishes 2,000–3,000 word SEO/AEO/GEO articles. It plans four new monthly posts, refreshes six eligible older posts, generates article images, applies editorial quality gates, publishes through WordPress, and hands newly published articles to the Social Media Agent.",
      owner: "Content & SEO",
      cadence: "Monthly + on demand",
      priority: "High",
      activities: [
        {
          type: "past",
          title: "Published welcome-email sequence article",
          detail: "Published “Welcome Email Sequence After Popup Signup: 7 Emails That Turn New Leads Into Customers” and refreshed the social handoff.",
          date: "2026-07-19T10:54:42+03:00",
          url: "https://www.poptin.com/blog/welcome-email-sequence-after-popup-signup/",
          assetLabel: "View blog post"
        },
        {
          type: "past",
          title: "Delivered weekly SEO brief",
          detail: "Audited current public pages and competitors, then prioritized technical, content, integration, and trust-signal improvements.",
          date: "2026-07-19T13:08:00+03:00",
          url: "https://github.com/poptins/poptin-agents/issues/4",
          assetLabel: "Open internal SEO brief"
        },
        {
          type: "past",
          title: "Published ecommerce campaign-planning article",
          detail: "Published the 90-day holiday email marketing workflow and made it available to the social handoff.",
          date: "2026-07-18T15:13:00+03:00",
          url: "https://www.poptin.com/blog/holiday-email-marketing-campaign-planning-ecommerce/",
          assetLabel: "View blog post"
        },
        {
          type: "scheduled",
          title: "Monthly SEO publishing plan",
          detail: "Create four new posts and refresh six eligible older posts while preserving their URLs.",
          date: "2026-08-01T08:00:00+03:00",
          url: "https://github.com/poptins/poptin-agents/actions/workflows/seo-agent.yml",
          assetLabel: "Open internal workflow"
        }
      ]
    },
    {
      id: "social",
      name: "Social Media Agent",
      role: "Social strategy & distribution",
      initials: "SM",
      status: "active",
      color: "#f4e6cc",
      ink: "#764c12",
      task: "Creates review-ready weekly LinkedIn, X, Facebook, and short-form video content. It also watches the SEO handoff hourly, accepts only newly published articles, creates channel-specific copy, schedules posts through Buffer with randomized gaps, and prevents duplicate shares.",
      owner: "Social & Brand",
      cadence: "Hourly + weekly",
      priority: "High",
      activities: [
        {
          type: "past",
          title: "Shared welcome-email article on three channels",
          detail: "Scheduled distinct LinkedIn, Facebook, and X posts through Buffer. The final public post URLs were not saved by the automation.",
          date: "2026-07-19T13:57:34+03:00",
          assetStatus: "Published social URLs not recorded"
        },
        {
          type: "past",
          title: "Delivered weekly social media pack",
          detail: "Produced a CRO-focused campaign pack with LinkedIn, X, Facebook, video, visual, alt-text, and editorial-review guidance.",
          date: "2026-07-19T13:08:00+03:00",
          url: "https://github.com/poptins/poptin-agents/issues/1",
          assetLabel: "Open internal social pack"
        },
        {
          type: "past",
          title: "Shared holiday campaign article",
          detail: "Scheduled channel-specific posts to LinkedIn, Facebook, and X through Buffer. The final public post URLs were not saved by the automation.",
          date: "2026-07-18T18:27:18+03:00",
          assetStatus: "Published social URLs not recorded"
        },
        {
          type: "scheduled",
          title: "Check SEO publishing handoff",
          detail: "Run at minute 17, share any newly published SEO article, and skip future or already shared posts.",
          date: "2026-07-20T10:17:00+03:00",
          url: "https://github.com/poptins/poptin-agents/actions/workflows/social-agent.yml",
          assetLabel: "Open internal workflow"
        }
      ]
    },
    {
      id: "academy",
      name: "Academy Agent",
      role: "Best-practices education",
      initials: "AC",
      status: "active",
      color: "#dceaf3",
      ink: "#245a7a",
      task: "Creates original, source-grounded Academy guides about email marketing, popups, forms, segmentation, automation, and CRO. It reads only official Poptin sources, prevents duplicate topics, enforces structure and SEO quality, and creates WordPress drafts for review.",
      owner: "Poptin Academy",
      cadence: "Daily at 09:30 IDT",
      priority: "Medium",
      activities: [
        {
          type: "past",
          title: "Published preference-based welcome workflow guide",
          detail: "Published an Academy guide showing how subscriber preferences can improve welcome workflows and buyer relevance.",
          date: "2026-07-19T10:20:20+03:00",
          url: "https://www.poptin.com/academy/guides/turn-new-subscribers-into-better-buyers-with-a-preference-based-welcome-workflow/",
          assetLabel: "View Academy guide"
        },
        {
          type: "scheduled",
          title: "Generate daily Academy guide draft",
          detail: "Create and validate one 1,000–1,500 word guide, then save it to WordPress as a draft for review.",
          date: "2026-07-21T09:30:00+03:00",
          url: "https://github.com/poptins/poptin-agents/actions/workflows/academic-best-practices-agent.yml",
          assetLabel: "Open internal workflow"
        }
      ]
    },
    {
      id: "glossary",
      name: "Glossary Agent",
      role: "Marketing glossary publisher",
      initials: "GL",
      status: "active",
      color: "#e9e2f2",
      ink: "#5d4378",
      task: "Researches accurate terminology for CRO, popups, forms, analytics, consent, ecommerce, SaaS, and email marketing. It checks the full published glossary for duplicates, validates plain-English definitions and examples, flags sensitive terms, and publishes one approved-quality term to Poptin Academy each day.",
      owner: "Poptin Academy",
      cadence: "Daily at 09:15 IDT",
      priority: "Medium",
      activities: [
        {
          type: "past",
          title: "Published Progressive Profiling glossary term",
          detail: "Published a plain-English definition and practical explanation of progressive profiling in the Poptin glossary.",
          date: "2026-07-19T09:12:04+03:00",
          url: "https://www.poptin.com/academy/glossary/progressive-profiling/",
          assetLabel: "View glossary term"
        },
        {
          type: "scheduled",
          title: "Publish daily glossary term",
          detail: "Validate one unique 150–250 word definition and practical example, then publish it to the live Poptin glossary.",
          date: "2026-07-21T09:15:00+03:00",
          url: "https://github.com/poptins/poptin-agents/actions/workflows/glossary-poptin-agent.yml",
          assetLabel: "Open internal workflow"
        }
      ]
    }
  ]
};
