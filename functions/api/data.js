/* GET /api/data
   Public read of live prices/units/availability overrides.
   Shape: { prices: { roomId: { price, units } }, availability: { roomId: { "YYYY-MM-DD": { p, a } } } }
   Returns {} when nothing has been saved yet (site then uses static data.js defaults). */
export async function onRequestGet({ env }) {
  let body = "{}";
  try {
    if (env.MONTANIA_KV) {
      const raw = await env.MONTANIA_KV.get("site");
      if (raw) body = raw;
    }
  } catch (e) { /* fall through to empty */ }
  return new Response(body, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
