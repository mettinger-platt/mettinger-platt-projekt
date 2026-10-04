# Mettinger Platt – Cloudflare Pages

Diese Version ist als kleine, echte Mitmach-Webseite für Cloudflare Pages vorbereitet.

## Enthalten
- öffentliches Wörterbuch
- Suche
- Formular für neue Wörter
- optionale Bild-Uploads
- Bild-Vorschau vor dem Absenden
- Speicherung der Wörter in Cloudflare D1
- Speicherung der Bilder in Cloudflare R2
- Beiträge werden zunächst als `pending` gespeichert
- nur `approved`-Beiträge werden öffentlich angezeigt

## Cloudflare-Einrichtung

### 1. Pages-Projekt anlegen
Erstelle in Cloudflare ein neues Pages-Projekt und lade dieses Projekt hoch bzw. verbinde es mit einem Git-Repository.

### 2. D1-Datenbank anlegen
Erstelle eine D1-Datenbank mit dem Namen:

`mettinger-platt`

Führe anschließend den Inhalt von `schema.sql` auf dieser Datenbank aus.

Trage die D1-Datenbank-ID in `wrangler.toml` bei `database_id` ein.

### 3. R2-Bucket anlegen
Erstelle einen R2-Bucket mit dem Namen:

`mettinger-platt-bilder`

Der Binding-Name im Pages-Projekt muss lauten:

`PLATT_IMAGES`

### 4. D1-Binding anlegen
Der Binding-Name für die D1-Datenbank muss lauten:

`DB`

### 5. Admin-Schlüssel setzen
Lege in den Umgebungsvariablen ein Secret an:

`ADMIN_TOKEN`

Beispiel: ein langes, zufälliges Passwort.

### 6. Beiträge freigeben
Neue Beiträge landen standardmäßig mit Status `pending`.

Freigabe per API:

POST `/api/admin/approve`

Header:
`Authorization: Bearer DEIN_ADMIN_TOKEN`
`Content-Type: application/json`

Body:
`{"id":"BEITRAGS-ID","action":"approve"}`

Ablehnen:
`{"id":"BEITRAGS-ID","action":"reject"}`

## Bild-Upload
Erlaubt:
- JPG
- PNG
- WebP
- maximal 5 MB

Die Bilder werden nicht im Pages-Projekt selbst gespeichert, sondern in R2. Dadurch bleiben Uploads dauerhaft erhalten.

## Wunschadresse
Wenn der Projektname bei Cloudflare verfügbar ist, kann die Seite z. B. unter

`https://mettinger-platt.pages.dev`

laufen.

Später kann zusätzlich eine eigene Domain wie `mettinger-platt.de` aufgeschaltet werden.

## Hinweis vor öffentlicher Freigabe
Für eine öffentlich zugängliche Mitmachseite empfiehlt sich zusätzlich:
- Impressum
- Datenschutzerklärung
- Hinweis zu Bildrechten
- Spam-Schutz (z. B. Cloudflare Turnstile)
- Moderationsoberfläche für pending-Beiträge
