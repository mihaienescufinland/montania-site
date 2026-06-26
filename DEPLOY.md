# Cum publicăm site-ul (GitHub + Cloudflare Pages) — gratuit

Site static → găzduire gratuită, HTTPS gratuit, deploy automat la fiecare modificare.

## Pas 1 — Pune codul pe GitHub
1. Creează cont gratuit pe https://github.com (dacă nu ai).
2. Creează un repository nou (gol, fără README): ex. `montania-site`. Copiază URL-ul lui
   (ex. `https://github.com/UTILIZATORUL_TAU/montania-site.git`).
3. În terminal, din folderul `montania`, rulează:
   ```bash
   git remote add origin https://github.com/UTILIZATORUL_TAU/montania-site.git
   git push -u origin main
   ```
   (GitHub îți va cere autentificare în browser sau un token.)

## Pas 2 — Conectează Cloudflare Pages
1. Creează cont gratuit pe https://dash.cloudflare.com.
2. Stânga: **Workers & Pages → Create → Pages → Connect to Git**.
3. Alege repository-ul `montania-site`.
4. Setări build:
   - **Framework preset:** None
   - **Build command:** (lasă gol)
   - **Build output directory:** `/`  (rădăcina repo-ului)
5. **Save and Deploy.** În ~1 minut site-ul e live pe o adresă `...pages.dev`.

## Pas 3 — Conectează domeniul montania.ro
Cel mai simplu (recomandat) — mută DNS-ul la Cloudflare:
1. În Cloudflare: **Websites → Add a site → montania.ro** (plan Free).
2. Cloudflare îți dă **2 nameservere** (ex. `xxx.ns.cloudflare.com`).
3. Intră la registrarul tău .ro (unde administrezi domeniul) și **înlocuiește nameserverele**
   cu cele de la Cloudflare. (Activarea durează de la câteva minute la câteva ore.)
4. Înapoi în **Workers & Pages → proiectul tău → Custom domains → Set up a custom domain**:
   adaugă `montania.ro` și `www.montania.ro`. Cloudflare creează automat înregistrările DNS și certificatul SSL.

Gata! De acum, orice modificare pe care o facem și o trimitem (`git push`) apare automat pe site.

## Update ulterior (după ce facem schimbări)
```bash
git add -A
git commit -m "descrierea modificării"
git push
```
Cloudflare redeschide automat un deploy nou.

> Notă: fișierul `_redirects` trimite vechile adrese `.htm` către paginile noi (păstrează SEO).
> Cloudflare Pages îl citește automat.
