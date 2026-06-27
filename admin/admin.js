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
  dirty: false
};

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
  return { p: (ov && ov.p!=null) ? ov.p : b.price, a: (ov && ov.a!=null) ? ov.a : b.units };
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
}

/* ---- visit counter ---- */
async function loadStats() {
  const box = $("stats-body");
  if (!box) return;
  try {
    const res = await adminPost("/api/stats/admin", {});
    if (!res.ok) { box.innerHTML = "<p class='hint'>Statisticile apar doar pe site-ul live.</p>"; return; }
    const data = await res.json();
    renderStats(data.stats || { total: 0, days: {}, pages: {} });
  } catch (e) { box.innerHTML = "<p class='hint'>Statisticile apar doar pe site-ul live.</p>"; }
}
function renderStats(s) {
  const box = $("stats-body");
  const days = s.days || {}, pages = s.pages || {};
  const ymdLocal = d => d.toISOString().slice(0, 10);
  const sumLast = n => {
    let t = 0;
    for (let i = 0; i < n; i++) { const d = new Date(); d.setDate(d.getDate() - i); t += days[ymdLocal(d)] || 0; }
    return t;
  };
  const today = days[ymdLocal(new Date())] || 0;
  const last7 = sumLast(7), last30 = sumLast(30);
  const topPages = Object.entries(pages).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const pageName = p => ({ "/": "Acasă", "/vila": "Vila TUI", "/vila.html": "Vila TUI", "/sinaia": "Sinaia", "/sinaia.html": "Sinaia", "/bio": "Bio de Maramu'", "/bio.html": "Bio de Maramu'", "/jurnal": "Jurnal", "/jurnal.html": "Jurnal", "/contact": "Contact", "/contact.html": "Contact" }[p] || p);
  // last 14 days sparkline
  const series = [];
  for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); series.push(days[ymdLocal(d)] || 0); }
  const max = Math.max(1, ...series);
  const bars = series.map(v => `<span class="spark-bar" style="height:${Math.round((v / max) * 100)}%" title="${v}"></span>`).join("");

  box.innerHTML = `
    <div class="stat-grid">
      <div class="stat-tile"><div class="stat-num">${s.total || 0}</div><div class="stat-lbl">Total vizite</div></div>
      <div class="stat-tile"><div class="stat-num">${today}</div><div class="stat-lbl">Azi</div></div>
      <div class="stat-tile"><div class="stat-num">${last7}</div><div class="stat-lbl">Ultimele 7 zile</div></div>
      <div class="stat-tile"><div class="stat-num">${last30}</div><div class="stat-lbl">Ultimele 30 zile</div></div>
    </div>
    <div class="spark" title="Ultimele 14 zile">${bars}</div>
    <div class="spark-cap hint">Ultimele 14 zile</div>
    ${topPages.length ? `<table class="base-table mt-2"><thead><tr><th>Pagină</th><th>Vizite</th></tr></thead><tbody>
      ${topPages.map(([p, n]) => `<tr><td>${escA(pageName(p))}</td><td>${n}</td></tr>`).join("")}
    </tbody></table>` : ""}
    <p class="hint mt-1">Vizitele tale (când ești logat ca admin) nu sunt numărate. Boții sunt excluși.</p>`;
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
async function loadBookings() {
  const box = $("book-list"); if (!box) return;
  try {
    const res = await adminPost("/api/booking/admin", { action: "list" });
    if (!res.ok) { box.innerHTML = "<p class='hint'>Nu pot încărca cererile.</p>"; return; }
    const data = await res.json();
    renderBookings(data.bookings || []);
  } catch (e) { box.innerHTML = "<p class='hint'>Cererile apar doar pe site-ul live.</p>"; }
}
function renderBookings(list) {
  const box = $("book-list");
  const cnt = $("book-count");
  if (cnt) cnt.textContent = list.filter(r => r.status === "new").length;
  if (!list.length) { box.innerHTML = "<p class='hint'>Nicio cerere încă.</p>"; return; }
  box.innerHTML = list.map(r => {
    const when = (r.createdAt || "").replace("T", " ").slice(0, 16);
    const dates = (r.checkIn || "?") + " → " + (r.checkOut || "?");
    const meta = [r.nights ? r.nights + " nopți" : "", r.guests ? r.guests + " pers." : "", r.total ? r.total + " RON" : ""].filter(Boolean).join(" · ");
    return `<div class="book-item ${r.status}">
      <div class="b-room">${escA(r.roomName || r.roomId || "Cameră")}</div>
      <div class="b-dates">${escA(dates)}</div>
      ${meta ? `<div class="b-meta">${escA(meta)}</div>` : ""}
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
      const ov = (state.availability[r.id]||{})[key];
      const over = ov ? " over" : "";
      let cls = "cell"+(sold?" sold":"")+(sel?" sel":"")+over+mstart;
      body += `<td class="${cls}" data-room="${r.id}" data-key="${key}"><div class="p">${sold?"–":info.p}</div><div class="a">${sold?"0":info.a}</div></td>`;
    });
    body += `</tr>`;
  });

  $("matrix").innerHTML = `<table class="matrix"><thead>${head}</thead><tbody>${body}</tbody></table>`;
  initMatrixDrag();

  // (cell interaction handled by drag handlers bound once in initMatrixDrag)
  // whole-row select (room name)
  $("matrix").querySelectorAll("th.roomcell").forEach(th => {
    th.addEventListener("click", () => selectRow(th.dataset.row));
  });
  // whole-column select (day header)
  $("matrix").querySelectorAll("th.dayhead").forEach(th => {
    th.addEventListener("click", () => selectCol(th.dataset.col));
  });

  updateSelCount();
}

function toggleCell(roomId, key){
  const k = roomId+"|"+key;
  if (state.selected.has(k)) state.selected.delete(k); else state.selected.add(k);
  renderMatrix();
}

/* ---- per-cell inline editor (price + rooms available for that day) ---- */
let pop = null;
function popKey(e){ if (e.key==="Escape") closePop(); }
function popOutside(e){ if (pop && !pop.contains(e.target)) closePop(); }
function closePop(){
  if (!pop) return;
  pop.remove(); pop = null;
  document.removeEventListener("keydown", popKey);
  document.removeEventListener("click", popOutside);
}
function openCellEditor(roomId, key, td){
  closePop();
  const room = roomById(roomId);
  const info = dayInfo(roomId, key);
  const b = base(roomId);
  pop = document.createElement("div");
  pop.className = "cellpop";
  pop.innerHTML = `
    <div class="cellpop-h">${room.name.ro}<br><small>${key}</small></div>
    <label>Preț (RON / noapte)</label>
    <input type="number" id="pop-price" min="0" value="${info.p}">
    <label>Camere disponibile (din ${b.units})</label>
    <input type="number" id="pop-avail" min="0" max="99" value="${info.a}">
    <div class="cellpop-btns">
      <button class="btn btn-primary" id="pop-save">Salvează</button>
      <button class="btn btn-dark" id="pop-sold">Ocupat</button>
    </div>
    <button class="btn btn-outline" id="pop-reset" style="width:100%;margin-top:6px;font-size:.8rem">Resetează la bază</button>`;
  document.body.appendChild(pop);

  const r = td.getBoundingClientRect();
  const pw = 220;
  let left = window.scrollX + r.left;
  const maxLeft = window.scrollX + document.documentElement.clientWidth - pw - 10;
  if (left > maxLeft) left = maxLeft;
  if (left < window.scrollX + 8) left = window.scrollX + 8;
  pop.style.left = left + "px";
  pop.style.top = (window.scrollY + r.bottom + 6) + "px";

  const save = () => {
    const p = parseInt($("pop-price").value, 10);
    const a = parseInt($("pop-avail").value, 10);
    if (isNaN(a)){ alert("Completează numărul de camere disponibile."); return; }
    if (!state.availability[roomId]) state.availability[roomId] = {};
    const entry = { a };
    if (!isNaN(p)) entry.p = p;
    state.availability[roomId][key] = entry;
    markDirty(); closePop(); renderMatrix();
  };
  $("pop-save").addEventListener("click", save);
  $("pop-avail").addEventListener("keydown", e => { if (e.key==="Enter") save(); });
  $("pop-price").addEventListener("keydown", e => { if (e.key==="Enter") save(); });
  $("pop-sold").addEventListener("click", () => {
    if (!state.availability[roomId]) state.availability[roomId] = {};
    state.availability[roomId][key] = Object.assign({}, state.availability[roomId][key], { a: 0 });
    markDirty(); closePop(); renderMatrix();
  });
  $("pop-reset").addEventListener("click", () => {
    if (state.availability[roomId]) delete state.availability[roomId][key];
    markDirty(); closePop(); renderMatrix();
  });

  $("pop-price").focus(); $("pop-price").select();
  document.addEventListener("keydown", popKey);
  setTimeout(() => document.addEventListener("click", popOutside), 0);
}
function selectRow(roomId){
  const cells = $("matrix").querySelectorAll(`td.cell[data-room="${roomId}"]`);
  const keys = Array.from(cells).map(td => roomId+"|"+td.dataset.key);
  const allSel = keys.every(k => state.selected.has(k));
  keys.forEach(k => allSel ? state.selected.delete(k) : state.selected.add(k));
  renderMatrix();
}
function selectCol(key){
  const cells = $("matrix").querySelectorAll(`td.cell[data-key="${key}"]`);
  const keys = Array.from(cells).map(td => td.dataset.room+"|"+key);
  const allSel = keys.every(k => state.selected.has(k));
  keys.forEach(k => allSel ? state.selected.delete(k) : state.selected.add(k));
  renderMatrix();
}
function updateSelCount(){
  const n = state.selected.size;
  $("sel-count").textContent = n ? `${n} celule` : "0";
}

/* ---- mouse drag selection (within one room row) ---- */
const drag = { active: false, moved: false, room: null, startKey: null, endKey: null, inited: false };
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
function commitDrag(room, startKey, endKey){
  state.selected.clear();
  rangeKeys(startKey, endKey).forEach(k => {
    if ($("matrix").querySelector(`td.cell[data-room="${room}"][data-key="${k}"]`)) state.selected.add(room + "|" + k);
  });
  renderMatrix();
}
function initMatrixDrag(){
  if (drag.inited) return;
  drag.inited = true;
  const m = $("matrix");
  m.addEventListener("mousedown", e => {
    const td = e.target.closest("td.cell"); if (!td) return;
    e.preventDefault();
    closePop();
    drag.active = true; drag.moved = false;
    drag.room = td.dataset.room; drag.startKey = td.dataset.key; drag.endKey = td.dataset.key;
  });
  m.addEventListener("mouseover", e => {
    if (!drag.active) return;
    const td = e.target.closest("td.cell"); if (!td) return;
    if (td.dataset.room !== drag.room) return; // keep selection within one room row
    if (td.dataset.key !== drag.startKey) drag.moved = true;
    highlightDrag(drag.room, drag.startKey, td.dataset.key);
  });
  document.addEventListener("mouseup", () => {
    if (!drag.active) return;
    drag.active = false;
    if (drag.moved) {
      commitDrag(drag.room, drag.startKey, drag.endKey);
    } else {
      const td = $("matrix").querySelector(`td.cell[data-room="${drag.room}"][data-key="${drag.startKey}"]`);
      if (td) openCellEditor(drag.room, drag.startKey, td);
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

  $("apply").addEventListener("click", () => {
    const pv = $("set-price").value.trim(), avv = $("set-avail").value.trim();
    if (pv==="" && avv===""){ alert("Completează preț și/sau camere disponibile."); return; }
    applyBulk((av, key, roomId) => {
      const cur = Object.assign({}, av[key]);
      if (pv!=="") cur.p = parseInt(pv,10);
      if (avv!=="") cur.a = parseInt(avv,10);
      av[key] = cur;
    });
  });
  $("mark-sold").addEventListener("click", () => applyBulk((av,key)=>{ av[key] = Object.assign({}, av[key], { a:0 }); }));
  $("mark-free").addEventListener("click", () => applyBulk((av,key)=>{ delete av[key]; }));
  $("clear-sel").addEventListener("click", () => { state.selected.clear(); renderMatrix(); });

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
