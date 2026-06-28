/* =====================================================================
   MONTANIA — Admin (prețuri & disponibilitate)
   Grilă tip Booking: toate camerele × zile, editare prețuri + disponibilitate.
   Publică în KV prin /api/save (parolă partajată).
   ===================================================================== */

const PW_KEY = "montania_admin_pw";

const state = {
  pw: sessionStorage.getItem(PW_KEY) || "",
  prices: {},        // { roomId: { price, units } }
  availability: {},  // { roomId: { "YYYY-MM-DD": { p, a } } }
  winStart: null,    // Date (start of visible window)
  winEnd: null,      // Date (end of visible window, inclusive)
  selected: new Set(),// "roomId|YYYY-MM-DD"
  dirty: false,
  lastNewCount: null, // tracks pending requests to detect arrivals
  autoTimer: null,
  bookingsCount: 0    // total reservation requests (for conversion rate)
};

const AUTO_REFRESH_MS = 30000;

/* ---- helpers ---- */
const $ = (id) => document.getElementById(id);
function ymd(d){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function parseYmd(s){ const [y,m,d]=s.split("-").map(Number); return new Date(y,m-1,d); }
function startOfDay(d){ const x=new Date(d); x.setHours(0,0,0,0); return x; }
function roomById(id){ return SITE.rooms.find(r=>r.id===id); }
function base(roomId){ return state.prices[roomId] || { price: roomById(roomId).price, units: roomById(roomId).units || 1 }; }
function dayInfo(roomId, key){
  const ov = (state.availability[roomId]||{})[key];
  const b = base(roomId);
  return {
    p: (ov && ov.p!=null) ? ov.p : b.price,
    a: (ov && ov.a!=null) ? ov.a : b.units,
    m: (ov && ov.m!=null) ? ov.m : 1
  };
}
function markDirty(){ state.dirty = true; $("status").textContent = "Ai modificări nepublicate."; $("status").className = "status err"; }

/* ---- auth ---- */
async function verify(pw){
  try {
    const r = await fetch("/api/login", { method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify({ password: pw }) });
    return r.ok;
  } catch(e){ return false; }
}
async function tryAutoLogin(){
  if (state.pw && await verify(state.pw)) { showEditor(); }
  else showLogin();
}
function showLogin(){ $("login-card").classList.remove("hidden"); $("editor").classList.add("hidden"); $("savebar").classList.add("hidden"); $("logout").classList.add("hidden"); }
async function showEditor(){
  $("login-card").classList.add("hidden");
  $("editor").classList.remove("hidden");
  $("savebar").classList.remove("hidden");
  $("logout").classList.remove("hidden");
  try { localStorage.setItem("montania_owner", "1"); } catch(e){} // exclude my own visits from the counter
  await loadModel();
  const now = startOfDay(new Date());
  state.winStart = now;
  state.winEnd = new Date(now); state.winEnd.setDate(state.winEnd.getDate() + 60);
  $("win-start").value = ymd(state.winStart);
  $("win-end").value = ymd(state.winEnd);
  buildBaseTable();
  renderMatrix();
  loadReviewsAdmin();
  loadFeedAdmin();
  loadBookings();
  loadStats();
  startAutoRefresh();
}

function startAutoRefresh() {
  if (state.autoTimer) clearInterval(state.autoTimer);
  state.autoTimer = setInterval(() => {
    if (document.visibilityState === "visible") loadBookings(true);
  }, AUTO_REFRESH_MS);
  // Refresh immediately when the admin returns to the tab.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") loadBookings(true);
  });
}

function setRefreshStamp() {
  const el = $("book-autorefresh");
  if (!el) return;
  const now = new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  el.textContent = `⟳ Reîmprospătare automată la 30s · ultima: ${now}`;
}

function notifyNewRequest(n) {
  // Flash the title and the count badge so a new request is impossible to miss.
  try {
    const o = document.title;
    let flips = 0;
    const iv = setInterval(() => {
      document.title = (flips % 2 === 0) ? `🔔 (${n}) Cerere nouă!` : o;
      if (++flips > 7) { clearInterval(iv); document.title = o; }
    }, 700);
  } catch (e) { /* ignore */ }
  const badge = $("book-count");
  if (badge) {
    badge.classList.add("badge-flash");
    setTimeout(() => badge.classList.remove("badge-flash"), 4000);
  }
  // Short beep (best-effort; ignored if the browser blocks audio).
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type = "sine"; osc.frequency.value = 880; g.gain.value = 0.06;
    osc.start(); osc.stop(ctx.currentTime + 0.18);
  } catch (e) { /* ignore */ }
}

/* ---- visit counter ---- */
async function loadStats() {
  const box = $("stats-body");
  if (!box) return;
  try {
    const res = await adminPost("/api/stats/admin", {});
    if (!res.ok) { box.innerHTML = "<p class='hint'>Statisticile apar doar pe site-ul live.</p>"; return; }
    const data = await res.json();
    state.bookingsCount = data.bookingsCount || 0;
    renderStats(data.stats || {});
  } catch (e) { box.innerHTML = "<p class='hint'>Statisticile apar doar pe site-ul live.</p>"; }
}

const PAGE_NAMES = { "/": "Acasă", "/vila": "Vila TUI", "/vila.html": "Vila TUI", "/sinaia": "Sinaia", "/sinaia.html": "Sinaia", "/bio": "Bio de Maramu'", "/bio.html": "Bio de Maramu'", "/jurnal": "Jurnal", "/jurnal.html": "Jurnal", "/contact": "Contact", "/contact.html": "Contact" };
const COUNTRY_NAMES = { RO: "România", MD: "Moldova", DE: "Germania", FR: "Franța", IT: "Italia", GB: "Marea Britanie", US: "SUA", NL: "Olanda", AT: "Austria", ES: "Spania", BE: "Belgia", CH: "Elveția", HU: "Ungaria", BG: "Bulgaria", PL: "Polonia", UA: "Ucraina", IL: "Israel", FI: "Finlanda", SE: "Suedia", DK: "Danemarca", IE: "Irlanda", CZ: "Cehia", GR: "Grecia", PT: "Portugalia", TR: "Turcia", CA: "Canada", AU: "Australia", NO: "Norvegia" };
const LANG_NAMES = { ro: "🇷🇴 Română", en: "🇬🇧 Engleză", fr: "🇫🇷 Franceză", it: "🇮🇹 Italiană", de: "🇩🇪 Germană" };

function renderStats(s) {
  const box = $("stats-body");
  const days = s.days || {}, pages = s.pages || {};
  const ymdLocal = d => d.toISOString().slice(0, 10);
  const sumLast = n => { let t = 0; for (let i = 0; i < n; i++) { const d = new Date(); d.setDate(d.getDate() - i); t += days[ymdLocal(d)] || 0; } return t; };
  const yest = new Date(); yest.setDate(yest.getDate() - 1);
  const today = days[ymdLocal(new Date())] || 0;
  const yesterday = days[ymdLocal(yest)] || 0;
  const last7 = sumLast(7), last30 = sumLast(30);

  const flag = cc => (cc && cc.length === 2 && /^[A-Z]{2}$/.test(cc)) ? String.fromCodePoint(...[...cc].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)) : "🌍";
  const top = (obj, n) => Object.entries(obj || {}).sort((a, b) => b[1] - a[1]).slice(0, n);
  const sumv = obj => Object.values(obj || {}).reduce((a, b) => a + b, 0);
  const pct = (n, t) => t ? Math.round(n / t * 100) : 0;

  // Compact horizontal-bar list block
  const block = (title, entries, fmt, total) => {
    if (!entries.length) return "";
    const t = total != null ? total : entries.reduce((a, [, n]) => a + n, 0);
    const rows = entries.map(([k, n]) => `<div class="srow"><span class="srow-l">${fmt(k)}</span><span class="srow-bar"><i style="width:${pct(n, t)}%"></i></span><span class="srow-n">${n}</span><span class="srow-p">${pct(n, t)}%</span></div>`).join("");
    return `<div class="stat-block"><h4>${escA(title)}</h4>${rows}</div>`;
  };

  // 30-day sparkline + busiest day
  const series = [];
  for (let i = 29; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); series.push([ymdLocal(d), days[ymdLocal(d)] || 0]); }
  const max = Math.max(1, ...series.map(x => x[1]));
  const bars = series.map(([k, v]) => `<span class="spark-bar" style="height:${Math.round((v / max) * 100)}%" title="${k}: ${v}"></span>`).join("");
  const busiest = series.slice().sort((a, b) => b[1] - a[1])[0];
  const busiestTxt = (busiest && busiest[1]) ? `vârf: ${busiest[0].slice(5)} (${busiest[1]})` : "";

  // Conversion: requests / Vila-page visits
  const vilaVisits = (pages["/vila"] || 0) + (pages["/vila.html"] || 0);
  const bookings = state.bookingsCount || 0;
  const conv = vilaVisits ? Math.round(bookings / vilaVisits * 100) : 0;

  const countries = s.countries || {};

  // Visitors new vs returning
  const v = s.visitors || { new: 0, returning: 0 };
  const totV = (v.new || 0) + (v.returning || 0);

  // Hour-of-day sparkline (0..23, local Bucharest)
  const hours = s.hours || {};
  const hourArr = []; for (let h = 0; h < 24; h++) hourArr.push(hours[String(h)] || 0);
  const hmax = Math.max(1, ...hourArr);
  const hourBars = hourArr.map((val, h) => `<span class="spark-bar" style="height:${Math.round((val / hmax) * 100)}%" title="${h}:00 — ${val}"></span>`).join("");
  let peakHour = 0; hourArr.forEach((val, h) => { if (val > hourArr[peakHour]) peakHour = h; });
  const peakHourTxt = sumv(hours) ? `oră de vârf: ${peakHour}:00–${peakHour + 1}:00` : "";

  // Day-of-week (worker maps Sun=0..Sat=6); display Mon..Sun
  const dows = s.dows || {};
  const dowOrder = [1, 2, 3, 4, 5, 6, 0];
  const dowLbl = { 1: "Lun", 2: "Mar", 3: "Mie", 4: "Joi", 5: "Vin", 6: "Sâm", 0: "Dum" };
  const dmax = Math.max(1, ...dowOrder.map(d => dows[String(d)] || 0));
  const dowBars = dowOrder.map(d => { const val = dows[String(d)] || 0; return `<div class="dow-col"><span class="dow-bar" style="height:${Math.round((val / dmax) * 100)}%" title="${val}"></span><span class="dow-lbl">${dowLbl[d]}</span></div>`; }).join("");

  box.innerHTML = `
    <div class="stat-grid">
      <div class="stat-tile"><div class="stat-num">${s.total || 0}</div><div class="stat-lbl">Total vizite</div></div>
      <div class="stat-tile"><div class="stat-num">${today}</div><div class="stat-lbl">Azi</div></div>
      <div class="stat-tile"><div class="stat-num">${yesterday}</div><div class="stat-lbl">Ieri</div></div>
      <div class="stat-tile"><div class="stat-num">${last7}</div><div class="stat-lbl">7 zile</div></div>
      <div class="stat-tile"><div class="stat-num">${last30}</div><div class="stat-lbl">30 zile</div></div>
      <div class="stat-tile stat-conv" title="Cereri de rezervare ÷ vizite pe pagina Vila TUI"><div class="stat-num">${conv}%</div><div class="stat-lbl">Conversie (${bookings}/${vilaVisits})</div></div>
    </div>

    <div class="spark spark30" title="Ultimele 30 de zile">${bars}</div>
    <div class="spark-cap hint">Ultimele 30 de zile${busiestTxt ? " · " + busiestTxt : ""}</div>

    <div class="stat-cols mt-2">
      ${block("Țări", top(countries, 6), c => flag(c) + " " + escA(COUNTRY_NAMES[c] || c))}
      ${block("Orașe / regiuni", top(s.cities, 6), escA)}
      ${block("Pagini", top(pages, 6), p => escA(PAGE_NAMES[p] || p))}
    </div>
    <div class="stat-cols mt-1">
      ${block("Surse de trafic", top(s.referrers, 6), escA)}
      ${block("Dispozitive", top(s.devices, 3), escA)}
      ${block("Limbă", top(s.langs, 5), k => LANG_NAMES[k] || escA(k))}
    </div>

    <div class="stat-cols mt-1">
      ${totV ? `<div class="stat-block"><h4>Vizitatori</h4>
        <div class="srow"><span class="srow-l">🆕 Noi</span><span class="srow-bar"><i style="width:${pct(v.new, totV)}%"></i></span><span class="srow-n">${v.new || 0}</span><span class="srow-p">${pct(v.new, totV)}%</span></div>
        <div class="srow"><span class="srow-l">🔁 Reveniți</span><span class="srow-bar"><i style="width:${pct(v.returning, totV)}%"></i></span><span class="srow-n">${v.returning || 0}</span><span class="srow-p">${pct(v.returning, totV)}%</span></div>
      </div>` : ""}
      ${sumv(dows) ? `<div class="stat-block"><h4>Zile ale săptămânii</h4><div class="dow-row">${dowBars}</div></div>` : ""}
    </div>

    ${sumv(hours) ? `<h4 class="stat-h4 mt-2">Ore de activitate (ora României)</h4>
      <div class="spark spark24" title="Vizite pe oră">${hourBars}</div>
      <div class="spark-cap hint">0h → 23h${peakHourTxt ? " · " + peakHourTxt : ""}</div>` : ""}

    <p class="hint mt-1">Locația/sursa sunt aproximative, fără date personale. Vizitele tale ca admin nu se numără; boții sunt excluși. Conversia = cereri de rezervare ÷ vizite pe pagina Vila TUI.${s.since ? ` Date din: ${escA(s.since)}.` : ""}</p>`;
}

/* ---- shared admin POST ---- */
async function adminPost(path, body) {
  return fetch(path, { method: "POST", headers: { "content-type": "application/json", "x-admin-password": state.pw }, body: JSON.stringify(body) });
}
function escA(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

/* ---- reviews moderation ---- */
async function loadReviewsAdmin() {
  const box = $("rev-admin-list"); if (!box) return;
  try {
    const res = await adminPost("/api/reviews/admin", { action: "list" });
    if (!res.ok) { box.innerHTML = "<p class='hint'>Nu pot încărca recenziile.</p>"; return; }
    const data = await res.json();
    renderReviewsAdmin(data.reviews || []);
  } catch (e) { box.innerHTML = "<p class='hint'>Recenziile apar doar pe site-ul live.</p>"; }
}
function renderReviewsAdmin(list) {
  const box = $("rev-admin-list");
  if (!list.length) { box.innerHTML = "<p class='hint'>Nicio recenzie încă.</p>"; return; }
  box.innerHTML = list.map(r => `
    <div class="rev-item ${r.status === 'pending' ? 'pending' : ''}">
      <div class="rev-h">
        <span class="rev-score">${r.rating}/10</span>
        <strong>${escA(r.author)}</strong>
        ${r.country ? `<span class="hint">${escA(r.country)}</span>` : ""}
        <span class="hint">${escA(r.date || "")}${r.source === 'booking' ? ' · Booking' : ''}</span>
        <span class="rev-badge ${r.status === 'pending' ? 'p' : 'a'}">${r.status === 'pending' ? 'În așteptare' : 'Publicată'}</span>
      </div>
      <div>${escA(r.text)}</div>
      <textarea data-reply="${r.id}" placeholder="Răspunsul gazdei…">${escA(r.reply || "")}</textarea>
      <div class="rev-actions">
        ${r.status === 'pending'
          ? `<button class="btn btn-primary" data-approve="${r.id}">Aprobă</button>`
          : `<button class="btn btn-outline" data-unapprove="${r.id}">Retrage</button>`}
        <button class="btn btn-dark" data-savereply="${r.id}">Salvează răspuns</button>
        <button class="btn btn-outline" data-del="${r.id}">Șterge</button>
      </div>
    </div>`).join("");
  box.querySelectorAll("[data-approve]").forEach(b => b.addEventListener("click", () => revAction({ action: "approve", id: b.dataset.approve })));
  box.querySelectorAll("[data-unapprove]").forEach(b => b.addEventListener("click", () => revAction({ action: "unapprove", id: b.dataset.unapprove })));
  box.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => { if (confirm("Ștergi recenzia definitiv?")) revAction({ action: "delete", id: b.dataset.del }); }));
  box.querySelectorAll("[data-savereply]").forEach(b => b.addEventListener("click", () => {
    const ta = box.querySelector(`textarea[data-reply="${b.dataset.savereply}"]`);
    revAction({ action: "reply", id: b.dataset.savereply, reply: ta.value });
  }));
}
async function revAction(body) {
  const res = await adminPost("/api/reviews/admin", body);
  if (res.ok) loadReviewsAdmin(); else alert("Eroare la salvare.");
}

/* ---- reservation requests ---- */
async function loadBookings(silent) {
  const box = $("book-list"); if (!box) return;
  try {
    const res = await adminPost("/api/booking/admin", { action: "list" });
    if (!res.ok) { if (!silent) box.innerHTML = "<p class='hint'>Nu pot încărca cererile.</p>"; return; }
    const data = await res.json();
    renderBookings(data.bookings || []);
    setRefreshStamp();
  } catch (e) { if (!silent) box.innerHTML = "<p class='hint'>Cererile apar doar pe site-ul live.</p>"; }
}
function renderBookings(list) {
  const box = $("book-list");
  const cnt = $("book-count");
  const newCount = list.filter(r => r.status === "new").length;
  if (cnt) cnt.textContent = newCount;
  // Detect a freshly-arrived request (count went up since last poll).
  if (state.lastNewCount !== null && newCount > state.lastNewCount) {
    notifyNewRequest(newCount);
  }
  state.lastNewCount = newCount;
  if (!list.length) { box.innerHTML = "<p class='hint'>Nicio cerere încă.</p>"; return; }
  box.innerHTML = list.map(r => {
    const when = (r.createdAt || "").replace("T", " ").slice(0, 16);
    const dates = (r.checkIn || "?") + " → " + (r.checkOut || "?");
    const meta = [r.nights ? r.nights + " nopți" : "", r.guests ? r.guests + " pers." : "", r.total ? r.total + " RON" : ""].filter(Boolean).join(" · ");
    return `<div class="book-item ${r.status}">
      <div class="b-room">${escA(r.roomName || r.roomId || "Cameră")}</div>
      <div class="b-dates">${escA(dates)}</div>
      ${meta ? `<div class="b-meta">${escA(meta)}</div>` : ""}
      ${r.phone ? `<div class="b-phone">📞 <a href="tel:${escA(String(r.phone).replace(/[^0-9+]/g, ""))}">${escA(r.phone)}</a></div>` : `<div class="b-meta" style="color:#b23">📞 fără telefon</div>`}
      <div class="b-meta">Trimisă: ${escA(when)}</div>
      <div class="b-actions">
        ${r.status === "new"
          ? `<button class="btn btn-primary" data-bkdone="${r.id}">Rezolvată</button>`
          : `<button class="btn btn-outline" data-bknew="${r.id}">Redeschide</button>`}
        <button class="btn btn-outline" data-bkdel="${r.id}">Șterge</button>
      </div>
    </div>`;
  }).join("");
  box.querySelectorAll("[data-bkdone]").forEach(b => b.addEventListener("click", () => bkAction({ action: "done", id: b.dataset.bkdone })));
  box.querySelectorAll("[data-bknew]").forEach(b => b.addEventListener("click", () => bkAction({ action: "new", id: b.dataset.bknew })));
  box.querySelectorAll("[data-bkdel]").forEach(b => b.addEventListener("click", () => { if (confirm("Ștergi cererea?")) bkAction({ action: "delete", id: b.dataset.bkdel }); }));
}
async function bkAction(body) {
  const res = await adminPost("/api/booking/admin", body);
  if (res.ok) loadBookings(); else alert("Eroare.");
}

/* ---- media feed ---- */
async function loadFeedAdmin() {
  const box = $("feed-admin-list"); if (!box) return;
  try {
    const res = await fetch("/api/feed", { cache: "no-store" });
    const data = await res.json();
    renderFeedAdmin(data.posts || []);
  } catch (e) { box.innerHTML = ""; }
}
function renderFeedAdmin(posts) {
  const box = $("feed-admin-list");
  box.innerHTML = posts.map(p => `
    <div class="fa-item">
      <img loading="lazy" src="/api/feed/img?id=${encodeURIComponent(p.id)}" alt="">
      <button class="fa-del" data-delfeed="${p.id}" title="Șterge">×</button>
      <div class="fa-cap">${escA(p.caption || "")}${p.place ? " · " + escA(p.place) : ""}</div>
    </div>`).join("");
  box.querySelectorAll("[data-delfeed]").forEach(b => b.addEventListener("click", async () => {
    if (!confirm("Ștergi poza din feed?")) return;
    const res = await adminPost("/api/feed/admin", { action: "delete", id: b.dataset.delfeed });
    if (res.ok) loadFeedAdmin(); else alert("Eroare.");
  }));
}
function resizeImage(file, maxEdge) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let w = img.width, h = img.height;
      if (w > h && w > maxEdge) { h = Math.round(h * maxEdge / w); w = maxEdge; }
      else if (h >= w && h > maxEdge) { w = Math.round(w * maxEdge / h); h = maxEdge; }
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = reject;
    img.src = url;
  });
}
async function uploadPhotos() {
  const input = $("feed-file"); const files = Array.from(input.files || []);
  if (!files.length) { alert("Alege una sau mai multe poze."); return; }
  const caption = $("feed-caption").value, place = $("feed-place").value;
  const msg = $("feed-msg");
  let done = 0;
  for (const f of files) {
    msg.textContent = `Se încarcă ${done + 1}/${files.length}…`;
    try {
      const dataUrl = await resizeImage(f, 1400);
      const res = await adminPost("/api/feed/admin", { action: "add", caption, place, dataUrl });
      if (res.ok) done++;
      else { const j = await res.json().catch(() => ({})); msg.textContent = "Eroare: " + (j.error || res.status); return; }
    } catch (e) { msg.textContent = "Eroare la procesarea pozei."; return; }
  }
  msg.textContent = `Gata — ${done} poză(e) publicate.`;
  input.value = ""; $("feed-caption").value = ""; $("feed-place").value = "";
  loadFeedAdmin();
}

/* ---- model ---- */
async function loadModel(){
  state.prices = {};
  SITE.rooms.forEach(r => { state.prices[r.id] = { price: r.price, units: r.units || 1 }; });
  state.availability = {};
  try {
    const res = await fetch("/api/data", { cache:"no-store" });
    if (res.ok){
      const live = await res.json();
      if (live.prices) Object.keys(live.prices).forEach(id => { if (state.prices[id]) state.prices[id] = Object.assign(state.prices[id], live.prices[id]); });
      if (live.availability) state.availability = live.availability;
    }
  } catch(e){ /* local preview */ }
}

/* ---- base price table ---- */
function buildBaseTable(){
  $("base-body").innerHTML = SITE.rooms.map(r => {
    const b = base(r.id);
    return `<tr>
      <td>${r.name.ro}</td>
      <td><input type="number" min="0" data-base-price="${r.id}" value="${b.price}"></td>
      <td><input type="number" min="0" data-base-units="${r.id}" value="${b.units}"></td>
    </tr>`;
  }).join("");
  $("base-body").querySelectorAll("[data-base-price]").forEach(inp => {
    inp.addEventListener("change", () => {
      const id = inp.dataset.basePrice, v = parseInt(inp.value,10);
      if (!isNaN(v)){ state.prices[id] = Object.assign(base(id), { price: v }); markDirty(); renderMatrix(); }
    });
  });
  $("base-body").querySelectorAll("[data-base-units]").forEach(inp => {
    inp.addEventListener("change", () => {
      const id = inp.dataset.baseUnits, v = parseInt(inp.value,10);
      if (!isNaN(v)){ state.prices[id] = Object.assign(base(id), { units: v }); markDirty(); renderMatrix(); }
    });
  });
}

/* ---- matrix ---- */
function windowLen(){
  return Math.max(1, Math.round((state.winEnd - state.winStart) / 86400000) + 1);
}
function windowDays(){
  const out = [];
  const n = Math.min(windowLen(), 400); // safety cap
  const d = new Date(state.winStart);
  for (let i=0; i<n; i++){ out.push(new Date(d)); d.setDate(d.getDate()+1); }
  return out;
}
function shiftWindow(deltaDays){
  state.winStart = new Date(state.winStart); state.winStart.setDate(state.winStart.getDate()+deltaDays);
  state.winEnd = new Date(state.winEnd); state.winEnd.setDate(state.winEnd.getDate()+deltaDays);
  $("win-start").value = ymd(state.winStart);
  $("win-end").value = ymd(state.winEnd);
  renderMatrix();
}
function renderMatrix(){
  const days = windowDays();
  const today = startOfDay(new Date());
  const dows = ["Du","Lu","Ma","Mi","Jo","Vi","Sâ"];

  // month band (groups consecutive days by month) + day header row
  const groups = [];
  days.forEach(d => {
    const label = d.toLocaleDateString("ro-RO", { month: "long", year: "numeric" });
    if (groups.length && groups[groups.length - 1].label === label) groups[groups.length - 1].count++;
    else groups.push({ label, count: 1 });
  });
  let monthRow = `<th class="corner" rowspan="2">Cameră</th>`;
  groups.forEach(g => { monthRow += `<th class="monthhead" colspan="${g.count}">${g.label.charAt(0).toUpperCase() + g.label.slice(1)}</th>`; });

  let dayRow = "";
  days.forEach(d => {
    const wknd = (d.getDay()===0 || d.getDay()===6) ? " weekend" : "";
    const mstart = d.getDate()===1 ? " mstart" : "";
    dayRow += `<th class="dayhead${wknd}${mstart}" data-col="${ymd(d)}"><div class="wd">${dows[d.getDay()]}</div><div class="dn">${d.getDate()}</div></th>`;
  });
  const head = `<tr>${monthRow}</tr><tr>${dayRow}</tr>`;

  let body = "";
  SITE.rooms.forEach(r => {
    const b = base(r.id);
    body += `<tr><th class="roomcell" data-row="${r.id}">${r.name.ro}<small>bază ${b.price} RON · ${b.units} cam.</small></th>`;
    days.forEach(d => {
      const key = ymd(d);
      const mstart = d.getDate()===1 ? " mstart" : "";
      const past = d < today;
      if (past){ body += `<td class="past${mstart}"></td>`; return; }
      const info = dayInfo(r.id, key);
      const sold = info.a<=0;
      const sel = state.selected.has(r.id+"|"+key);
      let cls = "cell"+(sold?" sold":"")+(sel?" sel":"")+mstart;
      const minBadge = info.m>1 ? `<div class="mn">min ${info.m}n</div>` : "";
      body += `<td class="${cls}" data-room="${r.id}" data-key="${key}"><div class="p">${sold?"–":info.p}</div><div class="a">${sold?"0":info.a}</div>${minBadge}</td>`;
    });
    body += `</tr>`;
  });

  $("matrix").innerHTML = `<table class="matrix"><thead>${head}</thead><tbody>${body}</tbody></table>`;
  initMatrixDrag();

  // (cell + day-header interaction handled by drag handlers bound once in initMatrixDrag)
  // whole-row select (room name) = that room, all days
  $("matrix").querySelectorAll("th.roomcell").forEach(th => {
    th.addEventListener("click", () => selectRow(th.dataset.row));
  });

  updateSelCount();
}

/* ---- popup editor (auto-opens for the current selection) ---- */
let pop = null;
let popOnClose = null;
function popKey(e){ if (e.key==="Escape") closePop(); }
function popOutside(e){ if (pop && !pop.contains(e.target)) closePop(); }
function closePop(){
  if (!pop) return;
  pop.remove(); pop = null;
  document.removeEventListener("keydown", popKey);
  document.removeEventListener("click", popOutside);
  const cb = popOnClose; popOnClose = null;
  if (cb) cb();
}
function positionPop(anchorEl){
  const r = (anchorEl || $("matrix")).getBoundingClientRect();
  const pw = 220;
  let left = window.scrollX + r.left;
  const maxLeft = window.scrollX + document.documentElement.clientWidth - pw - 10;
  if (left > maxLeft) left = maxLeft;
  if (left < window.scrollX + 8) left = window.scrollX + 8;
  pop.style.left = left + "px";
  pop.style.top = (window.scrollY + r.bottom + 6) + "px";
}
// Opens automatically once a selection is made. Edits price/availability for the
// whole selection. Closing (save / occupied / reset / cancel) clears the selection.
function openSelectionEditor(anchorEl){
  if (!state.selected.size) return;
  closePop();
  const keys = Array.from(state.selected);
  const rooms = new Set(keys.map(k => k.split("|")[0]));

  // Selection spans several room types -> it's a DATE selection.
  // Offer only the minimum-stay (applies to all rooms for those days), keeping each room's price/availability intact.
  if (rooms.size > 1){
    const dates = new Set(keys.map(k => k.split("|")[1]));
    pop = document.createElement("div");
    pop.className = "cellpop";
    pop.innerHTML = `
      <div class="cellpop-h">Sejur minim<br><small>${dates.size} ${dates.size===1?"zi":"zile"} · toate camerele</small></div>
      <label>Minim nopți (1 = fără minim)</label>
      <input type="number" id="pop-min" min="1" max="30" placeholder="(gol = nu schimba)">
      <div class="cellpop-btns">
        <button class="btn btn-primary" id="pop-save" style="flex:1">Salvează</button>
      </div>`;
    document.body.appendChild(pop);
    positionPop(anchorEl);
    popOnClose = () => { if (state.selected.size){ state.selected.clear(); renderMatrix(); } };
    const saveMin = () => {
      const mv = $("pop-min").value.trim();
      if (mv===""){ alert("Completează minim nopți (ex. 2)."); return; }
      const mi = parseInt(mv,10);
      applyBulk((av, key) => {
        const cur = Object.assign({}, av[key]);
        if (mi>1) cur.m = mi; else delete cur.m;
        if (Object.keys(cur).length) av[key] = cur; else delete av[key];
      });
      closePop();
    };
    $("pop-save").addEventListener("click", saveMin);
    $("pop-min").addEventListener("keydown", e => { if (e.key==="Enter") saveMin(); });
    $("pop-min").focus();
    document.addEventListener("keydown", popKey);
    setTimeout(() => document.addEventListener("click", popOutside), 0);
    return;
  }

  const single = keys.length === 1 ? keys[0].split("|") : null;

  let headerHtml, priceAttr = 'placeholder="(gol = nu schimba)"', availAttr = 'placeholder="(gol = nu schimba)"', minAttr = 'placeholder="(gol = nu schimba)"';
  if (single){
    const info = dayInfo(single[0], single[1]);
    headerHtml = `${roomById(single[0]).name.ro}<br><small>${single[1]}</small>`;
    priceAttr = `value="${info.p}"`;
    availAttr = `value="${info.a}"`;
    minAttr = `value="${info.m}"`;
  } else {
    headerHtml = `${keys.length} zile selectate<br><small>se aplică tuturor</small>`;
  }

  pop = document.createElement("div");
  pop.className = "cellpop";
  pop.innerHTML = `
    <div class="cellpop-h">${headerHtml}</div>
    <label>Preț (RON / noapte)</label>
    <input type="number" id="pop-price" min="0" ${priceAttr}>
    <label>Camere disponibile</label>
    <input type="number" id="pop-avail" min="0" max="99" ${availAttr}>
    <label>Minim nopți (1 = fără minim)</label>
    <input type="number" id="pop-min" min="1" max="30" ${minAttr}>
    <div class="cellpop-btns">
      <button class="btn btn-primary" id="pop-save">Salvează</button>
      <button class="btn btn-dark" id="pop-sold">Ocupat</button>
    </div>
    <button class="btn btn-outline" id="pop-reset" style="width:100%;margin-top:6px;font-size:.8rem">Resetează la bază (liber)</button>`;
  document.body.appendChild(pop);
  positionPop(anchorEl);

  // closing the popup for any reason clears the selection
  popOnClose = () => { if (state.selected.size){ state.selected.clear(); renderMatrix(); } };

  const save = () => {
    const pv = $("pop-price").value.trim(), avv = $("pop-avail").value.trim(), mv = $("pop-min").value.trim();
    if (pv==="" && avv==="" && mv===""){ alert("Completează preț, camere disponibile și/sau minim nopți."); return; }
    applyBulk((av, key) => {
      const cur = Object.assign({}, av[key]);
      if (pv!=="") cur.p = parseInt(pv,10);
      if (avv!=="") cur.a = parseInt(avv,10);
      if (mv!==""){ const mi = parseInt(mv,10); if (mi>1) cur.m = mi; else delete cur.m; }
      av[key] = cur;
    });
    closePop();
  };
  $("pop-save").addEventListener("click", save);
  $("pop-price").addEventListener("keydown", e => { if (e.key==="Enter") save(); });
  $("pop-avail").addEventListener("keydown", e => { if (e.key==="Enter") save(); });
  $("pop-min").addEventListener("keydown", e => { if (e.key==="Enter") save(); });
  $("pop-sold").addEventListener("click", () => { applyBulk((av,key)=>{ av[key] = Object.assign({}, av[key], { a:0 }); }); closePop(); });
  $("pop-reset").addEventListener("click", () => { applyBulk((av,key)=>{ delete av[key]; }); closePop(); });

  $("pop-price").focus(); $("pop-price").select();
  document.addEventListener("keydown", popKey);
  setTimeout(() => document.addEventListener("click", popOutside), 0);
}

// click a room name = select whole row, then auto-open the editor
function selectRow(roomId){
  state.selected.clear();
  $("matrix").querySelectorAll(`td.cell[data-room="${roomId}"]`).forEach(td => state.selected.add(roomId+"|"+td.dataset.key));
  renderMatrix();
  openSelectionEditor($("matrix").querySelector(`th.roomcell[data-row="${roomId}"]`));
}
function updateSelCount(){
  const el = $("sel-count");
  if (el) el.textContent = state.selected.size ? `${state.selected.size} celule` : "0";
}

/* ---- mouse drag selection ----
   - inside a room row  -> selects days for THAT room (full editor: price/avail/min)
   - across day headers -> selects those days for ALL rooms (minimum-stay-only editor) */
const drag = { active: false, moved: false, room: null, startKey: null, endKey: null, inited: false };
const coldrag = { active: false, startCol: null, endCol: null };
function rangeKeys(startKey, endKey){
  let a = parseYmd(startKey), b = parseYmd(endKey);
  if (a > b){ const tmp = a; a = b; b = tmp; }
  const out = []; const d = new Date(a);
  while (d <= b){ out.push(ymd(d)); d.setDate(d.getDate()+1); }
  return out;
}
function highlightDrag(room, startKey, endKey){
  drag.endKey = endKey;
  const keys = new Set(rangeKeys(startKey, endKey));
  $("matrix").querySelectorAll(`td.cell[data-room="${room}"]`).forEach(td => {
    td.classList.toggle("dragsel", keys.has(td.dataset.key));
  });
}
function highlightColDrag(startCol, endCol){
  coldrag.endCol = endCol;
  const keys = new Set(rangeKeys(startCol, endCol));
  $("matrix").querySelectorAll("td.cell").forEach(td => td.classList.toggle("dragsel", keys.has(td.dataset.key)));
  $("matrix").querySelectorAll("th.dayhead").forEach(th => th.classList.toggle("dragsel", keys.has(th.dataset.col)));
}
// Build a fresh selection from the gesture (single click = 1 day, drag = range),
// then auto-open the editor anchored on the last touched cell.
function commitDrag(room, startKey, endKey){
  state.selected.clear();
  rangeKeys(startKey, endKey).forEach(k => {
    if ($("matrix").querySelector(`td.cell[data-room="${room}"][data-key="${k}"]`)) state.selected.add(room + "|" + k);
  });
  renderMatrix();
  const anchor = $("matrix").querySelector(`td.cell[data-room="${room}"][data-key="${endKey}"]`)
              || $("matrix").querySelector(`td.cell[data-room="${room}"][data-key="${startKey}"]`);
  openSelectionEditor(anchor);
}
// Date-level selection: all rooms for the chosen days -> minimum-stay-only editor.
function commitColDrag(startCol, endCol){
  state.selected.clear();
  const keys = new Set(rangeKeys(startCol, endCol));
  $("matrix").querySelectorAll("td.cell").forEach(td => {
    if (keys.has(td.dataset.key)) state.selected.add(td.dataset.room + "|" + td.dataset.key);
  });
  renderMatrix();
  const anchor = $("matrix").querySelector(`th.dayhead[data-col="${endCol}"]`)
              || $("matrix").querySelector(`th.dayhead[data-col="${startCol}"]`);
  openSelectionEditor(anchor);
}
function initMatrixDrag(){
  if (drag.inited) return;
  drag.inited = true;
  const m = $("matrix");
  m.addEventListener("mousedown", e => {
    const td = e.target.closest("td.cell");
    if (td){
      e.preventDefault();
      const room = td.dataset.room, key = td.dataset.key;
      closePop();
      drag.active = true; drag.moved = false;
      drag.room = room; drag.startKey = key; drag.endKey = key;
      return;
    }
    const th = e.target.closest("th.dayhead");
    if (th){
      e.preventDefault();
      const col = th.dataset.col;
      closePop();
      coldrag.active = true; coldrag.startCol = col; coldrag.endCol = col;
    }
  });
  m.addEventListener("mouseover", e => {
    if (drag.active){
      const td = e.target.closest("td.cell"); if (!td) return;
      if (td.dataset.room !== drag.room) return; // keep row selection within one room
      if (td.dataset.key !== drag.startKey) drag.moved = true;
      highlightDrag(drag.room, drag.startKey, td.dataset.key);
      return;
    }
    if (coldrag.active){
      const th = e.target.closest("th.dayhead"); if (!th) return;
      highlightColDrag(coldrag.startCol, th.dataset.col);
    }
  });
  document.addEventListener("mouseup", () => {
    if (drag.active){
      drag.active = false;
      commitDrag(drag.room, drag.startKey, drag.endKey);
    } else if (coldrag.active){
      coldrag.active = false;
      commitColDrag(coldrag.startCol, coldrag.endCol);
    }
  });
}

/* ---- mutations ---- */
function applyBulk(mut){
  if (!state.selected.size){ alert("Selectează una sau mai multe celule în grilă."); return; }
  state.selected.forEach(k => {
    const [roomId, key] = k.split("|");
    if (!state.availability[roomId]) state.availability[roomId] = {};
    mut(state.availability[roomId], key, roomId);
  });
  markDirty(); renderMatrix();
}

/* ---- events ---- */
document.addEventListener("DOMContentLoaded", () => {
  $("login-btn").addEventListener("click", async () => {
    const pw = $("pw").value.trim();
    if (await verify(pw)){ state.pw = pw; sessionStorage.setItem(PW_KEY, pw); $("login-err").classList.add("hidden"); showEditor(); }
    else $("login-err").classList.remove("hidden");
  });
  $("pw").addEventListener("keydown", e => { if (e.key==="Enter") $("login-btn").click(); });
  $("logout").addEventListener("click", () => { sessionStorage.removeItem(PW_KEY); location.reload(); });

  $("prev").addEventListener("click", ()=>shiftWindow(-windowLen()));
  $("next").addEventListener("click", ()=>shiftWindow(windowLen()));
  $("win-start").addEventListener("change", () => {
    const v = $("win-start").value; if (!v) return;
    state.winStart = startOfDay(parseYmd(v));
    if (state.winEnd < state.winStart){ state.winEnd = new Date(state.winStart); $("win-end").value = ymd(state.winEnd); }
    renderMatrix();
  });
  $("win-end").addEventListener("change", () => {
    const v = $("win-end").value; if (!v) return;
    state.winEnd = startOfDay(parseYmd(v));
    if (state.winEnd < state.winStart){ state.winStart = new Date(state.winEnd); $("win-start").value = ymd(state.winStart); }
    renderMatrix();
  });

  $("save-all").addEventListener("click", saveAll);

  $("arv-add").addEventListener("click", async () => {
    const body = {
      action: "add", author: $("arv-name").value, country: $("arv-country").value,
      rating: $("arv-rating").value, date: $("arv-date").value, source: $("arv-source").value,
      text: $("arv-text").value, reply: $("arv-reply").value
    };
    if (!body.text.trim()) { alert("Adaugă textul recenziei."); return; }
    const res = await adminPost("/api/reviews/admin", body);
    if (res.ok) { ["arv-name", "arv-country", "arv-text", "arv-reply"].forEach(id => $(id).value = ""); $("arv-rating").value = 10; loadReviewsAdmin(); }
    else alert("Eroare la adăugare.");
  });

  $("feed-upload").addEventListener("click", uploadPhotos);

  $("book-refresh").addEventListener("click", loadBookings);
  $("stats-refresh")?.addEventListener("click", loadStats);
  $("stats-reset")?.addEventListener("click", async () => {
    if (!confirm("Resetezi contorul de vizite la zero? (inclusiv țări/orașe). Acțiune ireversibilă.")) return;
    try {
      const res = await adminPost("/api/stats/admin", { action: "reset" });
      const data = await res.json();
      if (data.ok) { state.bookingsCount = data.bookingsCount || 0; renderStats(data.stats || {}); }
    } catch (e) { alert("Nu am putut reseta."); }
  });
  $("book-clear").addEventListener("click", async () => {
    if (!confirm("Ștergi toate cererile marcate ca rezolvate?")) return;
    const res = await adminPost("/api/booking/admin", { action: "clearDone" });
    if (res.ok) loadBookings(); else alert("Eroare.");
  });

  tryAutoLogin();
});

async function saveAll(){
  $("status").textContent = "Se publică…"; $("status").className = "status";
  try {
    const res = await fetch("/api/save", {
      method:"POST",
      headers:{ "content-type":"application/json", "x-admin-password": state.pw },
      body: JSON.stringify({ prices: state.prices, availability: state.availability })
    });
    if (res.ok){ state.dirty = false; $("status").textContent = "Publicat ✓ (live în câteva secunde)"; $("status").className = "status ok"; }
    else if (res.status===401){ $("status").textContent = "Parolă invalidă — reautentifică-te."; $("status").className="status err"; }
    else { const j = await res.json().catch(()=>({})); $("status").textContent = "Eroare: " + (j.error||res.status); $("status").className="status err"; }
  } catch(e){ $("status").textContent = "Eroare de rețea (funcțiile rulează doar pe site-ul live)."; $("status").className="status err"; }
}
