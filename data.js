// Snapshot generated from the private poptins/poptin-agents repository.
// Refresh this file from repository issues, run state, and workflow schedules.
window.AGENT_DATA = {
  source: "poptins/poptin-agents",
  lastUpdated: "2026-07-23T12:00:00+03:00",
  agents: [
    {
      id: "seo",
      name: "SEO Agent",
      role: "SEO research & publishing",
      initials: "SE",
      status: "active",
      color: "#d9eee4",
      ink: "#18543d",
      instructions: ["Research verified SEO opportunities using trustworthy evidence and current search intent.","Create one original 2,000-3,000 word SEO, AEO, and GEO article when the current 4- or 5-day publishing interval is due.","Generate a branded cover image and relevant in-article visuals.","Select the correct existing WordPress category and attach 3-6 relevant tags.","Apply editorial, factual, structural, linking, taxonomy, and metadata quality checks before publishing.","Publish approved articles through WordPress.","Hand every newly published article to the Social Media Agent.","Refresh older posts only through an explicit manual or legacy refresh workflow."],
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
          detail: "Daily workflow wakes at 08:00 IDT and creates one new SEO article only after the current stored 4- or 5-day interval is due.",
          date: "2026-07-24T08:00:00+03:00",
          scheduleUtc: "05:00",
          url: "https://github.com/poptins/poptin-agents/actions/workflows/seo-agent.yml",
          assetLabel: "Open internal workflow"
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
      instructions: ["Run independently from the SEO Agent on six spaced candidate days each month.","Select a deterministic monthly target of four to six old published articles and update no more than one article per run.","Prioritize eligible articles older than one year that are stale, outdated, thin, or tied to an old year.","Preserve the existing WordPress post ID, slug, URL, category, tags, and featured image.","Rewrite and improve outdated text, factual accuracy, SEO, AEO, GEO, headings, clarity, examples, grammar, and internal linking.","Add the approved Summary and four to six Key takeaways when needed.","Remove editorial notes and keep table and summary typography consistent with the site.","Change the publication date to the actual refresh date and verify the slug again after WordPress saves the update."],
      owner: "Poptin Content & SEO",
      cadence: "4-6 articles monthly on spaced days",
      priority: "High",
      activities: [
        {
          type: "scheduled",
          title: "Refresh the next eligible old Poptin article",
          detail: "On the next selected monthly slot, update one old article while preserving its exact slug and URL.",
          date: "2026-07-28T09:20:00+03:00",
          schedule: {frequency: "monthly-days", days: [3, 8, 13, 18, 23, 28], hourUtc: 6, minuteUtc: 20},
          url: "https://github.com/poptins/poptin-agents/actions/workflows/update-blog-agent.yml",
          assetLabel: "Open Update Blog workflow"
        }
      ]
    },
    {
      "id": "alternatives",
      "name": "Alternatives Agent",
      "role": "Competitor research & comparison publishing",
      "initials": "AL",
      "status": "active",
      "color": "#ffe8dc",
      "ink": "#8a4325",
      "instructions": [
        "Run once in the first half and once in the second half of every month.",
        "Check the live Poptin blog and the persisted competitor history before selecting a product that has not already been covered.",
        "Research current features, pricing, target audience, integrations, privacy, security, and compliance from primary sources.",
        "Check G2, Capterra, and Trustpilot, reporting only accessible verified ratings, counts, and paraphrased review themes.",
        "Write a respectful 2,500-3,500 word comparison with a detailed table, transparent tradeoffs, direct citations, summary, key takeaways, and FAQs.",
        "Favor Poptin in the conclusion through explicit evidence-backed value, usability, conversion, and audience-fit criteria without disparaging competitors.",
        "Create an original Poptin-style cover and licensed generic inline imagery; use only newly captured, source-captioned public-page screenshots when editorially necessary.",
        "Apply WordPress metadata, category, tags, quality, duplicate, image, and factual checks before publishing.",
        "Hand every published alternatives article to the Social Media Agent."
      ],
      "owner": "Poptin Content & SEO",
      "cadence": "Twice monthly, on the 5th and 20th at 08:30 IDT + on demand",
      "priority": "High",
      "activities": [
        {
          "type": "past",
          "title": "Created and validated the Alternatives Agent",
          "detail": "Added competitor-history protection, primary and marketplace research requirements, deep comparison tables, original covers, WordPress publishing, and social handoff.",
          "date": "2026-07-22T13:25:00+03:00",
          "url": "https://github.com/poptins/poptin-agents/actions/workflows/alternatives-agent.yml",
          "assetLabel": "Open Alternatives workflow"
        },
        {
          "type": "scheduled",
          "title": "Publish the next unused competitor alternative",
          "detail": "On August 5, select an uncovered competitor, verify current evidence, and publish one complete comparison article after all quality checks pass.",
          "date": "2026-08-05T08:30:00+03:00",
          "url": "https://github.com/poptins/poptin-agents/actions/workflows/alternatives-agent.yml",
          "assetLabel": "Open scheduled workflow"
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
      instructions: ["Monitor the SEO handoff every hour for newly published articles.","Accept only articles whose publication is confirmed and that have not already been shared.","Create distinct, channel-appropriate copy for LinkedIn, X, and Facebook.","Prepare review-ready short-form video and visual guidance in the weekly content pack.","Attach the correct article asset and custom-schedule the first post about five minutes after handoff.","Use a separately randomized 5-10 minute gap before each remaining channel, and check scheduled and sent posts to prevent duplicates."],
      owner: "Social & Brand",
      cadence: "Hourly + weekly",
      priority: "High",
      activities: [
        {
          type: "past",
          title: "Updated Buffer handoff timing",
          detail: "Changed social delivery to exact custom schedules: first post about five minutes after SEO handoff, with independent random 5-10 minute gaps between later channels.",
          date: "2026-07-22T13:08:00+03:00",
          url: "https://github.com/poptins/poptin-agents/blob/main/social-agent/scripts/share-new-blog-posts.ps1",
          assetLabel: "Open social scheduling logic"
        },
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
          dependsOn: "seo-next-article",
          title: "Share the next published SEO article",
          detail: "After the SEO Agent's next article is confirmed published, schedule channel-specific Buffer posts for LinkedIn, Facebook, and X.",
          date: "2026-07-24T08:00:00+03:00",
          url: "https://github.com/poptins/poptin-agents/actions/workflows/social-media-agent.yml",
          assetLabel: "Open social workflow"
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
      instructions: ["Choose an original best-practices topic about email marketing, popups, forms, segmentation, automation, or CRO.","Use only current official Poptin and Poptin Help Center sources.","Check published Academy titles and reject duplicate or substantially overlapping topics.","Write and validate a practical 1,000-1,500 word guide with the required structure, links, excerpt, and SEO description.","Generate a branded Poptin Academy cover image in the approved reference format.","Publish the validated guide under /academy/guides/ on the weekly schedule."],
      owner: "Poptin Academy",
      cadence: "Weekly, Sundays at 09:00 IDT",
      priority: "Medium",
      activities: [
        {
          type: "past",
          title: "Verified Academy publishing credentials",
          detail: "Corrected the WordPress secret mapping and completed a successful Academy dry run without publishing a duplicate guide.",
          date: "2026-07-22T12:50:00+03:00",
          url: "https://github.com/poptins/poptin-agents/actions/workflows/academic-best-practices-agent.yml",
          assetLabel: "Open Academy workflow"
        },
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
          title: "Publish weekly Academy best-practices guide",
          detail: "Create, validate, and publish one non-duplicate 1,000–1,500 word guide under /academy/guides/.",
          date: "2026-07-26T09:00:00+03:00",
          schedule: { frequency: "weekly", weekdayUtc: 0, hourUtc: 6, minuteUtc: 0 },
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
      instructions: ["Research accurate terminology for CRO, popups, forms, analytics, consent, ecommerce, SaaS, and email marketing.","Check the complete published glossary before selecting a term.","Reject duplicate, near-duplicate, unsupported, or overly broad entries.","Write a clear 150-250 word definition with a practical example in plain English.","Flag legal, privacy, medical, financial, or otherwise sensitive terms for additional review.","Validate quality and publish one approved term to Poptin Academy each day."],
      owner: "Poptin Academy",
      cadence: "Daily at 06:15 UTC",
      priority: "Medium",
      activities: [
        {
          type: "past",
          title: "Published Email Cadence",
          detail: "The daily glossary workflow published Email Cadence successfully after GitHub started the scheduled run later than its nominal cron time.",
          date: "2026-07-23T11:44:19+03:00",
          url: "https://www.poptin.com/academy/glossary/email-cadence/",
          assetLabel: "View glossary term",
          githubRunId: 29992074282
        },
        {
          type: "failed",
          title: "Daily Poptin glossary publication failed",
          detail: "The scheduled glossary workflow did not complete successfully. A later run restored successful daily publishing.",
          date: "2026-07-20T12:33:18+03:00",
          url: "https://github.com/poptins/poptin-agents/actions/runs/29731883077",
          assetLabel: "Open failed workflow run",
          githubRunId: 29731883077
        },
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
          instructions: ["Analyze English-language Search Console performance across poptin.com, the Blog, and Academy.","Rank high-impression, low-CTR pages and material organic declines using verified evidence.","Resolve the current SEO title, meta description, WordPress resource, and authenticated edit access.","Prepare exact current-versus-suggested metadata changes for actionable opportunities.","Display the evidence, recommendation, and permission result in the dashboard.","Never write to WordPress unless that exact change is individually approved.","Revalidate the protected before-state immediately before executing an approved change."],
          "owner": "Growth & SEO",
          "cadence": "Mondays at 08:30 IDT + on demand",
          "priority": "High",
          "activities": [
                {
                      "type": "scheduled",
                      "title": "Run daily Poptin opportunity scan",
                      "detail": "Refresh Search Console opportunities and exact title and meta-description suggestions every day at 04:30 UTC.",
                      "date": "2026-07-23T07:30:00+03:00",
                      "scheduleUtc": "04:30",
                      "url": "https://github.com/poptins/poptin-agents/actions/workflows/search-console-audit.yml",
                      "assetLabel": "Open Optimization workflow"
                },
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
        instructions: ["Find three to four relevant Quora questions about email marketing, website popups, and conversion optimization.","Exclude repeated questions and topics already handled by the agent.","Write original, useful, non-promotional answers in one consistent practical voice.","Check every draft for factual accuracy, relevance, clarity, and unsupported claims.","Store drafts only in the private GitHub review queue.","Keep final Quora submission human-controlled; never publish answers automatically."],
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
          type: "failed",
          title: "Scheduled Quora review task failed",
          detail: "The scheduled review-queue workflow failed its validation step and was subsequently repaired and verified.",
          date: "2026-07-22T12:38:07+03:00",
          url: "https://github.com/poptins/poptin-agents/actions/runs/29908747255",
          assetLabel: "Open failed workflow run",
          githubRunId: 29908747255
        },
            {
                "type": "past",
                "title": "Repaired and verified the Quora schedule",
                "detail": "Fixed the corrupted dash-validation test and completed a successful verification run of the daily review workflow.",
                "date": "2026-07-22T12:43:00+03:00",
                "url": "https://github.com/poptins/poptin-agents/actions/workflows/quora-agent.yml",
                "assetLabel": "Open Quora workflow"
            },
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
    }    ,
    ]
};
