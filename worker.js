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
