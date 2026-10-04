export async function onRequestGet(context) {
  const { env, params } = context;
  const raw = params.key;
  const key = Array.isArray(raw) ? raw.join("/") : raw;
  const object = await env.PLATT_IMAGES.get(key);

  if (!object) return new Response("Nicht gefunden", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=86400");
  return new Response(object.body, { headers });
}
