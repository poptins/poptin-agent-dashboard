// Snapshot generated from the private poptins/poptin-agents repository.
// Refresh this file from repository issues, run state, and workflow schedules.
window.AGENT_DATA = {
  source: "poptins/poptin-agents",
  lastUpdated: "2026-07-21T09:30:00+03:00",
  agents: [
    {
      id: "seo",
      name: "SEO Agent",
      role: "SEO research & publishing",
      initials: "SE",
      status: "active",
      color: "#d9eee4",
      ink: "#18543d",
      task: "Researches verified SEO opportunities and publishes 2,000-3,000 word SEO/AEO/GEO articles. It creates one new SEO article every 4-5 days, generates article images, applies editorial quality gates, publishes through WordPress, and hands newly published articles to the Social Media Agent. Older-post refreshes remain available through manual or legacy refresh flows.",
      owner: "Content & SEO",
      cadence: "Every 4-5 days + on demand",
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
          title: "Next SEO cadence article window",
          detail: "Daily workflow wakes at 08:00 IDT and creates one new SEO article only after the 4-day cadence is due. Seeded from the July 19 article, the next article-producing run is expected on the first daily wakeup after July 23 at 10:54 IDT.",
          date: "2026-07-24T08:00:00+03:00",
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
      cadence: "Daily at 06:15 UTC",
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
          scheduleUtc: "06:15",
          url: "https://github.com/poptins/poptin-agents/actions/workflows/glossary-poptin-agent.yml",
          assetLabel: "Open internal workflow"
        }
      ]
    }
  ,
    {
          "id": "optimization",
          "name": "Optimization Agent",
          "role": "Search Console & approved site optimization",
          "initials": "OP",
          "status": "active",
          "color": "#dff0ee",
          "ink": "#17645c",
          "task": "Analyzes English-language Search Console performance and SEO briefs across poptin.com, the Blog, and Academy. It lists verified recommendations in this dashboard and executes only individually approved changes.",
          "owner": "Growth & SEO",
          "cadence": "Mondays at 08:30 IDT + on demand",
          "priority": "High",
          "activities": [
                {
                      "type": "past",
                      "title": "Homepage",
                      "detail": "Improve the search snippet for this high-impression English page.",
                      "date": "2026-07-20T10:50:00+03:00",
                      "url": "http://www.poptin.com/",
                      "assetLabel": "Open affected page"
                },
                {
                      "type": "past",
                      "title": "Pricing page",
                      "detail": "Improve the search snippet for this high-impression English page.",
                      "date": "2026-07-20T10:50:00+03:00",
                      "url": "https://www.poptin.com/pricing/",
                      "assetLabel": "Open affected page"
                },
                {
                      "type": "past",
                      "title": "About Us page",
                      "detail": "Improve the search snippet for this high-impression English page.",
                      "date": "2026-07-20T10:50:00+03:00",
                      "url": "https://www.poptin.com/about-us/",
                      "assetLabel": "Open affected page"
                },
                {
                      "type": "past",
                      "title": "Careers site",
                      "detail": "Investigate the material organic click decline before proposing an edit.",
                      "date": "2026-07-20T10:50:00+03:00",
                      "url": "https://careers.poptin.com/",
                      "assetLabel": "Open affected page"
                },
                {
                      "type": "past",
                      "title": "Sales funnel examples article",
                      "detail": "Improve the search snippet for this high-impression English article.",
                      "date": "2026-07-20T10:50:00+03:00",
                      "url": "https://www.poptin.com/blog/9-ultimate-sales-funnel-examples-that-convert/",
                      "assetLabel": "Open affected page"
                },
                {
                      "type": "past",
                      "title": "Types of email marketing article",
                      "detail": "Improve the search snippet for this high-impression English article.",
                      "date": "2026-07-20T10:50:00+03:00",
                      "url": "https://www.poptin.com/blog/types-of-email-marketing/",
                      "assetLabel": "Open affected page"
                },
                {
                      "type": "past",
                      "title": "Blog homepage",
                      "detail": "Improve the search snippet for this high-impression English page.",
                      "date": "2026-07-20T10:50:00+03:00",
                      "url": "https://www.poptin.com/blog/",
                      "assetLabel": "Open affected page"
                },
                {
                      "type": "past",
                      "title": "Free image banks article",
                      "detail": "Improve the search snippet for this high-impression English article.",
                      "date": "2026-07-20T10:50:00+03:00",
                      "url": "https://www.poptin.com/blog/30-free-banks-images-icons-vectors-visually-appealing-content/",
                      "assetLabel": "Open affected page"
                },
                {
                      "type": "past",
                      "title": "What is a pop-up article",
                      "detail": "Improve the search snippet for this high-impression English article.",
                      "date": "2026-07-20T10:50:00+03:00",
                      "url": "https://www.poptin.com/blog/what-is-a-pop-up-the-only-guide-you-need/",
                      "assetLabel": "Open affected page"
                },
                {
                      "type": "past",
                      "title": "Brand recognition article",
                      "detail": "Improve the search snippet for this high-impression English article.",
                      "date": "2026-07-20T10:50:00+03:00",
                      "url": "https://www.poptin.com/blog/6-ways-increase-brand-recognition-business/",
                      "assetLabel": "Open affected page"
                },
                {
                      "type": "past",
                      "title": "Chaty Pro review",
                      "detail": "Improve the search snippet for this high-impression English article.",
                      "date": "2026-07-20T10:50:00+03:00",
                      "url": "https://www.poptin.com/blog/is-chaty-pro-the-best-wordpress-chat-plugin-for-you-a-review/",
                      "assetLabel": "Open affected page"
                },
                {
                      "type": "past",
                      "title": "Scroll Trigger glossary page",
                      "detail": "Improve the search snippet for this high-impression English glossary page.",
                      "date": "2026-07-20T10:50:00+03:00",
                      "url": "https://www.poptin.com/academy/glossary/scroll-trigger/",
                      "assetLabel": "Open affected page"
                },
                {
                      "type": "past",
                      "title": "Flash Sale glossary page",
                      "detail": "Improve the search snippet for this high-impression English glossary page.",
                      "date": "2026-07-20T10:50:00+03:00",
                      "url": "https://www.poptin.com/academy/glossary/flash-sale/",
                      "assetLabel": "Open affected page"
                }
          ]
    },
    {
        "id": "quora",
        "name": "Quora Agent",
        "role": "Human-reviewed community answers",
        "initials": "QA",
        "status": "active",
        "color": "#f3e2dc",
        "ink": "#7a3d2a",
        "task": "Finds relevant Quora questions about email marketing, website popups, and conversion optimization, then prepares three to four original answers in one consistent, practical voice. Drafts remain in the private agent repository and publishing stays human-controlled.",
        "owner": "Community & Growth",
        "cadence": "Daily at 10:15 IDT",
        "priority": "Medium",
        "pendingQuestions": [
            {
                "question": "Which are the best email marketing tools?",
                "url": "https://www.quora.com/Which-are-the-best-email-marketing-tools-1"
            },
            {
                "question": "How can I collect phone numbers with website popups?",
                "url": "https://www.quora.com/How-can-I-collect-phone-numbers-with-website-popups"
            },
            {
                "question": "Who usually manages conversion-rate and landing-page optimization in a company?",
                "url": "https://www.quora.com/What-is-the-job-description-title-of-the-person-who-manages-the-Conversion-Rate-Optimization-Landing-Page-Optimization-process-outcome-in-companies"
            },
            {
                "question": "How do I do email marketing?",
                "url": "https://www.quora.com/How-do-I-do-email-marketing"
            }
        ],
        "activities": [
            {
                "type": "past",
                "title": "Prepared first answer review batch",
                "detail": "Created three original, non-promotional answers and stored them in the private review queue.",
                "date": "2026-07-20T14:08:51+03:00",
                "assetStatus": "Available after GitHub authentication"
            },
            {
                "type": "scheduled",
                "title": "Prepare daily Quora answer batch",
                "detail": "Find three to four relevant questions, prevent repeats, validate answer quality, and create a private review queue.",
                "date": "2026-07-21T10:15:00+03:00",
                "assetStatus": "Runs in the private agent repository"
            }
        ]
    }
  ]
};
