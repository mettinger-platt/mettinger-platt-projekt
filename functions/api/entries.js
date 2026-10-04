export async function onRequestGet(context) {
  const { env } = context;
  const { results } = await env.DB.prepare(`
    SELECT id, german, platt, note, submitter, period, image_key, created_at
    FROM entries
    WHERE status = 'approved'
    ORDER BY german COLLATE NOCASE ASC
  `).all();

  return Response.json(results || [], {
    headers: { "Cache-Control": "public, max-age=60" }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const type = request.headers.get("content-type") || "";
  if (!type.includes("multipart/form-data")) {
    return Response.json({ error: "Ungültiges Formular." }, { status: 400 });
  }

  const form = await request.formData();
  const german = String(form.get("german") || "").trim();
  const platt = String(form.get("platt") || "").trim();
  const note = String(form.get("note") || "").trim();
  const submitter = String(form.get("submitter") || "").trim();
  const period = String(form.get("period") || "").trim();
  const consent = form.get("consent");
  const image = form.get("image");

  if (!german || !platt || !consent) {
    return Response.json({ error: "Bitte Pflichtfelder ausfüllen und Zustimmung erteilen." }, { status: 400 });
  }
  if (german.length > 100 || platt.length > 100 || note.length > 1000 || submitter.length > 100 || period.length > 80) {
    return Response.json({ error: "Mindestens ein Feld ist zu lang." }, { status: 400 });
  }

  let imageKey = null;
  if (image && typeof image === "object" && image.size) {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(image.type)) {
      return Response.json({ error: "Nur JPG, PNG oder WebP sind erlaubt." }, { status: 400 });
    }
    if (image.size > 5 * 1024 * 1024) {
      return Response.json({ error: "Das Bild darf maximal 5 MB groß sein." }, { status: 400 });
    }

    const ext = image.type === "image/png" ? "png" : image.type === "image/webp" ? "webp" : "jpg";
    imageKey = `uploads/${crypto.randomUUID()}.${ext}`;
    await env.PLATT_IMAGES.put(imageKey, image.stream(), {
      httpMetadata: { contentType: image.type },
      customMetadata: { originalName: image.name || "" }
    });
  }

  const id = crypto.randomUUID();
  await env.DB.prepare(`
    INSERT INTO entries (id, german, platt, note, submitter, period, image_key, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
  `).bind(id, german, platt, note, submitter, period, imageKey).run();

  return Response.json({ ok: true, id, status: "pending" }, { status: 201 });
}
