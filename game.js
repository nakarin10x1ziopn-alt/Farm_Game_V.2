'use strict';
// ไร่สุขใจ 2 (V.2): vegetables, animals and fish, sell at the market, spend the money on 10 upgrades. Mobile portrait only.
const $ = id => document.getElementById(id);
const fmt = n => Math.round(n).toLocaleString('en-US');
const rnd = (a, b) => a + Math.random() * (b - a);

// ---------------- data ----------------
// every price you PAY is 20 % lower than before (seeds, animals, fish, feed, upgrades, decorations); the market pays 3x what the same thing costs to buy
const SELL_X = 3;
const FEED_PRICE = 8;
const M = c => Math.round(c * SELL_X * 10) / 10;
// xp is still earned as before the price change (sale prices are now 3x the cost, so xp is scaled back by this)
const XPF = 1.07 / (SELL_X * 0.8);
const CROPS = {
  carrot: { n: 'แครอท', i: '🥕', seed: 8, sec: 30, sell: M(8), lv: 1, col: 0xf08a24 },
  cabbage: { n: 'กะหล่ำปลี', i: '🥬', seed: 16, sec: 50, sell: M(16), lv: 1, col: 0x8fd16a },
  tomato: { n: 'มะเขือเทศ', i: '🍅', seed: 28, sec: 80, sell: M(28), lv: 2, col: 0xe0443a },
  corn: { n: 'ข้าวโพด', i: '🌽', seed: 40, sec: 120, sell: M(40), lv: 3, col: 0xf2c12e },
  strawberry: { n: 'สตรอว์เบอร์รี', i: '🍓', seed: 64, sec: 180, sell: M(64), lv: 5, col: 0xe8466a },
  pumpkin: { n: 'ฟักทอง', i: '🎃', seed: 96, sec: 240, sell: M(96), lv: 7, col: 0xe8761e },
  watermelon: { n: 'แตงโม', i: '🍉', seed: 144, sec: 300, sell: M(144), lv: 9, col: 0x3f9a4a },
};
// an animal eats `bags` feed bags per round and gives one product worth 3x that feed
const ANIMALS = {
  chicken: { n: 'ไก่', i: '🐔', price: 48, prod: 'egg', sec: 60, bags: 1, lv: 1 },
  duck: { n: 'เป็ด', i: '🦆', price: 72, prod: 'duckegg', sec: 70, bags: 1, lv: 2 },
  sheep: { n: 'แกะ', i: '🐑', price: 120, prod: 'wool', sec: 140, bags: 2, lv: 4 },
  pig: { n: 'หมู', i: '🐖', price: 176, prod: 'pork', sec: 190, bags: 3, lv: 6 },
  cow: { n: 'วัว', i: '🐄', price: 264, prod: 'milk', sec: 170, bags: 3, lv: 8 },
};
const FISH = {
  tilapia: { n: 'ปลานิล', i: '🐟', price: 16, sec: 100, sell: M(16), lv: 1 },
  carp: { n: 'ปลาคาร์ป', i: '🐠', price: 32, sec: 160, sell: M(32), lv: 3 },
  catfish: { n: 'ปลาดุก', i: '🐡', price: 56, sec: 220, sell: M(56), lv: 5 },
  shrimp: { n: 'กุ้งก้ามกราม', i: '🦐', price: 88, sec: 320, sell: M(88), lv: 8 },
};
// every sellable thing: n name, i icon, base price
const ITEMS = {};
for (const k in CROPS) ITEMS[k] = { n: CROPS[k].n, i: CROPS[k].i, base: CROPS[k].sell };
const fe = n => M(n * FEED_PRICE);
Object.assign(ITEMS, {
  egg: { n: 'ไข่ไก่', i: '🥚', base: fe(1) }, duckegg: { n: 'ไข่เป็ด', i: '🪺', base: fe(1) }, wool: { n: 'ขนแกะ', i: '🧶', base: fe(2) },
  pork: { n: 'เนื้อหมู', i: '🥩', base: fe(3) }, milk: { n: 'นมสด', i: '🥛', base: fe(3) },
});
for (const k in FISH) ITEMS[k] = { n: FISH[k].n, i: FISH[k].i, base: FISH[k].sell };
const RECIPES = [
  { id: 'soup', in: { tomato: 3 }, sec: 60 }, { id: 'popcorn', in: { corn: 3 }, sec: 90 }, { id: 'jam', in: { strawberry: 3 }, sec: 120 },
  { id: 'pie', in: { pumpkin: 2 }, sec: 150 }, { id: 'cheese', in: { milk: 2 }, sec: 90 }, { id: 'cake', in: { egg: 6 }, sec: 80 }, { id: 'fishball', in: { tilapia: 2 }, sec: 70 },
];
// a processed good is worth its ingredients plus ~8 %
const PROC = { soup: ['🥫', 'ซุปมะเขือเทศ'], jam: ['🍯', 'แยมสตรอว์เบอร์รี'], popcorn: ['🍿', 'ป๊อปคอร์น'], pie: ['🥧', 'พายฟักทอง'], cheese: ['🧀', 'ชีส'], cake: ['🍰', 'เค้กไข่'], fishball: ['🍢', 'ลูกชิ้นปลา'] };
for (const r of RECIPES) ITEMS[r.id] = { n: PROC[r.id][1], i: PROC[r.id][0], base: Math.round(Object.keys(r.in).reduce((t, k) => t + ITEMS[k].base * r.in[k], 0) * 1.08 * 10) / 10 };
const PLOTS = [6, 8, 12, 16], PENS = [3, 5, 7, 9, 12], PONDS = [3, 5, 7, 9, 12], BARNS = [60, 120, 200, 320, 500];
const DECOS = [
  { id: 'tree', n: 'ต้นไม้ผลไม้', i: '🌳', price: 160 }, { id: 'flower', n: 'แปลงดอกไม้', i: '🌻', price: 320 }, { id: 'gazebo', n: 'ศาลาพักผ่อน', i: '🛖', price: 960 },
  { id: 'fountain', n: 'น้ำพุกลางฟาร์ม', i: '⛲', price: 2400 }, { id: 'windmill', n: 'กังหันลม', i: '🌬️', price: 4800 },
];
const DAY = 300; // seconds of play per farm day

// ---------------- state ----------------
const API = (window.FARM2_API || '').replace(/\/$/, '');
let S = null, slot = 0, online = false;
let DEV = (() => { try { let d = localStorage.getItem('raisukjai2-dev'); if (!d) { d = 'p' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); localStorage.setItem('raisukjai2-dev', d); } return d; } catch (e) { return 'p' + Math.random().toString(36).slice(2, 12); } })();
const fresh = name => ({ v: 1, name: name || 'ชาวไร่', money: 300, xp: 0, lvl: 1, t: 0, last: Date.now(), tip: 0, sel: 'carrot', px: 0, pz: 10.5, plots: Array.from({ length: PLOTS[0] }, () => ({ c: null, p: 0, w: 0 })),
  pen: [{ a: 'chicken', st: 'idle', t: 0 }], pond: [], inv: {}, feed: 6, u: { plot: 0, pen: 0, pond: 0, barn: 0, sprinkler: 0, feeder: 0, work: 0, truck: 0 }, bank: 0, bankDay: 1, deco: {}, job: null, stats: { earned: 0 } });
// A save lives in the browser twice (localStorage + IndexedDB) so one being wiped does not lose the farm. The key no longer depends on the
// player code; the old key (with the code) is still read so earlier saves keep working. The server copy uses the player code.
const LKEY = n => `raisukjai2-slot${n}`, LKEY_OLD = n => `raisukjai2-${DEV}-s${n}`, sid = n => `${DEV}_${n}`;
const lsGet = k => { try { const j = JSON.parse(localStorage.getItem(k)); return j && j.v === 1 ? j : null; } catch (e) { return null; } };
let idbP = null, storageOK = true;
const idb = () => idbP || (idbP = new Promise(res => { try { const r = indexedDB.open('raisukjai2', 1); r.onupgradeneeded = () => r.result.createObjectStore('s'); r.onsuccess = () => res(r.result); r.onerror = () => res(null); r.onblocked = () => res(null); } catch (e) { res(null); } }));
const idbGet = async k => { const db = await idb(); if (!db) return null; return new Promise(res => { try { const q = db.transaction('s').objectStore('s').get(k); q.onsuccess = () => res(q.result && q.result.v === 1 ? q.result : null); q.onerror = () => res(null); } catch (e) { res(null); } }); };
const idbPut = async (k, v) => { const db = await idb(); if (!db) return; try { db.transaction('s', 'readwrite').objectStore('s').put(v, k); } catch (e) { } };
const idbDel = async k => { const db = await idb(); if (!db) return; try { db.transaction('s', 'readwrite').objectStore('s').delete(k); } catch (e) { } };
const newer = (a, b) => (a && b ? (b.last > a.last ? b : a) : (a || b));
const readLocal = async n => newer(newer(lsGet(LKEY(n)), await idbGet(LKEY(n))), lsGet(LKEY_OLD(n)));
function writeSlot(n, data) { let ok = false; try { localStorage.setItem(LKEY(n), JSON.stringify(data)); ok = true; } catch (e) { } idbPut(LKEY(n), data); return ok; }
function wipeSlot(n) { try { localStorage.removeItem(LKEY(n)); localStorage.removeItem(LKEY_OLD(n)); } catch (e) { } idbDel(LKEY(n)); }
try { localStorage.setItem('raisukjai2-test', '1'); localStorage.removeItem('raisukjai2-test'); } catch (e) { storageOK = false; }
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { }
const encodeSave = d => 'FARM2:' + btoa(unescape(encodeURIComponent(JSON.stringify(d))));
const decodeSave = t => { try { const j = JSON.parse(decodeURIComponent(escape(atob(String(t).trim().replace(/^FARM2:/, ''))))); return j && j.v === 1 && Array.isArray(j.plots) ? j : null; } catch (e) { return null; } };
async function api(path, opt) { const r = await fetch(API + path, Object.assign({ cache: 'no-store' }, opt)); if (!r.ok) throw new Error(r.status); return r.json(); }
async function ping() { try { const j = await Promise.race([api('/api/ping'), new Promise((_, rej) => setTimeout(() => rej(new Error('t')), 2500))]); online = !!(j && j.ok); } catch (e) { online = false; } return online; }
// a slot is the newest of the browser copies and the server copy
async function readSlot(n) {
  const a = await readLocal(n); let b = null;
  if (online) { try { const j = await api(`/api/save?id=${sid(n)}`); b = j.save && j.save.v === 1 ? j.save : null; } catch (e) { } }
  return newer(a, b);
}
let pushing = false, pushAgain = false;
async function pushServer() {
  if (!S || !slot) return;
  if (pushing) { pushAgain = true; return; } pushing = true;
  try { await api('/api/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: sid(slot), save: S }) }); online = true; } catch (e) { online = false; }
  pushing = false; setSrv(); if (pushAgain) { pushAgain = false; if (S && slot) pushServer(); }   // the id and save are read again here, so a slot switch never writes to the wrong slot
}
function save() { if (!S || !slot) return; S.last = Date.now(); S.px = P.x; S.pz = P.z; storageOK = writeSlot(slot, S) || storageOK; if (online) pushServer(); }
let saveQ = 0; const queueSave = () => { if (!saveQ) saveQ = setTimeout(() => { saveQ = 0; save(); }, 500); };
function setSrv() { const e = $('srv'); if (e) e.innerHTML = (online ? '☁️ <b class="ok">เชื่อมต่อเซิร์ฟเวอร์แล้ว</b> เซฟถูกสำรองบนเซิร์ฟเวอร์อัตโนมัติ' : '📴 <b class="off">ไม่พบเซิร์ฟเวอร์</b> เซฟเก็บในเครื่องนี้ (2 ที่ในเบราว์เซอร์)') + (storageOK ? '' : '<br>⚠️ <b class="off">เบราว์เซอร์นี้บันทึกข้อมูลไม่ได้</b> (โหมดส่วนตัวหรือเบราว์เซอร์ในแอป) เปิดลิงก์ด้วย Chrome/Safari ปกติ หรือใช้ปุ่ม "คัดลอกรหัสเซฟ" เก็บไว้'); }
const day = () => Math.floor(S.t / DAY) + 1;
const xpNeed = l => Math.round(50 * Math.pow(l, 1.5));
const cap = () => BARNS[S.u.barn], used = () => Object.values(S.inv).reduce((a, b) => a + b, 0), room = () => cap() - used();
const prestige = () => Object.keys(S.deco).length * 0.3 + (S.deco.fountain ? 0.5 : 0);
const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const factor = (id, d) => 0.985 + (hash(id + ':' + d) % 1000) / 1000 * 0.05;       // 0.985 .. 1.035, a new price every farm day
const bonus = () => 1 + [0, 0.04, 0.08][S.u.truck] + prestige() / 100;
const price = id => Math.round(ITEMS[id].base * factor(id, day()) * bonus() * 10) / 10;
const trend = id => factor(id, day()) - factor(id, day() - 1);
function toast(t) { const d = document.createElement('div'); d.className = 't'; d.textContent = t; $('toast').appendChild(d); while ($('toast').children.length > 3) $('toast').firstChild.remove(); setTimeout(() => d.classList.add('out'), 2200); setTimeout(() => d.remove(), 2700); }
function gainXp(n) { S.xp += n; while (S.xp >= xpNeed(S.lvl)) { S.xp -= xpNeed(S.lvl); S.lvl++; const un = [].concat(Object.values(CROPS).filter(c => c.lv === S.lvl).map(c => c.n), Object.values(ANIMALS).filter(a => a.lv === S.lvl).map(a => a.n), Object.values(FISH).filter(f => f.lv === S.lvl).map(f => f.n)); toast(`🎉 เลเวล ${S.lvl}!` + (un.length ? ' ปลดล็อก ' + un.join(' · ') : '')); } }
function spend(n) { if (S.money < n) { toast('เงินไม่พอ'); return false; } S.money -= n; return true; }
function addItem(id, n) { const k = Math.min(n, room()); if (k <= 0) { toast('ยุ้งฉางเต็ม! ไปขายที่ตลาดหรืออัปเกรดยุ้งฉาง'); return 0; } S.inv[id] = (S.inv[id] || 0) + k; return k; }

// ---------------- simulation ----------------
function update(dt) {
  S.t += dt;
  const sp = S.u.sprinkler ? 1.5 : 1;
  for (const p of S.plots) if (p.c) { if (S.u.sprinkler) p.w = 1; p.p = Math.min(CROPS[p.c].sec, p.p + dt * (p.w ? 1.5 : 1)); }
  for (const a of S.pen) {
    let left = dt;
    while (left > 0 && a.st !== 'ready') {
      if (a.st === 'idle') {
        const bg = ANIMALS[a.a].bags || 1;
        if (S.feed < bg && S.u.feeder && S.money >= FEED_PRICE * 5) { S.money -= FEED_PRICE * 5; S.feed += 5; }
        if (S.feed >= bg) { S.feed -= bg; a.st = 'prod'; a.t = 0; } else break;
      }
      const need = ANIMALS[a.a].sec - a.t;
      if (left >= need) { left -= need; a.st = 'ready'; a.t = ANIMALS[a.a].sec; } else { a.t += left; left = 0; }
    }
  }
  for (const f of S.pond) if (f.f) f.p = Math.min(FISH[f.f].sec, f.p + dt);
  if (S.job) { S.job.t += dt; }
  // a new farm day: the bank pays 1 % interest
  while (S.bankDay < day()) { S.bankDay++; S.bank = Math.min(200000, Math.round(S.bank * 1.01)); }
}
const cropReady = p => p.c && p.p >= CROPS[p.c].sec;
const fishReady = f => f.f && f.p >= FISH[f.f].sec;
const jobReady = () => S.job && S.job.t >= RECIPES.find(r => r.id === S.job.id).sec;
function readyCount() { return S.plots.filter(cropReady).length + S.pen.filter(a => a.st === 'ready').length + S.pond.filter(fishReady).length; }

// ---------------- actions ----------------
function plant(i) {
  const p = S.plots[i], c = CROPS[S.sel]; if (!p || p.c) return;
  if (c.lv > S.lvl) { toast(`ต้องเลเวล ${c.lv} ถึงปลูก${c.n}ได้`); return; }
  if (!spend(c.seed)) return;
  p.c = S.sel; p.p = 0; p.w = S.u.sprinkler ? 1 : 0; sfx(520);
}
function harvestPlot(i) {
  const p = S.plots[i]; if (!cropReady(p)) return false;
  if (!addItem(p.c, 1)) return false; gainXp(Math.max(2, Math.round(CROPS[p.c].sell * XPF / 4))); p.c = null; p.p = 0; p.w = 0; sfx(700); return true;
}
function collectAnimal(i) { const a = S.pen[i]; if (a.st !== 'ready') return false; const pr = ANIMALS[a.a].prod; if (!addItem(pr, 1)) return false; gainXp(Math.max(2, Math.round(ITEMS[pr].base * XPF / 6))); a.st = 'idle'; a.t = 0; sfx(640); return true; }
function harvestFish(i) { const f = S.pond[i]; if (!fishReady(f)) return false; if (!addItem(f.f, 1)) return false; gainXp(Math.max(2, Math.round(FISH[f.f].sell * XPF / 4))); S.pond.splice(i, 1); sfx(600); return true; }
function sell(id, n) { n = Math.min(n, S.inv[id] || 0); if (n <= 0) return 0; const g = Math.round(price(id) * n); S.inv[id] -= n; if (!S.inv[id]) delete S.inv[id]; S.money += g; S.stats.earned += g; gainXp(Math.ceil(g * XPF / 40)); sfx(880); return g; }
function sfx(f) { try { const A = sfx.ctx || (sfx.ctx = new (window.AudioContext || window.webkitAudioContext)()), o = A.createOscillator(), g = A.createGain(); o.frequency.value = f; o.type = 'sine'; g.gain.value = 0.05; o.connect(g); g.connect(A.destination); o.start(); g.gain.exponentialRampToValueAtTime(0.0001, A.currentTime + 0.14); o.stop(A.currentTime + 0.15); } catch (e) { } }

// upgrades: the 10 things money is for (1-4 are the core buys: seeds, animals, fish, feed)
const UPS = [
  { k: 'plot', n: 'ขยายแปลงปลูก', i: '🌱', max: 3, cost: [240, 720, 1760], desc: l => `จาก ${PLOTS[l]} เป็น ${PLOTS[l + 1]} แปลง` },
  { k: 'pen', n: 'ขยายคอกสัตว์', i: '🐔', max: 4, cost: [320, 960, 2400, 5600], desc: l => `จุสัตว์ ${PENS[l]} → ${PENS[l + 1]} ตัว` },
  { k: 'pond', n: 'ขยายบ่อปลา', i: '🐟', max: 4, cost: [280, 800, 2080, 4800], desc: l => `ปล่อยปลาได้ ${PONDS[l]} → ${PONDS[l + 1]} ตัว` },
  { k: 'barn', n: 'ขยายยุ้งฉาง', i: '🏚️', max: 4, cost: [160, 480, 1280, 3200], desc: l => `เก็บของได้ ${BARNS[l]} → ${BARNS[l + 1]} ชิ้น` },
  { k: 'sprinkler', n: 'ระบบสปริงเกอร์อัตโนมัติ', i: '💦', max: 1, cost: [960], desc: () => 'รดน้ำทุกแปลงให้เอง ผักโตเร็วขึ้น 1.5 เท่า' },
  { k: 'feeder', n: 'เครื่องให้อาหารอัตโนมัติ', i: '⚙️', max: 1, cost: [1200], desc: () => 'อาหารสัตว์หมดแล้วซื้อเติมให้เอง ไม่ต้องกลับมาเช็ค' },
  { k: 'work', n: 'โรงงานแปรรูป', i: '🏭', max: 1, cost: [1200], lv: 4, desc: () => 'ทำซุป แยม ชีส พาย ขายได้มากกว่าวัตถุดิบ ~8%' },
  { k: 'truck', n: 'รถกระบะส่งของ', i: '🚚', max: 2, cost: [2800, 7200], lv: 6, desc: l => `ราคาขายทุกอย่าง +${l ? 8 : 4}%` },
];
function buyUp(k) {
  const u = UPS.find(x => x.k === k), l = S.u[k]; if (l >= u.max) return; if (u.lv && S.lvl < u.lv) { toast(`ต้องเลเวล ${u.lv}`); return; }
  if (!spend(u.cost[l])) return; S.u[k]++; sfx(900); toast(`${u.i} ${u.n} สำเร็จ!`);
  if (k === 'plot') while (S.plots.length < PLOTS[S.u.plot]) S.plots.push({ c: null, p: 0, w: S.u.sprinkler ? 1 : 0 });
  build3d();
}
function buyDeco(id) { const d = DECOS.find(x => x.id === id); if (S.deco[id]) return; if (!spend(d.price)) return; S.deco[id] = 1; sfx(900); toast(`${d.i} ${d.n} ตกแต่งฟาร์มแล้ว ชื่อเสียง +0.3%`); build3d(); }
function deposit(n) { n = Math.min(n, S.money); if (n <= 0) return; S.money -= n; S.bank += n; sfx(500); }
function withdraw(n) { n = Math.min(n, S.bank); if (n <= 0) return; S.bank -= n; S.money += n; sfx(500); }

// ---------------- sheets ----------------
let tab = null;
const A = {};
function openTab(t) { tab = t; $('sheet').hidden = false; document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.v === t)); render(); }
function closeSheet() { tab = null; $('sheet').hidden = true; document.querySelectorAll('#nav button').forEach(b => b.classList.remove('on')); }
const lock = lv => (lv > S.lvl ? ' lock' : '');
function render() {
  if (!tab) return;
  const R = {
    farm() {
      $('stitle').textContent = '🌱 แปลงผัก';
      const empty = S.plots.filter(p => !p.c).length, rd = S.plots.filter(cropReady).length;
      return `<div class="row"><button class="btn" data-a="plantall" ${empty ? '' : 'disabled'}>ปลูกทั้งหมด (${empty} แปลงว่าง)</button><button class="btn ghost" data-a="harvall" ${rd ? '' : 'disabled'}>เก็บเกี่ยวทั้งหมด (${rd})</button></div>
      <h5>เลือกเมล็ดพันธุ์ แล้วแตะแปลงเพื่อปลูก (แตะแปลงที่กำลังโตเพื่อรดน้ำ)</h5>` +
        Object.keys(CROPS).map(k => { const c = CROPS[k], sel = S.sel === k; return `<div class="card${lock(c.lv)}"><div class="ci">${c.i}</div><div><h4>${c.n}${sel ? '<span class="pill">เลือกอยู่</span>' : ''}</h4><p>เมล็ด ${c.seed} ฿ · โต ${c.sec >= 60 ? Math.round(c.sec / 60 * 10) / 10 + ' นาที' : c.sec + ' วิ'} · ขาย ~${price(k)} ฿ <span class="${trend(k) >= 0 ? 'up' : 'down'}">${trend(k) >= 0 ? '▲' : '▼'}</span></p></div>${c.lv > S.lvl ? `<span class="pill">🔒 Lv.${c.lv}</span>` : `<button class="btn${sel ? ' ghost' : ''}" data-a="sel" data-v="${k}">${sel ? '✓' : 'เลือก'}</button>`}</div>`; }).join('');
    },
    pen() {
      $('stitle').textContent = '🐔 สัตว์เลี้ยง';
      const rd = S.pen.filter(a => a.st === 'ready').length;
      return `<div class="row"><button class="btn" data-a="collall" ${rd ? '' : 'disabled'}>เก็บผลผลิตทั้งหมด (${rd})</button><button class="btn ghost" data-a="feed">ซื้ออาหาร ×10 (${FEED_PRICE * 10} ฿)</button></div>
      <p class="dim" style="margin:0 2px 6px;font-size:12.5px;color:var(--ink-dim)">🌾 อาหารสัตว์ในคลัง ${S.feed} ถุง · สัตว์แต่ละตัวใช้อาหาร 1–3 ถุงต่อรอบผลิต ${S.u.feeder ? '· เครื่องให้อาหารอัตโนมัติทำงานอยู่' : ''}</p>
      <h5>สัตว์ในคอก ${S.pen.length}/${PENS[S.u.pen]}</h5>` +
        (S.pen.map((a, i) => { const d = ANIMALS[a.a]; const st = a.st === 'ready' ? `<b class="up">พร้อมเก็บ ${ITEMS[d.prod].i}</b>` : a.st === 'idle' ? '<b class="down">หิว! ไม่มีอาหาร</b>' : `กำลังผลิต ${Math.max(0, Math.ceil(d.sec - a.t))} วิ`; return `<div class="card"><div class="ci">${d.i}</div><div><h4>${d.n}</h4><p>${st} · ให้ ${ITEMS[d.prod].n} ~${price(d.prod)} ฿</p></div>${a.st === 'ready' ? `<button class="btn" data-a="coll" data-v="${i}">เก็บ</button>` : `<button class="btn ghost" data-a="sellan" data-v="${i}">ขายสัตว์</button>`}</div>`; }).join('') || '<p>ยังไม่มีสัตว์</p>') +
        `<h5>ซื้อสัตว์ใหม่</h5>` + Object.keys(ANIMALS).map(k => { const d = ANIMALS[k]; return `<div class="card${lock(d.lv)}"><div class="ci">${d.i}</div><div><h4>${d.n}</h4><p>${d.price} ฿ · ใช้อาหาร ${d.bags} ถุง/รอบ · ${ITEMS[d.prod].i} ${ITEMS[d.prod].n} ทุก ${d.sec >= 60 ? Math.round(d.sec / 60 * 10) / 10 + ' นาที' : d.sec + ' วิ'}</p></div>${d.lv > S.lvl ? `<span class="pill">🔒 Lv.${d.lv}</span>` : `<button class="btn" data-a="buyan" data-v="${k}">ซื้อ</button>`}</div>`; }).join('');
    },
    pond() {
      $('stitle').textContent = '🐟 บ่อปลา';
      const rd = S.pond.filter(fishReady).length;
      return `<div class="row"><button class="btn" data-a="fishall" ${rd ? '' : 'disabled'}>จับปลาทั้งหมด (${rd})</button></div><h5>ในบ่อ ${S.pond.length}/${PONDS[S.u.pond]}</h5>` +
        (S.pond.map((f, i) => { const d = FISH[f.f]; const left = Math.max(0, Math.ceil(d.sec - f.p)); return `<div class="card"><div class="ci">${d.i}</div><div><h4>${d.n}</h4><p>${fishReady(f) ? '<b class="up">พร้อมจับ</b>' : `โตอีก ${left >= 60 ? Math.ceil(left / 60) + ' นาที' : left + ' วิ'}`} · ขาย ~${price(f.f)} ฿</p></div>${fishReady(f) ? `<button class="btn" data-a="fish" data-v="${i}">จับ</button>` : ''}</div>`; }).join('') || '<p style="color:var(--ink-dim)">บ่อยังว่าง ปล่อยลูกปลาด้านล่างได้เลย</p>') +
        `<h5>ปล่อยลูกปลา (เต็มบ่อเท่าที่เงินพอ แตะ 1 ครั้ง = 1 ตัว)</h5>` + Object.keys(FISH).map(k => { const d = FISH[k]; return `<div class="card${lock(d.lv)}"><div class="ci">${d.i}</div><div><h4>${d.n}</h4><p>ลูกปลา ${d.price} ฿ · โต ${Math.round(d.sec / 60 * 10) / 10} นาที · ขาย ~${price(k)} ฿</p></div>${d.lv > S.lvl ? `<span class="pill">🔒 Lv.${d.lv}</span>` : `<button class="btn" data-a="buyfish" data-v="${k}">ปล่อย</button>`}</div>`; }).join('');
    },
    market() {
      $('stitle').textContent = '🏪 ตลาด';
      const ids = Object.keys(S.inv).filter(k => S.inv[k] > 0), tot = ids.reduce((a, k) => a + price(k) * S.inv[k], 0);
      return `<p style="margin:0 2px 8px;font-size:12.5px;color:var(--ink-dim)">ราคาเปลี่ยนทุกวันของฟาร์ม (วันที่ ${day()}) · โบนัสรถกระบะ/ชื่อเสียง ${Math.round((bonus() - 1) * 1000) / 10}% · ยุ้งฉาง ${used()}/${cap()}</p>
      <div class="row"><button class="btn" data-a="sellall" ${ids.length ? '' : 'disabled'}>ขายทั้งหมด ≈ ${fmt(tot)} ฿</button></div>` +
        (ids.map(k => { const it = ITEMS[k], t = trend(k); return `<div class="card"><div class="ci">${it.i}</div><div><h4>${it.n} ×${S.inv[k]}</h4><p>${price(k)} ฿/ชิ้น <span class="${t >= 0 ? 'up' : 'down'}">${t >= 0 ? '▲' : '▼'} ${Math.abs(Math.round(t * 100))}%</span></p></div><div style="display:flex;flex-direction:column;gap:4px"><button class="btn" data-a="sell" data-v="${k}" data-n="all">ขายหมด</button>${S.inv[k] > 1 ? `<button class="btn ghost" data-a="sell" data-v="${k}" data-n="1">ขาย 1</button>` : ''}</div></div>`; }).join('') || '<p style="color:var(--ink-dim)">ยุ้งฉางว่าง ไปเก็บเกี่ยวผลผลิตก่อนนะ</p>');
    },
    up() {
      $('stitle').textContent = '⭐ เอาเงินไปทำอะไรดี';
      const ups = UPS.map(u => { const l = S.u[u.k], done = l >= u.max, lk = u.lv && S.lvl < u.lv; return `<div class="card${lk ? ' lock' : ''}"><div class="ci">${u.i}</div><div><h4>${u.n}${l ? `<span class="pill">ระดับ ${l}</span>` : ''}</h4><p>${done ? 'สูงสุดแล้ว' : u.desc(l)}${lk ? ` · ต้องเลเวล ${u.lv}` : ''}</p></div>${done ? '<span class="pill">✓</span>' : lk ? `<span class="pill">🔒 Lv.${u.lv}</span>` : `<button class="btn" data-a="up" data-v="${u.k}" ${S.money >= u.cost[l] ? '' : 'disabled'}>${fmt(u.cost[l])} ฿</button>`}</div>`; }).join('');
      const decos = DECOS.map(d => `<div class="card"><div class="ci">${d.i}</div><div><h4>${d.n}</h4><p>ตกแต่งฟาร์ม · ชื่อเสียง +0.3% ราคาขาย${d.id === 'fountain' ? ' (+0.8%)' : ''}</p></div>${S.deco[d.id] ? '<span class="pill">✓ มีแล้ว</span>' : `<button class="btn" data-a="deco" data-v="${d.id}" ${S.money >= d.price ? '' : 'disabled'}>${fmt(d.price)} ฿</button>`}</div>`).join('');
      return `<p style="margin:0 2px 6px;font-size:12.5px;color:var(--ink-dim)">นอกจากซื้อเมล็ด สัตว์ ลูกปลา และอาหารสัตว์ เงินยังใช้ทำสิ่งเหล่านี้ได้</p><h5>อัปเกรดฟาร์ม</h5>${ups}<h5>🏦 ธนาคารสุขใจ (ดอกเบี้ย 1% ต่อวันของฟาร์ม)</h5>
      <div class="card"><div class="ci">🏦</div><div><h4>เงินฝาก ${fmt(S.bank)} ฿</h4><p>ฝากได้ไม่เกิน 200,000 ฿ ถอนได้ทุกเมื่อ</p></div></div>
      <div class="row"><button class="btn ghost" data-a="dep" data-v="1000" ${S.money >= 1 ? '' : 'disabled'}>ฝาก 1,000</button><button class="btn ghost" data-a="dep" data-v="all">ฝากทั้งหมด</button><button class="btn ghost" data-a="wd" data-v="all" ${S.bank ? '' : 'disabled'}>ถอนทั้งหมด</button></div>
      <h5>ตกแต่งฟาร์ม</h5>${decos}<h5>เซฟ · ช่อง ${slot}</h5><div class="row"><button class="btn ghost" data-a="copycode" data-v="${slot}">📋 คัดลอกรหัสเซฟ (สำรองไว้)</button></div><p style="margin:0 2px 8px;font-size:12.5px;color:var(--ink-dim)">${online ? '☁️ เชื่อมต่อเซิร์ฟเวอร์ เซฟสำรองอัตโนมัติทุก 5 วินาที' : '📴 ไม่พบเซิร์ฟเวอร์ เซฟเก็บในเครื่องนี้'} · รหัสผู้เล่น: ${DEV}</p><div class="row"><button class="btn" data-a="savenow">💾 เซฟตอนนี้</button><button class="btn ghost" data-a="title">↩ เลือกช่องเซฟ</button></div>`;
    },
    work() {
      $('stitle').textContent = '🏭 โรงงานแปรรูป';
      if (!S.u.work) return '<p>ยังไม่มีโรงงาน ซื้อได้ที่แท็บ ⭐ อัปเกรด (เลเวล 4)</p>';
      const j = S.job, r = j && RECIPES.find(x => x.id === j.id);
      const cur = j ? `<div class="card"><div class="ci">${ITEMS[j.id].i}</div><div><h4>กำลังทำ ${ITEMS[j.id].n}</h4><p>${jobReady() ? '<b class="up">เสร็จแล้ว</b>' : `อีก ${Math.ceil(r.sec - j.t)} วิ`}</p></div>${jobReady() ? '<button class="btn" data-a="jobget">รับ</button>' : ''}</div>` : '';
      return cur + '<h5>สูตร (ทำได้ทีละอย่าง)</h5>' + RECIPES.map(r => { const ok = !S.job && Object.keys(r.in).every(k => (S.inv[k] || 0) >= r.in[k]); const cost = Object.keys(r.in).reduce((a, k) => a + ITEMS[k].base * r.in[k], 0); return `<div class="card"><div class="ci">${ITEMS[r.id].i}</div><div><h4>${ITEMS[r.id].n} <span class="pill">ขาย ~${price(r.id)} ฿</span></h4><p>ใช้ ${Object.keys(r.in).map(k => `${ITEMS[k].i}${ITEMS[k].n} ×${r.in[k]} (มี ${S.inv[k] || 0})`).join(' + ')} · ${r.sec} วิ · วัตถุดิบขายสด ~${fmt(cost)} ฿</p></div><button class="btn" data-a="mk" data-v="${r.id}" ${ok ? '' : 'disabled'}>ทำ</button></div>`; }).join('');
    },
    barn() {
      $('stitle').textContent = '🏚️ ยุ้งฉาง';
      const ids = Object.keys(S.inv).filter(k => S.inv[k] > 0);
      return `<p style="color:var(--ink-dim);font-size:13px">เก็บแล้ว ${used()}/${cap()} ชิ้น</p>` + (ids.map(k => `<div class="card"><div class="ci">${ITEMS[k].i}</div><div><h4>${ITEMS[k].n} ×${S.inv[k]}</h4><p>ราคาวันนี้ ${price(k)} ฿</p></div></div>`).join('') || '<p style="color:var(--ink-dim)">ว่างเปล่า</p>') + '<div class="row"><button class="btn" data-a="tab" data-v="market">ไปตลาด</button></div>';
    },
  };
  if (!R[tab]) return;
  const html = R[tab](); const b = $('sbody'), st = b.scrollTop; b.innerHTML = html; b.scrollTop = st;
}
Object.assign(A, {
  tab: d => openTab(d.v), close: closeSheet, tipok: () => { $('tip').hidden = true; if (S) { S.tip = 1; save(); } },
  sel: d => { S.sel = d.v; toast(`เลือก ${CROPS[d.v].n} แตะแปลงว่างเพื่อปลูก`); },
  plantall: () => { let n = 0; S.plots.forEach((p, i) => { if (!p.c && S.money >= CROPS[S.sel].seed && CROPS[S.sel].lv <= S.lvl) { plant(i); n++; } }); if (!n) toast('ปลูกไม่ได้ (เงินไม่พอหรือยังไม่ปลดล็อก)'); },
  harvall: () => { let n = 0; S.plots.forEach((p, i) => { if (harvestPlot(i)) n++; }); if (n) toast(`เก็บเกี่ยว ${n} แปลง`); },
  feed: () => { if (spend(FEED_PRICE * 10)) { S.feed += 10; sfx(500); } },
  buyan: d => { const a = ANIMALS[d.v]; if (S.pen.length >= PENS[S.u.pen]) { toast('คอกเต็ม ขยายคอกที่แท็บ ⭐'); return; } if (!spend(a.price)) return; S.pen.push({ a: d.v, st: 'idle', t: 0 }); sfx(600); build3d(); },
  sellan: d => { const a = S.pen[+d.v], g = Math.round(ANIMALS[a.a].price * 0.6); S.pen.splice(+d.v, 1); S.money += g; toast(`ขายสัตว์ได้ ${fmt(g)} ฿`); build3d(); },
  coll: d => { collectAnimal(+d.v); },
  collall: () => { let n = 0; S.pen.forEach((a, i) => { if (collectAnimal(i)) n++; }); if (n) toast(`เก็บผลผลิต ${n} ชิ้น`); },
  buyfish: d => { if (S.pond.length >= PONDS[S.u.pond]) { toast('บ่อเต็ม ขยายบ่อที่แท็บ ⭐'); return; } if (!spend(FISH[d.v].price)) return; S.pond.push({ f: d.v, p: 0 }); sfx(560); build3d(); },
  fish: d => { harvestFish(+d.v); build3d(); },
  fishall: () => { let n = 0; for (let i = S.pond.length - 1; i >= 0; i--) if (harvestFish(i)) n++; if (n) toast(`จับปลา ${n} ตัว`); build3d(); },
  sell: d => { const g = sell(d.v, d.n === 'all' ? 1e9 : 1); if (g) toast(`ขายได้ ${fmt(g)} ฿`); },
  sellall: () => { let g = 0; for (const k of Object.keys(S.inv)) g += sell(k, 1e9); if (g) toast(`ขายทั้งหมด ได้ ${fmt(g)} ฿`); },
  up: d => buyUp(d.v), deco: d => buyDeco(d.v),
  dep: d => deposit(d.v === 'all' ? S.money : +d.v), wd: d => withdraw(d.v === 'all' ? S.bank : +d.v),
  mk: d => { const r = RECIPES.find(x => x.id === d.v); if (S.job || !Object.keys(r.in).every(k => (S.inv[k] || 0) >= r.in[k])) return; for (const k in r.in) { S.inv[k] -= r.in[k]; if (!S.inv[k]) delete S.inv[k]; } S.job = { id: r.id, t: 0 }; sfx(500); },
  jobget: () => { if (jobReady() && addItem(S.job.id, 1)) { gainXp(Math.round(ITEMS[S.job.id].base / 10)); S.job = null; sfx(800); } },
  savenow: () => { save(); toast(online ? '💾 เซฟแล้ว (เครื่อง + เซิร์ฟเวอร์)' : '💾 เซฟแล้ว (ในเครื่อง)'); },
  title: () => { save(); closeSheet(); showTitle(); },
  play: d => startGame(+d.v), del: d => { if (confirm(`ลบเซฟช่อง ${d.v}? ลบแล้วกู้คืนไม่ได้`)) { wipeSlot(+d.v); if (online) api('/api/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: sid(+d.v), save: null }) }).catch(() => { }); renderTitle(); } },
  newgame: d => { const nm = (($('nm' + d.v) || {}).value || '').trim().slice(0, 14) || 'ชาวไร่'; startGame(+d.v, nm); },
  copycode: async d => { const n = +d.v || slot, data = S && slot === n ? S : await readSlot(n); if (!data) return; const t = encodeSave(data); try { await navigator.clipboard.writeText(t); toast('📋 คัดลอกรหัสเซฟแล้ว เก็บไว้ที่ไลน์/โน้ต ใช้นำเข้าเมื่อไหร่ก็ได้'); } catch (e) { prompt('คัดลอกรหัสเซฟนี้เก็บไว้ (กดค้างแล้วเลือกคัดลอก)', t); } },
  importcode: d => { const t = prompt('วางรหัสเซฟที่คัดลอกไว้ (ขึ้นต้นด้วย FARM2:)'); if (!t) return; const j = decodeSave(t); if (!j) { alert('รหัสเซฟไม่ถูกต้อง'); return; } writeSlot(+d.v, j); renderTitle(); },
  code: () => { const c = prompt('รหัสผู้เล่นของคุณ (จดไว้ใช้ย้ายเครื่อง) ใส่รหัสจากเครื่องเก่าเพื่อโหลดเซฟเดิม:', DEV); if (c && /^[A-Za-z0-9_-]{4,40}$/.test(c) && c !== DEV) { DEV = c; try { localStorage.setItem('raisukjai2-dev', c); } catch (e) { } renderTitle(); } },
});
document.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (!b || b.disabled) return; const f = A[b.dataset.a]; if (f) { f(b.dataset); if (S) { render(); hud(); queueSave(); } } });

// ---------------- HUD ----------------
function hud() {
  if (!S) return;
  $('money').textContent = fmt(S.money) + ' ฿'; $('lv').textContent = `${S.name} · Lv.${S.lvl}`; $('xp').style.width = (S.xp / xpNeed(S.lvl) * 100) + '%';
  const m = Math.floor(hourNow() * 60), hh = String(Math.floor(m / 60)).padStart(2, '0'), mm = String(m % 60).padStart(2, '0');
  $('day').textContent = `วันที่ ${day()} · ${hh}:${mm}`; $('barn').textContent = `🏚️ ${used()}/${cap()}`;
  const c = CROPS[S.sel]; $('seedchip').textContent = `${c.i} ${c.n} ${c.seed}฿ ▾`;
  const n = readyCount(); $('harvest').hidden = !n; $('harvest').textContent = `🧺 เก็บทั้งหมด (${n})`;
  const rd = [S.plots.filter(cropReady).length, S.pen.filter(a => a.st === 'ready').length, S.pond.filter(fishReady).length];
  document.querySelectorAll('#nav button').forEach(b => { const k = { farm: 0, pen: 1, pond: 2 }[b.dataset.v]; let i = b.querySelector('i'); if (k != null && rd[k]) { if (!i) { i = document.createElement('i'); b.appendChild(i); } i.textContent = rd[k]; } else if (i) i.remove(); });
}
$('harvest').onclick = () => { A.harvall(); A.collall(); A.fishall(); render(); hud(); };

// ---------------- 3D (same look as V.1: soft sky, warm sun, rounded low-poly) ----------------
let renderer, scene, camera, ray, root, plotObjs = [], penObjs = [], pondObjs = [], clickables = [], fishM = [], animM = [];
const COL = [];
const lin = c => new THREE.Color(c).convertSRGBToLinear();     // hex colours are what you see on screen (sRGB); the renderer works in linear light
const mats = {}, mat = (c, o) => { const k = c + JSON.stringify(o || {}); return mats[k] || (mats[k] = new THREE.MeshStandardMaterial(Object.assign({ color: lin(c), roughness: 0.85, metalness: 0 }, o))); };
function canvasTex(w, h, draw, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; if (rep) t.repeat.set(rep, rep); t.anisotropy = 4; return t; }
const TEX = {};
const grassTex = () => TEX.grass || (TEX.grass = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#3f7d26'; g.fillRect(0, 0, w, h);
  const cols = ['#4e9a32', '#3a7524', '#5cab3a', '#336b20', '#6cbf44'];
  for (let i = 0; i < 700; i++) { g.fillStyle = cols[i % cols.length]; g.globalAlpha = 0.22 + Math.random() * 0.25; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 3 + Math.random() * 9, 0, 7); g.fill(); }
  g.globalAlpha = 0.5; for (let i = 0; i < 900; i++) { g.strokeStyle = cols[(i * 3) % cols.length]; g.lineWidth = 1; const x = Math.random() * w, y = Math.random() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.random() * 3 - 1.5, y - 3 - Math.random() * 5); g.stroke(); }
}, 26));
const soilTex = wet => TEX['soil' + wet] || (TEX['soil' + wet] = canvasTex(128, 128, (g, w, h) => {
  g.fillStyle = wet ? '#4a3220' : '#6d4a2d'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 16) { g.fillStyle = wet ? '#3a271a' : '#5a3b23'; g.fillRect(0, y, w, 6); g.fillStyle = wet ? '#5a4029' : '#85603a'; g.fillRect(0, y + 8, w, 3); }
  for (let i = 0; i < 260; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.08)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
}, 1));
const soilMat = wet => mats['soilM' + wet] || (mats['soilM' + wet] = new THREE.MeshStandardMaterial({ map: soilTex(wet), roughness: 1 }));
const dirtTex = () => TEX.dirt || (TEX.dirt = canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#a98f64'; g.fillRect(0, 0, w, h); for (let i = 0; i < 500; i++) { g.fillStyle = ['#8f7650', '#bba173', '#9c8259'][i % 3]; g.globalAlpha = 0.4; g.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 4, 2 + Math.random() * 3); } }, 1));
const sph = new THREE.SphereGeometry(1, 16, 12), box = new THREE.BoxGeometry(1, 1, 1), cyl = new THREE.CylinderGeometry(1, 1, 1, 14), cone = new THREE.ConeGeometry(1, 1, 12);
function mk(parent, geo, m, p = [0, 0, 0], s = [1, 1, 1], r) { const o = new THREE.Mesh(geo, m); o.position.set(...p); o.scale.set(...(typeof s === 'number' ? [s, s, s] : s)); if (r) o.rotation.set(...r); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o; }
function bubble(emoji) { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = 'rgba(255,255,255,0.92)'; g.beginPath(); g.arc(64, 64, 58, 0, 7); g.fill(); g.font = '68px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(emoji, 64, 68); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); sp.scale.set(0.95, 0.95, 1); sp.renderOrder = 10; return sp; }
const bubbles = {};
const bub = e => { const b = bubbles[e] || (bubbles[e] = bubble(e)); return b.clone(); };

function cropMesh(id) {
  const g = new THREE.Group(), c = CROPS[id], leaf = mat(0x4f9a4a), col = mat(c.col);
  if (id === 'carrot') { for (let i = 0; i < 3; i++) { mk(g, cone, leaf, [(i - 1) * 0.28, 0.5, 0], [0.12, 0.7, 0.12], [0, 0, (i - 1) * 0.4]); mk(g, cone, col, [(i - 1) * 0.28, 0.12, 0], [0.12, 0.3, 0.12], [Math.PI, 0, 0]); } }
  else if (id === 'cabbage') { mk(g, sph, mat(0x8fd16a), [0, 0.35, 0], [0.55, 0.45, 0.55]); mk(g, sph, mat(0xb6e88a), [0, 0.5, 0], [0.38, 0.3, 0.38]); }
  else if (id === 'tomato') { mk(g, sph, leaf, [0, 0.45, 0], [0.5, 0.45, 0.5]); for (let i = 0; i < 5; i++) mk(g, sph, col, [Math.cos(i * 1.3) * 0.38, 0.4 + (i % 2) * 0.25, Math.sin(i * 1.3) * 0.38], 0.13); }
  else if (id === 'corn') { for (let i = 0; i < 3; i++) { mk(g, cyl, leaf, [(i - 1) * 0.35, 0.8, (i % 2) * 0.2], [0.07, 1.6, 0.07]); mk(g, sph, col, [(i - 1) * 0.35, 0.95, 0.1], [0.1, 0.28, 0.1]); } }
  else if (id === 'strawberry') { mk(g, sph, leaf, [0, 0.28, 0], [0.55, 0.3, 0.55]); for (let i = 0; i < 6; i++) mk(g, sph, col, [Math.cos(i * 1.05) * 0.4, 0.22, Math.sin(i * 1.05) * 0.4], 0.11); }
  else if (id === 'pumpkin') { mk(g, sph, col, [0, 0.3, 0], [0.55, 0.38, 0.55]); mk(g, cyl, leaf, [0, 0.7, 0], [0.06, 0.2, 0.06]); mk(g, sph, leaf, [0.4, 0.25, 0.3], [0.3, 0.06, 0.3]); }
  else { mk(g, sph, col, [0, 0.35, 0], [0.7, 0.45, 0.5]); mk(g, sph, mat(0x1f6a30), [0, 0.5, 0], [0.5, 0.3, 0.35]); }
  return g;
}
function animalMesh(id) {
  const g = new THREE.Group(), W = mat(0xf5f5f0), ye = mat(0xffd34d), or = mat(0xf08a24), dk = mat(0x2b2b2b);
  if (id === 'chicken') { mk(g, sph, W, [0, 0.32, 0], [0.3, 0.26, 0.36]); mk(g, sph, W, [0, 0.6, 0.26], 0.16); mk(g, box, mat(0xe0443a), [0, 0.78, 0.26], [0.04, 0.1, 0.12]); mk(g, cone, or, [0, 0.58, 0.45], [0.06, 0.14, 0.06], [Math.PI / 2, 0, 0]); mk(g, cone, mat(0xdddddd), [0, 0.42, -0.4], [0.1, 0.25, 0.08], [-1.9, 0, 0]); }
  else if (id === 'duck') { mk(g, sph, ye, [0, 0.3, 0], [0.3, 0.24, 0.38]); mk(g, sph, ye, [0, 0.6, 0.28], 0.16); mk(g, box, or, [0, 0.56, 0.46], [0.14, 0.05, 0.14]); }
  else if (id === 'sheep') { mk(g, sph, W, [0, 0.55, 0], [0.55, 0.45, 0.6]); mk(g, sph, dk, [0, 0.7, 0.55], [0.2, 0.22, 0.22]); for (const x of [-0.25, 0.25]) for (const z of [-0.3, 0.3]) mk(g, cyl, dk, [x, 0.15, z], [0.07, 0.3, 0.07]); }
  else if (id === 'pig') { mk(g, sph, mat(0xf5a3b5), [0, 0.5, 0], [0.5, 0.4, 0.7]); mk(g, sph, mat(0xf5a3b5), [0, 0.6, 0.65], 0.3); mk(g, cyl, mat(0xe8809a), [0, 0.55, 0.92], [0.12, 0.08, 0.12], [Math.PI / 2, 0, 0]); for (const x of [-0.22, 0.22]) for (const z of [-0.35, 0.35]) mk(g, cyl, mat(0xe8809a), [x, 0.12, z], [0.08, 0.24, 0.08]); }
  else { mk(g, sph, W, [0, 0.75, 0], [0.55, 0.5, 0.95]); mk(g, sph, dk, [0.3, 0.9, 0.1], [0.22, 0.2, 0.3]); mk(g, sph, dk, [-0.25, 0.7, -0.3], [0.22, 0.2, 0.26]); mk(g, sph, W, [0, 0.95, 0.95], [0.3, 0.3, 0.32]); mk(g, cone, ye, [-0.2, 1.25, 0.95], [0.06, 0.25, 0.06]); mk(g, cone, ye, [0.2, 1.25, 0.95], [0.06, 0.25, 0.06]); for (const x of [-0.3, 0.3]) for (const z of [-0.6, 0.6]) mk(g, cyl, dk, [x, 0.22, z], [0.09, 0.45, 0.09]); }
  const s = { chicken: 0.9, duck: 0.9, sheep: 0.95, pig: 0.95, cow: 0.85 }[id]; g.scale.setScalar(s); return g;
}
function build3d() {
  if (!scene) return;
  if (root) scene.remove(root);
  root = new THREE.Group(); scene.add(root); COL.length = 0; plotObjs = []; penObjs = []; pondObjs = []; clickables = []; fishM = []; animM = [];
  const click = (o, kind, i) => { o.traverse(m => { m.userData.k = kind; m.userData.i = i; }); clickables.push(o); };
  // ground and hills
  const gt = grassTex(); mk(root, new THREE.PlaneGeometry(110, 110), new THREE.MeshStandardMaterial({ map: gt, roughness: 1 }), [0, 0, -10], 1, [-Math.PI / 2, 0, 0]).castShadow = false;
  { const dt = dirtTex().clone(); dt.needsUpdate = true; dt.repeat.set(1, 7); const path = mk(root, new THREE.PlaneGeometry(2.4, 24), new THREE.MeshStandardMaterial({ map: dt, roughness: 1 }), [0, 0.02, 1], 1, [-Math.PI / 2, 0, 0]); path.castShadow = false;
    const free = (x, z) => !(Math.abs(x) < 1.6) && !(Math.abs(x) < 7 && z > -0.8 && z < 9.6) && !(x > -8.4 && x < -0.1 && z > -7.8 && z < -0.6) && !(Math.hypot(x - 4.3, z + 4.2) < 4.4) && !(z < -8 && z > -13.2 && Math.abs(x) < 8.5);
    const blade = new THREE.InstancedMesh(new THREE.ConeGeometry(0.06, 0.55, 5), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 }), 420), dm = new THREE.Object3D(), gc = [0x6aa84a, 0x5a9a3e, 0x7bb656, 0x4f8a37];
    let n = 0; for (let k = 0; k < 2000 && n < 420; k++) { const x = rnd(-16, 16), z = rnd(-12, 15); if (!free(x, z)) continue; dm.position.set(x, 0.25, z); dm.rotation.set(rnd(-0.25, 0.25), rnd(0, 6), rnd(-0.25, 0.25)); dm.scale.setScalar(rnd(0.7, 1.5)); dm.updateMatrix(); blade.setMatrixAt(n, dm.matrix); blade.setColorAt(n, lin(gc[n % 4])); n++; }
    blade.count = n; blade.instanceMatrix.needsUpdate = true; if (blade.instanceColor) blade.instanceColor.needsUpdate = true; root.add(blade);
    const fl = new THREE.InstancedMesh(new THREE.SphereGeometry(0.09, 6, 5), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 }), 90), fc = [0xf2f2ea, 0xffd23f, 0xf08aa0, 0xb69be0, 0xff8a65]; let m2 = 0;
    for (let k = 0; k < 800 && m2 < 90; k++) { const x = rnd(-16, 16), z = rnd(-12, 15); if (!free(x, z)) continue; dm.position.set(x, 0.32, z); dm.rotation.set(0, 0, 0); dm.scale.setScalar(rnd(0.8, 1.3)); dm.updateMatrix(); fl.setMatrixAt(m2, dm.matrix); fl.setColorAt(m2, lin(fc[m2 % 5])); m2++; }
    fl.count = m2; fl.instanceMatrix.needsUpdate = true; if (fl.instanceColor) fl.instanceColor.needsUpdate = true; root.add(fl); }
  [[-14, -26, 9, 0x6fae5a], [0, -30, 11, 0x5e9e50], [15, -27, 8, 0x6fae5a], [-26, -20, 7, 0x5e9e50], [27, -18, 7, 0x6fae5a]].forEach(([x, z, r, c]) => mk(root, sph, mat(c), [x, 0, z], [r * 1.3, r * 0.7, r]));
  // plots (4 columns)
  S.plots.forEach((p, i) => {
    const c = i % 4, r = Math.floor(i / 4), g = new THREE.Group(); g.position.set((c - 1.5) * 2.2, 0, 7.5 - r * 2.2); root.add(g);
    mk(g, box, soilMat(p.w ? 1 : 0), [0, 0.1, 0], [1.9, 0.2, 1.9]); for (const sx of [-1, 1]) for (const sz of [-1, 1]) mk(g, box, mat(0x8a6a44), [sx * 0.97, 0.16, sz * 0.0], [0.06, 0.32, 1.96]).scale.x = 0.06;
    g.userData.soil = g.children[0]; plotObjs.push({ g, c: null, st: -1 }); click(g, 'plot', i);
  });
  // barn, market stall, workshop
  const barn = new THREE.Group(); barn.position.set(-6, 0, -11); root.add(barn); mk(barn, box, mat(0xb8322a), [0, 1.3, 0], [3, 2.6, 2.6]); mk(barn, box, mat(0xf5f5f0), [0, 1.3, 1.31], [0.9, 1.6, 0.04]);
  const roof = mk(barn, box, mat(0x6d4c41), [0, 3, 0], [3.4, 0.2, 3]); roof.rotation.z = 0; mk(barn, cone, mat(0x6d4c41), [0, 3.4, 0], [2.4, 1.2, 2.4], [0, Math.PI / 4, 0]); click(barn, 'barn', 0); COL.push({ t: 'c', x: -6, z: -11, r: 2.2 });
  const stall = new THREE.Group(); stall.position.set(0, 0, -10); root.add(stall); mk(stall, box, mat(0xb08968), [0, 0.6, 0], [3, 1.2, 1.4]);
  for (let i = 0; i < 6; i++) mk(stall, box, mat(i % 2 ? 0xf5f5f0 : 0xe0443a), [-1.25 + i * 0.5, 2.2, 0.2], [0.5, 0.1, 1.9], [0.3, 0, 0]);
  for (const x of [-1.4, 1.4]) mk(stall, cyl, mat(0x6d4c41), [x, 1.1, 0.8], [0.06, 2.2, 0.06]); mk(stall, box, mat(0xffcf3f), [0, 2.7, 0.8], [1.6, 0.4, 0.06]); click(stall, 'market', 0); COL.push({ t: 'b', x: 0, z: -10, hw: 1.7, hd: 0.9 });
  const bk = bub('🏪'); bk.position.set(0, 3.6, -10); root.add(bk);
  if (S.u.work) { const w = new THREE.Group(); w.position.set(6, 0, -11); root.add(w); mk(w, box, mat(0x90a4ae), [0, 1.2, 0], [2.8, 2.4, 2.4]); mk(w, box, mat(0x546e7a), [0, 2.55, 0], [3, 0.3, 2.6]); mk(w, cyl, mat(0xcfd8dc), [0.8, 3.3, 0], [0.28, 1.6, 0.28]); mk(w, box, mat(0x4fc3f7), [-0.5, 1.4, 1.22], [1, 0.8, 0.04]); click(w, 'work', 0); COL.push({ t: 'c', x: 6, z: -11, r: 2 }); const wb = bub('🏭'); wb.position.set(6, 4.4, -11); root.add(wb); }
  if (S.u.truck) { const t = new THREE.Group(); t.position.set(6.4, 0, 9.5); t.rotation.y = -0.5; root.add(t); COL.push({ t: 'c', x: 6.4, z: 9.5, r: 1.4 }); mk(t, box, mat(S.u.truck > 1 ? 0xe0443a : 0x3e7cc8), [0, 0.7, 0], [1.2, 0.7, 2.4]); mk(t, box, mat(0xf5f5f0), [0, 1.2, 0.7], [1.1, 0.6, 0.9]); for (const x of [-0.6, 0.6]) for (const z of [-0.8, 0.8]) mk(t, cyl, mat(0x222222), [x, 0.3, z], [0.3, 0.2, 0.3], [0, 0, Math.PI / 2]); }
  // pen with fence
  const pen = new THREE.Group(); pen.position.set(-4.2, 0, -4.2); root.add(pen);
  const fw = mat(0xb08968), PX = -4.2, PZ = -4.2;
  for (const [x, z, w, d] of [[0, -2.6, 6.6, 0.08], [-3.3, 0, 0.08, 5.2], [3.3, 0, 0.08, 5.2], [-2.15, 2.6, 2.3, 0.08], [2.15, 2.6, 2.3, 0.08]]) { mk(pen, box, fw, [x, 0.55, z], [w, 0.1, d]); mk(pen, box, fw, [x, 0.3, z], [w, 0.1, d]); COL.push({ t: 'b', x: PX + x, z: PZ + z, hw: w / 2 + 0.1, hd: d / 2 + 0.1 }); }
  for (let i = -3; i <= 3; i++) for (const z of [-2.6, 2.6]) if (z < 0 || Math.abs(i * 1.1) > 1.2) mk(pen, box, fw, [i * 1.1, 0.4, z], [0.12, 0.8, 0.12]);
  mk(pen, box, mat(0x9bc46a), [0, 0.02, 0], [6.4, 0.04, 5], undefined).castShadow = false;
  const pc = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 5), new THREE.MeshBasicMaterial({ visible: false })); pc.rotation.x = -Math.PI / 2; pc.position.y = 0.05; pen.add(pc); click(pc, 'pen', -1);
  S.pen.forEach((a, i) => { const m = animalMesh(a.a); m.position.set(rnd(-2.6, 2.6), 0, rnd(-2, 2)); m.userData.pn = { x: m.position.x, z: m.position.z, tx: m.position.x, tz: m.position.z, w: rnd(0, 3) }; pen.add(m); const b = bub(ITEMS[ANIMALS[a.a].prod].i); b.visible = false; b.position.y = 1.7; m.add(b); m.userData.b = b; click(m, 'animal', i); animM.push(m); });
  // pond
  const pond = new THREE.Group(); pond.position.set(4.3, 0, -4.2); root.add(pond);
  mk(pond, cyl, mat(0xc9b79c), [0, 0.04, 0], [3.4, 0.1, 3.4]); mk(pond, cyl, mat(0x1f6f8f), [0, 0.07, 0], [3.1, 0.04, 3.1]).castShadow = false; mk(pond, cyl, mat(0x3a9bb8, { roughness: 0.06, metalness: 0.25, transparent: true, opacity: 0.82 }), [0, 0.13, 0], [3.1, 0.05, 3.1]).castShadow = false;
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; mk(pond, sph, mat(i % 2 ? 0x9e9e9e : 0x8a8a8a), [Math.cos(a) * 3.3, 0.15, Math.sin(a) * 3.3], [0.28, 0.2, 0.28]); }
  const pcl = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 0.3, 16), new THREE.MeshBasicMaterial({ visible: false })); pcl.position.y = 0.15; pond.add(pcl); click(pcl, 'pond', -1); COL.push({ t: 'c', x: 4.3, z: -4.2, r: 3.45 });
  S.pond.forEach((f, i) => { const m = new THREE.Group(); mk(m, sph, mat(FISH[f.f] && f.f === 'carp' ? 0xe0443a : f.f === 'catfish' ? 0x6d5c4c : f.f === 'shrimp' ? 0xf08a6a : 0xf0a24a), [0, 0, 0], [0.32, 0.14, 0.14]); mk(m, cone, mat(0xf0a24a), [-0.36, 0, 0], [0.12, 0.2, 0.05], [0, 0, Math.PI / 2]); m.userData.fs = { a: rnd(0, 6.28), r: rnd(0.6, 2.3), sp: rnd(0.4, 0.9) * (i % 2 ? 1 : -1) }; const b = bub('🧺'); b.visible = false; b.position.y = 0.9; m.add(b); m.userData.b = b; pond.add(m); fishM.push(m); click(m, 'pond', i); });
  // decorations
  const D = S.deco;
  const tree = (x, z, s = 1) => { const hh = hash(x + ',' + z), gs = [0x3d7a3a, 0x4a8a41, 0x56984b, 0x3a6f35]; mk(root, cyl, mat(0x5a4030, { roughness: 1 }), [x, 0.9 * s, z], [0.17 * s, 1.8 * s, 0.17 * s]); [[0, 2.3, 0, 1.15], [0.55, 1.9, 0.25, 0.8], [-0.5, 2.0, -0.2, 0.85], [0.1, 2.95, 0.1, 0.7], [-0.2, 1.8, 0.5, 0.7]].forEach(([dx, dy, dz, r], i) => mk(root, sph, mat(gs[(hh + i) % 4], { roughness: 1 }), [x + dx * s, dy * s, z + dz * s], [r * s, r * 0.88 * s, r * s])); };
  [[-8, 4], [8.5, 2], [-8.4, -1], [8.8, -9], [-9, -7]].forEach(([x, z], i) => { tree(x, z, 1 + (i % 3) * 0.12); COL.push({ t: 'c', x, z, r: 0.4 }); });
  if (D.tree) { mk(root, cyl, mat(0x6d4c41), [-8.2, 0.8, 8], [0.2, 1.6, 0.2]); mk(root, sph, mat(0x4f9a4a), [-8.2, 2.1, 8], 1.1); for (let i = 0; i < 5; i++) mk(root, sph, mat(0xe0443a), [-8.2 + Math.cos(i * 1.3) * 0.9, 2 + (i % 2) * 0.4, 8 + Math.sin(i * 1.3) * 0.9], 0.14); }
  if (D.flower) for (let i = 0; i < 12; i++) { const x = 6 + (i % 4) * 0.5, z = 5 + Math.floor(i / 4) * 0.5; mk(root, cyl, mat(0x4f9a4a), [x, 0.15, z], [0.02, 0.3, 0.02]); mk(root, sph, mat([0xf08aa0, 0xffcf3f, 0xf5f5f0, 0x8e44ad][i % 4]), [x, 0.35, z], 0.12); }
  if (D.gazebo) { const g = new THREE.Group(); g.position.set(-6.5, 0, 6); root.add(g); for (const x of [-1, 1]) for (const z of [-1, 1]) mk(g, cyl, mat(0xf5f5f0), [x, 1, z], [0.08, 2, 0.08]); mk(g, cone, mat(0xb8322a), [0, 2.5, 0], [1.9, 1, 1.9], [0, Math.PI / 4, 0]); mk(g, cyl, mat(0xb08968), [0, 0.06, 0], [1.4, 0.1, 1.4]); }
  if (D.fountain) { COL.push({ t: 'c', x: 0, z: 11.3, r: 1.3 }); const g = new THREE.Group(); g.position.set(0, 0, 11.3); root.add(g); mk(g, cyl, mat(0xcfd8dc), [0, 0.2, 0], [1.3, 0.4, 1.3]); mk(g, cyl, mat(0x4fb3e8), [0, 0.42, 0], [1.1, 0.05, 1.1]); mk(g, cyl, mat(0xcfd8dc), [0, 0.8, 0], [0.18, 1, 0.18]); mk(g, sph, mat(0x8ad4f5), [0, 1.4, 0], 0.3); }
  if (D.windmill) { COL.push({ t: 'c', x: 9, z: -3, r: 1 }); const g = new THREE.Group(); g.position.set(9, 0, -3); root.add(g); mk(g, cone, mat(0xf5f5f0), [0, 1.8, 0], [1, 3.6, 1]); const bl = new THREE.Group(); bl.position.set(0, 3.2, 0.9); g.add(bl); for (let i = 0; i < 4; i++) { const a = new THREE.Group(); a.rotation.z = i * Math.PI / 2; bl.add(a); mk(a, box, mat(0xb08968), [0, 1, 0], [0.16, 2, 0.04]); } bl.userData.spin = 1; root.userData.wm = bl; }
  // bubbles for ready crops live on the plot objects
  plotObjs.forEach(o => { const b = bub('🧺'); b.position.set(0, 1.9, 0); b.visible = false; o.g.add(b); o.b = b; });
}
function syncPlots() {
  plotObjs.forEach((o, i) => {
    const p = S.plots[i]; if (!p) return;
    const stage = p.c ? Math.min(3, Math.floor(p.p / CROPS[p.c].sec * 3.999)) : -1, key = (p.c || '') + stage + (p.w ? 'w' : '');
    if (o.key !== key) {
      o.key = key; if (o.crop) { o.g.remove(o.crop); o.crop = null; }
      o.g.children[0].material = soilMat(p.w ? 1 : 0);
      if (p.c) { o.crop = cropMesh(p.c); o.crop.position.y = 0.2; o.crop.scale.setScalar(0.28 + stage * 0.24); o.g.add(o.crop); }
    }
    o.b.visible = !!(p.c && cropReady(p)); if (o.b.visible) o.b.position.y = 1.9 + Math.sin(performance.now() / 250 + i) * 0.12;
  });
}
function anim(dt) {
  const t = performance.now() / 1000;
  animM.forEach((m, i) => { const a = S.pen[i]; if (!a) return; const n = m.userData.pn; n.w -= dt;
    if (a.st === 'ready' || n.w > 0) { m.position.y = a.st === 'ready' ? Math.abs(Math.sin(t * 4 + i)) * 0.12 : 0; } else { if (Math.hypot(n.tx - m.position.x, n.tz - m.position.z) < 0.15) { n.tx = rnd(-2.7, 2.7); n.tz = rnd(-2.1, 2.1); n.w = rnd(1, 4); } const dx = n.tx - m.position.x, dz = n.tz - m.position.z, d = Math.hypot(dx, dz) || 1; m.position.x += dx / d * dt * 0.7; m.position.z += dz / d * dt * 0.7; m.rotation.y = Math.atan2(dx, dz); m.position.y = Math.abs(Math.sin(t * 8 + i)) * 0.05; }
    m.userData.b.visible = a.st === 'ready'; });
  fishM.forEach((m, i) => { const f = S.pond[i]; if (!f) return; const s = m.userData.fs; s.a += dt * s.sp; m.position.set(Math.cos(s.a) * s.r, 0.17, Math.sin(s.a) * s.r); m.rotation.y = -s.a + (s.sp > 0 ? -Math.PI / 2 : Math.PI / 2); const sc = 0.55 + 0.45 * Math.min(1, f.p / FISH[f.f].sec); m.userData.b.visible = fishReady(f); m.scale.setScalar(sc * 1.4); });
  if (root && root.userData.wm) root.userData.wm.rotation.z += dt * 1.2;
}
const KF = [   // hour, sky top, horizon, sun colour, sun power, ambient, sun height
  [0, 0x0a1430, 0x1c2a48, 0x8fa4e0, 0.35, 0.55, 30], [5, 0x0a1430, 0x1c2a48, 0x8fa4e0, 0.35, 0.55, 30], [6.5, 0x4a78b8, 0xf2a86a, 0xffb878, 1.1, 0.75, 12], [8.5, 0x3f86d6, 0xbfdcf0, 0xfff2dc, 1.8, 0.95, 42],
  [12, 0x3a82d8, 0xc4e0f4, 0xfff6e8, 2.0, 1.0, 70], [16, 0x3f86d6, 0xbfdcf0, 0xfff2dc, 1.8, 0.95, 42], [18, 0x4a5f9c, 0xf08a5a, 0xff9a5a, 1.15, 0.75, 12], [19.5, 0x16203f, 0x33406a, 0x8fa4e0, 0.4, 0.55, 25], [24, 0x0a1430, 0x1c2a48, 0x8fa4e0, 0.35, 0.55, 30],
];
const LT = { top: new THREE.Color(), hor: new THREE.Color(), sun: new THREE.Color(), tmp: new THREE.Color(), key: '' };
const hourNow = () => (9 + (S ? (S.t % DAY) / DAY * 24 : 0)) % 24;
function applyLight() {
  const h = hourNow(); let i = 0; while (i < KF.length - 2 && h >= KF[i + 1][0]) i++;
  const a = KF[i], b = KF[i + 1], k = Math.max(0, Math.min(1, (h - a[0]) / (b[0] - a[0])));
  LT.top.setHex(a[1]).lerp(LT.tmp.setHex(b[1]), k); LT.hor.setHex(a[2]).lerp(LT.tmp.setHex(b[2]), k); LT.sun.setHex(a[3]).lerp(LT.tmp.setHex(b[3]), k);
  const key = h.toFixed(2); if (key === LT.key) return; LT.key = key;
  skyU.top.value.copy(LT.top); skyU.hor.value.copy(LT.hor);
  scene.fog.color.copy(LT.hor).convertSRGBToLinear();
  sunL.color.copy(LT.sun).convertSRGBToLinear(); sunL.intensity = (a[4] + (b[4] - a[4]) * k) * 1.18; hemiL.intensity = (a[5] + (b[5] - a[5]) * k) * 0.62;   // V.1 look: strong sun, softer sky light = deeper, more contrasty colour
  hemiL.color.copy(LT.top).lerp(LT.hor, 0.5).convertSRGBToLinear(); hemiL.groundColor.setHex(0x4d6a35).convertSRGBToLinear();
  const el = (a[6] + (b[6] - a[6]) * k) * Math.PI / 180, az = (h - 6) / 14 * Math.PI;     // the sun rises in the east, sets in the west
  sunL.position.set(-Math.cos(az) * 26, Math.max(6, Math.sin(el) * 30), 12 + Math.sin(az) * 4);
}
let sunL, hemiL, skyU;
function resize() { const w = $('app').clientWidth, h = $('app').clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
function init3d() {
  const cv = $('c'); renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' }); renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.82;   // lower than before: 1.2 washed the colours out (V.1 renders at 1.0 with a stronger sun)
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xbfdcf0, 40, 105);
  camera = new THREE.PerspectiveCamera(55, 0.5, 0.5, 260);
  skyU = { top: { value: new THREE.Color(0x3f86d6) }, hor: { value: new THREE.Color(0xbfdcf0) } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(200, 24, 12), new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying float h; void main(){ h = normalize(position).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 hor; varying float h; void main(){ float k = smoothstep(-0.05, 0.55, h); gl_FragColor = vec4(mix(hor, top, k), 1.0); }' }));
  sky.renderOrder = -1; sky.frustumCulled = false; scene.add(sky); scene.userData.sky = sky;
  hemiL = new THREE.HemisphereLight(0xdcefff, 0x4d6a35, 0.65); scene.add(hemiL);
  sunL = new THREE.DirectionalLight(0xfff2dc, 1.1); sunL.castShadow = true; sunL.shadow.mapSize.set(1024, 1024); sunL.shadow.bias = -0.0004; sunL.shadow.normalBias = 0.03;
  const sc = sunL.shadow.camera; sc.left = -17; sc.right = 17; sc.top = 21; sc.bottom = -21; sc.near = 1; sc.far = 80; scene.add(sunL); scene.add(sunL.target);
  ray = new THREE.Raycaster(); build3d(); resize(); addEventListener('resize', resize); try { new ResizeObserver(resize).observe($('app')); } catch (e) { }
  bindInput();
}
// ---------------- the walking farmer (same view as V.1: third person, orbit by dragging, joystick + action button) ----------------
const P = { x: 0, z: 10.5, rot: Math.PI, ph: 0 }, CAM = { yaw: 0, pitch: 0.62, dist: 10.2 }, JOY = { x: 0, y: 0, id: null }, KEYS = {};
let playerG = null, legs = [], arms = [], curT = null;
function makePlayer() {
  const g = new THREE.Group(), skin = mat(0xe3b08a), shirt = mat(0xc8433a), pants = mat(0x3e6aa8), shoe = mat(0x5a3a22), hair = mat(0x2b1a10), straw = mat(0xe8c36a);
  mk(g, sph, shirt, [0, 1.15, 0], [0.3, 0.4, 0.2]); mk(g, sph, skin, [0, 1.7, 0], [0.2, 0.22, 0.2]); mk(g, sph, hair, [0, 1.76, -0.04], [0.21, 0.2, 0.2]);
  mk(g, cyl, straw, [0, 1.88, 0], [0.5, 0.03, 0.5]); mk(g, cyl, straw, [0, 1.96, 0], [0.22, 0.14, 0.22]); mk(g, cyl, mat(0xb8322a), [0, 1.92, 0], [0.225, 0.04, 0.225]);
  for (const s of [-1, 1]) {
    const a = new THREE.Group(); a.position.set(s * 0.36, 1.45, 0); g.add(a); mk(a, cyl, shirt, [0, -0.22, 0], [0.09, 0.45, 0.09]); mk(a, sph, skin, [0, -0.5, 0], 0.09); arms.push(a);
    const l = new THREE.Group(); l.position.set(s * 0.15, 0.85, 0); g.add(l); mk(l, cyl, pants, [0, -0.35, 0], [0.12, 0.7, 0.12]); mk(l, sph, shoe, [0, -0.78, 0.07], [0.13, 0.09, 0.2]); legs.push(l);
  }
  return g;
}
function resolve(x, z, r) {
  for (const c of COL) {
    if (c.t === 'c') { const dx = x - c.x, dz = z - c.z, d = Math.hypot(dx, dz), m = r + c.r; if (d < m && d > 1e-5) { x = c.x + dx / d * m; z = c.z + dz / d * m; } }
    else { const cx = Math.max(c.x - c.hw, Math.min(c.x + c.hw, x)), cz = Math.max(c.z - c.hd, Math.min(c.z + c.hd, z)), dx = x - cx, dz = z - cz, d = Math.hypot(dx, dz); if (d < r) { if (d > 1e-5) { x = cx + dx / d * r; z = cz + dz / d * r; } else { z = c.z + (z > c.z ? c.hd + r : -c.hd - r); } } }
  }
  return [Math.max(-11.5, Math.min(11.5, x)), Math.max(-8, Math.min(12.5, z))];
}
const V = { x: 0, z: 0 }, CF = { x: 0, z: 0, yaw: 0, pitch: 0.62, init: 0 };
function stepPlayer(dt) {
  let jx = JOY.x, jy = JOY.y;
  if (KEYS.a || KEYS.arrowleft) jx -= 1; if (KEYS.d || KEYS.arrowright) jx += 1; if (KEYS.w || KEYS.arrowup) jy += 1; if (KEYS.s || KEYS.arrowdown) jy -= 1;
  let m = Math.hypot(jx, jy); if (m > 1) { jx /= m; jy /= m; m = 1; }
  const idle = tab || $('title').hidden === false || m < 0.1;
  if (!idle) { const e = Math.pow((m - 0.1) / 0.9, 1.15); jx = jx / m * e; jy = jy / m * e; m = e; }
  // the wanted velocity follows the stick; the real velocity eases towards it (frame-rate independent), so starts and stops are soft
  const tx = idle ? 0 : (-Math.sin(CAM.yaw) * jy + Math.cos(CAM.yaw) * jx) * 4.6, tz = idle ? 0 : (-Math.cos(CAM.yaw) * jy - Math.sin(CAM.yaw) * jx) * 4.6, k = 1 - Math.exp(-dt * (idle ? 13 : 9));
  V.x += (tx - V.x) * k; V.z += (tz - V.z) * k;
  const sp = Math.hypot(V.x, V.z);
  if (sp > 0.03) {
    [P.x, P.z] = resolve(P.x + V.x * dt, P.z + V.z * dt, 0.42);
    let da = Math.atan2(V.x, V.z) - P.rot; da = Math.atan2(Math.sin(da), Math.cos(da)); P.rot += da * (1 - Math.exp(-dt * 11));
    P.ph += sp * dt * 2.3;
  } else { V.x = V.z = 0; }
  const amp = Math.min(1, sp / 3.2) * 0.75, sw = Math.sin(P.ph) * amp, kk = 1 - Math.exp(-dt * 14);
  legs[0].rotation.x += (sw - legs[0].rotation.x) * kk; legs[1].rotation.x += (-sw - legs[1].rotation.x) * kk; arms[0].rotation.x += (-sw * 0.8 - arms[0].rotation.x) * kk; arms[1].rotation.x += (sw * 0.8 - arms[1].rotation.x) * kk;
  playerG.position.y = Math.abs(Math.sin(P.ph)) * 0.04 * Math.min(1, sp / 3);
}
function followCam(dt) {
  if (!CF.init) { CF.x = P.x; CF.z = P.z; CF.yaw = CAM.yaw; CF.pitch = CAM.pitch; CF.init = 1; }
  const kp = 1 - Math.exp(-dt * 10), kc = 1 - Math.exp(-dt * 14);
  CF.x += (P.x - CF.x) * kp; CF.z += (P.z - CF.z) * kp; CF.yaw += (CAM.yaw - CF.yaw) * kc; CF.pitch += (CAM.pitch - CF.pitch) * kc;
  playerG.position.x = P.x; playerG.position.z = P.z; playerG.rotation.y = P.rot;
  const cp = Math.cos(CF.pitch);
  camera.position.set(CF.x + Math.sin(CF.yaw) * cp * CAM.dist, 1.3 + Math.sin(CF.pitch) * CAM.dist, CF.z + Math.cos(CF.yaw) * cp * CAM.dist); camera.lookAt(CF.x, 1.1, CF.z);
  sunL.target.position.set(CF.x * 0.5, 0, CF.z * 0.5);
}
const plotPos = i => ({ x: ((i % 4) - 1.5) * 2.2, z: 7.5 - Math.floor(i / 4) * 2.2 });
function water(i) { const p = S.plots[i]; if (p.c && !p.w) { p.w = 1; sfx(420); toast('💧 รดน้ำแล้ว โตเร็วขึ้น 1.5 เท่า'); } }
function targets() {
  const c = [], add = (d, icon, label, fn) => c.push({ d, icon, label, fn }), at = (x, z) => Math.hypot(P.x - x, P.z - z);
  S.plots.forEach((p, i) => {
    const o = plotPos(i), d = at(o.x, o.z); if (d > 1.5) return;
    if (!p.c) add(d, '🌱', `ปลูก${CROPS[S.sel].n} ${CROPS[S.sel].seed}฿`, () => plant(i));
    else if (cropReady(p)) add(d, '🧺', `เก็บ${CROPS[p.c].n}`, () => harvestPlot(i));
    else if (!p.w) add(d, '💧', `รดน้ำ ${CROPS[p.c].n}`, () => water(i));
    else add(d + 0.8, CROPS[p.c].i, `${CROPS[p.c].n} กำลังโต`, () => { const left = Math.ceil((CROPS[p.c].sec - p.p) / 1.5); toast(`${CROPS[p.c].i} อีก ${left >= 60 ? Math.ceil(left / 60) + ' นาที' : left + ' วิ'}`); });
  });
  if (P.x > -8.9 && P.x < -0.3 && P.z > -7.4 && P.z < -0.9) {
    const rd = S.pen.filter(a => a.st === 'ready').length;
    if (rd) add(0.4, '🧺', `เก็บผลผลิตสัตว์ (${rd})`, () => A.collall()); else add(1.2, '🐾', 'ดูคอกสัตว์', () => openTab('pen'));
  }
  if (at(4.3, -4.2) < 5) { const rd = S.pond.filter(fishReady).length; if (rd) add(0.4, '🎣', `จับปลา (${rd})`, () => { A.fishall(); build3d(); }); else add(1.2, '🐟', 'ดูบ่อปลา', () => openTab('pond')); }
  if (at(0, -9) < 3.2) add(at(0, -9), '🏪', 'ตลาด', () => openTab('market'));
  if (at(-6, -9.3) < 3.2) add(at(-6, -9.3), '🏚️', 'ยุ้งฉาง', () => openTab('barn'));
  if (S.u.work && at(6, -9.3) < 3.2) add(at(6, -9.3), '🏭', 'โรงงานแปรรูป', () => openTab('work'));
  return c.sort((a, b) => a.d - b.d)[0] || null;
}
function doAct() { if (curT) { curT.fn(); render(); hud(); } }
function bindInput() {
  const joy = $('joy'), knob = $('knob');
  const jset = e => { const r = joy.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; let dx = e.clientX - cx, dy = e.clientY - cy; const m = Math.hypot(dx, dy), R = 44; if (m > R) { dx = dx / m * R; dy = dy / m * R; } JOY.x = dx / R; JOY.y = -dy / R; knob.style.transform = `translate(${dx}px,${dy}px)`; };
  joy.addEventListener('pointerdown', e => { JOY.id = e.pointerId; joy.setPointerCapture(e.pointerId); jset(e); });
  joy.addEventListener('pointermove', e => { if (e.pointerId === JOY.id) jset(e); });
  const jend = e => { if (e.pointerId === JOY.id) { JOY.id = null; JOY.x = JOY.y = 0; knob.style.transform = ''; } };
  joy.addEventListener('pointerup', jend); joy.addEventListener('pointercancel', jend);
  const cv = $('c'); let drag = null;
  cv.addEventListener('pointerdown', e => { drag = { id: e.pointerId, x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => { if (!drag || e.pointerId !== drag.id) return; CAM.yaw -= (e.clientX - drag.x) * 0.008; CAM.pitch = Math.max(0.3, Math.min(1.15, CAM.pitch + (e.clientY - drag.y) * 0.005)); drag.x = e.clientX; drag.y = e.clientY; });
  const dend = e => { if (drag && e.pointerId === drag.id) drag = null; }; cv.addEventListener('pointerup', dend); cv.addEventListener('pointercancel', dend);
  $('act').addEventListener('click', doAct);
  addEventListener('keydown', e => { const k = e.key.toLowerCase(); if (k === 'e' || k === ' ') { if (!tab && $('title').hidden) doAct(); } else KEYS[k] = 1; });
  addEventListener('keyup', e => { delete KEYS[e.key.toLowerCase()]; });
}

// ---------------- title: two save slots ----------------
const ago = t => { const m = Math.max(0, Math.round((Date.now() - t) / 60000)); return m < 1 ? 'เมื่อสักครู่' : m < 60 ? `${m} นาทีที่แล้ว` : m < 1440 ? `${Math.round(m / 60)} ชม.ที่แล้ว` : `${Math.round(m / 1440)} วันที่แล้ว`; };
async function renderTitle() {
  $('slots').innerHTML = '<p style="text-align:center;color:var(--ink-dim)">กำลังโหลดเซฟ…</p>';
  await ping(); setSrv();
  const out = [];
  for (const n of [1, 2]) {
    const d = await readSlot(n);
    out.push(d ? `<div class="slot panel"><h4>💾 ช่อง ${n} · ${d.name || 'ชาวไร่'}</h4><p>Lv.${d.lvl} · ${fmt(d.money)} ฿ · วันที่ ${Math.floor(d.t / DAY) + 1} · เล่นล่าสุด ${ago(d.last)}</p><div class="row"><button class="btn big" data-a="play" data-v="${n}">▶ เล่นต่อ</button><button class="btn ghost" data-a="copycode" data-v="${n}">📋</button><button class="btn ghost" data-a="del" data-v="${n}">ลบ</button></div></div>`
      : `<div class="slot panel"><h4>💾 ช่อง ${n} · ว่าง</h4><p>เริ่มฟาร์มใหม่ในช่องนี้</p><input id="nm${n}" maxlength="14" placeholder="ชื่อของคุณ เช่น สมใจ"><div class="row"><button class="btn big" data-a="newgame" data-v="${n}">🌱 เริ่มฟาร์มใหม่</button><button class="btn ghost" data-a="importcode" data-v="${n}">📥 นำเข้ารหัสเซฟ</button></div></div>`);
  }
  $('slots').innerHTML = out.join('');
}
function showTitle() { if (S) save(); S = null; slot = 0; $('title').hidden = false; $('tip').hidden = true; renderTitle(); }
let loopOn = false, lastT = 0, acc = 0, saveT = 0;
async function startGame(n, name) {
  let data = typeof name === 'string' ? null : await readSlot(n);
  S = Object.assign(fresh(typeof name === 'string' ? name : ''), data || {}); slot = n;
  // offline progress: the farm kept growing while the game was closed (max 12 hours)
  const off = Math.min(12 * 3600, Math.max(0, (Date.now() - S.last) / 1000)); if (data && off > 5) { const before = readyCount(); update(off); if (readyCount() > before) setTimeout(() => toast(`ระหว่างที่ไม่อยู่ มีผลผลิตพร้อมเก็บ ${readyCount()} อย่าง`), 900); }
  P.x = S.px || 0; P.z = S.pz || 10.5; P.rot = Math.PI; CAM.yaw = 0; CF.init = 0; V.x = V.z = 0; LT.key = '';
  if (!renderer) { init3d(); playerG = makePlayer(); scene.add(playerG); } else build3d();
  $('title').hidden = true; hud(); save(); if (!S.tip) $('tip').hidden = false;
  if (!loopOn) { loopOn = true; lastT = performance.now(); requestAnimationFrame(loop); }
}
function loop(now) {
  const dt = Math.min(0.25, (now - lastT) / 1000); lastT = now;
  if (S) {
    const dm = Math.min(dt, 0.05); update(dt); syncPlots(); anim(dm); stepPlayer(dm); followCam(dm); applyLight();
    const t = tab || !$('tip').hidden ? null : targets(); curT = t;
    const lbl = $('actlbl'), b = $('act'), key = t ? t.icon + t.label : '';
    if (loop.k !== key) { loop.k = key; b.textContent = t ? t.icon : '✋'; b.classList.toggle('idle', !t); lbl.hidden = !t; lbl.textContent = t ? t.label : ''; }
    renderer.render(scene, camera);
    acc += dt; if (acc > 0.5) { acc = 0; hud(); if (tab && (tab === 'pen' || tab === 'pond' || tab === 'work' || tab === 'farm')) render(); } saveT += dt; if (saveT > 3) { saveT = 0; save(); }
  }
  requestAnimationFrame(loop);
}
document.addEventListener('visibilitychange', () => { if (!S) return; if (document.hidden) save(); else { const off = Math.min(12 * 3600, (Date.now() - S.last) / 1000); if (off > 3) update(off); lastT = performance.now(); } });
addEventListener('pagehide', () => { if (S) save(); }); addEventListener('beforeunload', () => { if (S) save(); });
showTitle();
window.Farm2 = { get S() { return S; }, update, build3d, openTab, plant, price, P, CAM, startGame, get online() { return online; } };
