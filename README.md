# Montania — site nou (primă versiune)

Site static, rapid, bilingv (RO/EN) pentru **Vila TUI (Sinaia)** și **Bio de Maramu' (Maramureș)**.

## Cum vezi site-ul local
Deschide `index.html` direct în browser, SAU pornește un mic server local:

```bash
cd montania
python3 -m http.server 8000
```
Apoi deschide http://localhost:8000

## Structura
```
montania/
├── index.html        # Acasă (hub: Vila + Bio)
├── vila.html         # Vila TUI: camere, prețuri, calendar disponibilitate, rezervare
├── bio.html          # Bio de Maramu': poveste + produse + legume Brașov (secundar)
├── contact.html      # Contact + hartă
└── assets/
    ├── css/styles.css
    └── js/
        ├── data.js   # <-- SINGURUL fișier pe care îl editezi tu (prețuri, disponibilitate, produse)
        ├── i18n.js   # traduceri RO/EN
        └── main.js   # logică (calendar, formular)
```

## Cum actualizezi prețuri și disponibilitate (ca pe Booking.com)
Editezi doar `assets/js/data.js`:

- **Preț pe noapte** → câmpul `price` al fiecărei camere (în RON).
- **Zile ocupate** → câmpul `booked`, o listă de date în format `"AAAA-LL-ZZ"`.
  Exemplu: o cameră ocupată în nopțile de 4 și 5 iulie 2026:
  ```js
  booked: ["2026-07-04", "2026-07-05"]
  ```
  Zilele din `booked` apar roșu/barat în calendar și nu pot fi selectate.

- **Telefon / email / WhatsApp / scor Booking** → secțiunea `contact`.
- **Produse Bio de Maramu'** → lista `bioProducts`.
- **Legume/cartofi Brașov (cumnat)** → secțiunea `bv` (telefon + produse + prețuri).

## Cum funcționează rezervarea directă
Pe pagina **Vila TUI**, oaspetele alege camera, selectează check-in/check-out în calendar
(se calculează automat nopțile și totalul estimativ), completează numele și trimite cererea.
Cererea ajunge prin **email** (`mailto`) sau **WhatsApp** — nu există plată online deocamdată.

## De înlocuit (placeholder)
- Toate pozele sunt momentan de pe Unsplash (demonstrativ). Înlocuiește URL-urile cu pozele tale reale.
- Numărul de telefon al cumnatului (`bv.phone`) și prețurile sunt placeholder.
- Linkul Booking.com (`contact.bookingUrl`) — pune linkul exact al proprietății.
```
