/* POST /api/save  (protected by shared password)
   Header: x-admin-password: <ADMIN_PASSWORD>
   Body:   { prices: {...}, availability: {...} }
   Persists the payload to KV under key "site". */
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

export async function onRequestPost({ request, env }) {
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
