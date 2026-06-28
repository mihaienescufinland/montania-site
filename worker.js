/* =====================================================================
   MONTANIA — Worker entry
   Serves the static site (via the ASSETS binding) and the /api endpoints
   used by the public booking widget and the /admin panel.
   ===================================================================== */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/api/data" && request.method === "GET") return getData(env);
    if (path === "/api/login" && request.method === "POST") return login(request, env);
    if (path === "/api/save" && request.method === "POST") return save(request, env);

    // Reviews
    if (path === "/api/reviews" && request.method === "GET") return getReviews(env);
    if (path === "/api/reviews" && request.method === "POST") return submitReview(request, env);
    if (path === "/api/reviews/admin" && request.method === "POST") return adminReviews(request, env);

    // Media feed (Jurnal)
    if (path === "/api/feed" && request.method === "GET") return getFeed(env);
    if (path === "/api/feed/img" && request.method === "GET") return getFeedImg(url, env);
    if (path === "/api/feed/admin" && request.method === "POST") return adminFeed(request, env);

    // Reservation requests
    if (path === "/api/booking" && request.method === "POST") return submitBooking(request, env);
    if (path === "/api/booking/admin" && request.method === "POST") return adminBookings(request, env);

    // Private visit counter
    if (path === "/api/hit" && request.method === "POST") return recordHit(request, env);
    if (path === "/api/stats/admin" && request.method === "POST") return adminStats(request, env);

    // Everything else: serve the static asset (HTML, CSS, JS, images).
    return env.ASSETS.fetch(request);
  }
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

/* Public: live price/units/availability overrides. {} when nothing saved yet. */
async function getData(env) {
  let body = "{}";
  try {
    if (env.MONTANIA_KV) {
      const raw = await env.MONTANIA_KV.get("site");
      if (raw) body = raw;
    }
  } catch (e) { /* fall through */ }
  return new Response(body, {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

/* Verify the shared admin password. */
async function login(request, env) {
  let b = {};
  try { b = await request.json(); } catch (e) { /* ignore */ }
  const pass = (b && b.password) || request.headers.get("x-admin-password") || "";
  const ok = !!env.ADMIN_PASSWORD && pass === env.ADMIN_PASSWORD;
  return json({ ok }, ok ? 200 : 401);
}

/* Protected: persist { prices, availability } to KV. */
async function save(request, env) {
  const pass = request.headers.get("x-admin-password") || "";
  if (!env.ADMIN_PASSWORD || pass !== env.ADMIN_PASSWORD) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }
  if (!env.MONTANIA_KV) {
    return json({ ok: false, error: "KV namespace MONTANIA_KV is not bound" }, 500);
  }
  let data;
  try { data = await request.json(); }
  catch { return json({ ok: false, error: "invalid JSON" }, 400); }

  if (!data || typeof data !== "object" || typeof data.prices !== "object" || typeof data.availability !== "object") {
    return json({ ok: false, error: "payload must have { prices, availability }" }, 400);
  }

  await env.MONTANIA_KV.put("site", JSON.stringify({
    prices: data.prices,
    availability: data.availability,
    updatedAt: new Date().toISOString()
  }));
  return json({ ok: true });
}

/* ---------------- shared helpers ---------------- */
function isAdmin(request, env) {
  const pass = request.headers.get("x-admin-password") || "";
  return !!env.ADMIN_PASSWORD && pass === env.ADMIN_PASSWORD;
}
async function kvJSON(env, key, fallback) {
  try {
    if (!env.MONTANIA_KV) return fallback;
    const raw = await env.MONTANIA_KV.get(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) { return fallback; }
}
function newId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function clip(s, n) { return String(s == null ? "" : s).slice(0, n); }

/* ---------------- Reviews ---------------- */
// review: { id, author, country, rating(1-10), text, date, source:"guest"|"booking",
//           status:"pending"|"approved", reply, createdAt }
async function getReviews(env) {
  const all = await kvJSON(env, "reviews", []);
  const pub = all
    .filter(r => r.status === "approved")
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    .map(r => ({ id: r.id, author: r.author, country: r.country, rating: r.rating, text: r.text, date: r.date, source: r.source, reply: r.reply || "" }));
  return json({ reviews: pub });
}

async function submitReview(request, env) {
  if (!env.MONTANIA_KV) return json({ ok: false, error: "storage unavailable" }, 500);
  let b = {};
  try { b = await request.json(); } catch { return json({ ok: false, error: "invalid JSON" }, 400); }
  const author = clip(b.author, 80).trim();
  const text = clip(b.text, 2000).trim();
  let rating = parseInt(b.rating, 10);
  if (!author || !text) return json({ ok: false, error: "name and text required" }, 400);
  if (isNaN(rating) || rating < 1 || rating > 10) rating = 10;
  const all = await kvJSON(env, "reviews", []);
  all.push({
    id: newId(), author, country: clip(b.country, 60).trim(), rating, text,
    date: new Date().toISOString().slice(0, 10), source: "guest",
    status: "pending", reply: "", createdAt: new Date().toISOString()
  });
  await env.MONTANIA_KV.put("reviews", JSON.stringify(all));
  return json({ ok: true });
}

async function adminReviews(request, env) {
  if (!isAdmin(request, env)) return json({ ok: false, error: "unauthorized" }, 401);
  if (!env.MONTANIA_KV) return json({ ok: false, error: "KV not bound" }, 500);
  let b = {};
  try { b = await request.json(); } catch { return json({ ok: false, error: "invalid JSON" }, 400); }
  const action = b.action;
  let all = await kvJSON(env, "reviews", []);

  if (action === "list") {
    all.sort((a, b2) => (b2.createdAt || "").localeCompare(a.createdAt || ""));
    return json({ reviews: all });
  }
  if (action === "add") {
    let rating = parseInt(b.rating, 10);
    if (isNaN(rating) || rating < 1 || rating > 10) rating = 10;
    all.push({
      id: newId(), author: clip(b.author, 80).trim() || "Oaspete",
      country: clip(b.country, 60).trim(), rating, text: clip(b.text, 2000).trim(),
      date: clip(b.date, 10) || new Date().toISOString().slice(0, 10),
      source: b.source === "booking" ? "booking" : "guest",
      status: "approved", reply: clip(b.reply, 2000).trim() || "", createdAt: new Date().toISOString()
    });
  } else if (action === "approve") {
    all = all.map(r => r.id === b.id ? { ...r, status: "approved" } : r);
  } else if (action === "unapprove") {
    all = all.map(r => r.id === b.id ? { ...r, status: "pending" } : r);
  } else if (action === "reply") {
    all = all.map(r => r.id === b.id ? { ...r, reply: clip(b.reply, 2000) } : r);
  } else if (action === "delete") {
    all = all.filter(r => r.id !== b.id);
  } else {
    return json({ ok: false, error: "unknown action" }, 400);
  }
  await env.MONTANIA_KV.put("reviews", JSON.stringify(all));
  return json({ ok: true });
}

/* ---------------- Media feed (Jurnal) ---------------- */
// index entry: { id, caption, place, date, createdAt }
// image stored under "feed:img:<id>" as raw base64 (jpeg)
async function getFeed(env) {
  const idx = await kvJSON(env, "feed:index", []);
  idx.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  return json({ posts: idx });
}

async function getFeedImg(url, env) {
  const id = url.searchParams.get("id") || "";
  if (!id || !env.MONTANIA_KV) return new Response("not found", { status: 404 });
  const b64 = await env.MONTANIA_KV.get("feed:img:" + id);
  if (!b64) return new Response("not found", { status: 404 });
  const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  return new Response(bytes, {
    headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=31536000, immutable" }
  });
}

async function adminFeed(request, env) {
  if (!isAdmin(request, env)) return json({ ok: false, error: "unauthorized" }, 401);
  if (!env.MONTANIA_KV) return json({ ok: false, error: "KV not bound" }, 500);
  let b = {};
  try { b = await request.json(); } catch { return json({ ok: false, error: "invalid JSON" }, 400); }
  const action = b.action;
  let idx = await kvJSON(env, "feed:index", []);

  if (action === "add") {
    let dataUrl = String(b.dataUrl || "");
    const comma = dataUrl.indexOf(",");
    const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
    if (!b64) return json({ ok: false, error: "no image" }, 400);
    if (b64.length > 4_000_000) return json({ ok: false, error: "image too large" }, 413);
    const id = newId();
    await env.MONTANIA_KV.put("feed:img:" + id, b64);
    idx.push({
      id, caption: clip(b.caption, 280).trim(), place: clip(b.place, 80).trim(),
      date: new Date().toISOString().slice(0, 10), createdAt: new Date().toISOString()
    });
    await env.MONTANIA_KV.put("feed:index", JSON.stringify(idx));
    return json({ ok: true, id });
  }
  if (action === "delete") {
    idx = idx.filter(p => p.id !== b.id);
    await env.MONTANIA_KV.put("feed:index", JSON.stringify(idx));
    try { await env.MONTANIA_KV.delete("feed:img:" + b.id); } catch (e) { /* ignore */ }
    return json({ ok: true });
  }
  return json({ ok: false, error: "unknown action" }, 400);
}

/* ---------------- Reservation requests ---------------- */
// booking: { id, roomId, roomName, checkIn, checkOut, nights, guests, total,
//            name, phone, status:"new"|"done", createdAt }
async function submitBooking(request, env) {
  if (!env.MONTANIA_KV) return json({ ok: false, error: "storage unavailable" }, 500);
  let b = {};
  try { b = await request.json(); } catch { return json({ ok: false, error: "invalid JSON" }, 400); }
  const all = await kvJSON(env, "bookings", []);
  all.push({
    id: newId(),
    roomId: clip(b.roomId, 40), roomName: clip(b.roomName, 120),
    checkIn: clip(b.checkIn, 10), checkOut: clip(b.checkOut, 10),
    nights: parseInt(b.nights, 10) || null, guests: clip(b.guests, 120),
    total: parseInt(b.total, 10) || null,
    name: clip(b.name, 80), phone: clip(b.phone, 40),
    status: "new", createdAt: new Date().toISOString()
  });
  // keep at most the latest 500 requests
  const trimmed = all.slice(-500);
  await env.MONTANIA_KV.put("bookings", JSON.stringify(trimmed));
  return json({ ok: true });
}

async function adminBookings(request, env) {
  if (!isAdmin(request, env)) return json({ ok: false, error: "unauthorized" }, 401);
  if (!env.MONTANIA_KV) return json({ ok: false, error: "KV not bound" }, 500);
  let b = {};
  try { b = await request.json(); } catch { return json({ ok: false, error: "invalid JSON" }, 400); }
  let all = await kvJSON(env, "bookings", []);

  if (b.action === "list") {
    all.sort((a, b2) => (b2.createdAt || "").localeCompare(a.createdAt || ""));
    return json({ bookings: all });
  }
  if (b.action === "done") {
    all = all.map(r => r.id === b.id ? { ...r, status: "done" } : r);
  } else if (b.action === "new") {
    all = all.map(r => r.id === b.id ? { ...r, status: "new" } : r);
  } else if (b.action === "delete") {
    all = all.filter(r => r.id !== b.id);
  } else if (b.action === "clearDone") {
    all = all.filter(r => r.status !== "done");
  } else {
    return json({ ok: false, error: "unknown action" }, 400);
  }
  await env.MONTANIA_KV.put("bookings", JSON.stringify(all));
  return json({ ok: true });
}

/* ---------------- Private visit counter ---------------- */
// stats: { total, days: { "YYYY-MM-DD": n }, pages: { "/path": n } }
async function recordHit(request, env) {
  if (!env.MONTANIA_KV) return json({ ok: true });
  // Ignore obvious bots/crawlers — we only want real visitors.
  const ua = (request.headers.get("user-agent") || "").toLowerCase();
  if (/bot|crawl|spider|slurp|bing|preview|facebookexternalhit|whatsapp|telegram|headless|lighthouse|monitor/.test(ua)) {
    return json({ ok: true, skipped: "bot" });
  }
  let b = {};
  try { b = await request.json(); } catch { /* ignore */ }
  let p = clip((b && b.path) || "/", 80);
  if (!p.startsWith("/")) p = "/" + p;
  if (p.startsWith("/admin")) return json({ ok: true, skipped: "admin" });

  const stats = await kvJSON(env, "stats", freshStats());
  stats.total = (stats.total || 0) + 1;
  const today = new Date().toISOString().slice(0, 10);
  // Ensure all buckets exist (covers records created before these fields).
  stats.days = stats.days || {};
  stats.pages = stats.pages || {};
  stats.countries = stats.countries || {};
  stats.cities = stats.cities || {};
  stats.referrers = stats.referrers || {};
  stats.devices = stats.devices || {};
  stats.langs = stats.langs || {};
  stats.hours = stats.hours || {};
  stats.dows = stats.dows || {};
  stats.visitors = stats.visitors || { new: 0, returning: 0 };
  if (!stats.since) stats.since = today;
  stats.days[today] = (stats.days[today] || 0) + 1;
  stats.pages[p] = (stats.pages[p] || 0) + 1;

  // Cloudflare provides visitor geo for free via request.cf.
  const cf = request.cf || {};
  const country = clip(cf.country || "", 4);
  if (country && country !== "T1" /* Tor */) {
    stats.countries[country] = (stats.countries[country] || 0) + 1;
    const city = clip(cf.city || "", 40);
    const region = clip(cf.region || "", 40);
    const place = city ? (region && region !== city ? city + ", " + region : city) : region;
    if (place) {
      const label = clip(place + " (" + country + ")", 60);
      stats.cities[label] = (stats.cities[label] || 0) + 1;
    }
  }

  // Traffic source (bucketed from the page-reported referrer).
  const src = referrerBucket((b && b.ref) || "");
  stats.referrers[src] = (stats.referrers[src] || 0) + 1;

  // Device type from the user-agent.
  const dev = deviceType(ua);
  stats.devices[dev] = (stats.devices[dev] || 0) + 1;

  // Site language the visitor was viewing.
  const lang = clip((b && b.lang) || "", 4).toLowerCase();
  if (lang) stats.langs[lang] = (stats.langs[lang] || 0) + 1;

  // New vs returning (reported by the page via localStorage flag).
  if (b && b.returning) stats.visitors.returning = (stats.visitors.returning || 0) + 1;
  else stats.visitors.new = (stats.visitors.new || 0) + 1;

  // Hour-of-day & day-of-week in local time (Europe/Bucharest).
  try {
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Bucharest", hour: "2-digit", hour12: false, weekday: "short" }).formatToParts(new Date());
    const hh = parts.find(x => x.type === "hour");
    if (hh) { const h = String(parseInt(hh.value, 10)); stats.hours[h] = (stats.hours[h] || 0) + 1; }
    const dmap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const wd = parts.find(x => x.type === "weekday");
    if (wd && dmap[wd.value] != null) { const d = String(dmap[wd.value]); stats.dows[d] = (stats.dows[d] || 0) + 1; }
  } catch (e) { /* ignore */ }

  // Keep only the last ~180 days to bound the record size.
  const dayKeys = Object.keys(stats.days).sort();
  if (dayKeys.length > 180) {
    for (const k of dayKeys.slice(0, dayKeys.length - 180)) delete stats.days[k];
  }
  await env.MONTANIA_KV.put("stats", JSON.stringify(stats));
  return json({ ok: true });
}

function freshStats() {
  return { total: 0, since: "", days: {}, pages: {}, countries: {}, cities: {}, referrers: {}, devices: {}, langs: {}, hours: {}, dows: {}, visitors: { new: 0, returning: 0 } };
}

function referrerBucket(ref) {
  if (!ref) return "Direct";
  let host = "";
  try { host = new URL(ref).hostname.toLowerCase(); } catch { return "Direct"; }
  if (!host || host.includes("montania.ro")) return "Direct";
  if (host.includes("google")) return "Google";
  if (host.includes("facebook") || host === "fb.com" || host.includes("fb.me") || host.includes("l.facebook")) return "Facebook";
  if (host.includes("instagram")) return "Instagram";
  if (host.includes("booking.")) return "Booking.com";
  if (host.includes("bing")) return "Bing";
  if (host.includes("duckduckgo")) return "DuckDuckGo";
  if (host.includes("yahoo")) return "Yahoo";
  if (host.includes("t.co") || host.includes("twitter") || host.includes("x.com")) return "X / Twitter";
  if (host.includes("tiktok")) return "TikTok";
  if (host.includes("whatsapp") || host.includes("wa.me")) return "WhatsApp";
  return "Altele";
}

function deviceType(ua) {
  ua = ua || "";
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) return "Tabletă";
  if (/mobi|iphone|ipod|android.*mobile|windows phone/i.test(ua)) return "Mobil";
  return "Desktop";
}

async function adminStats(request, env) {
  if (!isAdmin(request, env)) return json({ ok: false, error: "unauthorized" }, 401);
  let b = {};
  try { b = await request.json(); } catch { /* ignore */ }
  if (b && b.action === "reset") {
    const fresh = freshStats();
    fresh.since = new Date().toISOString().slice(0, 10);
    if (env.MONTANIA_KV) await env.MONTANIA_KV.put("stats", JSON.stringify(fresh));
    return json({ ok: true, stats: fresh, bookingsCount: 0 });
  }
  const stats = await kvJSON(env, "stats", freshStats());
  const bookings = await kvJSON(env, "bookings", []);
  return json({ ok: true, stats, bookingsCount: Array.isArray(bookings) ? bookings.length : 0 });
}
