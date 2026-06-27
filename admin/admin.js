/* =====================================================================
   MONTANIA — Admin (prețuri & disponibilitate)
   Editează prețul de bază + nr. camere pe tip și suprascrieri pe zile.
   Publică în KV prin /api/save (parolă partajată).
   ===================================================================== */

const PW_KEY = "montania_admin_pw";

const state = {
  pw: sessionStorage.getItem(PW_KEY) || "",
  prices: {},        // { roomId: { price, units } }
  availability: {},  // { roomId: { "YYYY-MM-DD": { p, a } } }
  roomId: null,
  viewY: 0, viewM: 0,
  selStart: null, selEnd: null,
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
  await loadModel();
  buildRoomSelect();
  const now = startOfDay(new Date());
  state.viewY = now.getFullYear(); state.viewM = now.getMonth();
  selectRoom(SITE.rooms[0].id);
}

/* ---- model ---- */
async function loadModel(){
  // seed base prices/units from data.js
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

function buildRoomSelect(){
  $("room").innerHTML = SITE.rooms.map(r => `<option value="${r.id}">${r.name.ro}</option>`).join("");
}

function selectRoom(id){
  state.roomId = id;
  $("room").value = id;
  const b = base(id);
  $("base-price").value = b.price;
  $("base-units").value = b.units;
  state.selStart = state.selEnd = null;
  renderCalendar();
  updateSelInfo();
}

/* ---- calendar ---- */
function shift(delta){
  let m = state.viewM + delta, y = state.viewY;
  if (m<0){ m=11; y--; } if (m>11){ m=0; y++; }
  state.viewM = m; state.viewY = y; renderCalendar();
}
function inSelection(date){
  if (!state.selStart) return false;
  const end = state.selEnd || state.selStart;
  return date >= state.selStart && date <= end;
}
function renderCalendar(){
  const y = state.viewY, m = state.viewM, today = startOfDay(new Date());
  $("month").textContent = new Date(y,m,1).toLocaleDateString("ro-RO",{month:"long",year:"numeric"});
  const dows = ["Lu","Ma","Mi","Jo","Vi","Sâ","Du"];
  let firstDow = new Date(y,m,1).getDay(); firstDow = (firstDow+6)%7;
  const days = new Date(y,m+1,0).getDate();
  let html = dows.map(d=>`<div class="cal-dow">${d}</div>`).join("");
  for (let i=0;i<firstDow;i++) html += `<div class="cal-day empty"></div>`;
  for (let day=1; day<=days; day++){
    const date = new Date(y,m,day), key = ymd(date);
    const info = dayInfo(state.roomId, key);
    let cls = "cal-day";
    let clickable = true;
    if (date < today){ cls += " past"; clickable = false; }
    else { cls += info.a<=0 ? " sold" : " available"; }
    if (inSelection(date)) cls += " sel";
    const sub = clickable ? `<span class="cal-avail">${info.a<=0?"ocupat":info.p+"·"+info.a}</span>` : "";
    html += `<div class="${cls}" ${clickable?`data-day="${key}"`:""}><span class="cal-num">${day}</span>${sub}</div>`;
  }
  $("cal").innerHTML = html;
  $("cal").querySelectorAll("[data-day]").forEach(el => el.addEventListener("click", ()=>onDay(el.dataset.day)));
}
function onDay(key){
  const date = parseYmd(key);
  if (!state.selStart || (state.selStart && state.selEnd)) { state.selStart = date; state.selEnd = null; }
  else if (date >= state.selStart) { state.selEnd = date; }
  else { state.selStart = date; state.selEnd = null; }
  renderCalendar(); updateSelInfo();
}
function selectedDates(){
  if (!state.selStart) return [];
  const out = [], end = state.selEnd || state.selStart;
  const d = new Date(state.selStart);
  while (d <= end){ out.push(ymd(d)); d.setDate(d.getDate()+1); }
  return out;
}
function updateSelInfo(){
  const ds = selectedDates();
  if (!ds.length){ $("sel-info").textContent = "Nicio zi selectată."; return; }
  $("sel-info").textContent = ds.length===1 ? `Selectat: ${ds[0]}` : `Selectat: ${ds[0]} → ${ds[ds.length-1]} (${ds.length} zile)`;
}

/* ---- mutations ---- */
function ensureRoomAvail(){ if (!state.availability[state.roomId]) state.availability[state.roomId] = {}; return state.availability[state.roomId]; }
function applyToSelection(mut){
  const ds = selectedDates();
  if (!ds.length){ alert("Selectează una sau mai multe zile în calendar."); return; }
  const av = ensureRoomAvail();
  ds.forEach(key => mut(av, key));
  markDirty(); renderCalendar();
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

  $("room").addEventListener("change", () => selectRoom($("room").value));
  $("prev").addEventListener("click", ()=>shift(-1));
  $("next").addEventListener("click", ()=>shift(1));

  $("save-base").addEventListener("click", () => {
    const p = parseInt($("base-price").value,10), u = parseInt($("base-units").value,10);
    if (isNaN(p)||isNaN(u)){ alert("Completează preț și nr. camere."); return; }
    state.prices[state.roomId] = { price: p, units: u };
    markDirty(); renderCalendar();
  });

  $("apply").addEventListener("click", () => {
    const pv = $("set-price").value.trim(), avv = $("set-avail").value.trim();
    if (avv===""){ alert("Completează „Camere disponibile”."); return; }
    const a = parseInt(avv,10);
    applyToSelection((av, key) => {
      const entry = { a };
      if (pv!=="") entry.p = parseInt(pv,10);
      av[key] = entry;
    });
  });
  $("mark-sold").addEventListener("click", () => applyToSelection((av,key)=>{ av[key] = Object.assign({}, av[key], { a:0 }); }));
  $("mark-free").addEventListener("click", () => applyToSelection((av,key)=>{ delete av[key]; }));

  $("save-all").addEventListener("click", saveAll);

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
