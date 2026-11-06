// home2.js (v32): a small "go home" button (🏠). The farm is about 20 times bigger now, so walking back from a far bed or pit is slow and easy to get lost in.
// One tap puts the farmer on the spot in front of the house door (the same spot a save made indoors uses) and snaps the camera there. Desktop key: B.
// Nothing is saved by this file and no save field is added or read, so old saves, new saves, other browsers and other devices all behave the same.
(function () {
  const btn = document.getElementById('homebtn'); if (!btn) return;
  const homeSpot = () => { const x = (typeof HOUSE2 !== 'undefined' && HOUSE2.ex != null) ? HOUSE2.ex : -7.4, z = (typeof HOUSE2 !== 'undefined' && HOUSE2.ez != null) ? HOUSE2.ez : 12.3; return { x, z }; };
  const busy = () => { try { return !!(typeof PLC !== 'undefined' && (PLC || (typeof PICK !== 'undefined' && PICK))); } catch (e) { return false; } };
  function goHome() {
    try {
      if (!S || !$('title').hidden || HOUSE2.on) return;
      if (busy()) { toast('วางแปลงให้เสร็จก่อนค่อยกลับบ้านนะ'); return; }
      const h = homeSpot(); let x = h.x, z = h.z; try { [x, z] = resolve(x, z, 0.42); } catch (e) { }
      P.x = x; P.z = z; P.rot = Math.PI; CAM.yaw = 0; CF.init = 0; V.x = V.z = 0; try { JOY.x = JOY.y = 0; } catch (e) { }
      toast('กลับถึงบ้านแล้ว 🏠');
    } catch (e) { console.warn('home2', e); }
  }
  A.gohome = goHome;
  // shown while playing outdoors only (not on the title screen, not inside the house, not while placing a bed)
  function upd() { try { btn.hidden = !(S && $('title').hidden && !HOUSE2.on && !busy()); } catch (e) { btn.hidden = true; } }
  setInterval(upd, 400); upd();
  document.addEventListener('keydown', e => { if (e.ctrlKey || e.metaKey || e.altKey) return; if (/^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || '')) return; if ((e.key || '').toLowerCase() === 'b' && !btn.hidden && document.getElementById('sheet').hidden) { e.preventDefault(); goHome(); render(); hud(); } });
})();
