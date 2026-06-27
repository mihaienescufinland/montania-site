# Admin — prețuri & disponibilitate (Vila TUI)

Panoul de administrare e la **https://montania.ro/admin**. Tu și soția vă logați cu o **parolă comună** și setați, pe fiecare tip de cameră:

- **prețul de bază** și **numărul de camere** de acel tip;
- **prețul și disponibilitatea pe zile** (ca pe Booking.com): selectezi una sau mai multe zile în calendar și aplici preț + nr. camere libere, sau marchezi „OCUPAT”.

Apeși **„Publică live”** și modificările apar pe site în câteva secunde — fără să atingi codul.

---

## Configurare unică în Cloudflare (≈5 minute)

Trebuie făcută o singură dată. Toate sunt gratuite.

### 1) Creează baza de date (KV)
1. Cloudflare dashboard → **Storage & Databases → KV**.
2. **Create namespace**, nume: `montania` → Create.

### 2) Leagă KV de site
1. **Workers & Pages** → proiectul **montania-site** → **Settings → Bindings** (sau **Functions → KV namespace bindings**).
2. **Add binding**:
   - Variable name: **`MONTANIA_KV`** (exact așa, cu majuscule)
   - KV namespace: **montania**
3. Save.

### 3) Setează parola de admin
1. Tot la proiectul **montania-site** → **Settings → Variables and Secrets** (Environment variables).
2. **Add variable**:
   - Name: **`ADMIN_PASSWORD`**
   - Value: *parola voastră* (alege una bună, de ex. 12+ caractere)
   - Bifează **Encrypt** (o face secretă).
3. Save.

### 4) Re-deploy
- **Deployments → Retry deployment** (sau orice push nou în GitHub declanșează automat un deploy).
- Gata: intră pe **/admin**, pune parola, gata de operat.

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
