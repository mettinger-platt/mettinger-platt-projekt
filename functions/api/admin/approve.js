export async function onRequestPost(context) {
  const { request, env } = context;
  const auth = request.headers.get("Authorization") || "";
  if (!env.ADMIN_TOKEN || auth !== `Bearer ${env.ADMIN_TOKEN}`) {
    return Response.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "");
  const action = body.action === "reject" ? "rejected" : "approved";

  if (!id) return Response.json({ error: "ID fehlt." }, { status: 400 });

  const result = await env.DB.prepare(
    "UPDATE entries SET status = ? WHERE id = ?"
  ).bind(action, id).run();

  return Response.json({ ok: true, status: action, changes: result.meta?.changes || 0 });
}
