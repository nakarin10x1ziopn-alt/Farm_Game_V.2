// house.js (v29): walk INTO the house, like the V.1 farm. A furnished room with a bed, kitchen and fridge, dining table, wardrobe, TV, clock and a window; the things you buy for the
// house (soft bed, storage cabinet, coffee corner, flowers) appear inside as well as outside. Nothing here is saved: the room is rebuilt from S.home every time, and a save made indoors
// stores the spot in front of the door, so old and new saves, other browsers and other devices all behave the same.
const HOUSE2 = { on: false, cx: 1500, cz: 1500, ex: -7.4, ez: 12.3, g: null, boxes: [], wins: [], light: null, saved: null, fr: -1 };
const House2 = (() => {
  const OX = 1500, OZ = 1500, RX = 3.8, RZ = 2.8, WALL = 1.3, DOORZ = 0.5;       // the room is 7.6 x 5.6 m, its door is in the east wall
  const W = (x, z) => [OX + x, OZ + z];
  function clear() {
    if (HOUSE2.g) { scene.remove(HOUSE2.g); HOUSE2.g.traverse(o => { if (o.isMesh && o.geometry && o.geometry !== box && o.geometry !== sph && o.geometry !== cyl) o.geometry.dispose(); }); HOUSE2.g = null; }
    if (HOUSE2.light) { scene.remove(HOUSE2.light); HOUSE2.light = null; }
    NIGHT.wins = NIGHT.wins.filter(m => !HOUSE2.wins.includes(m)); HOUSE2.wins = []; HOUSE2.boxes = [];
  }
  function build() {
    clear(); const H = S.home || {}, g = new THREE.Group(); g.position.set(OX, 0, OZ); scene.add(g); HOUSE2.g = g;
    const wood = mat(0x8a5a2f), wood2 = mat(0x6b4423), wall = mat(0xf2e4c4), floor = mat(0xc9a06a), white = mat(0xf5f1e6), dark = mat(0x2f3338);
    const solid = (x, z, hw, hd) => HOUSE2.boxes.push({ x: OX + x, z: OZ + z, hw, hd });
    // the room stands on a lawn
    mk(g, box, mat(0x6f9a4e), [0, -0.06, 0], [90, 0.1, 90]).castShadow = false;
    mk(g, box, floor, [0, 0.02, 0], [RX * 2, 0.08, RZ * 2]);
    for (let i = -6; i <= 6; i++) mk(g, box, mat(0xb98f58), [i * 0.58, 0.07, 0], [0.02, 0.01, RZ * 2]).castShadow = false;
    // low walls all round (the camera looks down into the room); a gap for the door in the east wall
    const wl = (x, z, w, d) => mk(g, box, wall, [x, WALL / 2, z], [w, WALL, d]);
    wl(0, -RZ - 0.09, RX * 2 + 0.36, 0.18); wl(0, RZ + 0.09, RX * 2 + 0.36, 0.18); wl(-RX - 0.09, 0, 0.18, RZ * 2);
    wl(RX + 0.09, (-RZ + (DOORZ - 0.7)) / 2, 0.18, (DOORZ - 0.7) + RZ); wl(RX + 0.09, ((DOORZ + 0.7) + RZ) / 2, 0.18, RZ - (DOORZ + 0.7));
    for (const z of [-RZ - 0.09, RZ + 0.09]) mk(g, box, wood2, [0, WALL + 0.03, z], [RX * 2 + 0.4, 0.06, 0.24]); mk(g, box, wood2, [-RX - 0.09, WALL + 0.03, 0], [0.24, 0.06, RZ * 2]);
    mk(g, box, wood, [RX + 0.09, 0.9, DOORZ - 0.78], [0.22, 1.8, 0.08]); mk(g, box, wood, [RX + 0.09, 0.9, DOORZ + 0.78], [0.22, 1.8, 0.08]); mk(g, box, wood, [RX + 0.09, 1.82, DOORZ], [0.22, 0.08, 1.64]);   // door frame
    mk(g, box, mat(0xd9c9a0), [RX - 0.45, 0.075, DOORZ], [0.9, 0.02, 1.3]).castShadow = false;                                                    // door mat
    // rug
    mk(g, box, mat(0xc0504d), [-0.4, 0.075, 0.3], [3.2, 0.02, 2.2]).castShadow = false; mk(g, box, mat(0xe8c7a0), [-0.4, 0.09, 0.3], [2.8, 0.01, 1.8]).castShadow = false;
    // bed (head against the west wall). A bought soft bed is thicker, with a quilt and two pillows
    { const bx = -RX + 1.15, bz = -1.5; mk(g, box, wood2, [bx, 0.2, bz], [2.2, 0.3, 1.5]); mk(g, box, wood2, [-RX + 0.08, 0.6, bz], [0.12, 0.9, 1.5]);
      const mt = H.bed ? 0.3 : 0.14; mk(g, box, H.bed ? mat(0xf4f0e6) : mat(0xb9b4a8), [bx + 0.02, 0.35 + mt / 2, bz], [2.05, mt, 1.38]);
      mk(g, box, H.bed ? mat(0x5b8fd4) : mat(0x9aa39a), [bx + 0.5, 0.35 + mt + 0.04, bz], [1.15, 0.08, 1.4]);
      for (const dz of H.bed ? [-0.38, 0.38] : [0]) mk(g, box, white, [-RX + 0.45, 0.35 + mt + 0.06, bz + dz], [0.4, 0.12, 0.6]);
      solid(bx, bz, 1.1, 0.75); }
    // bedside table and lamp
    { mk(g, box, wood, [-RX + 0.3, 0.3, -0.2], [0.5, 0.6, 0.5]); const bulb = new THREE.MeshStandardMaterial({ color: lin(0xfff0c8), emissive: lin(0xffc860), emissiveIntensity: 0.9 }); mk(g, cyl, white, [-RX + 0.3, 0.64, -0.2], [0.06, 0.08, 0.06]); mk(g, sph, bulb, [-RX + 0.3, 0.82, -0.2], 0.14); solid(-RX + 0.3, -0.2, 0.28, 0.28); }
    // wardrobe
    { const x = -0.9, z = -RZ + 0.36; mk(g, box, wood, [x, 0.95, z], [1.5, 1.9, 0.62]); mk(g, box, wood2, [x - 0.37, 0.95, z + 0.32], [0.7, 1.7, 0.03]); mk(g, box, wood2, [x + 0.37, 0.95, z + 0.32], [0.7, 1.7, 0.03]); for (const s of [-0.06, 0.06]) mk(g, sph, mat(0xf2c94c), [x + s, 0.95, z + 0.35], 0.03); solid(x, z, 0.78, 0.33); }
    // kitchen: counter with a sink, fridge, a hob
    { const x = 1.6, z = -RZ + 0.33; mk(g, box, white, [x, 0.45, z], [2.2, 0.9, 0.6]); mk(g, box, mat(0x7a8a96), [x, 0.92, z], [2.24, 0.06, 0.64]); mk(g, box, mat(0x546e7a), [x - 0.5, 0.95, z], [0.6, 0.03, 0.4]); mk(g, cyl, mat(0xb0bec5), [x - 0.5, 1.12, z - 0.18], [0.03, 0.3, 0.03]);
      for (const hx of [0.4, 0.85]) mk(g, cyl, dark, [x + hx, 0.96, z], [0.17, 0.02, 0.17]); solid(x, z, 1.12, 0.33);
      const fx = 3.2, fz = -RZ + 0.4; mk(g, box, mat(0xe4eaee), [fx, 0.9, fz], [0.8, 1.8, 0.7]); mk(g, box, mat(0xcfd8dc), [fx, 1.35, fz + 0.36], [0.76, 0.02, 0.03]); mk(g, box, mat(0x90a4ae), [fx - 0.3, 1.15, fz + 0.38], [0.04, 0.5, 0.04]); mk(g, box, mat(0x90a4ae), [fx - 0.3, 0.6, fz + 0.38], [0.04, 0.4, 0.04]); solid(fx, fz, 0.42, 0.37); }
    // dining table with two chairs (and the flowers you bought)
    { const x = 1.2, z = 0.9; mk(g, box, wood, [x, 0.72, z], [1.4, 0.07, 0.85]); for (const [dx, dz] of [[-0.6, -0.34], [0.6, -0.34], [-0.6, 0.34], [0.6, 0.34]]) mk(g, box, wood2, [x + dx, 0.36, z + dz], [0.07, 0.72, 0.07]);
      for (const dx of [-0.4, 0.4]) { mk(g, box, wood2, [x + dx, 0.42, z + 0.75], [0.42, 0.06, 0.42]); mk(g, box, wood2, [x + dx, 0.7, z + 1.0], [0.42, 0.55, 0.05]); }
      mk(g, cyl, white, [x - 0.3, 0.8, z], [0.14, 0.05, 0.14]); mk(g, cyl, white, [x + 0.35, 0.8, z + 0.1], [0.14, 0.05, 0.14]);
      if (H.vase) { mk(g, cyl, mat(0xb0d4e8), [x, 0.85, z - 0.1], [0.08, 0.2, 0.08]); for (let i = 0; i < 6; i++) mk(g, sph, mat([0xf08aa0, 0xffcf3f, 0xf5f5f0, 0xb69be0, 0xff8a65, 0xf08aa0][i]), [x - 0.1 + (i % 3) * 0.1, 1.02 + (i % 2) * 0.04, z - 0.1 + (i > 2 ? 0.07 : -0.03)], 0.06); }
      solid(x, z + 0.2, 0.75, 0.6); }
    // TV on a low stand (south wall)
    { const x = -1.8, z = RZ - 0.35; mk(g, box, wood, [x, 0.25, z], [1.5, 0.5, 0.5]); mk(g, box, dark, [x, 1.0, z - 0.02], [1.2, 0.7, 0.06]); mk(g, box, mat(0x2b4a66), [x, 1.0, z - 0.06], [1.12, 0.62, 0.02]); mk(g, box, dark, [x, 0.6, z - 0.02], [0.2, 0.12, 0.1]); solid(x, z, 0.78, 0.27); }
    // storage cabinet (if bought) and the coffee corner (if bought)
    if (H.store) { const x = RX - 0.35, z = -1.1; mk(g, box, wood, [x, 0.65, z], [0.6, 1.3, 0.95]); mk(g, box, mat(0xa57a4c), [x - 0.31, 0.95, z], [0.03, 0.5, 0.8]); mk(g, box, mat(0xa57a4c), [x - 0.31, 0.4, z], [0.03, 0.5, 0.8]); solid(x, z, 0.33, 0.5); }
    if (H.cafe) { const x = 2.7, z = 2.0; mk(g, cyl, wood, [x, 0.5, z], [0.05, 1.0, 0.05]); mk(g, cyl, white, [x, 1.0, z], [0.38, 0.05, 0.38]); mk(g, cyl, mat(0x5d4037), [x - 0.1, 1.08, z], [0.07, 0.1, 0.07]); mk(g, cyl, mat(0x5d4037), [x + 0.1, 1.08, z + 0.05], [0.07, 0.1, 0.07]); for (const dx of [-0.6]) { mk(g, cyl, wood, [x + dx, 0.28, z], [0.04, 0.56, 0.04]); mk(g, cyl, mat(0xb08968), [x + dx, 0.56, z], [0.2, 0.05, 0.2]); } solid(x, z, 0.4, 0.4); }
    // window and clock on the north wall, picture on the west wall
    { const wm = new THREE.MeshStandardMaterial({ color: lin(0x9fd2f2), emissive: lin(0xffc860), emissiveIntensity: 0 }); NIGHT.wins.push(wm); HOUSE2.wins.push(wm);
      mk(g, box, white, [-2.35, WALL - 0.05, -RZ + 0.05], [1.0, 0.1, 0.06]); mk(g, box, wm, [-2.35, WALL - 0.05, -RZ + 0.09], [0.86, 0.06, 0.03]);
      mk(g, cyl, white, [0.7, WALL - 0.08, -RZ + 0.07], [0.17, 0.04, 0.17], [Math.PI / 2, 0, 0]); mk(g, box, dark, [0.7, WALL - 0.08, -RZ + 0.1], [0.02, 0.12, 0.01]); mk(g, box, dark, [0.74, WALL - 0.08, -RZ + 0.1], [0.1, 0.02, 0.01]); }
    const bl = bub('🏠'); bl.position.set(0, 2.6, 0); g.add(bl);
    // warm light for the evenings
    const pl = new THREE.PointLight(0xffd9a0, 1.3, 16, 1.6); pl.position.set(OX - 0.5, 2.6, OZ); scene.add(pl); HOUSE2.light = pl;
  }
  // ---- walking inside ----
  function resolveIn(x, z, r) {
    x = Math.max(OX - RX + r, Math.min(OX + RX - r, x)); z = Math.max(OZ - RZ + r, Math.min(OZ + RZ - r, z));
    for (const c of HOUSE2.boxes) {
      const cx = Math.max(c.x - c.hw, Math.min(c.x + c.hw, x)), cz = Math.max(c.z - c.hd, Math.min(c.z + c.hd, z)), dx = x - cx, dz = z - cz, d = Math.hypot(dx, dz);
      if (d < r) { if (d > 1e-5) { x = cx + dx / d * r; z = cz + dz / d * r; } else { const px = (c.hw + r) - Math.abs(x - c.x), pz = (c.hd + r) - Math.abs(z - c.z); if (px < pz) x = c.x + Math.sign(x - c.x || 1) * (c.hw + r); else z = c.z + Math.sign(z - c.z || 1) * (c.hd + r); } }
    }
    return [x, z];
  }
  function enter() {
    if (HOUSE2.on) return; build(); HOUSE2.on = true; closeSheet();
    HOUSE2.saved = { dist: CAM.dist, pitch: CAM.pitch, yaw: CAM.yaw };
    const [px, pz] = W(RX - 1.3, DOORZ); P.x = px; P.z = pz; P.rot = -Math.PI / 2; V.x = V.z = 0; CAM.yaw = Math.PI / 2; CAM.dist = 13.5; CAM.pitch = 1.05; CF.init = 0;
    sfx(520); toast('🏠 เข้าบ้านแล้ว เดินไปที่เตียง ตู้เย็น หรือโต๊ะได้เลย');
  }
  function leave() {
    if (!HOUSE2.on) return; HOUSE2.on = false; closeSheet();
    P.x = HOUSE2.ex; P.z = HOUSE2.ez; P.rot = Math.PI / 2; V.x = V.z = 0; const s = HOUSE2.saved; if (s) { CAM.dist = s.dist; CAM.pitch = s.pitch; CAM.yaw = s.yaw; } CF.init = 0;
    sfx(520); queueSave();
  }
  function targets() {
    const c = [], at = (x, z) => Math.hypot(P.x - (OX + x), P.z - (OZ + z)), add = (d, icon, label, fn) => c.push({ d, icon, label, fn });
    const dDoor = at(RX - 0.4, DOORZ); if (dDoor < 1.7) add(dDoor, '🚪', 'ออกจากบ้าน', leave);
    const dBed = at(-RX + 1.7, -1.5); if (dBed < 2.3) add(dBed, '🛏️', S.en < TIRED ? 'เตียง (เหนื่อยแล้ว พักเถอะ)' : 'เตียง (งีบ / นอนข้ามคืน)', () => openTab('home'));
    const dFr = at(3.2, -RZ + 1.1); if (dFr < 1.9) add(dFr, '🧊', 'ตู้เย็น (ดื่มน้ำเย็น)', () => {
      const key = (S.dayN || 0) * 24 + Math.floor(hourNow());
      if (S.en >= 98) { toast('ยังสดชื่นอยู่ ไว้ค่อยดื่มนะ'); return; } if (HOUSE2.fr === key) { toast('เพิ่งดื่มไป รออีกสักชั่วโมงในเกมนะ'); return; }
      HOUSE2.fr = key; S.en = Math.min(100, S.en + 6); sfx(660); toast('🥤 ดื่มน้ำเย็น พลังงาน +6');
    });
    const dKi = at(1.6, -RZ + 1.0); if (dKi < 1.8 && S.home && S.home.cafe) add(dKi, '☕', 'ชงเครื่องดื่ม (5 ฿ · +25 พลังงาน)', () => A.sip());
    else if (dKi < 1.8) add(dKi + 0.4, '🍳', 'ครัว (ซื้อมุมกาแฟได้ที่โต๊ะ)', () => toast('ซื้อ "มุมกาแฟ" ได้ที่โต๊ะอาหาร/เมนูบ้าน แล้วจะชงเครื่องดื่มที่นี่ได้'));
    const dTb = at(1.2, 0.9); if (dTb < 1.9) add(dTb + 0.3, '🪑', 'โต๊ะอาหาร (ของแต่งบ้าน)', () => openTab('home'));
    const dTv = at(-1.8, RZ - 1.1); if (dTv < 1.9) add(dTv, '📺', 'ดูทีวี (ข่าวราคาตลาด)', () => openTab('market'));
    if (S.home && S.home.store) { const dSt = at(RX - 1.0, -1.1); if (dSt < 1.7) add(dSt, '🗄️', 'ตู้เก็บของ (ยุ้งฉาง)', () => openTab('barn')); }
    const dWd = at(-0.9, -RZ + 1.1); if (dWd < 1.7) add(dWd, '👔', 'ตู้เสื้อผ้า', () => toast('ตู้เสื้อผ้า ชุดทำงานพร้อมใช้ 👒'));
    return c.sort((a, b) => a.d - b.d)[0] || null;
  }
  return { enter, leave, build, targets, resolveIn, rebuildIfIn: () => { if (HOUSE2.on) build(); } };
})();
