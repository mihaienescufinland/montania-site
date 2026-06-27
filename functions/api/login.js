/* POST /api/login  { password }  -> { ok } : verifies the shared admin password. */
export async function onRequestPost({ request, env }) {
  let body = {};
  try { body = await request.json(); } catch { /* ignore */ }
  const pass = (body && body.password) || request.headers.get("x-admin-password") || "";
  const ok = !!env.ADMIN_PASSWORD && pass === env.ADMIN_PASSWORD;
  return new Response(JSON.stringify({ ok }), {
    status: ok ? 200 : 401,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}
