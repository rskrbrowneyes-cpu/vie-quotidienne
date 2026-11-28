const ALLOWED_ORIGINS = [
  "https://rskrbrowneyes-cpu.github.io",
  "http://localhost:3000",
  "http://localhost:5173",
];

const MAX_ITEMS = 12;

const json = (data, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });

const corsHeaders = (request) => {
  const origin = request.headers.get("Origin") || "";
  const headers = { "Vary": "Origin" };
  if (ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
};

const stripCdata = (value) =>
  value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();

const tagText = (xml, tag) => {
  const match = xml.match(
    new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"),
  );
  return match ? stripCdata(match[1]) : "";
};

const decodeEntities = (value) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));

const sourceName = (link) => {
  try {
    return new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

const parseFeed = (xml) => {
  const isAtom = /<feed[\s>]/i.test(xml);
  const blocks = isAtom
    ? [...xml.matchAll(/<entry[\s>][\s\S]*?<\/entry>/gi)]
    : [...xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)];
  const items = blocks.slice(0, MAX_ITEMS).map((block) => {
    const entry = block[0];
    const title = decodeEntities(tagText(entry, "title"));
    const link = isAtom
      ? (entry.match(/<link[^>]*href="([^"]+)"/i) || [])[1] || ""
      : decodeEntities(tagText(entry, "link"));
    const date =
      tagText(entry, "pubDate") ||
      tagText(entry, "published") ||
      tagText(entry, "updated");
    return { title, link, date, source: sourceName(link) };
  });
  return items.filter((item) => item.title);
};

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          ...cors,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    if (request.method !== "POST") {
      return json({ error: "method-not-allowed" }, 405, cors);
    }

    try {
      const url = new URL(request.url);

      if (url.pathname === "/mistral") {
        if (!env.MISTRAL_API_KEY) {
          return json({ error: "missing-api-key" }, 500, cors);
        }
        const upstream = await fetch("https://api.mistral.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.MISTRAL_API_KEY}`,
          },
          body: await request.text(),
        });
        const payload = await upstream.text();
        return new Response(payload, {
          status: upstream.status,
          headers: { ...cors, "Content-Type": "application/json; charset=utf-8" },
        });
      }

      if (url.pathname === "/rss") {
        const payload = await request.json();
        const feed = typeof payload?.feed === "string" ? payload.feed : "";
        if (!/^https:\/\//.test(feed)) {
          return json({ error: "invalid-feed" }, 400, cors);
        }
        const response = await fetch(feed, {
          headers: { "User-Agent": "VieQuotidienne/1.0 (RSS reader)" },
        });
        if (!response.ok) {
          return json({ error: "feed-fetch", status: response.status }, 502, cors);
        }
        const items = parseFeed(await response.text());
        return json({ items }, 200, cors);
      }

      return json({ error: "not-found" }, 404, cors);
    } catch (error) {
      return json(
        { error: "worker-failure", message: String(error) },
        500,
        cors,
      );
    }
  },
};
