(() => {
  const feeds = {
    poptin: {
      endpoint: "https://www.poptin.com/wp-json/wp/v2/popt_glossary",
      label: "Poptin Academy glossary"
    },
    chatway: {
      endpoint: "https://chatway.app/wp-json/wp/v2/chatway_glossary",
      label: "Chatway glossary"
    }
  };

  function plainText(value) {
    const documentFragment = new DOMParser().parseFromString(String(value || ""), "text/html");
    return (documentFragment.body.textContent || "").trim();
  }

  async function fetchPublishedTerms(feed) {
    const query = new URLSearchParams({
      per_page: "20",
      orderby: "date",
      order: "desc",
      status: "publish",
      _fields: "id,date,slug,link,title,status"
    });
    const response = await fetch(`${feed.endpoint}?${query}`, {
      headers: {Accept: "application/json"},
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`Glossary feed returned ${response.status}`);
    return response.json();
  }

  function addTermsToProduct(productId, feed, terms) {
    const product = window.PRODUCT_AGENT_DATA?.[productId];
    const glossaryAgent = product?.agents?.find(agent => agent.id === "glossary");
    if (!glossaryAgent) return 0;

    const knownUrls = new Set(glossaryAgent.activities.map(activity => activity.url).filter(Boolean));
    let added = 0;
    for (const term of terms) {
      if (!term?.link || knownUrls.has(term.link) || term.status !== "publish") continue;
      const title = plainText(term.title?.rendered);
      if (!title) continue;
      glossaryAgent.activities.push({
        type: "past",
        title: `Published ${title}`,
        detail: `Published “${title}” in the ${feed.label}.`,
        date: term.date,
        url: term.link,
        assetLabel: "View glossary term",
        wordpressId: term.id
      });
      knownUrls.add(term.link);
      added += 1;
    }
    glossaryAgent.activities.sort((left, right) => new Date(right.date) - new Date(left.date));
    return added;
  }

  async function loadGlossaryActivityLinks() {
    const results = await Promise.allSettled(
      Object.entries(feeds).map(async ([productId, feed]) => {
        const terms = await fetchPublishedTerms(feed);
        return addTermsToProduct(productId, feed, terms);
      })
    );
    const added = results.reduce(
      (total, result) => total + (result.status === "fulfilled" ? result.value : 0),
      0
    );
    results
      .filter(result => result.status === "rejected")
      .forEach(result => console.warn("Glossary activity feed unavailable:", result.reason));
    if (added && typeof renderDashboard === "function") renderDashboard();
  }

  loadGlossaryActivityLinks();
})();
