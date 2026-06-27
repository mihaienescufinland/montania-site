# Admin — prețuri & disponibilitate (Vila TUI)

Panoul de administrare e la **https://montania.ro/admin**. Tu și soția vă logați cu o **parolă comună** și setați, pe fiecare tip de cameră:

- **prețul de bază** și **numărul de camere** de acel tip;
- **prețul și disponibilitatea pe zile** (ca pe Booking.com): selectezi una sau mai multe zile în calendar și aplici preț + nr. camere libere, sau marchezi „OCUPAT”.

Apeși **„Publică live”** și modificările apar pe site în câteva secunde — fără să atingi codul.

---

## Configurare unică în Cloudflare (≈5 minute)

Proiectul `montania-site` este un **Worker cu static assets**. Codul serverului (`worker.js` + `wrangler.jsonc`) e deja în repo. Mai rămâne:

### 1) Creează baza de date (KV)
1. Cloudflare dashboard → **Storage & Databases → KV** (sau **Workers & Pages → KV**).
2. **Create namespace**, nume: `montania` → Create.
3. Copiază **Namespace ID** (un șir lung) — e nevoie de el la pasul 2.

### 2) Leagă KV în config
- Trimite-mi **Namespace ID**-ul și îl adaug în `wrangler.jsonc` (secțiunea `kv_namespaces`, binding `MONTANIA_KV`) și dau push.
- (Pe Workers, binding-urile se definesc în `wrangler.jsonc`, nu din dashboard — altfel sunt suprascrise la deploy.)

### 3) Setează parola de admin (secret)
1. **Workers & Pages → montania-site → Settings → Variables and Secrets**.
   - (Devine disponibil după ce se face primul deploy cu `worker.js`.)
2. **Add** → tip **Secret**:
   - Name: **`ADMIN_PASSWORD`**
   - Value: *parola voastră* (12+ caractere)
3. Save. (Secretele rămân setate între deploy-uri.)

### 4) Deploy
- Orice push declanșează un deploy. După ce KV e în config și secretul e setat, intră pe **/admin**.

---

## Cum funcționează (pe scurt)
- Structura camerelor (denumiri, poze, dotări) stă în cod (`assets/js/data.js`).
- **Prețurile, nr. de camere și disponibilitatea pe zile** stau în baza de date KV și se editează din `/admin`.
- Site-ul public citește automat datele live; dacă baza e goală, folosește prețurile implicite din cod.

## Schimbarea parolei
- Modifici valoarea `ADMIN_PASSWORD` (pasul 3) și dai re-deploy. Atât.

## Note
- `/admin` este blocat în `robots.txt` (nu apare în Google).
- Parola e una singură, partajată (cum ai cerut). Dacă vrei mai târziu login pe e‑mail per persoană, se poate trece la Cloudflare Access.
