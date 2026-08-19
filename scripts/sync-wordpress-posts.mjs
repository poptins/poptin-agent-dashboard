import { readFile, writeFile } from "node:fs/promises";

const DATA_PATH = "data.js";
const PRODUCT_DATA_PATH = "product-tabs.js";
const SOCIAL_PRODUCTS = new Set(["poptin", "chatway", "prospero", "premio"]);
const SYNC_START = new Date("2026-07-30T00:00:00Z");
const SOURCES = [
  {
    name: "Poptin",
    endpoint: "https://www.poptin.com/blog/wp-json/wp/v2/posts",
    linkPrefix: "https://www.poptin.com/blog/",
    assetLabel: "View Poptin blog post",
    agentId: "seo",
    kind: "article"
  },
  {
    name: "Poptin Academy",
    endpoint: "https://www.poptin.com/wp-json/wp/v2/popt_guide",
    linkPrefix: "https://www.poptin.com/academy/guides/",
    assetLabel: "View Academy guide",
    agentId: "academy",
    kind: "guide"
  },
  {
    name: "Chatway",
    endpoint: "https://chatway.app/wp-json/wp/v2/post",
    linkPrefix: "https://chatway.app/blog/",
    assetLabel: "View Chatway blog post",
    agentId: "seo",
    kind: "article"
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
    '          status: "Published",',
    '          taskType: "publication",',
    `          title: ${JSON.stringify(`Published ${source.name} ${source.kind}`)},`,
    `          detail: ${JSON.stringify(`Published “${title}” as a ${source.name} ${source.kind}.`)},`,
    `          date: ${JSON.stringify(publishedAt)},`,
    `          url: ${JSON.stringify(post.link)},`,
    `          assetLabel: ${JSON.stringify(source.assetLabel)},`,
    `          wordpressPostId: ${JSON.stringify(post.id)},`,
    `          publicationTaskId: ${JSON.stringify(`${source.name.toLowerCase()}-wordpress-${post.id}`)},`,
    `          publicationSource: ${JSON.stringify(source.name.toLowerCase())}`,
    "        },"
  ];
  return lines.join("\n");
}

let data = await readFile(DATA_PATH, "utf8");
let productData = await readFile(PRODUCT_DATA_PATH, "utf8");
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
  console.error("::warning title=WordPress sync deferred::All WordPress sources were temporarily unavailable; event payloads and the next scheduled run will reconcile the calendar.");
}

let socialPosts = [];
let eventProductId = "poptin";
if (process.env.GITHUB_EVENT_PATH) {
  try {
    const event = JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, "utf8"));
    socialPosts = Array.isArray(event?.client_payload?.socialPosts) ? event.client_payload.socialPosts : [];
    eventProductId = String(event?.client_payload?.productId || "poptin").toLowerCase();
  } catch (error) {
    console.error(`::warning title=Social payload unavailable::${error.message}`);
  }
}

const existingSocialIds = new Set(
  [...(`${data}\n${productData}`).matchAll(/socialTaskId:\s*["']([^"']+)["']/g)].map(match => match[1])
);
const socialAdditions = socialPosts.filter(item => {
  const id = String(item?.id || `${item?.url || ""}|${item?.sharedAt || ""}`);
  const productId = String(item?.productId || eventProductId).toLowerCase();
  if (!SOCIAL_PRODUCTS.has(productId) || !item?.title || !item?.sharedAt || existingSocialIds.has(id)) return false;
  item.id = id;
  item.productId = productId;
  existingSocialIds.add(id);
  return true;
});

function insertActivities(agentId, blocks) {
  if (!blocks.length) return;
  const agentPattern = new RegExp(`(?:\\bid\\b|["']id["'])\\s*:\\s*["']${agentId}["']`);
  const agentIndex = data.search(agentPattern);
  if (agentIndex < 0) throw new Error(`${agentId} agent was not found in data.js`);
  const activitiesMatch = /\bactivities\s*:\s*\[/.exec(data.slice(agentIndex));
  if (!activitiesMatch) throw new Error(`${agentId} activity list was not found in data.js`);
  const insertAt = agentIndex + activitiesMatch.index + activitiesMatch[0].length;
  data = `${data.slice(0, insertAt)}\n${blocks.join("\n")}${data.slice(insertAt)}`;
}

additions.sort((left, right) => right.publishedAt - left.publishedAt);
for (const agentId of new Set(additions.map(item => item.source.agentId))) {
  insertActivities(
    agentId,
    additions
      .filter(item => item.source.agentId === agentId)
      .map(({ post, source }) => formatActivity(post, source))
  );
}

function formatSocialActivity(item) {
  return [
    "        {",
    '          type: "past",',
    '          status: "Published",',
    '          taskType: "social-publication",',
    `          title: ${JSON.stringify(`Shared ${item.title} on social media`)},`,
    `          detail: ${JSON.stringify(`Scheduled verified posts through Buffer for ${(item.channels || []).map(channel => channel.name || channel).join(", ") || "the configured social channels"}.`)},`,
    `          date: ${JSON.stringify(item.sharedAt)},`,
    `          url: ${JSON.stringify(item.socialPostsUrl || item.url || "")},`,
    `          articleUrl: ${JSON.stringify(item.url || "")},`,
    '          assetLabel: "View social posts in Buffer",',
    `          socialTaskId: ${JSON.stringify(item.id)}`,
    "        },"
  ].join("\n");
}

insertActivities("social", socialAdditions.filter(item => item.productId === "poptin").map(formatSocialActivity));

function insertProductSocialActivities(productId, items) {
  if (!items.length) return;
  const productStart = productData.indexOf(`    ${productId}: {`);
  if (productStart < 0) throw new Error(`${productId} product was not found in product-tabs.js`);
  const nextProduct = productData.indexOf("\n    ", productStart + 5);
  const productEnd = nextProduct < 0 ? productData.length : nextProduct;
  const productBlock = productData.slice(productStart, productEnd);
  const socialMatch = /\bid\s*:\s*["']social["']/.exec(productBlock);
  if (!socialMatch) throw new Error(`${productId} social agent was not found in product-tabs.js`);
  const socialStart = productStart + socialMatch.index;
  const activitiesMatch = /\bactivities\s*:\s*\[/.exec(productData.slice(socialStart, productEnd));
  if (!activitiesMatch) throw new Error(`${productId} social activities were not found in product-tabs.js`);
  const insertAt = socialStart + activitiesMatch.index + activitiesMatch[0].length;
  productData = `${productData.slice(0, insertAt)}\n${items.map(formatSocialActivity).join("\n")}${productData.slice(insertAt)}`;
}

for (const productId of ["chatway", "prospero", "premio"]) {
  insertProductSocialActivities(productId, socialAdditions.filter(item => item.productId === productId));
}

if (additions.length === 0 && socialAdditions.length === 0) {
  console.log("Dashboard is already synchronized; no new publications found.");
  process.exit(0);
}

data = data.replace(
  /lastUpdated:\s*["'][^"']+["']/,
  `lastUpdated: ${JSON.stringify(new Date().toISOString())}`
);

await writeFile(DATA_PATH, data, "utf8");
if (socialAdditions.some(item => item.productId !== "poptin")) {
  await writeFile(PRODUCT_DATA_PATH, productData, "utf8");
}
console.log(`Added ${additions.length} WordPress publication(s) and ${socialAdditions.length} social publication(s) to the dashboard.`);
for (const { post, source } of additions) console.log(`- ${source.name}: ${post.link}`);
