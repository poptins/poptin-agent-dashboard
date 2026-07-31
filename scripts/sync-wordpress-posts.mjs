import { readFile, writeFile } from "node:fs/promises";

const DATA_PATH = "data.js";
const SYNC_START = new Date("2026-07-30T00:00:00Z");
const SOURCES = [
  {
    name: "Poptin",
    endpoint: "https://www.poptin.com/blog/wp-json/wp/v2/posts",
    linkPrefix: "https://www.poptin.com/blog/",
    assetLabel: "View Poptin blog post"
  },
  {
    name: "Chatway",
    endpoint: "https://chatway.app/wp-json/wp/v2/post",
    linkPrefix: "https://chatway.app/blog/",
    assetLabel: "View Chatway blog post"
  }
];

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const normalizeUrl = value => String(value || "").trim().replace(/\/+$/, "").toLowerCase();

function decodeHtml(value) {
  const named = { amp: "&", apos: "'", quot: '"', lt: "<", gt: ">", nbsp: " " };
  return String(value || "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name) => named[name.toLowerCase()] ?? match)
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchPublishedPosts(source) {
  const url = new URL(source.endpoint);
  url.searchParams.set("status", "publish");
  url.searchParams.set("per_page", "50");
  url.searchParams.set("orderby", "date");
  url.searchParams.set("order", "desc");
  url.searchParams.set("_fields", "id,date,date_gmt,link,slug,title,status");

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "PoptinMarketingDashboardSync/1.0"
        },
        signal: AbortSignal.timeout(45000)
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const payload = await response.json();
      const posts = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.posts)
          ? payload.posts
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.items)
              ? payload.items
              : null;
      if (!posts) {
        const shape = payload && typeof payload === "object"
          ? `object keys: ${Object.keys(payload).slice(0, 10).join(", ") || "(none)"}`
          : typeof payload;
        const message = typeof payload?.message === "string" ? `: ${payload.message.slice(0, 240)}` : "";
        throw new Error(`WordPress returned an unsupported response shape (${shape})${message}`);
      }
      return posts;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await sleep(attempt * 5000);
    }
  }
  throw new Error(`${source.name} WordPress request failed: ${lastError?.message || lastError}`);
}

function formatActivity(post, source) {
  const title = decodeHtml(post.title?.rendered || post.title || post.slug || "Untitled post");
  const publishedAt = post.date_gmt ? `${post.date_gmt}Z` : post.date;
  const lines = [
    "        {",
    '          type: "past",',
    `          title: ${JSON.stringify(`Published ${source.name} article`)},`,
    `          detail: ${JSON.stringify(`Published “${title}” on the ${source.name} blog.`)},`,
    `          date: ${JSON.stringify(publishedAt)},`,
    `          url: ${JSON.stringify(post.link)},`,
    `          assetLabel: ${JSON.stringify(source.assetLabel)},`,
    `          wordpressPostId: ${JSON.stringify(post.id)},`,
    `          publicationSource: ${JSON.stringify(source.name.toLowerCase())}`,
    "        },"
  ];
  return lines.join("\n");
}

let data = await readFile(DATA_PATH, "utf8");
const existingUrls = new Set(
  [...data.matchAll(/\burl:\s*["']([^"']+)["']/g)].map(match => normalizeUrl(match[1]))
);
const additions = [];
let successfulSources = 0;

for (const source of SOURCES) {
  try {
    const posts = await fetchPublishedPosts(source);
    successfulSources += 1;
    for (const post of posts) {
      const publishedAt = new Date(post.date_gmt ? `${post.date_gmt}Z` : post.date);
      const normalizedLink = normalizeUrl(post.link);
      if (
        post.status !== "publish" ||
        Number.isNaN(publishedAt.getTime()) ||
        publishedAt < SYNC_START ||
        !String(post.link || "").startsWith(source.linkPrefix) ||
        existingUrls.has(normalizedLink)
      ) {
        continue;
      }
      existingUrls.add(normalizedLink);
      additions.push({ post, source, publishedAt });
    }
  } catch (error) {
    console.error(`::warning title=${source.name} sync unavailable::${error.message}`);
  }
}

if (successfulSources === 0) {
  throw new Error("All WordPress publication sources were unavailable");
}

if (additions.length === 0) {
  console.log("Dashboard is already synchronized; no new published posts found.");
  process.exit(0);
}

additions.sort((left, right) => right.publishedAt - left.publishedAt);
const seoIndex = data.search(/(?:\bid\b|["']id["'])\s*:\s*["']seo["']/);
if (seoIndex < 0) throw new Error("SEO agent was not found in data.js");
const activitiesMatch = /\bactivities\s*:\s*\[/.exec(data.slice(seoIndex));
if (!activitiesMatch) throw new Error("SEO activity list was not found in data.js");
const insertAt = seoIndex + activitiesMatch.index + activitiesMatch[0].length;
const blocks = additions.map(({ post, source }) => formatActivity(post, source)).join("\n");
data = `${data.slice(0, insertAt)}\n${blocks}${data.slice(insertAt)}`;

data = data.replace(
  /lastUpdated:\s*["'][^"']+["']/,
  `lastUpdated: ${JSON.stringify(new Date().toISOString())}`
);

await writeFile(DATA_PATH, data, "utf8");
console.log(`Added ${additions.length} newly published WordPress post(s) to the dashboard.`);
for (const { post, source } of additions) console.log(`- ${source.name}: ${post.link}`);
